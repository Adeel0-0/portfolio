import { expect, test, type Page } from "@playwright/test";

// The boot terminal has its own spec; skip it here like the other journeys.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("preloader:seen", "1");
    } catch {
      /* Storage-denial tests run without it. */
    }
  });
});

const mode = (page: Page) => page.locator("html").getAttribute("data-theme");
const startInF1 = (page: Page) =>
  page.addInitScript(() => localStorage.setItem("portfolio-theme", "f1"));

test("mode precedence: URL choice, then remembered choice, then Minimal", async ({
  page,
}) => {
  await page.goto("/");
  expect(await mode(page)).toBe("professional");
  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.locator("#circuit")).toBeHidden();

  await page.goto("/projects/sefgh/?mode=f1");
  expect(await mode(page)).toBe("f1");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    /\/projects\/sefgh\/$/,
  );
  await page.goto("/about/");
  expect(await mode(page)).toBe("f1"); // remembered

  await page.goto("/?mode=minimal");
  expect(await mode(page)).toBe("professional");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  expect(new URL(page.url()).searchParams.get("mode")).toBe("f1");
  await expect(page.locator("#theme-toggle")).toHaveAttribute("aria-pressed", "true");
});

test("F1 has its own composition; the timing tower works by keyboard", async ({
  page,
}) => {
  await startInF1(page);
  await page.goto("/");
  await expect(page.locator("#circuit")).toBeVisible();
  await expect(page.locator("#hero")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const rows = page.locator(".timing-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "true");
  await rows.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(rows.nth(1)).toBeFocused();
  await expect(rows.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(rows.nth(0)).toHaveAttribute("aria-pressed", "false");
  const preview = page.locator("[data-preview]:visible");
  await expect(preview).toHaveCount(1);
  await expect(preview).toHaveAttribute("data-preview", "palm-tree-detection");
  await expect(page.locator("#circuit-status")).toContainText("sector 2");
  await expect(
    page.locator(".circuit-sector.selected"),
  ).toHaveAttribute("data-project", "palm-tree-detection");

  // The map is a pointer shortcut to the same selection.
  await page.locator('.sector-marker[data-project="tiny-drone"]').click();
  await expect(rows.nth(2)).toHaveAttribute("aria-pressed", "true");

  // The preview's links are real case-study links.
  await preview.getByRole("link", { name: /Read case study/ }).click();
  await expect(page).toHaveURL(/\/projects\/tiny-drone\/$/);
  await page.goBack();
  await expect(page.locator("#circuit")).toBeVisible();
});

test("the Minimal path requests no 3D code until F1 asks for it", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (r) => requested.push(r.url()));
  for (const route of ["/", "/projects/", "/projects/sefgh/", "/about/"])
    await page.goto(route, { waitUntil: "networkidle" });
  expect(requested.filter((u) => /three|f1-scene|circuit-scene|F1Gradient|react|client\./.test(u))).toEqual([]);
  // Nothing from YouTube or font CDNs either: fonts are self-hosted.
  expect(requested.filter((u) => !u.startsWith("http://127.0.0.1"))).toEqual([]);
});

test("3D track opens on request, selects projects and releases its canvas", async ({
  page,
}) => {
  await startInF1(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const open = page.locator("#circuit-3d");
  await open.click();
  await expect(page.locator(".circuit-canvas")).toHaveCount(1);
  await expect(open).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#circuit-status")).toContainText("3D track ready");
  await expect(page.locator("#circuit-reset")).toBeVisible();

  // Selection still flows from the HTML list while 3D is showing.
  await page.locator(".timing-row").nth(2).click();
  await expect(page.locator("[data-preview]:visible")).toHaveAttribute(
    "data-preview",
    "tiny-drone",
  );
  await page.locator("#circuit-reset").click();

  // Escape inside the track closes it and returns focus to the control.
  await page.locator(".circuit-stage").dispatchEvent("keydown", { key: "Escape" });
  await expect(page.locator(".circuit-canvas")).toHaveCount(0);
  await expect(open).toHaveAttribute("aria-pressed", "false");

  // Leaving F1 disposes an open track.
  await open.click();
  await expect(page.locator(".circuit-canvas")).toHaveCount(1);
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "professional");
  await expect(page.locator(".circuit-canvas")).toHaveCount(0);
});

test("3D track falls back to the map without WebGL or when loading fails", async ({
  page,
}) => {
  await startInF1(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test stub: report no WebGL support
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest) {
      return /webgl/.test(type) ? null : original.call(this, type, ...rest);
    };
  });
  await page.goto("/");
  await page.locator("#circuit-3d").click();
  await expect(page.locator("#circuit-3d")).toBeDisabled();
  await expect(page.locator("#circuit-status")).toContainText("needs WebGL");
  await expect(page.locator(".circuit-svg")).toBeVisible();
});

