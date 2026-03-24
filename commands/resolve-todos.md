---
name: resolve-todos
description: Resolve all pending todos using parallel agents — one agent per todo item
argument-hint: "[optional: specific todo ID or pattern]"
---

# Resolve Todos in Parallel

## Step 1: Analyze

Get all unresolved todos:
```bash
ls todos/*-ready-*.md 2>/dev/null
```

If no ready items, check pending:
```bash
ls todos/*-pending-*.md 2>/dev/null
```

If pending items exist, suggest: "Run `/triage` first to approve pending items."

## Step 2: Plan Dependencies

Read each todo and check for dependencies:
```bash
grep "^dependencies:" todos/*-ready-*.md
```

Create execution order:
- Items with no dependencies -> can run in parallel
- Items with dependencies -> must wait for blockers to complete

## Step 3: Implement (Parallel)

For each independent todo, spawn an agent in parallel:

```
Agent(subagent_type="general-purpose", prompt="
Fix this issue:

[Full content of todo file]

Instructions:
1. Read the Recommended Action section
2. Implement the fix
3. Run tests to verify
4. Report what was changed
", run_in_background=true)
```

**Launch ALL independent agents in a SINGLE message.**

After independent items complete, launch dependent items.

## Step 4: Commit & Resolve

For each completed todo:
1. Commit the changes: `git add <files> && git commit -m "fix: resolve issue [ID] - [description]"`
2. Rename todo: `ready` -> `complete`
3. Update frontmatter: `status: complete`
4. Add final Work Log entry

Push all changes:
```bash
git push
```

## Summary

Present:
```markdown
## Todos Resolved

**Completed:** [count]
**Remaining:** [count]

### Resolved
- [ID] - [description] - [commit hash]

### Still Pending
- [ID] - [description] - [reason]
```
