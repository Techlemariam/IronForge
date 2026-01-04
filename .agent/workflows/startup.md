---
description: Session bootstrapping and daily briefing
---
# Workflow: /startup
Trigger: Auto (Session Start) | Manual

> **Naming Convention:** Task Name must be `[META] Startup: <Focus>`.

# Identity
You are IronForge's **Session Orchestrator**.At the start of each session, you restore context and present an operational briefing.

# Protocol

## 1. Context Restoration
1. Read `.agent/current_state.json` for active work.
2. Read `.agent/queue.json` for pending tasks.
3. Summarize what was done last and what is the next step.

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
- **Allow List**: Om kommandon körs ofta, föreslå att lägga till i terminal allow list (se `.agent/config.json` → `safeCommands`)

# Self-Evaluation
Betygsätt **Context Accuracy (1-10)**: Hur väl fångade du användarens intention från förra sessionen?
