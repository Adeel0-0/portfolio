import { defineConfig, devices } from "@playwright/test";
// Not 4321: `astro dev` uses that, and reusing a dev server would test dev-only
// behaviour (the boot terminal replays every load there) instead of the build.
const port = Number(process.env.PORTFOLIO_TEST_PORT) || 4400;
const fixturePort = Number(process.env.PORTFOLIO_FIXTURE_PORT) || 4402;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  timeout: 30000,
  expect: { timeout: 6000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run start",
      env: { PORT: String(port) },
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: "node scripts/serve-built.mjs --fixture",
      env: { PORT: String(fixturePort) },
      url: `http://127.0.0.1:${fixturePort}`,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? undefined : "chrome",
        launchOptions: {
          // Opt-in for machines with a preinstalled Chromium that differs from
          // the pinned Playwright build. Unset in CI.
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
          args: [
            "--use-gl=angle",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
        },
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
