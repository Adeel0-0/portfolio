import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("astro:content", () => ({ getCollection: vi.fn() }));
import { getCollection } from "astro:content";
import {
  getPublishedProjects,
  getPublishedCredentials,
} from "../src/lib/content";

let projects: unknown[];
let certifications: unknown[];
const project = (id: string, draft = false, extras = {}) => ({
  id,
  data: { draft, updatedAt: "2026-10-17", metrics: [], ...extras },
});
const credential = (relatedProjects: string[], draft = false, extras = {}) => ({
  id: "course",
  data: { draft, issuedAt: "2026-10-01", relatedProjects, ...extras },
});
beforeEach(() => {
  projects = [project("published"), project("private", true)];
  certifications = [
    credential(["published"]),
    { ...credential([], true), id: "draft-course" },
  ];
  vi.mocked(getCollection).mockImplementation(
    async (name) => (name === "projects" ? projects : certifications) as never,
  );
});
describe("public collection boundary", () => {
  it("excludes drafts from both public consumers", async () => {
    expect((await getPublishedProjects()).map((p) => p.id)).toEqual([
      "published",
    ]);
    expect((await getPublishedCredentials()).map((c) => c.id)).toEqual([
      "course",
    ]);
  });
  it("rejects a credential referring to a missing project", async () => {
    certifications = [credential(["missing"])];
    await expect(getPublishedCredentials()).rejects.toThrow(
      "Unknown related project",
    );
  });
  it("prevents a published credential from exposing a draft project", async () => {
    certifications = [credential(["private"])];
    await expect(getPublishedCredentials()).rejects.toThrow("links to draft");
  });
  it.each([
    { media: { src: "/projects/does-not-exist.png" } },
    { metrics: [{ evidence: "/evidence/does-not-exist.pdf" }] },
  ])("rejects missing local project evidence %j", async (extras) => {
    projects = [project("published", false, extras)];
    await expect(getPublishedProjects()).rejects.toThrow(
      "Missing or invalid content asset",
    );
  });
  it("rejects a missing credential asset", async () => {
    certifications = [
      credential(["published"], false, { asset: "/certificates/missing.pdf" }),
    ];
    await expect(getPublishedCredentials()).rejects.toThrow(
      "Missing or invalid content asset",
    );
  });
});
