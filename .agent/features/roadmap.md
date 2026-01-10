# IronForge Feature Roadmap

**Status**: Active | **Strategy**: Value-Driven Implementation

## 🚀 Active Development

- [x] **Iron Command Center (TV Mode)** <!-- status: shipped | priority: critical | roi: 5.5 | effort: L | source: strategic-diff -->
- [/] **Cardio PvP Duels** ([Spec](specs/cardio-duels.md)) <!-- status: in-progress | architect: /architect | priority: medium | effort: M | source: user/idea -->
- [/] **Podcast Integration (Pocket Casts)** ([Spec](specs/podcast-integration.md)) <!-- status: in-progress | architect: /architect | priority: medium | roi: 4.0 | effort: M | source: user/idea -->
- [/] **Iron Mines 10/10 Enhancement** <!-- status: in-progress | architect: /architect | priority: high | roi: 2.5 | effort: XL | source: monitor-strategy | date: 2026-01-10 -->
  - Phase A: Max Reps Tracker + Set Type Selector
  - Phase B: Exercise Demo Videos + Auto Rest Timer
  - Phase C: Superset/Circuit Support
  - Phase D: HR Strength Features (Recovery Timer, Zone Display, Cardiac Drift)

## 📋 Backlog (Ready for Analysis)

### Critical Priority (Consensus: Game Designer + Coaches)

- [x] **Iron Leagues** ([Analysis](../../docs/analysis/iron_leagues.md)) <!-- status: shipped | priority: critical | roi: 5.5 | effort: H | source: strategic-diff -->
- [x] **Titan vs Titan Duels** ([Analysis](../../docs/analysis/titan_duels.md)) <!-- status: shipped | priority: critical | roi: 5.3 | effort: H | source: strategic-diff -->
- [x] **Bio→Combat Buff System** ([Analysis](../../docs/analysis/bio_combat_buffs.md)) <!-- status: shipped | priority: critical | roi: 5.5 | effort: M | source: titan-coach/game-designer -->
- [x] **Anti-Overtraining Guardrails** (XP Cap, Fatigue Debuff) <!-- status: shipped | priority: critical | roi: 5.2 | effort: M | source: strategic-diff -->
- [ ] **Stripe Monetization System** ([Plan](../../docs/analysis/monetization_plan.md)) <!-- status: deferred | priority: critical | roi: 5.0 | effort: XL | source: analyst | blocked: testing -->

### High Priority (Strategy: 2045 Summit)

- [x] **Segment Leaderboards** (Strava-style e1RM ranking: City/Country/World) <!-- status: shipped | priority: high | roi: 4.8 | effort: M | source: strategic-diff -->
- [x] **PvP Ranking Ladder** (Private → High Warlord titles) <!-- status: shipped | priority: high | roi: 4.7 | effort: M | source: strategic-diff -->
- [ ] **Tutorial Tooltips for Beginners** <!-- status: planned | priority: high | roi: 4.5 | effort: S | source: monitor-strategy | date: 2026-01-06 -->
- [x] **Auto-Periodization Engine** (AI training plan generation) <!-- status: shipped | priority: high | roi: 4.6 | effort: H | source: strategic-diff -->
  - [x] Enhanced Volume Calculator (RPE-weighted, SFR) ([Analysis](../../docs/analysis/adaptive_volume_landmarks.md)) <!-- status: shipped | priority: high | roi: 4.5 | effort: M | source: strategic-diff -->
    - [x] Level 1: Naiv Skalning (single coefficient) <!-- version: v1.5 | effort: S -->
    - [x] Level 2: Dual-Coefficient (stimulus + recovery) <!-- version: v2.0 | effort: M -->
    - [x] Level 3: Per-Muscle Adaptation <!-- version: v2.5 | effort: L -->
    - [x] Level 4: Recovery-State Modulated MRV <!-- version: v3.0 | effort: XL -->
