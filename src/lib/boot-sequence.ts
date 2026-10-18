// Boot terminal timing and copy, ported from the legacy preloader
// (components/ui/spatial-neural-preloader.tsx). Pure: no DOM, no timers.

// The original seven lines, restored with the original pace (owner request
// 2026-10-18: about three seconds). Two seconds of typing is ~285 ms a line,
// which reads as a boot sequence rather than flicker.
export const BOOT_LINES = [
  "Initializing neural weights...",
  "Loading vector embeddings...",
  "Connecting to PostgreSQL...",
  "Establishing RAG pipelines...",
  "Optimizing model inference...",
  "Bypassing mainframe security...",
  "Access granted.",
] as const;

export const BOOT = {
  /** Counter 0 -> 100 and the typing both pace off this. */
  loader: 2000,
  /** Pause on 100% before the hand-off. */
  hold: 200,
  /** The dive past the camera; boot.css derives every duration from it. */
  launch: 800,
  /** Hard ceiling: the overlay covers the page, so a stuck one is a dead site. */
  failsafe: 5000,
  sessionKey: "preloader:seen",
} as const;

/** Share of each line's slot spent typing; the rest shows it complete. */
const TYPING_SHARE = 0.8;

/** The typed text for a progress percentage, derived rather than stored. */
export function lineFor(progress: number): string {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const pos = (clamped / 100) * BOOT_LINES.length;
  const index = Math.min(Math.floor(pos), BOOT_LINES.length - 1);
  const line = BOOT_LINES[index];
  // Progress moves in whole-percent steps; without the pause at the end of
  // each slot, a line could be replaced before its last characters appear.
  const within = Math.min((pos - index) / TYPING_SHARE, 1);
  return line.slice(0, Math.ceil(within * line.length));
}
