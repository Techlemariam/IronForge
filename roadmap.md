# IronForge Feature Roadmap

**Status**: Active | **Strategy**: Value-Driven Implementation

## 🚀 Active Development

- [x] **Iron Command Center (TV Mode)** <!-- status: shipped | priority: critical | roi: 5.5 | effort: L | source: strategic-diff -->
- [/] **Cardio PvP Duels** ([Spec](specs/cardio-duels.md)) <!-- status: in-progress | architect: /architect | priority: medium | effort: M | source: user/idea -->

## 🚨 Business Trigger Watchlist (Scale-Up Indicators)
>
> **Strategy:** Do not monetize until these conditions are met.

- [ ] **Trigger 1: Traction** -> 100 recurring users (Retention > 20%).
- [ ] **Trigger 2: Demand** -> User explicitly asks "Can I pay for X?".
- [ ] **Trigger 3: Cost** -> API/Server costs exceed 500 SEK/month.
*Action:* Monitor via `/monitor-growth`. When triggered, execute `business_plan.md` -> Phase 2.

## 🚨 Market & UX Gaps (Source: [Market Analysis](../.gemini/antigravity/brain/4afcae0e-1f7b-4e63-a972-c5fb8b73c895/market_analysis.md))

> **Strategy:** Address these gaps to improve user acquisition and retention across all personas. Monitor via `/monitor-strategy` (product) and `/monitor-growth` (metrics).

### Product Gaps

| # | Gap | Impact | Effort | Status |
|---|-----|--------|--------|--------|
| 1 | **No visual game art** (characters, bosses, equipment) | Users feel "where's the game?" | XL | 🟡 25% (Titans + 1 Boss done) |
| 2 | **No lite/serious mode** toggle | Alienates non-gamers | M | ✅ Shipped (Settings + Dashboard integration) |
| 3 | **Overwhelming onboarding** | First-session churn | M | 🟡 Partial (FirstLoginQuest exists) |
| 4 | **No female-inclusive branding** | Excludes 50% of market | L (copy) / XL (identity) | 🔴 Not Started |
| 5 | **No social proof / community** | "Is anyone using this?" | M | 🔴 Not Started |
| 6 | **No jargon explainers** (RPE, 1RM, MRV) | Beginners confused | S | ✅ Shipped (JargonTooltip with 18+ terms) |

### Marketing Gaps

| # | Gap | Impact | Effort | Status |
|---|-----|--------|--------|--------|
| 1 | **Unclear value proposition** | "What is this app, exactly?" | S | 🔴 Not Started |
| 2 | **No landing page / marketing site** | Can't acquire users | M | 🔴 Not Started |
| 3 | **No testimonials / case studies** | No trust signals | M | 🔴 Not Started |
| 4 | **Heavy jargon in README** | Insider-only messaging | S | 🔴 Not Started |

### Monetization Gaps
>
> **Strategy:** Deferred until Business Triggers are met (see above). Focus on traction before payment integration.

| # | Gap | Impact | Effort | Status |
|---|-----|--------|--------|--------|
| 1 | **Payment provider decision pending** | Can't charge anyone | M | ⏸️ Deferred (awaiting 100 users / demand / cost trigger) |
| 2 | **No visible pricing page** | Users don't know there's a premium tier | S | ⏸️ Deferred |
| 3 | **Free tier limits unclear** | No urgency to upgrade | S | 🔴 Not Started (can ship before payments) |

## 🎮 Game Balance Gaps (Monitor: `/monitor-game`)

> **Strategy:** Audit game balancing constants, loot tables, and XP curves. Avoid pay-to-win and ensure fair progression.

| # | Area | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 | **Loot Tables** | Drop rates not audited for fairness | Medium | 🟡 Needs Review |
| 2 | **XP Multipliers** | Multiple XP sources (streaks, buffs, bio) may stack excessively | Medium | 🟡 Needs Review |
| 3 | **Combat Balance** | Boss HP scaling vs player DPS not formally tested | Medium | 🟡 Needs Review |
| 4 | **Chase Mode** | Pace thresholds may be too strict for casual runners | Low | 🔴 Not Audited |

## 🔧 Logic & Type Safety Gaps (Monitor: `/monitor-logic`)

> **Strategy:** Reduce `any` usage, resolve TODOs, and improve test coverage for critical paths.

| # | Category | Count | Top Files | Status |
|---|----------|-------|-----------|--------|
| 1 | **`as any` / `: any` usage** | 50+ | `prisma.ts`, `intervals.ts`, `hevy.ts`, services | 🟡 Ongoing |
| 2 | **TODOs in codebase** | ~17 | `oracle.ts`, `TvMode.tsx`, `GarminService.ts` | 🟡 Ongoing |
| 3 | **Silent catch blocks** | Unknown | Needs audit | 🔴 Not Audited |
| 4 | **Test coverage** | ~60% | Missing coverage in `/actions`, `/services/bio` | 🟡 Improving |

## 🧬 Bio Integration Gaps (Monitor: `/monitor-bio`)

> **Strategy:** Ensure external APIs (Hevy, Intervals, Garmin) are stable, validated, and secure.

