// Loads the racing easter eggs only while F1 mode is active, and stops them
// (removing everything they added) when the visitor leaves F1.
import type { RacingHandle } from "./racing-eggs";

const root = document.documentElement;
let handle: RacingHandle | undefined;
let ticket = 0;

async function sync() {
  const id = ++ticket;
  if (root.dataset.theme === "f1") {
    if (handle) return;
    try {
      const { start } = await import("./racing-eggs");
      if (id === ticket && root.dataset.theme === "f1" && !handle) handle = start();
    } catch {
      /* Easter eggs are optional. */
    }
  } else {
    handle?.stop();
    handle = undefined;
  }
}
new MutationObserver(() => void sync()).observe(root, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
window.addEventListener("pagehide", () => {
  handle?.stop();
  handle = undefined;
});
void sync();
