# D&D Campaign Wiki: Chronicles of Eldoria (Template)

Welcome to your D&D Campaign Wiki! This static website is designed to help you organize and share campaign information with your players. It's built with HTML, Tailwind CSS, and a sprinkle of JavaScript, making it easy to customize and host for free on GitHub Pages.

## Project Structure


your-campaign-wiki/
├── index.html             # Homepage: Campaign Introduction
├── sitemap.html           # Sitemap: Index of all pages
├── css/
│   └── style.css          # Custom CSS for fantasy theme, responsive design
├── js/
│   └── script.js          # Basic JavaScript (e.g., copyright year, active nav link)
├── pages/                 # Folder for all your content pages
│   ├── template.html      # Template for creating new content pages
│   ├── locations.html     # Example content page (copy from template)
│   ├── npcs.html          # Example content page
│   ├── factions.html      # Example content page
│   ├── lore.html          # Example content page
│   ├── quests.html        # Example content page
│   └── house_rules.html   # Example content page
├── assets/                # Optional: For images, custom fonts, etc.
│   └── images/
│       └── (your images here, e.g., parchment-texture.png, map.jpg)
└── README.md              # This file: Project guide and deployment instructions


## Getting Started

1.  **Download/Clone:** Get these files onto your local machine.
2.  **Customize `index.html`:**
    * Open `index.html` in a text editor.
    * Change `"Campaign Name"` in the `<title>` tag.
    * Update the main heading (`<h1 class="text-5xl ...">Chronicles of Eldoria</h1>`) to your campaign's name.
    * Edit the introductory text in the `<section id="introduction">`.
    * Update the "Recent Tidings" and "Quick Scrolls" sections or remove them if not needed.
    * Change `"Your Campaign Name"` in the footer.
3.  **Customize `pages/template.html` (before copying for new pages):**
    * Open `pages/template.html`.
    * Update the main heading link to point to your campaign name: `<a href="../index.html" ...>Chronicles of Eldoria</a>`.
    * Change `"Your Campaign Name"` in the footer.
    * This template's navigation links assume it's inside the `pages/` folder. The links to other pages are like `href="locations.html"` and the link to `index.html` is `href="../index.html"`.

## Creating New Content Pages

1.  **Go to the `pages/` folder.**
2.  **Copy `template.html`** and rename the copy to reflect its content (e.g., `my-new-city.html`, `important-npc.html`). Use lowercase letters and hyphens for spaces in filenames.
3.  **Open the new HTML file** in your text editor:
    * Change the `<title>` tag to something descriptive (e.g., `<title>The City of Dragonsleep - Chronicles of Eldoria Wiki</title>`).
    * Update the main page heading (`<h2 class="text-4xl ...">Page Title Here</h2>`).
    * Fill in the content within the `<article>` tag. Use the provided structure for sections, headings, paragraphs, lists, and images.
    * **Linking:**
        * To link to another page within the `pages` folder: `<a href="other-page.html">Link Text</a>`
        * To link to the homepage: `<a href="../index.html">Home</a>`
        * To link to a specific section on *another* page: `<a href="other-page.html#sectionID">Go to Section on Other Page</a>` (ensure the target section has an `id="sectionID"` attribute).
        * To link to a specific section on the *current* page: `<a href="#sectionID">Go to Section</a>`
    * **Navigation:** In the `<nav>` section of your new page, find the `<li>` element corresponding to the page itself and add the class `active-link` to its `<a>` tag. For example, if you are editing `locations.html`, the link would look like: `<li><a href="locations.html" class="nav-link active-link">Locations</a></li>`. The `script.js` also tries to do this automatically.
4.  **Add a link to your new page** in the main navigation bar in **all** HTML files (`index.html` and all files in `pages/`) and also on the `sitemap.html` page.

## Customizing Appearance (`css/style.css`)

* **Fonts:** The site uses "MedievalSharp" for headings and "Inter" for body text, loaded from Google Fonts. You can change these in each HTML file's `<head>` and update font-family rules in `style.css`.
* **Colors:** Colors are primarily managed using Tailwind CSS utility classes (e.g., `text-red-900`, `bg-parchment`). You can change these directly in the HTML. Custom styles in `style.css` define `bg-parchment` and some other core elements.
    * `bg-parchment`: Currently a solid beige. You can uncomment the gradient or use a `background-image` URL in `style.css` for a textured look.
* **Tailwind CSS:** This project uses Tailwind CSS via a CDN link. This means you can use any Tailwind utility classes directly in your HTML to style elements. Refer to the [Tailwind CSS Documentation](https://tailwindcss.com/docs) for available classes.

## Using `sitemap.html`

The `sitemap.html` page is intended to be a central index. Manually update it with links to all your content pages as you create them. The example shows how to list main pages and then sub-list specific entries (like individual NPCs under the main NPC page link).

The search bar on `sitemap.html` provides a basic client-side filter for the items listed *on that page only*. It's not a global site search.

## Deploying to GitHub Pages

GitHub Pages is a free way to host your static website directly from a GitHub repository.

1.  **Create a GitHub Account:** If you don't have one, sign up at [github.com](https://github.com).
2.  **Create a New Repository:**
    * Click the "+" icon in the top-right corner and select "New repository."
    * Repository name: Choose a name. If you want the site to be at `your-username.github.io`, name the repository `your-username.github.io`. Otherwise, it will be at `your-username.github.io/repository-name/`.
    * Make it "Public."
    * You can initialize it with a README (though you'll replace it with this one).
3.  **Upload Your Website Files:**
    * Go to your newly created repository on GitHub.
    * Click the "Add file" button and choose "Upload files."
    * Drag and drop all your project files and folders (`index.html`, `css/`, `js/`, `pages/`, `assets/` (if you have it), and this `README.md`) into the upload area.
    * Commit the files.
4.  **Enable GitHub Pages:**
    * In your repository, go to "Settings."
    * In the left sidebar, click on "Pages" (under "Code and automation").
    * Under "Build and deployment", for "Source", select "Deploy from a branch".
    * Under "Branch", select your main branch (usually `main` or `master`) and the folder `/ (root)`.
    * Click "Save."
5.  **Access Your Site:**
    * GitHub Pages will build and deploy your site. It might take a few minutes.
    * Once deployed, the URL will be displayed on the GitHub Pages settings page (e.g., `https://your-username.github.io/repository-name/`).

## Updating Your Site

1.  Make changes to your files locally on your computer.
2.  Upload the changed files to your GitHub repository (you can drag and drop them again, or use Git commands if you're comfortable with Git). GitHub Pages will automatically rebuild and update your live site.

## Advanced Options (Static Site Generators)

For larger wikis or if you want more features like programmatic content generation, easier templating, or plugins, consider using a Static Site Generator (SSG):

* **Jekyll:** Ruby-based, excellent integration with GitHub Pages (it's the default engine). Themes like [Jekyll Scholar](https://github.com/pages-themes/jekyll-scholar) or creating a custom one.
* **Hugo:** Go-based, very fast. Many themes available.
* **MkDocs:** Python-based, great for documentation/wikis. Themes like [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

These tools have a steeper learning curve but offer more power and flexibility in the long run. You typically write content in Markdown, and the SSG converts it into a full HTML website.

Good luck with your campaign and your new wiki!

