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
  vite: { css: { postcss: {} } },
});
