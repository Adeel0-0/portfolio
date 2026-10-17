import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, credentialSchema } from './lib/content-schema';

export const collections = {
  projects: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/projects' }), schema: projectSchema }),
  certifications: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/certifications' }), schema: credentialSchema }),
};
