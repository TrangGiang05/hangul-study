import { describe, it, before, after } from "node:test";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";

describe("E2E: Authentication Flow (Section B)", () => {
  let page;
  const testUser = {
    name: "Test Learner " + Math.floor(Math.random() * 10000),
    email: `learner_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "Password123!",
  };

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9445 });
  });

  after(async () => {
    if (page) {
      await page.close();
    }
  });

  it("B.1: Register with a new valid account", async () => {
    await page.navigate("http://localhost:3000/register");
    await page.waitForText("Đăng ký");

    await page.type('input[placeholder="Nguyễn Văn A"]', testUser.name);
    await page.type('input[placeholder="you@example.com"]', testUser.email);

    // Fill both password and confirm password inputs
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

    // After successful registration, user should be redirected to home page "/"
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1", 15000);
    // Sidebar should reflect authenticated state
    await page.waitForText(testUser.name, 8000);
  });

  it("B.2: Session remains available after navigation and refresh", async () => {
    // Navigate to /settings
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Cài đặt");
    await page.waitForText(testUser.name);
    await page.waitForText(testUser.email);
    await page.waitForText("Đăng xuất");

    // Refresh page
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText(testUser.name);
    await page.waitForText(testUser.email);
  });

  it("B.3: Logout from Settings page removes the authenticated session", async () => {
    await page.navigate("http://localhost:3000/settings");
    // Specifically click Settings section logout button
    await page.evaluate(() => {
      const section = document.querySelector("section");
      const btn = Array.from(section?.querySelectorAll("button") || []).find((b) => b.textContent?.includes("Đăng xuất"));
      if (btn) btn.click();
    });
    // Wait for redirect to /login
    await page.waitForText("Đăng nhập", 10000);

    // Confirm get-session returns no session
    const sessionRes = await page.evaluate(async () => {
      const res = await fetch("/api/auth/get-session");
      return res.ok ? await res.json() : null;
    });
    if (sessionRes?.session || sessionRes?.user) {
      throw new Error("Session was not invalidated on server after Settings logout");
    }

    // Visit settings page and confirm guest banner
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Bạn đang sử dụng tài khoản Khách");

    // Visit home page and confirm guest status
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Chưa đăng nhập");
  });

  it("B.4: Login with the previously created account", async () => {
    await page.navigate("http://localhost:3000/login");
    await page.waitForText("Đăng nhập");

    await page.type('input[placeholder="you@example.com"]', testUser.email);
    await page.type('input[placeholder="••••••••"]', testUser.password);

    await page.click('button[type="submit"]');

    // Should redirect to home and show user name
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1", 15000);
    await page.waitForText(testUser.name, 8000);
  });

  it("B.5: Logout from Sidebar removes session and reflects guest state", async () => {
    // Click Sidebar logout button while on Home page
    await page.navigate("http://localhost:3000/");
    await page.waitForText(testUser.name);
    await page.evaluate(() => {
      const footer = document.querySelector(".sidebar-footer");
      const btn = footer?.querySelector("button");
      if (btn && btn.textContent?.includes("Đăng xuất")) {
        btn.click();
      }
    });
    // Wait for redirect to /login
    await page.waitForText("Đăng nhập", 10000);

    // Refresh and visit home to verify Guest state
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Chưa đăng nhập");
  });
});
