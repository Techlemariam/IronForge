---
name: project-linker
description: Automates GitHub Project board integration
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🔗 Project Linker

Standardizes linking PRs and Issues to the IronForge GitHub Project.

## When to Use

- After creating a Pull Request
- After creating an Issue
- During `/domain-session` wrap-up

## Execute

### Link a PR

```powershell
pwsh .agent/skills/project-linker/scripts/link-pr.ps1
```

### Link an Issue

```powershell
pwsh .agent/skills/project-linker/scripts/link-issue.ps1
```

## Prerequisites

- `gh` CLI authenticated
- Project ID configured in `.agent/config/github-project.json`

## Expected Output

✅ **Success**: `✅ PR linked to Project Board (Status: In Review)`
⚠️ **Warning**: `⚠️ PR created but Project linking failed`
