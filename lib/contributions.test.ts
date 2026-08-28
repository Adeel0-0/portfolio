import { describe, expect, it } from "vitest";

import { parseContributions } from "./contributions";

const day = (over: Record<string, unknown> = {}) => ({
  date: "2026-01-01",
  count: 3,
  level: 2,
  ...over,
});

describe("parseContributions", () => {
  it("accepts a well-formed payload", () => {
    const out = parseContributions({
      contributions: [day(), day({ date: "2026-01-02", count: 0, level: 0 })],
    });

    expect(out).toEqual([
      { date: "2026-01-01", count: 3, level: 2 },
      { date: "2026-01-02", count: 0, level: 0 },
    ]);
  });

  it("returns none for a payload that is not an object", () => {
    for (const input of [null, undefined, 42, "nope", []]) {
      expect(parseContributions(input)).toEqual([]);
    }
  });

  it("returns none when `contributions` is missing or not an array", () => {
    expect(parseContributions({})).toEqual([]);
    expect(parseContributions({ contributions: null })).toEqual([]);
    expect(parseContributions({ contributions: "yes" })).toEqual([]);
  });

  it("returns an empty list for an empty payload", () => {
    expect(parseContributions({ contributions: [] })).toEqual([]);
  });

  describe("the white-screen case", () => {
    it("rejects a count that arrives as a string", () => {
      // This is the regression this parser exists for. Untyped, a string count
      // survives into ContactCards' `days.reduce((sum, d) => sum + d.count, 0)`,
      // which becomes string concatenation, and then total.toLocaleString()
      // throws inside render — with no error boundary above it, a white page.
      const out = parseContributions({ contributions: [day({ count: "3" })] });
      expect(out).toEqual([]);
    });

    it("rejects NaN and Infinity counts", () => {
      expect(parseContributions({ contributions: [day({ count: NaN })] })).toEqual([]);
      expect(
        parseContributions({ contributions: [day({ count: Infinity })] })
      ).toEqual([]);
    });
  });

  describe("all-or-nothing", () => {
    it("discards the whole set when any single day is malformed", () => {
      // Not a taste call: the array is positional. ContributionGraph pads the
      // first week from days[0].date and chunks sequentially into sevens, so
      // dropping one entry shifts every later day onto the wrong weekday.
      const out = parseContributions({
        contributions: [day(), day({ date: 99 }), day()],
      });
      expect(out).toEqual([]);
    });

    it("rejects a missing or empty date", () => {
      expect(parseContributions({ contributions: [day({ date: undefined })] })).toEqual([]);
      expect(parseContributions({ contributions: [day({ date: "" })] })).toEqual([]);
    });

    it("rejects a non-object entry", () => {
      expect(parseContributions({ contributions: [null] })).toEqual([]);
      expect(parseContributions({ contributions: ["2026-01-01"] })).toEqual([]);
    });
  });

  describe("level is enrichment, not required data", () => {
    it("keeps a day whose level is absent", () => {
      const out = parseContributions({
        contributions: [{ date: "2026-01-01", count: 3 }],
      });
      expect(out).toEqual([{ date: "2026-01-01", count: 3 }]);
    });

    it("drops an out-of-range level rather than the day", () => {
      // Indexing the graph's 5-entry LEVELS array with 7 would render
      // className="undefined". Without a level, it recomputes from count.
      const out = parseContributions({ contributions: [day({ level: 7 })] });
      expect(out).toEqual([{ date: "2026-01-01", count: 3 }]);
    });

    it("drops a non-integer or non-numeric level rather than the day", () => {
      expect(parseContributions({ contributions: [day({ level: 1.5 })] })).toEqual([
        { date: "2026-01-01", count: 3 },
      ]);
      expect(parseContributions({ contributions: [day({ level: "2" })] })).toEqual([
        { date: "2026-01-01", count: 3 },
      ]);
    });
  });
});
