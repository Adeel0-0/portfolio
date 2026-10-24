import { getCollection } from "astro:content";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

function checkAsset(asset: string) {
  if (!asset.startsWith("/")) return;
  const root = resolve("public");
  const file = resolve(root, asset.slice(1));
  if (!file.startsWith(root + sep) || !existsSync(file))
    throw new Error(`Missing or invalid content asset: ${asset}`);
}

export const resumeHref = existsSync(resolve("public/resume.pdf"))
  ? "/resume.pdf"
  : undefined;

export async function getPublishedPortfolio() {
  const [projects, credentials] = await Promise.all([
    getCollection("projects"),
    getCollection("certifications"),
  ]);
  const publishedProjects = projects.filter((project) => !project.data.draft);
  const publishedIds = new Set(publishedProjects.map((project) => project.id));
  const allIds = new Set(projects.map((project) => project.id));
  for (const project of projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id))
      throw new Error(`Use a flat lowercase slug for project ${project.id}`);
    if (project.data.media) checkAsset(project.data.media.src);
    project.data.metrics.forEach((metric) => checkAsset(metric.evidence));
  }
  for (const credential of credentials) {
    if (credential.data.asset) checkAsset(credential.data.asset);
    for (const id of credential.data.relatedProjects) {
      if (!allIds.has(id)) throw new Error(`Unknown related project ${id}`);
      if (!credential.data.draft && !publishedIds.has(id))
        throw new Error(`Published credential links to draft project ${id}`);
    }
  }
  return {
    projects: publishedProjects.sort(
      (a, b) =>
        (a.data.featuredOrder ?? 999) - (b.data.featuredOrder ?? 999) ||
        b.data.updatedAt.localeCompare(a.data.updatedAt),
    ),
    credentials: credentials
      .filter((credential) => !credential.data.draft)
      .sort((a, b) =>
        (b.data.issuedAt ?? "").localeCompare(a.data.issuedAt ?? ""),
      ),
  };
}

export async function getPublishedProjects() {
  return (await getPublishedPortfolio()).projects;
}
export async function getPublishedCredentials() {
  return (await getPublishedPortfolio()).credentials;
}
