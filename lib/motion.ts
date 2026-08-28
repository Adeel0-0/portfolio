/**
 * The single seam between this codebase and framer-motion.
 *
 * Nothing imports "framer-motion" directly — everything comes through here. The
 * package is mid-rename (framer-motion 11 -> motion 12, which moves the entry
 * point to "motion/react"), and v11 is the last line built against this exact
 * stack: Next 14 on webpack with React 18. When the app moves to React 19 the
 * migration is this file and no other.
 *
 * Note the re-export is `m`, not `motion`. The app renders inside a strict
 * <LazyMotion>, which throws at runtime if anyone reaches for the full `motion`
 * component — so `motion` is intentionally not exported here.
 *
 * `domAnimation` is deliberately absent too: it lives in lib/motion-features.ts
 * so it can be code-split. Exporting it from here would invite a static import
 * and quietly undo the split.
 */

export {
  AnimatePresence,
  LazyMotion,
  m,
  MotionConfig,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export type { MotionValue, Transition, Variants } from "framer-motion";

/**
 * Shared spring presets, so the site's motion reads as one hand.
 *
 * SLAM is deliberately underdamped: critical damping for stiffness 140 at mass
 * 0.9 is around 22, so damping 14 rings past the target and settles back. That
 * overshoot *is* the slam — there are no keyframes and no state machine behind
 * the project media landing, just this.
 */
export const SPRING = {
  /** Project media arriving. Overshoots, then settles. */
  slam: { stiffness: 140, damping: 14, mass: 0.9, restDelta: 0.001 },
  /** General purpose. Critically damped — arrives without ringing. */
  settle: { stiffness: 220, damping: 30, mass: 1 },
  /** Nav notch tracking between icons. Fast and tight; overshoot looks broken. */
  notch: { stiffness: 400, damping: 34, mass: 0.8 },
} as const;

/** Matches the curves the preloader hand-off already uses in globals.css. */
export const EASE = {
  out: [0.2, 0.8, 0.3, 1],
  in: [0.55, 0, 0.85, 0.5],
} as const;
