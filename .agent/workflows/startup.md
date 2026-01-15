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

## 4. Proactive Suggestions

Baserat på state, föreslå:

- Fortsätt pågående arbete?
- Kör `/cleanup` om debt > 5?
- Kör `/triage` för att prioritera identifierade gaps och uppdatera roadmap?
- Kör `/evolve` för token-optimering om nya workflows skapats?
- Kör `/evolve` för token-optimering om nya workflows skapats?
- **Allow List**: Om kommandon körs ofta, uppdatera `.agent/config.json` för att undvika manuella godkännanden.

## Self-Evaluation

Betygsätt **Context Accuracy (1-10)**: Hur väl fångade du användarens intention från förra sessionen?

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
