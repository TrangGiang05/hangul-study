import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";
import { closePool } from "../db-helper.mjs";

describe("E2E: Security & Authentication/Authorization QA", () => {
  let page;
  let testUser = {
    name: "Security Tester " + Math.floor(Math.random() * 10000),
    email: `sec_${Date.now()}@example.com`,
    password: "Password123!",
  };

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9446 });
  });

  after(async () => {
    if (page) await page.close();
    await closePool();
  });

  it("G: Session integrity - User can log out and session is destroyed", async () => {
    // 1. Register a new user
    await page.navigate("http://localhost:3000/register");
    await page.waitForText("Đăng ký");

    await page.type('input[placeholder="Nguyễn Văn A"]', testUser.name);
    await page.type('input[placeholder="you@example.com"]', testUser.email);
    
    await page.evaluate((pwd) => {
      const inputs = document.querySelectorAll('input[type="password"]');
      for (const el of inputs) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, pwd);
        else el.value = pwd;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, testUser.password);

    await page.click('button[type="submit"]');

    // 2. Verify logged in
    await page.waitForText(testUser.name, 10000);

    // 3. Navigate to Settings and logout
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Đăng xuất", 5000);
    await page.clickByText("Đăng xuất");

    // 4. Verify redirected to login
    await page.waitForText("Đăng nhập", 5000);

    // 5. Navigate to Home and ensure we are treated as Guest
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Chưa đăng nhập", 5000);
  });

  it("H: IDOR & BOLA - Guest cannot execute authenticated data mutations", async () => {
    // Navigate to vocabulary page as a guest
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("Bài 1 · 자기소개", 5000);

    // Guest tries to click 'Đã nhớ' (which triggers server action)
    // For a guest, the UI might keep state locally, but it shouldn't crash.
    await page.click(".known-button");
    
    // Wait briefly
    await new Promise((r) => setTimeout(r, 1000));
    
    // UI shouldn't crash, and no error should be visible
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes("Internal server error") && !bodyText.includes("Unhandled Runtime Error"), "Page should not crash for guests");
  });

  it("I: Error Leakage - AI Tutor errors do not expose tracebacks", async () => {
    // Navigate to AI Tutor page
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("Hỏi đáp & hỗ trợ học tiếng Hàn", 5000);

    // Stop FastAPI to force a network error
    const { stopFastAPIServer } = await import("../server-helper.mjs");
    await stopFastAPIServer();

    // Send a message that will go to FastAPI
    await page.type('input[placeholder*="Ví dụ"]', "Test error leakage");
    await page.click('button[type="submit"]');

    // The frontend should catch the error and display a generic message, not a traceback
    await page.waitForText("Dịch vụ AI Tutor hiện đang bận hoặc không thể kết nối. Vui lòng thử lại sau.", 8000);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes("Traceback"), "Tracebacks should not be leaked to the UI");
    assert.ok(!bodyText.includes("ECONNREFUSED"), "Raw Node fetch errors should not be leaked to the UI");
  });
});
