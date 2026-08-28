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
 * This one is a stylised Spa-Francorchamps: recognisable in silhouette (the
 * La Source hairpin, the climb through Eau Rouge, the long Kemmel straight)
 * but deliberately simplified, not a survey-accurate trace.
 */
const CIRCUIT =
  "M 30,88 L 18,88 C 9,88 7,79 14,75 L 30,67 C 36,63 38,57 44,53 L 62,29 C 66,23 74,23 78,27 C 82,31 80,37 76,41 L 68,49 C 61,55 63,62 70,66 L 83,73 C 90,77 90,84 83,86 L 40,89 Z";

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
        <circle cx="30" cy="88" r="2" fill="hsl(var(--muted-foreground))" />
        {/* The car. */}
        <circle
          ref={markerRef}
          cx="30"
          cy="88"
          r="3"
          fill="hsl(var(--signal))"
          className={reduced ? undefined : "animate-led-flash"}
        />
      </svg>
    </div>
  );
}
