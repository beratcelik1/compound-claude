#!/usr/bin/env python3
"""Generate SKILL.md files from SKILL.md.tmpl templates with placeholder resolution.

Usage:
    python3 gen-skill-docs.py                    # generate all
    python3 gen-skill-docs.py --dry-run          # check for drift (exit 1 if differs)
    python3 gen-skill-docs.py --verbose          # show resolution details
    python3 gen-skill-docs.py --skill plan       # generate specific skill only
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SKILLS_DIR = Path.home() / ".claude" / "skills"
RESOLVERS_DIR = Path(__file__).parent / "resolvers"
PLACEHOLDER_RE = re.compile(r"\{\{([A-Z_]+)\}\}")


# ---------------------------------------------------------------------------
# Frontmatter parsing (no external deps)
# ---------------------------------------------------------------------------


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Parse YAML-like frontmatter delimited by ``---``.

    Returns (fields_dict, body_after_frontmatter).
    """
    if not text.startswith("---"):
        return {}, text

    end_idx = text.index("---", 3)
    raw = text[3:end_idx].strip()
    body = text[end_idx + 3 :].lstrip("\n")

    fields: dict[str, str] = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        value = value.strip().strip('"').strip("'")
        fields[key.strip()] = value

    return fields, body


# ---------------------------------------------------------------------------
# Resolver loading
# ---------------------------------------------------------------------------


def load_resolvers() -> list[object]:
    """Load resolver modules from the resolvers/ directory."""
    sys.path.insert(0, str(RESOLVERS_DIR.parent))
    from resolvers import load_resolvers as _load

    return _load()


def resolve_placeholder(
    name: str,
    context: dict[str, str],
    resolvers: list[object],
    verbose: bool = False,
) -> str:
    """Try each resolver in order until one returns a non-None value."""
    for resolver in resolvers:
        result = resolver.resolve(name, context)  # type: ignore[union-attr]
        if result is not None:
            if verbose:
                mod_name = getattr(resolver, "__name__", "unknown")
                print(
                    f"  [{mod_name}] {name} -> {result[:60]}{'...' if len(result) > 60 else ''}"
                )
            return result

    if verbose:
        print(f"  [UNRESOLVED] {name}")
    return f"{{{{{name}}}}}"


# ---------------------------------------------------------------------------
# Template processing
# ---------------------------------------------------------------------------


def process_template(
    tmpl_path: Path,
    resolvers: list[object],
    verbose: bool = False,
) -> str:
    """Read a .tmpl file, resolve all placeholders, return final content."""
    raw = tmpl_path.read_text()
    frontmatter, body = parse_frontmatter(raw)

    if verbose:
        print(f"\nProcessing: {tmpl_path}")
        print(f"  Frontmatter: {frontmatter}")

    def replacer(match: re.Match[str]) -> str:
        return resolve_placeholder(match.group(1), frontmatter, resolvers, verbose)

    return PLACEHOLDER_RE.sub(replacer, body)


def estimate_tokens(text: str) -> int:
    """Rough token estimate: chars / 4."""
    return len(text) // 4


# ---------------------------------------------------------------------------
# Discovery
# ---------------------------------------------------------------------------


def discover_templates(skill_filter: str | None = None) -> list[Path]:
    """Find all SKILL.md.tmpl files, optionally filtered by skill name."""
    templates: list[Path] = []
    for tmpl in sorted(SKILLS_DIR.rglob("SKILL.md.tmpl")):
        if skill_filter is not None:
            if tmpl.parent.name != skill_filter:
                continue
        templates.append(tmpl)
    return templates


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate SKILL.md from templates")
    parser.add_argument(
        "--dry-run", action="store_true", help="Check for drift, exit 1 if differs"
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Show placeholder resolution details"
    )
    parser.add_argument(
        "--skill", type=str, default=None, help="Process specific skill only"
    )
    args = parser.parse_args()

    resolvers = load_resolvers()
    templates = discover_templates(args.skill)

    if not templates:
        print(
            f"No SKILL.md.tmpl files found{f' for skill={args.skill!r}' if args.skill else ''}."
        )
        return 0

    drift_detected = False
    summary_rows: list[tuple[str, int, str]] = []

    for tmpl_path in templates:
        skill_name = tmpl_path.parent.name
        output_path = tmpl_path.parent / "SKILL.md"
        generated = process_template(tmpl_path, resolvers, args.verbose)
        tokens = estimate_tokens(generated)

        if args.dry_run:
            if output_path.exists():
                existing = output_path.read_text()
                if existing != generated:
                    print(f"DRIFT: {skill_name} — SKILL.md differs from template")
                    drift_detected = True
                    summary_rows.append((skill_name, tokens, "DRIFT"))
                else:
                    summary_rows.append((skill_name, tokens, "OK"))
            else:
                print(f"MISSING: {skill_name} — SKILL.md does not exist")
                drift_detected = True
                summary_rows.append((skill_name, tokens, "MISSING"))
        else:
            output_path.write_text(generated)
            status = "generated"
            if args.verbose:
                print(f"  Wrote: {output_path}")
            summary_rows.append((skill_name, tokens, status))

    # Print summary table
    print(f"\n{'Skill':<30} {'Tokens':>8}  {'Status'}")
    print("-" * 52)
    total_tokens = 0
    for name, tokens, status in summary_rows:
        print(f"{name:<30} {tokens:>8}  {status}")
        total_tokens += tokens
    print("-" * 52)
    print(f"{'TOTAL':<30} {total_tokens:>8}  ({len(summary_rows)} skills)")

    if args.dry_run and drift_detected:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
