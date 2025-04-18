export async function initHomeView(root) {
// Load positions data
const res = await fetch('./content/positions.json');
const positions = await res.json();

// Grid container
const grid = document.createElement('div');
grid.style.display = 'grid';
grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(240px,1fr))';
grid.style.gap = '2rem';

positions.forEach(pos => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
    <h2>${pos.title}</h2>
    <p>${pos.company} · ${pos.year}</p>
    `;
    card.addEventListener('click', () => {
    gsap.to(card, {
        scale: 3,
        opacity: 0,
        duration: 0.4,
        onComplete: () => (location.hash = `#/project/${pos.id}`),
    });
    });
    grid.appendChild(card);
});

root.appendChild(grid);
}