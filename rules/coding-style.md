# Coding Style Rules

## General Principles
- Explicit > implicit
- Simple > clever
- Readable > compact
- Early returns over deep nesting

## File Organization
- Keep files under 400 lines (split if larger)
- One class/component per file
- Group related functionality together
- Delete dead code, don't comment it out

## Naming
- Use descriptive names that reveal intent
- Functions: verb phrases (`get_user`, `calculate_total`)
- Booleans: question phrases (`is_valid`, `has_permission`)
- Constants: UPPER_SNAKE_CASE

## What NOT to Do
- No magic numbers — use named constants
- No deeply nested callbacks — use async/await
- No console.log in production code
- No commented-out code blocks
- No emojis in code (unless explicitly requested)

## Immutability
- Prefer const/final over let/var
- Avoid mutating function arguments
- Return new objects instead of modifying in place
