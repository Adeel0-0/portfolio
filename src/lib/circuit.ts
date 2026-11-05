// Geometry for the original, fictional circuit used by F1 mode. The SVG map
// (build time) and the optional 3D track (browser) share these control points,
// so both views always agree about where each sector is.
export type Point = readonly [number, number];

/** Closed loop in a 600 × 400 view box, clockwise from the start line. */
export const CIRCUIT_POINTS: readonly Point[] = [
  [130, 340], [250, 342], [380, 338], [480, 330], [545, 300], [560, 245],
  [528, 200], [462, 176], [418, 132], [440, 84], [398, 46], [330, 52],
  [298, 104], [244, 132], [178, 102], [118, 68], [62, 104], [66, 184],
  [44, 252], [70, 318],
];

const at = (i: number) =>
  CIRCUIT_POINTS[(i + CIRCUIT_POINTS.length) % CIRCUIT_POINTS.length];
const fmt = (n: number) => Number(n.toFixed(1));

/** Catmull-Rom position on segment i (from point i to i + 1), t in [0, 1]. */
export function pointOnSegment(i: number, t: number): Point {
  const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 +
      (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

/** SVG cubic path for points [from, to] (indices wrap around the loop). */
function pathBetween(from: number, to: number): string {
  let d = `M${fmt(at(from)[0])} ${fmt(at(from)[1])}`;
  for (let i = from; i < to; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return d;
}

export interface Sector {
  index: number;
  /** SVG path data for this sector only. */
  d: string;
  /** First and last control-point index (end is exclusive of the next sector). */
  from: number;
  to: number;
  /** A point in the middle of the sector, for its marker and label. */
  marker: Point;
}

/** Split the loop into `count` sectors of (nearly) equal point counts. */
export function sectors(count: number): Sector[] {
  if (!Number.isInteger(count) || count < 1 || count > CIRCUIT_POINTS.length)
    throw new Error("Sector count must be between 1 and the point count");
  const n = CIRCUIT_POINTS.length;
  return Array.from({ length: count }, (_, index) => {
    const from = Math.round((index * n) / count);
    const to = Math.round(((index + 1) * n) / count);
    const middle = from + (to - from) / 2;
    const marker = pointOnSegment(Math.floor(middle), middle % 1);
    return {
      index,
      d: pathBetween(from, to),
      from,
      to,
      marker: [fmt(marker[0]), fmt(marker[1])],
    };
  });
}

/** Evenly sampled loop for the 3D track: `perSegment` samples per segment. */
export function sampleCircuit(perSegment = 12): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < CIRCUIT_POINTS.length; i++)
    for (let s = 0; s < perSegment; s++)
      out.push(pointOnSegment(i, s / perSegment));
  return out;
}
