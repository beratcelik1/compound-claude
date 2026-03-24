# Code Review

Quick inline review of uncommitted changes. For multi-agent parallel review, use `/workflows:review` instead.

## Process

1. Get changed files: `git diff --name-only HEAD`
2. Read each changed file
3. Check for:
   - **CRITICAL**: Hardcoded credentials, injection vulnerabilities, missing input validation
   - **HIGH**: Functions >50 lines, missing error handling, nesting >4 levels
   - **MEDIUM**: Missing tests, mutation patterns, TODO/FIXME without tracking
4. Report with severity, file:line, description, suggested fix
5. Block commit if CRITICAL issues found
