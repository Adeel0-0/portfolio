/**
 * The scan treatments the About portrait cycles through.
 *
 * Browser-only — every one of these needs a 2D context. They read from the
 * sampled grid that lib/portrait-field.ts produces and never touch the source
 * image, so the expensive part (decode, crop, progressive downscale, auto
 * levels) happens once for the whole set rather than once per treatment.
 *
 * Two families live here, and the split is deliberate:
 *
 *   · Pixel treatments (dither, duotone, riso) build an ImageData at *field*
 *     resolution, put it on an offscreen canvas, and let drawImage scale it up
 *     to the display canvas. Writing 546k pixels by hand on every slide change
 *     to get the same picture would be about six times the work for no visible
 *     gain, and the upscale is where dither gets its hard edges from anyway
 *     (smoothing off) while duotone gets its softness (smoothing on).
 *
 *   · Mark treatments (ascii, halftone) draw glyphs and arcs directly at
 *     display resolution and sample the field underneath them, because their
 *     marks need to be crisp at device pixels — rasterising them small and
 *     scaling up is exactly how you get mush.
 *
 * Palette. These stay inside the site's colour discipline (see the header of
 * app/globals.css): navy ground, off-white ink. The one carve-out is the red
 * plate in `riso`, which needs two inks that are actually distinguishable or
 * the misregistration it is built on reads as a printing fault rather than a
 * choice. It is the site's brand red, used here and nowhere else in the set.
 */

import type { PortraitField } from "./portrait-field";

export type TreatmentColors = {
  /** Background the treatment fills. */
  ground: string;
  /** Foreground marks. */
  ink: string;
  /** Second plate in `riso`. */
  accent: string;
};

export type TreatmentArgs = {
  ctx: CanvasRenderingContext2D;
  field: PortraitField;
  /** Canvas size in device pixels, already scaled by DPR. */
  width: number;
  height: number;
  colors: TreatmentColors;
  /**
   * A resolved font-family list for the mono face.
   *
   * It has to be resolved by the caller, from getComputedStyle. A canvas font
   * string is parsed by the canvas, not by the CSS engine, so the
   * `var(--font-jetbrains-mono)` that works in a stylesheet is simply an
   * invalid font shorthand here — the assignment is ignored and the ramp
   * silently renders in the 10px sans-serif default.
   */
  monoFont: string;
};

export type Treatment = {
  id: string;
  /** Chip label under the portrait. */
  label: string;
  /** One line on what the treatment is, for the caption. */
  note: string;
  /**
   * null means "show the untreated photograph". That slide is a real <img>
   * rather than a canvas draw: it is the only one that wants the optimiser's
   * resampling, and routing it through next/image keeps the LCP candidate a
   * plain image element.
   */
  render: ((args: TreatmentArgs) => void) | null;
};

/* ------------------------------------------------------------------ helpers */

