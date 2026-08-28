"use client";

import { useEffect, useRef, useState } from "react";

import {
  SPRING,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "@/lib/motion";

/**
 * Scroll-linked entrance: the panel arrives at speed, overshoots, and settles.
 *
 * The overshoot is the spring's own underdamping, not choreography. Critical
 * damping for stiffness 140 at mass 0.9 is about 22, so SPRING.slam's damping
 * of 14 rings past the target and comes back. There are no keyframes here and
 * no state machine — the physics is the effect.
 *
 * This hook is also the single place reduced motion is handled for scroll-
 * linked work, and that is deliberate. <MotionConfig reducedMotion="user">
 * does NOT touch MotionValues bound to style: those are value bindings rather
 * than animations, so framer has no hook to suppress them and a slam would
 * still slam at full amplitude. Centralising the branch here means no
 * component can forget it.
 */

type SlamStyle = {
  x: MotionValue<string> | number;
  opacity: MotionValue<number> | number;
};

export function useScrollSlam(direction: 1 | -1): {
  ref: React.RefObject<HTMLDivElement>;
  style: SlamStyle;
  landed: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /**
   * Motion is opt-in after mount, never opt-out.
   *
   * Server-rendered HTML must show the panel already landed. If the offset
   * were the default, a no-JS visitor would get the media parked permanently
   * off to one side, and useReducedMotion() — which returns null on the server
   * and on the first client render — would let one frame of it through even
   * for people who asked for no motion.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** Latched once the panel has arrived, so scrolling back up doesn't re-slam. */
  const [landed, setLanded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  const eased = useSpring(scrollYProgress, SPRING.slam);
  const x = useTransform(eased, [0, 1], [`${direction * 120}%`, "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1], {
    clamp: true,
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value >= 0.98) setLanded(true);
  });

  const animate = mounted && !reduced && !landed;

  return {
    ref,
    style: animate ? { x, opacity } : { x: 0, opacity: 1 },
    landed: landed || !animate,
  };
}
