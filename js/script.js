// js/script.js

document.addEventListener('DOMContentLoaded', function() {
    // Update Copyright Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Active Navigation Link Highlighting
    // This script will find the link in the navigation that matches the current page URL
    // and add an 'active-link' class to it.
    // The 'active-link' class should be defined in your style.css (already included in the provided CSS)
    const navLinks = document.querySelectorAll('nav ul li a.nav-link');
    const currentPageUrl = window.location.href;

    navLinks.forEach(link => {
        // Remove 'active-link' from all to reset (in case of template copy-paste errors)
        link.classList.remove('active-link');
        
        // Check if the link's href matches the current page URL
        if (link.href === currentPageUrl) {
            link.classList.add('active-link');
        }
    });


    // --- Basic Sitemap Filter (Optional Enhancement) ---
    // This is a very simple filter for the sitemap page.
    // It's not a full-text search across the site.
    const searchInput = document.getElementById('sitemapSearch');
    if (searchInput) {
        const sitemapListItems = document.querySelectorAll('#sitemap-content ul > li, #sitemap-content ul ul > li'); // Selects all li elements in the sitemap

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            sitemapListItems.forEach(item => {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(searchTerm)) {
                    item.style.display = ''; // Show item
                    // Optionally, ensure parent ULs are also visible if a child matches
                    let parent = item.parentElement;
                    while(parent && parent.tagName === 'UL') {
                        if(parent.style.display === 'none') parent.style.display = '';
                        // Also check the LI container of this UL
                        if(parent.parentElement && parent.parentElement.tagName === 'LI' && parent.parentElement.style.display === 'none'){
                            parent.parentElement.style.display = '';
                        }
                        parent = parent.parentElement.parentElement; // up to LI then up to UL
                    }

                } else {
                    item.style.display = 'none'; // Hide item
                }
            });
        });
    }

    // --- Smooth Scrolling for internal links (optional) ---
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //     anchor.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         const targetId = this.getAttribute('href');
    //         const targetElement = document.querySelector(targetId);
    //         if(targetElement) {
    //             targetElement.scrollIntoView({
    //                 behavior: 'smooth'
    //             });
    //         }
    //     });
    // });

    console.log("D&D Wiki Script Loaded. May your rolls be critical successes!");
});

// Future ideas for script.js:
// 1. More advanced client-side search:
//    - Create a search index (JSON file) during a "build" step (manual or with a simple script).
//    - Fetch this index and use a library like Lunr.js for searching.
// 2. Dynamic content loading for parts of pages (e.g., modals for NPC details).
// 3. Toggable sections (show/hide lore snippets).
// 4. Theme switcher (e.g., light/dark parchment).