/** Pivots on 0.5, so `k > 1` pushes tones apart without shifting mid-grey. */
export function contrast(v: number, k: number): number {
  const t = (v - 0.5) * k + 0.5;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Luminance turned into "how much ink goes here".
 *
 * The mark treatments ink the DARK parts of the photograph, not the bright
 * ones, and this is measured rather than a matter of taste. portrait.png is a
 * subject on a pale wall in a white shirt: after auto levels, 80% of the
 * cropped frame sits above 0.6 luma. Inking brightness directly fills four
 * fifths of the portrait with solid marks and leaves a hole where the face is —
 * the ASCII ramp renders as a block of `@` with a head-shaped gap in it.
 *
 * Inverting puts the marks on the hair, beard, brows and eyes, which is where
 * the likeness actually lives, and leaves the wall as empty ground. On a navy
 * page that also means the portrait floats rather than sitting in a lit box.
 *
 * `duotone` is the exception and does not call this: it is a photographic
 * mapping rather than a mark-making one, so shadows belong at the dark end of
 * its gradient.
 */
export function inkAt(l: number, k: number): number {
  return contrast(1 - l, k);
}

/**
 * `"hsl(226 55% 6%)"` -> `[7, 11, 24]`.
 *
 * lib/tokens.ts hands back hsl() strings because that is what canvas fillStyle
 * wants, but the pixel treatments write into an ImageData and need channels.
 * Parsing the string we just built is cheaper than threading raw triplets
 * through every call site, and it runs a handful of times per slide, not per
 * pixel.
 *
 * A string it cannot parse falls back to mid-grey, which is deliberately the
 * same answer as a genuine mid-grey: there is no in-band way to signal failure
 * to a caller that only wants three channels, and a visible grey portrait is a
 * far better outcome than a throw that takes the whole About section down over
 * a colour. The three exported pure helpers here are covered by
 * lib/portrait-treatments.test.ts.
 */
export function hslToRgb(css: string): [number, number, number] {
  const m = css.match(/hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!m) return [128, 128, 128];
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [
    Math.round(channel(h + 1 / 3) * 255),
    Math.round(channel(h) * 255),
    Math.round(channel(h - 1 / 3) * 255),
  ];
}

/** 8x8 ordered dither matrix, normalised to 0..1. */
const BAYER: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

function offscreen(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("portrait-treatments: no 2d context");
  return { canvas, ctx };
}

/**
 * Paints an ImageData built at field resolution across the whole display
 * canvas.
 *
 * `smooth` is the entire difference between a 1-bit dither that keeps its hard
 * chequer and one that turns into grey soup on the way up.
 */
function blitScaled(
  ctx: CanvasRenderingContext2D,
  image: ImageData,
  width: number,
  height: number,
  smooth: boolean
) {
  const { canvas, ctx: octx } = offscreen(image.width, image.height);
  octx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = smooth;
  if (smooth) ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
}

/** Mean luminance over a rectangle of the field, in field coordinates. */
function cellLuma(
  field: PortraitField,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number {
  const { cols, rows, lum } = field;
  const ax = Math.max(0, Math.min(cols - 1, Math.floor(x0)));
  const ay = Math.max(0, Math.min(rows - 1, Math.floor(y0)));
  const bx = Math.max(ax + 1, Math.min(cols, Math.ceil(x1)));
  const by = Math.max(ay + 1, Math.min(rows, Math.ceil(y1)));

  let sum = 0;
  let n = 0;
  for (let y = ay; y < by; y++) {
    const o = y * cols;
    for (let x = ax; x < bx; x++) {
      sum += lum[o + x];
      n++;
    }
  }
  return n ? sum / n : 0;
}

/* --------------------------------------------------------------- treatments */

const RAMP = " .:-=+*#%@";

/**
 * Luminance mapped to a character ramp, drawn in the site's mono face.
 *
 * Column count is fixed rather than derived from the canvas width: the ramp has
 * to stay legible as *characters* at roughly 320 CSS px, and letting the grid
 * get finer on a high-DPR screen would just make them illegible faster.
 */
function renderAscii({
  ctx,
  field,
  width,
  height,
  colors,
  monoFont,
}: TreatmentArgs) {
  const COLS = 78;
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, 0, width, height);

  const cw = width / COLS;
  // 1.86 is the height/width ratio of a mono cell — close enough for JetBrains
  // Mono that the glyphs tile without visible gaps or overlap.
  const ch = cw * 1.86;
  const rows = Math.ceil(height / ch);

  ctx.fillStyle = colors.ink;
  ctx.textBaseline = "top";
  ctx.font = `${(ch * 1.02).toFixed(2)}px ${monoFont}`;

  const sx = field.cols / COLS;
  const sy = field.rows / rows;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < COLS; i++) {
      const l = inkAt(
        cellLuma(field, i * sx, j * sy, (i + 1) * sx, (j + 1) * sy),
        1.35
      );
      const glyph = RAMP.charAt(Math.round(l * (RAMP.length - 1)));
      if (glyph === " ") continue;
      ctx.fillText(glyph, i * cw, j * ch);
    }
  }
}

