---
name: iterative-retrieval
description: Pattern for progressively refining context retrieval in multi-agent workflows
---

# Iterative Retrieval Pattern

Solves the "context problem" in multi-agent workflows where subagents don't know what context they need until they start working.

## When to Activate

- Spawning subagents that need codebase context they cannot predict upfront
- Building multi-agent workflows where context is progressively refined
- Encountering "context too large" or "missing context" failures in agent tasks
- Optimizing token usage in agent orchestration

## The Problem

Subagents are spawned with limited context. Standard approaches fail:
- **Send everything**: Exceeds context limits
- **Send nothing**: Agent lacks critical information
- **Guess what's needed**: Often wrong

## The Solution: 4-Phase Loop

```
DISPATCH -> EVALUATE -> REFINE -> LOOP (max 3 cycles)
```

### Phase 1: DISPATCH
Start with broad keyword search based on task description.

### Phase 2: EVALUATE
Score each file's relevance (0-1):
- **High (0.7+)**: Directly implements target functionality
- **Medium (0.5-0.7)**: Contains related patterns or types
- **Low (<0.5)**: Not relevant, exclude

### Phase 3: REFINE
Update search based on evaluation:
- Add patterns/terminology discovered in high-relevance files
- Exclude confirmed irrelevant paths
- Target specific context gaps identified

### Phase 4: LOOP
Repeat with refined criteria. Stop when:
- 3+ high-relevance files found with no critical gaps
- Max 3 cycles reached

## Example: Bug Fix

```
Task: "Fix the WebSocket reconnection timeout bug"

Cycle 1:
  DISPATCH: Search "websocket", "reconnect", "timeout" in shared/
  EVALUATE: Found ws.py (0.9), binance_ws.py (0.8), auth.py (0.2)
  REFINE: Add "backoff", "heartbeat"; exclude auth.py

Cycle 2:
  DISPATCH: Search refined terms
  EVALUATE: Found exchange_feeds.py (0.85), data.py (0.7)
  Result: ws.py, binance_ws.py, exchange_feeds.py, data.py
```

## Integration with Agent Prompts

```
When retrieving context for this task:
1. Start with broad keyword search
2. Evaluate each file's relevance (0-1 scale)
3. Identify what context is still missing
4. Refine search and repeat (max 3 cycles)
5. Return files with relevance >= 0.7
```

## Best Practices

1. **Start broad, narrow progressively** — Don't over-specify initial queries
2. **Learn codebase terminology** — First cycle reveals naming conventions
3. **Track what's missing** — Explicit gap identification drives refinement
4. **Stop at "good enough"** — 3 high-relevance files beats 10 mediocre ones
5. **Exclude confidently** — Low-relevance files won't become relevant