- [x] **Recovery Oracle Verdict UI** (Clear daily TRAIN/REST/LIGHT) <!-- status: shipped | priority: high | roi: 4.5 | effort: S | source: strategic-diff -->
- [x] **Unified Titan Soul (Server)** <!-- status: shipped | priority: critical | roi: 5.0 | effort: XL | source: strategy -->
- [x] **The Oracle Seed (Intelligence)** <!-- status: shipped | priority: high | roi: 4.5 | effort: L | source: strategy -->
- [x] **Dungeon Gating (Zone 2 Unlock)** <!-- status: shipped | priority: high | roi: 4.5 | effort: S | source: titan-coach -->
- [x] **Daily Streak System** <!-- status: shipped | priority: high | roi: 4.5 | effort: S | source: game-designer -->
- [x] **XP Multiplier Logic** <!-- status: shipped | priority: high | roi: 4.3 | effort: S | source: system-diagram -->
- [x] **Recovery Lock Logic** <!-- status: shipped | priority: high | roi: 4.0 | effort: M | source: performance-coach -->
- [x] **Fatigue Debuff System** <!-- status: shipped | priority: high | roi: 4.0 | effort: S | source: system-diagram -->
- [x] **Coach Subscription** <!-- status: shipped | priority: high | roi: 4.0 | effort: L | source: system-diagram -->
- [x] **Powerlifting Tournament Brackets** (Bracket-style lift competitions with seeding) <!-- status: shipped | priority: high | roi: 3.7 | effort: M-L | source: user/idea -->

### Medium Priority (ROI 3.0-3.9)

- [x] **Shareable Replay Cards** (Auto-generated workout summaries for social) <!-- status: shipped | priority: medium | roi: 3.9 | effort: S | source: strategic-diff -->
- [x] **Training DNA Export** (Exportable methodologies for marketplace) <!-- status: shipped | priority: medium | roi: 3.5 | effort: H | source: strategic-diff -->
- [x] **Combat Combo System** <!-- status: shipped | priority: medium | roi: 3.8 | effort: M | source: game-designer -->
- [x] **Skill Tree Build Presets** <!-- status: shipped | priority: medium | roi: 3.7 | effort: S | source: game-designer -->
- [x] **Guild Quest System** <!-- status: shipped | priority: medium | roi: 3.6 | effort: M | source: system-diagram -->
- [x] **Shared Rewards (Guild)** <!-- status: shipped | priority: medium | roi: 3.5 | effort: S | source: system-diagram -->
- [x] **Anti-Grind Fatigue Penalty** <!-- status: shipped | priority: medium | roi: 3.5 | effort: S | source: titan-coach -->
- [x] **Achievement Expansion (100+)** <!-- status: shipped | priority: medium | roi: 3.5 | effort: M | source: game-designer -->
- [x] Apple Watch Integration <!-- status: shipped | priority: medium | roi: 3.9 | effort: L | source: analyst -->

### Optional Polish (UX Finesse)

- [x] **Gesture Navigation (Mobile)** <!-- status: shipped | priority: low | roi: 2.5 | effort: S | source: ui-ux-audit -->
- [x] **Reduced Motion Mode** <!-- status: shipped | priority: low | roi: 2.0 | effort: S | source: ui-ux-audit -->
- [x] **First-Time Hints** <!-- status: shipped | priority: low | roi: 2.5 | effort: S | source: ui-ux-audit -->

### Low Priority (ROI < 2.0)

- [x] **Guild Creation** <!-- status: shipped | priority: low | roi: 2.5 | effort: L | source: game-designer -->
- [x] Manual Stat Overrides <!-- status: shipped | priority: low | roi: 1.5 | effort: S | source: manager -->

## 🔧 Logic & Type Safety Gaps

- [ ] **Accessibility Audit: Missing ARIA labels** <!-- status: planned | priority: medium | roi: 3.5 | effort: M | source: monitor-debt | date: 2026-01-06 -->
- [x] **Prisma Type Stabilization** <!-- status: shipped | priority: critical | roi: 5.5 | effort: L | source: strategic-diff -->

## 🆕 Season 2 Backlog (Revised after Gap Analysis 2025-12-29)

> **Note:** 6 features from original brainstorm already exist: Raid Boss, Talent Trees, Seasonal Events, Challenges, Marketplace, Fitness Challenges

### Critical Priority

- [x] **Battle Pass** ([Spec](specs/battle-pass.md)) <!-- status: shipped | priority: critical | roi: 5.0 | effort: M | source: brainstorm | date: 2025-12-29 -->

### High Priority (New Features)

- [ ] **Oracle 3.0** ([Spec](specs/ai-training-coach.md)) <!-- status: planned | priority: high | roi: 4.8 | effort: M | source: enhancement -->
- [ ] **Guild Territories** ([Spec](specs/guild-territories.md)) <!-- status: planned | priority: high | roi: 4.6 | effort: L | source: brainstorm -->

### High Priority (Enhancements to Existing)

