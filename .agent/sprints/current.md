# Sprint 19: The Forge Refined
**Period**: 2026-01-05 - 2026-01-12  
**Goal**: Implement Garmin Bio-Integration MVP, consolidate duplicate leaderboard systems, and finalize technical debt (Lighthouse 0.9 + Three.js Types).

## Backlog

### Priority: High

- [ ] **Garmin Integration (MVP)** <!-- agent: /infrastructure + /coder | estimate: 6h | source: roadmap:75 -->
    - [ ] Create `src/services/bio/GarminService.ts` for OAuth and data ingestion
    - [ ] Implement wellness data fetching: sleep, recovery, stress
    - [ ] Integrate Garmin overlays into `CardioStudio.tsx`
    - [ ] Add Garmin connection UI in `/settings`

### Priority: Medium

- [ ] **Unified Leaderboard Refactor** <!-- agent: /cleanup + /coder | estimate: 4h | source: ux-audit:91 -->
    - [ ] Consolidate duplicate leaderboard implementations into `src/actions/leaderboards.ts`
    - [ ] Standardize ranking logic for PvP, Cardio Duels, and Guild efforts
    - [ ] Update Social Hub UI to use the new unified action

- [ ] **Three.js Type Safety** <!-- agent: /coder | estimate: 2h | source: debt:43 -->
    - [ ] Audit `src/types/global.d.ts` for R3F/Three.js `any` usage
    - [ ] Define proper types for 3D elements used in Citadel/Arena
    - [ ] Enable strict type checking for 3D files

### Priority: Low

- [ ] **Final Lighthouse Restoration** <!-- agent: /perf | estimate: 1h | source: debt:61 -->
    - [ ] Restore thresholds to 0.9 for all categories in `.lighthouserc.json`
    - [ ] Verify CI pass with the new strict goals

---

## Sprint Stats
- **Total Items**: 4
- **Estimated Hours**: 13h
- **Feature/Debt/Polish Ratio**: 50% / 30% / 20%

## Dependencies
- Garmin Integration requires valid API keys (assume available or mockable for MVP)
- Leaderboard refactor depends on results of Sprint 18 Ranked Arena (✅ verified)

## Notes
- Sprint 18 completed successfully (Ranked Arena, Podcast, Territories).
- Focus shifts from "New Features" to "Integration & Refinement".
