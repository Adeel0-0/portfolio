/**
 * Samples the portrait into the flat numeric grids the scan treatments draw from.
 *
 * Browser-only: every step here needs a 2D canvas. The pure array helpers below
 * (autoLevels, boxBlur, normalize01) are exported separately so they can be
 * unit-tested without a DOM, the way lib/contributions.ts is.
 *
 * One field feeds all the treatments. They differ in how they *draw* depth and
 * luminance, never in how they read them, so sampling lives here rather than
 * being copy-pasted three times.
 */

/** Sub-rectangle of the source image to read, in 0..1 of each axis. */
export type Crop = { x: number; y: number; w: number; h: number };

export type PortraitField = {
  cols: number;
  rows: number;
  /** Perceptual luminance, auto-levelled. 0 = black, 1 = white. */
  lum: Float32Array;
  /** Normalised depth. 1 = nearest the camera. */
  depth: Float32Array;
  /** Interleaved rgb triplets, cols * rows * 3. */
  rgb: Float32Array;
  /**
   * False when `depthSrc` was absent or failed to load and `depth` is the
   * luminance-derived guess. Treatments that claim real geometry should say so
   * in the UI rather than pass an estimate off as a scan — guessing depth from
   * brightness inverts on dark hair and beards, which is precisely the failure
   * this flag exists to keep visible.
   */
  hasRealDepth: boolean;
};

/**
 * A 3:4 window onto portrait.png, which is 311x334 and already framed tight on
 * the head and shoulders.
 *
 * Full height is kept and the width is trimmed to reach 3:4 — 334 * 0.75 = 250
 * of the 311 available columns — then centred. Cropping vertically instead
 * would take the headroom off the top and cut the shoulders, which is what
 * makes a headshot read as a cropped snapshot.
 *
 * This matches the About slot's aspect exactly so nothing is squashed. Adjust
 * here, not at the call sites.
 */
export const DEFAULT_CROP: Crop = { x: 0.097, y: 0, w: 0.806, h: 1 };

/* -------------------------------------------------------------- pure helpers */

const clampIndex = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Rescales in place so the extremes land on 0 and 1. */
export function normalize01(arr: Float32Array): Float32Array {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < lo) lo = arr[i];
    if (arr[i] > hi) hi = arr[i];
  }
  if (hi - lo < 1e-6) {
    arr.fill(0.5);
    return arr;
  }
  for (let i = 0; i < arr.length; i++) arr[i] = (arr[i] - lo) / (hi - lo);
  return arr;
}

/**
 * Percentile-clipped auto levels.
 *
 * A phone photo rarely spans the full 0..1 range — this one is a light shirt on
 * a pale wall, so its histogram is bunched at the top. Without this the
 * treatments spend most of their dynamic range on tones the image never reaches.
 */
export function autoLevels(src: Float32Array, clip: number): Float32Array {
  const out = new Float32Array(src.length);
  if (clip <= 0) {
    out.set(src);
    return out;
  }

  const hist = new Uint32Array(256);
  for (let i = 0; i < src.length; i++) {
    hist[clampIndex(Math.round(src[i] * 255), 0, 255)]++;
  }

  const cut = Math.floor(src.length * clip);
  let lo = 0;
  let hi = 255;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc > cut) {
      lo = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc > cut) {
      hi = i;
      break;
    }
  }

  const base = lo / 255;
  const range = Math.max(1, hi - lo) / 255;
  for (let i = 0; i < src.length; i++) {
    const v = (src[i] - base) / range;
    out[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return out;
}

/**
 * Separable box blur with a running sum — O(n) per pass whatever the radius,
 * where the naive nested-kernel version is O(n * r^2) and stalls at the radii
 * the depth estimate needs.
 */
export function boxBlur(
  src: Float32Array,
  cols: number,
  rows: number,
  radius: number,
  passes = 2
): Float32Array {
  const span = radius * 2 + 1;
  const a = Float32Array.from(src);
  const b = new Float32Array(src.length);

  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < rows; y++) {
      const o = y * cols;
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += a[o + clampIndex(k, 0, cols - 1)];
      for (let x = 0; x < cols; x++) {
        b[o + x] = sum / span;
        sum +=
          a[o + clampIndex(x + radius + 1, 0, cols - 1)] -
          a[o + clampIndex(x - radius, 0, cols - 1)];
      }
    }
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += b[clampIndex(k, 0, rows - 1) * cols + x];
      for (let y = 0; y < rows; y++) {
        a[y * cols + x] = sum / span;
        sum +=
          b[clampIndex(y + radius + 1, 0, rows - 1) * cols + x] -
          b[clampIndex(y - radius, 0, rows - 1) * cols + x];
      }
    }
  }
  return a;
}

