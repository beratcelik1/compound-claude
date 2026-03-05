#!/bin/bash
# Claude Code Setup Installer
# This script installs the complete global Claude Code configuration.
# It will REPLACE your existing ~/.claude/ setup entirely.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"

echo "============================================"
echo "  Claude Code Global Setup Installer"
echo "============================================"
echo ""
echo "This will REPLACE your entire ~/.claude/ setup."
echo "Your current setup will be backed up to: $BACKUP_DIR"
echo ""

# Backup existing setup
if [ -d "$CLAUDE_DIR" ]; then
    echo "[1/6] Backing up existing ~/.claude/ to $BACKUP_DIR..."
    cp -R "$CLAUDE_DIR" "$BACKUP_DIR"
    echo "  Done. Backup at: $BACKUP_DIR"
else
    echo "[1/6] No existing ~/.claude/ found. Fresh install."
fi

# Create directory structure
echo "[2/6] Creating directory structure..."
mkdir -p "$CLAUDE_DIR"

# Copy agents, skills, commands, rules
echo "[3/6] Installing agents, skills, commands, rules..."
for dir in agents skills commands rules; do
    if [ -d "$SCRIPT_DIR/$dir" ]; then
        rm -rf "$CLAUDE_DIR/$dir"
        cp -R "$SCRIPT_DIR/$dir" "$CLAUDE_DIR/$dir"
        echo "  Copied $dir/"
    fi
done

# Copy CLAUDE.md
echo "[4/6] Installing CLAUDE.md..."
cp "$SCRIPT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"

# Copy and patch settings.json
echo "[5/6] Installing settings.json..."
HOME_ESCAPED=$(echo "$HOME" | sed 's/\//\\\//g')
sed "s/__HOME__/$HOME_ESCAPED/g" "$SCRIPT_DIR/settings.json" > "$CLAUDE_DIR/settings.json"

# Cleanup stale directories
echo "[6/8] Cleaning up stale directories..."
CLEANED=0
for stale in "$CLAUDE_DIR"/agents-backup-* "$CLAUDE_DIR"/skills-backup-* "$CLAUDE_DIR"/old-agents "$CLAUDE_DIR"/custom-agents; do
    if [ -d "$stale" ]; then
        rm -rf "$stale"
        echo "  Removed: $(basename "$stale")"
        CLEANED=$((CLEANED + 1))
    fi
done
[ $CLEANED -eq 0 ] && echo "  Nothing to clean."

# Make observe.sh executable
echo "[7/8] Setting permissions..."
chmod +x "$CLAUDE_DIR/skills/continuous-learning-v2/hooks/observe.sh" 2>/dev/null || true
chmod 600 "$CLAUDE_DIR/settings.json"
chmod 600 "$CLAUDE_DIR/bash-commands.log" 2>/dev/null || true

# Verify installation
echo "[8/8] Verifying installation..."
AGENTS=$(find "$CLAUDE_DIR/agents" -name "AGENT.md" 2>/dev/null | wc -l | tr -d ' ')
SKILLS=$(find "$CLAUDE_DIR/skills" -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
COMMANDS=$(find "$CLAUDE_DIR/commands" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
RULES=$(find "$CLAUDE_DIR/rules" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "  Agents:   $AGENTS (expected 18)"
echo "  Skills:   $SKILLS (expected ~31)"
echo "  Commands: $COMMANDS (expected ~36)"
echo "  Rules:    $RULES (expected 10)"
python3 -c "import json; json.load(open('$CLAUDE_DIR/settings.json'))" 2>/dev/null && echo "  settings.json: valid JSON" || echo "  settings.json: INVALID JSON — check manually!"

echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Install required tools:"
echo "   brew install jq terminal-notifier tmux"
echo "   npm install -g prettier"
echo "   pip install black ruff"
echo ""
echo "2. Set up GitHub token (for GitHub MCP):"
echo "   Add to your ~/.zshrc or ~/.bashrc:"
echo "   export GITHUB_PERSONAL_ACCESS_TOKEN='your-token-here'"
echo "   Then: source ~/.zshrc"
echo ""
echo "3. Install Node.js if not installed (for MCP servers):"
echo "   brew install node"
echo ""
echo "4. Restart Claude Code to pick up the new config."
echo ""
echo "Your old setup is backed up at: $BACKUP_DIR"
echo "To restore: rm -rf ~/.claude && mv $BACKUP_DIR ~/.claude"
