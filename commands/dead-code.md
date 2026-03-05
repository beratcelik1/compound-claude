---
name: dead-code
description: Find and remove dead code from the codebase
---

Find and remove dead code from the codebase.

## Steps

### 1. Unused Imports
- Run the linter with unused import detection:
  - **Python**: `ruff check --select F401` or `flake8 --select=F401`.
  - **TypeScript**: `tsc --noUnusedLocals --noUnusedParameters --noEmit`
- Remove all unused imports.

### 2. Unused Exports
- For each exported function, class, or constant, search the codebase for imports of that symbol.
- If a symbol is exported but never imported elsewhere and is not part of public API, remove it.
- Pay attention to dynamic imports and re-exports.

### 3. Unreachable Code
- Look for code after `return`, `throw`, `break`, or `continue` statements.
- Find branches that can never be true based on type narrowing or constant conditions.
- Identify functions that are defined but never called.
- Check for commented-out code blocks and remove them.

### 4. Dead Feature Flags
- Search for feature flags or environment variable checks.
- Identify flags that are always true/false in all environments.
- Remove the dead branch and the flag check.

### 5. Verify
- Run the full test suite to confirm nothing depends on the removed code.
- Run the build to confirm compilation succeeds.

## Rules

- Remove code in small, focused commits. One category of dead code per commit.
- If unsure, check git blame. Code untouched for 6+ months with no references is likely dead.
- Never remove error handling or fallback code just because it hasn't been triggered yet.
