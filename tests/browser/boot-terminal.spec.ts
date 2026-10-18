import { test, expect, type Page } from "@playwright/test";

// The boot terminal plays once per tab on arrival. Every exit must leave an
// ordinary page: no overlay, no canvas, no page-hiding attribute or transform.
// Generous timeout: the sequence runs ~3 s and the inline ceiling is ~5.7 s.
async function expectSettledPage(page: Page) {
  const timeout = 10_000;
  await expect(page.locator(".boot-terminal")).toHaveCount(0, { timeout });
  await expect(page.locator("html")).not.toHaveAttribute("data-preloader", {
    timeout,
  });
  await expect(page.locator("#site-shell")).toHaveCSS("opacity", "1");
  await expect(page.locator("#site-shell")).toHaveCSS("transform", "none");
  expect(
    await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--pl-launch"),
    ),
  ).toBe("");
}

test("first visit plays the boot terminal, then hands over a clean page", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const boot = page.locator(".boot-terminal");
  await expect(boot).toBeVisible();
  await expect(boot).toContainText("sys_init.sh");
  await expect(boot.locator("canvas")).toHaveCount(1);
  await expectSettledPage(page);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem("preloader:seen")),
  ).toBe("1");
  expect(errors).toEqual([]);
});

test("plays once per tab", async ({ page }) => {
  await page.goto("/");
  await expectSettledPage(page);
  await page.goto("/about/");
  expect(
    await page.evaluate(() => ({
      attribute: document.documentElement.hasAttribute("data-preloader"),
      overlay: document.querySelectorAll(".boot-terminal").length,
    })),
  ).toEqual({ attribute: false, overlay: 0 });
});

test("reduced motion never shows the boot terminal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(() =>
      document.documentElement.hasAttribute("data-preloader"),
    ),
  ).toBe(false);
  await expect(page.locator(".boot-terminal")).toHaveCount(0);
});

test("a key press skips it without moving focus or scroll", async ({
  page,
}) => {
  await page.goto("/#projects");
  await expect(page.locator(".boot-terminal")).toBeVisible();
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press("Shift");
  await expectSettledPage(page);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  expect(
    await page.evaluate(() => document.activeElement === document.body),
  ).toBe(true);
});

test("the page is never left hidden when scripts fail to load", async ({
  page,
}) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/");
  // The inline gate hid the page; its own deadline must give it back.
  await expectSettledPage(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
