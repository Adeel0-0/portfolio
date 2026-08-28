import type { MascotGaze } from "@/lib/mascot-gaze";

/**
 * The contract between the mascot engine and whatever draws it.
 *
 * The split is deliberate and it is the reason the renderer decision could be
 * deferred without blocking the build: the engine owns every behaviour — blink
 * cadence, pose transitions, gaze easing, which radio line belongs to which
 * section, mount gating, mobile hiding — and the sprite owns nothing but
 * pixels. Swapping implementations is one import in components/mascot/index.tsx.
 *
 * Rules every implementation must honour:
 *
 *   · Render a square `size` x `size` box. No margins, no fixed positioning,
 *     and no transform on the root — the engine owns the bob and the entry
 *     animation on the wrapper, and a transform here would fight it.
 *   · Be a pure function of props. No internal timers: the blink interval and
 *     the talk frames are the engine's to schedule, or two mascots on a page
 *     would drift out of sync with each other and with the radio.
 *   · Honour `still` by rendering `pose` as a static frame with no CSS
 *     animation of its own.
 *   · Mark the root aria-hidden. The accessible text comes from the radio
 *     bubble, which is real content; the drawing is decoration.
 */

export type MascotPose =
  | "idle"
  | "blink"
  | "talk-a"
  | "talk-b"
  | "point"
  | "cheer";

/**
 * Re-exported so this file stays the single place to read the sprite contract.
 * MascotGaze is defined in lib/ because lib/hooks/use-gaze.ts produces it, and
 * lib/ must not import from components/.
 *
 * It is imported at the top as well as re-exported here because
 * `export ... from` does not bind the name locally, and MascotSpriteProps
 * below needs it.
 */
export type { MascotGaze };

export type MascotSpriteProps = {
  pose: MascotPose;
  gaze: MascotGaze;
  /** Rendered box in CSS pixels. The renderer maps to its own units. */
  size: number;
  /** True under prefers-reduced-motion. The renderer must not self-animate. */
  still: boolean;
  className?: string;
};

export type MascotSprite = React.ComponentType<MascotSpriteProps>;
