# Compound Claude

**The enforcement-first Claude Code methodology.** Every session makes the next one smarter.

Most Claude Code setups are collections of files you drop in a folder and hope Claude reads. This one is different. It's a closed-loop system: **Plan → Work → Review → Learn → Compound.** Each phase is enforced — not suggested — through hooks that block bad behavior at the tool level.

```
You can't commit without a code review.
You can't stop if you described work instead of doing it.
You can't skip planning on complex tasks.
And every session's learnings feed into the next one.
```

---

## What's Inside

| Component | Count | What it does |
|-----------|-------|-------------|
| **Hooks** | 20 across 9 events | Enforce the methodology at every lifecycle point |
| **Agents** | 18 | Specialized AI agents for review, coding, research, analysis |
| **Commands** | 36 | Slash commands for every workflow (`/lfg`, `/slfg`, `/plan`, `/brainstorm`) |
| **Skills** | 31 | Reusable knowledge packages (patterns, security, TDD, deployment) |
| **Rules** | 10 | Behavioral rules enforced automatically every session |
| **MCP Servers** | 6 | GitHub, Memory, Sequential Thinking, Context7, Filesystem, Playwright |
| **Plugins** | 6 | Pyright LSP, TypeScript LSP, Context7, Hookify, mgrep, ECC |

## The Methodology

### 1. Plan First (Enforced)

Claude must enter Plan mode before writing any code that touches 2+ files. No exceptions. This is enforced in CLAUDE.md, in `rules/mandatory-agents.md`, and in the intent routing table. A good plan = one-shot execution.

### 2. Work With Agents

Every task automatically routes to the right agent:

| You say | Claude does |
|---------|------------|
| "build this" | `/lfg` — full autonomous workflow |
| "fix this bug" | `debugger` agent |
| "review this" | `/workflows:review` — multi-agent review |
| "plan this" | `/plan` — structured plan, waits for approval |
| "ship it" | `/commit-push` — stage, commit, push |

### 3. Review Gate (Enforced)

A `PreToolUse` hook **blocks** `git commit` and `git push` until the code-reviewer agent has run. This isn't a suggestion — it's a hard gate. The commit literally fails if you skip review.

```
[BLOCKED] code-reviewer has NOT been run yet.
Launch code-reviewer agent first, then retry.
```

### 4. Anti-Rationalization (Enforced)

A `Stop` hook detects when Claude describes work instead of doing it. If Claude says "you can do X" or "I recommend Y" instead of actually making the changes, the session is blocked from ending.

### 5. Compound Learning

After every non-trivial bug fix or feature, learnings are captured to `docs/solutions/` and key insights are added to CLAUDE.md. The continuous learning system observes every tool call, extracts patterns as "instincts," and evolves them into reusable skills and agents over time.

**The loop:** observe → extract → evolve → promote → compound

---

## The Hook System

20 hooks across 9 lifecycle events. This is where the enforcement lives.

| Event | Hooks | What they do |
|-------|-------|-------------|
| **SessionStart** | 1 | Reset review gate, inject git context |
| **UserPromptSubmit** | 1 | Remind agent routing rules |
| **PreToolUse** | 4 | Block commits without review, block dev servers outside tmux, observe for learning, block unnecessary .md files |
| **PostToolUse** | 6 | Auto-format Python (black+ruff) and JS/TS (prettier), TypeScript type-check, console.log warning, PR URL logging, bash audit log, observe for learning |
| **Stop** | 4 | Desktop notification, review-missing warning, anti-rationalization block, instinct notification |
| **SubagentStop** | 1 | Log agent completions for pattern analysis |
| **PostToolUseFailure** | 1 | Log failures for debugging and learning |
| **Notification** | 1 | macOS desktop alerts |
| **PreCompact** | 1 | Snapshot modified files before context compaction |

## The 18 Agents

Organized by role, each with a specialized AGENT.md:

**Review** — `code-reviewer` · `simplicity-reviewer` · `security-sentinel` · `performance-oracle` · `architecture-reviewer` · `test-architect`

**Coding** — `python-engineer` · `fintech-engineer` · `websocket-engineer`

**Workflow** — `planner` · `debugger` · `learner` · `memory-drift-detector`

**Research** — `researcher` · `best-practices-researcher`

**Analysis** — `data-scientist` · `spec-flow-analyzer`

**General** — `writer`

Plus all built-in `subagent_type` values work without custom AGENT.md files (e.g., `learnings-researcher`, `repo-research-analyst`, `python-reviewer`, `typescript-reviewer`).

