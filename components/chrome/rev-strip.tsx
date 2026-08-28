"use client";

import { useScrollProgress } from "@/components/providers/scroll-provider";
import { m, useReducedMotion, useTransform } from "@/lib/motion";

/**
 * Scroll progress as a steering-wheel shift-light strip.
 *
 * Green through amber to red as the lap builds, then the whole strip flashes
 * blue at the limit — which is what a real rev strip does, and the reason green
 * survives here despite being dropped everywhere else on the site. It is a
 * functional instrument colour, not decoration. The carve-out is isolated in
 * the --led-* tokens so reversing it is one edit in globals.css.
 *
 * Bound entirely to MotionValues, so scrolling repaints these bars without
 * rendering a single React component.
 */

const COUNT = 15;

/** Thirds of the strip, matching a real shift light's ramp. */
function ledClass(index: number): string {
  if (index < 5) return "bg-led-1";
  if (index < 10) return "bg-led-2";
  return "bg-led-3";
}

export function RevStrip() {
  const scrollYProgress = useScrollProgress();
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-strip flex justify-center pt-2"
    >
      <div className="flex items-center gap-[3px] rounded-full border border-border/60 bg-surface/80 px-2 py-1.5">
        {Array.from({ length: COUNT }, (_, index) => (
          <Led
            key={index}
            index={index}
            progress={scrollYProgress}
            flash={!reduced}
          />
        ))}
      </div>
    </div>
  );
}

function Led({
  index,
  progress,
  flash,
}: {
  index: number;
  progress: ReturnType<typeof useScrollProgress>;
  flash: boolean;
}) {
  // Each LED arms over its own slice of the lap, with a short ramp so the strip
  // fills as a wave rather than a row of hard on/off steps.
  const start = index / COUNT;
  const end = (index + 0.75) / COUNT;
  const opacity = useTransform(progress, [start, end], [0.14, 1], {
    clamp: true,
  });

  // The last-LED flash: only in the final half percent of the page.
  const flashOpacity = useTransform(progress, [0.99, 0.995], [0, 1], {
    clamp: true,
  });

  return (
    <span className="relative block h-2.5 w-1.5 overflow-hidden rounded-[2px]">
      <m.span
        style={{ opacity }}
        className={`absolute inset-0 block rounded-[2px] ${ledClass(index)}`}
      />
      <m.span
        style={{ opacity: flashOpacity }}
        className={`absolute inset-0 block rounded-[2px] bg-led-flash ${
          flash ? "animate-led-flash" : ""
        }`}
      />
    </span>
  );
}
