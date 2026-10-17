import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test('a capability with no published project shows an honest empty state', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name:'FastAPI',exact:true}).click();
  await expect(page.locator('#skill-filter')).toHaveValue('FastAPI');
  await expect(page.locator('[data-project]:visible')).toHaveCount(0);
  await expect(page.locator('#filter-empty')).toBeVisible();
  await page.locator('#skill-filter').selectOption('');
  await expect(page.locator('[data-project]:visible')).toHaveCount(3);
});

test("secondary pages remain accessible in both modes and at mobile width", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/projects/",
    "/projects/palm-tree-detection/",
    "/about/",
    "/certifications/",
    "/not-a-page/",
  ]) {
    await page.goto(route);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    for (const theme of ["professional", "f1"]) {
      await expect(page.locator("body")).toHaveCSS(
        "color",
        theme === "f1" ? "rgb(237, 241, 247)" : "rgb(21, 27, 35)",
      );
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, route).toEqual([]);
      await page.locator("#theme-toggle").click();
    }
  }
});

test("cinematic renders and twenty switches leave no temporary resources", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== "chromium",
    "The software WebGL renderer is configured in Chromium; other engines exercise fallback and controls.",
  );
  test.setTimeout(90000);
  const events: { theme: string; path: string; duration: number }[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.exposeFunction(
    "recordTransition",
    (event: (typeof events)[number]) => events.push(event),
  );
  await page.goto("/");
  await page.evaluate(() =>
    document.addEventListener("portfolio:transition-end", (event) => {
      (
        window as unknown as { recordTransition(detail: unknown): void }
      ).recordTransition((event as CustomEvent).detail);
    }),
  );
  const module = page.waitForResponse(
    (response) => response.url().includes("f1-scene") && response.ok(),
  );
  await page.locator("#theme-toggle").hover();
  await module;
  await page.waitForTimeout(300);
  for (let i = 0; i < 20; i++) {
    await page.locator("#theme-toggle").click();
    if (i === 0) {
      await expect(page.locator("html")).toHaveAttribute(
        "data-transition",
        "playing",
      );
      await page.screenshot({ path: testInfo.outputPath("cinematic.png") });
    }
    await expect(page.locator("html")).toHaveAttribute(
      "data-transition",
      "idle",
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      i % 2 === 0 ? "f1" : "professional",
    );
    await expect(
      page.locator(".f1-overlay, canvas, .transition-skip"),
    ).toHaveCount(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
  expect(events).toHaveLength(20);
  expect(
    events.filter((event) => event.path === "rich").length,
  ).toBeGreaterThan(0);
  expect(events.every((event) => event.duration < 3000)).toBe(true);
  expect(errors).toEqual([]);
  await testInfo.attach("transition-timings", {
    body: JSON.stringify(events, null, 2),
    contentType: "application/json",
  });
});

test("Skip, Tab, scroll and context loss release the page", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.locator("#theme-toggle");
  await toggle.click();
  await page.locator(".transition-skip").focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toBeFocused();
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await toggle.click();
  await page.keyboard.press("Tab");
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await toggle.click();
  await page.evaluate(() => window.dispatchEvent(new WheelEvent("wheel")));
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await toggle.click();
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  // Dispatch the browser's loss notification while preparation owns a canvas.
  await toggle.click();
  const canvas = page.locator(".f1-overlay canvas");
  if (await canvas.count())
    await canvas.evaluate((element) =>
      element.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true }),
      ),
    );
  await expect(page.locator(".f1-overlay, canvas")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
});

test("main journeys and source-backed content are reachable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Engineering",
  );
  await expect(page.locator("#theme-toggle")).toBeVisible();
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects\//);
  await page
    .getByRole("link", { name: "Palm-tree detection", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Palm-tree detection",
  );
  await expect(
    page.getByRole("link", { name: "Explore the code" }),
  ).toHaveAttribute("href", "https://github.com/Adeel0-0/PALM-TREE-DETECTION");
  expect((await page.request.get("/resume.pdf")).status()).toBe(200);
  await page.goto("/certifications/");
  await expect(page.getByText("More to share soon.")).toBeVisible();
  await expect(page.getByText("NVIDIA")).toHaveCount(0);
});

test("reduced-motion switch preserves filter, scroll and preference across pages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const effects: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("f1-scene")) effects.push(req.url());
  });
  await page.goto("/projects/?skill=OpenCV");
  await expect(page.locator("[data-project]:visible")).toHaveCount(1);
  await page.locator("#theme-toggle").focus();
  await page.evaluate(() => window.scrollTo(0, 120));
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator("#theme-toggle")).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await expect(page.locator("[data-project]:visible")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  expect(effects).toHaveLength(0);
  await page.goto("/about/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
});

test("rapid reversal and Escape settle the latest request without an overlay", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.locator("#theme-toggle");
  await toggle.click();
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "professional",
  );
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(
    page.locator(".f1-overlay, .transition-skip, canvas"),
  ).toHaveCount(0);
  await page.waitForTimeout(1000);
  await expect(page.locator(".f1-overlay, canvas")).toHaveCount(0);
});

test("failed effect import still completes the theme change", async ({
  page,
}) => {
  await page.route("**/*f1-scene*", (route) => route.abort());
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
});

test("storage denial and live reduced-motion changes do not strand the page", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("denied", "SecurityError");
      },
    }),
  );
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator(".f1-overlay")).toHaveCount(0);
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "professional",
  );
});

test("both modes fit narrow screens and pass automated accessibility checks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  for (const theme of ["professional", "f1"]) {
    if (theme === "f1") await page.locator("#theme-toggle").click();
    await expect(page.locator("body")).toHaveCSS(
      "color",
      theme === "f1" ? "rgb(237, 241, 247)" : "rgb(21, 27, 35)",
    );
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test("content and navigation remain usable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#theme-toggle")).toBeHidden();
  await page.locator(".mobile-menu summary").click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page.locator("[data-project]")).toHaveCount(3);
  await context.close();
});

test("late preparation gets cancelled and cannot revive a finished transition", async ({
  page,
}) => {
  await page.route("**/*f1-scene*.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `
    export async function prepareScene(canvas, signal) {
      signal.addEventListener('abort', () => canvas.remove(), {once:true});
      await new Promise(resolve => setTimeout(resolve, 1100));
      return { play() { document.documentElement.dataset.staleScene = 'played'; }, dispose() { canvas.remove(); } };
    }
  `,
    }),
  );
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator(".f1-overlay, canvas")).toHaveCount(0);
  await page.waitForTimeout(1300);
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-stale-scene",
    "played",
  );
  await expect(page.locator(".f1-overlay, canvas")).toHaveCount(0);
});
