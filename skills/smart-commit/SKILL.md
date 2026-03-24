---
name: smart-commit
description: Create a well-formatted conventional commit from staged/unstaged changes
disable-model-invocation: true
---

# Smart Commit

Create a clean conventional commit by analyzing changes.

## Steps

1. **Check for changes:**
   ```bash
   git status
   git diff --stat
   git diff --cached --stat
   ```

2. **If no staged changes, stage relevant files:**
   - Review unstaged changes
   - Stage files that form a logical unit (don't use `git add .` blindly)

3. **Analyze the diff:**
   ```bash
   git diff --cached
   ```

4. **Determine commit type:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code restructuring (no behavior change)
   - `test`: Adding/updating tests
   - `docs`: Documentation changes
   - `style`: Formatting (no logic change)
   - `chore`: Build, tooling, deps

5. **Write commit message:**
   - Format: `<type>(<scope>): <subject>`
   - Subject: imperative mood, lowercase, no period, < 72 chars
   - Body: explain WHY, not WHAT (the diff shows what)

6. **Commit:**
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <subject>

   <body if needed>
   EOF
   )"
   ```

7. **Verify:**
   ```bash
   git log --oneline -1
   ```
