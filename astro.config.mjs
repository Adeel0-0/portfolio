import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

const origin =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4321");

export default defineConfig({
  site: origin,
  adapter: vercel(),
  // React only for client islands that are loaded on demand (F1 background).
  integrations: [react()],
  trailingSlash: "ignore",
  prerenderConflictBehavior: "error",
  // An inline (empty) PostCSS config stops Vite from searching parent folders
  // for one. A worktree inside an older checkout would otherwise pick up its
  // Tailwind postcss.config.mjs.
  vite: { css: { postcss: {} } },
});
