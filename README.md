```
██╗    ██╗███████╗████████╗ █████╗  ██████╗██╗  ██╗
██║    ██║██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
██║ █╗ ██║███████╗   ██║   ███████║██║     █████╔╝
██║███╗██║╚════██║   ██║   ██╔══██║██║     ██╔═██╗
╚███╔███╔╝███████║   ██║   ██║  ██║╚██████╗██║  ██╗
 ╚══╝╚══╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

<p align="center">
  <strong>The Claude Code setup that actually ships.</strong>
  <br>
  18 agents. 35 skills. 20 hooks. Continuous learning. Every session makes the next one smarter.
</p>

<p align="center">
  <a href="#install">Install</a> |
  <a href="#why-wstack">Why wstack</a> |
  <a href="#whats-inside">What's Inside</a> |
  <a href="#the-methodology">Methodology</a> |
  <a href="#browse-daemon">Browse Daemon</a> |
  <a href="#security-audit">Security Audit</a>
</p>

---

## Why wstack

Most Claude Code setups are prompt files. wstack is an **enforcement engine**.

```
You can't commit without a code review.     (PreToolUse hook blocks git commit)
You can't skip planning on complex tasks.    (CLAUDE.md + mandatory-agents rule)
Every session's learnings compound.           (continuous-learning-v2 system)
```

Other setups give Claude **suggestions**. wstack gives Claude **constraints**. A suggestion to "always review code" gets ignored under pressure. A hook that blocks `git commit` until review passes doesn't.

### What sets wstack apart

| Feature | wstack |
|---|---|
| **Architecture** | Agents + Skills + Rules + Commands (separated concerns) |
| **Intent routing** | Automatic — say "fix this" and it routes to the right tool |
| **Continuous learning** | Instincts evolve across sessions, auto-promote to global |
| **Token efficiency** | Lean rules, small context footprint |
| **Hook enforcement** | 20 hooks with hard gates on quality |
| **Security audit** | 15-phase CSO with STRIDE + OWASP + supply chain |
| **Browser automation** | Persistent Chromium daemon with ref system + cookie import |
| **Skill eval** | 3-tier: static + E2E + LLM-as-judge |
| **Template system** | Python-based with plugin resolvers |
| **Telemetry** | None |
| **Setup** | One command |

---

## Install

```bash
git clone https://github.com/beratcelik1/wstack.git
cd wstack
./install.sh
```

That's it. Restart Claude Code.

<details>
<summary><strong>Manual install</strong></summary>

```bash
git clone https://github.com/beratcelik1/wstack.git
cd wstack

# Backup your existing setup
cp -R ~/.claude ~/.claude-backup-$(date +%Y%m%d)

# Copy components
cp -R agents skills commands rules scripts browse ~/.claude/
cp CLAUDE.md ~/.claude/CLAUDE.md

# Install settings (replaces __HOME__ with your actual home dir)
sed "s|__HOME__|$HOME|g" settings.json > ~/.claude/settings.json
chmod 600 ~/.claude/settings.json

