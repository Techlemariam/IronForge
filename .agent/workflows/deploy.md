---
description: "Workflow for deploy"
command: "/deploy"
category: "deployment"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "infra"
---

# Production Deployment (Solo Speed Run)

**Strategy:** Trunk-Based Development (Direct to `main` via PR).
**Goal:** Ship code to production swiftly and safely with automated gates.

## 🚀 The Pipeline

1. **Feature/Fix:** Work in `feature/*` or `fix/*`.
2. **Local Quality Gate:** Run `/pre-pr` when ready to push.
   - 🛑 **STOP** if gatekeeper score < 100.
   - ✅ **Auto-pushes** to feature branch and **creates PR**.
3. **Cloud Verification:** GitHub Actions runs `Verify`, `E2E`, `DB Guard`, and `Perf Audit`.
4. **Preview (Automated):** PR triggers **Vercel Preview**.
   - 🤖 Bot comments Preview URL on PR.
5. **Release (Automated):** Merge PR to `main`.
   - 🤖 CI deploys immediately to **Production**.
   - 🏷️ Creates GitHub Release + Release Notes.

## 📋 Pre-Merge Checklist

1. **CI Green:** All checks (⚡ Verify, 🎭 E2E, 🗄️ DB Guard) must be green.
2. **Preview Verified:** Check the Vercel Preview URL for UI/UX regressions.
3. **Lighthouse:** Ensure performance scores are within budget.

## 🚨 Rollback

1. **Revert PR:** GitHub Revert on `main` triggers an auto-deploy of the previous state.
2. **Manual Override:** Vercel Dashboard -> Rollback to previous deployment for instant recovery.

---

## 📊 Post-Deploy: Update Project Status

After successful production deployment, update linked issues to "Done":

```bash
# Find merged PR number from the deploy
MERGED_PR=$(gh pr list --state merged --base main --limit 1 --json number -q '.[0].number')

if [ -n "$MERGED_PR" ]; then
  # Get linked issue from PR body
  LINKED_ISSUE=$(gh pr view $MERGED_PR --json body -q '.body' | \
    grep -oP '(?:Closes|Fixes|Resolves)\s+#\K\d+' | head -1)
  
  if [ -n "$LINKED_ISSUE" ]; then
    echo "✅ Updating issue #$LINKED_ISSUE to Done"
    powershell -ExecutionPolicy Bypass -File .agent/scripts/link-issue-to-project.ps1 \
      -IssueNumber $LINKED_ISSUE -Status "done"
  fi
fi
```

> **Note:** This is also handled automatically by the `project-automation.yml` GitHub Action on PR merge.

## Version History

### 1.1.0 (2026-01-14)

- Updated to use `/pre-pr` workflow

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
