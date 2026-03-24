---
description: Python code review using the python-reviewer agent. Reviews type hints, security, Pythonic patterns.
---

# Python Code Review

Launch the **python-reviewer** agent on modified `.py` files.

## Process

1. Find modified `.py` files via `git diff --name-only HEAD`
2. Run static analysis: `ruff check .`, `mypy .`, `black --check .`
3. Review for security: SQL/command injection, unsafe eval/exec, pickle, hardcoded secrets
4. Review for type safety: missing hints, wrong return types, bare `except:`
5. Review for Pythonic patterns: context managers, comprehensions, f-strings, mutable defaults
6. Generate severity report (CRITICAL / HIGH / MEDIUM)

## Severity Guide

- **CRITICAL**: SQL injection, command injection, unsafe deserialization, hardcoded credentials
- **HIGH**: Missing type hints on public functions, mutable defaults, swallowed exceptions, race conditions
- **MEDIUM**: PEP 8 violations, missing f-strings, magic numbers, unnecessary list creation

## Approval

| Status | Condition |
|--------|-----------|
| Approve | No CRITICAL or HIGH issues |
| Warning | Only MEDIUM issues |
| Block | CRITICAL or HIGH issues found |

Block merge until all CRITICAL issues are fixed.
