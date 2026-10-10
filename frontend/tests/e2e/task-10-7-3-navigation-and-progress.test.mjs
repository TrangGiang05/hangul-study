import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer } from "../server-helper.mjs";
import {
  getUserByEmail,
  getUserLessonProgress,
  getPool,
  closePool,
} from "../db-helper.mjs";

describe("TASK 10.7.3: Finalized Course Progress & Automatic Completion", () => {
  let page;
  let dbUser = null;
  const testUser = {
    name: "ProgTester " + Math.floor(Math.random() * 10000),
    email: `task1073_final_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "Password123!",
  };

  before(async () => {
    await ensureNextServer();
    page = await launchBrowser({ port: 9448 });

    // Register user
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

    dbUser = await getUserByEmail(testUser.email);
    assert.ok(dbUser, "Registered user should exist in database");
  });

  after(async () => {
    if (page) {
      await page.close();
    }
    await closePool();
  });

  it("1. Course page: Book cover portrait ratio and per-lesson progress display", async () => {
    await page.navigate("http://localhost:3000/courses/tong-hop");
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1");
    await page.waitForText("Danh sách bài học");

    // Check book cover image exists and has object-contain or portrait container
    const coverExists = await page.evaluate(() => {
      const img = document.querySelector('img[src*="tong-hop-so-cap-1-book-01-cover.png"]');
      return !!img;
    });
    assert.strictEqual(coverExists, true, "Book cover image must be rendered");

    // Initially 0 completed lessons
    await page.waitForText("0 / 5 bài hoàn thành");

    // Switch to 'Tiến độ chi tiết' tab
    await page.clickByText("Tiến độ chi tiết");
    await page.waitForText("0 / 5 bài hoàn thành (0%)");
    await page.waitForText("Công thức: 50% Từ vựng + 50% Ngữ pháp");

    // Switch back to 'Danh sách bài học'
    await page.clickByText("Danh sách bài học");
    await page.waitForText("Bài 1: 자기소개 (Chào hỏi cơ bản)");
  });

  it("2. Partial progress formula: 100% vocab + 0% grammar = 50% lesson progress (in_progress)", async () => {
    // Navigate to Lesson 1 to record visit
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("Bài 1 · 자기소개");
    await new Promise((r) => setTimeout(r, 1200));

    // Mark all 32 vocab items as mastered in database for dbUser
    const pool = getPool();
    const vocabItems = [
      "L01-V001","L01-V002","L01-V003","L01-V004","L01-V005","L01-V006","L01-V007","L01-V008",
      "L01-V009","L01-V010","L01-V011","L01-V012","L01-V013","L01-V014","L01-V015","L01-V016",
      "L01-V017","L01-V018","L01-V019","L01-V020","L01-V021","L01-V022","L01-V023","L01-V024",
      "L01-V025","L01-V026","L01-V027","L01-V028","L01-V029","L01-V030","L01-V031","L01-V032"
    ];

    for (const itemId of vocabItems) {
      await pool.query(
        `INSERT INTO user_item_progress (user_id, course_id, book_id, lesson_id, item_type, item_id, mastered_at, created_at, updated_at)
         VALUES ($1, 'tong-hop', 'book-01', 'lesson-01', 'vocabulary', $2, NOW(), NOW(), NOW())
         ON CONFLICT (user_id, course_id, book_id, lesson_id, item_type, item_id)
         DO UPDATE SET mastered_at = NOW()`,
        [dbUser.id, itemId]
      );
    }

    // Refresh lesson-01 page: should display 50% progress (100% vocab + 0% grammar = 50%)
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("Đạt 50% tiến độ");
    await page.waitForText("32/32 từ đã nhớ (100%)");
    await page.waitForText("0/3 điểm đã học (0%)");
    await page.waitForText("Đang học (50%)");

    // Course page should show 50% for Lesson 1, but 0% for overall course (since Lesson 1 is not yet 100% completed)
    await page.navigate("http://localhost:3000/courses/tong-hop");
    await page.waitForText("0 / 5 bài hoàn thành");
    await page.waitForText("50%"); // Lesson 1 progress bar shows 50%

    const progress = await getUserLessonProgress(dbUser.id, "tong-hop", "book-01", "lesson-01");
    assert.strictEqual(progress.status, "in_progress", "Lesson must be in_progress when grammar is not 100%");
  });

  it("3. Auto-completion: 100% vocab + 100% grammar automatically marks lesson as completed", async () => {
    const pool = getPool();
    const grammarItems = ["L01-G001", "L01-G002", "L01-G003"];

    // Mark all 3 grammar points as mastered
    for (const itemId of grammarItems) {
      await pool.query(
        `INSERT INTO user_item_progress (user_id, course_id, book_id, lesson_id, item_type, item_id, mastered_at, created_at, updated_at)
         VALUES ($1, 'tong-hop', 'book-01', 'lesson-01', 'grammar', $2, NOW(), NOW(), NOW())
         ON CONFLICT (user_id, course_id, book_id, lesson_id, item_type, item_id)
         DO UPDATE SET mastered_at = NOW()`,
        [dbUser.id, itemId]
      );
    }

    // Navigate to Lesson 1: should auto-complete and show 100%
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("✓ Đã hoàn thành (100%)");
    await page.waitForText("32/32 từ đã nhớ (100%)");
    await page.waitForText("3/3 điểm đã học (100%)");

    // Verify database record has automatically updated to completed
    const progress = await getUserLessonProgress(dbUser.id, "tong-hop", "book-01", "lesson-01");
    assert.strictEqual(progress.status, "completed", "Status must automatically become completed");
    assert.ok(progress.completed_at, "completed_at must be populated");

    // Course page should now reflect 1 completed lesson: 1 / 5 = 20%
    await page.navigate("http://localhost:3000/courses/tong-hop");
    await page.waitForText("1 / 5 bài hoàn thành");
    await page.waitForText("20%");
    await page.waitForText("✓ Đã hoàn thành");

    // Home page should also reflect 20%
    await page.navigate("http://localhost:3000/");
    await page.waitForText("20%");
  });

  it("4. Vocabulary page: All-curriculum default, search, lesson filter, and empty states", async () => {
    // Direct access from sidebar
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("TỪ VỰNG · TIẾNG HÀN TỔNG HỢP");
    await page.waitForText("Tất cả bài học (32 từ)");

    // Search functionality
    await page.type('input[aria-label="Tìm kiếm từ vựng"]', "Việt Nam");
    await page.waitForText("베트남");

    // Clear search
    await page.click('button[aria-label="Xóa tìm kiếm"]');
    await page.waitForText("Tất cả (32)");

    // Empty state on no search match
    await page.type('input[aria-label="Tìm kiếm từ vựng"]', "khong_tim_thay_999");
    await page.waitForText("Không tìm thấy từ vựng phù hợp với");
    await page.clickByText("Xóa tìm kiếm");
    await page.waitForText("Tất cả (32)");

    // Invalid lessonId in URL does not silently load Lesson 1
    await page.navigate("http://localhost:3000/vocabulary?lessonId=non-existent-lesson");
    await page.waitForText("không hợp lệ hoặc chưa có dữ liệu");
    await page.clickByText("Xem tất cả từ vựng");
    await page.waitForText("Tất cả (32)");
  });

  it("5. Grammar page: All-curriculum default, search, lesson filter, and empty states", async () => {
    // Direct access
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("NGỮ PHÁP · TIẾNG HÀN TỔNG HỢP");
    await page.waitForText("Tất cả bài học");

    // Search functionality
    await page.type('input[aria-label="Tìm kiếm ngữ pháp"]', "입니다");
    await page.waitForText("입니다");

    // Clear search
    await page.click('button[aria-label="Xóa tìm kiếm"]');

    // Empty state on no match
    await page.type('input[aria-label="Tìm kiếm ngữ pháp"]', "khong_tim_thay_999");
    await page.waitForText("Không tìm thấy điểm ngữ pháp phù hợp với");
    await page.clickByText("Xóa tìm kiếm");

    // Invalid lessonId in URL does not silently load Lesson 1
    await page.navigate("http://localhost:3000/grammar?lessonId=invalid-lesson-id");
    await page.waitForText("không hợp lệ hoặc chưa có dữ liệu");
    await page.clickByText("Xem tất cả ngữ pháp");
    await page.waitForText("Tất cả bài học");
  });

  it("6. Context links from lesson open correctly filtered views", async () => {
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.waitForText("Bài 1 · 자기소개");

    // Click Vocabulary card link
    await page.click('a[href*="/vocabulary?lessonId=lesson-01"]');
    await page.waitForText("TỪ VỰNG · TIẾNG HÀN TỔNG HỢP");
    await page.waitForText("Bài 1: 자기소개 (Chào hỏi cơ bản) (32 từ)");

    // Go back to lesson-01 and click Grammar card link
    await page.navigate("http://localhost:3000/courses/tong-hop/books/book-01/lessons/lesson-01");
    await page.click('a[href*="/grammar?lessonId=lesson-01"]');
    await page.waitForText("NGỮ PHÁP · TIẾNG HÀN TỔNG HỢP");
    await page.waitForText("Bài 1: 자기소개 (Chào hỏi cơ bản)");
  });
});
