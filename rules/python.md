---
paths:
  - "**/*.py"
---

# Python Rules

## Type Hints
- ALL function parameters and return values must have type hints
- Use modern syntax: `list[str]` not `List[str]`, `str | None` not `Optional[str]`
- Use `dict[str, Any]` not `Dict[str, Any]`

## Style
- f-strings for formatting (not % or .format())
- `pathlib` over `os.path`
- Context managers (`with`) for resource management
- Dataclasses or Pydantic for structured data
- Properties over getter/setter methods

## Imports
- PEP 8 order: stdlib -> third-party -> local
- Absolute imports preferred
- No wildcard imports (`from x import *`)

## Testing
- pytest with fixtures (see `rules/testing.md` for full details)

## Error Handling
- Specific exceptions, never bare `except:` (see `rules/error-handling.md` for patterns)