# Set permissions
chmod +x ~/.claude/skills/continuous-learning-v2/hooks/observe.sh
chmod +x ~/.claude/scripts/eval/*.sh
chmod +x ~/.claude/scripts/gen-skill-docs.py
```

</details>

<details>
<summary><strong>Dependencies</strong></summary>

```bash
# macOS
brew install jq terminal-notifier tmux node
npm install -g prettier
pip install black ruff

# Linux
apt install jq tmux nodejs npm
npm install -g prettier
pip install black ruff

# Browse daemon (optional)
brew install oven-sh/bun/bun   # or: curl -fsSL https://bun.sh/install | bash
cd ~/.claude/browse && bun install && bun run build
```

</details>

<details>
<summary><strong>GitHub MCP (optional)</strong></summary>

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN='your-token-here'  # add to ~/.zshrc
```

</details>

---

## What's Inside

| Component | Count | Purpose |
|-----------|-------|---------|
| **Hooks** | 20 across 9 events | Enforce quality at the tool level |
| **Agents** | 18 specialized | Review, coding, research, analysis, workflow |
| **Commands** | 37 slash commands | `/lfg`, `/cso`, `/plan`, `/slfg`, `/eval-skills` |
| **Skills** | 35 knowledge packs | Patterns, security, TDD, deployment, learning |
| **Rules** | 10 enforced | Mandatory agents, testing, security, performance |
| **Scripts** | 6 | Skill eval, template gen, placeholder resolvers |
| **Browse** | Persistent daemon | Headless Chromium with ref system + cookie import |
| **MCPs** | 6 servers | GitHub, Memory, Sequential Thinking, Context7, Filesystem, Playwright |
| **Plugins** | 6 | Pyright LSP, TypeScript LSP, Context7, Hookify, mgrep, ECC |

---

## The Methodology

### Plan -> Work -> Review -> Learn -> Compound

**1. Plan First (Enforced)**
Claude enters Plan mode before any multi-file change. No exceptions. A good plan = one-shot execution.

**2. Intent Routing (Automatic)**
You speak naturally. wstack routes to the right tool.

| You say | wstack does |
|---------|------------|
| "build this" | `/lfg` — full autonomous: plan -> work -> review -> verify |
| "fix this bug" | `debugger` agent — systematic triage -> narrow -> fix |
| "review this" | `/workflows:review` — multi-agent review with P1/P2/P3 |
| "plan this" | `/plan` — structured plan, waits for your approval |
| "ship it" | `/commit-push` — review gate -> stage -> commit -> push |
| "clean up" | `/refactor-clean` — dead code removal + simplification |

**3. Review Gate (Hard Block)**
A `PreToolUse` hook **blocks** `git commit` until `code-reviewer` has run:
```
[BLOCKED] code-reviewer has NOT been run yet.
Launch code-reviewer agent first, then retry.
```

**4. Compound Learning**
Every tool call is observed. Patterns are extracted as "instincts" with confidence scores. When an instinct appears in 2+ projects with 0.8+ confidence, it auto-promotes to global scope.

**The loop:** observe -> extract -> evolve -> promote -> compound

---

## The 18 Agents

| Category | Agents |
|----------|--------|
| **Review** | `code-reviewer` `simplicity-reviewer` `security-sentinel` `performance-oracle` `architecture-reviewer` `test-architect` |
| **Coding** | `python-engineer` `fintech-engineer` `websocket-engineer` |
| **Workflow** | `planner` `debugger` `learner` `memory-drift-detector` |
| **Research** | `researcher` `best-practices-researcher` |
| **Analysis** | `data-scientist` `spec-flow-analyzer` |
| **General** | `writer` |

Every task starts with `researcher` and ends with `code-reviewer` + `simplicity-reviewer`. This is **mandatory** — enforced by `rules/mandatory-agents.md`.

---

## The Hook System

20 hooks across 9 lifecycle events. This is where enforcement lives.

| Event | Count | What it does |
|-------|-------|-------------|
| **SessionStart** | 1 | Reset review gate, show git context |
| **UserPromptSubmit** | 1 | Inject agent routing reminders |
| **PreToolUse** | 4 | Block commits without review, block dev servers outside tmux, continuous learning, block unnecessary .md files |
| **PostToolUse** | 6 | Auto-format (black/ruff/prettier), type-check, console.log warning, PR logging, bash audit, continuous learning |
| **Stop** | 3 | Desktop notification, review-missing warning, instinct check |
| **SubagentStop** | 1 | Log agent completions |
| **PostToolUseFailure** | 1 | Log failures for learning |
| **Notification** | 1 | macOS desktop alerts |
| **PreCompact** | 1 | Snapshot files before context compaction |

---

## Browse Daemon

Persistent headless Chromium for sub-second browser automation. No cold starts.

```bash
# Setup (one time)
cd ~/.claude/browse && bun install && bun run build

# Usage (auto-starts daemon)
~/.claude/browse/bin/browse goto https://example.com
~/.claude/browse/bin/browse click @e3
~/.claude/browse/bin/browse fill @e5 "hello world"
~/.claude/browse/bin/browse screenshot ./page.png
~/.claude/browse/bin/browse links
~/.claude/browse/bin/browse accessibility
```

**Features:**
- **Ref system**: `@e1`, `@e2`, ... for reliable element targeting via accessibility tree
- **Cookie import**: Import from Chrome, Arc, or Brave (macOS Keychain)
- **Bearer auth**: Random token per session, localhost only
- **Idle timeout**: Auto-shutdown after 30 minutes
- **Core commands**: goto, click, fill, text, screenshot, links, forms, accessibility, select, hover, scroll, cookies, pdf, html

---

## Security Audit (`/cso`)

15-phase infrastructure-first security audit. Not a checklist — a reasoning framework.

```
/cso                    # Full daily audit (all 15 phases)
/cso --comprehensive    # Deep scan (low confidence threshold)
/cso --diff             # Branch changes only
/cso --owasp            # OWASP Top 10 focus
/cso --supply-chain     # Dependency audit
/cso --infra            # Infrastructure focus
/cso --code             # Code security focus
```

**Phases:** Stack Detection -> Attack Surface -> Secrets Archaeology -> Dependency Supply Chain -> CI/CD Pipeline -> Infrastructure -> Webhooks -> LLM/AI Security -> Skill Supply Chain -> OWASP Top 10 -> STRIDE Threat Model -> FP Filtering -> Severity Rating -> Trend Tracking -> Final Report

Includes 24 false-positive exclusion rules so you don't waste time on non-issues.

---

## Skill Eval (`/eval-skills`)

3-tier evaluation for skill quality:

```
/eval-skills                    # Static validation only (free)
/eval-skills --judge plan       # LLM grades skill doc quality (~$0.15)
/eval-skills --e2e plan         # Full E2E run via claude -p (~$4)
/eval-skills --all              # All 3 tiers, all skills
```

---

## Template System

Generate SKILL.md from templates with placeholder resolution:

```bash
python3 ~/.claude/scripts/gen-skill-docs.py                # Generate all
python3 ~/.claude/scripts/gen-skill-docs.py --dry-run      # Check for drift
python3 ~/.claude/scripts/gen-skill-docs.py --skill plan   # Single skill
```

Create `SKILL.md.tmpl` files with `{{PREAMBLE}}`, `{{SKILL_NAME}}`, `{{SKILL_DESCRIPTION}}` placeholders. Add custom resolvers by dropping `.py` files in `scripts/resolvers/`.

---

## Personalize

Edit `~/.claude/CLAUDE.md`:
- Change "Who I Am" to describe yourself and your stack
- Keep it under 100 lines (over 200 gets partially ignored)
- Add project-specific instructions in each project's own `CLAUDE.md`

The Key Learnings section grows as you work. Each mistake should only happen once.

---

## Configuration

| Setting | Value | Why |
|---------|-------|-----|
| `CLAUDE_CODE_ENABLE_ALWAYS_THINKING` | `1` | Extended reasoning on every response |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `64000` | No output truncation |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `1` | Multi-agent orchestration |
| `bypassPermissions` | `true` | Speed over ceremony (optional — remove if you prefer prompts) |

---

## License

MIT

---

<p align="center">
  <strong>Plan -> Work -> Review -> Learn -> Compound -> Repeat.</strong>
  <br>
  Built by <a href="https://github.com/beratcelik1">@beratcelik1</a>
</p>
