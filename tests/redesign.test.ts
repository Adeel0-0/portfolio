import { describe, expect, it } from "vitest";
import { projectSchema } from "../src/lib/content-schema";
import { buildEmbedUrl } from "../src/lib/video";
import { CIRCUIT_POINTS, sampleCircuit, sectors } from "../src/lib/circuit";

const project = {
  title: "An actual project",
  summary: "A useful system.",
  description: ["What it is.", "How it works."],
  role: "Developer",
  status: "in-progress",
  category: "AI systems",
  skills: ["Python"],
  updatedAt: "2026-10-17",
  draft: false,
  diagram: ["Input", "Process", "Output"],
};

describe("project gallery content", () => {
  it("defaults to no media and accepts screenshots and YouTube videos", () => {
    expect(projectSchema.parse(project).gallery).toEqual([]);
    const parsed = projectSchema.parse({
      ...project,
      gallery: [
        { type: "image", src: "/projects/sefgh/results.webp", alt: "Ranked results" },
        { type: "youtube", id: "dQw4w9WgXcQ", title: "Demo walkthrough", start: 12 },
      ],
    });
    expect(parsed.gallery).toHaveLength(2);
  });

  it.each([
    { type: "youtube", id: "https://youtu.be/dQw4w9WgXcQ", title: "Full URL" },
    { type: "youtube", id: "short", title: "Too short" },
    { type: "youtube", id: "dQw4w9WgXcQ" },
    { type: "image", src: "https://example.com/a.png", alt: "Remote" },
    { type: "image", src: "/resume.pdf", alt: "Not an image" },
    { type: "vimeo", id: "123", title: "Unsupported" },
  ])("rejects invalid media %#", (item) => {
    expect(projectSchema.safeParse({ ...project, gallery: [item] }).success).toBe(false);
  });
});

describe("YouTube embeds", () => {
  it("use the privacy-enhanced host and only request playback on demand", () => {
    const url = new URL(buildEmbedUrl("dQw4w9WgXcQ", 42));
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/dQw4w9WgXcQ");
    expect(url.searchParams.get("start")).toBe("42");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(new URL(buildEmbedUrl("dQw4w9WgXcQ")).searchParams.has("start")).toBe(false);
  });
  it("refuses anything that is not a video id", () => {
    expect(() => buildEmbedUrl("../../evil")).toThrow();
  });
});

describe("F1 circuit geometry", () => {
  it("splits the loop into contiguous sectors that cover every point", () => {
    for (const count of [1, 3, 5]) {
      const parts = sectors(count);
      expect(parts).toHaveLength(count);
      expect(parts[0].from).toBe(0);
      expect(parts.at(-1)!.to).toBe(CIRCUIT_POINTS.length);
      parts.slice(1).forEach((part, i) => expect(part.from).toBe(parts[i].to));
      parts.forEach((part) => expect(part.d).toMatch(/^M[\d. ]+( C[\d. ]+)+$/));
    }
  });
  it("keeps markers and 3D samples inside the 600 × 400 map", () => {
    const inside = ([x, y]: readonly [number, number]) =>
      x >= 0 && x <= 600 && y >= 0 && y <= 400;
    expect(sectors(3).every((s) => inside(s.marker))).toBe(true);
    const samples = sampleCircuit(10);
    expect(samples).toHaveLength(CIRCUIT_POINTS.length * 10);
    expect(samples.every(inside)).toBe(true);
  });
  it("rejects impossible sector counts", () => {
    expect(() => sectors(0)).toThrow();
    expect(() => sectors(CIRCUIT_POINTS.length + 1)).toThrow();
  });
});
