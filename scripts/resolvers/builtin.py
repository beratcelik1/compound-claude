"""Built-in placeholder resolvers for skill templates."""

from __future__ import annotations

from datetime import datetime, timezone

PREAMBLE = """\
> This skill is auto-triggered by Claude Code when relevant context is detected.
> Do not invoke manually unless testing."""


def resolve(name: str, context: dict[str, str]) -> str | None:
    """Resolve built-in placeholders.

    Args:
        name: Placeholder name (e.g. ``PREAMBLE``).
        context: Frontmatter fields from the template.

    Returns:
        Resolved string, or ``None`` if this resolver does not handle *name*.
    """
    match name:
        case "PREAMBLE":
            return PREAMBLE
        case "TIMESTAMP":
            return datetime.now(timezone.utc).isoformat()
        case "SKILL_NAME":
            return context.get("name", "Unnamed Skill")
        case "SKILL_DESCRIPTION":
            return context.get("description", "")
        case _:
            return None
