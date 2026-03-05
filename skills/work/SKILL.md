---
name: work
description: Execute a work plan efficiently while maintaining quality
argument-hint: "[plan file path or specification]"
---

# Work

Execute a plan file systematically. Focus on shipping complete features.

## Input

Plan: $ARGUMENTS

**If empty, check for recent plans:**
```bash
ls -t docs/plans/*.md 2>/dev/null | head -5
```

## Execution

### Phase 1: Quick Start

1. **Read the plan completely**
   - Review all references and links
   - If anything is unclear, ask now (not after building the wrong thing)

2. **Setup environment**
   - Check current branch
   - If on main: create feature branch (`feat/<name>`, `fix/<name>`)
   - If on feature branch: confirm or create new

3. **Create todo list**
   - Break plan into actionable tasks with TodoWrite
   - Include testing tasks
   - Prioritize by dependencies

### Phase 2: Execute

For each task:
```
while (tasks remain):
  - Mark task in_progress
  - Read referenced files from plan
  - Look for similar patterns in codebase
  - Implement following existing conventions
  - Write tests for new functionality
  - Run tests after changes
  - Mark task completed
  - Check off corresponding item in plan file ([ ] -> [x])
  - Consider incremental commit if logical unit complete
```

**Commit when:**
- Logical unit complete (model, service, component)
- Tests pass + meaningful progress
- About to switch contexts

**Don't commit when:**
- Tests failing
- Partial work that would need "WIP" message

### Phase 3: Quality Check

1. Run full test suite
2. Run linting
3. Verify all TodoWrite tasks completed
4. All plan checkboxes checked off

### Phase 4: Ship

1. Final commit with conventional message
2. Push to remote
3. Create PR with summary
4. Notify what was completed

## Principles

- Start fast, execute faster
- The plan is your guide - follow referenced patterns
- Test as you go, not at the end
- Ship complete features - don't leave things 80% done
- Quality is built in, not bolted on
