"use client";

import { useRef } from "react";

import { m, useInView } from "@/lib/motion";

/**
 * The hairline beside a section eyebrow, wiping across as the section arrives —
 * the way a timing screen draws a sector line when a car crosses the marker.
 *
 * `once: true` because a line that re-draws every time you scroll past reads as
 * a glitch rather than an event. Reduced motion is handled by MotionConfig,
 * which turns the declarative animate into an opacity change.
 */
export function SectorSweep({ sector }: { sector: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });

  return (
    <span ref={ref} className="flex flex-1 items-center gap-3">
      <span className="relative h-px flex-1 overflow-hidden bg-border">
        <m.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1] }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-0 block bg-signal"
        />
      </span>
      <span className="font-mono text-[0.625rem] tracking-[0.2em] text-muted-foreground">
        S{sector}
      </span>
    </span>
  );
}
