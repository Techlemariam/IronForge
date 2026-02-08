---
name: sprint-manager
description: Sprint planning and issue management automation
version: 1.0.0
category: automation
owner: "@manager"
platforms: ["windows", "linux", "macos"]
requires: ["project-linker"]
---

# 📋 Sprint Manager

Automates sprint planning, issue creation, and sprint rotation.

## When to Use

- At sprint start (`/sprint-plan`)
- During `/sprint-auto` workflow
- When rotating sprint fields

## Execute

### Generate Sprint Plan

```powershell
pwsh .agent/skills/sprint-manager/scripts/generate-plan.ps1
```

### Create Sprint Issues

```powershell
pwsh .agent/skills/sprint-manager/scripts/create-issues.ps1 -SprintNumber 15
```

### Rotate Sprint Field

```powershell
pwsh .agent/skills/sprint-manager/scripts/rotate-sprint.ps1
```

## Prerequisites

- `gh` CLI authenticated
- `.agent/config/github-project.json` configured
- `roadmap.md` with sprint items

## Expected Output

✅ **Success**: Sprint issues created and linked to project
