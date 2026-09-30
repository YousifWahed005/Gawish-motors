import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile, unlink } from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const ctx = await browser.newContext({ reducedMotion: "reduce" });
const page = await ctx.newPage();
const base = process.env.VERIFY_URL || "http://localhost:3001";
const original = await readFile("data/content.json", "utf8");
let uploaded;
try {
  assert.equal(
    (await ctx.request.get(`${base}/api/admin/content`)).status(),
    401,
  );
  assert.equal(
    (
      await ctx.request.post(`${base}/api/admin/session`, {
        headers: { Origin: "https://example.com" },
        data: { password: "verification-only-password" },
      })
    ).status(),
    403,
  );
  await page.goto(`${base}/admin`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("verification-only-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("heading", { name: "Your content, in one place." })
    .waitFor();
  for (const width of [300, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag2aaa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
    );
  }
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  assert.equal(await page.locator(".admin-editor").getAttribute("dir"), "rtl");
  await page
    .getByLabel("العنوان", { exact: true })
    .first()
    .fill("اختبار محتوى باللغة العربية");
  await page.getByRole("button", { name: "English", exact: true }).click();
  assert.equal(await page.locator(".admin-editor").getAttribute("dir"), "ltr");
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  assert.equal(
    await page.getByLabel("العنوان", { exact: true }).first().inputValue(),
    "اختبار محتوى باللغة العربية",
  );
  const content = await (
    await ctx.request.get(`${base}/api/admin/content`)
  ).json();
  content.en.hero.title = "Verified English draft title";
  content.ar.hero.title = "عنوان عربي للتحقق";
  const saved = await ctx.request.put(`${base}/api/admin/content`, {
    headers: { Origin: base },
    data: content,
  });
  assert.equal(saved.status(), 200);
  assert.equal(
    JSON.parse(await readFile("data/content.json", "utf8")).en.hero.title,
    "Verified English draft title",
  );
  const invalid = await ctx.request.put(`${base}/api/admin/content`, {
    headers: { Origin: base },
    data: {
      ...content,
      en: {
        ...content.en,
        hero: { ...content.en.hero, image: "javascript:alert(1)" },
      },
    },
  });
  assert.equal(invalid.status(), 400);
  const csrf = await ctx.request.put(`${base}/api/admin/content`, {
    headers: { Origin: "https://example.com" },
    data: content,
  });
  assert.equal(csrf.status(), 401);
  const screenshot = await page.screenshot();
  const upload = await ctx.request.post(`${base}/api/admin/upload`, {
    headers: { Origin: base },
    multipart: {
      file: { name: "test.png", mimeType: "image/png", buffer: screenshot },
    },
  });
  assert.equal(upload.status(), 200);
  uploaded = (await upload.json()).url;
  assert.equal((await ctx.request.get(base + uploaded)).status(), 200);
  const svg = await ctx.request.post(`${base}/api/admin/upload`, {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "test.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from("<svg/>"),
      },
    },
  });
  assert.equal(svg.status(), 400);
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/admin/session") &&
        r.request().method() === "DELETE",
    ),
    page.getByRole("button", { name: "Sign out", exact: true }).click(),
  ]);
  assert.equal(
    (await ctx.request.get(`${base}/api/admin/content`)).status(),
    401,
  );
  console.log(
    "PASS: auth, cross-origin rejection, editable content persistence, schema validation, raster upload/media delivery, SVG rejection, logout, admin AAA axe checks and 300px layout.",
  );
} finally {
  await writeFile("data/content.json", original);
  if (uploaded) await unlink("public/uploads/" + uploaded.split("/").pop());
  await browser.close();
}
