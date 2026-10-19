import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("persisted F1 metadata is correct even before enhancement scripts load", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#theme-toggle").click();
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/about/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "f1");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#10151e",
  );
});

test("all routes fit both themes at every supported test width", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const routes = [
    "/",
    "/projects/",
    "/projects/sefgh/",
    "/projects/palm-tree-detection/",
    "/projects/tiny-drone/",
    "/about/",
    "/certifications/",
    "/not-a-page/",
  ];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(route === "/not-a-page/" ? 404 : 200);
    for (const theme of ["professional", "f1"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page.locator("#theme-toggle").click();
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const result = await page.evaluate(async () => {
          await Promise.all(
            [...document.images].map((image) => image.decode().catch(() => {})),
          );
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            broken: [...document.images]
              .filter((image) => !image.naturalWidth)
              .map((image) => image.src),
          };
        });
        expect(
          result.overflow,
          `${route} ${theme} ${width}`,
        ).toBeLessThanOrEqual(1);
        expect(result.broken, `${route} ${theme} ${width}`).toEqual([]);
        if (route === "/" && [320, 1440].includes(width))
          await page.screenshot({
            path: testInfo.outputPath(`home-${theme}-${width}.png`),
            fullPage: true,
          });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("authored image, caption and metrics preserve their bounds and content", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const fixturePort = Number(process.env.PORTFOLIO_FIXTURE_PORT) || 4402;
  await page.goto(`http://127.0.0.1:${fixturePort}/projects/evidence-fixture/`);
  await expect(
    page.getByText("Tests image and evidence presentation", { exact: true }),
  ).toBeVisible();
  for (const theme of ["professional", "f1"]) {
    if (theme === "f1") await page.locator("#theme-toggle").click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await page.evaluate(() => {
        const figure = document.querySelector<HTMLElement>(".project-media")!;
        const caption = figure
          .querySelector("figcaption")!
          .getBoundingClientRect();
        const image = figure.querySelector("img")!;
        const panel = document.querySelector<HTMLElement>(".metrics-panel")!;
        const article = panel.querySelector("article")!.getBoundingClientRect();
        const style = getComputedStyle(panel);
        return {
          captionFits:
            caption.bottom <= figure.getBoundingClientRect().bottom + 1,
          ratioError: Math.abs(
            image.clientWidth / image.clientHeight -
              image.naturalWidth / image.naturalHeight,
          ),
          left:
            article.left -
            panel.getBoundingClientRect().left -
            parseFloat(style.paddingLeft) -
            parseFloat(style.borderLeftWidth),
          right:
            panel.getBoundingClientRect().right -
            article.right -
            parseFloat(style.paddingRight) -
            parseFloat(style.borderRightWidth),
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });
      expect(bounds.captionFits).toBe(true);
      expect(bounds.ratioError).toBeLessThan(0.02);
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeGreaterThanOrEqual(-1);
      expect(bounds.overflow).toBeLessThanOrEqual(1);
      if ([320, 1440].includes(width)) {
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(
          [],
        );
        await page.screenshot({
          path: testInfo.outputPath(`fixture-${theme}-${width}.png`),
          fullPage: true,
        });
      }
    }
  }
});

test("content reflows under 200 percent CSS zoom", async ({ page }) => {
  for (const route of ["/", "/projects/", "/projects/sefgh/"]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route);
    await page.addStyleTag({ content: "html { zoom: 2; }" });
    for (const theme of ["professional", "f1"]) {
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await page.locator("#theme-toggle").click();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  }
});