| # | Integration | Issue | Severity | Status |
|---|-------------|-------|----------|--------|
| 1 | **Garmin Service** | OAuth flow has TODOs, not fully implemented | High | 🟡 In Progress |
| 2 | **Zod Validation** | Not all API responses are schema-validated | Medium | 🟡 Partial |
| 3 | **Error Handling** | Some catch blocks may swallow errors | Medium | 🔴 Not Audited |
| 4 | **API Key Security** | Keys read from env, no rotation strategy | Low | 🟢 Acceptable |

---

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

## 🆕 Season 2 Backlog (Revised after Gap Analysis 2025-12-29)

> **Note:** 6 features from original brainstorm already exist: Raid Boss, Talent Trees, Seasonal Events, Challenges, Marketplace, Fitness Challenges

### Critical Priority

- [x] **Battle Pass** ([Spec](specs/battle-pass.md)) <!-- status: shipped | priority: critical | roi: 5.0 | effort: M | source: brainstorm | date: 2025-12-29 -->

### High Priority (New Features)

- [ ] **Guild Territories** ([Spec](specs/guild-territories.md)) <!-- status: planned | priority: high | roi: 4.6 | effort: L | source: brainstorm -->
- [ ] **Oracle 3.0 (Phase 2)** - Advanced Audio Coaching <!-- status: planned | priority: high | roi: 4.8 | effort: M | source: enhancement -->

### High Priority (Enhancements to_Existing)

- [x] **Oracle 3.0 (Phase 1)** <!-- status: shipped | priority: high | roi: 4.8 | effort: M | source: enhancement -->
  - [x] Volume Spike Detection
  - [x] PvP Context Awareness
  - [x] Push Notification Service
  - [x] Power Rating Tier Messaging
- [/] **Arena PvP Seasons** ([Spec](specs/arena-pvp-seasons.md)) <!-- status: in-progress | architect: /architect | priority: high | effort: M | source: gap-analysis -->
- [ ] **World Events Enhancement** ([Spec](specs/world-events-enhancement.md)) <!-- status: planned | priority: high | roi: 4.5 | effort: S | source: gap-analysis -->
- [ ] **Campaign Mode Enhancement** ([Spec](specs/campaign-mode-enhancement.md)) <!-- status: planned | priority: high | roi: 4.3 | effort: L | source: gap-analysis -->

### Medium Priority
>
> **Note:** Cardio PvP Duels is tracked under Active Development (see top of roadmap)

- [ ] **Territory Conquest** ([Spec](specs/territory-conquest.md)) <!-- status: planned | priority: medium | roi: 4.2 | effort: M | source: user/idea | date: 2025-12-31 -->
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
- [x] **Build Performance Optimization** <!-- status: shipped | priority: high | roi: 4.0 | effort: M | source: infrastructure-audit -->
  - Rationale: No Turborepo/parallel jobs. CI runs lint→test→build sequentially but could parallelize.
  - Scope: Configure matrix jobs, explore Nx/Turborepo for caching.

### Medium Priority (Observability & Resilience)

- [x] **Database Migration CI Guard Enhancement** <!-- status: shipped | priority: medium | roi: 3.3 | effort: S | source: infrastructure-audit | date: 2026-01-03 -->
  - ✅ Implemented: Uses `prisma migrate diff --exit-code` with shadow database in CI.
- [x] **Cron Job Monitoring** <!-- status: shipped | priority: medium | roi: 3.2 | effort: S | source: infrastructure-audit -->
  - Rationale: `vercel.json` has cron job but no alerting if it fails.
  - Scope: Add uptime monitoring (Checkly, Cronitor) or Sentry cron monitoring.

### Low Priority (Nice to Have)

- [x] **Preview Deployments for PRs** <!-- status: shipped | priority: low | roi: 3.0 | effort: S | source: infrastructure-audit | date: 2026-01-03 -->
  - ✅ Implemented: PR comments with preview URL via `actions/github-script`.
- [x] **Dockerfile for Local Development** <!-- status: shipped | priority: low | roi: 2.5 | effort: M | source: infrastructure-audit | date: 2026-01-03 -->
  - ✅ Implemented: Multi-stage Dockerfile, docker-compose with app + db services, hot reload.
- [x] **Nix Flake Modernization** <!-- status: shipped | priority: low | roi: 2.0 | effort: M | source: infrastructure-audit | date: 2026-01-03 -->
  - ✅ Implemented: Modern `flake.nix` with Node 22, PostgreSQL 16, and `direnv` integration. Updated IDX environment to match.

### Research & Analysis

- [x] **MCP Integration Plan** ([Analysis](docs/analysis/mcp_integration_plan.md)) <!-- status: shipped | priority: medium | roi: 4.0 | effort: S | source: research-session | date: 2026-01-05 -->
- [ ] **Fix CI/CD Failures** <!-- status: planned | priority: critical | roi: 5.0 | effort: S | source: monitor-ci | date: 2026-01-05 -->
  - Investigate `pnpm test` failures in `react-dom` passive effects.

---

## ✅ Shipped

### Infra Session (2026-01-01)

- [x] **Health Check Endpoint** (`/api/health`) <!-- status: shipped | source: infrastructure-audit -->
- [x] **Structured Logging** (`pino`) <!-- status: shipped | source: infrastructure-audit -->
- [x] **Sentry Cron Monitoring** (`src/lib/sentry-cron.ts`) <!-- status: shipped | source: infrastructure-audit -->

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
