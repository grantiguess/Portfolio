// Lightweight hash‑router & view loader
import { initHomeView } from './views/home.js';
import { initProjectView } from './views/project.js';

const routes = {
  '': initHomeView,
  '#/position': initHomeView,
  '#/project': initProjectView,
};

function router() {
  const [hash, ...params] = location.hash.split('/');
  const root = document.getElementById('app');
  root.innerHTML = ''; // clear
  (routes[hash] || initHomeView)(root, params);
}
window.addEventListener('hashchange', router);
window.addEventListener('load', router);