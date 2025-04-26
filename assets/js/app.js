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

  container.innerHTML = ''; // Clear existing doodles

  const positionPrefix = positionId ? positionPrefixMap[positionId] : null;

  const baseDoodleSize = 70; // Base size reference
  const gridRows = 9; // Using 9x12 grid again
  const gridCols = 12;
  const totalCells = gridRows * gridCols;
  const intraCellPadding = 40; // Increased padding within cell boundaries

  // Get unique doodle sources for the current context
  const uniqueDoodlesToUse = positionPrefix
    ? allDoodles.filter(doodle => doodle.startsWith(`assets/img/${positionPrefix}_`))
    : allDoodles;

  if (uniqueDoodlesToUse.length === 0) return;

  // --- Determine instances for each unique doodle ---
  let doodleInstances = [];
  uniqueDoodlesToUse.forEach(sourceUrl => {
    const repeatCount = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 times
    for (let i = 0; i < repeatCount; i++) {
      doodleInstances.push(sourceUrl);
    }
  });

  // Shuffle the instances list
  for (let i = doodleInstances.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doodleInstances[i], doodleInstances[j]] = [doodleInstances[j], doodleInstances[i]];
  }

  // Limit instances to the number of available cells
  const instancesToPlaceCount = Math.min(doodleInstances.length, totalCells);
  const instancesToPlace = doodleInstances.slice(0, instancesToPlaceCount);

  // --- Grid Placement Logic --- 

  // Calculate cell dimensions
  const cellWidth = window.innerWidth / gridCols;
  const cellHeight = window.innerHeight / gridRows;

  // Create list of all cell indices
  let availableCellIndices = Array.from({length: totalCells}, (_, k) => k);

  // Shuffle cell indices
  for (let i = availableCellIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCellIndices[i], availableCellIndices[j]] = [availableCellIndices[j], availableCellIndices[i]];
  }

  // Select unique cells for each instance
  const cellsToUseIndices = availableCellIndices.slice(0, instancesToPlaceCount);

  // Place one doodle instance per selected unique cell
  cellsToUseIndices.forEach((cellIndex, instanceIndex) => {
    const doodleSrc = instancesToPlace[instanceIndex];
    if (!doodleSrc) return;

    // Calculate cell row and column from index
    const cellRow = Math.floor(cellIndex / gridCols);
    const cellCol = cellIndex % gridCols;

    // Place the doodle within this specific cell
    placeDoodleInCell(container, doodleSrc, cellRow, cellCol, cellWidth, cellHeight, baseDoodleSize, intraCellPadding);
  });
}

// Helper function to place a single doodle within a specific CELL
function placeDoodleInCell(container, doodleSrc, cellRow, cellCol, cellWidth, cellHeight, baseDoodleSize, padding) {
  const img = document.createElement('img');
  img.src = doodleSrc;
  img.classList.add('background-doodle');

  const rotation = Math.random() * 60 - 30;
  const scale = 0.6 + Math.random() * 0.4;
  const effectiveSize = baseDoodleSize * scale * 1.2; // Include rotation buffer

  // Calculate cell boundaries
  const cellTop = cellRow * cellHeight;
  const cellLeft = cellCol * cellWidth;

  // Calculate available space within the cell, using the increased padding
  const availableHeight = Math.max(0, cellHeight - effectiveSize - 2 * padding);
  const availableWidth = Math.max(0, cellWidth - effectiveSize - 2 * padding);

  // Calculate final position with padding and random offset within available space
  const finalTop = cellTop + padding + Math.random() * availableHeight;
  const finalLeft = cellLeft + padding + Math.random() * availableWidth;

  img.style.top = `${finalTop}px`;
  img.style.left = `${finalLeft}px`;
  img.style.transform = `rotate(${rotation}deg) scale(${scale})`;

  container.appendChild(img);
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