---
name: skill-stocktake
description: Audit skills and commands for quality, staleness, and overlap
---

# Skill Stocktake

Audits all Claude skills and commands using a quality checklist + holistic judgment. Supports Quick Scan (changed only) and Full Stocktake modes.

## Scope

| Path | Description |
|------|-------------|
| `~/.claude/skills/` | Global skills |
| `{cwd}/.claude/skills/` | Project-level skills (if exists) |

## Modes

| Mode | Trigger | Duration |
|------|---------|---------|
| Quick Scan | Default (if previous results exist) | 5-10 min |
| Full Stocktake | No previous results, or explicit `full` | 20-30 min |

## Full Stocktake Flow

### Phase 1 - Inventory
Enumerate all skill files, extract frontmatter, collect modification times.

### Phase 2 - Quality Evaluation
Evaluate each skill against checklist:
- Content overlap with other skills checked
- Overlap with MEMORY.md / CLAUDE.md checked
- Freshness of technical references verified
- Usage frequency considered

Verdicts:
| Verdict | Meaning |
|---------|---------|
| Keep | Useful and current |
| Improve | Worth keeping, specific improvements needed |
| Update | Referenced technology is outdated |
| Retire | Low quality, stale, or cost-asymmetric |
| Merge into [X] | Substantial overlap with another skill |

Evaluation dimensions:
- **Actionability**: code examples, commands, steps for immediate action
- **Scope fit**: name, trigger, content aligned
- **Uniqueness**: value not replaceable by MEMORY.md / CLAUDE.md / another skill
- **Currency**: technical references work in current environment

### Phase 3 - Summary Table

| Skill | Verdict | Reason |
|-------|---------|--------|

### Phase 4 - Consolidation
1. **Retire/Merge**: Present justification, get user confirmation before deleting
2. **Improve**: Present specific suggestions
3. **Update**: Present updated content with sources
4. Check MEMORY.md line count; propose compression if >100 lines

## Notes

- Same checklist for all skills regardless of origin
- Archive/delete operations always require user confirmation
