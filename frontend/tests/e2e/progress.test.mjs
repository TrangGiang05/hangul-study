import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";
import {
  getUserByEmail,
  getUserItemProgresses,
  getUserLessonProgress,
  getUserPracticeAttempts,
  closePool,
} from "../db-helper.mjs";

describe("E2E: User Progress Persistence (Sections C, D, E, F)", () => {
  let page;
  let dbUser = null;
  const testUser = {
    name: "Progress Learner " + Math.floor(Math.random() * 10000),
    email: `prog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "Password123!",
  };

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9446 });

    // Register test user
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

    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1", 15000);
    await page.waitForText(testUser.name, 8000);

    dbUser = await getUserByEmail(testUser.email);
    assert.ok(dbUser, "Registered user should exist in database");
  });

  after(async () => {
    if (page) {
      await page.close();
    }
    await closePool();
  });

  it("C: Vocabulary progress persistence across page refresh", async () => {
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("자기소개");

    // Click 'Đã nhớ' button to mark mastery
    await page.click(".known-button");

    // Button should now have 'is-selected'
    await page.waitForSelector(".known-button.is-selected", 5000);

    // Wait for Server Action to persist in database
    await new Promise((r) => setTimeout(r, 1000));

    // Verify database has vocabulary item marked as mastered
    const vocabProgress = await getUserItemProgresses(dbUser.id, "vocabulary");
    assert.ok(vocabProgress.length > 0, "Vocabulary progress must be saved in database");
    assert.ok(vocabProgress.some((p) => p.mastered_at !== null), "At least one vocab item should have mastered_at set");

    // Refresh page and confirm mastery state is preserved in UI
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("자기소개");
    await page.waitForSelector(".known-button.is-selected", 5000);
  });

  it("D: Grammar progress persistence across page refresh", async () => {
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("자기소개");

    // Click 'Đánh dấu đã học' button
    await page.click(".grammar-learned-button");

    // Text changes to '✓ Đã học'
    await page.waitForText("✓ Đã học", 5000);

    // Wait for Server Action to persist in database
    await new Promise((r) => setTimeout(r, 1000));

    // Verify database has grammar item marked as mastered
    const grammarProgress = await getUserItemProgresses(dbUser.id, "grammar");
    assert.ok(grammarProgress.length > 0, "Grammar progress must be saved in database");
    assert.ok(grammarProgress.some((p) => p.mastered_at !== null), "Grammar item should have mastered_at set");

    // Refresh page and verify state is restored
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("자기소개");
    await page.waitForText("✓ Đã học", 5000);
  });

  it("E: Practice multiple-choice and typing completion", async () => {
    await page.navigate("http://localhost:3000/practice");
    await page.waitForText("LUYỆN TẬP");
    await page.waitForText("Bài 1 · 자기소개");

    // 1. Multiple-choice: Answer questions until completion screen
    const startTime = Date.now();
    while (Date.now() - startTime < 30000) {
      const isCompleted = await page.evaluate(() => !!document.querySelector(".practice-result"));
      if (isCompleted) break;

      await page.evaluate(() => {
        const choice = document.querySelector(".practice-choice:not([disabled])");
        if (choice) choice.click();
      });

      await new Promise((r) => setTimeout(r, 80));

      await page.evaluate(() => {
        const nextBtn = document.querySelector(".practice-next-button");
        if (nextBtn) nextBtn.click();
      });

      await new Promise((r) => setTimeout(r, 120));
    }

    // Verify completion screen
    await page.waitForText("Bạn đã hoàn thành bài luyện tập.", 8000);

    // Wait for practice attempt Server Action
    await new Promise((r) => setTimeout(r, 1200));

    // Verify practice attempt in database
    const attempts = await getUserPracticeAttempts(dbUser.id);
    assert.ok(attempts.length > 0, "Practice attempt must be persisted in database");
    assert.strictEqual(attempts[0].mode, "multiple-choice");

    // 2. Typing practice: Switch mode and verify typing flow
    await page.navigate("http://localhost:3000/practice");
    await page.waitForText("LUYỆN TẬP");

    await page.clickByText("Gõ từ vựng");
    await page.waitForText("GÕ TỪ VỰNG", 5000);
    await page.waitForSelector("#typing-answer", 5000);

    // Submit an answer
    await page.type("#typing-answer", "안녕하세요");
    await page.click('form.typing-form button[type="submit"]');

    // Feedback appears without crashing
    await page.waitForSelector(".practice-feedback", 5000);
  });

  it("F: Lesson progress tracking (in_progress status recorded)", async () => {
    // Open lesson-01
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("TIẾNG HÀN TỔNG HỢP · QUYỂN 1");
    await page.waitForText("Bài 1 · 자기소개");

    // Wait for LessonTracker to fire startLesson
    await new Promise((r) => setTimeout(r, 1500));

    // Verify in database: status must be in_progress
    const progress = await getUserLessonProgress(dbUser.id, "tong-hop", "book-01", "lesson-01");
    assert.ok(progress, "Lesson progress must be recorded in database");
    assert.strictEqual(progress.status, "in_progress", "Initial lesson status must be in_progress");
    assert.ok(progress.last_accessed_at, "last_accessed_at must be populated");

    const firstAccessTime = new Date(progress.last_accessed_at).getTime();

    // Navigate to Home dashboard and back to verify persistence
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");

    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("Bài 1 · 자기소개");
    await new Promise((r) => setTimeout(r, 1500));

    // Re-verify database state: progress remains in_progress and lastAccessedAt is maintained
    const updatedProgress = await getUserLessonProgress(dbUser.id, "tong-hop", "book-01", "lesson-01");
    assert.strictEqual(updatedProgress.status, "in_progress");
    assert.ok(
      new Date(updatedProgress.last_accessed_at).getTime() >= firstAccessTime,
      "last_accessed_at should be maintained or updated"
    );
  });
});
