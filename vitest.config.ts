import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Node environment only — no jsdom, no Testing Library, no browser runner.
 *
 * This is a deliberate scoping decision, not an omission. The client surface
 * here is decorative animation: canvas fields, rAF loops, framer transitions.
 * Rendering those into jsdom would mostly assert that framer-motion emits a
 * <div>, at the cost of a dependency tree larger than the app.
 *
 * What is worth testing is pure: the terminal's command table, and the
 * cross-module invariants in data/ that are currently documented in prose and
 * enforced nowhere. Those are Node tests. If a genuinely stateful component
 * ever appears, add jsdom then — as a second project, not by widening this.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "data/**/*.test.ts", "tests/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", ".tools/**", "tests/browser/**"],
  },
  resolve: {
    // Mirrors the "@/*" path alias in tsconfig.json.
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
