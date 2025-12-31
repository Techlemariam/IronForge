# Next Sprint: Sprint 17 - Cardio PvP Completion
**Period**: 2026-01-05 - 2026-01-12
**Goal**: Finalize the Cardio PvP Duels feature and prepare for Season 2 expansion.

## Backlog

### Priority: High (Feature Completion)
- [x] **Cardio PvP Duels Implementation** <!-- agent: /coder | estimate: 8h | source: roadmap:6 -->
    - *Note*: Spec file `specs/cardio-duels.md` is missing. Needs restoration/creation first.
    - Scope: Real-time duel updates, result processing, UI integration.
- [ ] **Duel Leaderboards** <!-- agent: /coder | estimate: 4h | source: roadmap:6 -->
    - Scope: Global and Friend leaderboards for duels.

### Priority: Medium (Preparation)
- [x] **Power Rating System Analysis** <!-- agent: /architect | estimate: 3h | source: roadmap:68 -->
    - Create spec: `specs/power-rating-system.md`.
    - Algorithm design for calculating "Power" from strength + cardio metrics.
- [x] **Oracle 3.0 Analysis** <!-- agent: /analyst | estimate: 2h | source: roadmap:64 -->
    - Initial requirements gathering for OpenAI integration.

### Priority: Low (Polish)
- [ ] **Three.js Type Definitions** <!-- agent: /cleanup | estimate: 1h | source: debt:43 -->
    - Fix missing types in `global.d.ts` (deferred item).

---

## Sprint Stats
- **Total Items**: 5
- **Estimated Hours**: 18h
- **Debt Ratio**: 20%

## Dependencies
- `specs` directory seems missing. Needs recreation.
