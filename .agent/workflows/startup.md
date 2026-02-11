---
description: "Workflow for startup"
command: "/startup"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Workflow: /startup

Trigger: Auto (Session Start) | Manual

> **Naming Convention:** Task Name must be `[META] Startup: <Focus>`.

## Identity

You are IronForge's **Session Orchestrator**.At the start of each session, you restore context and present an operational briefing.

## Protocol

## 1. Context Restoration

// turbo

```bash
## Show current Git branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current Branch: $current_branch"

if [ "$current_branch" = "main" ]; then
  echo "🚨 CRITICAL: You are on 'main'. Do NOT start coding."
  echo "   Run: /switch-branch [feat/name]"
fi

## Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Uncommitted changes detected"
fi
```

### 1.1 Git Hygiene Quick Scan

> **Reference:** `.agent/workflows/git-hygiene.md`

// turbo

```bash
# Merge-loop detection
merge_count=$(git log --oneline -10 2>/dev/null | grep -cE "Merge branch '(main|master)'" || echo "0")
if [ "$merge_count" -gt 3 ]; then
  echo "⚠️  MERGE-LOOP: $merge_count merge commits detected"
  echo "   Run: /git-hygiene for diagnosis"
fi

# Orphaned upstream detection
if git status 2>/dev/null | grep -q "upstream is gone"; then
  echo "⚠️  ORPHANED: Remote branch deleted"
  echo "   Run: git checkout main"
fi

# Stale branch count
branch_count=$(git branch | wc -l)
if [ "$branch_count" -gt 5 ]; then
  echo "⚠️  STALE: $branch_count local branches"
  echo "   Run: /git-hygiene for cleanup"
fi
```

1. Read `.agent/current_state.json` for active work.
2. Read `.agent/queue.json` for pending tasks.
3. Summarize what was done last and what is the next step.
4. **If not on `main`:** Remind user they're on a feature branch and show related task from roadmap/DEBT.md if applicable.

## 2. Background Health Check

// turbo

1. Kör `/health-check` i bakgrunden.
2. Logga resultat till `.agent/feedback/startup-health.log`.

## 3. Daily Briefing

Presentera en dashboard:

```
┌─────────────────────────────────────────────┐
│ 🔥 IRONFORGE DAILY BRIEFING                │
├─────────────────────────────────────────────┤
│ Last Session: [timestamp]                   │
│ Active Task:  [task-name or "None"]         │
│ Queue Depth:  [N items]                     │
│ Health:       [PASS/WARN/FAIL]              │
│ Tech Debt:    [N items in DEBT.md]          │
└─────────────────────────────────────────────┘
```

## 4. Post-Quota-Reset Automation (09:00+ CET)

> **Context:** Antigravity quota resets at 09:00 CET. These tasks run automatically at session start to maximize fresh quota usage.

// turbo

1. **Night Shift Review:** Check if a Night Shift PR was created overnight.

```powershell
$nightBranch = "night-shift/$(Get-Date -Format 'yyyy-MM-dd')"
$prExists = gh pr list --head $nightBranch --json number --jq '.[0].number' 2>$null
if ($prExists) {
    Write-Host "🌙 Night Shift PR #$prExists ready for review"
    Write-Host "   Run: gh pr view $prExists"
} else {
    Write-Host "ℹ️  No Night Shift PR found for today"
}
```

1. **Quick Health Check:** Run `/health-check` in background.
2. **Triage New Issues:** Run `/triage` to process any new issues.
3. **Sync Project Board:** Run `/sync-project` to keep GitHub Project current.

## 5. Proactive Suggestions

Baserat på state, föreslå:

- Fortsätt pågående arbete?
- Kör `/cleanup` om debt > 5?
- Kör `/triage` för att prioritera identifierade gaps och uppdatera roadmap?
- Kör `/evolve` för token-optimering om nya workflows skapats?
- **Allow List**: Om kommandon körs ofta, uppdatera `.agent/config.json` för att undvika manuella godkännanden.

## Self-Evaluation

Betygsätt **Context Accuracy (1-10)**: Hur väl fångade du användarens intention från förra sessionen?

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
