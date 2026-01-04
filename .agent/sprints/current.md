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

- [ ] **Arena PvP Seasons** <!-- agent: /game-designer + /coder | estimate: 4h | source: roadmap:70 -->
    - [x] Create spec: `specs/arena-pvp-seasons.md`
    - [x] Schema: `PvpSeason`, `PvpRating`, `PvpMatch`
    - [x] Actions: Season management, ELO, Match logic
    - [x] UI: `RankBadge`, `SeasonRewards` components
    - [x] UI: `RankedLobby` / `Arena.tsx` Integration
    - [ ] Cron: Weekly reset logic

- [ ] **Podcast Integration Completion** <!-- agent: /coder | estimate: 3h | source: roadmap:7 -->
    - Finalize Pocket Casts OAuth flow
    - Add episode browsing UI
    - Integrate playback controls with workout session

### Priority: Medium

- [ ] **Settings Page Migration** <!-- agent: /ui-ux | estimate: 2h | source: ux-audit:67 -->
    - Convert settings modal → dedicated `/settings` route
    - Reduce cognitive load (currently 6 tabs in modal)

- [ ] **IronMines Hook Extraction** <!-- agent: /cleanup | estimate: 2h | source: health-report:16 -->
    - Extract `useMiningSession` hook from 375-line component
    - Improve testability and reduce complexity

- [ ] **Lighthouse Threshold Restoration** <!-- agent: /perf | estimate: 1h | source: debt:60 -->
    - Audit current Lighthouse scores
    - Incrementally restore thresholds toward 0.9 goal

### Priority: Low

- [ ] **TvMode Unit Tests** <!-- agent: /qa | estimate: 2h | source: health-report:17 -->
    - Mock Bluetooth hooks for edge case coverage
    - Reduce E2E-only test dependency

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
