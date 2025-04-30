---
**IMPORTANT: AI Development Log**

**Purpose:** This document serves as the primary knowledge base for the AI assistant(s) working on this project. It outlines the architecture, core logic, content structure, and editing procedures.

**Requirement:** **KEEP THIS DOCUMENT UPDATED!** Any changes to the project structure, core functionality, file locations, or major dependencies **MUST** be reflected here promptly. This ensures continuity and context for subsequent AI sessions or instances. Think of it as the AI's working memory for this project.

---

# Project Overview

This is a single-page portfolio website built with vanilla JavaScript, HTML, and CSS. It uses a simple hash-based routing system to display different views (home page, project lists, project details). Content is primarily loaded from JSON (`content/positions.json`) and Markdown files (`content/projects/<slug>/content.md`). [GSAP](https://greensock.com/gsap/) is used for animations, [Lucide](https://lucide.dev/) for icons, and the [marked](https://marked.js.org/) library for Markdown rendering.

# Core Components & Logic

## Routing (`assets/js/app.js`)

*   A `router` function is triggered on initial page load (`DOMContentLoaded`) and whenever the URL hash changes (`hashchange`).
*   It parses `location.hash` (e.g., `#/project/biophilia-hypothesis`) to determine the primary route (`#/project`) and parameters (`['biophilia-hypothesis']`).
*   A `routes` object maps hash prefixes ('', `#/position`, `#/project`) to corresponding view initialization functions (`initHomeView`, `initProjectView`).
*   The appropriate view function is called, passing the root element (`#app`), parameters, and a `doodlePositionId` (for background images, currently not fully utilized in project view).
*   The router clears the `#app` container before calling the view function.

## Home View (`assets/js/views/home.js`)

*   **`initHomeView`**: Fetches `content/positions.json`, clears the root, renders the standard header, and creates entry cards for each position. It also renders the "About Me" section.
*   **`createEntryCard`**: Generates the HTML for position/project cards.
*   **Click Handlers**:
    *   Clicking a position card with projects calls `displayProjects`.
    *   Clicking a position card without projects should ideally navigate to `#/project/<position-id>` (currently might call `displayProjectDetail` directly - potential point of inconsistency).
*   **`displayProjects`**: Renders a view listing projects under a specific position, similar to `initHomeView`. Clicking a project card here now correctly changes `location.hash` to `#/project/<project-id>`, triggering the main router.
*   **`displayProjectDetail`**: (Currently potentially unused if all projects use the hash route). Renders a simple placeholder detail view directly.
*   **Helper Functions**: Includes functions for rendering the title area, handling card/content animations (`triggerCardTransition`, `animateNewContent`, etc.), and adjusting padding. These are exported for use by other views.

## Project View (`assets/js/views/project.js`)

*   **`initProjectView`**:
    *   Called by the main router when `location.hash` starts with `#/project/`. Receives the project slug (e.g., `biophilia-hypothesis`) via `params[0]`.
    *   Fetches `./content/projects/<slug>/meta.json` and `./content/projects/<slug>/content.md` concurrently.
    *   Renders the standard header using `renderTitleArea`, getting the title from `meta.json` or formatting the slug.
    *   Parses `content.md` using `<!-- DOUBLE DIAMOND START -->` as a separator (via `indexOf`).
    *   Renders the main description part within a nested `div.portfolio-section-panel > div.project-document.project-main-description`. Extracts the H1 from the markdown to use as the `.portfolio-title`.
    *   If `meta.type === 'double'` and Double Diamond content was found, it calls `renderDoubleDiamond`.
    *   Adds background doodles and handles content animations.
*   **`renderDoubleDiamond`**:
    *   Called by `initProjectView` if the project is type `"double"`.
    *   Calls `parseAndAssignDDContent` to split the DD markdown into phases.
    *   Creates the DOM structure for the DD section:
        *   Outer `div.portfolio-section-panel.glass-panel.dd-section`.
        *   Inner `div.project-document.dd-document`.
        *   Inside the document:
            *   `div.dd-header` containing arrow buttons (`button.dd-arrow > i[data-lucide]`) and title (`h2.dd-title.portfolio-title`).
            *   `div.dd-meta-container` containing:
                *   A `div.dd-image-wrapper` (with `position: relative`, `min-height`).
                *   Inside the wrapper: `img.dd-image.dd-image-current`, `img.dd-image.dd-image-next` (for crossfade), and `img.dd-image.dd-image-overlay` (static faint overlay of `doublediamond_1.svg`). Images are absolutely positioned.
                *   A `div.dd-dots-container` where dots (`span.dd-dot` with `data-index`) are created *once*.
                *   The phase description (`p.dd-phase-description`).
            *   `hr.dd-divider`.
            *   `div.dd-content` (for phase-specific markdown).
    *   Calls `loadPhase` to populate the initial content and state.
    *   Calls `lucide.createIcons({context: ddPanel})` inside `requestAnimationFrame` to render icons.
*   **`parseAndAssignDDContent`**: Splits the raw DD markdown string using `split(/^## /m)` to get content for each phase based on H2 headings. Populates the `content` field of the `phaseDetails` objects.
*   **`loadPhase`**:
    *   Called initially and on arrow clicks.
    *   Starts by calling `gsap.killTweensOf()` on text and image elements to allow animations to "snap" on rapid clicks.
    *   Handles **text animations** using a GSAP timeline (`textTl`): Fades out title, description, content; updates text; fades text back in.
    *   Handles **dot updates**: Removes `.active-dot` class from the current dot, finds the new dot using `querySelector` and `data-index`, adds `.active-dot` class. CSS handles the opacity transition.
    *   Handles **image crossfade** using a GSAP timeline (`imageTl`): Sets `nextImage.src`, fades in `nextImage` quickly, then fades out `currentImage` slowly after a delay. Uses complementary easing (`power1.easeIn`, `power3.easeOut`) to minimize brightness dips. Manages `z-index` for layering. Updates `currentImage.src` and resets `nextImage` state via `.call()` at the end.
*   **`phaseDetails`**: An array of objects defining the properties (`id`, `title`, `svg`, `content`, generic description) for each DD phase.

## Styling (`assets/css/style.css`)

*   Uses CSS variables for colors, etc.
*   Defines base styles, layout for header/main/grid.
*   Styles for cards (`.card`), panels (`.portfolio-section-panel`), inner documents (`.portfolio-document`, `.project-document`), titles (`.portfolio-title`), and the Double Diamond component elements.
*   **Double Diamond Specific Styles:**
    *   `.dd-header`, `.dd-arrow`, `.dd-title`: Layout for the top controls.
    *   `.dd-meta-container`: Contains image, dots, description.
    *   `.dd-image-wrapper`: Relative positioning, `max-width`, `min-height`.
    *   `.dd-image-current`, `.dd-image-next`, `.dd-image-overlay`: Absolute positioning, `user-select: none`, `pointer-events: none`.
    *   `.dd-image-overlay`: Low opacity, `z-index: 1`.
    *   `.dd-dots-container`: Flex layout for dots.
    *   `.dd-dot`: Base style, opacity, and `transition: opacity`.
    *   `.dd-dot.active-dot`: Active state style (opacity, color).
    *   `.dd-phase-description`: Styling for the text below dots.
    *   `.dd-divider`: Styling for the separator.
    *   `.dd-content`: Container for markdown content.
*   Includes keyframe animations for transitions (though DD transitions primarily use GSAP and CSS transitions now).

# How to Edit

*   **Edit Position/Project Listings (Home Page)**: Modify the data in `content/positions.json`. Ensure projects intended for detail views have a unique `id` that matches their corresponding folder name in `content/projects/`.
*   **Edit "About Me" Text**: Update the `bioText` variable within `initHomeView` in `assets/js/views/home.js`.
*   **Edit Main Project Description (Non-DD or Top Part of DD)**: Edit the Markdown content *before* the `<!-- DOUBLE DIAMOND START -->` comment in the relevant `content/projects/<slug>/content.md` file. Add an H1 (`# Title`) for it to be styled as the main title.
*   **Edit Double Diamond Phase-Specific Content**: Edit the Markdown content *under* the corresponding `## Phase Title` heading within the Double Diamond section of `content/projects/<slug>/content.md`.
*   **Change Project Type (Standard vs. Double Diamond)**: Modify the `"type"` field in the project's `content/projects/<slug>/meta.json` (e.g., `"type": "double"` or `"type": "standard"` - although `"standard"` isn't explicitly checked, the absence of `"double"` defaults to rendering the whole markdown).
*   **Edit Double Diamond Titles/Generic Descriptions/SVGs**: Modify the `title`, `description`, or `svg` fields within the `phaseDetails` array at the top of `assets/js/views/project.js`.
*   **Change Styling/Layout**: Modify the CSS rules in `assets/css/style.css`.
*   **Change Animations**: Modify GSAP calls in JS or `@keyframes` rules in CSS.
*   **Change Icons**: Update `data-lucide` attributes in JS and ensure `lucide.createIcons()` is called appropriately.
