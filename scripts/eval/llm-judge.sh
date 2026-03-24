#!/usr/bin/env bash
# llm-judge.sh — LLM-as-judge evaluation of a skill's SKILL.md quality
# Usage: ./llm-judge.sh <skill-name> [--mode daily|comprehensive]
# Costs ~$0.15/run. Uses Claude Sonnet to grade the skill doc.
# Results saved to ~/.claude/evals/llm-judge/{skill}/{timestamp}.json

set -euo pipefail

SKILL_NAME=""
MODE="daily"
EVALS_DIR="${HOME}/.claude/evals/llm-judge"

# Parse args
while [ $# -gt 0 ]; do
    case "$1" in
        --mode) MODE="$2"; shift 2 ;;
        --help|-h)
            echo "Usage: $0 <skill-name> [--mode daily|comprehensive]"
            echo "  daily: gate at 8/10 total (default)"
            echo "  comprehensive: gate at 2/10 total (catch disasters only)"
            exit 0
            ;;
        *) SKILL_NAME="$1"; shift ;;
    esac
done

if [ -z "$SKILL_NAME" ]; then
    echo "Error: skill name required"
    echo "Usage: $0 <skill-name> [--mode daily|comprehensive]"
    exit 1
fi

SKILL_FILE="${HOME}/.claude/skills/${SKILL_NAME}/SKILL.md"
if [ ! -f "$SKILL_FILE" ]; then
    echo "Error: SKILL.md not found at ${SKILL_FILE}"
    exit 1
fi

# Setup output
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="${EVALS_DIR}/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"
RESULT_FILE="${OUTPUT_DIR}/${TIMESTAMP}.json"

# Colors
if [ -t 1 ]; then
    GREEN='\033[0;32m' RED='\033[0;31m' YELLOW='\033[0;33m' NC='\033[0m'
else
    GREEN='' RED='' YELLOW='' NC=''
fi

# Set gate threshold based on mode
if [ "$MODE" = "daily" ]; then
    GATE=8
else
    GATE=2
fi

echo "=== LLM Judge: ${SKILL_NAME} ==="
echo "Mode: ${MODE} (gate: ${GATE}/15)"
echo ""

# Read skill content
SKILL_CONTENT=$(cat "$SKILL_FILE")

# Build the judge prompt
JUDGE_PROMPT=$(cat << 'PROMPTEOF'
You are evaluating the quality of a Claude Code skill definition file. Grade it on three dimensions.

IMPORTANT: You MUST respond with ONLY a JSON object. No markdown, no explanation, no code fences. Just raw JSON.

Dimensions:
1. Clarity (1-5): Is the skill description clear and unambiguous? Can a reader immediately understand what this skill does?
2. Completeness (1-5): Does it cover all necessary instructions? Are edge cases addressed? Are inputs/outputs specified?
3. Actionability (1-5): Can Claude follow these instructions without guessing? Are steps concrete and specific?

For each dimension, give a score and one-sentence justification.

Respond with ONLY this JSON structure:
{"clarity":{"score":N,"reason":"..."},"completeness":{"score":N,"reason":"..."},"actionability":{"score":N,"reason":"..."},"total":N,"summary":"One sentence overall assessment"}

SKILL.md content to evaluate:
PROMPTEOF
)

# Run judge via claude -p
FULL_PROMPT="${JUDGE_PROMPT}

${SKILL_CONTENT}"

set +e
JUDGE_OUTPUT=$(claude -p "$FULL_PROMPT" --model claude-sonnet-4-20250514 2>&1)
JUDGE_EXIT=$?
set -e

if [ $JUDGE_EXIT -ne 0 ]; then
    echo "Error: claude judge call failed (exit ${JUDGE_EXIT})"
    echo "$JUDGE_OUTPUT"
    exit 1
fi

# Extract JSON from output (handle potential markdown wrapping)
JSON_OUTPUT=$(echo "$JUDGE_OUTPUT" | sed -n '/^{/,/^}/p' | head -1)

# If sed didn't catch it, try stripping code fences
if [ -z "$JSON_OUTPUT" ]; then
    JSON_OUTPUT=$(echo "$JUDGE_OUTPUT" | sed 's/^```json//;s/^```//' | tr -d '\n' | grep -o '{.*}')
fi

if [ -z "$JSON_OUTPUT" ]; then
    echo "Error: Could not parse JSON from judge output"
    echo "Raw output:"
    echo "$JUDGE_OUTPUT"
    exit 1
fi

# Parse scores using python3
SCORES=$(echo "$JSON_OUTPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
clarity = data.get('clarity', {}).get('score', 0)
completeness = data.get('completeness', {}).get('score', 0)
actionability = data.get('actionability', {}).get('score', 0)
total = clarity + completeness + actionability
print(f'{clarity} {completeness} {actionability} {total}')
" 2>/dev/null) || {
    echo "Error: Failed to parse scores from JSON"
    echo "$JSON_OUTPUT"
    exit 1
}

CLARITY=$(echo "$SCORES" | cut -d' ' -f1)
COMPLETENESS=$(echo "$SCORES" | cut -d' ' -f2)
ACTIONABILITY=$(echo "$SCORES" | cut -d' ' -f3)
TOTAL=$(echo "$SCORES" | cut -d' ' -f4)

# Determine pass/fail against gate
PASSED=false
if [ "$TOTAL" -ge "$GATE" ]; then
    PASSED=true
fi

# Save result
cat > "$RESULT_FILE" << JSONEOF
{
  "skill": "${SKILL_NAME}",
  "timestamp": "${TIMESTAMP}",
  "mode": "${MODE}",
  "gate": ${GATE},
  "passed": ${PASSED},
  "scores": {
    "clarity": ${CLARITY},
    "completeness": ${COMPLETENESS},
    "actionability": ${ACTIONABILITY},
    "total": ${TOTAL}
  },
  "raw_judge_output": $(echo "$JSON_OUTPUT" | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)))" 2>/dev/null || echo "\"parse_error\"")
}
JSONEOF

# Report
echo "Scores:"
echo "  Clarity:       ${CLARITY}/5"
echo "  Completeness:  ${COMPLETENESS}/5"
echo "  Actionability: ${ACTIONABILITY}/5"
echo "  Total:         ${TOTAL}/15"
echo "  Gate:          ${GATE}/15 (${MODE} mode)"
echo ""

if [ "$PASSED" = true ]; then
    printf "${GREEN}PASS${NC} — ${SKILL_NAME} scores ${TOTAL}/15 (gate: ${GATE})\n"
else
    printf "${RED}FAIL${NC} — ${SKILL_NAME} scores ${TOTAL}/15 (gate: ${GATE})\n"
fi

echo "Results: ${RESULT_FILE}"

if [ "$PASSED" = true ]; then
    exit 0
else
    exit 1
fi
