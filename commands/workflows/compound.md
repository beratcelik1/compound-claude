---
name: workflows:compound
description: Document a recently solved problem to compound knowledge. Use after fixing bugs or discovering important patterns.
argument-hint: "[optional: brief context about the fix]"
---

# Compound — Document & Learn

Capture problem solutions while context is fresh.

**Context:** $ARGUMENTS

## Phase 1: Parallel Research (Agents return TEXT, not files)

Launch ALL in parallel:

1. **Context Analyzer** — Extract problem type, component, symptoms from conversation
2. **Solution Extractor** — Identify root cause, working solution, code examples
3. **Related Docs Finder** — Search `docs/solutions/` for related documentation
4. **Prevention Strategist** — Develop prevention strategies, test cases
5. **Category Classifier** — Determine category and filename

```
Agent(subagent_type="general-purpose", prompt="Analyze conversation context...")
Agent(subagent_type="general-purpose", prompt="Extract solution details...")
Agent(subagent_type="learnings-researcher", prompt="Search docs/solutions/ for related...")
Agent(subagent_type="general-purpose", prompt="Develop prevention strategies...")
Agent(subagent_type="general-purpose", prompt="Classify into category...")
```

## Phase 2: Assembly & Write

Wait for ALL Phase 1 agents. Then:

1. Collect all text results
2. Assemble markdown file with YAML frontmatter:

```yaml
---
title: Descriptive Title
category: build-errors|test-failures|runtime-errors|performance|security|integration|logic-errors
date: YYYY-MM-DD
tags: [relevant, tags]
---
```

3. Sections: Problem -> Root Cause -> Solution -> Prevention
4. Create directory: `mkdir -p docs/solutions/[category]/`
5. Write ONE file: `docs/solutions/[category]/[filename].md`

## Phase 3: Optional Enhancement

Based on problem type, run specialized review:
- **performance issue** -> `performance-oracle`
- **security issue** -> `security-sentinel`
- **any code-heavy issue** -> `code-reviewer` + `simplicity-reviewer`

## What It Captures

- **Problem symptom** — exact error messages, observable behavior
- **Investigation steps** — what didn't work and why
- **Root cause** — technical explanation
- **Working solution** — step-by-step fix with code
- **Prevention** — how to avoid in future
- **Cross-references** — links to related issues

## The Compounding Philosophy

```
Build -> Test -> Find Issue -> Research -> Fix -> Document -> Deploy
  ^                                                           |
  +-----------------------------------------------------------+
```

Each documented solution compounds knowledge. First fix: 30 min research. Next occurrence: 2 min lookup.

**Each unit of engineering work should make subsequent units easier — not harder.**
