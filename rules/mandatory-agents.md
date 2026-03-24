# Mandatory Agent Usage

Claude MUST use agents automatically. Do not wait to be asked.

## AT START of Every Task
Launch `researcher` agent: repo structure, docs/solutions/, git history, existing patterns.

## AT END of Every Task
Launch in parallel before saying "done":
- **Always**: `code-reviewer`
- **Always**: `simplicity-reviewer`
- If auth/secrets/user-input: `security-sentinel`
- If loops/queries/algorithms: `performance-oracle`
- If 8+ files: `architecture-reviewer`

Then: run tests + linting. Fix failures. Do NOT say "done" until reviews + tests pass.

## Domain Agents (launch when relevant)
| Trigger | Agent |
|---------|-------|
| Bug report | `debugger` |
| WebSocket / real-time feeds | `websocket-engineer` |
| Trade results, PnL, statistics | `data-scientist` |
| Monetary calculations, order sizing | `fintech-engineer` |
| Test suite design, coverage | `test-architect` |
| Python patterns, typing, async | `python-engineer` |
| Specs, UI flows, requirements | `spec-flow-analyzer` |
| Deploy, production issues | `architecture-reviewer` |
| Stale memory / outdated context | `memory-drift-detector` |
| Writing, emails, docs | `writer` |
| External best practices research | `best-practices-researcher` |
| After fixing non-trivial bug | `learner` (or ask about `/compound`) |

## Plan First (MANDATORY)
ALWAYS enter Plan mode (EnterPlanMode) before writing code if the task touches 2+ files, involves new logic, or is not a trivial one-line fix. Present the plan, get explicit approval, THEN execute. A good plan = one-shot execution.

## The Rule
Agents are NOT optional. Start with `researcher`, end with `code-reviewer`. Do not skip. Do not wait to be asked.
