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
  vite: { css: { postcss: {} } },
});
