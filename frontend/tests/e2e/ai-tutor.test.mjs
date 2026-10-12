import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer, ensureFastAPIServer, stopFastAPIServer } from "../server-helper.mjs";
import { getUserByEmail, getUserChatMessages, getUserConversations, closePool } from "../db-helper.mjs";

describe("E2E: AI Tutor Interactions & Reliability (Section G)", () => {
  let page;
  let dbUser = null;
  const testUser = {
    name: "AI Learner " + Math.floor(Math.random() * 10000),
    email: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "Password123!",
  };

  before(async () => {
    await ensureNextServer();
    await ensureFastAPIServer(true);
    page = await launchBrowser({ port: 9447 });
  });

  after(async () => {
    if (page) {
      await page.close();
    }
    await ensureFastAPIServer();
    await closePool();
  });

  it("G.1: Guest can send an AI message and receive a response", async () => {
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");

    await page.type('input[placeholder*="Ví dụ:"]', "Xin chào");
    await page.click('form button[type="submit"]');

    // Wait for AI Tutor response to finish loading
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("main div.rounded-xl.border"));
      const lastCard = cards[cards.length - 1];
      return (
        lastCard &&
        lastCard.querySelector("h2")?.innerText.toUpperCase().includes("AI TUTOR") &&
        !lastCard.innerText.includes("đang suy nghĩ")
      );
    }, 35000);

    const body = await page.evaluate(() => document.body.innerText);
    assert.ok(
      body.includes("Xin chào") || body.includes("chào") || body.includes("Hangul") || body.includes("Hàn"),
      "AI should respond to guest prompt"
    );
  });

  it("G.2: Authenticated user can send message and history persists across refresh", async () => {
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
    assert.ok(dbUser, "User should be recorded in database");

    // Open AI Tutor as authenticated user
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");
    // Ensure auth session is loaded in the page
    await page.waitForText(testUser.name, 8000);

    const promptText = "Từ 한국 nghĩa là gì?";
    await page.type('input[placeholder*="Ví dụ:"]', promptText);
    await page.click('form button[type="submit"]');

    // Wait for AI answer to arrive
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("main div.rounded-xl.border"));
      const lastCard = cards[cards.length - 1];
      return (
        lastCard &&
        lastCard.querySelector("h2")?.innerText.toUpperCase().includes("AI TUTOR") &&
        !lastCard.innerText.includes("đang suy nghĩ")
      );
    }, 35000);

    // Wait a moment for database write
    await new Promise((r) => setTimeout(r, 1500));

    // Verify messages stored in database
    const dbMessages = await getUserChatMessages(dbUser.id);
    assert.ok(dbMessages.length >= 2, "Conversation should persist user and assistant messages in database");

    // Refresh page and confirm conversation history is re-hydrated from database
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText(testUser.name, 8000);
    await page.waitForText(promptText, 15000);
  });

  it("G.3: New conversation resets active messages", async () => {
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");
    await page.waitForText(testUser.name, 8000);

    // Wait for existing conversation messages to appear
    await page.waitForSelector(".prose", 10000);

    // Click 'Cuộc trò chuyện mới'
    await page.clickByText("Cuộc trò chuyện mới");
    await new Promise((r) => setTimeout(r, 600));

    // After clicking new chat, messages list should be empty
    const messageCount = await page.evaluate(() => document.querySelectorAll(".prose").length);
    assert.strictEqual(messageCount, 0, "Messages should be cleared after starting a new conversation");
  });

  it("G.4: Error handling and Retry behavior when FastAPI fails", async () => {
    // Stop FastAPI to simulate service downtime
    await stopFastAPIServer();

    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor");
    await page.waitForText(testUser.name, 8000);

    const failPrompt = "Kiểm tra tính năng thử lại";
    await page.type('input[placeholder*="Ví dụ:"]', failPrompt);
    await page.click('form button[type="submit"]');

    // Friendly error should appear
    await page.waitForText("Dịch vụ AI Tutor hiện đang bận hoặc không thể kết nối. Vui lòng thử lại sau.", 15000);

    // 'Thử lại' button must be present in DOM
    await page.waitForText("Thử lại", 5000);

    // Restart FastAPI
    await ensureFastAPIServer();
    await new Promise((r) => setTimeout(r, 1500));

    // Click 'Thử lại'
    await page.clickByText("Thử lại");

    // Wait for successful retry response
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("main div.rounded-xl.border"));
      const lastCard = cards[cards.length - 1];
      if (!lastCard) return false;
      const h2 = lastCard.querySelector("h2");
      const isAssistant = h2 && h2.innerText.toUpperCase().includes("AI TUTOR");
      const isNotError = !lastCard.classList.contains("bg-red-50");
      const isNotLoading = !lastCard.innerText.includes("đang suy nghĩ");
      return isAssistant && isNotError && isNotLoading;
    }, 45000);

    const body = await page.evaluate(() => document.body.innerText);
    assert.ok(!body.includes("Dịch vụ AI Tutor hiện đang bận"), "Error alert should be cleared after successful retry");

    // Verify no duplicate user messages in UI
    const userMessageCount = await page.evaluate((prompt) => {
      const cards = Array.from(document.querySelectorAll("main div.rounded-xl.border"));
      return cards.filter((c) => {
        const h = c.querySelector("h2");
        return h && h.innerText.toUpperCase().includes("BẠN") && c.innerText.includes(prompt);
      }).length;
    }, failPrompt);
    assert.strictEqual(userMessageCount, 1, "There should be exactly 1 user message, no duplicate on retry");

    // Verify in database: retry succeeded and user message saved exactly once
    if (dbUser) {
      await new Promise((r) => setTimeout(r, 1500));
      const messages = await getUserChatMessages(dbUser.id);
      const userFailMessages = messages.filter(
        (m) => m.role === "user" && m.content.includes(failPrompt)
      );
      assert.strictEqual(userFailMessages.length, 1, "Database should contain exactly 1 user message on retry");
    }
  });

  it("G.5: Test A & B - Context anchoring to active vocabulary item and multi-turn retention", async () => {
    // Navigate to vocabulary page
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("Từ vựng");
    await page.waitForText("한국", 15000);

    // Click '✨ Hỏi AI' button on active flashcard
    await page.click(".ai-tutor-button");

    // Wait for drawer to appear with context badge
    await page.waitForText("#L01-V001", 10000);
    await page.waitForText("한국", 10000);

    // Verify dynamic suggested chips mention 한국
    const chipText = await page.evaluate(() => {
      const chipGroup = document.querySelector('div[role="group"][aria-label="Gợi ý câu hỏi nhanh"]');
      return chipGroup ? chipGroup.innerText : "";
    });
    assert.ok(chipText.includes("한국"), "Suggested questions should dynamically include the active vocabulary item '한국'");

    // Ask "Ý nghĩa của từ này" using demonstrative pronoun "từ này"
    const prompt1 = "Ý nghĩa của từ này";
    await page.type('textarea[placeholder*="Hỏi AI"]', prompt1);
    await page.click('footer form button[type="submit"]');

    // Wait for AI Tutor response in drawer
    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll("div.prose"));
      const last = msgs[msgs.length - 1];
      return last && last.innerText.includes("한국") && !document.body.innerText.includes("AI Tutor đang suy nghĩ");
    }, 35000);

    const drawerBody1 = await page.evaluate(() => document.body.innerText);
    assert.ok(
      drawerBody1.includes("한국") && (drawerBody1.includes("Hàn Quốc") || drawerBody1.includes("nghĩa")),
      "AI response must anchor to '한국' and explain its Vietnamese meaning"
    );

    // Multi-turn follow-up (Test B): Ask "Đặt 2 câu ví dụ thực tế"
    const prompt2 = "Đặt 2 câu ví dụ thực tế";
    await page.type('textarea[placeholder*="Hỏi AI"]', prompt2);
    await page.click('footer form button[type="submit"]');

    // Wait for second response
    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll("div.prose"));
      const last = msgs[msgs.length - 1];
      return (
        last &&
        last.innerText.includes("ví dụ") &&
        last.innerText.includes("한국") &&
        !document.body.innerText.includes("AI Tutor đang suy nghĩ")
      );
    }, 35000);

    const drawerBody2 = await page.evaluate(() => document.body.innerText);
    assert.ok(
      drawerBody2.includes("한국") && (drawerBody2.includes("1.") || drawerBody2.includes("2.")),
      "Second turn should maintain anchor to '한국' and provide two example sentences"
    );
  });

  it("G.6: Test C & D - Context isolation between modules and grammar anchoring", async () => {
    // Close drawer
    await page.click('button[aria-label="Đóng AI Tutor"]');
    await new Promise((r) => setTimeout(r, 600));

    // Navigate to grammar page
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("Ngữ pháp");
    await page.waitForText("입니다", 15000);

    // Click '✨ Hỏi AI Tutor →' button
    await page.click(".grammar-ai-button");

    // Drawer should open with grammar context
    await page.waitForText("#L01-G001", 10000);

    // Ask "Cấu trúc này dùng thế nào?"
    const promptGrammar = "Cấu trúc này dùng thế nào?";
    await page.type('textarea[placeholder*="Hỏi AI"]', promptGrammar);
    await page.click('footer form button[type="submit"]');

    // Wait for AI response in drawer
    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll("div.prose"));
      const last = msgs[msgs.length - 1];
      return last && last.innerText.includes("입니다") && !document.body.innerText.includes("AI Tutor đang suy nghĩ");
    }, 35000);

    const drawerBody = await page.evaluate(() => document.body.innerText);
    assert.ok(
      drawerBody.includes("입니다"),
      "AI response must anchor to active grammar '입니다', not previous vocabulary item"
    );

    // Verify conversation isolation in DB
    if (dbUser) {
      await new Promise((r) => setTimeout(r, 1500));
      const convs = await getUserConversations(dbUser.id);
      assert.ok(convs.length >= 2, "Distinct conversations should be recorded in DB for different contexts");
    }
  });
});
