import { writeStorage } from "../../lib/storage";
import { BOOT, lineFor } from "../lib/boot-sequence";

// The once-per-tab boot terminal, ported from the legacy React preloader.
// SiteLayout's inline gate decides before first paint whether it plays and
// hides the page with html[data-preloader]; this script only takes over when
// that decision was "running". Every exit goes through release(), so a failure
// costs the animation, never the page.

const root = document.documentElement;

function release() {
  document.querySelectorAll(".boot-terminal").forEach((node) => node.remove());
  delete root.dataset.preloader;
  root.style.removeProperty("--pl-launch");
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Rotating particle sphere on a 2D canvas. Returns its stop function. */
function particles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {}; // No 2D context: the backdrop stays plain black.
  // Even spread over a sphere shell: inverse-transform sampling on cos(phi),
  // otherwise points bunch at the poles.
  const points = Array.from({ length: 260 }, () => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.72 + Math.random() * 0.28;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    };
  });
  let raf = 0;
  let angle = 0;
  let last = performance.now();
  let stopped = false;
  const draw = (now: number) => {
    raf = 0;
    // A detached canvas means someone else released the page: stop drawing.
    if (stopped || !canvas.isConnected) return;
    angle += Math.min((now - last) / 1000, 0.05) * 0.22;
    last = now;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const scale = Math.min(w, h) * 0.34;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgb(0, 255, 204)";
    for (const p of points) {
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      const depth = 1 / (2.2 - z); // Cheap perspective divide.
      ctx.globalAlpha = 0.2 + (z + 1) * 0.28;
      ctx.beginPath();
      ctx.arc(
        w / 2 + x * scale * depth * 2,
        h / 2 + p.y * scale * depth * 2,
        Math.max(0.7, depth * 1.5),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
}

function play() {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let interval: ReturnType<typeof setInterval> | undefined;
  let stopParticles = () => {};
  let phase: "running" | "launching" | "done" = "running";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  function stopCounter() {
    clearInterval(interval);
    interval = undefined;
  }
  function removeSkip() {
    window.removeEventListener("pointerdown", dismiss);
    window.removeEventListener("keydown", dismiss);
  }
  function finish() {
    if (phase === "done") return;
    phase = "done";
    stopCounter();
    timers.forEach(clearTimeout);
    stopParticles();
    removeSkip();
    reduced.removeEventListener("change", finish);
    release();
  }
  // Natural end and the skip share one path: write the flag, then dive.
  function dismiss() {
    if (phase !== "running") return;
    writeStorage("session", BOOT.sessionKey, "1");
    phase = "launching";
    stopCounter();
    removeSkip();
    root.dataset.preloader = "launching";
    timers.push(setTimeout(finish, BOOT.launch));
  }

  // Ceiling first, so nothing below can leave the page hidden.
  timers.push(setTimeout(finish, BOOT.failsafe));
  window.addEventListener("pointerdown", dismiss);
  window.addEventListener("keydown", dismiss);
  reduced.addEventListener("change", finish);
  root.style.setProperty("--pl-launch", `${BOOT.launch}ms`);

  const overlay = el("div", "boot-terminal");
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-label", "Loading portfolio");
  const canvas = el("canvas", "boot-particles");
  canvas.setAttribute("aria-hidden", "true");

  const titlebar = el("div", "boot-titlebar");
  titlebar.append(
    el("i", "boot-dot red"),
    el("i", "boot-dot amber"),
    el("i", "boot-dot green"),
    el("span", "boot-title", "sys_init.sh"),
  );
  const banner = el("p", "boot-banner");
  banner.append(
    "Syed Mohammad Adeel OS [Version 10.0.22631.3880]",
    el("br"),
    "(c) 2026. All rights reserved.",
  );
  const typed = el("span");
  const promptLine = el("p", "boot-line");
  promptLine.append(
    el("span", "boot-prompt", "C:\\Users\\Adeel>"),
    typed,
    el("span", "boot-cursor"),
  );
  const body = el("div", "boot-body");
  body.append(banner, promptLine);
  const percent = el("span", "boot-percent", "0%");
  const counter = el("div", "boot-counter");
  counter.append(el("span", "boot-label", "SYSTEM_BOOT"), percent);
  const fill = el("div", "boot-fill");
  const track = el("div", "boot-track");
  track.append(fill);

  const terminal = el("div", "boot-window");
  terminal.append(
    titlebar,
    body,
    counter,
    track,
    el("p", "boot-hint", "Click anywhere to skip"),
  );
  overlay.append(canvas, el("div", "boot-frost"), terminal);
  document.body.append(overlay);
  stopParticles = particles(canvas);

  const render = (progress: number) => {
    typed.textContent = lineFor(progress);
    percent.textContent = `${progress}%`;
    fill.style.width = `${progress}%`;
  };
  // Counter and typing pace off the same clock, so they cannot drift apart.
  const step = 30;
  let ticks = 0;
  render(0);
  interval = setInterval(() => {
    ticks++;
    const progress = Math.min(
      Math.round(((ticks * step) / BOOT.loader) * 100),
      100,
    );
    render(progress);
    if (progress === 100) {
      stopCounter();
      timers.push(setTimeout(dismiss, BOOT.hold));
    }
  }, step);
}

if (root.dataset.preloader === "running") {
  try {
    play();
  } catch {
    release();
  }
}
