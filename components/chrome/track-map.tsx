"use client";

import { useEffect, useRef, useState } from "react";

import { useScrollProgress } from "@/components/providers/scroll-provider";
import { usePreloaderDone } from "@/lib/hooks/use-preloader-done";
import { useMotionValueEvent, useReducedMotion } from "@/lib/motion";

/**
 * The page as a lap: a circuit outline with a car running it as you scroll.
 *
 * Scroll indicator, site map and signature graphic in one object.
 *
 * ── SWAPPING THE CIRCUIT ────────────────────────────────────────────────────
 * `CIRCUIT` is the only thing that needs to change. Any closed path in a
 * 100x100 viewBox works — the marker is positioned with getPointAtLength(), so
 * nothing here is tied to this particular shape.
 *
 * This one is a stylised Buddh International Circuit: recognisable in
 * silhouette (the main straight past the pits, Turn 1 folding right onto the
 * long back straight, the big banked double-apex loop, the esses dropping back
 * down) but deliberately simplified, not a survey-accurate trace.
 *
 * Traced clockwise, which is the direction the circuit is actually run, so the
 * marker travels the way a car would.
 */
const CIRCUIT =
  "M 44,60 L 78,60 C 86,60 91,64 90,69 C 89,73 85,75 80,74 L 31,72 C 25,72 22,67 23,62 L 21,50 C 19,43 13,39 15,33 C 17,26 24,25 29,28 C 35,31 37,36 34,40 C 31,43 27,44 27,48 C 27,52 33,52 36,54 C 40,56 42,57 44,60 Z";

/** Start/finish, on the main straight. The marker's resting position. */
const START = { x: 44, y: 60 };

export function TrackMap() {
  const progress = useScrollProgress();
  const ready = usePreloaderDone();
  const reduced = useReducedMotion();

  const pathRef = useRef<SVGPathElement>(null);
  const coveredRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setLength(path.getTotalLength());
  }, []);

  // Writes straight to the DOM rather than through state: this fires on every
  // scroll frame, and a re-render per frame for two attribute changes would be
  // the most expensive thing on the page.
  useMotionValueEvent(progress, "change", (value) => {
    const path = pathRef.current;
    if (!path || !length) return;

    const point = path.getPointAtLength(value * length);
    markerRef.current?.setAttribute("cx", String(point.x));
    markerRef.current?.setAttribute("cy", String(point.y));
    coveredRef.current?.setAttribute(
      "stroke-dashoffset",
      String(length * (1 - value))
    );
  });

  return (
    <div
      aria-hidden="true"
      data-ready={ready ? "true" : "false"}
      // Bottom-left: the dock owns the centre and the mascot owns the right.
      // Hidden below lg, where there is no room for any of the three.
      className="pointer-events-none invisible fixed bottom-6 left-6 z-strip hidden opacity-0 transition-opacity duration-500 data-[ready=true]:visible data-[ready=true]:opacity-100 lg:block"
    >
      <svg viewBox="0 0 100 100" className="h-24 w-24">
        {/* The lap, unrun. */}
        <path
          ref={pathRef}
          d={CIRCUIT}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* The part already covered, revealed by retracting the dash. */}
        <path
          ref={coveredRef}
          d={CIRCUIT}
          fill="none"
          stroke="hsl(var(--brand))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={length || undefined}
          strokeDashoffset={length || undefined}
        />
        {/* Start/finish line. */}
        <circle
          cx={START.x}
          cy={START.y}
          r="2"
          fill="hsl(var(--muted-foreground))"
        />
        {/* The car. */}
        <circle
          ref={markerRef}
          cx={START.x}
          cy={START.y}
          r="3"
          fill="hsl(var(--signal))"
          className={reduced ? undefined : "animate-led-flash"}
        />
      </svg>
    </div>
  );
}
