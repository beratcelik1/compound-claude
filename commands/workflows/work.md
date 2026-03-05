---
name: workflows:work
description: Execute a work plan efficiently — task loop, incremental commits, continuous testing
argument-hint: "[plan file path or specification]"
---

# Execute Work Plan

## Input Document

**Plan/Spec:** $ARGUMENTS

**If empty:** Check `docs/plans/` for recent plans, or ask what to work on.

## Phase 1: Quick Start

### 1. Read & Clarify
- Read the work document completely
- If anything is unclear, ask clarifying questions NOW
- Get user approval to proceed

### 2. Setup Environment
```bash
current_branch=$(git branch --show-current)
default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
```

**If on default branch:** Create feature branch or use worktree
**If on feature branch:** Ask "Continue on `[branch]` or create new?"

### 3. Create Task Breakdown
- Break plan into actionable tasks
- Identify dependencies between tasks
- Prioritize: what needs to happen first?

## Phase 2: Execute

### Task Loop

```
while tasks remain:
  - Read referenced files from plan
  - Look for similar patterns in codebase
  - Implement following existing conventions
  - Run tests after changes
  - Mark checkbox in plan file ([ ] -> [x])
  - Evaluate for incremental commit
```

### Incremental Commits

| Commit when... | Don't commit when... |
|----------------|---------------------|
| Logical unit complete | Small part of larger unit |
| Tests pass + meaningful progress | Tests failing |
| About to switch contexts | Would need "WIP" message |

```bash
git add <specific files>
git commit -m "feat(scope): description"
```

### Follow Existing Patterns
- Read reference files from the plan first
- Match naming conventions exactly
- Reuse existing components
- When in doubt, grep for similar implementations

### Test Continuously
- Run tests after each significant change
- Fix failures immediately — don't defer
- Add new tests for new functionality

## Phase 3: Quality Check

1. Run full test suite
2. Run linting
3. All plan checkboxes checked
4. Code follows existing patterns

## Phase 4: Ship

1. Create commit with conventional format
2. Push and create PR if appropriate
3. Summarize what was completed
4. Note any follow-up work needed

## Swarm Mode (Optional)

For plans with 5+ independent tasks, enable swarm mode:

1. Break plan into independent work units
2. Spawn an agent per unit with worktree isolation:
   ```
   Agent(subagent_type="general-purpose", prompt="...", isolation="worktree")
   ```
3. Coordinate: monitor completion, handle dependencies
4. Merge results

See the `orchestrating-swarms` skill for patterns.

## Principles

- **Start fast** — clarify once, then execute
- **Plan is your guide** — load reference code, follow patterns
- **Test as you go** — continuous testing prevents surprises
- **Ship complete features** — don't leave things 80% done
