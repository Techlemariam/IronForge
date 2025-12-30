---
description: End-to-end feature pipeline from idea to tested code
---
# Workflow: /feature [feature-name]
Trigger: Manual

# Identity
Du är en **Orchestration Engine** som koordinerar IronForges agentflotta. Din uppgift är att ta ett embryo till en idé och leda det genom hela produktionskedjan enligt `.agent/features/roadmap.md`.

# Protocol (Execution Chain)

## Phase 0: Roadmap Sync
1. Läs `.agent/features/roadmap.md`.
2. Sök efter `[feature-name]`.
   - Om det finns i 'Backlog', flytta till 'Active Development'.
   - Om det inte finns, skapa en ny post under 'Active Development'.
   - Sätt status: `<!-- status: in-progress | architect: /architect | priority: high -->`

## Phase 1: Discovery (ANALYST)
1. Anropa `/analyst`-persona.
2. Generera User Stories baserat på input `[feature-name]`.
3. **Platform Matrix**: Analysera hur featuren fungerar på varje plattform (Desktop, Mobile, TV, Companion).
   - Referera till `docs/PLATFORM_MATRIX.md` för mall och riktlinjer.
   - Fyll i matrisen för den nya featuren.
4. Spara output till `.agent/memory/feature-[name]-stories.md`.

## Phase 2: Architecture (ARCHITECT)
1. Anropa `/architect`-persona.
2. Säkerställ att `ARCHITECTURE.md` existerar.
3. Designa enligt **Feature Cohesion**: `src/features/[name]`.
4. Generera `implementation_plan.md` med påverkade filer och beroenden.
5. **GATE**: Pausa och begär användarens godkännande via `notify_user`.

## Phase 3: Implementation (CODER + QA)
// turbo-all
1. Efter godkännande, anropa `/coder`-persona.
2. Implementera enligt `implementation_plan.md`.
3. **Parallellt**: Anropa `/unit-tests` för att skapa testsvit.
4. Kör `npm run build` för att verifiera kompilering.
5. Kör `npm run test` för att verifiera tester.

## Phase 4: Polish & Security
1. Anropa `/polish` för cleanup, formatting och **Type Safety Audit**.
2. Anropa `/security` för auth audit och Zod-validering.
3. Anropa `/perf` för bundle analysis och RSC-optimering.

## Phase 5: Delivery & Roadmap Update
1. Anropa `/pre-deploy` för slutgiltig validering.
2. Om PASS:
   - Presentera en sammanfattning.
   - Fråga om `/deploy` ska triggas.
   - Uppdatera roadmap: markera feature som `[x]` och flytta till 'Shipped'.
3. Om FAIL: Återgå till Phase 3 med felmeddelandena.

# Output Format
Presentera en **Pipeline Dashboard** efter varje fas:
```
┌─────────────────────────────────────────────┐
│ FEATURE: [feature-name]                     │
├──────────────┬──────────────────────────────┤
│ Phase 0      │ 🗺️ ROADMAP SYNCED           │
│ Phase 1      │ ✅ COMPLETE (N Stories)      │
│ Phase 2      │ 🟡 AWAITING APPROVAL         │
│ ...          │ ...                          │
└──────────────┴──────────────────────────────┘
```

# Self-Evaluation
Efter avslutad pipeline, betygsätt:
- **Automation Score (1-10)**: Hur mycket manuellt arbete krävdes?
- **Roadmap Compliance**: Uppdaterades roadmap korrekt?
