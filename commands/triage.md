---
name: triage
description: Interactive triage of code review findings and todos
argument-hint: "[findings source or 'all']"
---

# Triage — Interactive Finding Review

Go through review findings one by one and decide what to do with each.

**IMPORTANT: DO NOT CODE ANYTHING DURING TRIAGE!**

This command is for:
- Triaging code review findings
- Processing security audit results
- Reviewing performance analysis
- Handling any categorized findings that need tracking

## Workflow

### Step 1: Gather Findings

Check for pending findings:
```bash
ls docs/todos/*pending* 2>/dev/null || ls todos/*pending* 2>/dev/null
```

If no todo files exist, ask: "What findings should we triage? Paste review output or describe the source."

### Step 2: Present Each Finding

For each finding, present:

```
---
Issue #X: [Brief Title]

Severity: P1 (CRITICAL) / P2 (IMPORTANT) / P3 (NICE-TO-HAVE)
Category: [Security/Performance/Architecture/Bug/etc.]

Description:
[What's wrong or could be improved]

Location: [file_path:line_number]

Proposed Fix:
[How to fix it]

Effort: [Small < 2hrs / Medium 2-8hrs / Large > 8hrs]
---
Do you want to address this?
1. yes - mark as ready to fix
2. next - skip this item
3. custom - modify priority or description
```

### Step 3: Handle Decision

**"yes"** → Mark as ready to fix, add to TodoWrite
**"next"** → Skip, track as acknowledged-but-skipped
**"custom"** → Modify before accepting

### Step 4: Continue Until All Processed

Process all items one by one. Don't batch — each finding gets individual attention.

### Step 5: Final Summary

```markdown
## Triage Complete

**Total Items:** [X]
**Accepted:** [Y] (ready to fix)
**Skipped:** [Z]

### Ready to Fix:
- [P1] [Issue title] — [location]
- [P2] [Issue title] — [location]

### Skipped:
- [Issue] — Reason: [why skipped]

### Next Steps:
1. Fix P1 issues first
2. Then P2 issues
3. Consider P3 in next iteration
```
