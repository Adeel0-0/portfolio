import { expect, test } from "@playwright/test";

// The Preprint look: the home page typeset as a research paper.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("preloader:seen", "1");
    } catch {
      /* not needed here */
    }
  });
});

test("the home paper has its title page, numbered sections, figure and table", async ({
  page,
}) => {
  await page.goto("/?mode=preprint");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "professional");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Engineering Useful Intelligence",
  );
  for (const name of ["1 Selected work", "2 Capabilities", "3 About the author"])
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  // Exactly one highlighted term per page.
  await expect(page.locator("mark:visible")).toHaveCount(1);

  const figure = page.locator("#fig-1");
  await expect(figure.getByText("Figure 1:")).toBeVisible();
  // The figure's labels never render below the 13px floor.
  const sizes = await figure
    .locator("svg:visible text")
    .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);

  // Every project row links to its case study.
  const rows = page.locator("#tab-1 tbody tr");
  await expect(rows).toHaveCount(3);
  await rows.getByRole("link", { name: "Palm-tree detection" }).click();
  await expect(page).toHaveURL(/\/projects\/palm-tree-detection\/$/);
  await expect(page.getByRole("heading", { level: 2, name: "References" })).toBeVisible();
});

test("cross-references and footnotes are real links that go both ways", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("link", { name: "Fig. 1" }).click();
  await expect(page).toHaveURL(/#fig-1$/);
  await expect(page.locator("#fig-1")).toHaveClass(/pp-flash/);
  await expect(page.locator("#fig-1")).not.toHaveClass(/pp-flash/, { timeout: 3000 });

  await page.getByRole("link", { name: "Footnote 1" }).click();
  await expect(page).toHaveURL(/#fn-1$/);
  await page.getByRole("link", { name: "Back to the table" }).click();
  await expect(page).toHaveURL(/#fnref-1$/);
});

test("Shred & rebuild shreds the paper, hands over to the swarm and cleans up", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 860 });
  await page.goto("/");
  const button = page.locator("#shred-toggle");
  await expect(button).toBeVisible();
  await button.click();
  // The shredder rig appears while the paper is fed through.
  await expect(page.locator(".shred-rig")).toHaveCount(1);
  // Then the swarm engine takes over with the real page intact underneath.
  await expect(page.locator("swarm-rebuild")).toHaveCount(1, { timeout: 15000 });
  expect(
    await page.evaluate(() => ({
      animations: document.querySelector("#site-shell")!.getAnimations().length,
      transform: getComputedStyle(document.querySelector("#site-shell")!).transform,
    })),
  ).toEqual({ animations: 0, transform: "none" });
  await page.keyboard.press("Escape");
  await expect(page.locator("swarm-rebuild")).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator(".shred-rig")).toHaveCount(0);
  await expect(button).toBeEnabled();
});

test("Shred & rebuild is absent in F1, under reduced motion and on phones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 860 });
  await page.goto("/?mode=f1");
  await expect(page.locator("#shred-toggle")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?mode=preprint");
  await expect(page.locator("#shred-toggle")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#shred-toggle")).toBeHidden();
  // Nothing from the swarm engine is fetched until someone shows intent.
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.setViewportSize({ width: 1366, height: 860 });
  await page.reload({ waitUntil: "networkidle" });
  expect(requests.filter((u) => u.includes("swarm-cursors"))).toEqual([]);
});

test("the paper is complete without JavaScript and on a phone", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#sec-intro")).toBeVisible();
  await expect(page.locator("#tab-1")).toBeVisible();
  // The address is always visible as text; the copy button needs JavaScript.
  await expect(page.locator(".pp-addr")).toBeVisible();
  await expect(page.locator(".copy-email")).toBeHidden();
  // On a narrow sheet the figure is drawn top to bottom.
  await expect(page.locator("#fig-1 .pp-fig-v")).toBeVisible();
  await expect(page.locator("#fig-1 .pp-fig-h")).toBeHidden();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await context.close();
});
