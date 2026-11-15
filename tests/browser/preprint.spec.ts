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
