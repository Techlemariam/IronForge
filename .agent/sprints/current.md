# Sprint 25: Expansion & Intelligence

**Period**: 2026-01-17 - 2026-01-24
**Goal**: Launch Oracle 3.0 foundations and activate Guild Territory mechanics.

## Backlog

### Priority: High (Features)

- [ ] **Oracle 3.0 (Phase 1)** <!-- agent: /architect | estimate: 4h | source: roadmap | specs: specs/ai-training-coach.md -->
  - Implement `GoalPriorityEngine` (deterministic logic)
  - Replace legacy LLM calls with GPE
  - Basic "Training Check-In" flow

- [ ] **Guild Territories (Mechanics)** <!-- agent: /game-designer | estimate: 4h | source: roadmap | specs: specs/guild-territories.md -->
  - Implement `TerritoryControlService` (backend)
  - Define capture logic and reward distribution
  - Connect to existing UI from Sprint 24

- [ ] **Power Rating System** <!-- agent: /coder | estimate: 3h | source: roadmap | specs: specs/power-rating-system.md -->
  - Implement `PowerRating` calculation (Strength + Cardio + Consistency)
  - Add display to Profile and Leaderboards

### Priority: Medium (Infrastructure)

- [ ] **Structured Logging** <!-- agent: /infrastructure | estimate: 2h | source: roadmap | blocked: false -->
  - Replace `console.log` with Pino/Winston
  - Standardize log format (level, correlation ID)

- [ ] **Health Check Endpoint** <!-- agent: /infrastructure | estimate: 1h | source: roadmap | blocked: false -->
  - Create `/api/health` with DB connectivity check
  - Add simple uptime monitoring

### Priority: Low (Polish)

- [ ] **Program Comparison View** <!-- agent: /ui-ux | estimate: 2h | source: ux-audit #4 | blocked: false -->
  - Side-by-side diff of current vs. new program
  - Visual highlighters for changes

- [ ] **Loading Skeletons** <!-- agent: /ui-ux | estimate: 1h | source: ux-audit #5 | blocked: false -->
  - Replace spinners in Dashboard and Leaderboards
  - Create reusable `Skeleton` components

---

## Sprint Stats

- **Total Items**: 7
- **Estimated Hours**: 17h
- **Debt Ratio**: ~15% (Infra items)
- **Feature Ratio**: ~65%
- **Polish Ratio**: ~20%

## Dependencies

- Oracle 3.0 requires deprecating some existing `src/services/oracle.ts` logic.
- Guild Territories relies on `LeaderboardHub` being stable (Sprint 24).

---

## Execution Log

<!-- Auto-updated by /sprint-auto -->

- **2026-01-14 16:50** - Sprint 25 Activated. Previous sprint archived to `history/2026-01-14-sprint-24.md`.
