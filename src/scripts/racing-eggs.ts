// F1-mode easter eggs. Loaded only after F1 mode starts; `stop()` removes every
// listener, timer, frame and element this module created.
import { readStorage, writeStorage } from "../lib/storage";
import {
  RADIO_MESSAGES,
  formatSeconds,
  lightsOutDelay,
  nextRadio,
  ratePitStop,
  rateReaction,
  scrollToSpeed,
  wordDetector,
} from "../lib/racing";

export interface RacingHandle {
  stop(): void;
}

const root = document.documentElement;

export function start(): RacingHandle {
  const cleanups: (() => void)[] = [];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };
  const on = (
    target: EventTarget,
    type: string,
    fn: (event: never) => void,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn as EventListener, options);
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, options));
  };

  // ---------- Team radio toast (shared announcer) ----------
  const toast = document.createElement("div");
  toast.className = "radio-toast";
  toast.setAttribute("role", "status");
  document.body.append(toast);
  cleanups.push(() => toast.remove());
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const say = (label: string, text: string) => {
    toast.replaceChildren();
    const tag = document.createElement("span");
    tag.className = "radio-tag";
    tag.textContent = label;
    toast.append(tag, document.createTextNode(text));
    toast.dataset.open = "true";
    if (toastTimer) {
      clearTimeout(toastTimer);
      timers.delete(toastTimer);
    }
    toastTimer = later(() => delete toast.dataset.open, 4500);
  };

  let radio = -1;
  document.querySelectorAll<HTMLButtonElement>("[data-radio]").forEach((button) => {
    on(button, "click", () => {
      radio = nextRadio(radio);
      say("Team radio", RADIO_MESSAGES[radio]);
    });
  });

  // ---------- DRS: type "drs" anywhere ----------
  const drs = wordDetector("drs");
  on(document, "keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (
      event.metaKey || event.ctrlKey || event.altKey ||
      target?.closest("input, textarea, select, [contenteditable]")
    )
      return;
    if (!drs(event.key)) return;
    const open = root.dataset.drs !== "open";
    if (open) root.dataset.drs = "open";
    else delete root.dataset.drs;
    say("DRS", open ? "Rear wing open. Enjoy the straight." : "DRS closed. Brake zone ahead.");
  });
  cleanups.push(() => delete root.dataset.drs);

  // ---------- Scroll speedometer ----------
  const speedo = document.createElement("div");
  speedo.className = "speedo";
  speedo.setAttribute("aria-hidden", "true");
  speedo.innerHTML =
    '<span class="speedo-gear">N</span><span class="speedo-value">0</span><span class="speedo-unit">km/h</span>';
  speedo.dataset.moving = "false";
  document.body.append(speedo);
  cleanups.push(() => speedo.remove());
  const gearEl = speedo.querySelector<HTMLElement>(".speedo-gear")!;
  const valueEl = speedo.querySelector<HTMLElement>(".speedo-value")!;
  let lastY = scrollY;
  let lastT = performance.now();
  let velocity = 0;
  let frame = 0;
  const tick = () => {
    frame = 0;
    const now = performance.now();
    const dt = Math.max(16, now - lastT);
    const instant = ((scrollY - lastY) / dt) * 1000;
    lastY = scrollY;
    lastT = now;
    velocity = velocity * 0.82 + instant * 0.18;
    const { kmh, gear } = scrollToSpeed(velocity);
    valueEl.textContent = String(kmh);
    gearEl.textContent = gear === 0 ? "N" : String(gear);
    speedo.dataset.moving = kmh > 0 ? "true" : "false";
    if (Math.abs(velocity) > 5) frame = requestAnimationFrame(tick);
    else velocity = 0;
  };
  on(window, "scroll", () => {
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: true });
  cleanups.push(() => cancelAnimationFrame(frame));

  // ---------- Chequered flag at the finish line ----------
  const footer = document.querySelector<HTMLElement>(".site-footer");
  if (footer) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) footer.dataset.finish = "true";
    }, { threshold: 0.25 });
    io.observe(footer);
    cleanups.push(() => {
      io.disconnect();
      delete footer.dataset.finish;
    });
  }

  // ---------- Game: lights-out reaction test ----------
  const lights = document.querySelector<HTMLElement>('[data-game="lights"]');
  if (lights) {
    const button = lights.querySelector<HTMLButtonElement>("[data-lights-action]")!;
    const result = lights.querySelector<HTMLElement>("[data-lights-result]")!;
    const best = lights.querySelector<HTMLElement>("[data-lights-best]")!;
    const lamps = [...lights.querySelectorAll<HTMLElement>(".lamp")];
    const stored = Number(readStorage("local", "racing:lights-best"));
    if (stored > 0) best.textContent = formatSeconds(stored);
    let phase: "idle" | "lighting" | "waiting" | "go" = "idle";
    let goAt = 0;
    const reset = (label: string) => {
      phase = "idle";
      timers.forEach((t) => {
        if (t === toastTimer) return;
        clearTimeout(t);
        timers.delete(t);
      });
      lamps.forEach((l) => l.classList.remove("on"));
      button.textContent = label;
    };
    const press = () => {
      if (phase === "idle") {
        phase = "lighting";
        button.textContent = "Wait for it…";
        result.textContent = "Lights coming on.";
        lamps.forEach((lamp, i) =>
          later(() => phase === "lighting" && lamp.classList.add("on"), 400 + i * 700),
        );
        later(() => {
          if (phase !== "lighting") return;
          phase = "waiting";
          later(() => {
            if (phase !== "waiting") return;
            lamps.forEach((l) => l.classList.remove("on"));
            phase = "go";
            goAt = performance.now();
            button.textContent = "Go!";
          }, lightsOutDelay());
        }, 400 + 4 * 700 + 200);
        return;
      }
      if (phase === "lighting" || phase === "waiting") {
        reset("Try again");
        result.textContent = "Jump start! Five-second penalty. Try again.";
        return;
      }
      const time = performance.now() - goAt;
      reset("Race again");
      result.textContent = `${formatSeconds(time)}. ${rateReaction(time)}`;
      const previous = Number(readStorage("local", "racing:lights-best"));
      if (!(previous > 0) || time < previous) {
        writeStorage("local", "racing:lights-best", String(Math.round(time)));
        best.textContent = formatSeconds(time);
      }
    };
    button.disabled = false;
    on(button, "click", press);
    cleanups.push(() => {
      reset("Start");
      button.disabled = true;
    });
  }

  // ---------- Game: pit stop ----------
  const pit = document.querySelector<HTMLElement>('[data-game="pit"]');
  if (pit) {
    const button = pit.querySelector<HTMLButtonElement>("[data-pit-action]")!;
    const result = pit.querySelector<HTMLElement>("[data-pit-result]")!;
    const best = pit.querySelector<HTMLElement>("[data-pit-best]")!;
    const tyres = [...pit.querySelectorAll<HTMLButtonElement>(".tyre")];
    const stored = Number(readStorage("local", "racing:pit-best"));
    if (stored > 0) best.textContent = formatSeconds(stored);
    let started = 0;
    const setTyres = (enabled: boolean) =>
      tyres.forEach((t) => {
        t.disabled = !enabled;
        t.setAttribute("aria-pressed", "false");
      });
    on(button, "click", () => {
      started = performance.now();
      setTyres(true);
      button.disabled = true;
      result.textContent = "Car in the box. Change all four tyres.";
      tyres[0].focus();
    });
    tyres.forEach((tyre) =>
      on(tyre, "click", () => {
        if (!started || tyre.getAttribute("aria-pressed") === "true") return;
        tyre.setAttribute("aria-pressed", "true");
        const next = tyres.find((t) => t.getAttribute("aria-pressed") !== "true");
        if (next) {
          next.focus();
          return;
        }
        const time = performance.now() - started;
        started = 0;
        tyres.forEach((t) => (t.disabled = true));
        button.disabled = false;
        button.textContent = "Box again";
        button.focus();
        result.textContent = `${formatSeconds(time)}. ${ratePitStop(time)}`;
        const previous = Number(readStorage("local", "racing:pit-best"));
        if (!(previous > 0) || time < previous) {
          writeStorage("local", "racing:pit-best", String(Math.round(time)));
          best.textContent = formatSeconds(time);
        }
      }),
    );
    button.disabled = false;
    cleanups.push(() => {
      started = 0;
      setTyres(false);
      button.disabled = true;
      button.textContent = "Box, box";
    });
  }

  return {
    stop() {
      timers.forEach(clearTimeout);
      timers.clear();
      cleanups.splice(0).reverse().forEach((fn) => fn());
    },
  };
}
