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

## 5. Token Optimization Protocol
*Formerly `/refactor-tokens` - now integrated*

### When to Trigger
- Any workflow >500 tokens
- After Evolution Report identifies verbose prompts

### Optimization Steps
1. **Semantic Pruning**: Passive → Active voice. Remove filler.
2. **Structure Optimization**: Long paragraphs → bullet points.
3. **Role Condensing**: Multiple expert descriptors → single hyper-specific term.

### Success Criteria
- **Compression Ratio**: ≥20% token reduction
- **Logic Preservation**: 10/10 precision maintained
- **Fidelity Test**: Misinterpretation risk ≤2/10

---

## 6. Auto-Apply (Optional)
Med flagga `--auto-apply`:
- Applicera token-optimeringar automatiskt
- Uppdatera dependencies.json
- Arkivera oanvända workflows till `.agent/archive/`
---

## 7. Strategic Council (Multi-Role Analysis)
*Generates context-aware feature suggestions using all team perspectives*

### Input Sources
- `health-report.md` → Technical gaps
- `ux-audit.md` → User friction
- `DEBT.md` → Accumulated workarounds
- `roadmap.md` → Current trajectory

### Role Perspectives

| Role | Question | Example Output |
|:-----|:---------|:---------------|
| **Architect** | "What's technically fragile?" | "Refactor monolithic DashboardClient" |
| **Game Designer** | "What increases engagement?" | "Add boss variants for retention" |
| **UI/UX** | "What causes friction?" | "Simplify Citadel navigation" |
| **Performance Coach** | "What's missing for athletes?" | "Heart rate zone training mode" |
| **Analyst** | "What's the highest ROI?" | "Strava integration → wider audience" |
| **QA** | "What's undertested?" | "Social features lack coverage" |

### Synthesis Protocol
```
FOR each role:
  1. Assume role perspective
  2. Analyze input sources
  3. Generate 1-2 suggestions with ROI estimate
  
THEN:
  1. Rank all suggestions by combined ROI
  2. Filter: reject if Effort=XL AND Impact<4
  3. Output top 5 as "Strategic Suggestions"
```

### Output Format
```
┌─────────────────────────────────────────────────────┐
│ 🎯 STRATEGIC SUGGESTIONS                           │
├─────────────────────────────────────────────────────┤
│ 1. [Suggestion] (via @role) - ROI: X.X            │
│ 2. [Suggestion] (via @role) - ROI: X.X            │
│ 3. [Suggestion] (via @role) - ROI: X.X            │
├─────────────────────────────────────────────────────┤
│ Auto-add to roadmap? [--auto-apply]               │
└─────────────────────────────────────────────────────┘
```

---

# Self-Evaluation
- **Analysis Depth (1-10)**: Hur grundlig var analysen?
- **Actionability (1-10)**: Hur konkreta är förslagen?
- **Role Coverage (1-10)**: Deltog alla relevanta perspektiv?