- [ ] **Power Rating System** ([Spec](specs/power-rating-system.md)) <!-- status: planned | priority: high | roi: 4.5 | effort: M | source: team-discussion -->
- [ ] **Arena PvP Seasons** ([Spec](specs/arena-pvp-seasons.md)) <!-- status: planned | priority: high | roi: 4.7 | effort: M | source: gap-analysis -->
- [ ] **World Events Enhancement** ([Spec](specs/world-events-enhancement.md)) <!-- status: planned | priority: high | roi: 4.5 | effort: S | source: gap-analysis -->
- [ ] **Campaign Mode Enhancement** ([Spec](specs/campaign-mode-enhancement.md)) <!-- status: planned | priority: high | roi: 4.3 | effort: L | source: gap-analysis -->

### Medium Priority

- [ ] **Cardio PvP Duels** ([Spec](specs/cardio-duels.md)) <!-- status: planned | priority: medium | roi: 2.5 | effort: M | impact: 5 | source: user/idea + team-discussion -->
  - Distance Race (running + cycling)
  - Speed Demon (running + cycling)
  - Elevation Grind (cycling)
- [ ] **Housing/Citadel Customization** ([Spec](specs/housing-citadel.md)) <!-- status: planned | priority: medium | roi: 4.2 | effort: M | source: brainstorm -->
- [ ] **Premium Cosmetics Store** ([Spec](specs/premium-cosmetics.md)) <!-- status: planned | priority: medium | roi: 4.0 | effort: M | source: brainstorm -->

---

## 🔧 Infrastructure Backlog (Infrastructure Pilot Analysis 2025-12-29)

### Critical Priority (Production Readiness)

- [x] **Sentry Error Tracking Integration** <!-- status: shipped | priority: critical | roi: 5.0 | effort: M | source: infrastructure-audit | date: 2025-12-29 -->
  - Installed `@sentry/nextjs`, created client/server/edge configs, wrapped `next.config.mjs`, added `global-error.tsx`.
- [x] **E2E Tests with Dev Server** <!-- status: shipped | priority: critical | roi: 4.8 | effort: S | source: infrastructure-audit | date: 2025-12-29 -->
  - Fixed port mismatch in `playwright.config.ts` (3005→3000), `webServer` already configured.
- [x] **Node.js Version Alignment** <!-- status: shipped | priority: critical | roi: 4.5 | effort: S | source: infrastructure-audit | date: 2025-12-29 -->
  - Updated `dev.nix` from Node 18 to Node 20 to match CI.

### High Priority (Developer Experience)

- [x] **Test Coverage Reports** <!-- status: shipped | priority: high | roi: 4.5 | effort: S | source: infrastructure-audit | date: 2025-12-29 -->
  - Rationale: No visibility into coverage. 35 test files but unknown % covered.
  - Scope: Add Vitest coverage, upload to Codecov/Coveralls, add PR badge.
- [x] **GitHub Actions Deployment Workflow** <!-- status: shipped | priority: high | roi: 4.3 | effort: M | source: infrastructure-audit | date: 2025-12-29 -->
  - Rationale: No automated deployment workflow. Manual Vercel deploys only.
  - Scope: Add deploy workflow with staging/prod environments, preview URLs on PRs.
- [x] **Security Vulnerability Scanning** <!-- status: shipped | priority: high | roi: 4.2 | effort: S | source: infrastructure-audit | date: 2025-12-29 -->
  - Rationale: Dependabot exists but no SAST/DAST. No npm audit in CI.
  - Scope: Add `npm audit` step, consider CodeQL for static analysis.
- [x] **Environment Variable Validation** <!-- status: shipped | priority: high | roi: 4.0 | effort: S | source: infrastructure-audit | date: 2025-12-29 -->
  - Rationale: No `.env.example` found. New developers don't know required vars.
  - Scope: Create `.env.example`, add Zod schema for runtime validation at startup.
- [ ] **Build Performance Optimization** <!-- status: planned | priority: high | roi: 4.0 | effort: M | source: infrastructure-audit -->
  - Rationale: No Turborepo/parallel jobs. CI runs lint→test→build sequentially but could parallelize.
  - Scope: Configure matrix jobs, explore Nx/Turborepo for caching.

### Medium Priority (Observability & Resilience)

- [ ] **Health Check Endpoint** <!-- status: planned | priority: medium | roi: 3.8 | effort: S | source: infrastructure-audit -->
  - Rationale: No `/api/health` for load balancer checks. Vercel handles this but custom endpoint enables DB health monitoring.
  - Scope: Create `/app/api/health/route.ts` with DB ping.
