"use client";

import { useScrollSlam } from "@/lib/hooks/use-scroll-slam";
import { m } from "@/lib/motion";

/**
 * Thin client wrapper that gives its children the slam.
 *
 * Deliberately takes `children` as a prop rather than rendering the media
 * itself: the panel stays a server component that way, so the only JavaScript
 * this adds is the hook. Nothing about the telemetry panel ships to the browser.
 *
 * `group` plus `data-landed` lets descendants react to the arrival in pure CSS
 * — the trace inside the panel draws itself on landing without the panel
 * needing to be a client component to know about it.
 */
export function SlamIn({
  direction,
  children,
}: {
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  const { ref, style, landed } = useScrollSlam(direction);

  return (
    <m.div
      ref={ref}
      style={style}
      data-landed={landed ? "true" : "false"}
      // Only transform and opacity animate. No filter, no box-shadow, no width
      // — those would repaint or reflow on every frame of the settle.
      //
      // No hand-written will-change: framer sets and clears it around the
      // animation itself, whereas a static one promotes the layer for the life
      // of the page and holds GPU memory for a transform that ran once.
      className="group"
    >
      {children}
    </m.div>
  );
}
