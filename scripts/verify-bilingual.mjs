import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const base = process.env.VERIFY_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("verification", { recursive: true });
try {
  for (const locale of ["en", "ar"])
    for (const theme of ["dark", "light"])
      for (const width of [300, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(base + (locale === "ar" ? "/ar" : "/"));
        await page.evaluate((t) => {
          localStorage.setItem("gawish-theme", t);
        }, theme);
        await page.reload();
        await page.waitForLoadState("networkidle");
        assert.equal(await page.locator("html").getAttribute("lang"), locale);
        assert.equal(
          await page.locator("html").getAttribute("dir"),
          locale === "ar" ? "rtl" : "ltr",
        );
        assert.equal(
          await page.locator("html").getAttribute("data-theme"),
          theme,
        );
        assert.equal(await page.locator("h1").count(), 1);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${locale}/${theme}/${width}: overflow`,
        );
        const small = await page
          .locator("a,button,summary")
          .evaluateAll((nodes) =>
            nodes
              .filter((n) => {
                const r = n.getBoundingClientRect();
                return (
                  r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)
                );
              })
              .map((n) => ({
                text: n.textContent,
                w: n.getBoundingClientRect().width,
                h: n.getBoundingClientRect().height,
              })),
          );
        assert.deepEqual(small, [], `${locale}/${theme}/${width}: targets`);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag2aaa", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
          [],
          `${locale}/${theme}/${width}: accessibility`,
        );
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.forEach((img) => (img.loading = "eager")),
          );
        await page.waitForLoadState("networkidle");
        await page.waitForFunction(() =>
          Array.from(document.images).every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        console.log(
          `PASS ${locale} ${theme} ${width}px: layout, language/direction, images, 44px targets, axe AAA`,
        );
        if (width === 300 || width === 1440) {
          await page.screenshot({
            path: `verification/${locale}-${theme}-${width}-top.png`,
          });
          await page.screenshot({
            path: `verification/${locale}-${theme}-${width}.png`,
            fullPage: true,
          });
        }
      }
  await page.goto(base + "/");
  await page.locator(".language-switch").click();
  assert.equal(new URL(page.url()).pathname, "/ar");
  assert.equal(await page.locator("html").getAttribute("lang"), "ar");
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.locator(".theme-toggle").click();
  await page.waitForFunction(
    (t) => document.documentElement.dataset.theme !== t,
    theme,
  );
  assert.notEqual(await page.locator("html").getAttribute("data-theme"), theme);
  const chosen = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-theme"), chosen);
  const motionContext = await browser.newContext({
    reducedMotion: "no-preference",
  });
  const animated = await motionContext.newPage();
  await animated.goto(base + "/ar");
  await animated.waitForFunction(
    () => document.querySelectorAll(".reveal-pending").length > 0,
  );
  await animated.locator("#services").scrollIntoViewIfNeeded();
  await animated.waitForFunction(
    () =>
      !document
        .querySelector("#services [data-reveal]")
        ?.classList.contains("reveal-pending"),
  );
  await animated.emulateMedia({ reducedMotion: "reduce" });
  await animated.waitForFunction(
    () => document.querySelectorAll(".reveal-pending").length === 0,
  );
  await motionContext.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS language switch, persistent theme toggle, scroll reveal, live reduced-motion change, zero browser errors",
  );
} finally {
  await browser.close();
}
