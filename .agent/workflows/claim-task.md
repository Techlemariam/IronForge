---
description: "Workflow for claim-task"
command: "/claim-task"
category: "utility"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Claim Task Workflow

Prevents race conditions between parallel chat sessions by providing explicit task coordination.

## Usage

```
/claim-task [task-id-or-description]
/claim-task list          # Show claimable tasks
/claim-task status        # Show all active claims
```

---

## Step 1: Check Current Claims

// turbo
Run: `git branch -r --list 'origin/feat/*' 'origin/fix/*' 'origin/chore/*'`

Parse branch names to identify currently claimed tasks:

- Format: `[type]/[task-id]-[description]` (e.g., `feat/R-03-cardio-duels`)
- Cross-reference with `roadmap.md` to find matching items

---

## Step 2: List Claimable Tasks

If `list` argument provided:

1. Read `roadmap.md` and extract all `[ ]` (unclaimed) items
2. Read `DEBT.md` and extract high-priority items
3. Read `.agent/sprints/current.md` for sprint-specific tasks
4. Filter out any items that match existing claim branches
5. Present as numbered list:

```markdown
## 🎯 Claimable Tasks

### From Roadmap (Priority Order)

1. [R-03] Cardio PvP Duels - Duration tracking
2. [R-05] Push Notification System
3. [R-08] Mobile Companion App

### From Sprint

4. [S-01] Fix StatsHeader test flakiness
5. [S-02] Dashboard tooltip accessibility

### From Debt

6. [D-12] Remove deprecated HeveService methods
7. [D-15] Type coverage in titan actions

> **Tip:** Use `/claim-task [ID]` to claim a task
```

---

## Step 3: Claim a Task

When claiming a specific task:

### 3.1 Validate Claim

1. Search for task in `roadmap.md`, `DEBT.md`, or sprint file
2. Verify no existing branch matches this task
3. Check for file overlap with other active branches:
   // turbo

   ```bash
   gh pr list --state open --json headRefName,files --jq '.[] | {branch: .headRefName, files: [.files[].path]}'
   ```

### 3.2 Create Claim Branch

**Validate Current State:**
// turbo

```bash
## Ensure we're starting from main
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "main" ]; then
  echo "⚠️ WARNING: Not on main branch (currently on: $current_branch)"
  echo "   Switch to main first: git checkout main && git pull"
  exit 1
fi
```

Determine branch prefix:

- Feature → `feat/`
- Bug fix → `fix/`
- Debt/Cleanup → `chore/`

// turbo

```bash
git checkout -b [prefix]/[task-id]-[short-description]
git push -u origin HEAD
```

### 3.3 Mark as Claimed (GitHub Issue)

**Assign the GitHub Issue:**

```bash
# Find matching issue
gh issue list --search "[task-description]" --json number,title

# Assign to self and move to In Progress
gh issue edit #N --add-assignee @me

# Move to "In Progress" in Project #4
gh project item-edit --project-id PVT_kwHOAe3KCM4BMt-p --id <ITEM_ID> \
  --field-id PVTSSF_lAHOAe3KCM4BMt-pzg76_fI \
  --single-select-option-id 47fc9ee4
```

**Also update roadmap.md for visibility:**

```diff
- [ ] [R-03] Cardio PvP Duels
+ [/] [R-03] Cardio PvP Duels ([#80](https://github.com/Techlemariam/IronForge/issues/80)) 📌 `feat/R-03-cardio-duels`
```

Commit the claim marker:

```bash
git add roadmap.md
git commit -m "claim: [task-id] [description]"
git push
```

---

## Step 4: Status Overview

If `status` argument provided:

1. List all open PRs with their target files
2. Show branch age (warn if > 3 days without activity)
3. Cross-reference with roadmap to find orphaned claims

```markdown
## 📊 Active Claims

| Branch                    | Age   | Files   | PR Status    |
| ------------------------- | ----- | ------- | ------------ |
| `feat/R-03-cardio-duels`  | 2d    | 5 files | Draft PR #42 |
| `fix/S-01-statsheader`    | 1d    | 2 files | Ready #45    |
| `chore/D-12-hevy-cleanup` | 5d ⚠️ | 8 files | No PR        |

### ⚠️ Stale Claims (No activity > 3 days)

- `chore/D-12-hevy-cleanup` — Consider abandoning via `/release-task D-12`
```

---

## Step 5: Conflict Prevention

Before starting work, always check for potential conflicts:

// turbo

```bash
git fetch origin
git log --oneline origin/main..HEAD
```

If other branches touch the same files you plan to modify:

> [!WARNING]
> **Potential Conflict Detected**
> Branch `feat/R-05-notifications` also modifies:
>
> - `src/services/NotificationService.ts`
>
> Consider:
>
> 1. Coordinate with that task first
> 2. Rebase frequently: `git fetch && git rebase origin/main`
> 3. Choose a different task

---

## Step 6: Release Claim

When task is complete or abandoned:

```
/release-task [task-id]
```

1. If PR merged → Claim auto-released
2. If abandoned → Delete branch and revert claim marker in roadmap

---

## Best Practices

1. **One task per chat session** — Don't claim multiple tasks in one chat
2. **Short-lived claims** — Complete within 1-2 sessions max
3. **Frequent rebasing** — `git fetch && git rebase origin/main` before each session
4. **Use PRs for visibility** — Create draft PR immediately after first commit
5. **Prefix commits** — Use `[task-id]` in all commit messages for traceability

---

## Integration with Other Workflows

| After Claiming | Next Workflow                            |
| -------------- | ---------------------------------------- |
| New feature    | `/domain-session [domain]` → `/feature`  |
| Bug fix        | `/debug` → `/coder` → `/qa`              |
| Debt item      | `/cleanup` → `/polish`                   |
| Verify & PR    | `/pre-pr` (runs gatekeeper + creates PR) |

> [!TIP]
> Use `/pre-pr` when ready to push. It runs full verification and creates PR automatically.

## Version History

### 1.1.0 (2026-01-14)

- Updated integration table to use `/pre-pr` workflow

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
