import { describe, expect, it } from "vitest";

import { SECTIONS } from "@/lib/sections";
import { projects } from "./projects";
import { skills } from "./skills";
import { stats } from "./profile";

/**
 * Invariants that the data files document in prose and enforce nowhere.
 *
 * Every rule here is currently satisfied, so this suite is a regression guard
 * rather than a bug report. It exists because each of these is a contract
 * *between* modules — a project naming a skill, a metric claiming to be the
 * session best — and those are exactly the couplings that rot silently when
 * someone edits one file and not the other.
 *
 * Where a rule can be moved into the type system it should be, and some are
 * moving there. A test that becomes redundant to a compiler error is a good
 * outcome, not wasted work.
 */

describe("projects", () => {
  it("has a unique index per project", () => {
    const indexes = projects.map((project) => project.index);
    expect(new Set(indexes).size).toBe(indexes.length);
  });

  it("uses indexes that parse as numbers", () => {
    // telemetry-panel.tsx seeds its trace waveform off Number.parseInt of this
    // string, so a non-numeric index would silently produce NaN.
    for (const project of projects) {
      expect(Number.isFinite(Number.parseInt(project.index, 10))).toBe(true);
    }
  });

  it("describes each project in exactly two parts", () => {
    // data/projects.ts documents description as [what it is, how it works],
    // and project-row.tsx indexes [0] and [1] blindly.
    for (const project of projects) {
      expect(
        project.description,
        `${project.title} description`
      ).toHaveLength(2);
      for (const part of project.description) {
        expect(part.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("lists a non-empty stack for each project", () => {
    for (const project of projects) {
      expect(project.stack.length, `${project.title} stack`).toBeGreaterThan(0);
    }
  });

  it("only names skills that exist in data/skills.ts", () => {
    // The tightest cross-module coupling in the app: these strings drive the
    // attention connectors, and a typo produces silent no-op highlighting.
    const known = new Set(
      skills.flatMap((group) => group.items.map((item) => item.name))
    );

    for (const project of projects) {
      for (const name of project.skills ?? []) {
        expect(known, `${project.title} names an unknown skill`).toContain(
          name
        );
      }
    }
  });
});

describe("stats", () => {
  it("marks at most one stat as the session best", () => {
    // Purple only reads as "personal best" while it stays rare. Documented at
    // data/profile.ts:57-62.
    const best = stats.filter((stat) => stat.best);
    expect(best.length).toBeLessThanOrEqual(1);
  });
});

describe("skills", () => {
  it("has no duplicate skill names across groups", () => {
    const names = skills.flatMap((group) => group.items.map((i) => i.name));
    expect(new Set(names).size).toBe(names.length);
  });

  it("has a non-empty item list per group", () => {
    for (const group of skills) {
      expect(group.items.length, `${group.group}`).toBeGreaterThan(0);
    }
  });
});

describe("sections", () => {
  it("has unique ids", () => {
    const ids = SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every section an eyebrow and a radio line", () => {
    // The mascot reads `radio` for whichever section is active; a blank one
    // would render an empty speech bubble rather than fail.
    for (const section of SECTIONS) {
      expect(section.eyebrow.trim().length, section.id).toBeGreaterThan(0);
      expect(section.radio.trim().length, section.id).toBeGreaterThan(0);
    }
  });
});
