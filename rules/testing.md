# Testing Rules

## Test-First Mindset
- Write tests for any non-trivial logic
- Run tests after every code change
- Fix failing tests before moving on

## Test Commands by Language
- Python: `pytest tests/ -v` or `python -m pytest`
- TypeScript/JavaScript: `npm test` or `vitest` or `jest`
- Always check package.json/pyproject.toml for project-specific test commands

## What to Test
- Edge cases and boundary conditions
- Error handling paths
- Critical business logic
- Integration points

## What NOT to Test
- Trivial getters/setters
- Framework/library internals
- UI styling (unless critical)

## Before Saying "Done"
- Run the full test suite
- Run linting (ruff for Python, eslint for TS)
- Run type checking (mypy for Python, tsc --noEmit for TS)
