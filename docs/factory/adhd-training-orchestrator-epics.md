# Factory Epic Pack: ADHD-Compatible Training Orchestrator

**Date:** 2026-06-22
**Source spec:** [ADHD-Compatible Training Orchestrator](../../specs/adhd-training-orchestrator.md)
**Factory use:** Copy individual issues into the factory queue as focused PR tasks.

## Operating Constraints

- Keep the first PRs docs-only or mock-driven.
- Do not call live Intervals.icu, Zwift, Garmin, Strava, or Hevy APIs from tests.
- Do not add secrets, real hostnames, real private IPs, tokens, `.env`, kubeconfig, or
  provider payload dumps.
- Do not change deployment, public ingress, infrastructure state, or GitHub Actions secrets.
- Use sanitized fixtures only.

## Epic 1: Microforge Daily Mission

**Goal:** Replace all-or-nothing daily training with a three-level mission model:
minimum, standard, and boss.

**User outcome:** The user always has one clear next action while still progressing
toward high capacity.

### Issue 1.1: Define Daily Mission Domain Types

- **Type:** product-foundation
- **Priority:** P0
- **Risk:** Low
- **Scope:** Add type definitions for `DailyMission`, `MissionClearLevel`, and
  `MissionOutcome` in the appropriate training/dashboard domain.
- **Acceptance criteria:**
  - Mission supports `minimum`, `standard`, and `boss` clear levels.
  - Mission can represent training intent, execution instruction, and reward policy.
  - No live provider calls are introduced.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit` if tests are added
  - `git diff --check`
- **Factory prompt:**
  "Create the smallest typed domain model for IronForge daily missions with minimum,
  standard, and boss clear levels. Keep it local and mock-driven; do not call live
  integrations."

### Issue 1.2: Add Microforge Copy to First-Login Onboarding

- **Type:** ux-copy
- **Priority:** P0
- **Risk:** Low
- **Scope:** Change the first-login framing from heroic oath language to first minimum
  win language.
- **Acceptance criteria:**
  - First session presents one practical next action.
  - Copy does not imply failure if the full workout is not completed.
  - Existing onboarding completion behavior is preserved.
- **Suggested validation:**
  - `pnpm lint`
  - Targeted component/unit test if text assertions exist
  - `git diff --check`
- **Factory prompt:**
  "Make a narrow onboarding copy change so IronForge introduces the first minimum win
  instead of an all-or-nothing heroic oath. Preserve current onboarding state behavior."

### Issue 1.3: Show Minimum, Standard, and Boss Clear in Today's Mission

- **Type:** ui
- **Priority:** P0
- **Risk:** Medium
- **Scope:** Update the Today's Mission UI to display clear levels for a mission.
- **Acceptance criteria:**
  - The primary action remains obvious.
  - Minimum clear is visible without becoming the only goal.
  - UI works in quiet/lite context.
- **Suggested validation:**
  - `pnpm lint`
  - Component/unit test for rendered clear levels
  - `git diff --check`
- **Factory prompt:**
  "Update Today's Mission to present minimum, standard, and boss clear conditions.
  Keep the launch action primary and avoid adding provider integration."

## Epic 2: Intervals-Zwift Execution Resolver

**Goal:** Convert a planned training intent into the lowest-friction execution target.

**User outcome:** The user does not decide between Intervals, Zwift, Garmin, or another
surface. IronForge says what to do today.

### Issue 2.1: Add Training Intent Classifier

- **Type:** service
- **Priority:** P1
- **Risk:** Medium
- **Scope:** Implement a pure function that classifies planned workout metadata into
  recovery, endurance, tempo, sweet spot, threshold, VO2, anaerobic, race, or test.
- **Acceptance criteria:**
  - Uses sanitized local fixtures.
  - Handles unknown or incomplete input safely.
  - Unit tests cover representative intents.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit`
  - `git diff --check`
- **Factory prompt:**
  "Add a pure training intent classifier for planned workouts using sanitized local
  fixtures. Do not call Intervals.icu or Zwift."

### Issue 2.2: Add Execution Target Model

- **Type:** product-foundation
- **Priority:** P1
- **Risk:** Low
- **Scope:** Define execution target types for Zwift workout, Zwift race/event,
  RoboPacer, custom workout, minimum comeback, and recovery-only mission.
