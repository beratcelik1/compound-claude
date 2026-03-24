#!/usr/bin/env bash
# e2e-eval.sh — End-to-end evaluation of a Claude Code skill
# Usage: ./e2e-eval.sh <skill-name> [--timeout SECONDS]
# Runs the skill via `claude -p`, captures transcript, checks for errors.
# Results saved to ~/.claude/evals/e2e/{skill}/{timestamp}.json

set -euo pipefail

# Defaults
TIMEOUT=120
SKILL_NAME=""
EVALS_DIR="${HOME}/.claude/evals/e2e"

# Parse args
while [ $# -gt 0 ]; do
    case "$1" in
        --timeout) TIMEOUT="$2"; shift 2 ;;
        --help|-h)
            echo "Usage: $0 <skill-name> [--timeout SECONDS]"
            echo "  Runs E2E eval on a skill. Costs ~\$4/run."
            exit 0
            ;;
        *) SKILL_NAME="$1"; shift ;;
    esac
done

if [ -z "$SKILL_NAME" ]; then
    echo "Error: skill name required"
    echo "Usage: $0 <skill-name> [--timeout SECONDS]"
    exit 1
fi

SKILL_DIR="${HOME}/.claude/skills/${SKILL_NAME}"
if [ ! -d "$SKILL_DIR" ]; then
    echo "Error: skill '${SKILL_NAME}' not found at ${SKILL_DIR}"
    exit 1
fi

# Setup output
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="${EVALS_DIR}/${SKILL_NAME}"
mkdir -p "$OUTPUT_DIR"
RESULT_FILE="${OUTPUT_DIR}/${TIMESTAMP}.json"
TRANSCRIPT_FILE="${OUTPUT_DIR}/${TIMESTAMP}_transcript.ndjson"

# Colors
if [ -t 1 ]; then
    GREEN='\033[0;32m' RED='\033[0;31m' YELLOW='\033[0;33m' NC='\033[0m'
else
    GREEN='' RED='' YELLOW='' NC=''
fi

echo "=== E2E Eval: ${SKILL_NAME} ==="
echo "Timeout: ${TIMEOUT}s"
echo "Output: ${RESULT_FILE}"
echo ""

# Create a temp directory as test project
TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT

# Initialize minimal test project
cat > "${TEST_DIR}/README.md" << 'TESTEOF'
# Test Project
A minimal test project for skill evaluation.
TESTEOF

cat > "${TEST_DIR}/main.py" << 'TESTEOF'
"""Sample module for skill evaluation."""

def hello():
    return "hello world"

if __name__ == "__main__":
    print(hello())
TESTEOF

# Run the skill via claude -p with timeout
PROMPT="Use the /${SKILL_NAME} skill on this test project. The project is at ${TEST_DIR}. Describe what you did."
START_TIME=$(date +%s)

set +e
CLAUDE_OUTPUT=$(timeout "${TIMEOUT}" claude -p "$PROMPT" \
    --output-format stream-json \
    --cwd "$TEST_DIR" 2>&1)
EXIT_CODE=$?
set -e

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Save raw transcript
echo "$CLAUDE_OUTPUT" > "$TRANSCRIPT_FILE"

# Analyze transcript
TOOL_ERRORS=0
BROWSE_FAILURES=0
TURN_COUNT=0
TIMED_OUT=false
COST_USD="unknown"

if [ $EXIT_CODE -eq 124 ]; then
    TIMED_OUT=true
fi

# Count tool call errors
TOOL_ERRORS=$(echo "$CLAUDE_OUTPUT" | grep -c '"type":"tool_error"' 2>/dev/null || echo 0)

# Count browse/fetch failures
BROWSE_FAILURES=$(echo "$CLAUDE_OUTPUT" | grep -c '"error".*browse\|fetch.*fail\|WebFetch.*error' 2>/dev/null || echo 0)

# Count assistant turns
TURN_COUNT=$(echo "$CLAUDE_OUTPUT" | grep -c '"type":"assistant"' 2>/dev/null || echo 0)

# Extract cost if available (from usage stats in stream)
COST_LINE=$(echo "$CLAUDE_OUTPUT" | grep '"costUSD"' | tail -1 || true)
if [ -n "$COST_LINE" ]; then
    COST_USD=$(echo "$COST_LINE" | sed 's/.*"costUSD":\([0-9.]*\).*/\1/' 2>/dev/null || echo "unknown")
fi

# Determine pass/fail
PASSED=true
FAIL_REASONS=()

if [ "$TIMED_OUT" = true ]; then
    PASSED=false
    FAIL_REASONS+=("Timed out after ${TIMEOUT}s")
fi

if [ "$EXIT_CODE" -ne 0 ] && [ "$EXIT_CODE" -ne 124 ]; then
    PASSED=false
    FAIL_REASONS+=("claude exited with code ${EXIT_CODE}")
fi

if [ "$TOOL_ERRORS" -gt 2 ]; then
    PASSED=false
    FAIL_REASONS+=("${TOOL_ERRORS} tool errors (max 2)")
fi

if [ "$BROWSE_FAILURES" -gt 0 ]; then
    PASSED=false
    FAIL_REASONS+=("${BROWSE_FAILURES} browse/fetch failures")
fi

if [ "$TURN_COUNT" -gt 30 ]; then
    PASSED=false
    FAIL_REASONS+=("${TURN_COUNT} turns (max 30, likely looping)")
fi

# Build result JSON
FAIL_REASONS_JSON="[]"
if [ ${#FAIL_REASONS[@]} -gt 0 ]; then
    FAIL_REASONS_JSON=$(printf '%s\n' "${FAIL_REASONS[@]}" | python3 -c "
import sys, json
lines = [l.strip() for l in sys.stdin if l.strip()]
print(json.dumps(lines))
")
fi

cat > "$RESULT_FILE" << JSONEOF
{
  "skill": "${SKILL_NAME}",
  "timestamp": "${TIMESTAMP}",
  "passed": ${PASSED},
  "duration_seconds": ${DURATION},
  "exit_code": ${EXIT_CODE},
  "timed_out": ${TIMED_OUT},
  "tool_errors": ${TOOL_ERRORS},
  "browse_failures": ${BROWSE_FAILURES},
  "turn_count": ${TURN_COUNT},
  "cost_usd": "${COST_USD}",
  "fail_reasons": ${FAIL_REASONS_JSON},
  "transcript_file": "${TRANSCRIPT_FILE}"
}
JSONEOF

# Report
echo "=== Results ==="
echo "Duration: ${DURATION}s"
echo "Exit code: ${EXIT_CODE}"
echo "Timed out: ${TIMED_OUT}"
echo "Tool errors: ${TOOL_ERRORS}"
echo "Browse failures: ${BROWSE_FAILURES}"
echo "Turns: ${TURN_COUNT}"
echo "Cost: \$${COST_USD}"
echo ""

if [ "$PASSED" = true ]; then
    printf "${GREEN}PASS${NC} — ${SKILL_NAME} e2e eval\n"
    echo "Results: ${RESULT_FILE}"
    exit 0
else
    printf "${RED}FAIL${NC} — ${SKILL_NAME} e2e eval\n"
    for reason in "${FAIL_REASONS[@]}"; do
        echo "  - ${reason}"
    done
    echo "Results: ${RESULT_FILE}"
    echo "Transcript: ${TRANSCRIPT_FILE}"
    exit 1
fi
