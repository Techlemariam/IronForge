#!/bin/bash
# link-pr-to-project.sh - Bash version for Linux/macOS
# Links a PR to GitHub Project #4 with Status

set -e

# Load config
CONFIG_PATH="$(dirname "$0")/../config/github-project.json"
if [ ! -f "$CONFIG_PATH" ]; then
    echo "❌ Config file not found: $CONFIG_PATH"
    exit 1
fi

PROJECT_ID=$(jq -r '.projectId' "$CONFIG_PATH")
PROJECT_NUM=$(jq -r '.projectNumber' "$CONFIG_PATH")
OWNER=$(jq -r '.owner' "$CONFIG_PATH")
STATUS_FIELD_ID=$(jq -r '.fields.status.id' "$CONFIG_PATH")
STATUS_IN_REVIEW=$(jq -r '.fields.status.options.in_review' "$CONFIG_PATH")

# Parse args
PR_NUMBER=""
STATUS="in_review"
WHATIF=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--pr) PR_NUMBER="$2"; shift 2 ;;
        -s|--status) STATUS="$2"; shift 2 ;;
        --whatif) WHATIF=true; shift ;;
        *) shift ;;
    esac
done

echo "🔗 GitHub Project PR Linker (Bash)"
echo "──────────────────────────────────"

# Auto-detect PR if not specified
if [ -z "$PR_NUMBER" ]; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ "$BRANCH" = "main" ]; then
        echo "❌ Cannot link PR from main branch"
        exit 1
    fi
    PR_NUMBER=$(gh pr list --head "$BRANCH" --json number -q '.[0].number' 2>/dev/null)
    if [ -z "$PR_NUMBER" ]; then
        echo "❌ No PR found for branch: $BRANCH"
        exit 1
    fi
fi

echo "✓ Target PR: #$PR_NUMBER"

if [ "$WHATIF" = true ]; then
    echo ""
    echo "[WHATIF] Would perform:"
    echo "  1. Add PR #$PR_NUMBER to Project #$PROJECT_NUM"
    echo "  2. Set Status = '$STATUS'"
    exit 0
fi

# Get PR URL
PR_URL=$(gh pr view "$PR_NUMBER" --json url -q .url)
echo "✓ PR URL: $PR_URL"

# Add to project
echo ""
echo "⏳ Adding PR to Project..."
gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$PR_URL" 2>/dev/null || echo "⚠️ Already in project"

# Get item ID
echo "⏳ Fetching item ID..."
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$OWNER" --format json --limit 200 | \
    jq -r ".items[] | select(.content.number == $PR_NUMBER) | .id" | head -1)

if [ -z "$ITEM_ID" ]; then
    echo "❌ Could not find PR in project"
    exit 1
fi

echo "✓ Item ID: $ITEM_ID"

# Get status option ID
STATUS_OPTION_ID=$(jq -r ".fields.status.options.$STATUS" "$CONFIG_PATH")

# Set status
echo ""
echo "⏳ Setting Status = '$STATUS'..."
gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$STATUS_OPTION_ID"

echo ""
echo "✅ PR #$PR_NUMBER linked to Project with Status = '$STATUS'"
