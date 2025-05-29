// Import Firebase modules
// Importieren Sie die benötigten Funktionen aus den SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Your web app's Firebase configuration - DIRECTLY EMBEDDED HERE
// Die Firebase-Konfiguration Ihrer Web-App – HIER DIREKT EINGEBETTET
const firebaseConfig = {
    apiKey: "AIzaSyADwTnw2J5C9BpWPJsDhsHBHbkVckm6HjU",
    authDomain: "dndwiki-fb2a5.firebaseapp.com",
    projectId: "dndwiki-fb2a5",
    storageBucket: "dndwiki-fb2a5.firebasestorage.app",
    messagingSenderId: "978113723224",
    appId: "1:978113723224:web:c87a0d32698207f87e432d"
};

// Use projectId for Firestore paths as it's a clean string without special characters
// Verwenden Sie die projectId für Firestore-Pfade, da es sich um einen sauberen String ohne Sonderzeichen handelt
const projectId = firebaseConfig.projectId; // Dies wird im Pfad verwendet, um es pro Projekt eindeutig zu machen

// The __initial_auth_token is still expected from the Canvas environment for authentication
// Der __initial_auth_token wird weiterhin aus der Canvas-Umgebung für die Authentifizierung erwartet
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let currentUserId = null; // Wir authentifizieren uns immer noch zu Protokollierungszwecken, aber der Datenpfad ist jetzt öffentlich

// Define the sections for the wiki
// Definieren Sie die Abschnitte für das Wiki
const wikiSections = [
    { id: 'introduction', title: 'Campaign Introduction' },
    { id: 'locations', title: 'Locations' },
    { id: 'npcs', title: 'NPCs' },
    { id: 'factions', title: 'Factions' },
    { id: 'lore', title: 'Lore' },
    { id: 'quests', title: 'Quests' },
    { id: 'house_rules', title: 'House Rules' }
];

// Object to hold unsubscribe functions for each section's snapshot listener
// Objekt zum Speichern von Abmeldefunktionen für den Snapshot-Listener jedes Abschnitts
const sectionUnsubscribeListeners = {};

// Function to display a temporary message box
// Funktion zum Anzeigen einer temporären Nachrichtenbox
function showMessageBox(message, type = 'success') {
    const msgBox = document.getElementById('message-box');
    msgBox.textContent = message;
    msgBox.className = 'message-box show'; // Klassen zurücksetzen und 'show' hinzufügen
    if (type === 'error') {
        msgBox.style.backgroundColor = '#f44336'; // Rot für Fehler
    } else {
        msgBox.style.backgroundColor = '#4CAF50'; // Grün für Erfolg
    }

    setTimeout(() => {
        msgBox.classList.remove('show');
    }, 3000); // Nach 3 Sekunden ausblenden
}

// Initialize Firebase and set up authentication
// Firebase initialisieren und Authentifizierung einrichten
window.onload = async function () {
    try {
        // Initialize Firebase with the directly embedded config
        // Firebase mit der direkt eingebetteten Konfiguration initialisieren
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Set the current year in the footer
        // Das aktuelle Jahr in der Fußzeile festlegen
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Listen for authentication state changes (still useful for logging/analytics)
        // Auf Authentifizierungsstatusänderungen hören (immer noch nützlich für Protokollierung/Analysen)
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                // Benutzer ist angemeldet
                currentUserId = user.uid;
                console.log("User signed in successfully. User ID:", currentUserId);
                // Entfernt: document.getElementById('user-id-display').textContent = `User ID: ${currentUserId}`;
            } else {
                // User is signed out
                // Benutzer ist abgemeldet
                console.log("User is currently signed out. Attempting anonymous sign-in or custom token sign-in...");
                // Entfernt: document.getElementById('user-id-display').textContent = `User ID: Not authenticated`;
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        console.log("Attempted sign-in with custom token.");
                    } else {
                        await signInAnonymously(auth); // Versuchen Sie immer noch die anonyme Anmeldung, auch wenn sie für den Zugriff nicht unbedingt erforderlich ist
                        console.log("Attempted anonymous sign-in.");
                    }
                } catch (error) {
                    console.error("Authentication failed during sign-in attempt:", error);
                    showMessageBox("Authentication failed. Please check console for details.", "error");
                }
            }
            // Load content for all sections regardless of auth status, since rules will be public
            // Laden Sie Inhalte für alle Abschnitte unabhängig vom Authentifizierungsstatus, da die Regeln öffentlich sind
            loadAllSectionsContent();
        });

        // Add event listeners for all save buttons
        // Ereignis-Listener für alle Speicher-Buttons hinzufügen
        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const sectionId = event.target.dataset.section;
                console.log(`Save button clicked for section: ${sectionId}`);
                saveSectionContent(sectionId);
            });
        });

        // Add event listeners for all edit buttons
        // Ereignis-Listener für alle Bearbeiten-Buttons hinzufügen
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const sectionId = event.target.dataset.section;
                toggleEditorVisibility(sectionId);
            });
        });

    } catch (error) {
        console.error("Error initializing Firebase application:", error);
        showMessageBox("Failed to initialize the application. Check console for details.", "error");
    }
};

