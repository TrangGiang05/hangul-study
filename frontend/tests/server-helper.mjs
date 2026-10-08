import { spawn, execSync } from "node:child_process";
import path from "node:path";

let nextProcess = null;
let fastapiProcess = null;

export async function isPortListening(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/openapi.json`, {
      method: "GET",
      signal: AbortSignal.timeout(1000),
    });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

export async function isNextListening() {
  try {
    const res = await fetch("http://127.0.0.1:3000/", {
      method: "GET",
      signal: AbortSignal.timeout(1000),
    });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

export async function ensureNextServer() {
  if (await isNextListening()) {
    return;
  }

  nextProcess = spawn("cmd", ["/c", "npm", "run", "dev"], {
    cwd: path.resolve(process.cwd()),
    stdio: "ignore",
    detached: true,
  });
  nextProcess.unref();

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isNextListening()) {
      return;
    }
  }
  throw new Error("Failed to start Next.js dev server on port 3000");
}

export async function ensureFastAPIServer() {
  if (await isPortListening(8000)) {
    return;
  }

  const backendDir = path.resolve(process.cwd(), "../backend");
  const pythonExe = path.join(backendDir, ".venv", "Scripts", "python.exe");

  fastapiProcess = spawn(pythonExe, ["-m", "uvicorn", "app.main:app", "--port", "8000"], {
    cwd: backendDir,
    stdio: "ignore",
    detached: true,
  });
  fastapiProcess.unref();

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 400));
    if (await isPortListening(8000)) {
      // Allow uvicorn application startup to complete
      await new Promise((r) => setTimeout(r, 1200));
      return;
    }
  }
  throw new Error("Failed to start FastAPI server on port 8000");
}

export async function stopFastAPIServer() {
  if (fastapiProcess) {
    try {
      fastapiProcess.kill();
    } catch {}
    fastapiProcess = null;
  }

  try {
    execSync('powershell -Command "Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force"', {
      stdio: "ignore",
    });
  } catch {}

  for (let i = 0; i < 30; i++) {
    const listening = await isPortListening(8000);
    if (!listening) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}

export async function teardownServers() {
  if (nextProcess) {
    try {
      nextProcess.kill();
    } catch {}
    nextProcess = null;
  }
  await stopFastAPIServer();
}
