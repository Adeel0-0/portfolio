/**
 * Where the mascot is looking.
 *
 * Lives in lib/ rather than beside the sprite because lib/hooks/use-gaze.ts
 * produces it, and a hook in the lower layer importing a type from
 * components/ inverts the dependency — lib/ would stop being buildable without
 * the mascot feature. components/mascot/mascot-sprite.ts re-exports it so the
 * sprite contract still reads as one document.
 */

export type MascotGaze = {
  /** -1 (hard left) to 1 (hard right). Already clamped and eased. */
  x: number;
  /** -1 (up) to 1 (down). */
  y: number;
};
