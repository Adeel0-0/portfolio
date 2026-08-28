"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/motion";

/**
 * A soft page-wide wash that follows the cursor.
 *
 * Replaces the per-card spotlight this file's predecessor drew: an 18rem
 * radial gradient tight enough to read as a translucent circle sitting on the
 * project rows. This one is sized well past the viewport so its falloff runs
 * off every edge — the page looks lit from wherever the pointer is, with no
 * boundary to notice.
 *
 * Three decisions, all following rules the rest of the codebase already keeps:
 *
 *   Position is a CSS custom property, never React state. A pointermove that
 *   re-rendered would be a render per frame; this costs one style recalc on
 *   one element that never participates in layout.
 *
 *   The blob is moved with `transform`, not by re-positioning the gradient.
 *   Transforms composite, so the move never repaints, and a transition on
 *   transform gives the drift for free. Animating a gradient's position
 *   instead would repaint a viewport-sized area every frame.
 *
 *   Writes are coalesced to one per frame. pointermove fires well above 60Hz
 *   on high-polling-rate mice and each write is a style invalidation.
 *
 * Under prefers-reduced-motion the listener is never bound, so the wash sits
 * at its default position — still lit, just not tracking. On touch there is no
 * pointermove either, and the same default applies.
 *
 * The gradient itself lives in the .cursor-gradient rule in globals.css.
 */
export function CursorGradient() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const el = ref.current;
    if (!el) return;

    const handleMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        el.style.setProperty("--cursor-x", `${event.clientX}px`);
        el.style.setProperty("--cursor-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.removeEventListener("pointermove", handleMove);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-field overflow-hidden"
    >
      <div ref={ref} className="cursor-gradient" />
    </div>
  );
}
