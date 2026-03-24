---
name: wrap-up
description: End session with structured summary, learnings extraction, and memory update
---

End the current session with a structured summary and memory update.

## Steps

1. Review all changes made during this session:
   - Run `git diff --stat` for uncommitted changes.
   - Run `git log --oneline --since="4 hours ago"` for recent commits.
   - Scan for TODO/FIXME comments added during the session.
2. Compile a session summary:
   - What was the original goal or task?
   - What was actually accomplished?
   - What is remaining or deferred?
3. Extract learnings to save:
   - New patterns or conventions established.
   - Gotchas or bugs discovered and how they were resolved.
   - Useful commands or techniques discovered.
4. Update project CLAUDE.md with relevant learnings.
5. Update memory files if applicable.
6. Commit any outstanding changes if appropriate.
7. Create a brief handoff note for the next session.

## Format

```
## Session Wrap-Up (<date>)

### Goal
<what was the objective>

### Accomplished
- <completed item>

### Deferred
- <item not completed and why>

### Learnings
- <insight saved to CLAUDE.md>

### Next Session
Start with: <specific instruction for next session>
```

## Rules

- Always commit or stash changes before wrapping up; do not leave a dirty tree.
- Keep the summary actionable, not narrative.
- Save learnings to CLAUDE.md so they persist across sessions.
- Flag any time-sensitive items.
