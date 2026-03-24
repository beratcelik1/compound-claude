---
name: workflows:review
description: Multi-agent code review with structured findings, P1/P2/P3 severity, and file-based todo tracking
argument-hint: "[PR number, branch name, or 'latest']"
---

# Multi-Agent Code Review

## Review Target

**Target:** $ARGUMENTS

**If empty:** Review current branch changes against main.

## Setup

1. Determine review target type: PR number, branch name, or current changes
2. Get the diff:
   ```bash
   # Current branch vs main
   git diff main...HEAD
   git diff --name-only main...HEAD

   # Or for a PR
   gh pr diff [number]
   ```
3. Fetch file list and summary

## Launch Review Agents (Parallel)

Launch ALL applicable review agents in a SINGLE message:

### Always Run:
- `code-reviewer` — Code quality, patterns, naming, Pythonic/idiomatic code
- `simplicity-reviewer` — YAGNI violations, unnecessary complexity

### Conditional (based on changed files):
- `security-sentinel` — If code touches auth, secrets, user input, APIs, .env
- `performance-oracle` — If code has loops, queries, algorithms, data structures
- `architecture-reviewer` — If 8+ files changed or new modules added
- `learnings-researcher` — Search docs/solutions/ for past issues related to changed modules

**Each agent receives:** The full diff + file list + brief context about what changed.

## Synthesize Findings

After all agents complete:

1. **Collect** all findings from every agent
2. **Deduplicate** — merge overlapping findings
3. **Categorize** by type: security, performance, architecture, quality
4. **Assign severity:**
   - **P1 (Critical)** — Blocks merge: security vulnerabilities, data corruption, breaking changes
   - **P2 (Important)** — Should fix: performance issues, architectural concerns, reliability
   - **P3 (Nice-to-have)** — Enhancements: cleanup, optimization, docs

## Create Todo Files

For each finding, create a file in `todos/` using the file-todos skill:

```
{issue_id}-pending-{priority}-{description}.md
```

Example:
```
001-pending-p1-sql-injection-vulnerability.md
002-pending-p2-n-plus-one-query.md
003-pending-p3-unused-import.md
```

## Summary Report

Present:

```markdown
## Code Review Complete

**Review Target:** [branch/PR]
**Files Changed:** [count]

### Findings Summary
- **P1 (Critical):** [count] — BLOCKS MERGE
- **P2 (Important):** [count] — Should Fix
- **P3 (Nice-to-have):** [count] — Enhancements

### P1 — Critical (BLOCKS MERGE)
- `001-pending-p1-{finding}.md` — {description}

### P2 — Important
- `002-pending-p2-{finding}.md` — {description}

### P3 — Nice-to-Have
- `003-pending-p3-{finding}.md` — {description}

### Review Agents Used
- code-reviewer, simplicity-reviewer, [others]

### Next Steps
1. Fix P1 findings (required before merge)
2. `/triage` — interactive triage of all findings
3. `/resolve-todos` — fix all approved items in parallel
```

## P1 Findings Block Merge

Any P1 findings MUST be addressed before saying "done" or creating a PR.
