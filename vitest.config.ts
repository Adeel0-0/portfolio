import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Pure content, state and build contracts run in Node. Playwright separately
// exercises the production pages, interaction lifecycle and accessibility.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "data/**/*.test.ts", "tests/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".tools/**", "tests/browser/**"],
  },
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json.
    alias: {
      "@legacy": fileURLToPath(new URL(".", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
