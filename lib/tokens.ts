/**
 * Bridge from the CSS token layer into contexts that can't see it.
 *
 * A <canvas> paints with strings, not stylesheets, so anything drawing there
 * needs the palette read out of :root at runtime. The alternative is what
 * components/ui/particle-field.tsx does today — hardcode the colour and let it
 * drift the moment the theme changes — which is exactly the failure this file
 * exists to prevent.
 *
 * Tokens are stored as bare HSL triplets ("226 55% 6%") rather than complete
 * colours, which is what lets Tailwind compose `hsl(var(--x) / <alpha>)`. These
 * helpers put the wrapper back on.
 */

/** Fallback triplet, used when called on the server or before styles resolve. */
const FALLBACK = "0 0% 50%";

function rawToken(name: string): string {
  if (typeof window === "undefined") return FALLBACK;

  // Custom properties compute with var() references already substituted, so
  // an alias like `--brand: var(--rb-red)` resolves to the triplet here.
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || FALLBACK;
}

/**
 * `readToken("--brand")` -> `"hsl(352 86% 47%)"`.
 *
 * Call once on mount and cache. It forces a style resolution, so calling it
 * inside a rAF loop would reintroduce the per-frame layout read this codebase
 * is otherwise careful to avoid.
 */
export function readToken(name: string): string {
  return `hsl(${rawToken(name)})`;
}

/** `readTokenAlpha("--signal", 0.4)` -> `"hsl(47 100% 50% / 0.4)"`. */
export function readTokenAlpha(name: string, alpha: number): string {
  return `hsl(${rawToken(name)} / ${alpha})`;
}

/**
 * Reads several tokens in one pass and hands back a lookup keyed by the name
 * without its leading dashes — `readTokens(["--brand"]).brand`.
 */
export function readTokens<T extends readonly string[]>(
  names: T
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    out[name.replace(/^--/, "")] = readToken(name);
  }
  return out;
}
