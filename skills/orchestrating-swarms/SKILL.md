---
name: orchestrating-swarms
description: This skill should be used when orchestrating multi-agent swarms using Claude Code's Task system. It applies when coordinating multiple agents, running parallel code reviews, creating pipeline workflows with dependencies, or any task benefiting from divide-and-conquer patterns.
disable-model-invocation: true
---

# Claude Code Swarm Orchestration

Master multi-agent orchestration using Claude Code's Agent/Task system.

---

## Core Concepts

| Concept | What It Is |
|---------|-----------|
| **Agent** | A Claude instance with tools. You are an agent. Subagents are agents you spawn via the Agent tool. |
| **Task** | A unit of work delegated to a subagent. Can run in foreground (blocking) or background (parallel). |
| **Swarm** | Multiple agents working on a shared goal in parallel, with a coordinator (you) synthesizing results. |

## Spawn Patterns

### Pattern 1: Parallel Research (Most Common)

Spawn multiple research agents simultaneously. Each returns findings. You synthesize.

```
# Launch 3+ agents in a SINGLE message (parallel execution):
Agent(subagent_type="general-purpose", prompt="Research X", run_in_background=true)
Agent(subagent_type="general-purpose", prompt="Research Y", run_in_background=true)
Agent(subagent_type="general-purpose", prompt="Research Z", run_in_background=true)

# Wait for all to complete, then synthesize findings
```

**When to use:** Planning, code review, documentation enrichment, multi-file analysis.

### Pattern 2: Parallel Execution (Divide & Conquer)

Split work across agents. Each handles independent files/modules.

```
# Each agent works on a separate file/module:
Agent(subagent_type="general-purpose", prompt="Implement auth module in src/auth.py", run_in_background=true)
Agent(subagent_type="general-purpose", prompt="Implement API routes in src/routes.py", run_in_background=true)
Agent(subagent_type="general-purpose", prompt="Write tests in tests/test_auth.py", run_in_background=true)
```

**When to use:** Multi-file implementation where files are independent.
**Danger:** File conflicts. Only use when files don't overlap.

### Pattern 3: Pipeline (Sequential with Fan-Out)

Phase 1 runs sequentially, then Phase 2 fans out in parallel.

```
# Phase 1: Sequential research (need results before Phase 2)
result = Agent(subagent_type="researcher", prompt="Analyze codebase")

# Phase 2: Fan out based on Phase 1 findings
Agent(subagent_type="code-reviewer", prompt=f"Review {result.files}", run_in_background=true)
Agent(subagent_type="security-sentinel", prompt=f"Audit {result.files}", run_in_background=true)
Agent(subagent_type="performance-oracle", prompt=f"Profile {result.files}", run_in_background=true)
```

**When to use:** Review workflows, plan-then-execute, research-then-implement.

### Pattern 4: Worktree Isolation

For agents that write code, use git worktrees to prevent conflicts.

```
Agent(
  subagent_type="general-purpose",
  prompt="Implement feature X",
  isolation="worktree"  # Gets its own copy of the repo
)
```

**When to use:** Multiple agents writing to the same repository.

## Rules for Swarm Orchestration

1. **Launch all independent agents in a SINGLE message** — this is what makes them parallel
2. **Never launch dependent agents in the same message** — wait for prerequisites
3. **Background agents for parallel work** — use `run_in_background=true`
4. **Foreground agents when you need results immediately** — default behavior
5. **Always synthesize results** — you are the coordinator, combine findings and deduplicate
6. **Use specific agent types** — `code-reviewer`, `security-sentinel`, etc. over generic `general-purpose` when a specialized agent exists
7. **Keep prompts detailed** — agents have no context from your conversation unless you provide it
8. **Cap at ~10 parallel agents** — more than that gets diminishing returns and slows context

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| Launching agents one at a time | Sequential, not parallel | Single message with all Agent calls |
| Agents writing to same files | Merge conflicts | Use worktree isolation or split by file |
| Not synthesizing results | User gets raw agent dumps | Coordinator (you) must merge and deduplicate |
| Over-parallelizing simple tasks | Overhead > benefit | Only swarm for 3+ independent subtasks |
| Vague agent prompts | Poor results | Include full context: file paths, code, requirements |

## Example: Multi-Agent Code Review

```
# Step 1: Get the diff (sequential — need this for all agents)
diff = run("git diff main...HEAD")
files = run("git diff --name-only main...HEAD")

# Step 2: Launch ALL review agents in ONE message (parallel)
Agent(subagent_type="code-reviewer", prompt=f"Review this diff:\n{diff}", run_in_background=true)
Agent(subagent_type="security-sentinel", prompt=f"Security audit:\n{diff}", run_in_background=true)
Agent(subagent_type="performance-oracle", prompt=f"Performance review:\n{diff}", run_in_background=true)
Agent(subagent_type="simplicity-reviewer", prompt=f"Simplicity check:\n{diff}", run_in_background=true)

# Step 3: Wait for all, then synthesize
# - Merge duplicate findings
# - Assign severity: P1 (blocks merge), P2 (should fix), P3 (nice-to-have)
# - Present unified report
```

## Example: Deepen-Plan Swarm

```
# Read the plan file
plan = read("docs/plans/2026-03-05-feat-new-feature-plan.md")

# Launch research agents for each section — ALL in ONE message
Agent(subagent_type="best-practices-researcher", prompt=f"Research best practices for: {section_1}")
Agent(subagent_type="best-practices-researcher", prompt=f"Research patterns for: {section_2}")
Agent(subagent_type="learnings-researcher", prompt=f"Search docs/solutions/ for: {plan_topic}")
Agent(subagent_type="security-sentinel", prompt=f"Security considerations for: {plan}")
Agent(subagent_type="performance-oracle", prompt=f"Performance considerations for: {plan}")

# Synthesize all findings into enhanced plan sections
```

## Integration with Commands

| Command | How It Uses Swarms |
|---------|-------------------|
| `/slfg` | Parallel plan + work + review |
| `/deepen-plan` | 10-20+ research agents enriching each plan section |
| `/workflows:review` | Parallel review agents + todo creation |
| `/resolve-todos` | One agent per todo item in parallel |
| `/lfg` | Sequential phases, parallel review within Phase 3 |