test("a failed 3D import leaves the map usable", async ({ page }) => {
  await startInF1(page);
  await page.route(/circuit-scene/, (route) => route.abort());
  await page.goto("/");
  await page.locator("#circuit-3d").click();
  await expect(page.locator("#circuit-status")).toContainText("could not load");
  await expect(page.locator(".circuit-canvas")).toHaveCount(0);
  await expect(page.locator("#circuit-3d")).toHaveAttribute("aria-pressed", "false");
  await page.locator(".timing-row").nth(1).click();
  await expect(page.locator(".timing-row").nth(1)).toHaveAttribute("aria-pressed", "true");
});

test("case studies have a working contents index in both modes", async ({ page }) => {
  for (const theme of ["professional", "f1"]) {
    if (theme === "f1") await startInF1(page);
    await page.goto("/projects/sefgh/");
    const links = page.locator(".case-contents a");
    expect(await links.count()).toBeGreaterThanOrEqual(5);
    for (const href of await links.evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")!),
    ))
      await expect(page.locator(href)).toHaveCount(1);
    await links.filter({ hasText: "Approach" }).click();
    await expect(page).toHaveURL(/#approach$/);
  }
});

test("copy email announces its result without moving focus", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Clipboard permissions are Chromium-only");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const button = page.locator(".copy-email");
  await button.click();
  await expect(button).toBeFocused();
  await expect(page.locator(".copy-status")).toHaveText("Email address copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/@/);
});

test("switching modes keeps the visitor on the same section", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const id of ["garage", "about"]) {
    await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: "instant" });
    }, id);
    // Keyboard activation: Playwright's click() would first scroll the page
    // to reach the sticky header, changing which section is in view.
    await page.locator("#theme-toggle").evaluate((el) =>
      (el as HTMLElement).focus({ preventScroll: true }),
    );
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    const { top, atBottom, height } = await page.evaluate((target) => ({
      top: document.getElementById(target)!.getBoundingClientRect().top,
      atBottom:
        Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1,
      height: innerHeight,
    }), id);
    // The same section stays on screen: aligned, unless the page ends first.
    expect(top).toBeLessThan(height);
    if (!atBottom) expect(Math.abs(top - 100)).toBeLessThanOrEqual(2);
    await expect(page.locator("#theme-toggle")).toBeFocused();
  }
});

test("racing easter eggs work in F1 and vanish in Minimal", async ({ page }) => {
  await startInF1(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const lights = page.locator('[data-game="lights"]');
  const go = lights.locator("[data-lights-action]");
  await expect(go).toBeEnabled();

  // Jump start is caught.
  await go.click();
  await go.click();
  await expect(lights.locator("[data-lights-result]")).toContainText("Jump start");

  // A real start: wait for lights out, then react.
  await go.click();
  await expect(go).toHaveText("Go!", { timeout: 10000 });
  await go.click();
  await expect(lights.locator("[data-lights-result]")).toContainText(/\d\.\d{3} s/);
  await expect(lights.locator("[data-lights-best]")).toContainText(/\d\.\d{3} s/);

  // Pit stop by keyboard: focus moves from tyre to tyre.
  const pit = page.locator('[data-game="pit"]');
  await pit.locator("[data-pit-action]").click();
  for (let i = 0; i < 4; i++) await page.keyboard.press("Enter");
  await expect(pit.locator("[data-pit-result]")).toContainText(/\d\.\d{3} s/);
  await expect(pit.locator("[data-pit-action]")).toBeFocused();

  // Team radio and DRS announce through the shared status toast.
  await page.locator("[data-radio]").click();
  await expect(page.locator(".radio-toast")).toContainText("Team radio");
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.type("drs");
  await expect(page.locator("html")).toHaveAttribute("data-drs", "open");
  await expect(page.locator(".radio-toast")).toContainText("Rear wing open");

  // Leaving F1 removes everything the eggs added.
  await page.locator("#theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "professional");
  await expect(page.locator(".radio-toast, .speedo")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-drs", "open");
  await expect(page.locator("#paddock")).toBeHidden();
});
