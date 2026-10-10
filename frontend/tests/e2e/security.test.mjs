import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { launchBrowser } from "../browser-driver.mjs";
import { ensureNextServer, ensureFastAPIServer, stopFastAPIServer } from "../server-helper.mjs";
import {
  getUserByEmail,
  getUserItemProgresses,
  getUserConversations,
  getConversationMessages,
  closePool,
} from "../db-helper.mjs";

describe("E2E: Security & Authentication/Authorization QA", () => {
  let page;

  const userA = {
    name: "User Alpha " + Math.floor(Math.random() * 10000),
    email: `alpha_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "AlphaPassword123!",
  };

  const userB = {
    name: "User Beta " + Math.floor(Math.random() * 10000),
    email: `beta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: "BetaPassword123!",
  };

  let dbUserA = null;
  let dbUserB = null;
  let userAConvId = null;

  before(async () => {
    await ensureNextServer();
    await ensureFastAPIServer();
    page = await launchBrowser({ port: 9446 });
  });

  after(async () => {
    if (page) await page.close();
    await ensureFastAPIServer();
    await closePool();
  });

  async function registerAndLogin(user) {
    await page.navigate("http://localhost:3000/register");
    await page.waitForText("Đăng ký");

    await page.type('input[placeholder="Nguyễn Văn A"]', user.name);
    await page.type('input[placeholder="you@example.com"]', user.email);

    await page.evaluate((pwd) => {
      const inputs = document.querySelectorAll('input[type="password"]');
      for (const el of inputs) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, pwd);
        else el.value = pwd;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, user.password);

    await page.click('button[type="submit"]');
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1", 15000);
    await page.waitForText(user.name, 8000);
  }

  async function logout() {
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText("Đăng xuất", 8000);
    await page.clickByText("Đăng xuất");
    await page.waitForText("Đăng nhập", 8000);
  }

  it("1: Authentication lifecycle & session integrity", async () => {
    // 1. Register User A
    await registerAndLogin(userA);

    dbUserA = await getUserByEmail(userA.email);
    assert.ok(dbUserA, "User A must exist in PostgreSQL");
    assert.ok(dbUserA.id, "User A must have a valid UUID id");

    // 2. Session persists across page reload / navigation
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText(userA.name, 5000);
    await page.waitForText(userA.email, 5000);

    // Refresh page
    await page.navigate("http://localhost:3000/settings");
    await page.waitForText(userA.name, 5000);

    // 3. Logout invalidates session
    await logout();

    // 4. Verify guest state on home page
    await page.navigate("http://localhost:3000/");
    await page.waitForText("Chưa đăng nhập", 5000);
  });

  it("2: Authentication validation & safe failure handling", async () => {
    // 1. Duplicate registration rejection
    await page.navigate("http://localhost:3000/register");
    await page.waitForText("Đăng ký");

    await page.type('input[placeholder="Nguyễn Văn A"]', "Duplicate User");
    await page.type('input[placeholder="you@example.com"]', userA.email); // same email as User A

    await page.evaluate((pwd) => {
      const inputs = document.querySelectorAll('input[type="password"]');
      for (const el of inputs) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(el, pwd);
        else el.value = pwd;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, "Password123!");

    await page.click('button[type="submit"]');

    // UI should show error or reject duplicate registration safely
    await new Promise((r) => setTimeout(r, 1500));
    const currentUrl = await page.getUrl();
    assert.ok(currentUrl.includes("/register"), "Duplicate registration must not succeed or redirect to home");

    // 2. Invalid password login rejection
    await page.navigate("http://localhost:3000/login");
    await page.waitForText("Đăng nhập");

    await page.type('input[placeholder="you@example.com"]', userA.email);
    await page.type('input[placeholder="••••••••"]', "WrongPassword999!");
    await page.click('button[type="submit"]');

    await new Promise((r) => setTimeout(r, 1500));
    const loginUrl = await page.getUrl();
    assert.ok(loginUrl.includes("/login"), "Invalid credentials must not allow login");

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes("Traceback") && !bodyText.includes("PrismaClientKnownRequestError"), "Auth errors must not leak database internals");
  });

  it("3: Guest boundary - Unauthenticated mutations and private history protected", async () => {
    // 1. Guest visits vocabulary page and tries to trigger mutation
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("자기소개", 5000);

    await page.click(".known-button");
    await new Promise((r) => setTimeout(r, 1000));

    // Page must not crash or display runtime error
    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes("Internal server error") && !bodyText.includes("Unhandled Runtime Error"), "Page should not crash for guests");

    // 2. Guest visits AI Tutor page - must have no private user history
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor", 5000);
    const aiBody = await page.evaluate(() => document.body.innerText);
    assert.ok(!aiBody.includes("Bí mật"), "Guest must not see any user chat history");
  });

  it("4: REAL cross-user BOLA/IDOR and data isolation (User A vs User B)", async () => {
    // ---- STEP A: Login User A and create private state ----
    await page.navigate("http://localhost:3000/login");
    await page.waitForText("Đăng nhập");
    await page.type('input[placeholder="you@example.com"]', userA.email);
    await page.type('input[placeholder="••••••••"]', userA.password);
    await page.click('button[type="submit"]');
    await page.waitForText("Tiếng Hàn Tổng hợp Sơ cấp 1", 15000);
    await page.waitForText(userA.name, 8000);

    // 1. User A creates Vocabulary progress
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("자기소개", 5000);
    await page.click(".known-button");
    await page.waitForSelector(".known-button.is-selected", 5000);
    await new Promise((r) => setTimeout(r, 1000));

    const vocabA = await getUserItemProgresses(dbUserA.id, "vocabulary");
    assert.ok(vocabA.length > 0, "User A vocabulary progress must be saved in database");
    assert.ok(vocabA.some((p) => p.mastered_at !== null), "User A item must be mastered");

    // 2. User A creates Grammar progress
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("자기소개", 5000);
    await page.click(".grammar-learned-button");
    await page.waitForText("✓ Đã học", 5000);
    await new Promise((r) => setTimeout(r, 1000));

    const grammarA = await getUserItemProgresses(dbUserA.id, "grammar");
    assert.ok(grammarA.length > 0, "User A grammar progress must be saved in database");

    // 3. User A creates an AI Tutor Conversation with private content
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor", 5000);

    const userAPrivatePrompt = "User A Private Secret Code: ALPHA_9921";
    await page.type('input[placeholder*="Ví dụ"]', userAPrivatePrompt);
    await page.click('form button[type="submit"]');

    // Wait for AI response to finish
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("main div.rounded-xl.border"));
      const lastCard = cards[cards.length - 1];
      return (
        lastCard &&
        lastCard.querySelector("h2")?.innerText.toUpperCase().includes("AI TUTOR") &&
        !lastCard.innerText.includes("đang suy nghĩ")
      );
    }, 35000);

    // Capture User A conversation ID from database
    const convsA = await getUserConversations(dbUserA.id);
    assert.ok(convsA.length > 0, "User A must have an AI conversation in database");
    userAConvId = convsA[0].id;
    assert.ok(userAConvId, "User A conversation ID must be recorded");

    const msgsA = await getConversationMessages(userAConvId);
    assert.ok(msgsA.some((m) => m.content.includes(userAPrivatePrompt)), "User A conversation must contain the private prompt");

    // 4. Logout User A
    await logout();

    // ---- STEP B: Register & Login User B ----
    await registerAndLogin(userB);
    dbUserB = await getUserByEmail(userB.email);
    assert.ok(dbUserB, "User B must exist in database");
    assert.notStrictEqual(dbUserB.id, dbUserA.id, "User B must have a different ID than User A");

    // ---- STEP C: Cross-User Isolation & BOLA/IDOR Tests ----

    // 1. Vocabulary Isolation: User B must not see User A's mastered state
    await page.navigate("http://localhost:3000/vocabulary");
    await page.waitForText("자기소개", 5000);
    const vocabSelectedB = await page.evaluate(() => !!document.querySelector(".known-button.is-selected"));
    assert.strictEqual(vocabSelectedB, false, "User B must NOT see User A's vocabulary mastery state");

    // User B marks their own vocabulary item
    await page.click(".known-button");
    await page.waitForSelector(".known-button.is-selected", 5000);
    await new Promise((r) => setTimeout(r, 1000));

    // Verify User A's vocabulary progress in database is completely unchanged
    const vocabAAfter = await getUserItemProgresses(dbUserA.id, "vocabulary");
    assert.ok(vocabAAfter.length > 0 && vocabAAfter.some((p) => p.mastered_at !== null), "User A vocabulary progress must remain untouched");

    // Verify User B has separate vocabulary progress record
    const vocabB = await getUserItemProgresses(dbUserB.id, "vocabulary");
    assert.ok(vocabB.length > 0 && vocabB.some((p) => p.mastered_at !== null), "User B must have their own separate progress record");

    // 2. Grammar Isolation: User B must not see User A's learned state
    await page.navigate("http://localhost:3000/grammar");
    await page.waitForText("자기소개", 5000);
    const grammarLearnedB = await page.evaluate(() => document.body.innerText.includes("✓ Đã học"));
    assert.strictEqual(grammarLearnedB, false, "User B must NOT see User A's grammar progress");

    // 3. AI Tutor Read BOLA Isolation: User B must not see User A's chat history
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor", 5000);
    const userBBody = await page.evaluate(() => document.body.innerText);
    assert.ok(!userBBody.includes("ALPHA_9921"), "User B must NOT see User A's private AI conversation history");

    // 4. AI Tutor Write BOLA / IDOR Hijacking Prevention:
    // Attempt to hijack/append to User A's conversation by calling chat action with userAConvId
    const lastNextAction = page.getLastNextAction();
    assert.ok(lastNextAction, "Server Action ID must have been captured from prior interaction");

    // User B executes a Server Action request targeting User A's conversation ID
    const tamperResult = await page.evaluate(async (args) => {
      try {
        const res = await fetch("http://localhost:3000/ai-tutor", {
          method: "POST",
          headers: {
            "Next-Action": args.actionId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              message: "User B unauthorized tamper message",
              context: { courseId: "tong-hop", bookId: "book-01", lessonId: "lesson-01" },
              conversationId: args.targetConvId,
            },
          ]),
        });
        return { status: res.status, ok: res.ok };
      } catch (err) {
        return { error: String(err) };
      }
    }, { actionId: lastNextAction, targetConvId: userAConvId });

    assert.ok(tamperResult.status === 200 || tamperResult.ok, "Server Action execution completed safely");

    // CRITICAL BOLA ASSERTION: User A's conversation in database must NOT contain User B's tamper message
    const msgsAAfterAttack = await getConversationMessages(userAConvId);
    const breached = msgsAAfterAttack.some((m) => m.content.includes("unauthorized tamper message"));
    assert.strictEqual(breached, false, "CRITICAL: User B must NOT be able to append messages to User A's conversation (BOLA mitigated)");

    // User A's message count and ownership remain unaltered
    assert.strictEqual(msgsAAfterAttack.length, msgsA.length, "User A conversation message count must remain identical");
  });

  it("5: Error Leakage - AI Tutor errors do not expose tracebacks", async () => {
    // Navigate to AI Tutor page
    await page.navigate("http://localhost:3000/ai-tutor");
    await page.waitForText("AI Tutor", 5000);

    // Stop FastAPI to simulate service unavailability
    await stopFastAPIServer();

    // Send a message that will attempt to reach FastAPI
    await page.type('input[placeholder*="Ví dụ"]', "Test error leakage offline");
    await page.click('form button[type="submit"]');

    // The frontend should catch the error and display a user-friendly Vietnamese message
    await page.waitForText("Dịch vụ AI Tutor hiện đang bận hoặc không thể kết nối. Vui lòng thử lại sau.", 10000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    assert.ok(!bodyText.includes("Traceback"), "Python tracebacks must not be leaked to the UI");
    assert.ok(!bodyText.includes("ECONNREFUSED"), "Raw transport errors must not be leaked to the UI");
    assert.ok(!bodyText.includes("fastapi"), "Internal framework names must not be leaked to the UI");
    assert.ok(!bodyText.includes("postgres"), "Database connection strings or internals must not be leaked");

    // Confirm that the 'Thử lại' button is rendered for graceful UX recovery
    await page.waitForText("Thử lại", 5000);
  });
});
