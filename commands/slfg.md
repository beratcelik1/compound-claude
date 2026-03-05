---
name: slfg
description: Swarm-mode LFG — parallel agents for maximum speed on multi-file tasks
argument-hint: "[feature description]"
---

# Swarm LFG — Parallel Autonomous Workflow

Use swarm orchestration for maximum parallelism. For simpler tasks, use `/lfg` instead.

**Feature/Task:** $ARGUMENTS

**If empty, ask:** "What are we building? Describe the feature, fix, or improvement."

## Phase 1: Research (Parallel Swarm)

Launch ALL research agents in a SINGLE message (parallel):

1. `learnings-researcher` agent -> search docs/solutions/ for past learnings
2. `repo-research-analyst` agent -> understand codebase patterns
3. `best-practices-researcher` agent -> external best practices (if unfamiliar territory)

Wait for all to complete. Synthesize findings.

## Phase 2: Plan

1. Use the `/plan` skill to create a structured implementation plan
2. Incorporate research findings from Phase 1
3. Write plan to `docs/plans/YYYY-MM-DD-<type>-<name>-plan.md`
4. Present plan for approval
5. **STOP and wait for approval**

## Phase 3: Deepen Plan (Optional)

If the plan has 3+ sections or involves unfamiliar territory:
1. Run `/deepen-plan` with the plan file path
2. Launch parallel research agents for each section
3. Enhance plan with best practices, edge cases, performance considerations

## Phase 4: Work (Swarm Mode)

Break the plan into independent work units. For each independent unit, spawn an agent:

```
Agent(subagent_type="general-purpose", prompt="Implement [unit] following [plan section]", isolation="worktree")
```

- Independent units run in parallel (separate files/modules)
- Dependent units run sequentially
- Each agent commits its work
- Run tests after each unit completes

## Phase 5: Review (Parallel Swarm)

Launch ALL review agents in a SINGLE message:

1. `code-reviewer` — code quality, patterns, naming
2. `simplicity-reviewer` — YAGNI enforcement
3. `security-sentinel` — if auth/secrets/user-input touched
4. `performance-oracle` — if loops/queries/algorithms

Wait for all to complete. Synthesize into P1/P2/P3 findings.

## Phase 6: Resolve

1. Fix all P1 (Critical) findings immediately
2. Fix P2 (Important) findings
3. Create todos for P3 (Nice-to-have) items
4. Run tests one final time

## Phase 7: Ship

1. Run full test suite + linting
2. Create clean commit
3. Summarize what was built

## Phase 8: Compound

If non-trivial learnings emerged:
"Should I document these learnings with `/compound`?"
