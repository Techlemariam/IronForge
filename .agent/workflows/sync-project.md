---
description: "Bi-directional sync between GitHub Project and roadmap.md"
command: "/sync-project"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@librarian"
domain: "meta"
---

# /sync-project - Bi-directional Project Sync

**Purpose:** Sync status changes from GitHub Project #4 back to `roadmap.md`.

## Overview

While other workflows push data TO the Project, this workflow pulls data FROM it:

| Direction | Workflow | Data Flow |
|:----------|:---------|:----------|
| → Project | `/sync-roadmap`, `/feature`, etc. | roadmap → Issues → Project |
| ← Project | **`/sync-project`** | Project → roadmap.md |

---

## Step 1: Fetch Project Items

```bash
# Get all items from Project #4
PROJECT_ID=$(jq -r '.projectNumber' .agent/config/github-project.json)
OWNER=$(jq -r '.owner' .agent/config/github-project.json)

gh project item-list $PROJECT_ID --owner $OWNER --format json --limit 200 > /tmp/project-items.json
```

---

## Step 2: Parse Status Changes

For each item in the Project:

```javascript
// Pseudocode
items.forEach(item => {
  if (item.content.type === 'Issue') {
    const issueNumber = item.content.number;
    const projectStatus = item.status; // e.g., "Done", "In Progress"
    const roadmapStatus = getRoadmapStatus(issueNumber);
    
    if (projectStatus !== roadmapStatus) {
      console.log(`Drift detected: #${issueNumber}`);
      console.log(`  Project: ${projectStatus}`);
      console.log(`  Roadmap: ${roadmapStatus}`);
    }
  }
});
```

---

## Step 3: Update roadmap.md

For items with status drift:

| Project Status | Roadmap Update |
|:---------------|:---------------|
| "Done" | `[ ]` → `[x]`, move to "Shipped" section |
| "In Progress" | Update comment: `status: in-progress` |
| "Merged/Staging" | Update comment: `status: staging` |
| "Backlog" | No change (default state) |

### Example Update

```diff
## 📋 Backlog
- - [ ] **Oracle 3.0** ([#85](link)) <!-- status: planned -->
+ - [x] **Oracle 3.0** ([#85](link)) <!-- status: shipped -->
```

---

## Step 4: Detect Drift Report

Generate a drift report:

```markdown
## 🔄 Project Sync Report

### ✅ Items Updated (3)
- #85: Oracle 3.0 → Done
- #86: Guild Territories → In Progress
- #87: Cardio PvP → Merged/Staging

### ⚠️ Conflicts (1)
- #88: Skill Trees - Project says "Done" but issue is still open

### 📊 Summary
- Total items: 45
- Synced: 3
- Conflicts: 1
- Skipped: 41 (no change)
```

---

## Step 5: Optional Auto-Fix

If `--fix` flag is provided:

1. Update roadmap.md with detected changes
2. Close linked issues marked as "Done" in Project
3. Commit changes: `git commit -m "chore: sync project status to roadmap"`

---

## Usage

```bash
# Dry run - show what would change
/sync-project

# Apply changes
/sync-project --fix

# Verbose output
/sync-project --verbose
```

---

## Scheduling

Recommended to run:

- **Weekly:** As part of sprint planning
- **After major releases:** To catch up on closed items
- **Before `/sprint-plan`:** To ensure roadmap is accurate

---

## Version History

### 1.0.0 (2026-01-16)

- Initial release with bi-directional sync
