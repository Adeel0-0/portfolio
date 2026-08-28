"use client";

import { useRef } from "react";

import { m, useInView, useReducedMotion } from "@/lib/motion";

/**
 * A transmission waveform above the contact heading.
 *
 * Heights are derived from the index rather than randomised, so the server and
 * the client agree — Math.random() here would be a hydration mismatch for a
 * purely decorative bar chart.
 */

const BARS = 44;

function heightAt(index: number): number {
  // Two out-of-phase sines, so it reads as speech rather than a pattern.
  const wave =
    Math.sin(index * 0.55) * 0.4 + Math.sin(index * 0.21 + 1.2) * 0.35;
  return 18 + Math.abs(wave) * 82;
}

export function RadioWave() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className="flex flex-col gap-3" aria-hidden="true">
      <div className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.24em] text-brand">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        Transmitting
      </div>

      <div className="flex h-10 items-center gap-[3px]">
        {Array.from({ length: BARS }, (_, index) => (
          <m.span
            key={index}
            initial={{ scaleY: 0.08 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0.08 }}
            transition={{
              duration: 0.4,
              // Left-to-right, like a transmission arriving.
              delay: reduced ? 0 : index * 0.018,
              ease: [0.2, 0.8, 0.3, 1],
            }}
            style={{
              height: `${heightAt(index)}%`,
              transformOrigin: "center",
            }}
            className="block w-[3px] rounded-full bg-signal/50"
          />
        ))}
      </div>
    </div>
  );
}
