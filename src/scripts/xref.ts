export {};
// Preprint cross-references ("Fig. 1", "Table 1", "§2") are ordinary in-page
// links. After the jump, the target briefly takes the highlighter colour so the
// eye finds it. Reduced motion keeps the jump and skips the colour.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let timer: ReturnType<typeof setTimeout> | undefined;
let lit: Element | undefined;

function clear() {
  clearTimeout(timer);
  lit?.classList.remove("pp-flash");
  lit = undefined;
}

document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
    "a.pp-xref",
  );
  const hash = link?.getAttribute("href");
  if (!hash?.startsWith("#") || reduced.matches) return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  clear();
  lit = target;
  target.classList.add("pp-flash");
  timer = setTimeout(clear, 1200);
});
window.addEventListener("pagehide", clear);