/**
 * Fallback depth, used only when no depth map is supplied.
 *
 * An elliptical dome (the head is roughly centred) multiplied by broadly
 * blurred luminance (a front-lit subject is brighter where it faces the
 * camera). Both assumptions are shaky and the second one inverts on dark hair,
 * so anything using this must surface `hasRealDepth: false` rather than present
 * it as measured geometry.
 */
function estimateDepth(lum: Float32Array, cols: number, rows: number): Float32Array {
  const shape = normalize01(boxBlur(lum, cols, rows, Math.max(2, Math.round(cols / 14)), 2));
  const out = new Float32Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = ((x + 0.5) / cols - 0.5) / 0.46;
      const ny = ((y + 0.5) / rows - 0.44) / 0.54;
      const dome = Math.cos(Math.min(1, Math.hypot(nx, ny)) * Math.PI * 0.5);
      out[y * cols + x] = (dome * 0.45 + shape[y * cols + x] * 0.55) * (0.35 + 0.65 * dome);
    }
  }
  return normalize01(boxBlur(out, cols, rows, 1, 1));
}

/* ------------------------------------------------------------------ sampling */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`portrait-field: could not load ${src}`));
    img.src = src;
  });
}

/**
 * Halves repeatedly before the final draw. A single drawImage from 768px to
 * ~120px samples far too sparsely and aliases the beard into noise, which then
 * shows up as false edges in every treatment downstream.
 */
function progressiveDownscale(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  targetW: number,
  targetH: number
): CanvasImageSource {
  let cur = source;
  let w = sw;
  let h = sh;
  while (w > targetW * 2 && h > targetH * 2) {
    w = Math.max(targetW, Math.round(w / 2));
    h = Math.max(targetH, Math.round(h / 2));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) break;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(cur, 0, 0, w, h);
    cur = c;
  }
  return cur;
}

/**
 * Reads `crop` out of `img` into a cols x rows grid.
 *
 * Crop and target size are both given in normalised terms, so a depth map at a
 * different pixel size than the photo still lands on the same grid — no
 * pixel-exact registration between the two files is required.
 */
function sampleImage(
  img: HTMLImageElement,
  cols: number,
  rows: number,
  crop: Crop
): { lum: Float32Array; rgb: Float32Array } {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  const sx = Math.round(crop.x * iw);
  const sy = Math.round(crop.y * ih);
  const sw = Math.round(crop.w * iw);
  const sh = Math.round(crop.h * ih);

  // Cut the crop out first, so the halving below reduces only what we keep.
  const cut = document.createElement("canvas");
  cut.width = sw;
  cut.height = sh;
  const cutCtx = cut.getContext("2d");
  if (!cutCtx) throw new Error("portrait-field: no 2d context");
  cutCtx.imageSmoothingEnabled = true;
  cutCtx.imageSmoothingQuality = "high";
  cutCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const reduced = progressiveDownscale(cut, sw, sh, cols, rows);

  const grid = document.createElement("canvas");
  grid.width = cols;
  grid.height = rows;
  const ctx = grid.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("portrait-field: no 2d context");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(reduced, 0, 0, cols, rows);

  const px = ctx.getImageData(0, 0, cols, rows).data;
  const n = cols * rows;
  const lum = new Float32Array(n);
  const rgb = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = px[i * 4] / 255;
    const g = px[i * 4 + 1] / 255;
    const b = px[i * 4 + 2] / 255;
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return { lum, rgb };
}

export type LoadFieldOptions = {
  src: string;
  depthSrc?: string | null;
  /** Grid width. Rows follow from the crop's aspect. */
  cols?: number;
  crop?: Crop;
};

export async function loadPortraitField({
  src,
  depthSrc = null,
  cols = 128,
  crop = DEFAULT_CROP,
}: LoadFieldOptions): Promise<PortraitField> {
  const img = await loadImage(src);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const aspect = (crop.h * ih) / (crop.w * iw);
  const rows = Math.max(2, Math.round(cols * aspect));

  const { lum: rawLum, rgb } = sampleImage(img, cols, rows, crop);
  const lum = autoLevels(rawLum, 0.005);

  let depth: Float32Array | null = null;
  if (depthSrc) {
    try {
      const depthImg = await loadImage(depthSrc);
      // Same normalised crop, so the two grids line up by construction.
      depth = normalize01(autoLevels(sampleImage(depthImg, cols, rows, crop).lum, 0.005));
    } catch {
      depth = null;
    }
  }

  return {
    cols,
    rows,
    lum,
    rgb,
    depth: depth ?? estimateDepth(lum, cols, rows),
    hasRealDepth: depth !== null,
  };
}
