# Sprint 11: Quality & Stabilization
**Period**: 2025-12-27 - 2026-01-03
**Goal**: Push test coverage to 60% while shipping high-ROI engagement features.

## Backlog

### Priority: High
- [x] **Social Feature Tests** <!-- agent: @qa | estimate: 3h | source: health-report -->
  - *Add tests for `account.ts` and `social.ts` (auth + leaderboard surface).*
- [x] **Heart Rate Zone Training Mode** <!-- agent: @performance-coach + @coder | estimate: 4h | source: evolve -->
  - *Display cardio zones from Intervals.icu, gamify zone adherence.*
- [x] **Environment Verification** <!-- agent: @infrastructure | estimate: 2h | source: roadmap -->
  - *Verify Demo Mode + Strava work after env restoration.*

### Priority: Medium
- [x] **Boss Variants (Elemental Types)** <!-- agent: @game-designer + @coder | estimate: 3h | source: evolve -->
  - *Fire/Ice/Lightning bosses with unique behaviors.*
- [x] **Quick Stats Header** <!-- agent: @ui-ux | estimate: 2h | source: ux-audit -->
  - *Persistent XP/Gold/Level in header.*
- [x] **Auto-update Wilks Score** <!-- agent: @coder | estimate: 1h | source: idea -->
  - *Hevy webhook triggers Wilks recalculation.*

### Priority: Low
- [ ] **Audio Feedback** <!-- agent: @ui-ux | estimate: 1h | source: ux-audit -->
  - *Click sounds for interactions (juicing).*
- [ ] **Accessibility Pass** <!-- agent: @ui-ux | estimate: 2h | source: ux-audit -->
  - *aria-labels, focus rings, color contrast.*

---

## Sprint Stats
- **Total Items**: 8
- **Estimated Hours**: 18h
- **Debt/Test Ratio**: 25% (Tests)
- **Feature Ratio**: 50%
- **Polish Ratio**: 25%

## Dependencies
- Intervals.icu API access for HR Zone feature
- Hevy webhooks configured for Wilks auto-update

## Rollover from Previous Sprint
- [x] ~~Strava Integration~~ → Shipped (env-blocked resolved)
- [x] ~~Boss Difficulty Tiers~~ → Shipped
- [/] ~~Demo Mode~~ → Verify after env fix
