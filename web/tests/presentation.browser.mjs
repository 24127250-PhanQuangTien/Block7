// Focused hero/icon checks. All API reads/writes use fixtures, never the real DB.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.WEB_TEST_URL || "http://localhost:5173";
const evidence = new URL("../../docs/part2-evidence/", import.meta.url);
const temporaryEvidence = new URL("../../.temp/part2-evidence/", import.meta.url);
await mkdir(evidence, { recursive: true });
await mkdir(temporaryEvidence, { recursive: true });
const chef = { id: 42, name: "Đặng Văn Đạt", specialty: "Hải sản và ẩm thực Việt Nam", createdAt: "2026-01-01", dishes: [] };
const ingredient = { id: 1, name: "Thịt thăn bò Úc", quantity: 10, unit: "gam", category: "Thịt", createdAt: "2026-01-01", dishes: [] };
const dish = { id: 8, name: "Phở bò", price: 55000, category: "Món Nước", chefId: 42, chef, ingredients: [ingredient], available: true, description: "Hương vị Việt", imageUrl: "/assets/img/dishes/pho-bo.jpg" };
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function checkIconsAndLayout(page)
{
  const result = await page.evaluate(() =>
  {
    const invalid = [...document.querySelectorAll(".ui-icon")].filter((icon) =>
    {
      const r = icon.getBoundingClientRect();
      return r.width && (r.width > 48 || r.width < 16 || r.height < 16 || icon.getAttribute("aria-hidden") !== "true");
    }).map((icon) => icon.getAttribute("class"));
    return { invalid, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  assert.deepEqual(result.invalid, []);
  assert.equal(result.overflow, false);
}

async function screenshot(page, name)
{
  const retained = ["menu-1440.png", "menu-375.png", "menu-440.png", "admin-select-440.png", "chef-select-375.png", "error-440.png"];
  const target = retained.includes(name) ? evidence : temporaryEvidence;
  await page.screenshot({ type: "jpeg", quality: 85, path: new URL(name.replace(".png", ".jpg"), target).pathname.replace(/^\/(\w:)/, "$1") });
}

try
{
  for (const width of [1440, 375, 440])
  {
    const context = await browser.newContext({ viewport: { width, height: 956 }, isMobile: width < 768, hasTouch: width < 768 });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) =>
    {
      if (message.type() === "error" && message.text().startsWith("Warning:"))
      {
        errors.push(message.text());
      }
    });
    // Tests also prove hero/icons do not depend on a font or icon CDN.
    await page.route("https://**", (route) => route.abort());
    let failNext = false;
    let delayNext = false;
    let release;
    await page.route("http://localhost:3000/api/**", async (route) =>
    {
      const url = new URL(route.request().url());
      if (delayNext)
      {
        delayNext = false;
        await new Promise((resolve) => { release = resolve; });
      }
      if (failNext)
      {
        failNext = false;
        await route.fulfill({ status: 503, json: { message: "Không thể tải thực đơn. Vui lòng thử lại." } });
        return;
      }
      let data = /\/\d+$/.test(url.pathname) ? dish : [dish];
      if (url.pathname.includes("chefs"))
      {
        data = /\/\d+$/.test(url.pathname) ? chef : [chef];
      }
      if (url.pathname.includes("ingredients"))
      {
        data = /\/\d+$/.test(url.pathname) ? ingredient : [ingredient];
      }
      await route.fulfill({ json: { ok: true, data } });
    });
    await page.goto(base + "/");
    await page.waitForURL(base + "/dishes");
    const image = page.locator(".menu-hero img");
    await image.evaluate((el) => el.decode());
    assert.equal(await image.getAttribute("alt"), "");
    assert.equal(await image.getAttribute("fetchpriority"), "high");
    assert.equal(await image.evaluate((el) => el.naturalWidth), width < 600 ? 800 : 1600);
    const hero = await page.locator(".menu-hero").boundingBox();
    assert.ok(hero.height <= (width < 768 ? 460 : 520), JSON.stringify(hero));
    const nav = await page.locator(".navbar").boundingBox();
    const title = await page.locator("#menu-hero-title").boundingBox();
    assert.ok(title.y >= nav.y + nav.height);
    assert.equal(await page.locator('link[href*="font-awesome"]').count(), 0);
    await checkIconsAndLayout(page);
    await screenshot(page, `menu-${width}.png`);
    await page.getByRole("link", { name: "Khám phá thực đơn", exact: true }).click();
    await page.waitForFunction(() =>
    {
      const top = document.querySelector("#thuc-don").getBoundingClientRect().top;
      return top >= 80 && top <= 110;
    });
    assert.match(page.url(), /#thuc-don$/);
    await page.getByRole("textbox", { name: "Tìm món ăn", exact: true }).fill("phở");
    await page.getByRole("button", { name: "Tìm Kiếm", exact: true }).click();
    await page.waitForURL(/q=/);
    await page.getByRole("button", { name: "Xóa tìm kiếm món ăn", exact: true }).click();
    await page.waitForURL((url) => !url.searchParams.has("q"));

    if (width < 768)
    {
      await page.getByRole("button", { name: "Mở menu điều hướng", exact: true }).tap();
      assert.equal(await page.getByRole("button", { name: "Đóng menu điều hướng", exact: true }).getAttribute("aria-expanded"), "true");
      await page.getByRole("link", { name: "Cổng Quản Trị", exact: true }).tap();
      await page.waitForURL(base + "/admin/dishes");
      assert.equal(await page.getByRole("button", { name: "Mở menu điều hướng", exact: true }).getAttribute("aria-expanded"), "false");
    }
    else
    {
      await page.goto(base + "/admin/dishes");
    }
    await page.locator("#filter-status").click();
    assert.equal(await page.locator("#filter-status .lucide-chevron-down").count(), 1);
    await screenshot(page, `admin-select-${width}.png`);
    await page.getByRole("option", { name: "Đang phục vụ", exact: true }).click();
    await page.getByRole("link", { name: "Thêm Món Ăn Mới", exact: true }).click();
    await page.locator("#chefId").fill("dang");
    await page.getByRole("option", { name: /Đặng Văn Đạt/ }).click();
    await page.locator("#chefId").click();
    assert.equal(await page.getByRole("option", { selected: true }).locator(".lucide-check").count(), 1);
    await screenshot(page, `chef-select-${width}.png`);
    await page.locator("#chefId").press("Escape");
    await page.getByRole("textbox", { name: "Tìm nhanh nguyên liệu", exact: true }).fill("thịt");
    await page.getByRole("button", { name: "Xóa tìm kiếm nguyên liệu", exact: true }).click();
    assert.equal(await page.getByRole("textbox", { name: "Tìm nhanh nguyên liệu", exact: true }).inputValue(), "");
    await checkIconsAndLayout(page);

    for (const route of ["/admin/dishes/8", "/admin/dishes/8/delete", "/admin/chefs", "/admin/chefs/42/delete", "/admin/ingredients", "/admin/ingredients/1/delete", "/missing-page"])
    {
      await page.goto(base + route);
      await page.locator(".spa-loading").waitFor({ state: "hidden" });
      await checkIconsAndLayout(page);
      if (route.endsWith("/delete"))
      {
        assert.equal(await page.getByRole("button", { name: /Xác Nhận Xóa/ }).locator(".lucide-trash-2").count(), 1);
        await page.getByRole("link", { name: "Hủy Bỏ và Quay Lại", exact: true }).click();
      }
    }
    failNext = true;
    await page.goto(base + "/dishes?q=error");
    await page.getByRole("button", { name: "Thử Lại", exact: true }).waitFor();
    assert.equal(await page.locator(".spa-error-title .lucide-circle-alert").count(), 1);
    await screenshot(page, `error-${width}.png`);
    delayNext = true;
    await page.getByRole("button", { name: "Thử Lại", exact: true }).click();
    await page.getByRole("status", { name: "Đang tải dữ liệu" }).waitFor();
    assert.equal(await page.locator(".lucide-loader-circle").count(), 1);
    release();
    await page.locator(".spa-loading").waitFor({ state: "hidden" });
    assert.deepEqual(errors, []);
    console.log(`Hero, navigation, action icons, search, states and selectors passed: ${width}px`);
    await context.close();
  }
  console.log(`Chrome ${browser.version()}, Windows headless; mobile/touch simulated; API mocked.`);
}
finally
{
  await browser.close();
}
