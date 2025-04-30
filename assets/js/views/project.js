import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'; // Use ESM import
import { addBackgroundDoodles } from '../app.js';
// Import helpers from home.js
import { renderTitleArea, adjustContentPadding, animateNewContent, animateExistingContentOut } from './home.js'; 

// Define Double Diamond phase details (order matters)
const phaseDetails = [
  { id: 'problem-statement', title: 'Problem Statement', svg: 'doublediamond_1.svg', content: '', description: 'Defining the core user problem, business needs, and project scope.' },
  { id: 'discovery', title: 'Discovery', svg: 'doublediamond_2.svg', content: '', description: 'Researching the user, market landscape, and existing solutions through exploration.' },
  { id: 'definition', title: 'Definition', svg: 'doublediamond_3.svg', content: '', description: 'Synthesizing research into clear insights, defining requirements, and focusing the design direction.' },
  { id: 'development', title: 'Development', svg: 'doublediamond_4.svg', content: '', description: 'Designing, prototyping, and testing potential solutions iteratively based on the definition.' },
  { id: 'delivery', title: 'Delivery', svg: 'doublediamond_5.svg', content: '', description: 'Finalizing, documenting, and launching the chosen solution, followed by evaluation.' }
];

export async function initProjectView(root, params, doodlePositionId) {
  const slug = params[0]; 
  root.innerHTML = ''; 

  try {
    const [metaRes, contentRes] = await Promise.all([
      fetch(`./content/projects/${slug}/meta.json`),
      fetch(`./content/projects/${slug}/content.md`)
    ]);

    if (!metaRes.ok) throw new Error(`Failed to fetch meta.json (status: ${metaRes.status})`);
    if (!contentRes.ok) throw new Error(`Failed to fetch content.md (status: ${contentRes.status})`);

    const meta = await metaRes.json();
    const rawMarkdown = await contentRes.text();

    // --- Create Header ---
    const header = document.createElement('header');
    header.id = 'page-header';
    const goBack = () => {
      // Animate out, then use history back or navigate to home
      animateExistingContentOut('#page-content > div', '.project-content-wrapper', () => {
        // TODO: Need to know where to go back to. For now, go home.
        location.hash = ''; 
      });
    };
    // Use meta title if available, otherwise format the slug
    const headerTitle = meta.title || slug.replace(/-/g, ' ').replace(/^\w| \w/g, l => l.toUpperCase()); // Capitalize first letter and letters after spaces
    // TODO: Need position info for subtitle, maybe pass from home.js or add to meta.json?
    const headerSubtitle = meta.parentPositionTitle || 'Project'; 
    const titleArea = renderTitleArea(headerTitle, headerSubtitle, goBack);
    header.appendChild(titleArea);
    root.appendChild(header);

    // --- Create Main Content Area ---
    const main = document.createElement('main');
    main.id = 'page-content';

    // --- Create Wrapper for Animation --- 
    const animationWrapper = document.createElement('div');
    animationWrapper.className = 'project-content-wrapper'; // Use a wrapper for animation

    // --- Parse and Render Main Description ---
    const startComment = '<!-- DOUBLE DIAMOND START -->';
    const endComment = '<!-- DOUBLE DIAMOND END -->';
    
    let mainDescriptionMarkdown = rawMarkdown;
    let doubleDiamondRawContent = '';

    const startIndex = rawMarkdown.indexOf(startComment);
    
    if (startIndex !== -1) {
        mainDescriptionMarkdown = rawMarkdown.substring(0, startIndex).trim();
        // Basic check to remove trailing --- if it exists before the comment
        if (mainDescriptionMarkdown.endsWith('---')) {
            mainDescriptionMarkdown = mainDescriptionMarkdown.slice(0, -3).trimEnd();
        }

        const endIndex = rawMarkdown.indexOf(endComment, startIndex);
        if (endIndex !== -1) {
            doubleDiamondRawContent = rawMarkdown.substring(startIndex + startComment.length, endIndex).trim();
        } else {
            doubleDiamondRawContent = rawMarkdown.substring(startIndex + startComment.length).trim();
        }
    }
    
    if (mainDescriptionMarkdown) {
      // Create the outer panel
      const mainDescPanel = document.createElement('div');
      mainDescPanel.className = 'portfolio-section-panel glass-panel';
      // Create the inner document
      const mainDescDocument = document.createElement('div');
      mainDescDocument.className = 'project-document project-main-description'; 

      // --- Extract and style title from Markdown --- 
      let contentWithoutTitle = mainDescriptionMarkdown;
      const titleMatch = mainDescriptionMarkdown.match(/^#\s+(.*)(\n|$)/);
      if (titleMatch && titleMatch[1]) {
          const titleText = titleMatch[1];
          const titleElement = document.createElement('h2'); // Use h2 like portfolio-title
          titleElement.className = 'portfolio-title'; // Apply the class
          titleElement.textContent = titleText;
          mainDescDocument.appendChild(titleElement);
          // Remove the title line from the rest of the content
          contentWithoutTitle = mainDescriptionMarkdown.substring(titleMatch[0].length).trim();
      }
      // Render the rest of the content
      const restOfContent = document.createElement('div');
      restOfContent.innerHTML = marked(contentWithoutTitle);
      mainDescDocument.appendChild(restOfContent);
      // --- End Title Extraction ---

      // Append document to panel, panel to wrapper
      mainDescPanel.appendChild(mainDescDocument);
      animationWrapper.appendChild(mainDescPanel); 
    } else {
        console.warn("initProjectView: No main description found for project:", slug);
    }

    // --- Render Double Diamond (if applicable) ---
    if (meta.type === 'double' && doubleDiamondRawContent) {
      await renderDoubleDiamond(animationWrapper, doubleDiamondRawContent);
    } else if (meta.type === 'double' && !doubleDiamondRawContent) {
        console.warn("initProjectView: Project marked as 'double' but no Double Diamond content found after separator in content.md");
        const errorEl = document.createElement('p');
        errorEl.textContent = "Error: Double Diamond content missing or incorrectly formatted.";
        errorEl.style.color = 'red';
        animationWrapper.appendChild(errorEl); // Add error to wrapper
    }

    // Append wrapper to main, main to root
    main.appendChild(animationWrapper);
    root.appendChild(main);

    // Adjust padding AFTER header and main content are in the DOM
    adjustContentPadding();

    // Animate content in
    animateNewContent('.project-content-wrapper', '.project-main-description'); // Animate main description in
    // TODO: Need to animate DD section as well if present

    // Doodles
    addBackgroundDoodles(null); // Still using null for project pages

  } catch (error) {
    console.error('initProjectView: Error loading project:', error);
    // Ensure header might still show even on error?
    if (!document.getElementById('page-header')) { 
        // Minimal header on error if not already added
        const header = document.createElement('header');
        header.id = 'page-header';
        const titleArea = renderTitleArea('Error', error.message, () => { location.hash = ''; });
        header.appendChild(titleArea);
        root.appendChild(header);
    }
    const main = document.getElementById('page-content') || document.createElement('main');
    if (!document.getElementById('page-content')) { main.id = 'page-content'; root.appendChild(main); }
    main.innerHTML = `<p style="color: red; padding: 20px;">Error loading project: ${error.message}. Check console for details.</p>`;
    adjustContentPadding(); // Adjust padding even on error
  }
}

async function parseAndAssignDDContent(rawDDMarkdown) {
    const phases = JSON.parse(JSON.stringify(phaseDetails)); 
    const sections = rawDDMarkdown.split(/^## /m).filter(s => s.trim() !== ''); 

    if (sections.length !== phases.length) {
        console.warn(`parseDD: Found ${sections.length} DD sections, expected ${phases.length}. Content might be misaligned.`);
    }

    for (let i = 0; i < phases.length; i++) {
        if (sections[i]) {
            const sectionContent = sections[i].trim();
            const lines = sectionContent.split('\n');
            const titleFromFile = lines[0]?.trim();
            phases[i].content = lines.slice(1).join('\n').trim(); 
        } else {
             console.warn(`parseDD: No section content found for phase: ${phases[i].title}`);
             phases[i].content = "*Content missing via parse.*"; 
        }
    }
    return phases; 
}

async function renderDoubleDiamond(container, rawDDMarkdown) {
  const populatedPhases = await parseAndAssignDDContent(rawDDMarkdown);
  let currentIndex = 0;

  // --- Create OUTER Panel Element ---
  const ddPanel = document.createElement('div');
  ddPanel.className = 'portfolio-section-panel glass-panel dd-section'; 
  ddPanel.style.marginTop = '2rem'; 

  // --- Create INNER Document Element ---
  const ddDocument = document.createElement('div');
  ddDocument.className = 'project-document dd-document'; // Inner document styling

  // --- Create Header & Body (to go inside ddDocument) --- 
  const ddHeader = document.createElement('div');
  ddHeader.className = 'dd-header'; 

  // Revert TEMP: Use h2/button again
  const ddTitle = document.createElement('h2'); 
  ddTitle.className = 'dd-title portfolio-title'; 

  const leftArrowBtn = document.createElement('button'); // Revert
  leftArrowBtn.className = 'dd-arrow dd-arrow-left';
  // leftArrowBtn.setAttribute('role', 'button'); // Not needed for <button>
  leftArrowBtn.setAttribute('aria-label', 'Previous Phase');
  // leftArrowBtn.style.cursor = 'pointer'; // Default for <button>

  const rightArrowBtn = document.createElement('button'); // Revert
  rightArrowBtn.className = 'dd-arrow dd-arrow-right';
  // rightArrowBtn.setAttribute('role', 'button'); // Not needed for <button>
  rightArrowBtn.setAttribute('aria-label', 'Next Phase');
  // rightArrowBtn.style.cursor = 'pointer'; // Default for <button>
  
  const leftIconElement = document.createElement('i');
  leftIconElement.setAttribute('data-lucide', 'arrow-big-left');
  const rightIconElement = document.createElement('i');
  rightIconElement.setAttribute('data-lucide', 'arrow-big-right');

  // Append <i> elements to buttons
  leftArrowBtn.appendChild(leftIconElement);
  rightArrowBtn.appendChild(rightIconElement);

  ddHeader.append(leftArrowBtn, ddTitle, rightArrowBtn);

  const ddBody = document.createElement('div');
  ddBody.className = 'dd-body'; // Add class back to body container

  // --- Create container for image, dots, phase description --- 
  const ddMetaContainer = document.createElement('div');
  ddMetaContainer.className = 'dd-meta-container';

  // Create a wrapper for the images to allow absolute positioning
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'dd-image-wrapper';

  // Create two image elements for crossfading
  const currentImage = document.createElement('img'); 
  currentImage.className = 'dd-image dd-image-current'; // Add specific class
  currentImage.alt = ''; 

  const nextImage = document.createElement('img');
  nextImage.className = 'dd-image dd-image-next'; // Add specific class
  nextImage.alt = '';
  gsap.set(nextImage, { opacity: 0 }); // Start the next image hidden

  // Create the static overlay image
  const overlayImage = document.createElement('img');
  overlayImage.className = 'dd-image dd-image-overlay'; // Add specific class
  overlayImage.src = '/assets/img/doublediamond_1.svg'; // Set static source
  overlayImage.alt = 'Double Diamond Overlay';

  // Add images to their wrapper (overlay goes last to be on top initially)
  imageWrapper.append(currentImage, nextImage, overlayImage);

  const ddDotsContainer = document.createElement('div');
  ddDotsContainer.className = 'dd-dots-container';
  // PRE-BUILD DOTS HERE
  for (let i = 0; i < populatedPhases.length; i++) {
    const dot = document.createElement('span');
    dot.className = 'dd-dot';
    dot.dataset.index = i; // Add index for selection later
    // Initial active state will be set by loadPhase
    dot.innerHTML = '&bull;'; 
    ddDotsContainer.appendChild(dot);
  }

  const ddPhaseDescription = document.createElement('p');
  ddPhaseDescription.className = 'dd-phase-description';

  // Add image wrapper, dots, description to meta container
  // Replace ddImage with imageWrapper
  ddMetaContainer.append(imageWrapper, ddDotsContainer, ddPhaseDescription);

  const ddContentEl = document.createElement('div'); 
  ddContentEl.className = 'dd-content';

  // --- NEW: Create Divider --- 
  const ddDivider = document.createElement('hr');
  ddDivider.className = 'dd-divider';

  // --- Assemble Structure: Header + Meta + Divider + Content -> Document -> Panel -> Container --- 
  ddDocument.append(ddHeader, ddMetaContainer, ddDivider, ddContentEl); // Add divider here
  ddPanel.appendChild(ddDocument);
  container.appendChild(ddPanel); 

  // --- Load Phase Function (Handles Updates) ---
  function loadPhase(index) {
    const phase = populatedPhases[index];
    const textFadeDuration = 0.5; // Keep separate duration for text

    // 1. Text Animation Timeline (Fade Out -> Update -> Fade In)
    const textTl = gsap.timeline({ overwrite: true });
    textTl.to([ddTitle, ddPhaseDescription, ddContentEl], { 
        opacity: 0, 
        duration: textFadeDuration * 0.4, // Maintain split duration
        ease: "power1.in",
    })
    .call(() => { // Update text content after fade out
        ddTitle.textContent = phase.title;
        ddPhaseDescription.textContent = phase.description || '';
        ddContentEl.innerHTML = marked(phase.content || '*Content missing.*'); 
    }) 
    .to([ddTitle, ddPhaseDescription, ddContentEl], { // Fade text back in
        opacity: 1, 
        duration: textFadeDuration * 0.6, // Maintain split duration
        ease: "power1.out",
    });

    // 2. Update Dots (Using CSS transitions)
    // Remove active class from current dot
    const currentActiveDot = ddDotsContainer.querySelector('.active-dot');
    if (currentActiveDot) {
        currentActiveDot.classList.remove('active-dot');
    }
    // Add active class to new dot using the pre-built dot and its data-index
    const newActiveDot = ddDotsContainer.querySelector(`[data-index="${index}"]`);
    if (newActiveDot) {
        newActiveDot.classList.add('active-dot');
    }
    // Note: The actual visual transition for dots now happens via CSS

    // 3. Image Crossfade Animation
    // Set the source for the *next* image element
    nextImage.src = `/assets/img/${phase.svg}`;
    nextImage.alt = `${phase.title} phase illustration`;

    // Create the crossfade timeline
    const imageTl = gsap.timeline({ overwrite: true });
    const fadeInDuration = 0.5;  // Adjusted fade-in
    const fadeOutDuration = 0.5; // Slower fade-out
    const fadeOutDelay = 0.3;   // Delay before fade-out starts

    // Reset z-indexes to ensure correct layering if needed
    gsap.set(currentImage, { zIndex: 0 });
    gsap.set(nextImage, { zIndex: 1 }); // Ensure next image starts on top for fade-in

    imageTl.to(nextImage, { // Fade in next image QUICKLY
        opacity: 1,
        duration: fadeInDuration, 
        ease: "power1.easeOut" // Smooth quick fade-in
    }, 0 ) // Start immediately
    .to(currentImage, { // Fade out current image SLOWLY, after delay
        opacity: 0,
        duration: fadeOutDuration, 
        ease: "power1.easeIn" // Smooth slow fade-out
    }, fadeOutDelay ) // Start after the specified delay
    .call(() => { // After animation: Update current image and reset next image
        currentImage.src = nextImage.src; 
        currentImage.alt = nextImage.alt;
        gsap.set(currentImage, { opacity: 1, zIndex: 0 }); // Reset current image state
        gsap.set(nextImage, { opacity: 0, zIndex: 1 }); // Reset next image state
    });

  }

  // --- Event Listeners ---
  leftArrowBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + populatedPhases.length) % populatedPhases.length;
    loadPhase(currentIndex);
  };

  rightArrowBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % populatedPhases.length;
    loadPhase(currentIndex);
  };

  // --- Initial Load ---
  loadPhase(currentIndex);

  // --- Initialize Lucide Icons ---
  // Use requestAnimationFrame to ensure DOM is ready for lucide
  requestAnimationFrame(() => {
    try {
      lucide.createIcons({context: ddPanel}); 
    } catch (error) {
      console.error("renderDD: Error during lucide.createIcons():", error); // Keep error log
    }
  });
}