- **Acceptance criteria:**
  - Execution target includes a human-readable instruction.
  - Target can be selected without provider automation.
  - Types support future match scoring.
- **Suggested validation:**
  - `pnpm check-types`
  - `git diff --check`
- **Factory prompt:**
  "Define execution target types for the IronForge resolver with human-readable
  instructions and future match-score support. Keep it type-only unless tests are useful."

### Issue 2.3: Implement Mock Execution Resolver

- **Type:** service
- **Priority:** P1
- **Risk:** Medium
- **Scope:** Add a pure resolver that maps training intent and readiness flags to an
  execution target using local mock data.
- **Acceptance criteria:**
  - Low readiness can choose recovery or minimum comeback.
  - VO2/threshold can choose race only when safe.
  - Endurance can choose RoboPacer or route instruction.
  - Unit tests cover the main branches.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit`
  - `git diff --check`
- **Factory prompt:**
  "Implement a mock-only execution resolver that maps planned intent plus readiness
  to a low-friction execution target. Cover low-readiness, hard-session, and endurance
  cases with unit tests."

## Epic 3: Readiness and Anti-Overtraining Guardrails

**Goal:** Ensure quests build capacity without hiding extra training load.

**User outcome:** Boss fights, races, and hard workouts are planned stressors, not
impulsive add-ons.

### Issue 3.1: Add Hard Stimulus Counter

- **Type:** service
- **Priority:** P1
- **Risk:** Medium
- **Scope:** Add a pure function that counts hard stimuli in a week from sanitized
  planned/completed session fixtures.
- **Acceptance criteria:**
  - Counts race, VO2, threshold, FTP test, boss fight, and hard climb as hard stimuli.
  - Supports a beginning cap of two hard stimuli per week.
  - Unit tests cover edge cases.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit`
  - `git diff --check`
- **Factory prompt:**
  "Add a local hard-stimulus counter for IronForge training decisions. Use sanitized
  fixtures only and test the two-hard-stimuli weekly cap behavior."

### Issue 3.2: Add No Make-Up Stack Rule

- **Type:** service
- **Priority:** P0
- **Risk:** Medium
- **Scope:** Add decision logic that prevents missed workouts from automatically
  stacking onto future days.
- **Acceptance criteria:**
  - Missed hard sessions do not create double-hard future days.
  - Resolver can choose one important stimulus or a comeback/recovery quest.
  - Unit tests cover missed VO2 followed by a planned session.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit`
  - `git diff --check`
- **Factory prompt:**
  "Implement the no make-up stack rule in local mission planning logic. Missed sessions
  must not automatically combine with the next day's plan."

### Issue 3.3: Add Quit-Smart Outcome

- **Type:** product-foundation
- **Priority:** P1
- **Risk:** Low
- **Scope:** Add an outcome state for smartly downgrading or ending a session when
  readiness is poor.
- **Acceptance criteria:**
  - Outcome is distinct from failure.
  - Reward policy can grant XP for the decision.
  - Tests or type checks cover the outcome.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit` if logic is added
  - `git diff --check`
- **Factory prompt:**
  "Add a quit-smart mission outcome that can be rewarded when the user downgrades or
  stops for recovery reasons. Keep behavior local and testable."

## Epic 4: Behavior-Based Reward Policy

**Goal:** Reward actions that build durable capacity, not only peak performance.

**User outcome:** The app reinforces starting, staying in zones, scaling smartly,
returning after pauses, and logging lessons.

### Issue 4.1: Define Reward Reasons

- **Type:** product-foundation
- **Priority:** P1
- **Risk:** Low
- **Scope:** Add canonical reward reasons for start, completion, zone adherence,
  smart scaling, comeback, RPE log, planned FTP test, and boss clear.
- **Acceptance criteria:**
  - Reward reasons avoid absolute watt or FTP worship.
  - Reasons can be used by UI and future analytics.
  - No existing XP behavior is changed unless explicitly tested.
- **Suggested validation:**
  - `pnpm check-types`
  - `git diff --check`
- **Factory prompt:**
  "Define canonical mission reward reasons focused on behavior and plan fit, not
  absolute performance. Keep this as a small typed foundation change."

### Issue 4.2: Add Comeback Bonus Logic

