# Next Sprint: Sprint 18 - Season 2 Foundations
**Period**: 2026-01-05 - 2026-01-12  
**Goal**: Solidify Season 2 core systems (Guild Territories, Arena PvP Seasons) and address critical polish/debt.

## Backlog

### Priority: High

- [x] **Guild Territories** <!-- agent: /architect + /coder | estimate: 6h | source: roadmap:66 -->
    - Create spec: `specs/guild-territories.md`
    - Schema: `Territory`, `GuildTerritoryControl` models
    - Actions: Capture, defend, resource generation
    - UI: World map with territory overlay

- [x] **Arena PvP Seasons** <!-- agent: /game-designer + /coder | estimate: 4h | source: roadmap:70 -->
    - [x] Create spec: `specs/arena-pvp-seasons.md`
    - [x] Schema: `PvpSeason`, `PvpRating`, `PvpMatch`
    - [x] Actions: Season management, ELO, Match logic
    - [x] UI: `RankBadge`, `SeasonRewards` components
    - [x] UI: `RankedLobby` / `Arena.tsx` Integration
    - [x] Cron: Weekly reset logic

- [x] **Podcast Integration Completion** <!-- agent: /coder | estimate: 3h | source: roadmap:7 -->
    - Finalize Pocket Casts OAuth flow
    - [x] Add episode browsing UI
    - [x] Integrate playback controls with workout session

### Priority: Medium

- [x] **Settings Page Migration** <!-- agent: /ui-ux | estimate: 2h | source: ux-audit:67 -->
    - [x] Convert settings modal → dedicated `/settings` route
    - [x] Reduce cognitive load (currently 6 tabs in modal)

- [x] **IronMines Hook Extraction** <!-- agent: /cleanup | estimate: 2h | source: health-report:16 -->
    - [x] Extract `useMiningSession` hook from 375-line component
    - [x] Improve testability and reduce complexity

- [x] **Lighthouse Threshold Restoration** <!-- agent: /perf | estimate: 1h | source: debt:60 -->
    - [x] Audit current Lighthouse scores
    - [x] Incrementally restore thresholds (0.75/0.87/0.87 - was 0.7/0.85/0.85)

### Priority: Low

- [x] **TvMode Unit Tests** <!-- agent: /qa | estimate: 2h | source: health-report:17 -->
    - [x] Mock Bluetooth hooks for edge case coverage
    - [x] Reduce E2E-only test dependency

---

## Sprint Stats
- **Total Items**: 7
- **Estimated Hours**: 20h
- **Feature/Debt/Polish Ratio**: 60% / 20% / 20%

## Dependencies
- Guild Territories requires existing `Guild` schema (✅ verified)
- Arena PvP Seasons depends on existing duel infrastructure (✅ verified after Sprint 17)

## Notes
- Sprint 17 completed all items (Cardio PvP, Power Rating, Oracle 3.0 Push).
- Stripe Monetization remains deferred (blocked on comprehensive testing strategy).
- Oracle 3.0 spec already exists; implementation mostly complete.
