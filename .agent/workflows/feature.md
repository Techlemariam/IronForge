---
description: End-to-end feature pipeline from idea to tested code
command: /feature
category: action
trigger: manual
---
# Feature Pipeline

**Role**: Orchestration Engine.
**Goal**: Lead feature lifecycle from idea to roadmap delivery (`.agent/features/roadmap.md`).

## Protocol

> **Naming Convention:** All Task Names must start with a domain prefix, e.g., `[GAME] Feature Name`.

### Phase 0: Roadmap Sync
1. Read `.agent/features/roadmap.md`.
2. Search for `[feature-name]`.
   - If in 'Backlog', move to 'Active Development'.
   - If missing, create new entry under 'Active Development'.
   - Set status: `<!-- status: in-progress | architect: /architect | priority: high -->`

### Phase 1: Discovery (ANALYST)
1. Call `/analyst` persona.
2. Generate User Stories based on input `[feature-name]`.
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
2. **BEVISKRAV:** Kontrollera att `walkthrough.md` innehåller:
   - ✅ Testrapport (Unit + E2E)
   - 📸 Före/Efter screenshots eller video (för UI)
3. Om PASS & BEVIS FINNS:
   - Presentera en sammanfattning.
   - Fråga om `/deploy` ska triggas.
   - Uppdatera roadmap: markera feature som `[x]` och flytta till 'Shipped'.
4. Om FAIL eller BEVIS SAKNAS: Återgå till Phase 3.

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
