"use client";

import { useCallback, useEffect, useRef } from "react";

import { useSkillFocus } from "@/components/effects/skill-focus";
import { cn } from "@/lib/utils";

/**
 * A dim light behind the content, tracked to the cursor.
 *
 * Two decisions keep this cheap:
 *
 *   The position is written to CSS custom properties on the element, not to
 *   React state. A pointermove that re-rendered a component tree would be a
 *   render per frame; writing --mx/--my costs one style recalc on one element
 *   and repaints a ::before that never participates in layout.
 *
 *   The listener exists only while the pointer is inside. Binding one per row
 *   permanently would put N always-live pointermove handlers on the page for an
 *   effect that can only be visible in one of them at a time.
 *
 * The gradient itself lives in the .attention-glow rule in globals.css.
 */
export function AttentionGlow({
  children,
  className,
  skills,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * Marks these skills in the Garage section while this block is hovered.
   *
   * `readonly` because the caller passes `project.skills`, which is a readonly
   * tuple of literals derived from data/skills.ts. Nothing here mutates it.
   */
  skills?: readonly string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const { setFocused } = useSkillFocus();

  const handleMove = useCallback((event: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    // Coalesce to one write per frame: pointermove can fire well above 60Hz on
    // high-polling-rate mice, and each write is a style invalidation.
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  }, []);

  const handleEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.glow = "on";
    el.addEventListener("pointermove", handleMove);
    if (skills) setFocused(skills);
  }, [handleMove, skills, setFocused]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.glow = "off";
    el.removeEventListener("pointermove", handleMove);
    if (skills) setFocused(null);
  }, [handleMove, skills, setFocused]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      cancelAnimationFrame(frame.current);
      el?.removeEventListener("pointermove", handleMove);
    };
  }, [handleMove]);

  return (
    <div
      ref={ref}
      data-glow="off"
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={cn("attention-glow", className)}
    >
      {children}
    </div>
  );
}
