/**
 * Web Storage that cannot throw.
 *
 * `localStorage` and `sessionStorage` throw on *access*, not just on write, in
 * Safari private browsing and anywhere a visitor has disabled site data. An
 * uncaught throw inside a component effect has no boundary between it and the
 * root, so the failure mode is a blank page — for a persisted UI preference
 * that nobody would miss. Every call here is wrapped; every failure degrades
 * to "nothing stored".
 *
 * Reads return `null` rather than taking a caller-supplied default. A caller
 * already has to handle "nothing stored yet" on a first visit, so a separate
 * "storage is broken" branch would be a distinction without a difference.
 *
 * Safe during SSR: `window` is checked before it is touched, so this can be
 * imported from a component that renders on both sides. It must still only be
 * *called* from an effect — branching on storage during render desyncs
 * hydration, which is a different bug this file does not fix.
 */

type Area = "local" | "session";

/**
 * Reaching for the Storage object is itself the throwing step in Safari
 * private mode, which is why this is guarded separately from the get/set.
 */
function storageFor(area: Area): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(area: Area, key: string): string | null {
  try {
    return storageFor(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(area: Area, key: string, value: string): void {
  try {
    storageFor(area)?.setItem(key, value);
  } catch {
    // Quota exceeded, private mode, or storage disabled. The caller's in-memory
    // state is already updated; all that is lost is persistence across reloads.
  }
}
