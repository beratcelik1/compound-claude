# Git Workflow Rules

## Commit Messages
Use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that neither fixes nor adds
- `test:` — adding tests
- `docs:` — documentation only
- `chore:` — maintenance tasks

## Before Committing
- Run tests
- Run linting
- Review the diff (`git diff --staged`)
- Never commit .env, credentials, or large binaries

## Branch Strategy
- Keep commits atomic and focused
- One logical change per commit
- Write clear commit messages explaining WHY, not just WHAT

## What NOT to Do
- Never force push to main/master
- Never use `--no-verify` to skip hooks
- Never commit directly to main without review on team projects
- Never amend published commits
