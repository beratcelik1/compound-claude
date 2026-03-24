import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { RefSystem } from "./ref-system.ts";
import { importCookies, type BrowserSource } from "./cookie-import.ts";

interface PageInfo {
  id: number;
  url: string;
  title: string;
}

interface CommandResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private activePage: Page | null = null;
  private pages: Map<number, Page> = new Map();
  private pageCounter = 0;
  private refSystem = new RefSystem();
  private dialogLog: string[] = [];

  async launch(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-first-run",
        "--no-default-browser-check",
      ],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    });

    const page = await this.context.newPage();
    this.setupPage(page);
    this.activePage = page;
  }

  private setupPage(page: Page): number {
    const id = ++this.pageCounter;
    this.pages.set(id, page);

    page.on("dialog", async (dialog) => {
      const msg = `[Dialog ${dialog.type()}] ${dialog.message()}`;
      this.dialogLog.push(msg);
      await dialog.dismiss();
    });

    page.on("close", () => {
      this.pages.delete(id);
      if (this.activePage === page) {
        this.activePage = this.pages.values().next().value ?? null;
      }
    });

    return id;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.activePage = null;
      this.pages.clear();
    }
  }

  async execute(command: string, args: Record<string, unknown> = {}): Promise<CommandResult> {
    try {
      switch (command) {
        case "goto":
          return await this.goto(args.url as string);
        case "click":
          return await this.click(args.ref as string);
        case "fill":
          return await this.fill(args.ref as string, args.value as string);
        case "text":
          return await this.getText(args.selector as string | undefined);
        case "screenshot":
          return await this.screenshot(args.path as string | undefined);
        case "accessibility":
          return await this.accessibility();
        case "links":
          return await this.getLinks();
        case "forms":
          return await this.getForms();
        case "back":
          return await this.back();
        case "forward":
          return await this.forward();
        case "reload":
          return await this.reload();
        case "pages":
          return await this.listPages();
        case "switch":
          return await this.switchPage(args.id as number);
        case "new-page":
          return await this.newPage();
        case "close-page":
          return await this.closePage(args.id as number | undefined);
        case "wait":
          return await this.wait(args.selector as string, args.timeout as number | undefined);
        case "eval":
          return await this.evaluate(args.expression as string);
        case "import-cookies":
          return await this.importCookiesCmd(
            args.source as BrowserSource | undefined,
            args.domain as string | undefined
          );
        case "dialogs":
          return { ok: true, data: this.dialogLog };
        case "status":
          return this.status();
        default:
          return { ok: false, error: `Unknown command: ${command}` };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  }

  private ensurePage(): Page {
    if (!this.activePage) {
      throw new Error("No active page. Navigate to a URL first.");
    }
    return this.activePage;
  }

  private async goto(url: string): Promise<CommandResult> {
    const page = this.ensurePage();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(500); // let JS settle

    const refTable = await this.refSystem.buildRefs(page);
    const title = await page.title();

    return {
      ok: true,
      data: {
        url: page.url(),
        title,
        status: response?.status(),
        refs: refTable,
      },
    };
  }

  private async click(ref: string): Promise<CommandResult> {
    const page = this.ensurePage();
    const locator = await this.refSystem.resolveRef(ref);

    if (!locator) {
      return { ok: false, error: `Ref ${ref} not found or stale. Run 'accessibility' to refresh.` };
    }

    await locator.click({ timeout: 5000 });
    await page.waitForTimeout(500);

    const refTable = await this.refSystem.buildRefs(page);
    return {
      ok: true,
      data: {
        clicked: ref,
        url: page.url(),
        title: await page.title(),
        refs: refTable,
      },
    };
  }

  private async fill(ref: string, value: string): Promise<CommandResult> {
    const locator = await this.refSystem.resolveRef(ref);

    if (!locator) {
      return { ok: false, error: `Ref ${ref} not found or stale. Run 'accessibility' to refresh.` };
    }

    await locator.fill(value, { timeout: 5000 });
    return {
      ok: true,
      data: { filled: ref, value },
    };
  }

  private async getText(selector?: string): Promise<CommandResult> {
    const page = this.ensurePage();

    let text: string;
    if (selector) {
      text = await page.locator(selector).innerText({ timeout: 5000 });
    } else {
      text = await page.locator("body").innerText({ timeout: 10000 });
    }

    // Collapse whitespace for readability
    text = text.replace(/\n{3,}/g, "\n\n").trim();

    // Truncate very long text
    const MAX_LENGTH = 20000;
    if (text.length > MAX_LENGTH) {
      text = text.slice(0, MAX_LENGTH) + `\n\n... [truncated at ${MAX_LENGTH} chars]`;
    }

    return { ok: true, data: { text, length: text.length } };
  }

  private async screenshot(path?: string): Promise<CommandResult> {
    const page = this.ensurePage();
    const screenshotPath =
      path ?? `/tmp/browse-screenshot-${Date.now()}.png`;

    await page.screenshot({ path: screenshotPath, fullPage: false });
    return {
      ok: true,
      data: { path: screenshotPath, url: page.url() },
    };
  }

  private async accessibility(): Promise<CommandResult> {
    const page = this.ensurePage();
    const refTable = await this.refSystem.buildRefs(page);
    return {
      ok: true,
      data: {
        url: page.url(),
        title: await page.title(),
        refs: refTable,
        count: this.refSystem.size,
      },
    };
  }

  private async getLinks(): Promise<CommandResult> {
    const page = this.ensurePage();
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a[href]")).map((a) => ({
        text: (a as HTMLAnchorElement).innerText.trim().slice(0, 80),
        href: (a as HTMLAnchorElement).href,
      }));
    });
    return { ok: true, data: { links, count: links.length } };
  }

  private async getForms(): Promise<CommandResult> {
    const page = this.ensurePage();
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("form")).map((form, i) => {
        const inputs = Array.from(form.querySelectorAll("input, select, textarea")).map(
          (el) => ({
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute("type") ?? "",
            name: el.getAttribute("name") ?? "",
            id: el.id,
            placeholder: el.getAttribute("placeholder") ?? "",
          })
        );
        return {
          index: i,
          action: form.action,
          method: form.method,
          inputs,
        };
      });
    });
    return { ok: true, data: { forms, count: forms.length } };
  }

  private async back(): Promise<CommandResult> {
    const page = this.ensurePage();
    await page.goBack({ waitUntil: "domcontentloaded" });
    return { ok: true, data: { url: page.url(), title: await page.title() } };
  }

  private async forward(): Promise<CommandResult> {
    const page = this.ensurePage();
    await page.goForward({ waitUntil: "domcontentloaded" });
    return { ok: true, data: { url: page.url(), title: await page.title() } };
  }

  private async reload(): Promise<CommandResult> {
    const page = this.ensurePage();
    await page.reload({ waitUntil: "domcontentloaded" });
    const refTable = await this.refSystem.buildRefs(page);
    return { ok: true, data: { url: page.url(), refs: refTable } };
  }

  private async listPages(): Promise<CommandResult> {
    const pages: PageInfo[] = [];
    for (const [id, page] of this.pages) {
      pages.push({
        id,
        url: page.url(),
        title: await page.title(),
      });
    }
    return { ok: true, data: { pages, active: this.getActivePageId() } };
  }

  private getActivePageId(): number | null {
    for (const [id, page] of this.pages) {
      if (page === this.activePage) return id;
    }
    return null;
  }

  private async switchPage(id: number): Promise<CommandResult> {
    const page = this.pages.get(id);
    if (!page) {
      return { ok: false, error: `Page ${id} not found.` };
    }
    this.activePage = page;
    const refTable = await this.refSystem.buildRefs(page);
    return {
      ok: true,
      data: { url: page.url(), title: await page.title(), refs: refTable },
    };
  }

  private async newPage(): Promise<CommandResult> {
    if (!this.context) {
      throw new Error("Browser not launched.");
    }
    const page = await this.context.newPage();
    const id = this.setupPage(page);
    this.activePage = page;
    return { ok: true, data: { pageId: id } };
  }

  private async closePage(id?: number): Promise<CommandResult> {
    const targetId = id ?? this.getActivePageId();
    if (targetId === null) {
      return { ok: false, error: "No page to close." };
    }
    const page = this.pages.get(targetId);
    if (!page) {
      return { ok: false, error: `Page ${targetId} not found.` };
    }
    await page.close();
    return { ok: true, data: { closed: targetId } };
  }

  private async wait(selector: string, timeout?: number): Promise<CommandResult> {
    const page = this.ensurePage();
    await page.waitForSelector(selector, { timeout: timeout ?? 10000 });
    return { ok: true, data: { selector, found: true } };
  }

  private async evaluate(expression: string): Promise<CommandResult> {
    const page = this.ensurePage();
    const result = await page.evaluate(expression);
    return { ok: true, data: { result } };
  }

  private async importCookiesCmd(
    source?: BrowserSource,
    domain?: string
  ): Promise<CommandResult> {
    if (!this.context) {
      throw new Error("Browser not launched.");
    }
    const result = await importCookies(this.context, source ?? "chrome", domain);
    return { ok: true, data: result };
  }

  private status(): CommandResult {
    return {
      ok: true,
      data: {
        browserRunning: this.browser !== null,
        pageCount: this.pages.size,
        activePageId: this.getActivePageId(),
        activeUrl: this.activePage?.url() ?? null,
        refCount: this.refSystem.size,
        dialogCount: this.dialogLog.length,
      },
    };
  }
}
