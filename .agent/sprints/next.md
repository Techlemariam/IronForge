# Sprint 21: Polish & Depth
**Period**: 2026-01-06 - 2026-01-13  
**Goal**: Resolve open debt items, improve accessibility, complete Garmin wiring, and advance Season 2 features.

## Backlog

### Priority: High

- [ ] **E2E Test Database Seeding** <!-- agent: /infrastructure | estimate: 3h | source: DEBT.md | blocked: false -->
    - Create CI-compatible E2E seeding script for `cardio-duels.spec.ts` and `battle-pass.spec.ts`
    - Enable currently skipped tests (3 cardio duel + 1 battle pass tests)
    - Add seeding step to `ci-cd.yml` E2E job

- [ ] **API Documentation Gap** <!-- agent: /librarian | estimate: 2h | source: health-report | blocked: false -->
    - Run batch update on `api-reference.md` (currently ~20% coverage)
    - Document 70+ missing actions from `src/actions/**/*`
    - Ensure new subdomain structure (economy, social, titan, etc.) is reflected

- [ ] **CitadelHub Cognitive Load Reduction** <!-- agent: /ui-ux | estimate: 2h | source: DEBT.md | blocked: false -->
    - 17 nav items exceeds 3×target (5.6× cognitive load)
    - Implement progressive disclosure pattern
    - Group into max 3-4 primary categories with expandable submenus

### Priority: Medium

- [ ] **Complete Garmin Widget Wiring** <!-- agent: /coder | estimate: 1h | source: sprint-20 | blocked: external (OAuth) -->
    - Wire `GarminWidget.tsx` into `CardioStudio` overlay
    - Wire into `TvMode` HUD
    - (OAuth approval still pending externally)

- [ ] **Accessibility Enhancement Pass** <!-- agent: /ui-ux | estimate: 2h | source: DEBT.md | blocked: false -->
    - Add `role="status"` and `aria-live` to `LoadingSpinner.tsx`
    - Expand `aria-label` coverage (currently only 3 files)
    - Add `focus-visible` rings consistently

- [ ] **DashboardClient Refactor** <!-- agent: /cleanup | estimate: 2h | source: DEBT.md | blocked: false -->
    - 685 lines - extract into smaller feature components
    - Consider: StatsHeader, QuickActions, FeedPanel

### Priority: Low

- [ ] **TvHud Data Density Review** <!-- agent: /ui-ux | estimate: 1h | source: DEBT.md | blocked: false -->
    - 7532 bytes may exceed TV Mode guidelines (max 3 data points)
    - Audit and simplify if needed

- [ ] **Lighthouse Threshold Restoration** <!-- agent: /perf | estimate: 0.5h | source: DEBT.md | blocked: false -->
    - Restore `.lighthouserc.json` thresholds to 0.9 (currently lowered to 0.7/0.85)
    - Verify current scores meet targets

---

## Sprint Stats
- **Total Items**: 8
- **Estimated Hours**: 13.5h
- **Feature/Debt/Polish Ratio**: 20% / 50% / 30%

## Dependencies
- E2E seeding is prerequisite for un-skipping tests
- Garmin wiring blocked on external OAuth approval (can wire, just can't fully test)

## Execution Log
<!-- Auto-updated by /sprint-auto -->
- **2026-01-06 00:00** - Sprint 21 created from triage findings

---

## Notes
- Sprint 20 carryover: Garmin Widget Wiring
- Focus: Debt resolution and quality improvements
- Season 2 features deferred to Sprint 22+ (Oracle 3.0, Guild Territories ready in backlog)
