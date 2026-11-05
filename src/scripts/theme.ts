import { writeStorage } from "../../lib/storage";
import { parseTheme, ThemeSession, THEME_COLORS } from "../lib/theme-state";
import type { SceneHandle } from "./f1-scene";
import { BOOT } from "../lib/boot-sequence";

const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>("#theme-toggle");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

if (toggle) {
  const state = new ThemeSession(parseTheme(root.dataset.theme ?? null));
  let sceneModule: Promise<typeof import("./f1-scene")> | undefined;
  let scene: SceneHandle | undefined;
  let preparation: AbortController | undefined;
  let overlay: HTMLDivElement | undefined;
  let skip: HTMLButtonElement | undefined;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let animations: Animation[] = [];
  let started = 0;
  let path = "instant";

  function load() {
    if (!sceneModule)
      sceneModule = import("./f1-scene").catch((error) => {
        sceneModule = undefined;
        throw error;
      });
    return sceneModule;
  }
  function prepareIntent() {
    if (state.desired !== "professional" || state.active) return;
    // Fetch the F1 face before the switch so its text does not re-flow later.
    void document.fonts?.load('800 16px "Saira"').catch(() => {});
    if (!reduced.matches) void load().catch(() => {});
  }
  // The two modes have different compositions, so a pixel offset means
  // nothing after a switch. Keep the visitor on the matching section instead.
  type Anchor =
    | { key: string; offset: number; element?: undefined }
    | { element: Element; offset: number; key?: undefined };
  const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
  function sectionInView(): Anchor | undefined {
    if (scrollY < 40) return undefined;
    const line = 120;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-section]")]
      .filter(visible);
    if (sections.length) {
      // Home: the two modes show different sections, matched by key.
      let current: HTMLElement | undefined;
      for (const section of sections)
        if (section.getBoundingClientRect().top <= line) current = section;
      if (!current) return undefined;
      return {
        key: current.dataset.section!.split(" ")[0],
        offset: current.getBoundingClientRect().top,
      };
    }
    // Other pages show the same elements in both modes: keep the first
    // project or heading that is on screen exactly where it is.
    const element = [
      ...document.querySelectorAll("main :is([data-project], h1, h2, h3, figure)"),
    ]
      .filter((el) => visible(el) && el.getBoundingClientRect().bottom > line)
      .sort(
        (a, b) =>
          Math.abs(a.getBoundingClientRect().top - line) -
          Math.abs(b.getBoundingClientRect().top - line),
      )[0];
    return element
      ? { element, offset: element.getBoundingClientRect().top }
      : undefined;
  }
  function restoreSection(anchor: Anchor | undefined) {
    if (!anchor) return;
    const match = anchor.element
      ? anchor.element
      : [...document.querySelectorAll<HTMLElement>("[data-section]")].find(
          (s) => visible(s) && s.dataset.section!.split(" ").includes(anchor.key),
        );
    if (!match || !visible(match)) return;
    const drift = match.getBoundingClientRect().top - anchor.offset;
    if (Math.abs(drift) > 2)
      scrollTo({ top: Math.max(0, scrollY + drift), behavior: "instant" });
  }
  // Keep an explicit ?mode= link truthful after the visitor switches.
  function syncUrl() {
    const url = new URL(location.href);
    if (!url.searchParams.has("mode")) return;
    url.searchParams.set("mode", state.desired === "f1" ? "f1" : "minimal");
    history.replaceState(history.state, "", url);
  }
  function commit() {
    const anchor = sectionInView();
    // Native scroll anchoring would adjust again on the next frame, relative to
    // a different node, so it is paused while the section is restored here.
    if (anchor) root.style.setProperty("overflow-anchor", "none");
    root.dataset.theme = state.desired;
    restoreSection(anchor);
    if (anchor)
      requestAnimationFrame(() => {
        restoreSection(anchor); // late layout such as decoded images
        root.style.removeProperty("overflow-anchor");
      });
    syncUrl();
    toggle!.setAttribute("aria-pressed", String(state.desired === "f1"));
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[state.desired]);
    writeStorage("local", "portfolio-theme", state.desired);
  }
  function settle() {
    if (!state.active) return;
    commit();
    state.finish(); // Invalidates any outstanding imports / shader preparation.
    preparation?.abort();
    preparation = undefined;
    timers.forEach(clearTimeout);
    timers = [];
    animations.forEach((animation) => animation.cancel());
    animations = [];
    scene?.dispose();
    scene = undefined;
    const restoreFocus = document.activeElement === skip;
    overlay?.remove();
    overlay = undefined;
    skip?.remove();
    skip = undefined;
    root.classList.remove("theme-transitioning");
    root.dataset.transition = "idle";
    if (restoreFocus) toggle!.focus({ preventScroll: true });
    const announcement = document.querySelector("#theme-announcement");
    if (announcement)
      announcement.textContent =
        state.desired === "f1"
          ? "F1 mode enabled"
          : "Minimal mode enabled";
    document.dispatchEvent(
      new CustomEvent("portfolio:transition-end", {
        detail: {
          theme: state.desired,
          path,
          duration: performance.now() - started,
        },
      }),
    );
  }
  function later(id: number, callback: () => void, delay: number) {
    timers.push(
      setTimeout(
        () => {
          if (state.isCurrent(id)) callback();
        },
        Math.max(0, delay),
      ),
    );
  }
  function animate(
    element: Element,
    frames: Keyframe[],
    options: KeyframeAnimationOptions,
  ) {
    const animation = element.animate(frames, options);
    animations.push(animation);
    return animation;
  }
  function sweep(id: number, duration: number) {
    if (!overlay) return;
    root.dataset.transition = "settling";
    overlay.querySelector<HTMLElement>(".starting-lights")!.style.display =
      "none";
    overlay.querySelector<HTMLElement>(".transition-caption")!.style.display =
      "none";
    commit();
    animate(
      overlay,
      [
        { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" },
        { clipPath: "polygon(120% 0,100% 0,100% 100%,100% 100%)" },
      ],
      { duration, easing: "cubic-bezier(.65,0,.2,1)", fill: "forwards" },
    );
    later(id, settle, duration);
  }
  async function request() {
    document.dispatchEvent(new Event(BOOT.cancelEvent));
    const { id, target, interrupted } = state.request();
    if (interrupted) {
      path = "interrupted";
      settle();
      return;
    }
    started = performance.now();
    if (reduced.matches) {
      path = "reduced";
      settle();
      return;
    }
    path = target === "f1" ? "fallback" : "return";
    const abort = new AbortController();
    preparation = abort;
    root.dataset.transition = "preparing";
    root.classList.add("theme-transitioning");
    overlay = document.createElement("div");
    overlay.className = "f1-overlay";
    overlay.setAttribute("aria-hidden", "true");
    const lights = document.createElement("div");
    lights.className = "starting-lights";
    for (let i = 0; i < 5; i++) lights.append(document.createElement("i"));
    const caption = document.createElement("div");
    caption.className = "transition-caption";
    caption.textContent = "LIGHTS OUT";
    const stripe = document.createElement("div");
    stripe.className = "launch-stripe";
    overlay.append(lights, caption, stripe);
    overlay.addEventListener("click", (event) => {
      event.stopPropagation();
      settle();
    });
    skip = document.createElement("button");
    skip.type = "button";
    skip.className = "transition-skip";
    skip.textContent = "Skip animation";
    skip.addEventListener("click", settle);
    document.body.append(overlay, skip);
    animate(overlay, [{ opacity: 0 }, { opacity: 1 }], {
      duration: 100,
      fill: "forwards",
    });
    later(id, settle, 2500);
    if (target === "professional") {
      overlay.classList.add("returning");
      sweep(id, 450);
      return;
    }
    [...lights.children].forEach((light, i) =>
      later(id, () => light.classList.add("lit"), 120 + i * 80),
    );
    let expired = false;
    later(
      id,
      () => {
        if (!scene) {
          expired = true;
          abort.abort();
          sweep(id, 200);
        }
      },
      500,
    );
    later(
      id,
      () => {
        if (!scene || expired) return;
        path = "rich";
        root.dataset.transition = "playing";
        lights.style.display = "none";
        caption.style.display = "none";
        const canvas = overlay?.querySelector("canvas");
        if (canvas) canvas.style.opacity = "1";
        scene.play({
          onReveal: () => {
            if (!state.isCurrent(id) || !overlay) return;
            animate(
              stripe,
              [
                { transform: "translateX(-100%)" },
                { transform: "translateX(100%)" },
              ],
              {
                duration: 500,
                easing: "cubic-bezier(.65,0,.2,1)",
                fill: "forwards",
              },
            );
            sweep(id, 600);
          },
          onComplete: () => {
            if (state.isCurrent(id)) settle();
          },
        });
      },
      650,
    );
    try {
      const module = await load();
      if (!state.isCurrent(id) || expired || reduced.matches || !overlay)
        return;
      const canvas = document.createElement("canvas");
      canvas.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          if (state.isCurrent(id) && !abort.signal.aborted) settle();
        },
        { once: true },
      );
      overlay.prepend(canvas);
      const prepared = await module.prepareScene(canvas, abort.signal);
      if (!state.isCurrent(id) || expired || reduced.matches)
        prepared.dispose();
      else scene = prepared;
    } catch {
      if (state.isCurrent(id) && !expired) {
        expired = true;
        sweep(id, 200);
      }
    }
  }
  toggle.hidden = false;
  toggle.setAttribute("aria-pressed", String(state.desired === "f1"));
  root.dataset.transition = "idle";
  toggle.addEventListener("pointerenter", prepareIntent);
  toggle.addEventListener("focus", prepareIntent);
  toggle.addEventListener("pointerdown", prepareIntent);
  toggle.addEventListener("click", () => {
    void request();
  });
  document.addEventListener("keydown", (event) => {
    if (!state.active || !["Escape", "Tab"].includes(event.key)) return;
    if (event.key === "Escape") event.preventDefault();
    settle();
  });
  window.addEventListener("wheel", settle, { passive: true });
  window.addEventListener("touchmove", settle, { passive: true });
  window.addEventListener("pagehide", settle);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) settle();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) settle();
  });
}
