"""Resolver plugin system for skill template generation."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def load_resolvers() -> list[object]:
    """Discover and load all resolver modules from this directory.

    Returns modules sorted by filename. Each module must expose a
    ``resolve(name: str, context: dict) -> str | None`` function.
    """
    resolvers_dir = Path(__file__).parent
    modules: list[object] = []

    for py_file in sorted(resolvers_dir.glob("*.py")):
        if py_file.name == "__init__.py":
            continue
        module_name = f"resolvers.{py_file.stem}"
        spec = importlib.util.spec_from_file_location(module_name, py_file)
        if spec is None or spec.loader is None:
            continue
        mod = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = mod
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        if hasattr(mod, "resolve"):
            modules.append(mod)

    return modules