- [ ] **Structured Logging** <!-- status: planned | priority: medium | roi: 3.5 | effort: M | source: infrastructure-audit -->
  - Rationale: Using `console.error` everywhere. No log levels, no correlation IDs, no observability.
  - Scope: Add Pino/Winston logger, standardize log format, integrate with Vercel Logs.
- [ ] **Database Migration CI Guard Enhancement** <!-- status: planned | priority: medium | roi: 3.3 | effort: S | source: infrastructure-audit -->
  - Rationale: `database-guard.yml` exists but drift check logic is fragile (depends on directory listing).
  - Scope: Use `prisma migrate diff` instead of file checks.
- [ ] **Cron Job Monitoring** <!-- status: planned | priority: medium | roi: 3.2 | effort: S | source: infrastructure-audit -->
  - Rationale: `vercel.json` has cron job but no alerting if it fails.
  - Scope: Add uptime monitoring (Checkly, Cronitor) or Sentry cron monitoring.

### Low Priority (Nice to Have)

- [ ] **Preview Deployments for PRs** <!-- status: planned | priority: low | roi: 3.0 | effort: S | source: infrastructure-audit -->
  - Rationale: No preview URLs commented on PRs. Vercel does this but needs GitHub integration verification.
  - Scope: Verify Vercel GitHub integration, add PR comment bot if missing.
- [ ] **Dockerfile for Local Development** <!-- status: planned | priority: low | roi: 2.5 | effort: M | source: infrastructure-audit -->
  - Rationale: Only `docker-compose.test.yml` exists. No unified dev container.
  - Scope: Create `Dockerfile` + `docker-compose.yml` for full local stack.
- [ ] **Nix Flake Modernization** <!-- status: planned | priority: low | roi: 2.0 | effort: M | source: infrastructure-audit -->
  - Rationale: `dev.nix` uses old Devbox format. Modern Nix Flakes more portable.
  - Scope: Migrate to `flake.nix` with direnv integration.

---

## ✅ Shipped

### Sprint 12: Economy & Progression (2025-12-29)

- [x] **Shop System** (Buy/sell items with gold) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Prestige System** (Reset for permanent bonuses) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Milestone Rewards** (Level-based unlocks) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Mastery Tracks** (Per-exercise mastery progression) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Gold Multipliers** (Streak-based gold bonuses) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Resource Gen** (Passive resource generation) <!-- date: 2025-12-29 | source: sprint-12 -->
- [x] **Statistics Dashboard** (Comprehensive stats page) <!-- date: 2025-12-29 | source: sprint-12 -->

### Sprint 11: Depth & Immersion (2025-12-29)

- [x] **Dungeon Floor System** (Progressive dungeon levels) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Boss Mechanics** (Unique attack patterns and phases) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Lore System** (Story fragments and world-building) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Companion System** (Pet/familiar that grows with you) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Item Enchanting** (Add magical properties to gear) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Crafting System** (Create items from materials) <!-- date: 2025-12-29 | source: sprint-11 -->
- [x] **Weather Effects** (Dynamic weather affecting gameplay) <!-- date: 2025-12-29 | source: sprint-11 -->

### Sprint 10: Mobile & QoL (2025-12-29)

- [x] **Offline Mode** (PWA offline workout support) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Quick Log Widget** (Fast set logging component) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Haptic Feedback** (Vibration for key actions) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Voice Commands** (Basic voice input for sets) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Keyboard Shortcuts** (Power user navigation) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Data Backup/Restore** (Export/import user data) <!-- date: 2025-12-29 | source: sprint-10 -->
- [x] **Onboarding Tour** (Interactive first-time guide) <!-- date: 2025-12-29 | source: sprint-10 -->

### Sprint 9: Social & Competitive (2025-12-29)

- [x] **Friend System** (Add/remove friends, friend list) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Challenge Friends** (Direct 1v1 challenges) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Live Activity Feed** (Real-time friend updates) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Weekly Challenges** (Time-limited group challenges) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Rival System** (Auto-matched rivals based on stats) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Titan Comparison** (Side-by-side stat comparison) <!-- date: 2025-12-29 | source: sprint-9 -->
- [x] **Global Announcements** (Server-wide notifications) <!-- date: 2025-12-29 | source: sprint-9 -->

### Sprint 8: Gamification & Retention (2025-12-29)

