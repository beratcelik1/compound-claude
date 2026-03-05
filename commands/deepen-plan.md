---
name: deepen-plan
description: Enhance a plan with parallel research agents for each section — adds depth, best practices, edge cases, and implementation details
argument-hint: "[path to plan file]"
---

# Deepen Plan — Power Enhancement Mode

This command takes an existing plan and enhances each section with parallel research agents.

## Plan File

**Path:** $ARGUMENTS

**If empty:**
1. Check for recent plans: `ls -la docs/plans/`
2. Ask: "Which plan would you like to deepen? Provide the path."

Do not proceed until you have a valid plan file.

## Workflow

### 1. Parse Plan Structure

Read the plan file and extract:
- Overview/Problem Statement
- Proposed Solution sections
- Technical Approach/Architecture
- Implementation phases/steps
- Technologies/frameworks mentioned
- Domain areas (APIs, data models, security, performance)

Create a section manifest:
```
Section 1: [Title] - [What to research]
Section 2: [Title] - [What to research]
...
```

### 2. Discover and Apply Relevant Skills

Check available skills:
```bash
ls ~/.claude/skills/
```

For each skill that matches the plan's domain, spawn a research sub-agent:
```
Agent(subagent_type="general-purpose", prompt="Read the skill at ~/.claude/skills/[name]/SKILL.md and apply its knowledge to this plan section: [content]")
```

**Spawn ALL skill sub-agents in PARALLEL.** 5, 10, 15 is fine.

### 3. Search Past Learnings

Check `docs/solutions/` for relevant documented learnings:
```bash
find docs/solutions -name "*.md" -type f 2>/dev/null
```

For each potentially relevant learning, spawn a sub-agent to check applicability.

### 4. Launch Per-Section Research Agents

For each major plan section, launch in parallel:
```
Agent(subagent_type="best-practices-researcher", prompt="Research best practices for: [section topic]. Find industry standards, common pitfalls, performance considerations, and real-world examples.")
```

### 5. Run Review Agents Against Plan

Launch ALL available review agents in parallel against the full plan:
- `code-reviewer` — code approach review
- `security-sentinel` — security considerations
- `performance-oracle` — performance implications
- `simplicity-reviewer` — complexity check
- `architecture-reviewer` — architectural review

### 6. Synthesize All Findings

Collect outputs from ALL agents. For each:
- Extract concrete recommendations
- Extract code patterns and examples
- Extract anti-patterns to avoid
- Extract edge cases
- Deduplicate and prioritize by impact

### 7. Enhance Plan Sections

For each section, add:

```markdown
## [Original Section Title]

[Original content preserved]

### Research Insights

**Best Practices:**
- [Concrete recommendation 1]
- [Concrete recommendation 2]

**Performance Considerations:**
- [Optimization opportunity]

**Edge Cases:**
- [Edge case and how to handle]

**References:**
- [Documentation URL]
```

### 8. Add Enhancement Summary

At the top of the plan:

```markdown
## Enhancement Summary

**Deepened on:** [Date]
**Sections enhanced:** [Count]
**Research agents used:** [Count]

### Key Improvements
1. [Major improvement 1]
2. [Major improvement 2]

### New Considerations Discovered
- [Finding 1]
- [Finding 2]
```

### 9. Update Plan File

Write the enhanced plan in-place.

## Post-Enhancement

Ask: "Plan deepened. What next?"
1. **View diff** — `git diff [plan_path]`
2. **Start `/workflows:work`** — Begin implementing
3. **Deepen further** — Another round on specific sections
4. **Revert** — Restore from git

NEVER CODE! Just research and enhance the plan.
