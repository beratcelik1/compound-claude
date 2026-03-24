---
name: compound
description: Document a recently solved problem to compound knowledge. Use after fixing bugs or discovering important patterns.
---

# Compound Learning

Capture problem solutions while context is fresh, creating searchable documentation.

**Why "compound"?** Each documented solution compounds your knowledge. First time takes research. Document it, next occurrence takes minutes.

## Execution

### Phase 1: Analyze (Parallel)

Launch these research tasks in parallel:

1. **Context Analyzer** - What was the problem? What type, what component, what symptoms?
2. **Solution Extractor** - What was tried? What was the root cause? What worked?
3. **Prevention Strategist** - How to prevent this in future? What tests to add?

### Phase 2: Document

After all research completes:

1. Determine category:
   - `build-errors/`, `test-failures/`, `runtime-errors/`
   - `performance/`, `security/`, `integration/`
   - `logic-errors/`, `ui-bugs/`

2. Create documentation file:

   ```bash
   mkdir -p docs/solutions/<category>
   ```

   Write to `docs/solutions/<category>/<descriptive-name>.md`:

   ```markdown
   ---
   title: <Descriptive Title>
   category: <category>
   date: <YYYY-MM-DD>
   tags: [relevant, tags]
   ---

   # <Title>

   ## Problem
   [Exact error/symptom observed]

   ## Investigation
   [What was tried, what didn't work]

   ## Root Cause
   [Technical explanation]

   ## Solution
   [Step-by-step fix with code]

   ## Prevention
   [How to avoid in future]

   ## Related
   [Links to docs, issues]
   ```

### Phase 3: Update Project Knowledge

- Add key insight to project CLAUDE.md under "Key Learnings"
- If universal lesson, also update `~/.claude/CLAUDE.md`

## The Loop

```
Build -> Test -> Find Issue -> Research -> Fix -> Document -> Deploy
  ^                                                            |
  +------------------------------------------------------------+
```

Each unit of work makes the next unit easier.
