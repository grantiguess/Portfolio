// Lightweight hash‑router & view loader
import { initHomeView } from './views/home.js';
import { initProjectView } from './views/project.js';

const allDoodles = [
  'assets/img/cbl_vial.png',
  'assets/img/cbl_glasses.png',
  'assets/img/cbl_flower.png',
  'assets/img/cbl_survey.png',
  'assets/img/red_pyramid.png',
  'assets/img/red_network.png',
  'assets/img/red_yarn.png',
  'assets/img/red_star.png',
  'assets/img/ibm_knoxbox.png',
  'assets/img/ibm_scanner.png',
  'assets/img/ibm_key.png',
  'assets/img/ibm_fire.png',
  'assets/img/hg_tincture.png',
  'assets/img/hg_leaf.png',
  'assets/img/hg_jar.png',
  'assets/img/hg_menu.png'
];

const positionPrefixMap = {
  'ncsu-cbl': 'cbl',
  'hemp-gen': 'hg',
  'ibm-zebulon': 'ibm',
  'redstring': 'red'
};

// Export the function so views can import it
export function addBackgroundDoodles(positionId = null) {
  const container = document.getElementById('doodle-background');
  if (!container) return;
  container.innerHTML = '';

  const positionPrefix = positionId ? positionPrefixMap[positionId] : null;
  const baseDoodleSize = 70;
  const intraCellPadding = 40; 
  const randomPlacementAttempts = 15;
  const rotationBufferMultiplier = 1.8; // Buffer for overlap checks & grid placement
  const randomPlacementBufferMultiplier = 2.2; // Larger buffer for random bounds check

  // Grid setup for initial placement
  const gridRows = 10; 
  const gridCols = 12; 
  const totalCells = gridRows * gridCols;
  const cellWidth = window.innerWidth / gridCols;
  const cellHeight = window.innerHeight / gridRows;

  // Get unique sources and generate instances
  const uniqueDoodlesToUse = positionPrefix
    ? allDoodles.filter(doodle => doodle.startsWith(`assets/img/${positionPrefix}_`))
    : allDoodles;
  if (uniqueDoodlesToUse.length === 0) return;

  let doodleInstances = [];
  uniqueDoodlesToUse.forEach(sourceUrl => {
    // Adjust repeat count based on page type
    const minRepeats = positionId ? 3 : 1; // Min 3 for position pages, 1 for home
    const maxRepeats = positionId ? 5 : 3; // Max 5 for position, max 3 for home
    const repeatCount = minRepeats + Math.floor(Math.random() * (maxRepeats - minRepeats + 1));
    for (let i = 0; i < repeatCount; i++) doodleInstances.push(sourceUrl);
  });
  
  // Shuffle instances
  for (let i = doodleInstances.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doodleInstances[i], doodleInstances[j]] = [doodleInstances[j], doodleInstances[i]];
  }

  // --- Placement --- 
  const placedDoodleBoxes = []; // Store boxes of ALL placed doodles

  // 1. Initial Grid Placement (Place up to N doodles in unique cells)
  const initialGridCount = Math.min(doodleInstances.length, totalCells, 12); // Place max 12 initially via grid
  let availableCellIndices = Array.from({length: totalCells}, (_, k) => k);
  for (let i = availableCellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCellIndices[i], availableCellIndices[j]] = [availableCellIndices[j], availableCellIndices[i]];
  }
  const cellsToUseIndices = availableCellIndices.slice(0, initialGridCount);

  for (let i = 0; i < initialGridCount; i++) {
    const doodleSrc = doodleInstances[i];
    const cellIndex = cellsToUseIndices[i];
    const cellRow = Math.floor(cellIndex / gridCols);
    const cellCol = cellIndex % gridCols;
    const placedBox = placeDoodleInCell(container, doodleSrc, cellRow, cellCol, cellWidth, cellHeight, baseDoodleSize, intraCellPadding, rotationBufferMultiplier);
    if (placedBox) placedDoodleBoxes.push(placedBox);
  }

  // 2. Random Placement for Remaining Doodles (with overlap check)
  const remainingInstances = doodleInstances.slice(initialGridCount);

  remainingInstances.forEach(doodleSrc => {
    let placed = false;
    for (let attempt = 0; attempt < randomPlacementAttempts && !placed; attempt++) {
      const scale = 0.6 + Math.random() * 0.4;
      // Use the specific, larger buffer for calculating random placement bounds
      const randomEffectiveSize = baseDoodleSize * scale * randomPlacementBufferMultiplier;
      const rotation = Math.random() * 60 - 30;

      // Calculate bounds using the larger buffer
      const randTop = Math.random() * (window.innerHeight - randomEffectiveSize);
      const randLeft = Math.random() * (window.innerWidth - randomEffectiveSize);

      // Use the standard buffer for the actual bounding box check
      const standardEffectiveSize = baseDoodleSize * scale * rotationBufferMultiplier;
      const potentialBox = {
        top: randTop,
        left: randLeft,
        bottom: randTop + standardEffectiveSize,
        right: randLeft + standardEffectiveSize
      };

      // Check for overlap with ALL previously placed boxes
      let overlap = false;
      for (const existingBox of placedDoodleBoxes) {
        if (potentialBox.left < existingBox.right &&
            potentialBox.right > existingBox.left &&
            potentialBox.top < existingBox.bottom &&
            potentialBox.bottom > existingBox.top) {
          overlap = true;
          break;
        }
      }

      // If no overlap, place it and store its box
      if (!overlap) {
        const img = document.createElement('img');
        img.src = doodleSrc;
        img.classList.add('background-doodle');
        // Apply random flip here as well
        const flip = Math.random() < 0.5 ? 'scaleX(-1)' : '';
        img.style.top = `${randTop}px`;
        img.style.left = `${randLeft}px`;
        img.style.transform = `rotate(${rotation}deg) scale(${scale}) ${flip}`.trim();
        container.appendChild(img);
        placedDoodleBoxes.push(potentialBox);
        placed = true;
      }
    }
    // If not placed after attempts, it's skipped
  });
}

