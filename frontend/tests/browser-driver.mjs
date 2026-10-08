import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

function getBrowserPath() {
  if (fs.existsSync(CHROME_PATH)) return CHROME_PATH;
  if (fs.existsSync(EDGE_PATH)) return EDGE_PATH;
  throw new Error("No Chrome or Edge browser found for E2E testing.");
}

export async function launchBrowser({ port = 9444 } = {}) {
  const browserExe = getBrowserPath();
  const userDataDir = path.join(os.tmpdir(), "hangul-study-e2e-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  fs.mkdirSync(userDataDir, { recursive: true });

  const proc = spawn(browserExe, [
    `--remote-debugging-port=${port}`,
    "--headless=new",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "about:blank",
  ]);

  // Wait for DevTools port
  let wsUrl = null;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  if (!wsUrl) {
    proc.kill();
    fs.rmSync(userDataDir, { recursive: true, force: true });
    throw new Error(`Failed to connect to browser on port ${port}`);
  }

  const targetsRes = await fetch(`http://127.0.0.1:${port}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === "page");

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let messageId = 1;
  const callbacks = new Map();
  let lastNextAction = null;
  const capturedRequests = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === "Network.requestWillBeSent") {
      const headers = msg.params?.request?.headers;
      if (headers) {
        const action = headers["Next-Action"] || headers["next-action"];
        if (action) {
          lastNextAction = action;
          capturedRequests.push({
            url: msg.params.request.url,
            action,
            postData: msg.params.request.postData,
          });
        }
      }
    }
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      cb(msg);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = messageId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Runtime.enable");
  await send("Page.enable");
  await send("DOM.enable");
  await send("Network.enable");

  const page = {
    async navigate(url, { timeoutMs = 25000 } = {}) {
      const targetUrlObj = new URL(url);
      await send("Page.navigate", { url });
      const startTime = Date.now();
      while (Date.now() - startTime < timeoutMs) {
        try {
          const currentHref = await page.evaluate(() => window.location.href);
          const readyState = await page.evaluate(() => document.readyState);
          if (
            currentHref &&
            !currentHref.includes("about:blank") &&
            (currentHref.includes(targetUrlObj.pathname) || targetUrlObj.pathname === "/") &&
            (readyState === "complete" || readyState === "interactive")
          ) {
            // Buffer for React hydration
            await new Promise((r) => setTimeout(r, 600));
            return;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 200));
      }
    },

    async evaluate(fnOrCode, ...args) {
      let expression;
      if (typeof fnOrCode === "function") {
        expression = `(${fnOrCode.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
      } else {
        expression = fnOrCode;
      }

      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });

      if (res.result?.exceptionDetails) {
        const err = res.result.exceptionDetails;
        throw new Error(`Evaluation error: ${err.text || err.exception?.description || "Unknown"}`);
      }

      return res.result?.result?.value;
    },

    async waitForText(text, timeoutMs = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const bodyText = await page.evaluate(() => document.body?.innerText || "");
          if (bodyText.includes(text)) {
            return true;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 200));
      }
      throw new Error(`Timed out waiting for text "${text}" after ${timeoutMs}ms`);
    },

    async waitForFunction(fn, timeoutMs = 25000, ...args) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const res = await page.evaluate(fn, ...args);
          if (res) return true;
        } catch {}
        await new Promise((r) => setTimeout(r, 200));
      }
      throw new Error(`Timed out waiting for condition after ${timeoutMs}ms`);
    },

    async waitForSelector(selector, timeoutMs = 15000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const found = await page.evaluate((sel) => !!document.querySelector(sel), selector);
          if (found) {
            return true;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 200));
      }
      throw new Error(`Timed out waiting for selector "${selector}" after ${timeoutMs}ms`);
    },

    async click(selector) {
      await page.waitForSelector(selector);
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error("Element not found: " + sel);
        el.click();
      }, selector);
      await new Promise((r) => setTimeout(r, 400));
    },

    async clickByText(text, tag = "button") {
      await page.waitForText(text, 10000);
      const clicked = await page.evaluate((txt, tagName) => {
        const els = Array.from(document.querySelectorAll(tagName || "*"));
        const target = els.find((el) => el.innerText && el.innerText.trim().includes(txt));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, text, tag);
      if (!clicked) {
        throw new Error(`Element with text "${text}" could not be clicked`);
      }
      await new Promise((r) => setTimeout(r, 400));
    },

    async type(selector, text) {
      await page.waitForSelector(selector);
      await page.evaluate(
        (sel, val) => {
          const el = document.querySelector(sel);
          if (!el) throw new Error("Element not found: " + sel);
          const prototype = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
          if (setter) {
            setter.call(el, val);
          } else {
            el.value = val;
          }
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        },
        selector,
        text
      );
      await new Promise((r) => setTimeout(r, 200));
    },

    async getText(selector) {
      return page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : null;
      }, selector);
    },

    async getUrl() {
      return page.evaluate(() => window.location.href);
    },

    async getTitle() {
      return page.evaluate(() => document.title);
    },

    getLastNextAction() {
      return lastNextAction;
    },

    getCapturedRequests() {
      return [...capturedRequests];
    },

    sendCDP(method, params) {
      return send(method, params);
    },

    async close() {
      try {
        ws.close();
      } catch {}
      try {
        proc.kill();
      } catch {}
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch {}
    },
  };

  return page;
}