- **Type:** service
- **Priority:** P1
- **Risk:** Medium
- **Scope:** Add local logic that identifies a comeback after a pause and awards
  a comeback-oriented reward.
- **Acceptance criteria:**
  - A 7-day gap can produce a comeback mission.
  - Comeback does not require compensating for missed load.
  - Unit tests cover no-guilt return behavior.
- **Suggested validation:**
  - `pnpm check-types`
  - `pnpm test:unit`
  - `git diff --check`
- **Factory prompt:**
  "Add local comeback bonus logic for IronForge missions after a training gap. Do not
  stack missed workouts; reward return behavior."

### Issue 4.3: Add FTP as Difficulty Scaling Copy and Policy

- **Type:** ux-copy
- **Priority:** P2
- **Risk:** Low
- **Scope:** Document and surface that FTP calibrates difficulty rather than worth.
- **Acceptance criteria:**
  - Copy avoids framing higher FTP as moral superiority.
  - Future workouts remain percentage-based in documentation.
  - No FTP calculation behavior is changed in this slice.
- **Suggested validation:**
  - `pnpm lint`
  - `git diff --check`
- **Factory prompt:**
  "Add a narrow copy/docs pass that frames FTP as difficulty scaling. Do not change FTP
  calculation logic or provider integrations."

## Epic 5: Future Native Integration Slices

**Goal:** Prepare for real Intervals/Zwift integration only after the local behavior
model is stable.

### Issue 5.1: Intervals Planned Workout Read Model Spike

- **Type:** technical-spike
- **Priority:** P2
- **Risk:** Medium
- **Scope:** Document the smallest safe read model for planned Intervals workouts,
  using sanitized examples and no live calls.
- **Acceptance criteria:**
  - Identifies needed fields for intent, duration, load, zones, and workout steps.
  - Lists missing credentials or live-access requirements as not run.
  - Does not add provider secrets or live API calls.
- **Suggested validation:**
  - `git diff --check`
- **Factory prompt:**
  "Write a technical spike for the Intervals planned-workout read model using sanitized
  examples only. Do not call live Intervals.icu."

### Issue 5.2: Zwift Workout Catalog Matching Spike

- **Type:** technical-spike
- **Priority:** P2
- **Risk:** Medium
- **Scope:** Document how native Zwift workouts could be represented locally for
  match scoring by purpose, duration, load, time-in-zone, and friction.
- **Acceptance criteria:**
  - Defines local catalog fixture format.
  - Defines score thresholds.
  - Does not scrape or automate Zwift.
- **Suggested validation:**
  - `git diff --check`
- **Factory prompt:**
  "Create a docs-only spike for local Zwift workout catalog matching. Define fixture
  shape and score thresholds without scraping, automating, or calling Zwift."

## Recommended Build Order

1. Issue 1.1: Define Daily Mission Domain Types
2. Issue 1.2: Add Microforge Copy to First-Login Onboarding
3. Issue 1.3: Show Minimum, Standard, and Boss Clear in Today's Mission
4. Issue 2.1: Add Training Intent Classifier
5. Issue 2.2: Add Execution Target Model
6. Issue 2.3: Implement Mock Execution Resolver
7. Issue 3.2: Add No Make-Up Stack Rule
8. Issue 3.3: Add Quit-Smart Outcome
9. Issue 4.1: Define Reward Reasons
10. Issue 4.2: Add Comeback Bonus Logic

## PR Body Template for Factory Issues

```markdown
## Purpose

Short description of the specific factory issue.

## Changes

- TBD
- TBD

## Safety Boundaries

- [ ] No live commands against Panopticon hosts were run
- [ ] No secrets were committed
- [ ] No private keys, authkeys, tokens, `.env`, kubeconfig, or tfstate were committed
- [ ] No real private IPs, Tailnet IPs, public live IPs, or host output were committed
- [ ] No SSHD/firewall/root-login/sudoers/users changes
- [ ] No deploy, rollback, secret rotation, data deletion, or infra restart
- [ ] No public ingress was created
- [ ] Local override files remain ignored

## Validation

Checks run:
- TBD

Checks not run:
- TBD

## Risk

Low / Medium / High

Rationale:
- TBD

## Rollback

Revert the PR.
```
