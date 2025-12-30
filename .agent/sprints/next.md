# Next Sprint: Sprint 16 - Infrastructure Pilot & UX Polish
**Period**: 2025-12-29 - 2026-01-05
**Goal**: Strengthen the foundation with observability, type safety, and a premium settings experience.

## Backlog

### Priority: High
- [ ] **Build Performance Optimization** <!-- agent: /infrastructure | estimate: 4h | source: roadmap:107 -->
- [ ] **Health Check Endpoint** <!-- agent: /infrastructure | estimate: 1h | source: roadmap:112 -->
- [ ] **Structured Logging (Pino)** <!-- agent: /infrastructure | estimate: 4h | source: roadmap:115 -->
- [ ] **Refactor: useMiningSession hook** <!-- agent: /coder | estimate: 2h | source: health-report:20 -->

### Priority: Medium
- [ ] **Fix Analytics Dashboard Logic** <!-- agent: /coder | estimate: 3h | source: debt:42 -->
- [ ] **Type Safety Pass (Supabase & Storage)** <!-- agent: /security | estimate: 2h | source: debt:40,41 -->
- [ ] **Dedicated Settings Page** <!-- agent: /ui-ux | estimate: 4h | source: ux-audit:67 -->

### Priority: Low
- [ ] **Loading Skeletons** <!-- agent: /ui-ux | estimate: 1h | source: ux-audit:73 -->

---

## Sprint Stats
- **Total Items**: 8
- **Estimated Hours**: 21h
- **Debt Ratio**: 37% (3/8)

## Dependencies
- Requires `pino` and `pino-pretty` npm packages.
- Verified `agent-verify.yml` exists and is parallelized.
