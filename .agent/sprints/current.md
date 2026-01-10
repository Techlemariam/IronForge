# Sprint 24: Quality & Documentation

**Period**: 2026-01-10 - 2026-01-17  
**Goal**: Close Sprint 23 carryover, address documentation gap, and improve test infrastructure

---

## Backlog

### Priority: High

- [/] **Complete Sprint 23 Carryover** <!-- agent: /manager | estimate: 0h | source: sprint-23 | blocked: false -->
  - E2E Test Seeding (2h) → `/infrastructure`
  - GrowthMetrics Implementation (2h) → `/coder`
  - ✅ Citadel Navigation Simplification (2h) → `/ui-ux` - Completed 2026-01-10

- [ ] **Documentation Batch Update** <!-- agent: /librarian | estimate: 3h | source: health-report | blocked: false -->
  - Update `api-reference.md` with 70+ missing actions
  - Cover: `battle-pass`, `power-rating`, `territory`, `shop-system`
  - Target: 80% action documentation coverage

- [x] **Territory UI Integration** <!-- agent: /ui-ux | estimate: 3h | source: sprint-22 | blocked: false -->
  - Wire `LeaderboardHub` into Citadel dashboard navigation
  - Create `/territories` route using `TerritoryMap` component
  - Add navigation from Guild view to Territory conquest
  - ✅ Route created, type checks passing

- [ ] **Test Structure Scaffolding** <!-- agent: /infrastructure | estimate: 2h | source: health-report | blocked: false -->
  - Create `tests/unit/actions`, `tests/unit/services`, `tests/unit/utils`
  - Move misplaced tests to correct locations
  - Verify test discovery after restructure

### Priority: Medium

- [ ] **Accessibility: ARIA Labels** <!-- agent: /ui-ux | estimate: 2h | source: DEBT.md#63 | blocked: false -->
  - Add `aria-label` to all interactive elements
  - Focus: dashboard, combat arena, leaderboards
  - Target: 80% coverage

- [ ] **Strength Workout Generation** <!-- agent: /game-designer | estimate: 3h | source: DEBT.md#73 | blocked: false -->
  - Generate dynamic strength workouts from `exerciseDb.ts`
  - Replace static cardio-only `workouts.ts`
  - Integrate with Oracle recommendations

- [ ] **TheForge Server Sync** <!-- agent: /coder | estimate: 2h | source: DEBT.md#67 | blocked: false -->
  - Replace mock inventory state with proper server sync
  - Implement optimistic update hook pattern
  - Connect to forge actions

### Priority: Low

- [ ] **Battle Emote Broadcast** <!-- agent: /infrastructure | estimate: 1h | source: DEBT.md#71 | blocked: false -->
  - Add Supabase Realtime broadcast to `sendBattleEmoteAction`
  - Test opponent receiving emotes in PvP

- [ ] **useSkillEffects Multi-Keystone** <!-- agent: /game-designer | estimate: 2h | source: DEBT.md#69 | blocked: false -->
  - Support multi-keystone selection and switching
  - Add UI for keystone comparison

---

## Sprint Stats

- **Total Items**: 8 (3 carryover items bundled as 1)
- **Estimated Hours**: 19h
- **Debt Ratio**: 62% (5/8 tasks address tech debt)
- **Feature Ratio**: 12% (1/8 new feature work)
- **Infrastructure**: 25% (2/8 tasks)

---

## Dependencies

- **Carryover**: Sprint 23 incomplete items must be prioritized
- **Documentation**: Depends on stable action files (no major refactors this sprint)
- **Test Scaffolding**: Blocks future test-driven development

---

## Self-Evaluation

- **Scope Realism (1-10)**: 7 - Achievable with focused execution, carryover adds risk
- **Balance (1-10)**: 8 - Good mix addressing debt, docs, and polish; light on new features intentionally

---

## Version History

- **2026-01-09** - Sprint 24 planned by `/sprint-plan` workflow

---

## Execution Log
<!-- Auto-updated by /sprint-auto -->
- **TBD** - Sprint 24 activation pending Sprint 23 completion
