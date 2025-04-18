import { loadMarkdown } from '../utils/md.js';

// phases for double‑diamond projects
const phases = ['intro', 'discover', 'define', 'develop', 'deliver', 'conclusion'];

export async function initProjectView(root, [, slug]) {
  const metaRes = await fetch(`./content/projects/${slug}/meta.json`);
  const meta = await metaRes.json();

  if (meta.type === 'double') {
    renderDoubleDiamond(root, slug);
  } else {
    const html = await loadMarkdown(`./content/projects/${slug}/intro.md`);
    root.innerHTML = html;
  }
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

  async function loadPhase(i) {
    const html = await loadMarkdown(`./content/projects/${slug}/${phases[i]}.md`);
    gsap.to(phaseEl, { opacity: 0, duration: 0.2, onComplete: () => {
      phaseEl.innerHTML = html;
      gsap.to(phaseEl, { opacity: 1, duration: 0.2 });
    }});
  }

  left.onclick = () => { index = (index + phases.length - 1) % phases.length; loadPhase(index); };
  right.onclick = () => { index = (index + 1) % phases.length; loadPhase(index); };
  loadPhase(index);
}