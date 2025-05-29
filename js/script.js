// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Your web app's Firebase configuration - DIRECTLY EMBEDDED HERE
const firebaseConfig = {
    apiKey: "AIzaSyADwTnw2J5C9BpWPJsDhsHBHbkVckm6HjU",
    authDomain: "dndwiki-fb2a5.firebaseapp.com",
    projectId: "dndwiki-fb2a5",
    storageBucket: "dndwiki-fb2a5.firebasestorage.app",
    messagingSenderId: "978113723224",
    appId: "1:978113723224:web:c87a0d32698207f87e432d"
};

// Use projectId for Firestore paths as it's a clean string without special characters
const projectId = firebaseConfig.projectId; // This is used in the path to keep it unique per project

// The __initial_auth_token is still expected from the Canvas environment for authentication
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let currentUserId = null; // We still authenticate for logging purposes, but data path is public now

// Define the sections for the wiki
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
const sectionUnsubscribeListeners = {};

// Function to display a temporary message box
function showMessageBox(message, type = 'success') {
    const msgBox = document.getElementById('message-box');
    msgBox.textContent = message;
    msgBox.className = 'message-box show'; // Reset classes and add 'show'
    if (type === 'error') {
        msgBox.style.backgroundColor = '#f44336'; // Red for error
    } else {
        msgBox.style.backgroundColor = '#4CAF50'; // Green for success
    }

    setTimeout(() => {
        msgBox.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

// Initialize Firebase and set up authentication
window.onload = async function () {
    try {
        // Initialize Firebase with the directly embedded config
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Set the current year in the footer
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Listen for authentication state changes (still useful for logging/analytics)
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                currentUserId = user.uid;
                console.log("User signed in successfully. User ID:", currentUserId);
                // Removed: document.getElementById('user-id-display').textContent = `User ID: ${currentUserId}`;
            } else {
                // User is signed out
                console.log("User is currently signed out. Attempting anonymous sign-in or custom token sign-in...");
                // Removed: document.getElementById('user-id-display').textContent = `User ID: Not authenticated`;
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        console.log("Attempted sign-in with custom token.");
                    } else {
                        await signInAnonymously(auth); // Still try anonymous sign-in even if not strictly needed for access
                        console.log("Attempted anonymous sign-in.");
                    }
                } catch (error) {
                    console.error("Authentication failed during sign-in attempt:", error);
                    showMessageBox("Authentication failed. Please check console for details.", "error");
                }
            }
            // Load content for all sections regardless of auth status, since rules will be public
            loadAllSectionsContent();
        });

        // Add event listeners for all save buttons
        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const sectionId = event.target.dataset.section;
                console.log(`Save button clicked for section: ${sectionId}`);
                saveSectionContent(sectionId);
            });
        });

        // Add event listeners for all edit buttons
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
function loadAllSectionsContent() {
    console.log("Loading content for all wiki sections...");
    wikiSections.forEach(section => {
        loadSectionContent(section.id);
    });
}

// Function to save content for a specific section to Firestore
async function saveSectionContent(sectionId) {
    console.log(`Attempting to save content for section: ${sectionId}`);
    if (currentUserId) {
        console.log(`Authenticated as User ID: ${currentUserId}`);
    } else {
        console.log("Saving as unauthenticated user.");
    }


    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`).value;
    // NEW PATH: artifacts/{projectId}/publicWikiContent/{sectionId}
    const contentRef = doc(db, `artifacts/${projectId}/publicWikiContent`, sectionId);

    try {
        await setDoc(contentRef, { content: contentInput });
        console.log(`Content for ${sectionId} saved successfully to publicWikiContent!`);
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Content for ${sectionTitle} saved!`);
        toggleEditorVisibility(sectionId); // Hide editor after saving
    } catch (error) {
        console.error(`Error saving content for ${sectionId}:`, error);
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Failed to save content for ${sectionTitle}. Please try again.`, "error");
    }
}

// Function to load content for a specific section from Firestore using onSnapshot
function loadSectionContent(sectionId) {
    // No need to check currentUserId if rules allow public read
    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`);
    const contentDisplay = document.querySelector(`.content-display[data-section="${sectionId}"]`);
    const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;

    // Unsubscribe from previous listener for this section if it exists
    if (sectionUnsubscribeListeners[sectionId]) {
        sectionUnsubscribeListeners[sectionId]();
        console.log(`Unsubscribed from previous snapshot listener for section: ${sectionId}`);
    }

    // Set initial loading state
    if (contentDisplay) {
        contentDisplay.innerHTML = `<p class="text-center text-gray-400">Loading content for ${sectionTitle}...</p>`;
    }
    if (contentInput) {
        contentInput.value = '';
    }

    // NEW PATH: artifacts/{projectId}/publicWikiContent/{sectionId}
    const contentRef = doc(db, `artifacts/${projectId}/publicWikiContent`, sectionId);

    // Set up a real-time listener
    sectionUnsubscribeListeners[sectionId] = onSnapshot(contentRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const markdownContent = data.content || '';
            if (contentInput) {
                contentInput.value = markdownContent; // Populate textarea
            }
            if (contentDisplay) {
                // Render Markdown to HTML
                contentDisplay.innerHTML = marked.parse(markdownContent);
            }
            console.log(`Content loaded for section: ${sectionId}`);
        } else {
            if (contentInput) {
                contentInput.value = ''; // Clear textarea if no content
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
function toggleEditorVisibility(sectionId) {
    const editorArea = document.querySelector(`.editor-area[data-section="${sectionId}"]`);
    if (editorArea) {
        editorArea.classList.toggle('hidden'); // Toggle the 'hidden' class
    }
}
