# Sprint 20: Growth & Stability
**Period**: 2026-01-05 - 2026-01-12  
**Goal**: Fix critical CI blockers, integrate SpeedInsights, create marketing landing page, and continue bio-integration refinement.

## Backlog

### Priority: High

- [x] **Fix CI Build Failures** <!-- agent: /debug | estimate: 2h | source: triage:P1 | blocked: false -->
    - Handled in parallel chat session

- [x] **Vercel SpeedInsights Integration** <!-- agent: /coder | estimate: 0.5h | source: triage:P1 | blocked: false -->
    - ✅ Already integrated in `src/app/layout.tsx` (line 5 & 24)

- [x] **Marketing Landing Page MVP** <!-- agent: /ui-ux + /coder | estimate: 6h | source: triage:P1 | blocked: false -->
    - ✅ Already exists at `/marketing` (179 lines, full hero + features + CTA)
    - ✅ Alternative exists at `/landing` (144 lines)

### Priority: Medium

- [/] **Garmin Integration (Remaining)** <!-- agent: /coder | estimate: 4h | source: sprint-19 | blocked: external -->
    - ✅ Service exists: `GarminService.ts` with wellness fetch + OAuth flow
    - ✅ Widget exists: `GarminWidget.tsx` (compact + full variants)
    - ✅ Settings UI: IntegrationsPanel has Garmin connect/disconnect
    - ⏸️ OAuth pending external Garmin API approval (line 460)
    - [ ] Wire GarminWidget into CardioStudio/TvMode overlays

- [x] **Oracle Service Type Safety** <!-- agent: /cleanup | estimate: 2h | source: triage:P2 | blocked: false -->
    - ✅ Replaced `any` types with proper interfaces (AuditReport, TitanLoadCalculation, WeeklyMastery, TitanState)
    - ✅ OracleRecommendation return type properly implemented
    - ✅ Type check passes

### Priority: Low

- [x] **Resolve Outstanding TODOs** <!-- agent: /cleanup | estimate: 1h | source: triage:P2 | blocked: false -->
    - ✅ Reviewed critical TODOs - most are legitimate Phase 2/external blockers
    - ✅ Documented in DEBT.md with proper owners and status

---

## Sprint Stats
- **Total Items**: 6
- **Estimated Hours**: 15.5h
- **Feature/Debt/Polish Ratio**: 50% / 35% / 15%

## Dependencies
- CI fix is prerequisite for other items (deploy verification)
- Marketing page can be developed in parallel

## Execution Log
<!-- Auto-updated by /sprint-auto -->
- **2026-01-05 01:28** - Sprint 20 created from triage findings
- **2026-01-05 01:29** - SpeedInsights verified ✅ (already integrated)
- **2026-01-05 01:29** - Marketing page verified ✅ (already exists at /marketing)
- **2026-01-05 01:35** - Oracle type safety completed ✅ (replaced 4 `any` with proper types)
- **2026-01-05 01:36** - Pushed commit `e035a2f` to main
- **2026-01-05 01:38** - TODO review complete, documented 3 deferred items in DEBT.md
- **2026-01-05 01:42** - Garmin integration audited: Service, Widget, Settings all exist. Only overlay wiring remains.

---

## Notes
- Sprint 19 items carried forward: Garmin Integration
- Focus: Growth enablement (landing page) + stability (CI, types)
