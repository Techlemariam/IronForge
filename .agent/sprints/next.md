# Sprint 13: The Awakening
**Period**: 2026-01-04 - 2026-01-11
**Goal**: Activate "The Living Titan" ecosystem with server-side state and autonomous behaviors.

## Backlog

### Priority: High
- [ ] **Refactor: Server-Side Titan State** <!-- agent: @architect + @coder | estimate: 4h | source: strategy/manifesto -->
  - *Migrate Titan state from localStorage to Postgres (Prisma) for persistence.*
- [ ] **Feature: Guild Raids** <!-- agent: @game-designer + @coder | estimate: 4h | source: roadmap -->
  - *Multi-user boss battles with shared HP pools.*
- [ ] **Feature: Titan Heartbeat Cron** <!-- agent: @coder | estimate: 3h | source: strategy/manifesto -->
  - *Server-side cron job for autonomous Titan events (recovery, decay).*

### Priority: Medium
- [ ] **Feature: Achievement System** <!-- agent: @game-designer + @coder | estimate: 2h | source: roadmap -->
  - *Unlockable badges and titles based on aggregate stats.*
- [ ] **Refactor: Settings Page Migration** <!-- agent: @ui-ux | estimate: 2h | source: ux-audit -->
  - *Convert settings modal to dedicated /settings route.*
- [ ] **Feature: Oracle Seed (Basic)** <!-- agent: @performance-coach | estimate: 2h | source: strategy/manifesto -->
  - *Initial reasoning engine for "Rest Day" recommendations.*

### Priority: Low
- [ ] **Polish: Quick Stats Persistence** <!-- agent: @ui-ux | estimate: 1h | source: ux-audit -->
  - *Show XP/Gold in header across all views (Citadel/Combat).*
- [ ] **Polish: Loading Skeletons** <!-- agent: @ui-ux | estimate: 1h | source: ux-audit -->
  - *Replace spinners with skeleton loaders.*

---

## Sprint Stats
- **Total Items**: 8
- **Estimated Hours**: 19h
- **Debt Ratio**: 25% (State Migration + Settings)
- **Feature Ratio**: 50% (Raids, Heartbeat, Achievements, Oracle)
- **Polish Ratio**: 25% (Stats, Skeletons)

## Dependencies
- **Titan State Migration** MUST be completed before **Titan Heartbeat**.
- **Guild Raids** requires `guild.ts` service (verified exists).

## Rollover Candidates (from Sprint 12)
- Settings Page Migration
- Loading Skeletons
