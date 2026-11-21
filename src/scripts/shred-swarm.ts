export {};
/*
 * "Shred & rebuild" (Preprint look only): the paper is fed through a
 * shredder, then a swarm of multiplayer cursors rebuilds it.
 *
 * Shred: technique, strip paths, timings and easings adapted from the
 * useLayouts "Paper Shred Button" (https://github.com/iurvish/uselayouts,
 * registry/default/example/paper-shred-button.tsx), ported from React and
 * Motion to the Web Animations API:
 *
 *   MIT License. Copyright (c) 2025 Urvish Mali.
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the
 *   "Software"), to deal in the Software without restriction, including
 *   without limitation the rights to use, copy, modify, merge, publish,
 *   distribute, sublicense, and/or sell copies of the Software, and to permit
 *   persons to whom the Software is furnished to do so, subject to the
 *   following conditions: The above copyright notice and this permission
 *   notice shall be included in all copies or substantial portions of the
 *   Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED.
 *
 * Rebuild: public/swarm-cursors.js (the owner's swarm-cursors tool; see its
 * own credit header), loaded only when a visitor shows intent.
 *
 * The real page is never altered for the rebuild: the shred animates
 * #site-shell, a desk-coloured cover hides the empty desk, the shell is
 * restored underneath, and the swarm snapshots that intact page.
 */

const button = document.querySelector<HTMLButtonElement>("#shred-toggle");
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const pointer = matchMedia("(hover: hover) and (pointer: fine)");

// From the useLayouts component: eleven strips fanning out below the slot.
const SHRED_PATHS = [
  "M22.74,0v59.49c0,3.37-.21,7.86-.53,12.79-1.34,20.7-4.18,32.27-8.35,52.58l-6.96,24.13",
  "M33.65,0v59.49c0,3.37-.17,7.86-.42,12.79-1.07,20.7-3.34,32.27-6.68,52.58l-5.57,24.13",
  "M44.56,0v59.49c0,3.37-.13,7.86-.32,12.79-.8,20.7-2.51,32.27-5.01,52.58l-4.18,24.13",
  "M55.47,0v59.49c0,3.37-.08,7.86-.21,12.79-.54,20.7-1.67,32.27-3.34,52.58l-2.78,24.13",
  "M66.37,0v59.49c0,3.37-.04,7.86-.11,12.79-.27,20.7-.84,32.27-1.67,52.58l-1.39,24.13",
  "M77.28,0v59.49c0,3.37,0,7.86,0,12.79,0,20.7,0,32.27,0,52.58v24.13",
  "M88.19,0v59.49c0,3.37.04,7.86.11,12.79.27,20.7.84,32.27,1.67,52.58l1.39,24.13",
  "M99.1,0v59.49c0,3.37.08,7.86.21,12.79.54,20.7,1.67,32.27,3.34,52.58l2.78,24.13",
  "M110.01,0v59.49c0,3.37.13,7.86.32,12.79.8,20.7,2.51,32.27,5.01,52.58l4.18,24.13",
  "M120.92,0v59.49c0,3.37.17,7.86.42,12.79,1.07,20.7,3.34,32.27,6.68,52.58l5.57,24.13",
  "M131.83,0v59.49c0,3.37.21,7.86.53,12.79,1.34,20.7,4.18,32.27,8.35,52.58l6.96,24.13",
];
const SHRED_MS = 1150; // useLayouts: document clip, 1.15 s
const SHRED_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const STRIP_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const SHREDDED_MS = 1500; // useLayouts: SHRED_COMPLETE_DELAY
const SWARM_SRC = "/swarm-cursors.js";
const SVGNS = "http://www.w3.org/2000/svg";

type Swarm = { start(): void; isRunning(): boolean };
let swarmLoad: Promise<Swarm> | undefined;

/** Load the swarm engine once, with its own button and hotkey switched off. */
function loadSwarm(): Promise<Swarm> {
  swarmLoad ??= new Promise<Swarm>((resolve, reject) => {
    const w = window as unknown as {
      SwarmCursors?: Swarm;
      SwarmCursorsConfig?: Record<string, string>;
    };
    if (w.SwarmCursors) return resolve(w.SwarmCursors);
    w.SwarmCursorsConfig = { trigger: "none", hotkey: "" };
    const script = document.createElement("script");
    script.src = SWARM_SRC;
    script.async = true;
    script.onload = () =>
      w.SwarmCursors ? resolve(w.SwarmCursors) : reject(new Error("no swarm"));
    script.onerror = () => reject(new Error("swarm failed to load"));
    document.head.append(script);
  }).catch((error) => {
    swarmLoad = undefined; // allow a later retry
    throw error;
  });
  return swarmLoad;
}

