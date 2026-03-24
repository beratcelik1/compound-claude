---
name: lfg
description: Full autonomous engineering workflow — plan, work, review, fix, verify
argument-hint: "[feature description or task]"
---

# LFG — Full Autonomous Workflow

Run the complete compound engineering cycle end-to-end.

**Feature/Task:** $ARGUMENTS

**If empty, ask:** "What are we building? Describe the feature, fix, or improvement."

## The Cycle

Execute these phases in order. Do not skip steps.

### Phase 1: Research & Plan
1. Launch `learnings-researcher` + `repo-research-analyst` agents in PARALLEL
2. Run `/workflows:plan $ARGUMENTS` to create structured plan
3. Present the plan for approval
4. **STOP and wait for approval before proceeding**

### Phase 1.5: Deepen (Optional)
If plan has 3+ sections or involves unfamiliar territory:
1. Run `/deepen-plan` to enhance with parallel research agents

### Phase 2: Work
1. Run `/workflows:work` to execute the approved plan
2. Make incremental commits as logical units complete
3. Run tests after every significant change
4. If tests fail, fix immediately before continuing

### Phase 3: Review
1. Run `/workflows:review` for multi-agent code review
2. Present findings with P1/P2/P3 breakdown
3. Fix all P1 (Critical) issues immediately
4. Fix P2 (Important) issues
5. Create todos for P3 (Nice-to-have) items

### Phase 4: Resolve
1. If todos were created, run `/resolve-todos` to fix in parallel
2. Run full test suite one final time
3. Run linting

### Phase 5: Ship
1. Create clean commit with conventional format
2. Summarize what was built, reviewed, and what's ready

### Phase 6: Compound
1. If non-trivial learnings emerged, ask:
   "Should I document these learnings with `/workflows:compound`?"

## For Maximum Parallelism

Use `/slfg` instead — it uses swarm mode to parallelize work and review phases.

## Principles
- Quality is built in at every phase, not bolted on at the end
- Tests are the verification loop — run them constantly
- Every phase feeds the next — research informs planning, planning guides work, review catches what was missed
- The review is part of the work, not a separate step
