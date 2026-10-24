import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

const origin =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4321");

export default defineConfig({
  site: origin,
  adapter: vercel(),
  trailingSlash: "ignore",
  prerenderConflictBehavior: "error",
  // An inline (empty) PostCSS config stops Vite from searching parent folders
  // for one. A worktree inside an older checkout would otherwise pick up its
  // Tailwind postcss.config.mjs.
  vite: { css: { postcss: {} } },
});
