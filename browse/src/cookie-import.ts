import { Database } from "bun:sqlite";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { BrowserContext, Cookie } from "playwright";

const CHROME_COOKIES_PATH = join(
  homedir(),
  "Library/Application Support/Google/Chrome/Default/Cookies"
);

const ARC_COOKIES_PATH = join(
  homedir(),
  "Library/Application Support/Arc/User Data/Default/Cookies"
);

interface RawCookie {
  host_key: string;
  name: string;
  path: string;
  encrypted_value: Buffer;
  expires_utc: number;
  is_secure: number;
  is_httponly: number;
  samesite: number;
}

const SAMESITE_MAP: Record<number, "Strict" | "Lax" | "None"> = {
  0: "None",
  1: "Lax",
  2: "Strict",
};

async function getDecryptionKey(browser: string): Promise<Buffer> {
  const proc = Bun.spawn([
    "security",
    "find-generic-password",
    "-s",
    `${browser} Safe Storage`,
    "-w",
  ]);

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(
      `Failed to get ${browser} decryption key from Keychain. ` +
        "You may need to click 'Allow' in the Keychain dialog."
    );
  }

  const password = output.trim();
  const crypto = await import("crypto");
  const key = crypto.pbkdf2Sync(password, "saltysalt", 1003, 16, "sha1");
  return key;
}

function decryptCookieValue(encryptedValue: Buffer, key: Buffer): string {
  if (encryptedValue.length <= 3) {
    return "";
  }

  // Chrome cookies on macOS start with v10
  const prefix = encryptedValue.slice(0, 3).toString("utf-8");
  if (prefix !== "v10") {
    return encryptedValue.toString("utf-8");
  }

  const crypto = require("crypto");
  const iv = Buffer.alloc(16, " ");
  const ciphertext = encryptedValue.slice(3);

  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf-8");
}

function chromiumEpochToUnix(chromiumEpoch: number): number {
  if (chromiumEpoch === 0) return -1;
  // Chromium epoch is Jan 1, 1601. Offset to Unix epoch.
  return Math.floor((chromiumEpoch - 11644473600000000) / 1000000);
}

async function readCookiesFromDb(
  dbPath: string,
  key: Buffer,
  domain?: string
): Promise<Cookie[]> {
  const db = new Database(dbPath, { readonly: true });
  const cookies: Cookie[] = [];

  try {
    let query = `
      SELECT host_key, name, path, encrypted_value, expires_utc,
             is_secure, is_httponly, samesite
      FROM cookies
    `;
    const params: string[] = [];

    if (domain) {
      query += " WHERE host_key LIKE ?";
      params.push(`%${domain}%`);
    }

    const stmt = db.prepare(query);
    const rows = (domain ? stmt.all(params[0]) : stmt.all()) as RawCookie[];

    for (const row of rows) {
      const value = decryptCookieValue(
        Buffer.from(row.encrypted_value),
        key
      );

      if (!value) continue;

      cookies.push({
        name: row.name,
        value,
        domain: row.host_key,
        path: row.path,
        expires: chromiumEpochToUnix(row.expires_utc),
        httpOnly: row.is_httponly === 1,
        secure: row.is_secure === 1,
        sameSite: SAMESITE_MAP[row.samesite] ?? "None",
      });
    }
  } finally {
    db.close();
  }

  return cookies;
}

export type BrowserSource = "chrome" | "arc";

export async function importCookies(
  context: BrowserContext,
  source: BrowserSource = "chrome",
  domain?: string
): Promise<{ imported: number; source: string }> {
  const dbPath = source === "chrome" ? CHROME_COOKIES_PATH : ARC_COOKIES_PATH;
  const browserName = source === "chrome" ? "Chrome" : "Arc";

  if (!existsSync(dbPath)) {
    throw new Error(`${browserName} cookies database not found at ${dbPath}`);
  }

  // Copy db to temp to avoid lock issues
  const tmpPath = join(homedir(), `.claude/browse/.cookies-tmp-${Date.now()}.db`);
  await Bun.write(tmpPath, Bun.file(dbPath));

  // Also copy WAL and SHM if they exist
  for (const suffix of ["-wal", "-shm"]) {
    if (existsSync(dbPath + suffix)) {
      await Bun.write(tmpPath + suffix, Bun.file(dbPath + suffix));
    }
  }

  try {
    const key = await getDecryptionKey(browserName);
    const cookies = await readCookiesFromDb(tmpPath, key, domain);
    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }
    return { imported: cookies.length, source: browserName };
  } finally {
    // Cleanup temp files
    const { unlinkSync } = require("fs");
    for (const suffix of ["", "-wal", "-shm"]) {
      try {
        unlinkSync(tmpPath + suffix);
      } catch {
        // ignore
      }
    }
  }
}
