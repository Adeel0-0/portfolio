/**
 * The five sections of the page, in order.
 *
 * Single source of truth. The nav dock builds its items from this, the scroll
 * provider observes exactly these ids, the track map divides the lap by them,
 * and the mascot looks up its radio line here. Adding or reordering a section
 * is a change to this array and nothing else.
 *
 * Deliberately free of JSX and of any React import so server components can
 * pull it in without dragging a client boundary along: `icon` is a key that
 * components/nav/nav-dock.tsx resolves to a lucide component.
 */

export type SectionId = "hero" | "about" | "projects" | "garage" | "contact";

export type SectionIcon = "flag" | "user" | "trophy" | "wrench" | "radio";

export type Section = {
  id: SectionId;
  /** Nav tooltip and accessible label. */
  label: string;
  /** Mono eyebrow printed at the top of the section. Carries the F1 voice. */
  eyebrow: string;
  icon: SectionIcon;
  /** What the engineer says over team radio while this section is active. */
  radio: string;
};

export const SECTIONS = [
  {
    id: "hero",
    label: "Grid",
    eyebrow: "// GRID",
    icon: "flag",
    radio: "Radio check, radio check.",
  },
  {
    id: "about",
    label: "Developer",
    eyebrow: "// DEVELOPER PROFILE",
    icon: "user",
    radio: "Here's who's in the car.",
  },
  {
    id: "projects",
    label: "Race history",
    eyebrow: "// RACE HISTORY",
    icon: "trophy",
    radio: "Box, box — three cars incoming.",
  },
  {
    id: "garage",
    label: "Garage",
    eyebrow: "// GARAGE",
    icon: "wrench",
    radio: "Full send. Tyres are good.",
  },
  {
    id: "contact",
    label: "Team radio",
    eyebrow: "// TEAM RADIO",
    icon: "radio",
    radio: "That's P1, mate. Get in there.",
  },
] as const satisfies readonly Section[];

export const FIRST_SECTION_ID: SectionId = SECTIONS[0].id;
export const LAST_SECTION_ID: SectionId = SECTIONS[SECTIONS.length - 1].id;

export function sectionById(id: SectionId): Section {
  // Non-null: SectionId is derived from this same array.
  return SECTIONS.find((section) => section.id === id) as Section;
}
