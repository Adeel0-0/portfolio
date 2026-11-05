// Pure helpers for the F1-mode easter eggs. No DOM access, so they run in
// the Node unit tests.

/** Seconds with three decimals, as on a timing screen: 0.231 s. */
export function formatSeconds(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(3)} s`;
}

/** A light-hearted verdict for a starting-lights reaction time. */
export function rateReaction(ms: number): string {
  if (ms < 150) return "Suspiciously quick. Stewards are reviewing it.";
  if (ms < 200) return "Pole-position reflexes.";
  if (ms < 250) return "Front-row start.";
  if (ms < 320) return "Solid launch into turn one.";
  if (ms < 450) return "Bogged down a little. Keep practising.";
  return "Still on the grid. The formation lap is over.";
}

/** A verdict for a four-tyre pit stop. */
export function ratePitStop(ms: number): string {
  if (ms < 2500) return "Record-pace crew.";
  if (ms < 3500) return "Clean stop, back out in position.";
  if (ms < 5000) return "Slow left-rear. You lost a place.";
  return "The crew went for a coffee.";
}

/**
 * Hold time before lights out: between 0.2 s and 3 s, so the moment cannot be
 * anticipated. `random` is injectable for tests.
 */
export function lightsOutDelay(random: () => number = Math.random): number {
  return Math.round(200 + random() * 2800);
}

/** Original, fictional radio lines (not quotes from real broadcasts). */
export const RADIO_MESSAGES = [
  "Box, box. Box this lap for fresh code reviews.",
  "Gap to the car behind is two commits. Keep pushing.",
  "Tyres look good. Build is green. Mode push.",
  "Copy. We are checking the deployment. Stay out.",
  "Rain expected in turn three. Bring an umbrella for the merge.",
  "Fastest sector. Purple everywhere.",
  "Engine mode eleven. Ship it.",
  "Blue flags: let the hotfix through.",
] as const;

/** Next radio line, cycling without immediate repeats. */
export function nextRadio(previous: number): number {
  return (previous + 1) % RADIO_MESSAGES.length;
}

/**
 * Detects a typed word (for example "drs") in a stream of key presses.
 * Returns a feed function that is true on the key completing the word.
 */
export function wordDetector(word: string) {
  const target = word.toLowerCase();
  let typed = "";
  return (key: string): boolean => {
    if (key.length !== 1) return false;
    typed = (typed + key.toLowerCase()).slice(-target.length);
    return typed === target;
  };
}

/**
 * Scroll speed (CSS px per second) shown as a playful road speed, capped at a
 * car's top speed, with the gear that would carry it.
 */
export function scrollToSpeed(pxPerSecond: number): { kmh: number; gear: number } {
  const kmh = Math.min(350, Math.round(Math.abs(pxPerSecond) * 0.09));
  const gear = kmh === 0 ? 0 : Math.min(8, 1 + Math.floor(kmh / 45));
  return { kmh, gear };
}
