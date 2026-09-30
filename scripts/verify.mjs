import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await mkdir("verification", { recursive: true });
for (const width of [300, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  const targets = await page.locator("a,button,summary").evaluateAll((nodes) =>
    nodes
      .filter((n) => {
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
      })
      .map((n) => ({
        text: n.textContent,
        width: n.getBoundingClientRect().width,
        height: n.getBoundingClientRect().height,
      })),
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag2aaa", "wcag21aa"])
    .analyze();
  assert.equal(overflow, false, `Horizontal overflow at ${width}px`);
  assert.deepEqual(targets, [], `Small touch targets at ${width}px`);
  assert.deepEqual(
    axe.violations.map((v) => v.id),
    [],
    `Accessibility violations at ${width}px`,
  );
  console.log(
    JSON.stringify({
      width,
      overflow,
      targets,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    }),
  );
  await page
    .locator("img")
    .evaluateAll((images) => images.forEach((img) => (img.loading = "eager")));
  await page.waitForLoadState("networkidle");
  assert.deepEqual(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src),
      ),
    [],
  );
  await page.screenshot({
    path: `verification/home-${width}.png`,
    fullPage: true,
  });
}
await page.goto("http://localhost:3000/admin");
console.log(
  "admin",
  JSON.stringify(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag2aaa", "wcag21aa"])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ),
);
console.log(
  "unauthorized content",
  (await page.request.get("http://localhost:3000/api/admin/content")).status(),
);
console.log("errors", errors);
assert.deepEqual(errors, []);
await browser.close();
