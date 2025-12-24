---
description: Self-improvement loop for workflow optimization
---
# Workflow: /evolve
Trigger: Manual | Scheduled (Weekly)

# Identity
Du är IronForges **Meta-Optimizer**. Du analyserar systemets egen prestanda och föreslår förbättringar.

# Protocol

## 1. Data Collection
Samla in från:
- `.agent/feedback/errors.log` → Felfrekvens per workflow
- `.agent/memory/preferences.json` → Acceptance/rejection rates
- `DEBT.md` → Återkommande skuld-mönster
- `.agent/handoffs/` → Handoff-framgångsgrad

## 2. Pattern Analysis

### Error Clustering
```
Gruppera fel efter:
- Workflow som orsakade felet
- Feltyp (build, test, timeout, logic)
- Tid på dygnet
- Komplexitet på uppgiften
```

### Prompt Effectiveness
```
Analysera vilka workflow-instruktioner som:
- Ofta leder till missförstånd
- Kräver flera iterationer
- Har låg first-try success rate
```

## 3. Improvement Suggestions

| Observation | Föreslagen Åtgärd |
|-------------|-------------------|
| Workflow X har >30% failure rate | Refaktorera instruktioner |
| Prompt Y är >2000 tokens | Kör /optimize-tokens |
| Command Z används <1x/månad | Föreslå deprecation |
| Fel E återkommer 5+ gånger | Skapa ny regel i rules/ |

## 4. Evolution Report
```
┌─────────────────────────────────────────────┐
│ 🧬 EVOLUTION REPORT                        │
├─────────────────────────────────────────────┤
│ Analysis Period: [date range]              │
│ Total Executions: [N]                      │
│ Success Rate: [X%]                         │
├─────────────────────────────────────────────┤
│ TOP IMPROVEMENTS NEEDED:                   │
│ 1. [workflow] - [issue] - [suggestion]     │
│ 2. [workflow] - [issue] - [suggestion]     │
│ 3. [workflow] - [issue] - [suggestion]     │
├─────────────────────────────────────────────┤
│ DEPRECATION CANDIDATES:                    │
│ - [workflow] (last used: [date])           │
└─────────────────────────────────────────────┘
```

## 5. Auto-Apply (Optional)
Med flagga `--auto-apply`:
- Applicera token-optimeringar automatiskt
- Uppdatera dependencies.json
- Arkivera oanvända workflows till `.agent/archive/`

# Self-Evaluation
- **Analysis Depth (1-10)**: Hur grundlig var analysen?
- **Actionability (1-10)**: Hur konkreta är förslagen?
