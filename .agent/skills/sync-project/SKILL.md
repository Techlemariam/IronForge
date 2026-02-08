---
name: sync-project
description: Syncs GitHub Project with local roadmap and sprint data
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["project-linker"]
---

# 🔄 Sync Project

Bidirectional sync between GitHub Project board and local files.

## When to Use

- After updating `roadmap.md`
- During `/sync-project` workflow
- To verify project item status

## Execute

### Sync to Sprint

```powershell
pwsh .agent/skills/sync-project/scripts/sync-to-sprint.ps1
```

### Verify Items

```powershell
pwsh .agent/skills/sync-project/scripts/verify-items.ps1
```

### Refresh Config

```powershell
pwsh .agent/skills/sync-project/scripts/refresh-config.ps1
```

## Prerequisites

- `gh` CLI authenticated
- `.agent/config/github-project.json` exists

## Expected Output

✅ **Success**: Project items synchronized
