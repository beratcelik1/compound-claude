import type { Page, Locator } from "playwright";

interface RefEntry {
  ref: string;
  role: string;
  name: string;
  locator: Locator;
  stale: boolean;
}

interface AccessibilityNode {
  role: string;
  name: string;
  children?: AccessibilityNode[];
  value?: string;
  description?: string;
  checked?: boolean;
  pressed?: boolean;
  level?: number;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

const INTERACTIVE_ROLES = new Set([
  "link",
  "button",
  "textbox",
  "searchbox",
  "combobox",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "spinbutton",
  "tab",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "treeitem",
]);

export class RefSystem {
  private refs: Map<string, RefEntry> = new Map();
  private counter = 0;

  clear(): void {
    this.refs.clear();
    this.counter = 0;
  }

  async buildRefs(page: Page): Promise<string> {
    this.clear();

    const snapshot = await page.accessibility.snapshot();
    if (!snapshot) {
      return "No accessibility tree available for this page.";
    }

    const lines: string[] = [];
    this.walkTree(snapshot as AccessibilityNode, page, lines, 0);

    if (this.refs.size === 0) {
      return "No interactive elements found on this page.";
    }

    const header = `${"Ref".padEnd(8)} ${"Role".padEnd(16)} Name`;
    const separator = "-".repeat(60);
    return [header, separator, ...lines].join("\n");
  }

  private walkTree(
    node: AccessibilityNode,
    page: Page,
    lines: string[],
    depth: number
  ): void {
    if (INTERACTIVE_ROLES.has(node.role) && node.name) {
      const ref = `@e${++this.counter}`;
      const locator = this.buildLocator(page, node);

      this.refs.set(ref, {
        ref,
        role: node.role,
        name: node.name,
        locator,
        stale: false,
      });

      const indent = "  ".repeat(depth);
      const displayName =
        node.name.length > 60 ? node.name.slice(0, 57) + "..." : node.name;
      lines.push(`${ref.padEnd(8)} ${node.role.padEnd(16)} ${indent}${displayName}`);
    }

    if (node.children) {
      for (const child of node.children) {
        this.walkTree(child, page, lines, depth + (INTERACTIVE_ROLES.has(node.role) ? 1 : 0));
      }
    }
  }

  private buildLocator(page: Page, node: AccessibilityNode): Locator {
    const role = node.role as
      | "link"
      | "button"
      | "textbox"
      | "searchbox"
      | "combobox"
      | "checkbox"
      | "radio"
      | "switch"
      | "slider"
      | "spinbutton"
      | "tab"
      | "menuitem"
      | "menuitemcheckbox"
      | "menuitemradio"
      | "option"
      | "treeitem";

    return page.getByRole(role, { name: node.name, exact: false });
  }

  async resolveRef(ref: string): Promise<Locator | null> {
    const entry = this.refs.get(ref);
    if (!entry) {
      return null;
    }

    const count = await entry.locator.count();
    if (count === 0) {
      entry.stale = true;
      return null;
    }

    if (count > 1) {
      return entry.locator.first();
    }

    return entry.locator;
  }

  getRefInfo(ref: string): RefEntry | undefined {
    return this.refs.get(ref);
  }

  get size(): number {
    return this.refs.size;
  }
}
