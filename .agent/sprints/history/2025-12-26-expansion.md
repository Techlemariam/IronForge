# Next Sprint: Expansion & Stabilization
**Period**: 2025-12-27 - 2026-01-03
**Goal**: Expand ecosystem connectivity (Strava) and deepen gameplay loop (Boss Tiers) while stabilizing core (Tests/Refactor).

## Backlog

### Priority: High (Must Haves)
- [ ] **Strava Integration** <!-- agent: @coder | estimate: 4h | source: roadmap -->
  - *Connect generic cardio workouts to game mechanics.*
- [ ] **Boss Difficulty Tiers** <!-- agent: @game-designer | estimate: 3h | source: roadmap -->
  - *Add scaling challenges for advanced players.*

### Priority: Medium (Should Haves)
- [ ] **Demo Mode (Mock Data)** <!-- agent: @architect | estimate: 3h | source: ux-audit -->
  - *Allow users to explore the app without API keys (lower friction).*
- [ ] **Test Coverage: Account & Social** <!-- agent: @qa | estimate: 3h | source: health-report -->
  - *Fix critical coverage gaps in `account.ts` and `social.ts`.*
- [ ] **DashboardClient Refactor** <!-- agent: @architect | estimate: 3h | source: roadmap -->
  - *Optimize main dashboard for performance and maintainability.*

### Priority: Low (Nice to Haves)
- [ ] **Quick Stats Header** <!-- agent: @ui-ux | estimate: 2h | source: ux-audit -->
  - *Persistent visibility of XP/Gold/Level.*
- [ ] **Audio Feedback System** <!-- agent: @ui-ux | estimate: 1h | source: ux-audit -->
  - *Subtle sound effects for interactions (Juicing).*

---

## Sprint Stats
- **Total Items**: 7
- **Estimated Hours**: 19h
- **Debt Ratio**: ~29% (Tests + Refactor)
- **Feature Ratio**: ~43%
- **Polish Ratio**: ~29%

## Dependencies
- **Strava API Keys**: Need to register IronForge application on Strava Dev Portal.
