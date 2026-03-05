# Global Instructions

## Who I Am
Developer building with Python and TypeScript. Speed over ceremony. I want Claude to do the work, not describe it.

## How I Work
- I say what I want in plain English. Claude picks the right agents/skills/commands.
- Don't ask me which workflow to run — match my intent to the right tool.
- Don't explain what you're about to do. Just do it.
- **ALWAYS use Plan mode (EnterPlanMode) before writing ANY code** if the task touches 2+ files, involves new logic, or is not a trivial one-line fix. No exceptions. A good plan = one-shot execution. Iterate on the plan with me until I approve, THEN execute.
- If something fails, fix it. Don't ask me unless stuck after 2 attempts.
- Show results, not process. Short summaries, not essays.
- Do what was asked. Nothing more, nothing less. NEVER create files unless necessary.

## What Matters (in order)
1. **Working code** — runs, passes tests, handles edge cases
2. **Verification** — ALWAYS give yourself a way to verify. Run tests, run the code, check the output. Never trust code just because it "looks right."
3. **Speed** — ship fast, iterate. Don't over-engineer.
4. **Correctness** — especially for money/trading logic. Decimal precision matters.
5. **Simplicity** — less code is better. No premature abstractions.

## Setup Map
```
~/.claude/
  agents/     18 agents (review/, coding/, workflow/, research/, analysis/, general/)
  skills/     31 skills (patterns, security, TDD, continuous-learning-v2, eval-harness)
  commands/   36 commands (/lfg, /slfg, /brainstorm, /deepen-plan, instinct-*, workflows/*)
  rules/      10 rules (mandatory-agents, tools-auto-use, error-handling, security, performance)
  settings.json   20 hooks across 9 event types, 6 MCPs, 6 plugins
```
Rules in `rules/` are enforced automatically — do NOT duplicate rule content here.

## Intent Routing (Claude picks automatically)
| When I say... | You do... |
|---------------|-----------|
| "build this" / "implement X" | `/lfg` (or `/slfg` if multi-file) |
| "fix this bug" | `debugger` agent |
| "review this" / "check the code" | `/workflows:review` |
| "plan this" / "how should we..." | `/plan` then wait for approval |
| "let's brainstorm" / "what should we..." | `/brainstorm` |
| "clean up" / "refactor" | `/refactor-clean` |
| "ship it" / "commit" | `/commit-push` |
| "what did we learn" | `/workflows:compound` |
| "run tests" | `pytest` or `npm test` (detect from project) |
| "deploy" / "go live" | Check deployment-patterns skill, confirm before acting |
| Questions / explanations | Answer directly. No agents. No tools. Just talk. |
| Writing / emails / docs | `writer` agent |
| Non-coding conversation | No code-reviewer, no linting, no agents |

## TODO Priority (use across all projects)
- `TODO(0)`: Critical — never merge with this
- `TODO(1)`: High — architectural flaw, major bug
- `TODO(2)`: Medium — minor bug, missing feature
- `TODO(3)`: Low — polish, tests, docs

## Meta-Rules (how to update THIS file)
- NEVER exceed 100 lines. If approaching limit, move details to `rules/` or `docs/`.
- Each rule: one sentence. Use ALWAYS/NEVER for non-negotiable rules.
- Key Learnings: only universal truths that apply across ALL projects.
- Project-specific learnings go in project CLAUDE.md, not here.
- When Claude makes a mistake worth remembering: "Reflect on this mistake. Abstract and generalize the learning. Write it to CLAUDE.md."

## Key Learnings
- **Verification is the #1 force multiplier** — give Claude a feedback loop (tests, running the code, checking output) and quality 2-3x's. Never trust code because it "looks right."
- bypassPermissions is intentional — I accept the risk for speed
- Hook prompt types are flaky with JSON validation — keep prompts short
- CLAUDE.md over 200 lines gets partially ignored — keep lean, use rules/
- NEVER send an LLM to do a linter's job — code style belongs in ruff/eslint config, not here
- Subagents MUST write findings to files (absolute path) before returning — otherwise context is lost
- Max 3-4 parallel subagents — beyond that, orchestration overhead exceeds gains
- When mocking in tests: use patch.object, not patch with string paths (refactor-safe)
- When Claude does something wrong: add the learning HERE immediately. Each mistake should only happen once.
