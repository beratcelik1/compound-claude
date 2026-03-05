# Claude Code Setup — Installation Instructions

## For the person receiving this folder

Give this entire folder to Claude Code and paste the prompt below. Claude will handle everything.

---

## Prompt to paste into Claude Code

```
I have a folder at ~/Desktop/claude-setup-export/ that contains a complete, curated Claude Code global configuration. I need you to install it as my ENTIRE global ~/.claude/ setup. This is a FULL REPLACEMENT — my global Claude setup should be IDENTICAL to what's in this folder when you're done. Nothing extra, nothing missing.

Here are the exact steps:

1. BACKUP: Copy my ENTIRE existing ~/.claude/ to ~/.claude-backup-YYYYMMDD/ (use today's date). This is my safety net.

2. NUKE AND REPLACE — Delete these directories COMPLETELY from ~/.claude/:
   - ~/.claude/agents/ (DELETE entirely, then replace)
   - ~/.claude/skills/ (DELETE entirely, then replace)
   - ~/.claude/commands/ (DELETE entirely, then replace)
   - ~/.claude/rules/ (DELETE entirely, then replace)
   Also delete any OTHER agent/skill/command/rule directories that might exist under ~/.claude/ with different names (e.g. agents-backup-*, old-agents/, custom-agents/, etc).
   Keep ONLY: ~/.claude/projects/, ~/.claude/homunculus/, cache/, and session data (.jsonl files).

3. COPY from the export folder into ~/.claude/:
   - agents/ -> ~/.claude/agents/ (this has exactly 18 agents — no more, no less)
   - skills/ -> ~/.claude/skills/ (this has exactly 31 skills)
   - commands/ -> ~/.claude/commands/ (this has exactly 36 commands)
   - rules/ -> ~/.claude/rules/ (this has exactly 10 rules)
   - CLAUDE.md -> ~/.claude/CLAUDE.md (OVERWRITE any existing CLAUDE.md completely)

4. SETTINGS.JSON — This is critical. Read settings.json from the export folder. Find the string "__HOME__" and replace it with my actual home directory path (e.g. /Users/myname or /home/myname). Then COMPLETELY OVERWRITE ~/.claude/settings.json with the result. This file defines:
   - 20 hooks across 9 event types (SessionStart, PreToolUse, PostToolUse, Stop, SubagentStop, PostToolUseFailure, Notification, PreCompact, UserPromptSubmit)
   - 6 MCP servers (github, memory, sequential-thinking, context7, filesystem, playwright)
   - 6 plugins (pyright-lsp, typescript-lsp, context7, hookify, mgrep, everything-claude-code)
   - 3 env vars for max quality (AGENT_TEAMS, ALWAYS_THINKING, MAX_OUTPUT_TOKENS=64000)
   - bypassPermissions mode, effortLevel: high
   Do NOT merge with existing settings. OVERWRITE completely.

5. PERMISSIONS:
   - chmod +x ~/.claude/skills/continuous-learning-v2/hooks/observe.sh
   - chmod 600 ~/.claude/settings.json
   - chmod 600 ~/.claude/bash-commands.log 2>/dev/null (if it exists)

6. CLEANUP — Check for and DELETE any leftover files in ~/.claude/ that are NOT part of this system:
   - Any extra AGENT.md files outside the 18 in agents/
   - Any extra SKILL.md files outside the 31 in skills/
   - Any extra command .md files outside the 36 in commands/
   - Any old backup directories (agents-backup-*, skills-backup-*, etc.)
   - Any stale .md files in ~/.claude/ root that aren't CLAUDE.md
   List what you deleted so I can see.

7. DEPENDENCIES — Check if these are installed. Install any that are missing:
   - jq: brew install jq (or apt install jq on Linux)
   - terminal-notifier: brew install terminal-notifier (macOS only, skip on Linux)
   - tmux: brew install tmux
   - prettier: npm install -g prettier
   - black: pip install black (or pip3)
   - ruff: pip install ruff (or pip3)
   - node/npm: brew install node (needed for MCP servers)

8. GITHUB TOKEN — Check if GITHUB_PERSONAL_ACCESS_TOKEN is exported in my shell profile (~/.zshrc or ~/.bashrc). If not, tell me I need to add: export GITHUB_PERSONAL_ACCESS_TOKEN='my-token-here'

9. VERIFY — Run ALL of these checks:
   - find ~/.claude/agents -name "AGENT.md" | wc -l → must be exactly 18
   - find ~/.claude/skills -name "SKILL.md" | wc -l → must be approximately 31
   - find ~/.claude/commands -name "*.md" | wc -l → must be approximately 36
   - find ~/.claude/rules -name "*.md" | wc -l → must be exactly 10
   - python3 -c "import json; json.load(open('$HOME/.claude/settings.json'))" → must succeed (valid JSON)
   - test -x ~/.claude/skills/continuous-learning-v2/hooks/observe.sh → must be executable
   - grep -c '"hooks"' ~/.claude/settings.json → must find hooks section
   - grep -c 'mcpServers' ~/.claude/settings.json → must find MCP section

10. REPORT — Tell me:
    - All verification results (pass/fail for each)
    - What was deleted during cleanup
    - What dependencies were installed
    - Whether GitHub token was found
    - Any issues encountered

Do all of this now. Do not ask questions — just execute every step and report the results.
```

---

## What this setup includes

| Component | Count | Description |
|-----------|-------|-------------|
| Agents | 18 | Specialized AI agents for review, coding, research, workflow |
| Skills | 31 | Reusable knowledge (patterns, security, TDD, learning system) |
| Commands | 36 | Slash commands (/lfg, /slfg, /plan, /brainstorm, etc.) |
| Rules | 10 | Enforced behavior rules (mandatory agents, git workflow, etc.) |
| Hooks | 20 | Automated actions across 9 lifecycle events |
| MCP Servers | 6 | GitHub, Memory, Sequential Thinking, Context7, Filesystem, Playwright |
| Plugins | 6 | Pyright LSP, TypeScript LSP, Context7, Hookify, mgrep, ECC |

## Key behaviors this enables

- **Plan mode enforced** — Claude must plan before coding on 2+ file tasks
- **Code review gate** — `git commit/push` is BLOCKED until code-reviewer runs
- **Auto-formatting** — Python (black+ruff) and JS/TS (prettier) after every edit
- **Anti-rationalization** — Claude is blocked from describing work instead of doing it
- **Continuous learning** — Session observations are captured for pattern extraction
- **Desktop notifications** — macOS alerts when Claude finishes a task

## Prerequisites

- macOS or Linux
- Node.js (for MCP servers — `brew install node`)
- Python 3.10+ (for formatters — `brew install python`)
- Claude Code CLI installed and authenticated

## After installation

Restart Claude Code. The new setup takes effect immediately on the next session.

To personalize: Edit ~/.claude/CLAUDE.md — change "Who I Am" section to describe yourself. Keep it under 100 lines.
