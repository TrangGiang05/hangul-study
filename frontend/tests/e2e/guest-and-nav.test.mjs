import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";

describe("E2E: Guest Access & Navigation (Sections A & H)", () => {
  let page;

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9444 });
  });

  after(async () => {
    if (page) {
      await page.close();
    }
  });

  it("A.1: Home loads correctly with expected guest state", async () => {
    await page.navigate("http://localhost:3000/");
    const title = await page.getTitle();
    assert.ok(title.includes("Hangul Study"), `Expected title to include Hangul Study, got: ${title}`);
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");
    await page.waitForText("Mỗi ngày một chút");
  });

  it("A.2: Alphabet page loads correctly", async () => {
    await page.navigate("http://localhost:3000/alphabet");
    await page.waitForText("Bảng chữ cái");
    await page.waitForText("chữ cái");
  });

  it("A.3: Vocabulary page loads correctly", async () => {
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("Bài 1 · 자기소개");
    await page.waitForText("từ vựng");
  });

  it("A.4: Grammar page loads correctly", async () => {
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("Bài 1 · 자기소개");
    await page.waitForText("điểm ngữ pháp");
  });

  it("A.5: Practice page loads correctly", async () => {
    await page.navigate("http://localhost:3000/practice");
    await page.waitForText("LUYỆN TẬP");
    await page.waitForText("Bài 1 · 자기소개");
  });

  it("A.6: AI Tutor full-screen page loads correctly", async () => {
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");
    await page.waitForText("Hỏi đáp & hỗ trợ học tiếng Hàn");
  });

  it("A.7: Course/Lesson route loads correctly", async () => {
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("TIẾNG HÀN TỔNG HỢP · QUYỂN 1");
    await page.waitForText("Bài 1 · 자기소개");
  });

  it("H.1: Settings route (/settings) loads without 404", async () => {
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Cài đặt");
    await page.waitForText("Thông tin tài khoản");
    await page.waitForText("Bạn đang sử dụng tài khoản Khách");
  });

  it("H.2: Course outline route (/courses/tong-hop) loads without 404", async () => {
    await page.navigate("http://localhost:3000/courses/tong-hop");
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");
    await page.waitForText("Quyển 1: Khởi động & Giao tiếp cơ bản");
    await page.waitForText("Bài 1: 자기소개");
  });

  it("H.3: Sidebar navigation links all navigate to valid routes", async () => {
    await page.navigate("http://localhost:3000/");

    // Click 'Bảng chữ cái' link in sidebar
    await page.click('aside a[href="/alphabet"]');
    await page.waitForText("Bảng chữ cái");

    // Click 'Từ vựng' link in sidebar
    await page.click('aside a[href="/vocabulary"]');
    await page.waitForText("Bài 1 · 자기소개");

    // Click 'Ngữ pháp' link in sidebar
    await page.click('aside a[href="/grammar"]');
    await page.waitForText("điểm ngữ pháp");

    // Click 'Ôn tập' link in sidebar
    await page.click('aside a[href="/practice"]');
    await page.waitForText("LUYỆN TẬP");

    // Click 'AI Tutor' link in sidebar
    await page.click('aside a[href="/ai-tutor"]');
    await page.waitForText("AI Tutor");

    // Click 'Cài đặt' link in sidebar
    await page.click('aside a[href="/settings"]');
    await page.waitForText("Cài đặt");
  });
});
