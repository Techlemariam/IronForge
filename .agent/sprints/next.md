## Next Sprint: Sprint 26 "Social Consolidation & Foundation"

**Period**: 2026-01-11 - 2026-01-25
**Goal**: Complete the Social Layer (Async Challenges), introduce Lite Mode for accessibility, and stabilize the codebase with proper Test Scaffolding.

## Backlog

### Priority: High (Critical Value/Health)

- [ ] **Asynchronous Challenges** ("Beat My Bench") <!-- agent: game-designer | estimate: 8h | source: task.md (Iron Mines) -->
- [ ] **Unit Test Scaffolding** (Create `tests/unit/{actions,services}`, scaffold missing tests) <!-- agent: qa | estimate: 6h | source: health-report.md -->
- [ ] **Lite Mode** (Performance & Reduced Motion toggle) <!-- agent: ui-ux | estimate: 5h | source: user-request -->

### Priority: Medium (Debt & UX)

- [ ] **Settings Page Migration** (Modal → `/settings` Route) <!-- agent: ui-ux | estimate: 6h | source: ux-audit.md -->
- [ ] **Program Editor** (Workout Templates CRUD) <!-- agent: coder | estimate: 8h | source: future_planning.md -->
- [ ] **Refactor `src/actions`** (Group into subfolders: `combat/`, `social/`, `training/`) <!-- agent: cleanup | estimate: 4h | source: health-report.md -->

### Priority: Low (Polish)

- [ ] **Quick Stats Header** (Persistent XP/Gold across views) <!-- agent: ui-ux | estimate: 3h | source: ux-audit.md -->
- [ ] **Guild Territories Spec** (Technical Design only) <!-- agent: architect | estimate: 3h | source: roadmap.md -->

---

## Sprint Stats

- **Total Items**: 8
- **Estimated Hours**: ~43h (High load, may need splitting)
- **Debt Ratio**: ~25% (2/8 items) + Infra (~25% test scaffold) = ~50% Health focus
- **Feature Ratio**: ~50%

## Dependencies

- **Lite Mode** requires `User.preferences` schema update (JSON).
- **Program Editor** requires `Program` model in Prisma.
