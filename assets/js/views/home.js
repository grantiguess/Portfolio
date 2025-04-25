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
    backButton.style.left = '0';
    backButton.style.padding = '0';
    backButton.style.background = 'none';
    backButton.style.border = 'none';
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
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.justifyContent = 'center';
  card.style.alignItems = 'center';
  card.style.textAlign = 'center';
  // card.style.padding = '1rem'; // Padding is now handled by CSS
  const subtitle = card.querySelector('.subtitle');
  const description = card.querySelector('.description');
  if (subtitle) subtitle.style.fontSize = '0.9em';
  if (description) {
     description.style.fontSize = '0.8em';
     description.style.marginTop = '0.5rem';
  }
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
  root.innerHTML = '';
  const titleArea = renderTitleArea('Portfolio', 'Grant Eubanks', null);
  root.appendChild(titleArea);

  if (!window.positionsData) {
    const res = await fetch('./content/positions.json');
    window.positionsData = await res.json();
  }
  const positions = window.positionsData;

  const grid = document.createElement('div');
  grid.className = 'entry-grid'; // Use class for styling
  // Removed inline grid layout styles (display, gridTemplateColumns, gap, padding, width, paddingTop)
  // grid.style.display = 'grid';
  // grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  // grid.style.gap = '2rem';
  // grid.style.padding = '2rem';
  // grid.style.width = 'clamp(400px, 70vw, 800px)';
  // grid.style.paddingTop = '0';

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
  root.appendChild(grid);
}

// --- Modified displayProjects ---
function displayProjects(root, positionData) {
  root.innerHTML = '';
  const goBack = () => {
    initHomeView(root);
  };
  const titleArea = renderTitleArea(positionData.title, null, goBack);
  root.appendChild(titleArea);

  const projectContainer = document.createElement('div');
  projectContainer.className = 'entry-grid'; // Use class for styling
  // Removed inline grid layout styles
  // projectContainer.style.display = 'grid';
  // projectContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
  // projectContainer.style.gap = '2rem';
  // projectContainer.style.padding = '2rem';
  // projectContainer.style.width = 'clamp(400px, 70vw, 800px)';
  // projectContainer.style.paddingTop = '0';

  positionData.projects.forEach(project => {
    const projectCard = createEntryCard(project, null);
    projectContainer.appendChild(projectCard);
  });
  root.appendChild(projectContainer);
}