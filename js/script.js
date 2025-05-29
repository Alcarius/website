// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for Firebase (provided by the Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let currentUserId = null;

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
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Set the current year in the footer
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Listen for authentication state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                currentUserId = user.uid;
                console.log("User signed in successfully. User ID:", currentUserId);
                document.getElementById('user-id-display').textContent = `User ID: ${currentUserId}`;
                // Once authenticated, load content for all sections
                loadAllSectionsContent();
            } else {
                // User is signed out
                console.log("User is currently signed out. Attempting anonymous sign-in or custom token sign-in...");
                document.getElementById('user-id-display').textContent = `User ID: Not authenticated`;
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        console.log("Attempted sign-in with custom token.");
                    } else {
                        await signInAnonymously(auth);
                        console.log("Attempted anonymous sign-in.");
                    }
                } catch (error) {
                    console.error("Authentication failed during sign-in attempt:", error);
                    showMessageBox("Authentication failed. Please check console for details.", "error");
                }
            }
        });

        // Add event listeners for all save buttons
        document.querySelectorAll('.save-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const sectionId = event.target.dataset.section;
                console.log(`Save button clicked for section: ${sectionId}`);
                saveSectionContent(sectionId);
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
    if (!currentUserId) {
        console.error("Save failed: currentUserId is null. Authentication not complete.");
        showMessageBox("Authentication not ready. Please wait for user ID to appear.", "error");
        return;
    }

    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`).value;
    // Document path: artifacts/{appId}/users/{currentUserId}/wikiContent/{sectionId}
    const contentRef = doc(db, `artifacts/${appId}/users/${currentUserId}/wikiContent`, sectionId);

    console.log(`Attempting to save content for section: ${sectionId} with User ID: ${currentUserId}`);
    try {
        await setDoc(contentRef, { content: contentInput });
        console.log(`Content for ${sectionId} saved successfully!`);
        // Find the title for the message box
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Content for ${sectionTitle} saved!`);
    } catch (error) {
        console.error(`Error saving content for ${sectionId}:`, error);
        const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;
        showMessageBox(`Failed to save content for ${sectionTitle}. Please try again.`, "error");
    }
}

// Function to load content for a specific section from Firestore using onSnapshot
function loadSectionContent(sectionId) {
    if (!currentUserId) {
        console.log(`Cannot load content for ${sectionId}: User not authenticated yet. Skipping load.`);
        return;
    }

    // Unsubscribe from previous listener for this section if it exists
    if (sectionUnsubscribeListeners[sectionId]) {
        sectionUnsubscribeListeners[sectionId]();
        console.log(`Unsubscribed from previous snapshot listener for section: ${sectionId}`);
    }

    const contentInput = document.querySelector(`.content-input[data-section="${sectionId}"]`);
    const contentDisplay = document.querySelector(`.content-display[data-section="${sectionId}"]`);
    const sectionTitle = wikiSections.find(s => s.id === sectionId)?.title || sectionId;


    // Set initial loading state
    if (contentDisplay) {
        contentDisplay.innerHTML = `<p class="text-center text-gray-400">Loading content for ${sectionTitle}...</p>`;
    }
    if (contentInput) {
        contentInput.value = '';
    }

    const contentRef = doc(db, `artifacts/${appId}/users/${currentUserId}/wikiContent`, sectionId);

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
                contentDisplay.innerHTML = `<p class="text-center text-gray-400">No content saved for ${sectionTitle} yet. Start writing in the box above!</p>`;
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
