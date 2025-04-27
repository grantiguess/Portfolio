import { addBackgroundDoodles } from '../app.js'; // Import the function

// --- Helper to Create Title Area (Handles back button + centering) ---
function renderTitleArea(titleText, subtitleText, backCallback) {
  const titleContainer = document.createElement('div');
  titleContainer.className = 'title-area-container'; // Uses flex, space-between from CSS

  const buttonWidth = '2.5rem'; // Approximate width based on font size

  // Left Element (Button or Placeholder)
  let leftElement;
  if (backCallback) {
    leftElement = document.createElement('button');
    leftElement.textContent = '←';
    leftElement.className = 'arrow-btn';
    leftElement.style.fontSize = '2.5rem';
    leftElement.style.color = 'inherit';
    leftElement.style.userSelect = 'none';
    leftElement.style.padding = '0';
    leftElement.style.background = 'none';
    leftElement.style.border = 'none';
    leftElement.style.cursor = 'pointer';
    leftElement.style.width = buttonWidth; // Give it a width for spacing
    leftElement.style.textAlign = 'left'; // Align arrow left
    leftElement.addEventListener('click', backCallback);
  } else {
    leftElement = document.createElement('div');
    leftElement.style.width = buttonWidth;
    leftElement.style.visibility = 'hidden';
  }
  titleContainer.appendChild(leftElement);

  // Center Element (Text Wrapper)
  const textWrapper = document.createElement('div');
  textWrapper.style.textAlign = 'center'; // Center text inside
  const titleElement = document.createElement('h1');
  titleElement.textContent = titleText;
  textWrapper.appendChild(titleElement);
  if (subtitleText) {
    const subtitleElement = document.createElement('h2');
    subtitleElement.style.fontFamily = '"EB Garamond", serif';
    subtitleElement.style.fontSize = '1.2rem';
    subtitleElement.style.fontWeight = '500';
    subtitleElement.style.marginTop = '-0.5rem';
    subtitleElement.textContent = subtitleText;
    textWrapper.appendChild(subtitleElement);
  }
  titleContainer.appendChild(textWrapper);

  // Right Element (Placeholder)
  const rightPlaceholder = document.createElement('div');
  rightPlaceholder.style.width = buttonWidth;
  rightPlaceholder.style.visibility = 'hidden';
  titleContainer.appendChild(rightPlaceholder);

  return titleContainer;
}

// --- Refactored Card Creation Function ---
function createEntryCard(entryData, onClickCallback) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.entryId = entryData.id;

  // Determine type based on presence AND content of 'projects' array
  const isClickablePosition = Array.isArray(entryData.projects) && entryData.projects.length > 0;
  const typeIndicatorText = isClickablePosition ? 'Position' : 'Project'; // Show Project if no sub-projects
  const typeIndicatorClass = isClickablePosition ? 'indicator-position' : 'indicator-project';

  card.innerHTML = `
    <span class="entry-type-indicator ${typeIndicatorClass}">${typeIndicatorText}</span>
    <h2>${entryData.title || ''}</h2>
    <p class="subtitle">${entryData.company || ''} · ${entryData.year || ''}</p>
    <p class="description">${entryData.description || ''}</p>
  `;

  // Add back styles for centering content within the card
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'center'; // Vertical centering
  card.style.alignItems = 'center';    // Horizontal centering
  card.style.textAlign = 'center';    // Ensure text itself is centered

  if (onClickCallback) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (event) => onClickCallback(event, entryData));
  } else {
    card.style.cursor = 'default';
  }
  return card;
}

// --- Helper to add fade-out to other cards and run main animation ---
function triggerCardTransition(clickedCard, gridSelector, animationCallback) {
  const allCards = document.querySelectorAll(`${gridSelector} .card`);
  allCards.forEach(card => {
    if (card !== clickedCard) {
      card.classList.add('card-fading-out');
      // REMOVED: card.addEventListener('animationend', () => card.remove(), { once: true });
      // Rely on root.innerHTML = '' to clear the fading cards
    }
  });

  // If fading from home view, also fade out the portfolio section
  if (gridSelector === '.entry-grid') { 
      const portfolioPanel = document.querySelector('.portfolio-section-panel');
      if (portfolioPanel) {
          portfolioPanel.classList.add('card-fading-out');
          // REMOVED: portfolioPanel.addEventListener('animationend', () => portfolioPanel.remove(), { once: true });
          // Rely on root.innerHTML = '' to clear the fading panel
      }
  }

  // --- Fade out doodles ---
  const doodles = document.querySelectorAll('.background-doodle');
  doodles.forEach(doodle => doodle.classList.add('doodle-fading-out'));

  // Run the primary GSAP animation on the clicked card
  gsap.to(clickedCard, {
    scale: 3,
    opacity: 0,
    duration: 0.1, // Super fast GSAP
    onComplete: () => {
      // Delay even less than the fastest CSS animation (0.1s = 100ms)
      setTimeout(animationCallback, 70); // Super fast delay
    }
  });
}

