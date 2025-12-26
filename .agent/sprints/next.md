# Sprint 12: Launch Readiness
**Period**: 2025-12-27 - 2026-01-03
**Goal**: Prepare for Play Store launch with critical E2E tests and user engagement features.

## Backlog

### Priority: High
- [ ] **Mobile App Store Listing** <!-- agent: @infrastructure | estimate: 4h | source: roadmap -->
  - *Complete Play Store listing: screenshots, descriptions, privacy policy.*
- [ ] **E2E Critical Path Test** <!-- agent: @qa | estimate: 3h | source: roadmap -->
  - *Playwright test: Login → Workout → Combat → Loot flow.*
- [ ] **Unit Tests: intervals.ts + guild.ts** <!-- agent: @qa | estimate: 3h | source: health-report -->
  - *Close test gap on external API and social actions.*

### Priority: Medium
- [ ] **Weekly Challenges System** <!-- agent: @game-designer + @coder | estimate: 4h | source: roadmap -->
  - *Time-limited goals with special rewards for retention.*
- [ ] **Zone-Based Buffs (Cardio Titan)** <!-- agent: @titan-coach + @coder | estimate: 3h | source: roadmap -->
  - *Passive buffs triggered by HR zone training.*
- [ ] **Consolidate Leaderboard Implementations** <!-- agent: @ui-ux + @coder | estimate: 2h | source: ux-audit -->
  - *Merge Colosseum and Social leaderboards.*

### Priority: Low
- [ ] **Settings Page Migration** <!-- agent: @ui-ux | estimate: 2h | source: ux-audit -->
  - *Convert modal to dedicated /settings route (reduce cognitive load).*
- [ ] **Loading Skeletons** <!-- agent: @ui-ux | estimate: 1h | source: ux-audit -->
  - *Replace spinners with skeleton loaders for polish.*

---

## Sprint Stats
- **Total Items**: 8
- **Estimated Hours**: 22h
- **Test Ratio**: 25% (2 items)
- **Feature Ratio**: 50% (4 items)
- **Polish Ratio**: 25% (2 items)

## Dependencies
- Play Store developer account configured
- Playwright browser testing environment
- Intervals.icu API for cardio buffs

## Rollover from Sprint 11
- None (Sprint 11 complete ✅)

---

## Self-Evaluation
- **Scope Realism**: 8/10 (22h is slightly aggressive but achievable)
- **Balance**: 9/10 (Good mix of launch prep, features, and polish)