## 36 Slash Commands

**Core workflows:**
`/lfg` — Full autonomous: plan → work → review → fix → verify
`/slfg` — Swarm mode: parallel agents for multi-file tasks
`/plan` — Structured implementation plan with research
`/brainstorm` — Explore approaches before committing to one
`/deepen-plan` — Parallel research agents enrich each plan section

**Code quality:**
`/code-review` · `/python-review` · `/tdd` · `/e2e` · `/test-coverage` · `/verify`

**Shipping:**
`/commit-push` · `/build-fix` · `/refactor-clean` · `/dead-code` · `/dependency-audit`

**Learning:**
`/learn-eval` · `/evolve` · `/instinct-status` · `/instinct-export` · `/instinct-import` · `/promote`

**Workflows (multi-step):**
`/workflows:review` · `/workflows:plan` · `/workflows:work` · `/workflows:compound`

## 31 Skills

Reusable knowledge packages loaded on demand:

`continuous-learning-v2` · `eval-harness` · `verification-loop` · `strategic-compact` · `orchestrating-swarms` · `python-patterns` · `python-testing` · `coding-standards` · `security-review` · `security-scan` · `tdd-workflow` · `api-design` · `backend-patterns` · `frontend-patterns` · `postgres-patterns` · `database-migrations` · `docker-patterns` · `deployment-patterns` · `e2e-testing` · `git-worktree` · `autonomous-loops` · `brainstorming` · `iterative-retrieval` · `search-first` · `skill-stocktake` · `smart-commit` · `compound` · `plan` · `work` · `review-code` · `file-todos`

## Configuration

The `settings.json` includes:

- **`effortLevel: "high"`** — Maximum model quality
- **`CLAUDE_CODE_ENABLE_ALWAYS_THINKING: "1"`** — Extended reasoning on every response
- **`CLAUDE_CODE_MAX_OUTPUT_TOKENS: "64000"`** — No output truncation
- **`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"`** — Multi-agent orchestration
- **`bypassPermissions`** — No permission prompts (speed over ceremony)
- **6 MCP servers** — GitHub, Memory, Sequential Thinking, Context7, Filesystem, Playwright
- **6 plugins** — Pyright LSP, TypeScript LSP, Context7, Hookify, mgrep, Everything-Claude-Code

---

## Install

### Quick (script)

```bash
git clone https://github.com/beratcelik1/compound-claude.git
cd compound-claude
chmod +x install.sh
./install.sh
```

### Manual

```bash
git clone https://github.com/beratcelik1/compound-claude.git
cd compound-claude

# Backup existing setup
cp -R ~/.claude ~/.claude-backup-$(date +%Y%m%d)

# Copy everything
cp -R agents skills commands rules ~/.claude/
cp CLAUDE.md ~/.claude/CLAUDE.md

# Patch home directory in settings and install
sed "s|__HOME__|$HOME|g" settings.json > ~/.claude/settings.json

# Set permissions
chmod +x ~/.claude/skills/continuous-learning-v2/hooks/observe.sh
chmod 600 ~/.claude/settings.json
```

### Dependencies

```bash
# macOS
brew install jq terminal-notifier tmux node
npm install -g prettier
pip install black ruff

# Linux
apt install jq tmux nodejs npm
npm install -g prettier
pip install black ruff
```

### GitHub MCP (optional)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN='your-token-here'
```

Restart Claude Code after installation.

---

## Personalize

Edit `~/.claude/CLAUDE.md` — change the "Who I Am" section to describe yourself and your stack. Keep it under 100 lines. Add project-specific instructions in each project's own `CLAUDE.md`.

The Key Learnings section grows as you work. Each mistake should only happen once.

---

## Philosophy

**Other setups give Claude suggestions. This one gives Claude constraints.**

The insight: Claude Code is incredibly capable but needs guardrails, not guidelines. A suggestion to "always review code" gets ignored under pressure. A hook that blocks `git commit` until review passes doesn't.

The compound learning system means your setup gets smarter over time. Session 100 is dramatically more effective than session 1, because every debugging insight, every failed approach, every discovered pattern is captured and fed back into the system.

**Plan → Work → Review → Learn → Compound → Repeat.**

---

## Credits

Built with [Everything-Claude-Code](https://github.com/affaan-m/everything-claude-code) plugin and continuous-learning-v2 system. Inspired by [Boris Cherny's](https://howborisusesclaudecode.com) plan-first philosophy and [Trail of Bits'](https://github.com/trailofbits/claude-code-config) security-first approach.

## License

MIT
