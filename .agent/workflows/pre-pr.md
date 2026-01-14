---
description: "Complete pre-PR validation and automatic PR creation"
command: "/pre-pr"
category: "verification"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "core"
---

# 🚀 Pre-PR Pipeline

**Role:** PR Launch Specialist.
**Goal:** Run all verifications and create a clean PR in one command.

---

## Phase 0: Pre-Flight Checks

### 0.0 Branch Validation

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" = "main" ]; then
  echo "⛔ ERROR: You are on 'main'. Create a feature branch first."
  echo "   Run: /claim-task [description]"
  exit 1
fi

echo "🚀 Pre-PR Pipeline for branch: $current_branch"
```

### 0.1 Working Tree Check

// turbo

```bash
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ WARNING: Uncommitted changes detected."
  echo "   Stage and commit before proceeding."
  git status --short
fi
```

---

## Phase 1: Temporal Sync

### 1.0 Fetch & Check Drift

// turbo

```bash
git fetch origin main > /dev/null 2>&1
behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")

if [ "$behind" -gt 10 ]; then
  echo "⛔ CRITICAL: $behind commits behind main."
  echo "   Run: git rebase origin/main"
  echo "   Then restart /pre-pr"
  exit 1
elif [ "$behind" -gt 0 ]; then
  echo "⚠️ $behind commits behind main. Rebasing..."
  git rebase origin/main
  if [ $? -ne 0 ]; then
    echo "⛔ Rebase failed. Resolve conflicts manually."
    exit 1
  fi
  echo "✅ Rebase complete."
else
  echo "✅ Already up-to-date with main."
fi
```

---

## Phase 2: Full Gatekeeper

Run the complete gatekeeper validation:

```bash
/gatekeeper
```

**STOP HERE** if gatekeeper score < 100.

---

## Phase 3: Docker E2E (Optional)

If you have E2E tests and want maximum CI confidence:

```bash
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy \
  npx playwright test --workers=1 --retries=0
```

> [!TIP]
> Skip this step for non-E2E changes (docs, styling, backend-only).

---

## Phase 4: Push & Create PR

### 4.0 Push to Remote

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
git push -u origin "$current_branch"

if [ $? -ne 0 ]; then
  echo "⛔ Push failed. Check for conflicts or permissions."
  exit 1
fi

echo "✅ Pushed to origin/$current_branch"
```

### 4.1 Create Pull Request

```bash
gh pr create --web
```

Or with auto-fill:

```bash
gh pr create \
  --title "[$(git rev-parse --abbrev-ref HEAD | cut -d'/' -f1)] $(git log -1 --pretty=%s)" \
  --body "## Summary

$(git log origin/main..HEAD --oneline)

## Verification
- [ ] Gatekeeper passed locally
- [ ] CI checks pending
" \
  --draft
```

---

## Phase 5: Monitor CI

After PR creation:

1. **Watch CI status**: `gh pr checks`
2. **If CI fails**: Run `/ci-doctor` for diagnosis
3. **If CI passes**: Request review or merge

```bash
## Quick CI status check
gh pr checks --watch
```

---

## 🎯 Quick Reference

| Scenario          | Command                        |
| :---------------- | :----------------------------- |
| Standard PR       | `/pre-pr`                      |
| CI failure debug  | `/ci-doctor`                   |
| Quick local check | `/gatekeeper`                  |
| E2E specific      | Docker verification in Phase 3 |

---

## Version History

### 1.0.0 (2026-01-14)

- Initial release with 5-phase pipeline
- Automatic rebase and PR creation
- Integration with gatekeeper and ci-doctor
