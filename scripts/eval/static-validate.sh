#!/usr/bin/env bash
# static-validate.sh — Static validation for all SKILL.md files
# Checks: frontmatter, required sections, file size
# Exit 0 = all pass, Exit 1 = any failure

set -euo pipefail

SKILLS_DIR="${HOME}/.claude/skills"
PASS=0
FAIL=0
TOTAL=0
FAILURES=()

# Colors (only if terminal supports it)
if [ -t 1 ]; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[0;33m'
    NC='\033[0m'
else
    GREEN='' RED='' YELLOW='' NC=''
fi

validate_skill() {
    local skill_dir="$1"
    local skill_name
    skill_name=$(basename "$skill_dir")
    local skill_file="${skill_dir}/SKILL.md"
    local errors=()

    TOTAL=$((TOTAL + 1))

    # Check SKILL.md exists
    if [ ! -f "$skill_file" ]; then
        errors+=("SKILL.md not found")
        FAIL=$((FAIL + 1))
        FAILURES+=("${skill_name}: SKILL.md not found")
        printf "${RED}FAIL${NC} %-30s %s\n" "$skill_name" "SKILL.md not found"
        return
    fi

    # Check file size
    local size
    size=$(wc -c < "$skill_file")
    if [ "$size" -lt 50 ]; then
        errors+=("File too small (${size} bytes, min 50)")
    fi
    if [ "$size" -gt 51200 ]; then
        errors+=("File too large (${size} bytes, max 50KB)")
    fi

    # Check frontmatter exists (--- delimited block at top of file)
    local content
    content=$(cat "$skill_file")

    if ! echo "$content" | head -1 | grep -q '^---$'; then
        errors+=("Missing frontmatter opening ---")
    else
        # Find closing --- (line 2+)
        local closing_line
        closing_line=$(echo "$content" | tail -n +2 | grep -n '^---$' | head -1 | cut -d: -f1)

        if [ -z "$closing_line" ]; then
            errors+=("Missing frontmatter closing ---")
        else
            # Extract frontmatter
            local frontmatter
            frontmatter=$(echo "$content" | sed -n "2,$((closing_line))p")

            # Check required fields
            if ! echo "$frontmatter" | grep -q '^name:'; then
                errors+=("Frontmatter missing 'name' field")
            fi
            if ! echo "$frontmatter" | grep -q '^description:'; then
                errors+=("Frontmatter missing 'description' field")
            fi

            # Check name field isn't empty
            local name_val
            name_val=$(echo "$frontmatter" | grep '^name:' | sed 's/^name:[[:space:]]*//')
            if [ -z "$name_val" ]; then
                errors+=("'name' field is empty")
            fi

            # Check description field isn't empty
            local desc_val
            desc_val=$(echo "$frontmatter" | grep '^description:' | sed 's/^description:[[:space:]]*//')
            if [ -z "$desc_val" ]; then
                errors+=("'description' field is empty")
            fi
        fi
    fi

    # Check body isn't empty (content after frontmatter)
    local body
    if [ -n "${closing_line:-}" ]; then
        body=$(echo "$content" | tail -n +"$((closing_line + 2))" | tr -d '[:space:]')
        if [ -z "$body" ]; then
            errors+=("No content after frontmatter")
        fi
    fi

    # Report
    if [ ${#errors[@]} -eq 0 ]; then
        PASS=$((PASS + 1))
        printf "${GREEN}PASS${NC} %-30s (%d bytes)\n" "$skill_name" "$size"
    else
        FAIL=$((FAIL + 1))
        local err_str
        err_str=$(printf '%s; ' "${errors[@]}")
        FAILURES+=("${skill_name}: ${err_str}")
        printf "${RED}FAIL${NC} %-30s %s\n" "$skill_name" "$err_str"
    fi
}

echo "=== Static Skill Validation ==="
echo "Skills dir: ${SKILLS_DIR}"
echo ""

# Find and validate all skill directories
for skill_dir in "${SKILLS_DIR}"/*/; do
    [ -d "$skill_dir" ] || continue
    validate_skill "$skill_dir"
done

echo ""
echo "=== Summary ==="
echo "Total: ${TOTAL}  Pass: ${PASS}  Fail: ${FAIL}"

if [ ${FAIL} -gt 0 ]; then
    echo ""
    echo "Failures:"
    for f in "${FAILURES[@]}"; do
        echo "  - ${f}"
    done
    exit 1
fi

echo "All skills passed static validation."
exit 0
