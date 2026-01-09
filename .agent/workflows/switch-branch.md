---
description: "Workflow for switch-branch"
command: "/switch-branch"
category: "utility"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---
# Switch Branch Workflow

Safely switch between branches in the same chat session while preserving work and maintaining awareness.

## Usage

```bash
/switch-branch [branch-name]
/switch-branch main           # Switch to main
/switch-branch feat/R-03      # Switch to feature branch
```

---

## Step 1: Pre-Switch Validation

### 1.1 Check Uncommitted Changes

// turbo

```bash
## Check for uncommitted work
if ! git diff-index --quiet HEAD --; then
  echo "⚠️ WARNING: You have uncommitted changes"
  git status --short
  echo ""
  echo "Options:"
  echo "  1. Commit changes: git add . && git commit -m '[description]'"
  echo "  2. Stash changes: git stash push -m 'WIP: [description]'"
  echo "  3. Discard changes: git restore ."
  exit 1
fi
```

### 1.2 Sync with Remote

// turbo

```bash
## Fetch latest changes
git fetch origin

## Check if current branch is behind
current_branch=$(git rev-parse --abbrev-ref HEAD)
behind=$(git rev-list --count HEAD..origin/$current_branch 2>/dev/null || echo "0")

if [ "$behind" -gt 0 ]; then
  echo "⚠️ Your branch is $behind commits behind origin"
  echo "   Run: git pull --rebase"
  exit 1
fi
```

---

## Step 2: Switch Branch

### 2.1 Validate Target Branch

// turbo

```bash
target_branch="[branch-name]"

## Check if branch exists locally
if git show-ref --verify --quiet refs/heads/$target_branch; then
  echo "✅ Branch exists locally: $target_branch"
elif git show-ref --verify --quiet refs/remotes/origin/$target_branch; then
  echo "📥 Branch exists remotely, checking out..."
  git checkout -b $target_branch origin/$target_branch
  exit 0
else
  echo "❌ Branch not found: $target_branch"
  echo ""
  echo "Available branches:"
  git branch -a | grep -v HEAD
  exit 1
fi
```

### 2.2 Perform Switch

// turbo

```bash
git checkout [branch-name]
echo "✅ Switched to branch: [branch-name]"
```

---

## Step 3: Post-Switch Context

After switching, display context for the new branch:

// turbo

```bash
new_branch=$(git rev-parse --abbrev-ref HEAD)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Now on branch: $new_branch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

## Show recent commits on this branch
echo "Recent commits:"
git log --oneline -3

## Show uncommitted changes (if any)
if ! git diff-index --quiet HEAD --; then
  echo ""
  echo "Uncommitted changes:"
  git status --short
fi
```

### 3.1 Search for Related Task

Search `roadmap.md` and `DEBT.md` for tasks related to this branch:

1. Extract task ID from branch name (e.g., `feat/R-03` → `R-03`)
2. Search for matching task in roadmap/debt
3. Display task context if found

---

## Step 4: Rebase Check

If switching to a feature branch, check if it needs rebasing:

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" != "main" ]; then
  # Count commits diverged from main
  diverged=$(git rev-list --count main..$current_branch)
  behind_main=$(git rev-list --count $current_branch..main)
  
  echo ""
  echo "📊 Branch Status:"
  echo "   Ahead of main: $diverged commits"
  echo "   Behind main:   $behind_main commits"
  
  if [ "$behind_main" -gt 5 ]; then
    echo ""
    echo "⚠️ RECOMMENDATION: Rebase onto main"
    echo "   Run: git rebase main"
  fi
fi
```

---

## Step 5: Update Chat Context

> [!IMPORTANT]
> **Update your mental model:**
>
> - You are now working on branch: `[branch-name]`
> - All commits/pushes will go to this branch
> - Remember to run `/gatekeeper` before pushing
> - Consider running domain-specific workflow based on branch purpose

**Suggested next actions:**

- If feature branch → Continue work with `/coder` or `/architect`
- If on `main` → Use `/claim-task` before starting new work
- If debugging → Use `/debug` workflow

---

## Best Practices

1. **Always commit or stash** before switching
2. **Keep branches up-to-date** with main via rebase
3. **One branch per chat session** is ideal, but switching is safe when needed
4. **Check branch status** after switching to understand context
5. **Run `/gatekeeper`** before pushing from any branch

---

## Integration with Other Workflows

| Current Branch | Recommended Next Workflow |
|----------------|---------------------------|
| `main` | `/claim-task` → `/domain-session` |
| `feat/*` | `/coder` → `/qa` → `/gatekeeper` |
| `fix/*` | `/debug` → `/qa` → `/gatekeeper` |
| `chore/*` | `/cleanup` → `/polish` → `/gatekeeper` |


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata