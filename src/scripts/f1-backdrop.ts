// Mounts the animated F1 gradient only in F1 mode, never under reduced motion
// or without WebGL. Minimal never requests React or the gradient code. A CSS
// gradient underneath is the static equivalent.
const root = document.documentElement;
const host = document.querySelector<HTMLElement>("#f1-backdrop");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

if (host) {
  let mounted: { unmount(): void } | undefined;
  let pending = 0;

  // Hardware WebGL only: software renderers (no GPU, many VMs and CI) would
  // spend whole seconds per frame on a full-screen shader.
  const webgl = () => {
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!gl) return false;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(
        info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      );
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    } catch {
      return false;
    }
  };
  const unmount = () => {
    pending++;
    mounted?.unmount();
    mounted = undefined;
    host.replaceChildren();
    host.dataset.state = "static";
  };
  const mount = async () => {
    if (mounted || !webgl()) return;
    const ticket = ++pending;
    try {
      const [{ createElement }, { createRoot }, { default: F1Gradient }] =
        await Promise.all([
          import("react"),
          import("react-dom/client"),
          import("../islands/F1Gradient"),
        ]);
      if (ticket !== pending || !wanted()) return;
      const layer = document.createElement("div");
      layer.className = "f1-backdrop-layer";
      host.replaceChildren(layer);
      const reactRoot = createRoot(layer);
      reactRoot.render(createElement(F1Gradient, { dense: innerWidth < 760 }));
      mounted = reactRoot;
      host.dataset.state = "live";
    } catch {
      if (ticket === pending) unmount(); // the CSS gradient remains
    }
  };
  const wanted = () =>
    root.dataset.theme === "f1" && !reduced.matches && !document.hidden;
  const sync = () => (wanted() ? void mount() : mounted && unmount());

  new MutationObserver(sync).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pagehide", unmount);
  sync();
}
