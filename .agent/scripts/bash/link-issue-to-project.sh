#!/bin/bash
# link-issue-to-project.sh - Bash version for Linux/macOS
# Links an Issue to GitHub Project #4 with metadata

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

# Parse args
ISSUE_NUMBER=""
PRIORITY=""
DOMAIN=""
EFFORT=""
ROI=""
STATUS="backlog"
WHATIF=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--issue) ISSUE_NUMBER="$2"; shift 2 ;;
        -p|--priority) PRIORITY="$2"; shift 2 ;;
        -d|--domain) DOMAIN="$2"; shift 2 ;;
        -e|--effort) EFFORT="$2"; shift 2 ;;
        -r|--roi) ROI="$2"; shift 2 ;;
        -s|--status) STATUS="$2"; shift 2 ;;
        --whatif) WHATIF=true; shift ;;
        *) shift ;;
    esac
done

if [ -z "$ISSUE_NUMBER" ]; then
    echo "Usage: $0 -i ISSUE_NUMBER [-p priority] [-d domain] [-e effort] [-r roi] [-s status]"
    exit 1
fi

echo "🔗 GitHub Project Issue Linker (Bash)"
echo "─────────────────────────────────────"
echo "✓ Target Issue: #$ISSUE_NUMBER"

if [ "$WHATIF" = true ]; then
    echo ""
    echo "[WHATIF] Would perform:"
    echo "  1. Add Issue #$ISSUE_NUMBER to Project #$PROJECT_NUM"
    echo "  2. Set Status = '$STATUS'"
    [ -n "$PRIORITY" ] && echo "  3. Set Priority = '$PRIORITY'"
    [ -n "$DOMAIN" ] && echo "  4. Set Domain = '$DOMAIN'"
    [ -n "$EFFORT" ] && echo "  5. Set Effort = '$EFFORT'"
    [ -n "$ROI" ] && echo "  6. Set ROI = $ROI"
    exit 0
fi

# Get Issue URL
ISSUE_URL=$(gh issue view "$ISSUE_NUMBER" --json url -q .url)
echo "✓ Issue URL: $ISSUE_URL"

# Add to project
echo ""
echo "⏳ Adding Issue to Project..."
gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$ISSUE_URL" 2>/dev/null || echo "⚠️ Already in project"

# Get item ID
echo "⏳ Fetching item ID..."
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$OWNER" --format json --limit 200 | \
    jq -r ".items[] | select(.content.number == $ISSUE_NUMBER) | .id" | head -1)

if [ -z "$ITEM_ID" ]; then
    echo "❌ Could not find Issue in project"
    exit 1
fi

echo "✓ Item ID: $ITEM_ID"

UPDATES=""

# Set Status
STATUS_OPTION_ID=$(jq -r ".fields.status.options.$STATUS" "$CONFIG_PATH")
gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$STATUS_OPTION_ID"
UPDATES="Status=$STATUS"

# Set Priority
if [ -n "$PRIORITY" ]; then
    FIELD_ID=$(jq -r '.fields.priority.id' "$CONFIG_PATH")
    OPTION_ID=$(jq -r ".fields.priority.options.$PRIORITY" "$CONFIG_PATH")
    gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
        --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
    UPDATES="$UPDATES, Priority=$PRIORITY"
fi

# Set Domain
if [ -n "$DOMAIN" ]; then
    FIELD_ID=$(jq -r '.fields.domain.id' "$CONFIG_PATH")
    OPTION_ID=$(jq -r ".fields.domain.options.$DOMAIN" "$CONFIG_PATH")
    gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
        --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
    UPDATES="$UPDATES, Domain=$DOMAIN"
fi

# Set Effort
if [ -n "$EFFORT" ]; then
    FIELD_ID=$(jq -r '.fields.effort.id' "$CONFIG_PATH")
    OPTION_ID=$(jq -r ".fields.effort.options.$EFFORT" "$CONFIG_PATH")
    gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
        --field-id "$FIELD_ID" --single-select-option-id "$OPTION_ID"
    UPDATES="$UPDATES, Effort=$EFFORT"
fi

# Set ROI
if [ -n "$ROI" ]; then
    FIELD_ID=$(jq -r '.fields.roi.id' "$CONFIG_PATH")
    gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
        --field-id "$FIELD_ID" --number "$ROI"
    UPDATES="$UPDATES, ROI=$ROI"
fi

echo ""
echo "✅ Issue #$ISSUE_NUMBER linked with: $UPDATES"
