---
name: git-worktree
description: This skill manages Git worktrees for isolated parallel development. Use when reviewing PRs in isolation, working on features in parallel, or when agents need isolated repo copies.
---

# Git Worktree Manager

Manage Git worktrees for isolated parallel development.

## When to Use

1. **Code review** — Need to review a PR without switching branches
2. **Parallel development** — Work on multiple features simultaneously
3. **Agent isolation** — Give agents their own repo copy (use `isolation: "worktree"` in Agent tool)
4. **Risky changes** — Experiment without affecting your working branch

## Commands

### Create a Worktree

```bash
# Create from main (default)
git worktree add .worktrees/feature-name -b feature-name main

# Create from specific branch
git worktree add .worktrees/pr-review -b pr-review origin/feature-branch

# Copy .env files
cp .env .worktrees/feature-name/.env 2>/dev/null
```

### List Worktrees

```bash
git worktree list
```

### Switch to Worktree

```bash
cd .worktrees/feature-name
```

### Clean Up

```bash
# Remove specific worktree
git worktree remove .worktrees/feature-name

# Prune stale worktrees
git worktree prune
```

## Integration with Workflows

### `/workflows:review`

```
1. Check current branch
2. If ALREADY on target branch -> no worktree needed
3. If DIFFERENT branch -> offer worktree for isolated review
```

### `/workflows:work`

```
1. If on default branch -> "New branch or worktree?"
2. If on feature branch -> "Continue here or new worktree?"
```

### Agent Tool

The Agent tool has built-in worktree support:

```
Agent(
  subagent_type="general-purpose",
  prompt="Implement feature X",
  isolation="worktree"  # Automatic isolated copy
)
```

## Key Rules

- Add `.worktrees` to `.gitignore`
- Always copy `.env` files to new worktrees
- Don't remove the worktree you're currently in
- Worktrees share git history — lightweight, not full clones
