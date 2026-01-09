# Sprint 22: Season 2 Kickoff

**Period**: 2026-01-14 - 2026-01-21
**Goal**: Launch core Season 2 features (Oracle 3.0, Guild Territories) and resolve critical test infrastructure gaps.

## Backlog

### Priority: High

- [x] **Oracle 3.0 (AI Training Coach)** <!-- agent: /architect | estimate: 5h | source: roadmap | blocked: false -->
  - **Wiring**: Integrate existing `GoalPriorityEngine` into `OracleService` (currently orphaned)
  - Replace legacy `consult()` logic with GPE's `selectPhase` & `selectWorkout`
  - Create `OracleCoach` service for real-time workout adjustments

- [x] **Guild Territories** <!-- agent: /game-designer | estimate: 5h | source: roadmap | blocked: false -->
  - Initialize `Territory` DB schema and region definitions
  - Implement control mechanics (Influence/Conquest points)
  - Create basic `TerritoryMap` UI in Citadel

- [x] **Unit Test Scaffolding** <!-- agent: /qa | estimate: 2h | source: health-report | blocked: false -->
  - Create missing directories: `tests/unit/actions`, `tests/unit/services`
  - Move misplaced tests to correct hierarchy
  - Establish strict file-structure mapping pattern

### Priority: Medium

- [x] **Settings Page Migration** <!-- agent: /ui-ux | estimate: 2h | source: ux-audit | blocked: false -->
  - Deprecate potentially overwhelming `SettingsModal`
  - Create proper `/settings` dashboard layout
  - Add smooth transition/routing from profile

- [x] **Leaderboard Consolidation** <!-- agent: /ui-ux | estimate: 2h | source: ux-audit | blocked: false -->
  - Merge `Colosseum` and `Social` leaderboards into `LeaderboardHub`
  - Implement unified filters (Friends vs Global vs League)
  - Remove redundant code

- [ ] **GrowthMetrics Implementation** <!-- agent: /coder | estimate: 2h | source: DEBT.md | blocked: false -->
  - Implement actual `Friendship` model logic in `GrowthMetricsService`
  - Replace `getSocialEngagement` placeholder
  - Add proper tracking for invites/referrals

### Priority: Low

- [ ] **Tutorial Tooltips** <!-- agent: /ui-ux | estimate: 1h | source: roadmap | blocked: false -->
  - Add "First Time" tooltips for complex mechanics (Dual-Coefficient, Buffs)
  - Implement "Dismiss Forever" logic
  - Integrate with `OnboardingQuest` status

---

## Sprint Stats

- **Total Items**: 7
- **Estimated Hours**: 19h
- **Debt Ratio**: 28% (2/7 items) + 14% Polish (1/7 items)
- **Feature Ratio**: 57%

## Dependencies

- Oracle 3.0 relies on previous `GoalPriorityEngine` work (Sprint 21 or prior).
- Guild Territories needs DB schema migration.

## Execution Log
<!-- Auto-updated by /sprint-auto -->
- **2026-01-09 10:55** - Sprint 22 promoted to Active.
- **2026-01-09 11:00** - Completed Oracle 3.0 (OracleService + GPE integration).
- **2026-01-09 11:05** - Completed Guild Territories (DB seeding, TerritoryControlService).
- **2026-01-09 11:12** - Completed Unit Test Scaffolding (moved 7 tests, created 3 stubs, docs).
- **2026-01-09 11:14** - Verified Settings Page (pre-existing).
- **2026-01-09 11:18** - Completed Leaderboard Consolidation (LeaderboardHub + shared components).
