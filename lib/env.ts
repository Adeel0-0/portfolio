import "server-only";

/**
 * The site's canonical origin.
 *
 * This used to be `siteMeta.url` in data/content.ts, hardcoded to a Vercel
 * preview domain. A deploy URL is environment, not content: it differs between
 * local, preview and production, and the content file has no way to know which
 * one it is being read in.
 *
 * Resolution order:
 *   1. `SITE_URL` — set this once a real domain exists. Always wins.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's *stable* production
 *      domain. Deliberately not `VERCEL_URL`, which is per-deployment and
 *      would make every preview build advertise itself as canonical.
 *   3. localhost — dev, and any build running outside Vercel (CI included).
 *
 * Server-only, and without a `NEXT_PUBLIC_` prefix, because the only consumer
 * is `metadata` in app/layout.tsx. Prefixing it would inline the value into the
 * client bundle to be read by nothing.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  // Trailing slash stripped so callers can concatenate paths without doubling.
  if (explicit) return explicit.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
