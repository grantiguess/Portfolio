// --- Helper to Create Title Area (Now handles back button) ---
function renderTitleArea(titleText, subtitleText, backCallback) {
  const titleContainer = document.createElement('div');
  titleContainer.className = 'title-area-container'; // Added class for CSS styling
  // Removed inline styles for display, align, justify, margin, width, position
  // titleContainer.style.display = 'flex';
  // titleContainer.style.alignItems = 'center';
  // titleContainer.style.justifyContent = 'center';
  // titleContainer.style.marginBottom = '2rem';
  // titleContainer.style.width = 'clamp(400px, 70vw, 800px)';
  // titleContainer.style.position = 'relative';

  if (backCallback) {
    const backButton = document.createElement('button');
    backButton.textContent = '←';
    backButton.className = 'arrow-btn';
    backButton.style.fontSize = '2.5rem';
    backButton.style.color = 'inherit';
    backButton.style.userSelect = 'none';
    backButton.style.position = 'absolute'; // Keep absolute positioning for button within flex container
    backButton.style.left = '1rem'; // Added left margin
    backButton.style.padding = '0';
    backButton.style.background = 'none';
    backButton.style.border = 'none';
    backButton.style.cursor = 'pointer'; // Ensure cursor indicates clickable
    backButton.addEventListener('click', backCallback);
    titleContainer.appendChild(backButton);
  }

  const textWrapper = document.createElement('div');
  textWrapper.style.flexGrow = '1';
  textWrapper.style.textAlign = 'center'; // Keep text centering

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
export async function initHomeView(root) {
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
        clickedCard.classList.add('animating');
        gsap.to(clickedCard, {
          scale: 3,
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            clickedCard.classList.remove('animating');
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
}

// --- Modified displayProjects ---
function displayProjects(root, positionData) {
  root.innerHTML = ''; // Clear #app

  // Create Header
  const header = document.createElement('header');
  header.id = 'page-header';
  const goBack = () => {
    initHomeView(root);
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
}