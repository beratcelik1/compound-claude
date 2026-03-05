---
name: brainstorming
description: This skill should be used before implementing features, building components, or making changes. It guides exploring user intent, approaches, and design decisions before planning. Triggers on "let's brainstorm", "help me think through", "what should we build", "explore approaches", ambiguous feature requests, or when the user's request has multiple valid interpretations.
---

# Brainstorming

Clarify **WHAT** to build before diving into **HOW** to build it.

## When to Use

**Use brainstorming when:**
- Requirements are unclear or ambiguous
- Multiple approaches could solve the problem
- Trade-offs need exploration
- Feature scope needs refinement

**Skip when:**
- Requirements are explicit and detailed
- Task is a straightforward bug fix
- User knows exactly what they want

## Core Process

### Phase 1: Understand the Idea

Ask questions **one at a time** using AskUserQuestion:

1. **Prefer multiple choice when options exist**
   - Good: "Should this be: (a) real-time WS, (b) polling, or (c) REST on-demand?"
   - Avoid: "How should data be fetched?"

2. **Start broad, then narrow**
   - First: What is the core purpose?
   - Then: Who are the users?
   - Finally: What constraints exist?

3. **Validate assumptions explicitly**
   - "I'm assuming we hold to settlement. Is that correct?"

**Key topics:** Purpose, Users, Constraints, Success criteria, Edge cases, Existing patterns

**Exit:** Continue until idea is clear OR user says "proceed"

### Phase 2: Explore Approaches

Propose 2-3 concrete approaches:

```markdown
### Approach A: [Name]
[2-3 sentence description]
**Pros:** ...
**Cons:** ...
**Best when:** [Circumstances]
```

- Lead with a recommendation
- Be honest about trade-offs
- Consider YAGNI — simpler is usually better

### Phase 3: Capture the Design

```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
---

# <Topic Title>

## What We're Building
[1-2 paragraphs]

## Why This Approach
[Approaches considered, why this one]

## Key Decisions
- [Decision 1]: [Rationale]

## Open Questions
- [Unresolved items]

## Next Steps
-> `/plan` for implementation details
```

**Output:** `docs/brainstorms/YYYY-MM-DD-<topic>-brainstorm.md`

### Phase 4: Handoff

1. **Proceed to planning** -> `/plan`
2. **Refine further** -> continue
3. **Done for now** -> save and return later

## YAGNI Principles

- Don't design for hypothetical future requirements
- Choose the simplest approach that solves the stated problem
- Prefer boring, proven patterns over clever solutions
- Defer decisions that don't need to be made now
