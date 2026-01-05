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

- [ ] **Garmin Integration (Remaining)** <!-- agent: /coder | estimate: 4h | source: sprint-19 | blocked: false -->
    - [ ] Complete wellness data fetching implementation
    - [ ] Integrate Garmin overlays into CardioStudio
    - [ ] Add connection UI in settings

- [x] **Oracle Service Type Safety** <!-- agent: /cleanup | estimate: 2h | source: triage:P2 | blocked: false -->
    - ✅ Replaced `any` types with proper interfaces (AuditReport, TitanLoadCalculation, WeeklyMastery, TitanState)
    - ✅ OracleRecommendation return type properly implemented
    - ✅ Type check passes

### Priority: Low

- [ ] **Resolve Outstanding TODOs** <!-- agent: /cleanup | estimate: 1h | source: triage:P2 | blocked: false -->
    - [ ] Review and address critical TODOs in `GarminService.ts`, `progression.ts`
    - [ ] Document deferred TODOs in DEBT.md

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

---

## Notes
- Sprint 19 items carried forward: Garmin Integration
- Focus: Growth enablement (landing page) + stability (CI, types)