const available = () =>
  root.dataset.theme !== "f1" &&
  !reduced.matches &&
  pointer.matches &&
  !root.dataset.preloader;

if (button) {
  let busy = false;
  const sync = () => {
    button.hidden = reduced.matches || !pointer.matches;
  };
  sync();
  reduced.addEventListener("change", sync);
  pointer.addEventListener("change", sync);

  const preload = () => {
    if (available()) void loadSwarm().catch(() => {});
  };
  button.addEventListener("pointerenter", preload);
  button.addEventListener("focus", preload);

  button.addEventListener("click", () => {
    if (busy || !available()) return;
    busy = true;
    button.disabled = true;
    void run().finally(() => {
      busy = false;
      button.disabled = false;
    });
  });

  async function run() {
    const shell = document.querySelector<HTMLElement>("#site-shell");
    if (!shell) return;
    const swarm = loadSwarm();
    swarm.catch(() => {}); // handled below; avoid an unhandled rejection

    const vh = innerHeight;
    const slotY = Math.round(vh * 0.62);
    const sheet = document.querySelector("main")?.getBoundingClientRect();
    const width = Math.min(sheet?.width ?? 980, innerWidth);
    const left = sheet ? sheet.left : (innerWidth - width) / 2;
    const height = shell.scrollHeight;
    const top = scrollY;

    // The shredder: a dark slot across the sheet, strips drawn below it.
    const rig = document.createElement("div");
    rig.className = "shred-rig";
    rig.setAttribute("aria-hidden", "true");
    rig.setAttribute("data-swarm-ignore", "");
    const slot = document.createElement("div");
    slot.className = "shred-slot";
    Object.assign(slot.style, {
      top: `${slotY - 6}px`,
      left: `${left - 12}px`,
      width: `${width + 24}px`,
    });
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "shred-strips");
    svg.setAttribute("viewBox", "0 48 154.57 103.52");
    svg.setAttribute("preserveAspectRatio", "none");
    Object.assign(svg.style, {
      top: `${slotY + 8}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${vh - slotY - 8}px`,
    });
    const strips = SHRED_PATHS.map((d) => {
      const path = document.createElementNS(SVGNS, "path");
      path.setAttribute("d", d);
      path.setAttribute("pathLength", "1");
      svg.append(path);
      return path;
    });
    rig.append(slot, svg);
    document.body.append(rig);

    const animations: Animation[] = [];
    const cleanup = () => {
      animations.forEach((a) => a.cancel());
      rig.remove();
      document.removeEventListener("keydown", onKey);
    };
    let aborted = false;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") aborted = true;
    };
    document.addEventListener("keydown", onKey);

    // Feed the visible paper down into the slot; whatever passes the slot is
    // clipped, and nothing above the viewport ever slides into view.
    const inset = (travel: number) =>
      `inset(${top}px 0px ${Math.max(0, height - (top + slotY - travel))}px 0px)`;
    animations.push(
      shell.animate(
        [
          { transform: "translateY(0px)", clipPath: inset(0) },
          { transform: `translateY(${slotY}px)`, clipPath: inset(slotY) },
        ],
        { duration: SHRED_MS, easing: SHRED_EASE, fill: "forwards" },
      ),
      slot.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        fill: "forwards",
      }),
    );
    strips.forEach((strip, index) => {
      animations.push(
        strip.animate(
          [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
          {
            delay: 250 + index * 35,
            duration: 550,
            easing: STRIP_EASE,
            fill: "both",
          },
        ),
        // Fade in as the strip starts drawing, so no round cap shows early.
        strip.animate([{ opacity: 0 }, { opacity: 1 }], {
          delay: 250 + index * 35,
          duration: 180,
          fill: "both",
        }),
        strip.animate(
          [{ transform: "translateY(-4px)" }, { transform: "translateY(0)" }],
          { delay: 180 + index * 25, duration: 500, easing: STRIP_EASE, fill: "both" },
        ),
      );
    });

    await new Promise((done) => setTimeout(done, SHREDDED_MS));
    let engine: Swarm;
    try {
      engine = await swarm;
    } catch {
      cleanup(); // no rebuild available: just give the paper back
      return;
    }
    if (aborted || root.dataset.theme === "f1") {
      cleanup();
      return;
    }

    // Hide the empty desk, restore the real page underneath, then rebuild.
    rig.classList.add("is-covering");
    animations.forEach((a) => a.cancel());
    animations.length = 0;
    await new Promise((done) => requestAnimationFrame(() => done(null)));
    engine.start();
    const ended = new Promise((done) =>
      addEventListener("swarm:exit", () => done(null), { once: true }),
    );
    setTimeout(cleanup, 700); // the swarm's own overlay is up by now
    if (engine.isRunning()) await ended;
  }
}
