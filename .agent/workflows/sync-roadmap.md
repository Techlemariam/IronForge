---
description: "Sync roadmap.md items with GitHub Issues"
command: "/sync-roadmap"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Sync Roadmap ↔ GitHub Issues

**Role**: Roadmap-Issue Bridge.
**Goal**: Keep `roadmap.md` connected to GitHub Issues for execution tracking.

## Protocol

> **Naming Convention:** Task Name must be `[META] Roadmap Sync`.

### Step 1: Parse Roadmap

1. Read `roadmap.md`.
2. Find all items matching pattern:

   ```regex
   - \[([ x/])\] \*\*(.+?)\*\*.*?<!-- status: (\w+).*?-->
   ```

3. Extract for each item:
   - `title`: Feature name
   - `status`: planned | in-progress | shipped | deferred
   - `priority`: critical | high | medium | low
   - `roi`: numeric value
   - `effort`: S | M | L | XL
   - `issueLink`: existing `([#N](url))` if present

### Step 2: Identify Gaps

1. Filter items where:
   - `status` = `planned` or `in-progress`
   - `issueLink` = missing
2. Display table:

```
┌──────────────────────────────┬──────────┬──────────┬───────────┐
│ Feature                      │ Status   │ Priority │ Issue     │
├──────────────────────────────┼──────────┼──────────┼───────────┤
│ Guild Territories            │ planned  │ high     │ ❌ MISSING │
│ Oracle 3.0 (Phase 2)         │ planned  │ high     │ ❌ MISSING │
│ ...                          │          │          │           │
└──────────────────────────────┴──────────┴──────────┴───────────┘
```

### Step 3: Create Issues (Interactive)

For each missing item, prompt user:

```
     Create GitHub Issue for "Guild Territories"?
       Priority: high | ROI: 4.6 | Effort: L
       Milestone: [v1.1/v1.2/Season 2/None]
       [y/n/skip-all]:
     ```

   If `y`:

   1. Run `gh issue create`:

      ```bash
      gh issue create \
        --title "[FEATURE] Guild Territories" \
        --body "## Overview\n\nFrom roadmap.md\n\n## Metadata\n- Priority: high\n- ROI: 4.6\n- Effort: L\n- Spec: [guild-territories.md](specs/guild-territories.md)\n\n## Acceptance Criteria\n\n- [ ] TBD (see spec)" \
        --label "feature,priority:high" \
        --milestone "Season 2 - Competitive" # Based on user selection
      ```

2. Capture issue number from output.
3. Update `roadmap.md` inline:

   ```diff
   - [ ] **Guild Territories** ([Spec](specs/guild-territories.md))
   + [ ] **Guild Territories** ([Spec](specs/guild-territories.md)) ([#42](https://github.com/Techlemariam/IronForge/issues/42))
   ```

### Step 4: Sync Status (Optional)

If user requests `--sync-status`:

1. For each item with `issueLink`:
   - Query issue status via `gh issue view #N --json state`
   - If `state: CLOSED` and roadmap `status: in-progress`:
     - Update roadmap: `[ ]` → `[x]`, move to Shipped section
     - Update status comment: `status: shipped`

### Step 5: Add to GitHub Project

**Default Behavior:** All new items are automatically linked to Project #4 using the helper script.

For each newly created issue:

```bash
# Link to Project with roadmap metadata auto-parsing
powershell -ExecutionPolicy Bypass -File .agent/scripts/link-issue-to-project.ps1 \
  -IssueNumber <N> \
  -Auto \
  -Status "backlog"

if [ $? -eq 0 ]; then
  echo "✅ Issue #<N> linked to Project Board"
else
  echo "⚠️ Failed to link issue #<N>"
fi
```

> **Note:** The `link-issue-to-project.ps1` script automatically reads `priority`, `domain`, `roi`, and `effort` from the roadmap item's HTML comments.

### Step 6: Report

Display summary:

```
┌─────────────────────────────────────────────┐
│ ROADMAP SYNC COMPLETE                       │
├─────────────────────────────────────────────┤
│ Issues Created:     3                       │
│ Issues Linked:      12                      │
│ Added to Project:   3                       │
│ Status Synced:      2 (closed → shipped)    │
│ Unlinked Remaining: 0                       │
└─────────────────────────────────────────────┘
```

## Commands

| Flag | Description |
|:-----|:------------|
| `/sync-roadmap` | Interactive mode: create missing issues |
| `/sync-roadmap --dry-run` | Report only, no changes |
| `/sync-roadmap --sync-status` | Also sync closed issues to shipped |
| `/sync-roadmap --all` | Create all without prompting |
| `/sync-roadmap --project <N>` | Add issues to project number N |

## Prerequisites

- `gh` CLI authenticated with project scopes:

  ```bash
  gh auth refresh -s read:project -s project
  ```

- Repo access with issue creation rights
- (For Projects) GitHub Project created with custom fields

## Version History

### 1.0.0 (2026-01-16)

- Initial release with interactive issue creation
