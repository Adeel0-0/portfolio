import { describe, expect, it } from "vitest";

import { contrast, hslToRgb, inkAt, TREATMENTS } from "./portrait-treatments";

/**
 * Covers only the pure helpers and the shape of the treatment table.
 *
 * The renderers themselves need a 2D context and this suite is Node-only by
 * design (see the header of vitest.config.ts). That is the right trade: what
 * can actually break silently here is the colour parsing and the ink mapping,
 * and both are pure.
 */

describe("hslToRgb", () => {
  /**
   * app/globals.css carries the hex for each raw token beside its HSL triplet
   * so drift stays checkable. These assertions are that check, run
   * automatically: if the parser regresses, every pixel treatment renders in
   * flat grey and nothing else in the suite would notice.
   *
   * The tolerance is not slack. Those triplets were produced by converting the
   * hex to HSL and rounding to whole degrees and percents, and that conversion
   * does not round-trip: --rb-bg and --rb-raised come back exactly, while
   * --rb-purple lands 3/255 away on the blue channel. The hex is the design
   * intent, the triplet is what actually ships, and at 3/255 the difference is
   * imperceptible. A genuine parser fault — a swapped channel, a bad hue sector
   * — misses by tens or hundreds, so this still catches everything worth
   * catching.
   */
  const PALETTE_TOLERANCE = 3;

  it.each([
    ["--rb-bg", "hsl(226 55% 6%)", [7, 11, 24]],
    ["--rb-surface", "hsl(224 51% 10%)", [13, 20, 40]],
    ["--rb-raised", "hsl(224 46% 16%)", [22, 32, 60]],
    ["--rb-fg", "hsl(222 39% 94%)", [232, 236, 245]],
    ["--rb-red", "hsl(352 86% 47%)", [225, 17, 44]],
    ["--rb-yellow", "hsl(47 100% 50%)", [255, 200, 0]],
  ] as const)("resolves %s to the hex the palette documents", (_name, css, hex) => {
    const got = hslToRgb(css);
    for (let i = 0; i < 3; i++) {
      expect(Math.abs(got[i] - hex[i])).toBeLessThanOrEqual(PALETTE_TOLERANCE);
    }
  });

  it("is exact for the tokens whose triplets do round-trip", () => {
    expect(hslToRgb("hsl(226 55% 6%)")).toEqual([7, 11, 24]);
    expect(hslToRgb("hsl(224 46% 16%)")).toEqual([22, 32, 60]);
    expect(hslToRgb("hsl(47 100% 50%)")).toEqual([255, 200, 0]);
  });

  it("handles an achromatic token without touching the hue branch", () => {
    expect(hslToRgb("hsl(0 0% 0%)")).toEqual([0, 0, 0]);
    expect(hslToRgb("hsl(0 0% 100%)")).toEqual([255, 255, 255]);
    expect(hslToRgb("hsl(210 0% 50%)")).toEqual([128, 128, 128]);
  });

  it("accepts the fractional percentages getComputedStyle can hand back", () => {
    expect(hslToRgb("hsl(352 86.4% 47.1%)")).toHaveLength(3);
    expect(hslToRgb("hsl( 226  55%  6% )")).toEqual([7, 11, 24]);
  });

  it("falls back to mid-grey rather than throwing on an unparseable token", () => {
    // Documented behaviour, not an accident: readToken() returns "hsl(0 0% 50%)"
    // when a custom property is missing, and a treatment drawing grey beats a
    // treatment that takes the section down.
    for (const bad of ["", "not a colour", "rgb(1,2,3)", "hsl(var(--brand))"]) {
      expect(hslToRgb(bad)).toEqual([128, 128, 128]);
    }
  });
});

describe("contrast", () => {
  it("leaves the pivot untouched at any strength", () => {
    for (const k of [0.5, 1, 1.35, 3]) expect(contrast(0.5, k)).toBe(0.5);
  });

  it("is the identity at k = 1", () => {
    for (const v of [0, 0.25, 0.5, 0.75, 1]) expect(contrast(v, 1)).toBeCloseTo(v);
  });

  it("pushes tones away from the pivot as k grows", () => {
    expect(contrast(0.75, 2)).toBeGreaterThan(0.75);
    expect(contrast(0.25, 2)).toBeLessThan(0.25);
  });

  it("clamps instead of running off either end", () => {
    expect(contrast(0.99, 8)).toBe(1);
    expect(contrast(0.01, 8)).toBe(0);
  });
});

describe("inkAt", () => {
  it("inverts, so the dark end of the photograph is the inked end", () => {
    expect(inkAt(0, 1)).toBeCloseTo(1);
    expect(inkAt(1, 1)).toBeCloseTo(0);
  });

  it("agrees with contrast on the flipped value", () => {
    for (const v of [0, 0.3, 0.5, 0.8, 1]) {
      expect(inkAt(v, 1.35)).toBeCloseTo(contrast(1 - v, 1.35));
    }
  });

  /**
   * The regression this file exists for.
   *
   * portrait.png is a subject on a pale wall: after auto levels roughly 80% of
   * the cropped frame sits above 0.6 luma. Ink the bright end and four fifths
   * of the portrait fills with solid marks and the face becomes a hole. Anyone
   * who "fixes" the inversion out will fail here rather than in review.
   */
  it("leaves a bright background essentially uninked", () => {
    expect(inkAt(0.85, 1.35)).toBeLessThan(0.25);
    expect(inkAt(0.95, 1.4)).toBe(0);
  });

  it("inks the hair and beard end heavily", () => {
    expect(inkAt(0.15, 1.35)).toBeGreaterThan(0.75);
  });
});

describe("TREATMENTS", () => {
  it("leads with the untreated photograph", () => {
    // The slot's job is a face. Everything after it is commentary, and the
    // slideshow relies on index 0 being the render-less slide.
    expect(TREATMENTS[0].id).toBe("photo");
    expect(TREATMENTS[0].render).toBeNull();
  });

  it("gives every other slide something to draw", () => {
    for (const t of TREATMENTS.slice(1)) {
      expect(t.render, `${t.id} has no renderer`).toBeTypeOf("function");
    }
  });

  it("keeps ids unique and every slide labelled", () => {
    expect(new Set(TREATMENTS.map((t) => t.id)).size).toBe(TREATMENTS.length);
    for (const t of TREATMENTS) {
      expect(t.label.length, `${t.id} label`).toBeGreaterThan(0);
      expect(t.note.length, `${t.id} note`).toBeGreaterThan(0);
    }
  });
});
