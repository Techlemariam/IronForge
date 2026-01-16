---
description: "Diagnose and fix git health issues like merge-loops and stale branches"
command: "/git-hygiene"
category: "utility"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "meta"
---

# Git Hygiene Workflow

**Role:** Git Doctor — Diagnose and cure repository health issues.
**Trigger:** Manual or integrated into `/startup` and `/night-shift`.

---

## Phase 1: Quick Scan

// turbo

```bash
echo "🧹 Git Hygiene Scan..."
echo ""

# Fetch latest remote state
git fetch origin --prune 2>/dev/null

# Current state
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $current_branch"
```

---

## Phase 2: Detect Issues

### 2.1 Merge-Loop Detection

Detects excessive merge commits that indicate a merge-loop pattern.

// turbo

```bash
# Count "Merge branch 'main'" in last 10 commits
merge_count=$(git log --oneline -10 2>/dev/null | grep -cE "Merge branch '(main|master)'" || echo "0")

if [ "$merge_count" -gt 3 ]; then
  echo "⚠️  MERGE-LOOP DETECTED: $merge_count merge commits in last 10"
  echo "    Symptom: Repeated merging main into feature branch"
  echo "    Fix: git reset --hard origin/main"
else
  echo "✅ Merge pattern: OK ($merge_count merge commits)"
fi
```

### 2.2 Orphaned Upstream

Detects when local branch's remote tracking is gone.

// turbo

```bash
upstream_gone=$(git status 2>/dev/null | grep -c "upstream is gone" || echo "0")

if [ "$upstream_gone" -gt 0 ]; then
  echo "⚠️  ORPHANED UPSTREAM: Remote branch was deleted"
  echo "    Symptom: PR was merged and remote branch deleted"
  echo "    Fix: git checkout main && git branch -D $current_branch"
else
  echo "✅ Upstream tracking: OK"
fi
```

### 2.3 Phantom Commits

Detects commits on main that have no actual file changes vs origin.

// turbo

```bash
if [ "$current_branch" = "main" ]; then
  ahead_count=$(git rev-list --count origin/main..main 2>/dev/null || echo "0")
  diff_files=$(git diff --name-only origin/main main 2>/dev/null | wc -l)
  
  if [ "$ahead_count" -gt 0 ] && [ "$diff_files" -eq 0 ]; then
    echo "⚠️  PHANTOM COMMITS: $ahead_count commits with no file changes"
    echo "    Symptom: Empty merge bubbles"
    echo "    Fix: git reset --hard origin/main"
  elif [ "$ahead_count" -gt 0 ]; then
    echo "📋 Main ahead by $ahead_count commits ($diff_files files changed)"
  else
    echo "✅ Main in sync with origin"
  fi
fi
```

### 2.4 Stale Local Branches

Counts local branches that may be outdated.

// turbo

```bash
branch_count=$(git branch | wc -l)
stale_branches=$(git branch | grep -v "^\*" | grep -v "main" | tr -d ' ')

if [ "$branch_count" -gt 5 ]; then
  echo "⚠️  STALE BRANCHES: $branch_count local branches"
  echo "    Branches:"
  git branch | grep -v "^\*" | grep -v "main" | head -10
  echo "    Fix: Run Phase 3 cleanup"
else
  echo "✅ Branch count: OK ($branch_count branches)"
fi
```

---

## Phase 3: Auto-Fix (Optional)

> [!CAUTION]
> These fixes are destructive. Only run if you understand the consequences.

### 3.1 Reset Main to Origin

```bash
# Only if on main with no real changes
git checkout main
git reset --hard origin/main
```

### 3.2 Delete Stale Branches

```bash
# Delete all local branches except main and current
git branch | grep -v "^\*" | grep -v "main" | xargs git branch -D
```

### 3.3 Prune Remote Tracking

```bash
# Remove tracking for deleted remote branches
git remote prune origin
```

---

## Phase 4: Summary Report

After scanning, output a summary:

```
┌─────────────────────────────────────────────────────┐
│ 🧹 GIT HYGIENE REPORT                              │
├─────────────────────────────────────────────────────┤
│ Merge-loops:      [OK / WARNING]                   │
│ Upstream:         [OK / ORPHANED]                  │
│ Phantom commits:  [OK / DETECTED]                  │
│ Stale branches:   [N branches]                     │
├─────────────────────────────────────────────────────┤
│ Recommended: [action or "No issues found"]         │
└─────────────────────────────────────────────────────┘
```

---

## Integration Points

| Workflow       | Integration                              |
| :------------- | :--------------------------------------- |
| `/startup`     | Run Phase 1-2 (scan only) at startup     |
| `/night-shift` | Run full workflow including cleanup      |
| `/pre-pr`      | Check for phantom commits before push    |
| Manual         | `/git-hygiene` for full diagnosis        |

---

## Version History

### 1.0.0 (2026-01-16)

- Initial release with merge-loop, orphan, phantom, and stale detection