// --- Updated Helper to add entering animation to new content ---
function animateNewContent(wrapperSelector, contentSelector) {
    const wrapperElement = document.querySelector(wrapperSelector);
    const contentElement = wrapperElement ? wrapperElement.querySelector(contentSelector) : null;

    if (wrapperElement && contentElement) {
        // Ensure elements are ready to be animated
        requestAnimationFrame(() => {
            // Apply fade to wrapper
            wrapperElement.classList.add('content-fading-in');
            wrapperElement.addEventListener('animationend', () => {
                wrapperElement.classList.remove('content-fading-in');
                // Reset opacity after fade animation completes
                wrapperElement.style.opacity = ''; 
            }, { once: true });

            // Apply transform to content
            contentElement.classList.add('content-transforming-in');
            contentElement.addEventListener('animationend', () => {
                contentElement.classList.remove('content-transforming-in');
            }, { once: true });
        });
    }
}

// --- NEW Helper to add exiting animation to current content ---
function animateExistingContentOut(wrapperSelector, contentSelector, onCompleteCallback) {
    const wrapperElement = document.querySelector(wrapperSelector);
    const contentElement = wrapperElement ? wrapperElement.querySelector(contentSelector) : null;
    // Match the fastest CSS exit animation duration (0.1s = 100ms)
    const animationDuration = 100; 

    // --- Fade out doodles --- 
    const doodles = document.querySelectorAll('.background-doodle');
    doodles.forEach(doodle => doodle.classList.add('doodle-fading-out'));

    if (wrapperElement && contentElement) {
        // Apply fade-out to wrapper
        wrapperElement.classList.add('content-fading-out');
        // Apply transform-out to content
        contentElement.classList.add('content-transforming-out');

        // Set timeout to call the callback after animation duration
        setTimeout(() => {
            // Optional: Clean up by removing elements or classes if needed, though view usually gets cleared
            // wrapperElement.remove(); 
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }, animationDuration);
    } else {
        // If elements not found, just run the callback immediately
        if (onCompleteCallback) {
            onCompleteCallback();
        }
    }
}