// Function to load content for all wiki sections
// Funktion zum Laden von Inhalten für alle Wiki-Abschnitte
function loadAllSectionsContent() {
    console.log("Loading content for all wiki sections...");
    wikiSections.forEach(section => {
        loadSectionContent(section.id);
    });
}

// Function to save content for a specific section to Firestore
// Funktion zum Speichern von Inhalten für einen bestimmten Abschnitt in Firestore
async function saveSectionContent(sectionId) {
    console.log(`Attempting to save content for section: ${sectionId}`);
    if (currentUserId) {
        console.log(`Authenticated as User ID: ${currentUserId}`);
    } else {
        console.log("Saving as unauthenticated user.");
    }

    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`).value;
    // NEW PATH: artifacts/{projectId}/publicWikiContent/{sectionId}
    // NEUER PFAD: artifacts/{projectId}/publicWikiContent/{sectionId}
    const contentRef = doc(db, `artifacts/${projectId}/publicWikiContent`, sectionId);

    try {
        await setDoc(contentRef, { content: contentInput });
        console.log(`Content for ${sectionId} saved successfully to publicWikiContent!`);
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Content for ${sectionTitle} saved!`);
        toggleEditorVisibility(sectionId); // Editor nach dem Speichern ausblenden
    } catch (error) {
        console.error(`Error saving content for ${sectionId}:`, error);
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Failed to save content for ${sectionTitle}. Please try again.`, "error");
    }
}

// Function to load content for a specific section from Firestore using onSnapshot
// Funktion zum Laden von Inhalten für einen bestimmten Abschnitt aus Firestore mithilfe von onSnapshot
function loadSectionContent(sectionId) {
    // No need to check currentUserId if rules allow public read
    // Keine Notwendigkeit, currentUserId zu überprüfen, wenn Regeln das öffentliche Lesen erlauben
    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`);
    const contentDisplay = document.querySelector(`.content-display[data-section="${sectionId}"]`);
    const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;

    // Unsubscribe from previous listener for this section if it exists
    // Vom vorherigen Listener für diesen Abschnitt abmelden, falls vorhanden
    if (sectionUnsubscribeListeners[sectionId]) {
        sectionUnsubscribeListeners[sectionId]();
        console.log(`Unsubscribed from previous snapshot listener for section: ${sectionId}`);
    }

    // Set initial loading state
    // Initialen Ladestatus festlegen
    if (contentDisplay) {
        contentDisplay.innerHTML = `<p class="text-center text-gray-400">Loading content for ${sectionTitle}...</p>`;
    }
    if (contentInput) {
        contentInput.value = '';
    }

    // NEW PATH: artifacts/{projectId}/publicWikiContent/{sectionId}
    // NEUER PFAD: artifacts/{projectId}/publicWikiContent/{sectionId}
    const contentRef = doc(db, `artifacts/${projectId}/publicWikiContent`, sectionId);

    // Set up a real-time listener
    // Einen Echtzeit-Listener einrichten
    sectionUnsubscribeListeners[sectionId] = onSnapshot(contentRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const markdownContent = data.content || '';
            if (contentInput) {
                contentInput.value = markdownContent; // Textbereich füllen
            }
            if (contentDisplay) {
                // Render Markdown to HTML
                // Markdown in HTML rendern
                contentDisplay.innerHTML = marked.parse(markdownContent);
            }
            console.log(`Content loaded for section: ${sectionId}`);
        } else {
            if (contentInput) {
                contentInput.value = ''; // Textbereich leeren, wenn kein Inhalt vorhanden ist
            }
            if (contentDisplay) {
                contentDisplay.innerHTML = `<p class="text-center text-gray-400">No content saved for ${sectionTitle} yet. Click 'Edit' to start writing!</p>`;
            }
            console.log(`No document found for section: ${sectionId}`);
        }
    }, (error) => {
        console.error(`Error getting document for ${sectionId}:`, error);
        if (contentDisplay) {
            contentDisplay.innerHTML = `<p class="text-center text-gray-400">Error loading content for ${sectionTitle}. Please check console.</p>`;
        }
        showMessageBox(`Error loading content for ${sectionTitle}.`, "error");
    });
    console.log(`Subscribed to snapshot listener for section: ${sectionId}`);
}

// Function to toggle the visibility of the editor area for a given section
// Funktion zum Umschalten der Sichtbarkeit des Editorbereichs für einen bestimmten Abschnitt
function toggleEditorVisibility(sectionId) {
    const editorArea = document.querySelector(`.editor-area[data-section="${sectionId}"]`);
    if (editorArea) {
        editorArea.classList.toggle('hidden'); // Die Klasse 'hidden' umschalten
    }
}
