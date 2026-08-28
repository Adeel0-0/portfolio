"use client";

import { useSkillState } from "@/components/effects/skill-focus";
import { GRADE_LABEL, type SkillGrade } from "@/data";
import { cn } from "@/lib/utils";

/**
 * A skill, ringed by tyre compound.
 *
 * The compound encodes how hard the tool actually gets run, so the chip carries
 * information instead of just sitting there being a tag. Grades live in
 * data/skills.ts as values, not class names — Tailwind's content globs skip
 * ./data, so a class string written there would be purged silently. This map is
 * where value becomes colour.
 */
const RING: Record<SkillGrade, string> = {
  soft: "border-tyre-soft/70",
  medium: "border-tyre-medium/70",
  hard: "border-tyre-hard/40",
};

const DOT: Record<SkillGrade, string> = {
  soft: "bg-tyre-soft",
  medium: "bg-tyre-medium",
  hard: "bg-tyre-hard",
};

export function TyreChip({
  name,
  grade,
  className,
}: {
  name: string;
  grade: SkillGrade;
  className?: string;
}) {
  // Lit when a hovered project uses this skill, dimmed when one is hovered and
  // it doesn't. Neutral is its own state — otherwise the resting Garage would
  // be a page of faded text.
  const state = useSkillState(name);

  return (
    <span
      data-skill-state={state}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1.5 text-sm text-foreground transition-all duration-300 hover:bg-raised",
        RING[grade],
        state === "focused" && "border-signal bg-raised text-foreground",
        state === "dimmed" && "opacity-35",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[grade])}
      />
      {name}
      {/* The compound is visual for sighted users and silent otherwise, so the
          grade is spelled out for screen readers rather than left as a colour. */}
      <span className="sr-only"> — {GRADE_LABEL[grade]}</span>
    </span>
  );
}

/** Reads the compound colours back out, so the section can explain itself. */
export function TyreLegend({ className }: { className?: string }) {
  const grades: SkillGrade[] = ["soft", "medium", "hard"];

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {grades.map((grade) => (
        <li
          key={grade}
          className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className={cn("h-1.5 w-1.5 rounded-full", DOT[grade])}
          />
          {grade} · {GRADE_LABEL[grade]}
        </li>
      ))}
    </ul>
  );
}
