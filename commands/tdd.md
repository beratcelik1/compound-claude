---
description: Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.
---

# TDD Command

Enforce test-driven development methodology: tests before implementation, always.

## TDD Cycle

```
RED -> GREEN -> REFACTOR -> REPEAT

RED:      Write a failing test for the next piece of behavior
GREEN:    Write the minimal code to make it pass
REFACTOR: Improve code while keeping tests green
REPEAT:   Next scenario or feature
```

## Workflow

1. **Scaffold** - Define types/interfaces for inputs and outputs
2. **RED** - Write tests that fail (code doesn't exist yet). Run them. Confirm they fail for the right reason.
3. **GREEN** - Write the simplest implementation that passes. No more.
4. **REFACTOR** - Clean up, extract constants, improve naming. Tests must stay green.
5. **Coverage** - Verify 80%+ coverage. 100% for financial, auth, or security-critical code.

## Rules

- NEVER write implementation before its test
- NEVER skip running tests after each change
- Write one test at a time, not a whole suite then implement
- Test behavior, not implementation details
- Prefer integration tests over excessive mocking
- Add edge cases: empty inputs, zero values, boundaries, error conditions

## Running Tests

- **Python**: `pytest <test_file> -v` (with `--cov` for coverage)
- **TypeScript**: `npm test -- <test_file>` (with `--coverage` for coverage)
- **Go**: `go test ./... -v -cover`

## When to Use

- New features or functions
- Bug fixes (write a test that reproduces the bug first, then fix)
- Refactoring existing code (add missing tests first, then refactor)
- Any critical business logic
