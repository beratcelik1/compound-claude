---
name: file-todos
description: This skill should be used when managing the file-based todo tracking system in the todos/ directory. It provides workflows for creating todos, managing status and dependencies, conducting triage, and integrating with code review processes.
disable-model-invocation: true
---

# File-Based Todo Tracking

## Overview

The `todos/` directory contains a file-based tracking system for managing code review feedback, technical debt, feature requests, and work items. Each todo is a markdown file with YAML frontmatter and structured sections.

## File Naming Convention

```
{issue_id}-{status}-{priority}-{description}.md
```

- **issue_id**: Sequential number (001, 002, 003...) — never reused
- **status**: `pending` (needs triage), `ready` (approved), `complete` (done)
- **priority**: `p1` (critical), `p2` (important), `p3` (nice-to-have)
- **description**: kebab-case, brief

**Examples:**
```
001-pending-p1-security-vulnerability.md
002-ready-p2-performance-optimization.md
003-complete-p3-code-cleanup.md
```

## File Structure

```yaml
---
status: ready
priority: p1
issue_id: "002"
tags: [python, performance, async]
dependencies: ["001"]
---
```

**Required sections:**
- **Problem Statement** — What is broken, missing, or needs improvement?
- **Findings** — Investigation results, root cause, key discoveries
- **Proposed Solutions** — Multiple options with pros/cons, effort, risk
- **Recommended Action** — Clear plan (filled during triage)
- **Acceptance Criteria** — Testable checklist items
- **Work Log** — Chronological record with date, actions, learnings

## Common Workflows

### Creating a New Todo

1. Determine next issue ID: `ls todos/ | grep -o '^[0-9]\+' | sort -n | tail -1`
2. Create file: `todos/{NEXT_ID}-pending-{priority}-{description}.md`
3. Fill required sections
4. Add relevant tags

**Create todo when:** >15 min work, needs research, has dependencies, requires approval
**Act immediately when:** <15 min, obvious fix, user requests immediate action

### Triaging Pending Items

1. List pending: `ls todos/*-pending-*.md`
2. For each: review Problem Statement, Findings, Proposed Solutions
3. Approve: rename `pending` -> `ready`, fill Recommended Action
4. Defer: leave as `pending`

Use `/triage` for interactive approval workflow.

### Managing Dependencies

```yaml
dependencies: ["002", "005"]  # Blocked by issues 002 and 005
dependencies: []               # No blockers
```

### Completing a Todo

1. Verify all acceptance criteria checked
2. Update Work Log with final session
3. Rename: `ready` -> `complete`
4. Update frontmatter: `status: complete`
5. Commit: `feat: resolve issue 002`

## Priority Guide

| Priority | Meaning | Examples |
|----------|---------|---------|
| **p1** | Critical — blocks merge, security/data issues | Vulnerabilities, data corruption, breaking changes |
| **p2** | Important — should fix | Performance, architectural concerns, reliability |
| **p3** | Nice-to-have | Cleanup, optimization opportunities, docs |

## Quick Reference

```bash
# Find unblocked high-priority work
grep -l 'dependencies: \[\]' todos/*-ready-p1-*.md

# Count by status
for s in pending ready complete; do echo "$s: $(ls -1 todos/*-$s-*.md 2>/dev/null | wc -l)"; done

# Search by tag
grep -l "tags:.*python" todos/*.md
```
