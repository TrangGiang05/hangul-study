import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";

describe("E2E: Light / Dark Mode & Persistence (Phase 10.7.5)", () => {
  let page;

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9445 });
  });

  after(async () => {
    if (page) {
      await page.close();
    }
  });

  it("1. Settings page loads with theme configuration options", async () => {
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Cài đặt");
    await page.waitForText("Giao diện hiển thị");
    await page.waitForSelector("#theme-light-btn");
    await page.waitForSelector("#theme-dark-btn");
  });

  it("2. Switching to Dark mode takes effect immediately without reload", async () => {
    await page.click("#theme-dark-btn");
    await new Promise((r) => setTimeout(r, 400));

    const htmlTheme = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        hasDarkClass: el.classList.contains("dark"),
        dataTheme: el.getAttribute("data-theme"),
        storedTheme: localStorage.getItem("theme"),
      };
    });

    assert.strictEqual(htmlTheme.hasDarkClass, true, "<html> must contain 'dark' class");
    assert.strictEqual(htmlTheme.dataTheme, "dark", "<html> data-theme must be 'dark'");
    assert.strictEqual(htmlTheme.storedTheme, "dark", "localStorage theme must be 'dark'");
  });

  it("3. Theme persists across page reloads", async () => {
    await page.navigate("http://localhost:3000/settings");
    await page.waitForSelector("#theme-dark-btn");

    const htmlTheme = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        hasDarkClass: el.classList.contains("dark"),
        dataTheme: el.getAttribute("data-theme"),
        storedTheme: localStorage.getItem("theme"),
      };
    });

    assert.strictEqual(htmlTheme.hasDarkClass, true, "<html> must retain 'dark' class after reload");
    assert.strictEqual(htmlTheme.dataTheme, "dark", "<html> data-theme must retain 'dark' after reload");
  });

  it("4. Theme persists across client navigation to other routes", async () => {
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");

    let isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assert.strictEqual(isDark, true, "Home page must retain dark mode");

    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("Từ vựng");

    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assert.strictEqual(isDark, true, "Vocabulary page must retain dark mode");

    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");

    isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assert.strictEqual(isDark, true, "AI Tutor page must retain dark mode");
  });

  it("5. Switching back to Light mode takes effect immediately", async () => {
    await page.navigate("http://localhost:3000/settings");
    await page.waitForSelector("#theme-light-btn");

    await page.click("#theme-light-btn");
    await new Promise((r) => setTimeout(r, 400));

    const htmlTheme = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        hasDarkClass: el.classList.contains("dark"),
        dataTheme: el.getAttribute("data-theme"),
        storedTheme: localStorage.getItem("theme"),
      };
    });

    assert.strictEqual(htmlTheme.hasDarkClass, false, "<html> must NOT contain 'dark' class");
    assert.strictEqual(htmlTheme.dataTheme, "light", "<html> data-theme must be 'light'");
    assert.strictEqual(htmlTheme.storedTheme, "light", "localStorage theme must be 'light'");
  });

  it("6. Light mode persists across navigation", async () => {
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");

    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    assert.strictEqual(isDark, false, "Home page must be in light mode");
  });
});
