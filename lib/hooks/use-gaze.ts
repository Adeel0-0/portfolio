"use client";

import { useEffect, useRef, useState } from "react";

import type { MascotGaze } from "@/components/mascot/mascot-sprite";

const CENTRE: MascotGaze = { x: 0, y: 0 };

/** How far the pointer must be before the gaze saturates, in px. */
const REACH = 520;
/** Easing per frame. Lower is lazier; 1 would snap. */
const EASE = 0.12;
/** Below this, stop the loop entirely rather than chase the last 0.5%. */
const SETTLE = 0.002;

/**
 * Where the mascot is looking, as a normalised and eased vector.
 *
 * Returned in renderer-agnostic units so any sprite can use it: an SVG can
 * translate pupils, a sprite sheet can pick a directional frame, a hybrid can
 * do both. Nothing here knows how the character is drawn.
 *
 * Eased rather than tracked exactly — a pupil that snaps to the cursor looks
 * mechanical, and one that drifts toward it looks alive. The rAF loop stops
 * itself once the gaze has settled, so a still pointer costs nothing.
 */
export function useGaze(
  ref: React.RefObject<HTMLElement>,
  enabled: boolean
): MascotGaze {
  const [gaze, setGaze] = useState<MascotGaze>(CENTRE);
  const target = useRef<MascotGaze>(CENTRE);
  const current = useRef<MascotGaze>(CENTRE);
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setGaze(CENTRE);
      return;
    }

    const step = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;

      if (Math.abs(dx) < SETTLE && Math.abs(dy) < SETTLE) {
        raf.current = 0;
        return;
      }

      current.current = {
        x: current.current.x + dx * EASE,
        y: current.current.y + dy * EASE,
      };
      setGaze(current.current);
      raf.current = requestAnimationFrame(step);
    };

    const handleMove = (event: PointerEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      target.current = {
        x: clamp((event.clientX - originX) / REACH),
        y: clamp((event.clientY - originY) / REACH),
      };

      // Restart the loop only when it has gone idle.
      if (!raf.current) raf.current = requestAnimationFrame(step);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [ref, enabled]);

  return gaze;
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
