---
name: review-code
description: Perform multi-agent code review on current changes or a PR
argument-hint: "[PR number, branch name, or 'latest' for current changes]"
---

# Code Review

Perform exhaustive code review using multiple specialized agents in parallel.

## Target

Review target: $ARGUMENTS

**If empty:** Review current branch changes against main.

## Steps

### 1. Determine Review Target

```bash
git diff --stat main...HEAD  # or against the base branch
git log --oneline main..HEAD
```

### 2. Detect Languages

Scan changed files to determine which language-specific reviewers to use:
- `.py` files -> python-reviewer
- `.ts`/`.tsx` files -> typescript-reviewer
- Both -> use both reviewers

### 3. Launch Parallel Reviews

Run ALL relevant agents in parallel:

**Always run:**
- **simplicity-reviewer** - Is the code as simple as possible?
- **security-sentinel** - Are there security vulnerabilities?

**Language-specific (based on changed files):**
- **python-reviewer** - Python quality, type safety, Pythonic patterns
- **typescript-reviewer** - TS quality, type safety, modern patterns

**For large changes (10+ files):**
- **architecture-strategist** - Architectural compliance
- **pattern-detective** - Pattern consistency

### 4. Synthesize Findings

Collect all agent reports and:
1. Remove duplicates
2. Categorize by severity:
   - P1 CRITICAL: Blocks merge (security, data corruption, breaking changes)
   - P2 IMPORTANT: Should fix (performance, architecture, quality)
   - P3 NICE-TO-HAVE: Enhancements (cleanup, minor improvements)
3. Create actionable todo items

### 5. Summary Report

```markdown
## Code Review Complete

**Target:** [branch/PR]
**Files reviewed:** [count]
**Agents used:** [list]

### Findings
- P1 Critical: [count] - BLOCKS MERGE
- P2 Important: [count] - Should Fix
- P3 Nice-to-have: [count]

### Critical Issues
[List P1 findings with file:line and fix suggestions]

### Important Issues
[List P2 findings]

### Suggestions
[List P3 findings]

### Next Steps
1. Fix P1 issues (required)
2. Address P2 issues (recommended)
3. Consider P3 suggestions
```

## After Review

- If P1 issues found: Fix before merging
- Offer to auto-fix simple issues
- Suggest running `/compound` if interesting patterns were found
