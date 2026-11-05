import * as THREE from "three";

export interface TrackData {
  points: [number, number][];
  sectors: { marker: [number, number]; from: number; to: number }[];
  projects: string[];
}
export interface CircuitSceneHandle {
  highlight(index: number): void;
  focusSector(index: number): void;
  resetView(): void;
  dispose(): void;
}
interface Options {
  selected: number;
  reducedMotion(): boolean;
  onSelect(index: number): void;
  onLost(): void;
}

const SCALE = 0.022;
const toWorld = ([x, y]: [number, number]) =>
  new THREE.Vector3((x - 300) * SCALE, 0, (y - 200) * SCALE);
const COLORS = {
  idle: new THREE.Color("#4b4f5a"),
  selected: new THREE.Color("#ff3b4e"),
  marker: new THREE.Color("#edf1f7"),
};

/**
 * Original procedural circuit: a ribbon built from the same points as the SVG
 * map. Renders on demand only (no continuous loop), so an idle or hidden view
 * costs nothing.
 */
export function createCircuitScene(
  stage: HTMLElement,
  data: TrackData,
  options: Options,
): CircuitSceneHandle {
  const canvas = document.createElement("canvas");
  canvas.className = "circuit-canvas";
  canvas.setAttribute("aria-hidden", "true");
  stage.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1.5, 0.1, 100);
  const owned: { dispose(): void }[] = [];
  let dead = false;
  let frame = 0;
  let selected = options.selected;

  // Ribbon: two vertices per sample, coloured per sector.
  const perSegment = data.points.length / (data.sectors.at(-1)!.to || 1);
  const sectorOf = (sample: number) => {
    const segment = Math.floor(sample / perSegment);
    return Math.max(
      0,
      data.sectors.findIndex((s) => segment >= s.from && segment < s.to),
    );
  };
  const centre = data.points.map(toWorld);
  const positions: number[] = [];
  const colors = new Float32Array(centre.length * 2 * 3);
  const half = 0.17;
  centre.forEach((p, i) => {
    const next = centre[(i + 1) % centre.length];
    const prev = centre[(i - 1 + centre.length) % centre.length];
    const tangent = next.clone().sub(prev).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(half);
    positions.push(p.x + normal.x, 0, p.z + normal.z, p.x - normal.x, 0, p.z - normal.z);
  });
  const index: number[] = [];
  for (let i = 0; i < centre.length; i++) {
    const a = i * 2;
    const b = ((i + 1) % centre.length) * 2;
    index.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const ribbon = new THREE.BufferGeometry();
  ribbon.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  ribbon.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  ribbon.setIndex(index);
  const ribbonMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  owned.push(ribbon, ribbonMaterial);
  scene.add(new THREE.Mesh(ribbon, ribbonMaterial));

  const grid = new THREE.GridHelper(16, 32, "#263142", "#1a2230");
  grid.position.y = -0.02;
  owned.push(grid.geometry, grid.material as THREE.Material);
  scene.add(grid);

  // Sector markers: a post and a head the visitor can click.
  const postGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
  const headGeometry = new THREE.SphereGeometry(0.13, 20, 14);
  owned.push(postGeometry, headGeometry);
  const heads: THREE.Mesh[] = [];
  const headMaterials: THREE.MeshBasicMaterial[] = [];
  data.sectors.forEach((sector, i) => {
    const at = toWorld(sector.marker);
    const postMaterial = new THREE.MeshBasicMaterial({ color: "#8794a8" });
    const headMaterial = new THREE.MeshBasicMaterial({ color: COLORS.marker });
    owned.push(postMaterial, headMaterial);
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(at.x, 0.35, at.z);
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(at.x, 0.78, at.z);
    head.userData.sector = i;
    heads.push(head);
    headMaterials.push(headMaterial);
    scene.add(post, head);
  });

  // Camera orbits a target on a fixed tilt; drag changes the azimuth only.
  const overview = { target: new THREE.Vector3(0, 0, 0), radius: 11.5, azimuth: 0.35 };
  const view = { target: overview.target.clone(), radius: overview.radius, azimuth: overview.azimuth };
  const tilt = 0.95; // radians from vertical
  const place = () => {
    const r = view.radius;
    camera.position.set(
      view.target.x + r * Math.sin(tilt) * Math.sin(view.azimuth),
      view.target.y + r * Math.cos(tilt),
      view.target.z + r * Math.sin(tilt) * Math.cos(view.azimuth),
    );
    camera.lookAt(view.target);
  };
  const render = () => {
    frame = 0;
    if (dead) return;
    place();
    renderer.render(scene, camera);
  };
  const request = () => {
    if (!frame && !dead) frame = requestAnimationFrame(render);
  };
  let tween = 0;
  const travel = (target: THREE.Vector3, radius: number) => {
    cancelAnimationFrame(tween);
    if (options.reducedMotion()) {
      view.target.copy(target);
      view.radius = radius;
      request();
      return;
    }
    const from = { target: view.target.clone(), radius: view.radius };
    const start = performance.now();
    const step = (now: number) => {
      if (dead) return;
      const t = Math.min(1, (now - start) / 650);
      const e = 1 - (1 - t) ** 3;
      view.target.lerpVectors(from.target, target, e);
      view.radius = from.radius + (radius - from.radius) * e;
      render();
      if (t < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };

  const highlight = (i: number) => {
    selected = i;
    for (let s = 0; s < centre.length; s++) {
      const c = sectorOf(s) === i ? COLORS.selected : COLORS.idle;
      colors.set([c.r, c.g, c.b, c.r, c.g, c.b], s * 6);
    }
    ribbon.attributes.color.needsUpdate = true;
    headMaterials.forEach((m, h) =>
      m.color.copy(h === i ? COLORS.selected : COLORS.marker),
    );
    request();
  };

  const size = () => {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    request();
  };
  const resize = new ResizeObserver(size);

  // Horizontal drag turns the track; vertical swipes keep scrolling the page
  // (the canvas uses touch-action: pan-y). A short press selects a marker.
  let drag: { id: number; x: number; y: number; azimuth: number; moved: boolean } | undefined;
  const pointer = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const down = (e: PointerEvent) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, azimuth: view.azimuth, moved: false };
  };
  const move = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      canvas.setPointerCapture(e.pointerId);
    }
    if (drag.moved) {
      view.azimuth = drag.azimuth - dx * 0.008;
      request();
    }
  };
  const up = (e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    const wasDrag = drag.moved;
    drag = undefined;
    if (wasDrag) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(heads)[0];
    if (hit) options.onSelect(hit.object.userData.sector as number);
  };
  const cancel = () => (drag = undefined);
  const lost = (event: Event) => {
    event.preventDefault();
    options.onLost();
  };

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("webglcontextlost", lost);
  resize.observe(stage);
  size();
  highlight(selected);
  render();

  const dispose = () => {
    if (dead) return;
    dead = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(tween);
    resize.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", cancel);
    canvas.removeEventListener("webglcontextlost", lost);
    owned.forEach((resource) => resource.dispose());
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  return {
    highlight,
    focusSector(i) {
      highlight(i);
      // Lean towards the sector while keeping the whole circuit in view.
      travel(toWorld(data.sectors[i].marker).multiplyScalar(0.45), 9.5);
    },
    resetView() {
      view.azimuth = overview.azimuth;
      travel(overview.target, overview.radius);
    },
    dispose,
  };
}
