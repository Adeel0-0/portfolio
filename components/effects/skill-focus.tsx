"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * Attention weights, in the only form the layout actually allows.
 *
 * The original idea was to draw connector lines from a project to the skills it
 * uses. That is undrawable here: Projects and Garage are separate full-height
 * sections and are never on screen together, so there is no moment at which a
 * line between them could exist.
 *
 * What survives is the useful half. Hovering a project marks the skills it
 * uses, so when you scroll down to the Garage they are already lit and the rest
 * are dimmed — the association still lands, just across a scroll instead of
 * across a gap.
 */

type SkillFocus = {
  /**
   * Skill names to emphasise, or null when nothing is hovered.
   *
   * `readonly` all the way through: the value originates as a literal tuple on
   * a project in data/projects.ts, and this context only ever reads it.
   */
  focused: readonly string[] | null;
  setFocused: (skills: readonly string[] | null) => void;
};

const SkillFocusContext = createContext<SkillFocus | null>(null);

export function SkillFocusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState<readonly string[] | null>(null);
  const value = useMemo(() => ({ focused, setFocused }), [focused]);

  return (
    <SkillFocusContext.Provider value={value}>
      {children}
    </SkillFocusContext.Provider>
  );
}

/** No-ops without a provider, so consumers stay independently droppable. */
export function useSkillFocus(): SkillFocus {
  return useContext(SkillFocusContext) ?? FALLBACK;
}

const FALLBACK: SkillFocus = { focused: null, setFocused: () => {} };

/**
 * How a given skill should render right now.
 *
 * "neutral" when nothing is hovered — deliberately distinct from "dimmed", so
 * the resting state of the Garage is not a page of faded text.
 */
export function useSkillState(
  name: string
): "neutral" | "focused" | "dimmed" {
  const { focused } = useSkillFocus();
  if (!focused) return "neutral";
  return focused.includes(name) ? "focused" : "dimmed";
}
