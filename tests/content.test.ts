import { describe, expect, it } from "vitest";
import { projectSchema, credentialSchema } from "../src/lib/content-schema";

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
describe("publication schemas", () => {
  it.each(['not-a-url', '/relative', ''])('reports malformed URL %s without throwing', url => {
    expect(projectSchema.safeParse({...project, repositoryUrl: url}).success).toBe(false);
  });
  it('accepts a metric with local evidence', () => {
    expect(projectSchema.safeParse({...project, metrics:[{value:'Example', label:'Fixture result', method:'Fixture measurement', measuredAt:'2026-10-17', evidence:'/evidence/results.pdf'}]}).success).toBe(true);
  });
  it("rejects PDF files as project images", () => {
    expect(
      projectSchema.safeParse({
        ...project,
        media: { src: "/resume.pdf", alt: "Resume" },
      }).success,
    ).toBe(false);
  });
  it("accepts a factual project without fabricated metrics or dates", () => {
    expect(projectSchema.safeParse(project).success).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,bad", "ftp://example.com"])(
    "rejects unsafe evidence URL %s",
    (url) => {
      expect(
        projectSchema.safeParse({ ...project, repositoryUrl: url }).success,
      ).toBe(false);
    },
  );
  it("requires methodology, date and evidence for a published metric", () => {
    expect(
      projectSchema.safeParse({
        ...project,
        metrics: [{ value: "90%", label: "Accuracy" }],
      }).success,
    ).toBe(false);
  });
  it("rejects impossible calendar dates", () => {
    expect(
      projectSchema.safeParse({ ...project, updatedAt: "2026-02-30" }).success,
    ).toBe(false);
  });
  it("keeps unfinished credential details in draft", () => {
    const credential = {
      title: "Fundamentals of Deep Learning",
      issuer: "NVIDIA DLI",
      kind: "course-completion",
      skills: ["PyTorch"],
      draft: true,
    };
    expect(credentialSchema.safeParse(credential).success).toBe(true);
    expect(
      credentialSchema.safeParse({ ...credential, draft: false }).success,
    ).toBe(false);
  });
  it("does not accept arbitrary certificate HTML as an asset path", () => {
    expect(
      credentialSchema.safeParse({
        title: "Course",
        issuer: "Issuer",
        kind: "course-completion",
        skills: [],
        draft: true,
        asset: "https://other.example/x.html",
      }).success,
    ).toBe(false);
  });
});
