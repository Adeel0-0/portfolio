import { describe, expect, it } from "vitest";
import { BOOT, BOOT_LINES, lineFor } from "../src/lib/boot-sequence";

describe("boot terminal sequence", () => {
  it("starts empty and ends on the last line, complete", () => {
    expect(lineFor(0)).toBe("");
    expect(lineFor(100)).toBe(BOOT_LINES.at(-1));
  });

  it("types each line in order without skipping characters", () => {
    let previous = "";
    for (let progress = 0; progress <= 100; progress++) {
      const line = lineFor(progress);
      const index = BOOT_LINES.findIndex((full) => full.startsWith(line));
      expect(index, `progress ${progress}: "${line}"`).toBeGreaterThanOrEqual(
        0,
      );
      // Within one line the text only grows; a new line starts afresh.
      if (line.length < previous.length) expect(BOOT_LINES).toContain(previous);
      previous = line;
    }
  });

  it("shows every line complete before the next one starts", () => {
    const shown = new Set<string>();
    for (let progress = 0; progress <= 100; progress++)
      shown.add(lineFor(progress));
    for (const line of BOOT_LINES) expect(shown).toContain(line);
  });

  it("clamps progress outside 0-100", () => {
    expect(lineFor(-20)).toBe("");
    expect(lineFor(250)).toBe(BOOT_LINES.at(-1));
  });

  it("runs for about three seconds, with the ceiling safely beyond it", () => {
    const total = BOOT.loader + BOOT.hold + BOOT.launch;
    expect(total).toBeGreaterThanOrEqual(2800);
    expect(total).toBeLessThanOrEqual(3300);
    expect(BOOT.failsafe).toBeGreaterThan(total + 1000);
  });
});