// --- Modified initHomeView ---
export async function initHomeView(root, params, doodlePositionId) {
  root.innerHTML = ''; // Clear #app

  // Create Header
  const header = document.createElement('header');
  header.id = 'page-header';
  const titleArea = renderTitleArea('Portfolio', 'Grant Eubanks', null);
  header.appendChild(titleArea);
  root.appendChild(header); // Add header to #app

  // Create Main Content Area
  const main = document.createElement('main');
  main.id = 'page-content';

  // Load positions data (if not already loaded)
  if (!window.positionsData) {
    const res = await fetch('./content/positions.json');
    window.positionsData = await res.json();
  }
  const positions = window.positionsData;

  // --- Create Grid Section ---
  const gridWrapper = document.createElement('div'); 
  gridWrapper.className = 'grid-section-wrapper'; // Wrapper for grid animation

  const grid = document.createElement('div');
  grid.className = 'entry-grid';

  positions.forEach(pos => {
    const positionClickHandler = (event, positionData) => {
      const clickedCard = event.currentTarget;
      if (positionData && Array.isArray(positionData.projects) && positionData.projects.length > 0) {
        triggerCardTransition(clickedCard, '.entry-grid', () => {
            displayProjects(root, positionData);
        });
      } else if (positionData) {
        triggerCardTransition(clickedCard, '.entry-grid', () => {
            displayProjectDetail(root, positionData, positionData);
        });
      }
    };
    const card = createEntryCard(pos, positionClickHandler);
    grid.appendChild(card);
  });

  // Append grid to its wrapper, then wrapper to main
  gridWrapper.appendChild(grid);
  main.appendChild(gridWrapper); 

  // --- Portfolio Section (About Me) ---
  const aboutWrapper = document.createElement('div');
  aboutWrapper.className = 'about-section-wrapper'; 

  const portfolioSection = document.createElement('div');
  portfolioSection.className = 'portfolio-section-panel glass-panel';
  portfolioSection.style.marginTop = '2rem';

  const portfolioDocument = document.createElement('div');
  portfolioDocument.className = 'portfolio-document';

  const portfolioTitle = document.createElement('h2');
  portfolioTitle.textContent = 'About Grant Eubanks';
  portfolioTitle.className = 'portfolio-title';
  portfolioDocument.appendChild(portfolioTitle);
  const bioText = `Grant Eubanks is a UX designer, software developer, and interdisciplinary thinker based in Raleigh, North Carolina. With a B.S. in Human-Computer Interaction and User Experience Design from North Carolina State University, Grant integrates cognitive science, computer programming, and user-centered design into every project he builds.\n\nHis work spans UX leadership, full-stack development, research design, and systems architecture. Grant has engineered large-scale inventory ecosystems, designed retail and wholesale menu systems, built fraud prevention workflows, and led UX research projects on human-nature interaction. His projects reflect a strong focus on scalable system thinking, elegant human-centered design, and the seamless integration of technology with user needs.\n\nGrant's skills bridge technical execution (Python, Java, React, Flutter, Cloud Functions) and design strategy (Figma, Enterprise Design Thinking). He brings a unique ability to connect systems thinking, cognitive science, and practical development into real-world applications that drive meaningful user experiences.\n\nHe is also the creator of Redstring, an experimental semantic network framework, and continues to explore the intersections between UX design, knowledge visualization, and emergent AI interaction.`;
  const paragraphs = bioText.split('\n\n');
  
  const bioTopContainer = document.createElement('div');
  bioTopContainer.className = 'bio-top-container';
  const imageColumn = document.createElement('div');
  imageColumn.className = 'bio-image-column';
  const bioImage = document.createElement('img');
  bioImage.src = 'assets/img/bio_image.jpeg';
  bioImage.alt = 'Grant Eubanks';
  bioImage.className = 'bio-image';
  imageColumn.appendChild(bioImage);
  bioTopContainer.appendChild(imageColumn);
  const textColumn = document.createElement('div');
  textColumn.className = 'bio-text-column';
  if (paragraphs.length > 0) {
      const firstP = document.createElement('p');
      firstP.textContent = paragraphs[0];
      firstP.className = 'bio-text-paragraph';
      textColumn.appendChild(firstP);
  }
  bioTopContainer.appendChild(textColumn);
  portfolioDocument.appendChild(bioTopContainer);
  if (paragraphs.length > 1) {
    const restTextContainer = document.createElement('div');
    restTextContainer.className = 'bio-rest-text';
    paragraphs.slice(1).forEach(paragraphText => {
        const p = document.createElement('p');
        p.textContent = paragraphText;
        p.className = 'bio-text-paragraph';
        restTextContainer.appendChild(p);
    });
    portfolioDocument.appendChild(restTextContainer);
  }
  portfolioSection.appendChild(portfolioDocument);
  aboutWrapper.appendChild(portfolioSection);
  main.appendChild(aboutWrapper);

  // --- END Portfolio Section ---

  root.appendChild(main); // Add main to #app

  // --- Animate BOTH sections entering ---
  animateNewContent('.grid-section-wrapper', '.entry-grid'); 
  animateNewContent('.about-section-wrapper', '.portfolio-section-panel');

  // Call addBackgroundDoodles AFTER rendering home content
  addBackgroundDoodles(doodlePositionId);
}

