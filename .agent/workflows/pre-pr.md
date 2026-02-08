---
description: "Complete pre-PR validation and automatic PR creation"
command: "/pre-pr"
category: "verification"
trigger: "manual"
version: "2.1.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "core"
skills: ["git-guard", "gatekeeper", "coverage-check", "linter-fixer"]
---

# 🚀 Pre-PR Pipeline (v2.0)

**Role:** PR Launch Specialist.
**Goal:** Run all verifications and create a clean PR in one command.

> [!WARNING]
> **"There is no such thing as a small fix."**
> Never skip validation for "micro-fixes", "lint tweaks", or "typo corrections". These often break CI due to missing types or strict checks.

---

## Phase 0: Pre-Flight Checks

### 0.0 Branch Validation

> **Execute Skill:** [git-guard](../skills/git-guard/SKILL.md)

// turbo

```bash
bash .agent/skills/git-guard/scripts/verify-branch.sh
```

### 0.1 Working Tree Check

// turbo

```bash
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ WARNING: Uncommitted changes detected."
  echo "   Staging and committing with snapshot message..."
  git add .
  git commit -m "chore: snapshot before pre-pr"
  echo "✅ Changes committed."
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

# Phantom commit check (References /git-hygiene)
merge_count=$(git log --oneline -10 2>/dev/null | grep -cE "Merge branch '(main|master)'" || echo "0")
if [ "$merge_count" -gt 3 ]; then
  echo "⚠️ WARNING: Merge-loop detected ($merge_count merge commits)"
  echo "   Consider: /git-hygiene for cleanup before PR"
fi
```

---

## Phase 2: Triple Gate (Gatekeeper Skill)

> **Execute Skill:** [gatekeeper](../skills/gatekeeper/SKILL.md)

> [!IMPORTANT]
> This phase runs the embedded gatekeeper with fail-fast behavior.
> Each step **MUST** pass before proceeding. If any step fails, fix and **restart from Step 1**.

### 2.0 Gate 1: Type Safety

// turbo

```bash
echo "🔍 Gate 1: Type Safety (check-types)"
npm run check-types
if [ $? -ne 0 ]; then
  echo "⛔ FATAL: Type check failed. Fix errors and restart /pre-pr."
  exit 1
fi
echo "✅ Gate 1 Passed"
```

### 2.1 Gate 2: Linting

// turbo

```bash
echo "🔍 Gate 2: Linting"
npm run lint -- --fix
if [ $? -ne 0 ]; then
  echo "⛔ FATAL: Lint failed. Fix errors and restart /pre-pr."
  exit 1
fi
echo "✅ Gate 2 Passed"
```

### 2.2 Gate 3: Unit Tests

// turbo

```bash
echo "🔍 Gate 3: Unit Tests"
npm test
if [ $? -ne 0 ]; then
  echo "⛔ FATAL: Unit tests failed. Fix errors and restart /pre-pr."
  exit 1
fi
echo "✅ Gate 3 Passed"
```

### 2.3 Triple Gate Verdict

```
╔══════════════════════════════════════════════════════╗
║ 🛡️ TRIPLE GATE VERDICT: [100] ✅ APPROVED            ║
╚══════════════════════════════════════════════════════╝
```

**STOP HERE** if any gate failed.

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

// turbo

```bash
# Auto-create PR with metadata
current_branch=$(git rev-parse --abbrev-ref HEAD)
issue_num=$(gh issue list --search "$(echo $current_branch | sed 's/.*\///')" --json number -q '.[0].number')

pr_url=$(gh pr create \
  --title "[$(echo $current_branch | cut -d'/' -f1)] $(git log -1 --pretty=%s)" \
  --body "## Summary

$(git log origin/main..HEAD --oneline)

## Related Issue
${issue_num:+Closes #$issue_num}

## Verification
- [x] Triple Gate passed locally (Types, Lint, Tests)
- [ ] CI checks pending
" \
  --draft --json url -q .url)

if [ $? -ne 0 ]; then
  echo "⛔ PR creation failed"
  exit 1
fi

echo "✅ PR created: $pr_url"
```

### 4.2 Link PR to Project

> **Execute Skill:** [project-linker](../skills/project-linker/SKILL.md)

// turbo

```powershell
pwsh .agent/skills/project-linker/scripts/link-pr.ps1
```

> [!TIP]
> The PR is automatically linked to Project #4 with Status = "In Review".

---

## Phase 5: Monitor CI

After PR creation:

1. **Watch CI status**: `gh pr checks --watch`
2. **If CI fails**: Run `/ci-doctor` for diagnosis
3. **If CI passes**: Request review or merge

// turbo

```bash
## Quick CI status check (waits for completion)
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

## Post-Mortem Protocol (If CI Fails After PR)

If the remote CI fails after a successful local `/pre-pr`:

1. **Identify Target**: `gh run view --log-failed`
2. **Classify Failure**: Use the matrix in `/ci-doctor` (Phase 1.1)
3. **Fix Locally**: Apply fix and **restart the Triple Gate from Gate 1**.
4. **Push Fix**: `git push`
5. **Re-verify**: `gh pr checks --watch`

> [!CAUTION]
> **Never push a "fix" without rerunning the full Triple Gate.** A lint fix can break types. A test fix can introduce new lint errors.

---

## Version History

### 2.0.0 (2026-01-17)

- **BREAKING**: Embedded Triple Gate inline (no longer delegates to /gatekeeper)
- Added fail-fast `exit 1` after each gate
- Changed `powershell` to `pwsh` for PS7+ compatibility
- Added auto-commit for uncommitted changes in Phase 0
- Added Post-Mortem Protocol section
- Added `--watch` to final CI check for blocking verification
- Updated PR body to reflect "Triple Gate" terminology

### 1.0.0 (2026-01-14)

- Initial release with 5-phase pipeline
- Automatic rebase and PR creation
- Integration with gatekeeper and ci-doctor