- [x] **Daily Quest System** (Rotating challenges for bonus XP) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Loot Box / Reward Crates** (Random rewards after milestones) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Titan Customization** (Appearance, equipment display) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Equipment Upgrade System** (Enhance gear stats) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Daily Login Rewards** (Cumulative bonuses) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Referral System** (Invite friends for rewards) <!-- date: 2025-12-29 | source: sprint-8 -->
- [x] **Seasonal Events** (Limited-time themed content) <!-- date: 2025-12-29 | source: sprint-8 -->

### Sprint 7: Analytics & Engagement (2025-12-29)

- [x] **Analytics Dashboard** (Training trends, PR history, volume graphs) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **Workout Calendar View** (Monthly workout history) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **Muscle Heat Map** (Training balance visualization) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **Rest Timer with Alerts** (Configurable with haptic/audio) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **1RM Calculator** (Multiple formula support) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **Body Metrics Tracking** (Weight, body fat, measurements) <!-- date: 2025-12-29 | source: sprint-7 -->
- [x] **Workout Notes & Tags** (Annotate workouts) <!-- date: 2025-12-29 | source: sprint-7 -->

### Previous Sprints

- [x] **Hevy Routines to Training Programs** <!-- date: 2025-12-28 | source: feature/user-request -->
- [x] **The Living Titan (Behaviors)** <!-- date: 2025-12-28 | source: sprint 14 -->
- [x] **Push Notifications** <!-- date: 2025-12-28 | source: sprint 14 -->
- [x] **Faction Wars UI** <!-- date: 2025-12-28 | source: sprint 14 -->
- [x] **Guild Raids** <!-- date: 2025-12-28 | source: sprint 13 -->
- [x] **Achievement System** <!-- date: 2025-12-28 | source: sprint 13 -->
- [x] **Garmin Fenix 7x Adapter** (via Intervals.icu) <!-- date: 2025-12-28 | source: sprint 13 -->
- [x] **Server-Side Titan State** <!-- date: 2025-12-28 | source: sprint 13 -->
- [x] **Settings Page Migration** <!-- date: 2025-12-28 | source: sprint 13 -->
- [x] Direct Strava Integration <!-- status: shipped | priority: high | roi: 4.8 | effort: M | source: evolve/analyst -->
- [x] E2E Critical Path Test <!-- date: 2025-12-27 | source: evolve/qa -->
- [x] Power/Pace Zone Training <!-- date: 2025-12-27 | source: evolve/performance-coach -->
- [x] Agent Orchestration Level 1-4 <!-- date: 2025-12-24 -->
- [x] Mobile App Store Listing <!-- date: 2025-12-26 | source: evolve/analyst -->
- [x] Weekly Challenges <!-- date: 2025-12-26 | source: evolve/game-designer -->
- [x] DashboardClient Refactor <!-- date: 2025-12-26 | source: evolve/architect -->
- [x] Zone-Based Buffs (Cardio Titan) <!-- date: 2025-12-26 | source: evolve/titan-coach -->
- [x] Leaderboard Consolidation <!-- date: 2025-12-26 | source: evolve/ui-ux -->
- [x] Combat Retreat <!-- date: 2025-12-25 | source: ux-audit -->
- [x] Citadel Redesign <!-- date: 2025-12-25 | source: ux-audit -->
- [x] Onboarding Quest <!-- date: 2025-12-25 | source: ux-audit -->
- [x] Strava Integration <!-- date: 2025-12-26 | source: evolve/analyst -->
- [x] Boss Difficulty Tiers <!-- date: 2025-12-26 | source: evolve/game-designer -->
- [x] Demo Mode <!-- date: 2025-12-26 | source: ux-audit -->
- [x] Heart Rate Zone Training Mode <!-- date: 2025-12-26 -->
- [x] Boss Elemental Variants <!-- date: 2025-12-26 -->
- [x] Quick Stats Header <!-- date: 2025-12-26 -->
- [x] Auto-update Wilks Score <!-- date: 2025-12-26 -->
- [x] Social Feature Tests <!-- date: 2025-12-26 -->
- [x] Environment Verification <!-- date: 2025-12-26 -->
- [x] Audio Feedback <!-- date: 2025-12-26 -->
- [x] Accessibility Pass <!-- date: 2025-12-26 -->

---

## Feature Lifecycle Protocol

1. **Idea**: Add to Backlog here.
2. **Analysis**: Run `/feature [name]` to generate stories.
3. **Execution**: Link to `current.md` for `/sprint-auto`.
4. **Ship**: Move to Shipped section.
