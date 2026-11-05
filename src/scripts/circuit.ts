// F1 pit wall: the timing tower (HTML buttons) is the keyboard and touch path;
// the SVG map and the optional 3D track mirror the same selection.
import type { CircuitSceneHandle, TrackData } from "./circuit-scene";

const stage = document.querySelector<HTMLElement>(".circuit-stage");
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

if (stage) {
  const rows = [...document.querySelectorAll<HTMLButtonElement>(".timing-row")];
  const previews = [...document.querySelectorAll<HTMLElement>("[data-preview]")];
  const marks = [
    ...stage.querySelectorAll<SVGElement>(".circuit-sector, .sector-marker"),
  ];
  const status = document.querySelector<HTMLElement>("#circuit-status")!;
  const toggle3d = document.querySelector<HTMLButtonElement>("#circuit-3d")!;
  const reset = document.querySelector<HTMLButtonElement>("#circuit-reset")!;
  const ids = rows.map((row) => row.dataset.project!);
  const titles = rows.map(
    (row) => row.querySelector(".row-name")?.textContent?.trim() ?? "",
  );
  let pinned = ids[0];
  let scene: CircuitSceneHandle | undefined;
  let loading: AbortController | undefined;

  const show = (id: string) => {
    previews.forEach((p) => (p.hidden = p.dataset.preview !== id));
    marks.forEach((m) => m.classList.toggle("selected", m.dataset.project === id));
    scene?.highlight(ids.indexOf(id));
  };
  const pin = (id: string) => {
    pinned = id;
    rows.forEach((row) =>
      row.setAttribute("aria-pressed", String(row.dataset.project === id)),
    );
    show(id);
    scene?.focusSector(ids.indexOf(id));
    const i = ids.indexOf(id);
    status.textContent = `${titles[i]} selected, sector ${i + 1}.`;
  };
  // Hover previews only for a mouse; touch and keyboard select explicitly.
  const preview = (event: PointerEvent, id: string) => {
    if (event.pointerType === "mouse") show(id);
  };

  rows.forEach((row, i) => {
    row.addEventListener("click", () => pin(ids[i]));
    row.addEventListener("pointerenter", (e) => preview(e, ids[i]));
    row.addEventListener("pointerleave", () => show(pinned));
    row.addEventListener("keydown", (event) => {
      const next =
        event.key === "ArrowDown" ? i + 1
        : event.key === "ArrowUp" ? i - 1
        : event.key === "Home" ? 0
        : event.key === "End" ? rows.length - 1
        : undefined;
      if (next === undefined) return;
      event.preventDefault();
      const target = (next + rows.length) % rows.length;
      rows[target].focus();
      pin(ids[target]);
    });
  });
  marks.forEach((mark) => {
    const id = mark.dataset.project!;
    mark.addEventListener("pointerenter", (e) => preview(e as PointerEvent, id));
    mark.addEventListener("pointerleave", () => show(pinned));
    mark.addEventListener("click", () => pin(id));
  });

  const close = (message?: string) => {
    loading?.abort();
    loading = undefined;
    scene?.dispose();
    scene = undefined;
    stage.classList.remove("is-3d");
    toggle3d.setAttribute("aria-pressed", "false");
    toggle3d.textContent = "3D track";
    reset.hidden = true;
    if (message) status.textContent = message;
  };
  const webglAvailable = () => {
    try {
      const probe = document.createElement("canvas");
      return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
    } catch {
      return false;
    }
  };
  const open = async () => {
    if (!webglAvailable()) {
      toggle3d.disabled = true;
      status.textContent =
        "The 3D track needs WebGL, which is not available here. The map shows the same circuit.";
      return;
    }
    const abort = new AbortController();
    loading = abort;
    toggle3d.setAttribute("aria-pressed", "true");
    toggle3d.textContent = "Close 3D";
    status.textContent = "Loading the 3D track…";
    try {
      const { createCircuitScene } = await import("./circuit-scene");
      if (abort.signal.aborted || root.dataset.theme !== "f1") return;
      const data = JSON.parse(stage.dataset.track!) as TrackData;
      scene = createCircuitScene(stage, data, {
        selected: ids.indexOf(pinned),
        reducedMotion: () => reduced.matches,
        onSelect: (i) => pin(ids[i]),
        onLost: () =>
          close("The 3D view stopped. The map shows the same circuit."),
      });
      loading = undefined;
      stage.classList.add("is-3d");
      reset.hidden = false;
      status.textContent =
        "3D track ready. Drag sideways to turn it, or choose a project in the timing list.";
    } catch {
      if (!abort.signal.aborted)
        close("The 3D track could not load. The map shows the same circuit.");
    }
  };

  toggle3d.addEventListener("click", () => {
    if (scene || loading) close("3D track closed.");
    else void open();
  });
  reset.addEventListener("click", () => scene?.resetView());
  stage.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && scene) {
      close("3D track closed.");
      toggle3d.focus();
    }
  });
  // Leaving F1 mode, the page, or the tab releases all GPU resources.
  new MutationObserver(() => {
    if (root.dataset.theme !== "f1" && (scene || loading)) close();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("pagehide", () => close());
}
