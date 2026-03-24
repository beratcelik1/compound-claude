---
name: workflows:plan
description: Transform feature descriptions into well-structured implementation plans with research
argument-hint: "[feature description, bug report, or improvement idea]"
---

# Create Implementation Plan

## Feature Description

**Input:** $ARGUMENTS

**If empty, ask:** "What would you like to plan? Describe the feature, fix, or improvement."

## Step 0: Check for Brainstorm Output

```bash
ls -la docs/brainstorms/*.md 2>/dev/null | head -10
```

If a relevant brainstorm exists (matching topic, <14 days old):
1. Read it
2. Announce: "Found brainstorm from [date]: [topic]. Using as context."
3. Skip idea refinement — brainstorm already clarified WHAT to build

If no brainstorm, run idea refinement:
- Ask questions one at a time using AskUserQuestion
- Prefer multiple choice when options exist
- Focus on: purpose, constraints, success criteria
- Continue until clear OR user says "proceed"

## Step 1: Local Research (Parallel)

Launch in parallel:
- `learnings-researcher` agent -> search docs/solutions/ for past learnings
- `repo-research-analyst` agent -> understand codebase patterns

## Step 1.5: External Research (Conditional)

**Research if:** security, external APIs, unfamiliar territory, high uncertainty
**Skip if:** codebase has solid patterns, user knows what they want, straightforward

If researching, launch:
- `best-practices-researcher` agent -> external best practices

## Step 2: Plan Structure

**Title & filename:**
- Draft clear title: `feat: Add user authentication`
- Filename: `docs/plans/YYYY-MM-DD-<type>-<descriptive-name>-plan.md`
- Example: `2026-03-05-feat-settlement-sniping-plan.md`

**Choose detail level:**

### Minimal (simple bugs, small improvements)
- Problem statement + acceptance criteria + context

### Standard (most features)
- Overview + problem + solution + technical considerations + acceptance criteria + success metrics + risks

### Comprehensive (major features, architecture changes)
- All of standard + implementation phases + alternative approaches + resource requirements + future considerations

## Step 3: Write the Plan

Write to `docs/plans/` with YAML frontmatter:

```yaml
---
title: [Issue Title]
type: [feat|fix|refactor]
date: YYYY-MM-DD
---
```

Include:
- [ ] Checkboxes for all implementation tasks (tracked by `/workflows:work`)
- File paths with line numbers for reference code
- Code examples where helpful
- Acceptance criteria as testable checklist

## Step 4: Present Options

Ask: "Plan ready at `[path]`. What next?"

1. **Start `/workflows:work`** — Begin implementing
2. **Run `/deepen-plan`** — Enhance with parallel research agents
3. **Review and refine** — Iterate on the plan
4. **Create GitHub issue** — `gh issue create --title "..." --body-file [path]`

NEVER CODE! Just research and write the plan.
