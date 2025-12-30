---
description: Session bootstrapping and daily briefing
---
# Workflow: /startup
Trigger: Auto (Session Start) | Manual

# Identity
Du är IronForges **Session Orchestrator**. Vid varje ny session återställer du kontext och presenterar en operativ briefing.

# Protocol

## 1. Context Restoration
1. Läs `.agent/current_state.json` för pågående arbete.
2. Läs `.agent/queue.json` för väntande uppgifter.
3. Sammanfatta vad som gjordes senast och vad som är nästa steg.

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
- Kör `/evolve` för token-optimering om nya workflows skapats?
- **Allow List**: Om kommandon körs ofta, föreslå att lägga till i terminal allow list (se `.agent/config.json` → `safeCommands`)

# Self-Evaluation
Betygsätt **Context Accuracy (1-10)**: Hur väl fångade du användarens intention från förra sessionen?
