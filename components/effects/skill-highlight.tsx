"use client";

import { useCallback } from "react";

import { useSkillFocus } from "@/components/effects/skill-focus";
import { cn } from "@/lib/utils";

/**
 * Marks a project's skills in the Garage section while the project is hovered.
 *
 * This was AttentionGlow, and it used to do two jobs: draw a cursor-tracked
 * spotlight behind the text, and raise the skill highlight. The spotlight is
 * gone — it read as a translucent circle sitting on the card rather than as
 * lighting, and it has been replaced by a page-wide wash in
 * components/effects/cursor-gradient.tsx.
 *
 * What is left is the half that carried information. The name follows it: a
 * component called AttentionGlow that no longer glows is the kind of drift
 * that makes a file lie about itself.
 *
 * The pointermove listener and its rAF coalescing went with the spotlight.
 * Nothing reads --mx/--my any more, so tracking the pointer across the card
 * would have been a listener and a frame callback feeding nothing.
 */
export function SkillHighlight({
  children,
  className,
  skills,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * Skills to mark while this block is hovered.
   *
   * `readonly` because the caller passes `project.skills`, which is a readonly
   * tuple of literals derived from data/skills.ts. Nothing here mutates it.
   */
  skills?: readonly string[];
}) {
  const { setFocused } = useSkillFocus();

  const handleEnter = useCallback(() => {
    if (skills) setFocused(skills);
  }, [skills, setFocused]);

  const handleLeave = useCallback(() => {
    if (skills) setFocused(null);
  }, [skills, setFocused]);

  return (
    <div
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
