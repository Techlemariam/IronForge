---
description: "Workflow for feature"
command: "/feature"
category: "planning"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Feature Pipeline

**Role**: Orchestration Engine.
**Goal**: Lead feature lifecycle from idea to roadmap delivery (`.agent/features/roadmap.md`).

## Protocol

> **Naming Convention:** All Task Names must start with a domain prefix, e.g., `[GAME] Feature Name`.

### Phase 0: Roadmap Sync & Issue Setup

1. Read `roadmap.md` and search for `[feature-name]`.
   - If in 'Backlog', move to 'Active Development'.
   - If missing, create new entry under 'Active Development'.
   - Set status: `<!-- status: in-progress | architect: /architect | priority: high -->`

2. **GitHub Issue Check**:
   - Search for existing issue: `gh issue list --search "[feature-name]"`
   - If no issue exists:

     ```bash
     gh issue create --title "[FEATURE] [feature-name]" \
       --template feature_request.yml \
       --label "feature,priority:high"
     ```

   - Add issue link to roadmap entry: `([#N](url))`

3. **Claim Issue**:

   ```bash
   gh issue edit #N --add-assignee @me
   gh project item-edit ... --field-id STATUS --single-select-option-id "In Progress"
   ```

### Phase 1: Discovery (ANALYST)

1. Call `/analyst` persona.
2. Generate User Stories based on input `[feature-name]`.
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

1. **Branch Check**: Verifiera att du är på korrekt branch (`feat/[name]`). **Jobba ALDRIG på `main`.**
2. Efter godkännande, anropa `/coder`-persona.
3. Implementera enligt `implementation_plan.md`.
4. **Parallellt**: Anropa `/unit-tests` för att skapa testsvit.
5. **Local Loop**: Kör kontinuerligt `/gatekeeper` (Step 0) för att verifiera `types`, `lint`, `build` och `test`.
6. **Config**: Uppdatera `config.json` om nya kommandon krävs.

## Phase 4: Polish & Security

1. Anropa `/polish` för cleanup, formatting och **Type Safety Audit**.
2. Anropa `/security` för auth audit och Zod-validering.
3. Anropa `/perf` för bundle analysis och RSC-optimering.
4. **MUST RUN:** Anropa `/gatekeeper` för final pre-push validation.

## Phase 5: Delivery & Roadmap Update

1. Anropa `/pre-deploy` för slutgiltig validering.
2. **BEVISKRAV:** Kontrollera att `walkthrough.md` innehåller:
   - ✅ Testrapport (Unit + E2E)
   - 📸 Före/Efter screenshots eller video (för UI)
3. Om PASS & BEVIS FINNS:
   - Kör `/pre-pr` för att pusha och skapa PR.
   - **ACTION:** Be användaren merga PR till `main` för att starta Auto-Deploy.
   - Uppdatera roadmap: markera feature som `[x]` och flytta till 'Shipped'.
4. Om FAIL eller BEVIS SAKNAS: Återgå till Phase 3.

## Output Format

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

## Self-Evaluation

Efter avslutad pipeline, betygsätt:

- **Automation Score (1-10)**: Hur mycket manuellt arbete krävdes?
- **Roadmap Compliance**: Uppdaterades roadmap korrekt?

## Version History

### 1.1.0 (2026-01-14)

- Added `/pre-pr` to Phase 5 delivery

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