/** A rotated dot lattice; dot radius tracks local brightness. */
function renderHalftone({ ctx, field, width, height, colors }: TreatmentArgs) {
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.ink;

  // Scaled off the canvas so the screen stays the same physical coarseness on
  // a 1x and a 2x display.
  const cell = Math.max(5, Math.round(width / 58));
  const angle = (45 * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = width / 2;
  const cy = height / 2;
  const reach = Math.hypot(width, height) / 2 + cell * 2;

  const fx = field.cols / width;
  const fy = field.rows / height;

  ctx.beginPath();
  for (let v = -reach; v <= reach; v += cell) {
    for (let u = -reach; u <= reach; u += cell) {
      const x = cx + u * cos - v * sin;
      const y = cy + u * sin + v * cos;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;

      const gx = Math.min(field.cols - 1, (x * fx) | 0);
      const gy = Math.min(field.rows - 1, (y * fy) | 0);
      const r = inkAt(field.lum[gy * field.cols + gx], 1.3) * cell * 0.72;
      if (r > 0.35) {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
  }
  ctx.fill();
}

/** Ordered Bayer thresholding to exactly two colours. */
function renderDither({ ctx, field, width, height, colors }: TreatmentArgs) {
  const { cols, rows, lum } = field;
  const image = new ImageData(cols, rows);
  const out = image.data;
  const ground = hslToRgb(colors.ground);
  const ink = hslToRgb(colors.ink);

  for (let y = 0; y < rows; y++) {
    const by = y % 8;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const l = inkAt(lum[i], 1.4);
      const on = l + (BAYER[by][x % 8] - 0.5) * 0.85 > 0.5;
      const c = on ? ink : ground;
      const q = i * 4;
      out[q] = c[0];
      out[q + 1] = c[1];
      out[q + 2] = c[2];
      out[q + 3] = 255;
    }
  }
  // Smoothing off: the chequer is the point.
  blitScaled(ctx, image, width, height, false);
}

/** Luminance remapped onto a two-colour gradient, with a little grain. */
function renderDuotone({ ctx, field, width, height, colors }: TreatmentArgs) {
  const { cols, rows, lum } = field;
  const image = new ImageData(cols, rows);
  const out = image.data;
  const shadow = hslToRgb(colors.ground);
  const light = hslToRgb(colors.ink);
  const GRAIN = 0.06;

  for (let i = 0; i < lum.length; i++) {
    let l = contrast(lum[i], 1.2) + (Math.random() - 0.5) * GRAIN;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    const q = i * 4;
    out[q] = shadow[0] + (light[0] - shadow[0]) * l;
    out[q + 1] = shadow[1] + (light[1] - shadow[1]) * l;
    out[q + 2] = shadow[2] + (light[2] - shadow[2]) * l;
    out[q + 3] = 255;
  }
  blitScaled(ctx, image, width, height, true);
}

/**
 * Two thresholded plates, deliberately out of register.
 *
 * Each plate is its own ImageData with a transparent background, drawn at an
 * offset with `lighter` compositing so the overlap brightens the way two
 * translucent inks do on paper rather than one simply hiding the other.
 */
function renderRiso({ ctx, field, width, height, colors }: TreatmentArgs) {
  const { cols, rows, lum } = field;
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, 0, width, height);

  const plate = (threshold: number, css: string, dx: number, dy: number) => {
    const image = new ImageData(cols, rows);
    const out = image.data;
    const ink = hslToRgb(css);

    for (let y = 0; y < rows; y++) {
      const by = y % 8;
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        // The ordered dither around the threshold is what gives the plate its
        // screen texture; a hard cut would give it a posterised edge instead.
        if (inkAt(lum[i], 1) + (BAYER[by][x % 8] - 0.5) * 0.6 <= threshold)
          continue;
        const q = i * 4;
        out[q] = ink[0];
        out[q + 1] = ink[1];
        out[q + 2] = ink[2];
        out[q + 3] = 235;
      }
    }

    const { canvas, ctx: octx } = offscreen(cols, rows);
    octx.putImageData(image, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(canvas, dx, dy, width, height);
    ctx.restore();
  };

  // Misregistration scales with the canvas so it stays the same visual offset.
  const off = Math.max(3, Math.round(width / 90));
  // Light ink carries the broad shape of the subject; red is the second
  // impression over the darkest features only, so the offset between them
  // reads as misregistration rather than as a red face.
  plate(0.34, colors.ink, -off, off * 0.6);
  plate(0.6, colors.accent, off, -off * 0.6);
}

/* ------------------------------------------------------------------- the set */

/**
 * Six slides, curated rather than exhaustive.
 *
 * The wider experiment this came from had eleven. The ones dropped were dropped
 * on the same test: this slot is about 320px wide and the portrait also has to
 * survive being screenshotted into a nav bar or a LinkedIn circle. Stipple and
 * contour turn to mud below roughly 320px; a particle field is the most
 * expensive thing on the page and the most common effect in the genre; CRT
 * split is good for two seconds on hover and hostile as a resting state; mosaic
 * only means anything as a transition. What is left all holds at small sizes
 * and costs one draw each.
 *
 * The photograph leads. Whatever the treatments are doing, a hiring manager is
 * deciding whether you look like someone they want on a call, and the untreated
 * frame is the one that answers that.
 */
export const TREATMENTS: readonly Treatment[] = [
  {
    id: "photo",
    label: "Photo",
    note: "The frame as shot.",
    render: null,
  },
  {
    id: "ascii",
    label: "ASCII",
    note: "Luminance mapped to a character ramp.",
    render: renderAscii,
  },
  {
    id: "halftone",
    label: "Halftone",
    note: "A 45° dot screen, radius tracking brightness.",
    render: renderHalftone,
  },
  {
    id: "dither",
    label: "1-bit",
    note: "Ordered Bayer thresholding to two colours.",
    render: renderDither,
  },
  {
    id: "duotone",
    label: "Duotone",
    note: "Two-point gradient with a little grain.",
    render: renderDuotone,
  },
  {
    id: "riso",
    label: "Riso",
    note: "Two plates, deliberately out of register.",
    render: renderRiso,
  },
] as const;
