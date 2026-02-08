---
name: git-guard
description: Prevents accidental commits to protected branches
version: 1.1.0
category: guard
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - .git/config
    - .git/HEAD
  references:
    - docs/ARCHITECTURE.md
  exclude:
    - node_modules
rules:
  - "Never allow commits directly to main"
  - "Feature branches must use prefix format"
  - "Branch names should be descriptive"
edgeCases:
  - "Detached HEAD state"
  - "Submodule operations"
  - "Rebase in progress"
---

# 🛡️ Git Guard

Enforces branch hygiene by blocking operations on `main`.

## Context

| Source | Purpose |
|:-------|:--------|
| `.git/HEAD` | Current branch detection |
| `ARCHITECTURE.md` | Branching strategy reference |

## When to Use

- Before committing changes
- Before pushing to remote
- At the start of any domain session

## Execute

### Bash (Linux/macOS/Git Bash)

```bash
bash .agent/skills/git-guard/scripts/verify-branch.sh
```

### PowerShell (Windows)

```powershell
pwsh .agent/skills/git-guard/scripts/verify-branch.ps1
```

## Rules

1. **Never commit to main** - All work on feature branches
2. **Prefix format** - `feat/`, `fix/`, `chore/`, `docs/`
3. **Descriptive names** - `feat/user-auth` not `feat/stuff`

## Edge Cases

- **Detached HEAD**: Will block (treated as unsafe)
- **Rebase in progress**: Will warn but allow

## Expected Output

✅ **Success**: `✅ Branch: feature/your-branch`
❌ **Failure**: `⛔ ERROR: You are on the 'main' branch`

## Recovery

If blocked, create a feature branch:

```bash
git checkout -b [prefix]/[description]
```

Or use the workflow: `/claim-task [task-description]`
