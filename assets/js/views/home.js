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
  card.innerHTML = `
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

  // Load positions data
  if (!window.positionsData) {
    const res = await fetch('./content/positions.json');
    window.positionsData = await res.json();
  }
  const positions = window.positionsData;

  // Create Grid (to go inside main)
  const grid = document.createElement('div');
  grid.className = 'entry-grid';

  positions.forEach(pos => {
    const positionClickHandler = (event, positionData) => {
      if (positionData && positionData.projects && positionData.projects.length > 0) {
        const clickedCard = event.currentTarget;

        gsap.to(clickedCard, {
          scale: 3,
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            setTimeout(() => {
              displayProjects(root, positionData);
            }, 200);
          }
        });
      }
    };
    const card = createEntryCard(pos, positionClickHandler);
    grid.appendChild(card);
  });

  main.appendChild(grid); // Add grid to main
  root.appendChild(main); // Add main to #app

  // Call addBackgroundDoodles AFTER rendering home content
  addBackgroundDoodles(doodlePositionId);
}

// --- Modified displayProjects ---
function displayProjects(root, positionData) {
  root.innerHTML = ''; // Clear #app

  // Create Header
  const header = document.createElement('header');
  header.id = 'page-header';
  const goBack = () => {
    // When going back, call initHomeView with null ID
    initHomeView(root, [], null); // Pass null for doodlePositionId
  };
  const titleArea = renderTitleArea(positionData.title, null, goBack);
  header.appendChild(titleArea);
  root.appendChild(header); // Add header to #app

  // Create Main Content Area
  const main = document.createElement('main');
  main.id = 'page-content';

  // Create Grid (to go inside main)
  const projectContainer = document.createElement('div');
  projectContainer.className = 'entry-grid';

  positionData.projects.forEach(project => {
    const projectCard = createEntryCard(project, null);
    projectContainer.appendChild(projectCard);
  });

  main.appendChild(projectContainer); // Add grid to main
  root.appendChild(main); // Add main to #app

  // Call addBackgroundDoodles AFTER rendering project list content
  // Use the ID from the positionData passed into this function
  addBackgroundDoodles(positionData.id);
}