import { loadMarkdown } from '../utils/md.js';
import { addBackgroundDoodles } from '../app.js';

// phases for double‑diamond projects
const phases = ['intro', 'discover', 'define', 'develop', 'deliver', 'conclusion'];

export async function initProjectView(root, [, slug], doodlePositionId) {
  const metaRes = await fetch(`./content/projects/${slug}/meta.json`);
  const meta = await metaRes.json();

  // Clear root before adding new content
  root.innerHTML = '';

  if (meta.type === 'double') {
    await renderDoubleDiamond(root, slug);
  } else {
    const html = await loadMarkdown(`./content/projects/${slug}/intro.md`);
    root.innerHTML = html;
  }

  // Call addBackgroundDoodles AFTER rendering project content
  // For now, project pages default to 'all' doodles (null ID)
  // We could enhance this later if project meta included position ID
  addBackgroundDoodles(null);
}

async function renderDoubleDiamond(root, slug) {
  let index = 0;

  // Layout elements
  const wrap = document.createElement('div');
  wrap.className = 'diamond-wrap';

  const left = document.createElement('button');
  left.className = 'arrow-btn';
  left.textContent = '←';

  const phaseEl = document.createElement('div');
  phaseEl.className = 'phase';

  const right = document.createElement('button');
  right.className = 'arrow-btn';
  right.textContent = '→';

  wrap.append(left, phaseEl, right);
  root.appendChild(wrap);

  // Load the initial phase content
  await loadPhase(index);

  async function loadPhase(i) {
    const html = await loadMarkdown(`./content/projects/${slug}/${phases[i]}.md`);
    // Using await with GSAP might be tricky, ensure content is set
    return new Promise(resolve => {
        gsap.to(phaseEl, { opacity: 0, duration: 0.2, onComplete: () => {
          phaseEl.innerHTML = html;
          gsap.to(phaseEl, { opacity: 1, duration: 0.2, onComplete: resolve });
        }});
    });
  }

  left.onclick = async () => { index = (index + phases.length - 1) % phases.length; await loadPhase(index); };
  right.onclick = async () => { index = (index + 1) % phases.length; await loadPhase(index); };
  // Initial load is handled above
}