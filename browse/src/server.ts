import { randomUUID } from "crypto";
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { BrowserManager } from "./browser-manager.ts";

const STATE_DIR = join(homedir(), ".claude/browse");
const STATE_FILE = join(STATE_DIR, "state.json");
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface StateFile {
  pid: number;
  port: number;
  token: string;
}

function randomPort(): number {
  return 10000 + Math.floor(Math.random() * 50000);
}

function writeState(state: StateFile): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function deleteState(): void {
  try {
    unlinkSync(STATE_FILE);
  } catch {
    // ignore if already deleted
  }
}

async function main(): Promise<void> {
  const token = randomUUID();
  const port = randomPort();
  const manager = new BrowserManager();

  let idleTimer: ReturnType<typeof setTimeout>;

  function resetIdleTimer(): void {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(async () => {
      console.log("[browse] Idle timeout reached. Shutting down.");
      await shutdown();
    }, IDLE_TIMEOUT_MS);
  }

  async function shutdown(): Promise<void> {
    console.log("[browse] Shutting down...");
    await manager.close();
    deleteState();
    process.exit(0);
  }

  // Launch browser before starting server
  await manager.launch();
  console.log("[browse] Browser launched.");

  const server = Bun.serve({
    port,
    hostname: "127.0.0.1",

    async fetch(req: Request): Promise<Response> {
      // Auth check
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${token}`) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      resetIdleTimer();

      const url = new URL(req.url);

      if (req.method === "POST" && url.pathname === "/command") {
        try {
          const body = (await req.json()) as { command: string; args?: Record<string, unknown> };
          const result = await manager.execute(body.command, body.args ?? {});
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      if (req.method === "GET" && url.pathname === "/health") {
        return new Response(JSON.stringify({ ok: true, pid: process.pid }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (req.method === "POST" && url.pathname === "/shutdown") {
        // Respond before shutting down
        const res = new Response(JSON.stringify({ ok: true, message: "Shutting down" }), {
          headers: { "Content-Type": "application/json" },
        });
        setTimeout(() => shutdown(), 100);
        return res;
      }

      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  // Write state file
  const state: StateFile = { pid: process.pid, port, token };
  writeState(state);

  console.log(`[browse] Server listening on http://127.0.0.1:${port}`);
  console.log(`[browse] PID: ${process.pid}`);
  console.log(`[browse] State written to ${STATE_FILE}`);

  resetIdleTimer();

  // Handle graceful shutdown signals
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[browse] Fatal error:", err);
  deleteState();
  process.exit(1);
});