// --- Updated Display Projects ---
function displayProjects(root, positionData) {
  root.innerHTML = ''; // Clear #app

  // Create Header
  const header = document.createElement('header');
  header.id = 'page-header';
  const goBack = () => {
    // Animate current content out, then go back
    animateExistingContentOut('#page-content > div', '.entry-grid', () => {
        initHomeView(root, [], null);
    });
  };
  const titleArea = renderTitleArea(positionData.title, 'Projects', goBack);
  header.appendChild(titleArea);
  root.appendChild(header);

  // Create Main Content Area
  const main = document.createElement('main');
  main.id = 'page-content';

  // --- Create Wrapper for Animation ---
  const animationWrapper = document.createElement('div');
  // Optional: Add a class for easier selection if needed, e.g., 'content-animation-wrapper'
  // animationWrapper.className = 'content-animation-wrapper'; 

  // Create Grid (to go inside wrapper)
  const projectContainer = document.createElement('div');
  projectContainer.className = 'entry-grid'; // Use the same grid class

  positionData.projects.forEach(project => {
    const projectClickHandler = (event, projectData) => {
      const clickedCard = event.currentTarget;
      triggerCardTransition(clickedCard, '.entry-grid', () => {
          displayProjectDetail(root, projectData, positionData);
      });
    };
    const projectCard = createEntryCard(project, projectClickHandler);
    projectContainer.appendChild(projectCard);
  });

  // Append grid to wrapper, wrapper to main
  animationWrapper.appendChild(projectContainer);
  main.appendChild(animationWrapper); 
  root.appendChild(main); // Add main to #app

  // --- Animate the wrapper (fade) and project grid (transform) entering ---
  // Use a generic selector for the wrapper if no class was added,
  // otherwise use the specific class (e.g., '.content-animation-wrapper')
  animateNewContent('#page-content > div', '.entry-grid'); // Assumes wrapper is direct child

  // Call addBackgroundDoodles AFTER rendering project list content
  // Use the ID from the positionData passed into this function
  addBackgroundDoodles(positionData.id);
}

// --- Updated Display Project Detail View ---
function displayProjectDetail(root, projectData, positionData) {
  root.innerHTML = ''; // Clear #app

  // --- Header ---
  const header = document.createElement('header');
  header.id = 'page-header';

  // Determine if this is a standalone project/position view
  const isStandalone = projectData === positionData;

  // Define back button behavior WITH animation
  const goBackCallback = () => {
      // Determine where to go back to
      const targetFunction = isStandalone 
          ? () => initHomeView(root, [], null)
          : () => displayProjects(root, positionData);
      
      // Animate current content out, then call target function
      animateExistingContentOut('#page-content > div', '.portfolio-section-panel', targetFunction);
  };

  // Set header subtitle accordingly
  const headerSubtitle = isStandalone ? 'Personal Project/Experience' : positionData.title;
  const titleArea = renderTitleArea(projectData.title, headerSubtitle, goBackCallback);
  header.appendChild(titleArea);
  root.appendChild(header);

  // --- Main Content ---
  const main = document.createElement('main');
  main.id = 'page-content';

  // --- Create Wrapper for Animation ---
  const animationWrapper = document.createElement('div');
  // Optional: Add a class for easier selection if needed
  // animationWrapper.className = 'content-animation-wrapper';

  // Create the section panel (to go inside wrapper)
  const portfolioSection = document.createElement('div');
  portfolioSection.className = 'portfolio-section-panel glass-panel project-detail-panel';

  const portfolioDocument = document.createElement('div');
  portfolioDocument.className = 'portfolio-document';

  // Project Title inside the document
  const portfolioTitle = document.createElement('h2');
  portfolioTitle.textContent = projectData.title; // Use project title
  portfolioTitle.className = 'portfolio-title';
  portfolioDocument.appendChild(portfolioTitle);

  // Placeholder for project content
  const contentPlaceholder = document.createElement('p');
  // Adjust placeholder text if standalone
  contentPlaceholder.textContent = isStandalone
    ? `Details for project/experience "${projectData.title}" will be displayed here. Sample description: ${projectData.description || 'N/A'}` // Adjusted text
    : `Details for project "${projectData.title}" will be displayed here. This project is part of the work at ${positionData.title}. Sample description: ${projectData.description || 'N/A'}`;
  contentPlaceholder.style.textAlign = 'left';
  contentPlaceholder.style.marginTop = '1.5rem'; // Add some space
  portfolioDocument.appendChild(contentPlaceholder);
  // TODO: Add actual project content rendering (markdown, images, etc.)

  // Append document to section, section to wrapper
  portfolioSection.appendChild(portfolioDocument);
  animationWrapper.appendChild(portfolioSection);
  main.appendChild(animationWrapper);
  root.appendChild(main);

  // --- Animate the wrapper (fade) and detail panel (transform) entering ---
  // Use a generic selector for the wrapper if no class was added
  animateNewContent('#page-content > div', '.portfolio-section-panel'); // Assumes wrapper is direct child

  // --- Background Doodles ---
  // Use the parent position's ID for doodles
  addBackgroundDoodles(positionData.id);
}
