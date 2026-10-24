import { describe, expect, it } from "vitest";
import { skills } from "../data/skills";

// The skill list is the vocabulary content-schema.ts validates against, so a
// duplicate or an empty group would let content drift without an error.
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
