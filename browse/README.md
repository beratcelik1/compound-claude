# claude-browse

Persistent headless Chromium browse daemon for Claude Code.

## Setup

```bash
cd ~/.claude/browse
bun install
npx playwright install chromium
```

## Usage

```bash
# Run CLI directly
bun run src/cli.ts goto https://example.com
bun run src/cli.ts click @e1
bun run src/cli.ts fill @e3 "search query"
bun run src/cli.ts text
bun run src/cli.ts screenshot
bun run src/cli.ts links
bun run src/cli.ts forms
bun run src/cli.ts accessibility
bun run src/cli.ts stop

# Or compile to binary
bun run build
./bin/browse goto https://example.com
```

## How it works

- First command auto-starts a headless Chromium daemon on a random localhost port
- Daemon stays alive between commands (30min idle timeout)
- State (PID, port, auth token) stored in `state.json`
- Interactive elements get refs (@e1, @e2...) from the accessibility tree
- Use refs to click/fill elements without CSS selectors

## Cookie Import

Import cookies from Chrome or Arc to access authenticated sites:

```bash
bun run src/cli.ts import-cookies chrome github.com
bun run src/cli.ts import-cookies arc
```

Requires macOS Keychain approval on first use.

## Commands

| Command | Description |
|---------|-------------|
| `goto <url>` | Navigate to URL |
| `click <ref>` | Click element by ref |
| `fill <ref> <value>` | Fill input field |
| `text [selector]` | Get page text |
| `screenshot [path]` | Take screenshot |
| `accessibility` | Refresh element refs |
| `links` | List all links |
| `forms` | List all forms |
| `back` / `forward` | Navigation |
| `reload` | Reload page |
| `pages` | List open tabs |
| `switch <id>` | Switch tab |
| `eval <js>` | Run JavaScript |
| `import-cookies [source] [domain]` | Import browser cookies |
| `status` | Daemon status |
| `stop` | Stop daemon |
