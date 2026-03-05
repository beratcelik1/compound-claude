---
name: commit-push
description: Stage, commit with conventional message, and push — fast inner-loop command
argument-hint: "[optional commit message override]"
disable-model-invocation: true
---

# Commit & Push

Fast inner-loop command. Analyze changes, commit with a conventional message, push to remote.

## Pre-computed context

```bash
echo "=== BRANCH ==="
git branch --show-current

echo "=== STATUS ==="
git status --short

echo "=== STAGED DIFF ==="
git diff --cached --stat

echo "=== UNSTAGED DIFF ==="
git diff --stat

echo "=== RECENT COMMITS (for style reference) ==="
git log --oneline -5

echo "=== REMOTE TRACKING ==="
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "no upstream set"
```

## Steps

1. **If nothing to commit** (no staged or unstaged changes) → say so and stop

2. **Stage changes:**
   - If files are already staged → use those
   - If nothing staged → stage all modified/new files (but warn about any .env, credentials, or secrets — never stage those)

3. **Determine commit type** from the diff:
   - `feat`: New feature or capability
   - `fix`: Bug fix
   - `refactor`: Code restructuring (no behavior change)
   - `test`: Adding/updating tests
   - `docs`: Documentation changes
   - `style`: Formatting (no logic change)
   - `chore`: Build, tooling, deps

4. **If $ARGUMENTS is provided** → use that as the commit message instead of generating one

5. **Write commit message:**
   - Format: `<type>(<scope>): <subject>`
   - Subject: imperative mood, lowercase, no period, < 72 chars
   - Body (if needed): explain WHY, not WHAT

6. **Commit:**
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <subject>

   <body if needed>

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

7. **Push:**
   - If upstream exists → `git push`
   - If no upstream → `git push -u origin <current-branch>`

8. **Confirm:**
   ```bash
   git log --oneline -1
   ```

Show the commit hash and message when done. Keep it short.
