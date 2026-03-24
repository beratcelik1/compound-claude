#!/usr/bin/env bash
set -euo pipefail

# wstack installer
# https://github.com/beratcelik1/wstack

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo -e "${BOLD}wstack${NC} — The Claude Code setup that actually ships."
echo ""

# Check if Claude Code directory exists
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "${YELLOW}Creating ~/.claude directory...${NC}"
    mkdir -p "$CLAUDE_DIR"
fi

# Backup existing setup
if [ -d "$CLAUDE_DIR/agents" ] || [ -f "$CLAUDE_DIR/settings.json" ]; then
    BACKUP_DIR="$CLAUDE_DIR-backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}Backing up existing setup to ${BACKUP_DIR}${NC}"
    cp -R "$CLAUDE_DIR" "$BACKUP_DIR"
    echo -e "${GREEN}Backup created.${NC}"
fi

# Copy components
echo "Installing agents..."
cp -R "$SCRIPT_DIR/agents" "$CLAUDE_DIR/"

echo "Installing skills..."
cp -R "$SCRIPT_DIR/skills" "$CLAUDE_DIR/"

echo "Installing commands..."
cp -R "$SCRIPT_DIR/commands" "$CLAUDE_DIR/"

echo "Installing rules..."
cp -R "$SCRIPT_DIR/rules" "$CLAUDE_DIR/"

echo "Installing scripts..."
cp -R "$SCRIPT_DIR/scripts" "$CLAUDE_DIR/"

echo "Installing browse daemon..."
cp -R "$SCRIPT_DIR/browse" "$CLAUDE_DIR/"

# Install CLAUDE.md (don't overwrite if customized)
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    echo -e "${YELLOW}CLAUDE.md already exists. Saving wstack version as CLAUDE.md.wstack${NC}"
    cp "$SCRIPT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md.wstack"
    echo "  Compare and merge manually: diff ~/.claude/CLAUDE.md ~/.claude/CLAUDE.md.wstack"
else
    cp "$SCRIPT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
fi

# Install settings.json with home directory substitution
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    echo -e "${YELLOW}settings.json already exists. Saving wstack version as settings.json.wstack${NC}"
    sed "s|__HOME__|$HOME|g" "$SCRIPT_DIR/settings.json" > "$CLAUDE_DIR/settings.json.wstack"
    echo "  Compare and merge manually: diff ~/.claude/settings.json ~/.claude/settings.json.wstack"
else
    sed "s|__HOME__|$HOME|g" "$SCRIPT_DIR/settings.json" > "$CLAUDE_DIR/settings.json"
fi
chmod 600 "$CLAUDE_DIR/settings.json" 2>/dev/null || true

# Set executable permissions
chmod +x "$CLAUDE_DIR/skills/continuous-learning-v2/hooks/observe.sh" 2>/dev/null || true
chmod +x "$CLAUDE_DIR/skills/continuous-learning-v2/scripts/"*.sh 2>/dev/null || true
chmod +x "$CLAUDE_DIR/skills/continuous-learning-v2/scripts/"*.py 2>/dev/null || true
chmod +x "$CLAUDE_DIR/skills/strategic-compact/suggest-compact.sh" 2>/dev/null || true
chmod +x "$CLAUDE_DIR/scripts/eval/"*.sh 2>/dev/null || true
chmod +x "$CLAUDE_DIR/scripts/gen-skill-docs.py" 2>/dev/null || true

echo ""
echo -e "${GREEN}${BOLD}wstack installed.${NC}"
echo ""
echo "  Components: 18 agents, 35 skills, 37 commands, 10 rules, 20 hooks"
echo "  Config:     ~/.claude/settings.json"
echo "  Customize:  ~/.claude/CLAUDE.md (change 'Who I Am' section)"
echo ""

# Check dependencies
MISSING=""
command -v jq >/dev/null 2>&1 || MISSING="$MISSING jq"
command -v node >/dev/null 2>&1 || MISSING="$MISSING node"
command -v prettier >/dev/null 2>&1 || MISSING="$MISSING prettier"
command -v black >/dev/null 2>&1 || MISSING="$MISSING black"
command -v ruff >/dev/null 2>&1 || MISSING="$MISSING ruff"

if [ -n "$MISSING" ]; then
    echo -e "${YELLOW}Optional dependencies not found:${MISSING}${NC}"
    echo "  macOS: brew install jq node && npm install -g prettier && pip install black ruff"
    echo "  Linux: apt install jq nodejs npm && npm install -g prettier && pip install black ruff"
    echo ""
fi

# Browse daemon setup hint
if command -v bun >/dev/null 2>&1; then
    echo "  Browse daemon: cd ~/.claude/browse && bun install && bun run build"
else
    echo -e "  Browse daemon: install bun first (${YELLOW}curl -fsSL https://bun.sh/install | bash${NC})"
    echo "                 then: cd ~/.claude/browse && bun install && bun run build"
fi

echo ""
echo -e "  ${BOLD}Restart Claude Code to activate.${NC}"
