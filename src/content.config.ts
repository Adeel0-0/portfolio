import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectSchema, credentialSchema } from "./lib/content-schema";

function flatId({entry}: {entry: string}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(entry)) {
    throw new Error(`Use a flat lowercase Markdown filename: ${entry}`);
  }
  return entry.slice(0,-3);
}

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/projects", generateId:flatId }),
    schema: projectSchema,
  }),
  certifications: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/certifications", generateId:flatId }),
    schema: credentialSchema,
  }),
};
