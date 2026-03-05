---
name: dependency-audit
description: Audit dependencies for vulnerabilities and outdated packages
---

Audit project dependencies for known vulnerabilities and outdated packages.

## Steps

1. Detect the package manager and run the native audit command:
   - pip: `pip-audit --format json` or `safety check --json`
   - npm: `npm audit --json`
   - pnpm: `pnpm audit --json`
2. Parse results and categorize by severity (critical, high, moderate, low).
3. For each vulnerability:
   - Identify affected package and version range.
   - Check if a patched version is available.
   - Determine if direct or transitive dependency.
   - Assess actual exploitability in project context.
4. Check for outdated dependencies: `pip list --outdated` or `npm outdated`.
5. Generate upgrade plan prioritized by:
   - Critical vulnerabilities first.
   - Direct dependencies over transitive.
   - Minimal version bumps (patch > minor > major).
6. Test compatibility of recommended upgrades if possible.
7. Offer to apply safe upgrades automatically.

## Format

```
Dependency Audit Report
=======================

Vulnerabilities: <critical>C / <high>H / <moderate>M / <low>L

| Package | Current | Patched | Severity | Type | CVE |
|---------|---------|---------|----------|------|-----|

Outdated (no vulnerabilities):
| Package | Current | Latest | Type |
|---------|---------|--------|------|

Recommended actions:
1. <action with command>
```

## Rules

- Always distinguish between direct and transitive dependencies.
- Do not auto-upgrade major versions without user confirmation.
- Report vulnerabilities even if no fix is available yet.
- Check that lock files are committed and up to date.
