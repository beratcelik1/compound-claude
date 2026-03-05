---
name: onboard
description: Generate an onboarding guide for new developers joining the project
---

Generate an onboarding guide for new developers joining the project.

## Steps

1. Scan project root for config files to determine tech stack:
   - `package.json`, `tsconfig.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`
   - `.env.example` for required environment variables
   - `docker-compose.yml` for service dependencies
2. Read existing docs (`README.md`, `CONTRIBUTING.md`, `docs/`).
3. Map project structure: key directories and their purposes.
4. Identify setup prerequisites:
   - Runtime versions (Node, Python)
   - Required CLI tools
   - Database and service dependencies
5. Document the development workflow:
   - How to install dependencies
   - How to run the project locally
   - How to run tests
   - How to create a branch and submit a PR
6. List key architectural concepts a new developer needs to understand.
7. Write the guide to `docs/onboarding.md`.

## Rules

- Write for someone with general programming experience but no project knowledge.
- Include exact commands, not vague instructions.
- Test every setup command to verify it works.
- Link to existing documentation rather than duplicating it.
