import { describe, expect, it } from "vitest";

import { autoLevels, boxBlur, DEFAULT_CROP, normalize01 } from "./portrait-field";

/**
 * The DOM-free half of lib/portrait-field.ts.
 *
 * That file separates these three out from the sampling code specifically so
 * they could be tested without a canvas; this is the suite it was promising.
 * Everything else there needs a 2D context and stays uncovered by design — see
 * the header of vitest.config.ts.
 */

const f32 = (...xs: number[]) => Float32Array.from(xs);

/**
 * Typed arrays are converted with Array.from before any for-of or spread.
 * tsconfig.json sets no `target`, so it compiles as ES5, where iterating a
 * Float32Array directly needs `downlevelIteration` and is otherwise TS2802.
 * The tests pass either way at runtime — this keeps `tsc --noEmit` green
 * without widening a compiler flag for the whole project.
 */
const near = (a: Float32Array, b: number[]) => {
  expect(Array.from(a).map((v) => Number(v.toFixed(4)))).toEqual(b);
};

describe("normalize01", () => {
  it("stretches the extremes onto 0 and 1", () => {
    near(normalize01(f32(2, 4, 6)), [0, 0.5, 1]);
  });

  it("mutates in place and hands the same array back", () => {
    const src = f32(0, 10);
    expect(normalize01(src)).toBe(src);
    expect(src[1]).toBe(1);
  });

  /**
   * A flat field has no range to stretch, so the honest answer is mid-grey.
   * Dividing by the zero range instead would fill the array with NaN, and a
   * NaN luminance propagates silently all the way to a blank canvas.
   */
  it("returns mid-grey for a flat field rather than dividing by zero", () => {
    near(normalize01(f32(3, 3, 3)), [0.5, 0.5, 0.5]);
    expect(Array.from(normalize01(f32(1, 1)))).not.toContain(NaN);
  });
});

describe("autoLevels", () => {
  it("is a copying identity when the clip is zero", () => {
    const src = f32(0.1, 0.9);
    const out = autoLevels(src, 0);
    expect(out).not.toBe(src);
    near(out, [0.1, 0.9]);
  });

  /**
   * The reason the function exists: a phone photo of a light shirt on a pale
   * wall bunches its histogram at the top, so the treatments would otherwise
   * spend their whole dynamic range on tones the image never reaches.
   */
  it("expands a histogram bunched into a narrow band", () => {
    const src = Float32Array.from({ length: 100 }, (_, i) => 0.7 + (i / 100) * 0.2);
    const out = autoLevels(src, 0.01);

    const vals = Array.from(out);
    expect(Math.min(...vals)).toBeLessThan(0.05);
    expect(Math.max(...vals)).toBeGreaterThan(0.95);
  });

  it("keeps every result inside 0..1 even for the clipped tails", () => {
    const src = Float32Array.from({ length: 200 }, (_, i) => i / 199);
    for (const v of Array.from(autoLevels(src, 0.05))) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("preserves ordering — it levels, it does not reshuffle", () => {
    const out = autoLevels(f32(0.2, 0.4, 0.6, 0.8), 0);
    for (let i = 1; i < out.length; i++) {
      expect(out[i]).toBeGreaterThanOrEqual(out[i - 1]);
    }
  });
});

describe("boxBlur", () => {
  it("leaves a uniform field alone", () => {
    const out = boxBlur(Float32Array.from({ length: 16 }, () => 0.4), 4, 4, 1, 2);
    for (const v of Array.from(out)) expect(v).toBeCloseTo(0.4, 5);
  });

  it("spreads a spike outward without inventing energy", () => {
    const src = new Float32Array(25);
    src[12] = 1; // centre of a 5x5
    const out = boxBlur(src, 5, 5, 1, 1);

    expect(out[12]).toBeLessThan(1);
    expect(out[11]).toBeGreaterThan(0);
    expect(Math.max(...Array.from(out))).toBeLessThanOrEqual(1);
  });

  it("does not darken the edges — the clamp reuses the border sample", () => {
    // A naive implementation treats out-of-bounds as zero and vignettes the
    // whole field, which would then read as depth that is not there.
    const out = boxBlur(Float32Array.from({ length: 25 }, () => 1), 5, 5, 2, 2);
    for (const v of Array.from(out)) expect(v).toBeCloseTo(1, 5);
  });

  it("returns a fresh array and leaves the source untouched", () => {
    const src = f32(1, 0, 1, 0);
    const out = boxBlur(src, 2, 2, 1, 1);
    expect(out).not.toBe(src);
    near(src, [1, 0, 1, 0]);
  });
});

describe("DEFAULT_CROP", () => {
  it("stays inside the image on both axes", () => {
    expect(DEFAULT_CROP.x).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CROP.y).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_CROP.x + DEFAULT_CROP.w).toBeLessThanOrEqual(1);
    expect(DEFAULT_CROP.y + DEFAULT_CROP.h).toBeLessThanOrEqual(1);
  });

  /**
   * The About slot is `aspect-[3/4]`. If the crop's own aspect drifts from that
   * the portrait is quietly stretched, which is the kind of thing nobody spots
   * on their own face. 311x334 is portrait.png's intrinsic size.
   */
  it("resolves to 3:4 against the source, so nothing is squashed", () => {
    const ratio = (DEFAULT_CROP.w * 311) / (DEFAULT_CROP.h * 334);
    expect(ratio).toBeCloseTo(0.75, 2);
  });

  it("keeps the full height, so the crop cannot take the shoulders off", () => {
    expect(DEFAULT_CROP.y).toBe(0);
    expect(DEFAULT_CROP.h).toBe(1);
  });
});
