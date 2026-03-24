import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { spawn } from "child_process";

const STATE_FILE = join(homedir(), ".claude/browse/state.json");
const SERVER_SCRIPT = join(homedir(), ".claude/browse/src/server.ts");

interface StateFile {
  pid: number;
  port: number;
  token: string;
}

function readState(): StateFile | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8")) as StateFile;
  } catch {
    return null;
  }
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function ensureDaemon(): Promise<StateFile> {
  const state = readState();
  if (state && isPidAlive(state.pid)) {
    // Verify server is responsive
    try {
      const res = await fetch(`http://127.0.0.1:${state.port}/health`, {
        headers: { Authorization: `Bearer ${state.token}` },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return state;
    } catch {
      // Server not responding, restart
    }
  }

  // Start daemon
  console.log("Starting browse daemon...");
  const child = spawn("bun", ["run", SERVER_SCRIPT], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    cwd: join(homedir(), ".claude/browse"),
  });

  child.unref();

  // Wait for state file to appear
  const maxWait = 15000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, 300));
    const newState = readState();
    if (newState && isPidAlive(newState.pid)) {
      try {
        const res = await fetch(`http://127.0.0.1:${newState.port}/health`, {
          headers: { Authorization: `Bearer ${newState.token}` },
          signal: AbortSignal.timeout(2000),
        });
        if (res.ok) {
          console.log(`Daemon started (PID ${newState.pid}, port ${newState.port})`);
          return newState;
        }
      } catch {
        // Not ready yet
      }
    }
  }

  throw new Error("Failed to start browse daemon within 15s. Check logs.");
}

async function sendCommand(
  state: StateFile,
  command: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const res = await fetch(`http://127.0.0.1:${state.port}/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.token}`,
    },
    body: JSON.stringify({ command, args }),
    signal: AbortSignal.timeout(60000),
  });

  return res.json();
}

async function sendShutdown(state: StateFile): Promise<void> {
  try {
    await fetch(`http://127.0.0.1:${state.port}/shutdown`, {
      method: "POST",
      headers: { Authorization: `Bearer ${state.token}` },
      signal: AbortSignal.timeout(5000),
    });
    console.log("Daemon stopped.");
  } catch {
    console.log("Daemon already stopped or unreachable.");
  }
}

function formatOutput(result: unknown): string {
  if (typeof result !== "object" || result === null) return String(result);

  const r = result as Record<string, unknown>;

  if (!r.ok) {
    return `ERROR: ${r.error}`;
  }

  const data = r.data as Record<string, unknown> | undefined;
  if (!data) return "OK";

  // Format specific response types
  if (typeof data.refs === "string") {
    const lines: string[] = [];
    if (data.title) lines.push(`Title: ${data.title}`);
    if (data.url) lines.push(`URL: ${data.url}`);
    if (data.status) lines.push(`Status: ${data.status}`);
    lines.push("");
    lines.push(data.refs as string);
    return lines.join("\n");
  }

  if (typeof data.text === "string") {
    return data.text as string;
  }

  if (data.path && typeof data.path === "string" && (data.path as string).endsWith(".png")) {
    return `Screenshot saved: ${data.path}`;
  }

  if (Array.isArray(data.links)) {
    const links = data.links as Array<{ text: string; href: string }>;
    if (links.length === 0) return "No links found.";
    return links
      .map((l, i) => `[${i + 1}] ${l.text || "(no text)"}\n    ${l.href}`)
      .join("\n");
  }

  if (Array.isArray(data.forms)) {
    const forms = data.forms as Array<Record<string, unknown>>;
    if (forms.length === 0) return "No forms found.";
    return JSON.stringify(forms, null, 2);
  }

  if (Array.isArray(data.pages)) {
    const pages = data.pages as Array<{ id: number; url: string; title: string }>;
    return pages
      .map((p) => `[${p.id}] ${p.title}\n    ${p.url}`)
      .join("\n");
  }

  return JSON.stringify(data, null, 2);
}

function printUsage(): void {
  console.log(`Usage: browse <command> [args...]

Commands:
  goto <url>              Navigate to URL
  click <ref>             Click element (e.g., @e1)
  fill <ref> <value>      Fill input field
  text [selector]         Get page text content
  screenshot [path]       Take screenshot
  accessibility           Show interactive elements with refs
  links                   List all links on page
  forms                   List all forms on page
  back                    Go back
  forward                 Go forward
  reload                  Reload page
  pages                   List open pages
  switch <id>             Switch to page by ID
  new-page                Open new page
  close-page [id]         Close page
  wait <selector> [ms]    Wait for element
  eval <expression>       Evaluate JavaScript
  import-cookies [source] Import cookies (chrome|arc) [domain]
  dialogs                 Show dismissed dialog log
  status                  Show daemon status
  stop                    Stop the daemon`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const command = args[0];

  // Stop is special — doesn't need daemon running
  if (command === "stop") {
    const state = readState();
    if (state) {
      await sendShutdown(state);
    } else {
      console.log("No daemon running.");
    }
    return;
  }

  const state = await ensureDaemon();

  let cmdArgs: Record<string, unknown> = {};

  switch (command) {
    case "goto":
      cmdArgs = { url: args[1] };
      if (!args[1]) {
        console.error("Usage: browse goto <url>");
        process.exit(1);
      }
      break;
    case "click":
      cmdArgs = { ref: args[1] };
      if (!args[1]) {
        console.error("Usage: browse click <ref>");
        process.exit(1);
      }
      break;
    case "fill":
      cmdArgs = { ref: args[1], value: args.slice(2).join(" ") };
      if (!args[1] || !args[2]) {
        console.error("Usage: browse fill <ref> <value>");
        process.exit(1);
      }
      break;
    case "text":
      if (args[1]) cmdArgs = { selector: args[1] };
      break;
    case "screenshot":
      if (args[1]) cmdArgs = { path: args[1] };
      break;
    case "switch":
      cmdArgs = { id: parseInt(args[1], 10) };
      break;
    case "close-page":
      if (args[1]) cmdArgs = { id: parseInt(args[1], 10) };
      break;
    case "wait":
      cmdArgs = { selector: args[1] };
      if (args[2]) cmdArgs.timeout = parseInt(args[2], 10);
      break;
    case "eval":
      cmdArgs = { expression: args.slice(1).join(" ") };
      break;
    case "import-cookies":
      if (args[1]) cmdArgs.source = args[1];
      if (args[2]) cmdArgs.domain = args[2];
      break;
    // Commands with no args
    case "accessibility":
    case "links":
    case "forms":
    case "back":
    case "forward":
    case "reload":
    case "pages":
    case "new-page":
    case "dialogs":
    case "status":
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }

  const result = await sendCommand(state, command, cmdArgs);
  console.log(formatOutput(result));
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
