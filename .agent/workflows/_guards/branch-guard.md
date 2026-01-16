---
description: "Shared guard: Ensures workflow runs on a feature branch, not main"
version: "1.0.0"
---

# Branch Guard

Validates that the current branch is NOT `main`. Include this guard in workflows that require active development on a feature branch.

## Usage

Add at Phase 0 of any workflow:

```markdown
## Phase 0: Pre-Flight
> **Guard:** Run branch validation from `.agent/workflows/_guards/branch-guard.md`
```

---

## Validation Script

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" = "main" ]; then
  echo "⛔ ERROR: This workflow requires a feature branch."
  echo ""
  echo "You are currently on 'main'. Create or switch to a feature branch first:"
  echo ""
  echo "  Option 1: Claim a new task"
  echo "    /claim-task [task-id-or-description]"
  echo ""
  echo "  Option 2: Switch to existing branch"
  echo "    /switch-branch feat/[branch-name]"
  echo ""
  echo "Available feature branches:"
  git branch --list 'feat/*' 'fix/*' 'chore/*' 2>/dev/null || echo "  (none found)"
  exit 1
fi

echo "✅ Branch guard passed: $current_branch"
```

---

## When to Use

| Workflow       | Include Guard? | Reason                                     |
| :------------- | :------------- | :----------------------------------------- |
| `/coder`       | ✅ Yes         | Code changes must be on feature branch     |
| `/architect`   | ✅ Yes         | Design decisions tied to specific feature  |
| `/qa`          | ✅ Yes         | Tests should run in feature context        |
| `/debug`       | ✅ Yes         | Fixes should be isolated                   |
| `/polish`      | ✅ Yes         | Cleanup tied to feature                    |
| `/claim-task`  | ❌ No          | Requires being ON main to create branch    |
| `/pre-pr`      | ⚠️ Has own     | Already validates in Phase 0               |
| `/gatekeeper`  | ⚠️ Optional    | Can run on main for health checks          |
| `/night-shift` | ❌ No          | Autonomous, may run on main                |

---

## Exit Codes

| Code | Meaning                                  |
| :--- | :--------------------------------------- |
| `0`  | Guard passed, workflow can proceed       |
| `1`  | Guard failed, user must switch branches  |
