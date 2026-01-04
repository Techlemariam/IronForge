---
description: Monitor project alignment with market strategy and user personas
command: /monitor-strategy
category: monitor
trigger: manual
---
# Strategy & Market Monitoring Workflow

This workflow audits the project's alignment with the goals and gaps identified in the [Market Analysis](c:\Users\alexa\.gemini\antigravity\brain\4afcae0e-1f7b-4e63-a972-c5fb8b73c895\market_analysis.md).

## 1. Persona Alignment Audit
Evaluate recent and planned features against the core user personas.

- **🎮 Hardcore Gamer**: Is the visual polish (art, animations) improving? Is the PvP depth increasing?
- **💪 Fitness Enthusiast**: Is there progress on "Lite Mode" or data-centric views?
- **👩 Inclusive Design**: Are we adding female-inclusive branding or avatars?
- **🎓 Beginner**: Is onboarding becoming more progressive? Are there many fitness jargon terms without explainers?

## 2. Critical Gap Check
Check the status of the "Critical Gaps" identified in the analysis.

| Gap | Status Check |
|-----|--------------|
| **Visual Game Art** | Check `public/assets/game/` and `components/game/` |
| **Lite/Serious Mode** | Check `src/features/settings/` for mode toggles |
| **Onboarding UX** | Check `src/features/onboarding/` for complexity reductions |
| **Stripe Integration** | Check `src/actions/monetization.ts` or `src/app/api/stripe/` |

## 3. Implementation Scan
Run these commands to find progress or regressions in strategic areas.

```bash
# Check for "Lite Mode" or "Simple Mode" progress
rg -i "liteMode|simpleMode|seriousMode" src/

# Check for gender/inclusive options
rg -i "gender|avatar|female|theme" src/features/settings/ src/features/titan/

# Check for newcomer-friendly tooltips/explainers
rg -i "tooltip|tutorial|explainer|help" src/features/dashboard/

# Check for monetization readiness
ls src/app/api/checkout/ src/actions/monetization.ts
```

## 4. Roadmap & Task Alignment
Review `roadmap.md` and `task.md` to ensure high-priority strategic items aren't being buried by technical debt or feature bloat.

- [ ] Are we shipping visuals before adding more "MMO systems"?
- [ ] Is "Lite Mode" on the immediate horizon?
- [ ] Is Stripe integration prioritized?

## 5. Output Format
Provide a **Strategic Health Report**:

```markdown
## 💼 STRATEGIC HEALTH REPORT: [Date]

### 🟢 Persona Progression
- **Hardcore Gamer:** [Status/Improvement]
- **Fitness Enthusiast:** [Status/Improvement]
- **Inclusivity:** [Status/Improvement]

### 🚨 Gap Resolution Status
1. **Visuals:** [ % Complete ]
2. **Lite Mode:** [ % Complete ]
3. **Monetization:** [ % Complete ]

### ⚠️ Risks & Drift
- [List any features that feel like "bloat" or drift from the target audience]
```
