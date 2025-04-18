export async function loadMarkdown(path) {
    const text = await fetch(path).then(r => r.text());
    return window.marked ? marked.parse(text) : text; // fallback if CDN missing
  }