// Helper function to place a single doodle within a specific CELL
function placeDoodleInCell(container, doodleSrc, cellRow, cellCol, cellWidth, cellHeight, baseDoodleSize, padding, rotationBufferMultiplier) {
  const img = document.createElement('img');
  img.src = doodleSrc;
  img.classList.add('background-doodle');

  const rotation = Math.random() * 60 - 30;
  const scale = 0.6 + Math.random() * 0.4;
  const flip = Math.random() < 0.5 ? 'scaleX(-1)' : ''; // 50% chance to flip
  const effectiveSize = baseDoodleSize * scale * rotationBufferMultiplier;

  const cellTop = cellRow * cellHeight;
  const cellLeft = cellCol * cellWidth;

  const availableHeight = Math.max(0, cellHeight - effectiveSize - 2 * padding);
  const availableWidth = Math.max(0, cellWidth - effectiveSize - 2 * padding);

  const finalTop = cellTop + padding + Math.random() * availableHeight;
  const finalLeft = cellLeft + padding + Math.random() * availableWidth;

  img.style.top = `${finalTop}px`;
  img.style.left = `${finalLeft}px`;
  // Combine rotate, scale, and potentially flip
  img.style.transform = `rotate(${rotation}deg) scale(${scale}) ${flip}`.trim(); 

  container.appendChild(img);

  // Return the calculated bounding box for overlap checking
  return {
    top: finalTop,
    left: finalLeft,
    bottom: finalTop + effectiveSize, // Use effectiveSize which includes buffer
    right: finalLeft + effectiveSize
  };
}

const routes = {
  '': initHomeView,
  '#/position': initHomeView,
  '#/project': initProjectView,
};

function router() {
  const [hash, ...params] = location.hash.split('/');
  const root = document.getElementById('app');
  root.innerHTML = ''; // clear existing page content

  // Determine position ID for doodles
  let doodlePositionId = null;
  if (hash === '#/position' && params.length > 0 && positionPrefixMap[params[0]]) {
    doodlePositionId = params[0];
  } else if (hash === '') { // Explicitly handle home page
      doodlePositionId = null; // Use 'all' doodles
  }
  // Add specific logic for #/project if needed, otherwise defaults to all (null)
  // Currently, project view will implicitly get doodlePositionId = null

  // Call the appropriate view initializer, passing the doodle ID
  (routes[hash] || initHomeView)(root, params, doodlePositionId);

  // // Update doodles *after* view is initialized <-- REMOVED, now handled by view
  // addBackgroundDoodles(doodlePositionId);
}

// Initial load: Call router which handles both view init and doodle init
window.addEventListener('load', router);
// Hash change: Call router again
window.addEventListener('hashchange', router);