"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Fades its children up the first time they scroll into view.
 *
 * Isolating the client boundary here lets the surrounding sections stay server
 * components — they ship no JS of their own, only this wrapper does.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds to offset the transition, for staggering lists. */
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "reveal-visible", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
