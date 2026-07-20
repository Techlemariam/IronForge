# ADHD-Compatible Training Orchestrator

**Status:** Draft
**Author:** Codex
**Date:** 2026-06-22
**Epic:** Sustainable Capacity Engine

## Purpose

IronForge should help the user become as capable as possible without falling into an
all-or-nothing loop. The system must protect continuity on low-energy days while still
driving real fitness gains when recovery, motivation, and training context support it.

The product principle:

> Never zero. Often good. Sometimes brutal. Always sustainable.

## Core Thesis

Intervals.icu should be the source of truth for the training plan and analysis.
Zwift should be treated as the execution environment and game world. IronForge should
sit above both as the quest, behavior, and decision layer.

Short formula:

> Intervals plans the body. Zwift motivates the brain. IronForge translates between them.

IronForge should not become another competing training calendar. Its job is to remove
decision friction and present one clear daily task with a minimum clear condition,
a standard target, and optional bonus objectives.

## Design Goals

- Present one daily mission instead of a menu of possible training systems.
- Preserve continuity with a minimum clear condition on every day.
- Build high long-term capacity through proper periodization and planned hard efforts.
- Prevent hidden training load from quests, races, badges, or boss fights.
- Reward smart training behavior, not only output metrics.
- Treat FTP as difficulty scaling, not self-worth.
- Allow missed sessions without guilt, stacking, or make-up punishment.

## Non-Goals

- Do not replace Intervals.icu as the training calendar.
- Do not implement live Zwift automation in the first slice.
- Do not create a fragile two-way sync system between Zwift and Intervals.
- Do not add public ingress, deployment changes, secrets, or live infrastructure changes.
- Do not make minimum clear the long-term goal; it is a safety net.

## System Roles

| Capability | Source of Truth |
| --- | --- |
| Planned workouts | Intervals.icu |
| FTP, zones, training load, fatigue, form | Intervals.icu |
| Completed workouts | Intervals.icu after sync from Zwift, Strava, or Garmin |
| Zwift workout or event to run | Execution target referenced by IronForge |
| Quests, XP, levels, boss fights, behavioral rewards | IronForge |
| Historical training analysis | Intervals.icu |

## Conceptual Architecture

```text
Quest/Training Orchestrator
  -> Intervals.icu Calendar
  -> Execution Resolver
       -> Zwift native workout
       -> Zwift event, race, or RoboPacer
       -> Custom workout export
       -> Minimum comeback/recovery mission
  -> Completed Activity
  -> Intervals.icu Analysis
  -> IronForge Quest Completion and Rewards
```

## Daily Quest Model

Every daily quest should have three levels:

```text
Minimum: preserve identity and continuity
Standard: build capacity according to the plan
Boss: expand capacity with a planned high-effort target
```

Example:

```text
Quest: Sweet Spot Builder

Minimum clear:
10 minutes cycling plus a quick RPE log.

Standard clear:
3x8 minutes at 88-92% FTP.

Boss clear:
Complete the session, hold controlled cadence, and write a short pacing note.
```

Minimum clear is not the goal. It prevents zero days and makes comeback behavior
rewarding instead of shame-driven.

## Execution Resolver

The resolver should choose the lowest-friction execution path that satisfies the
day's training intent.

Potential execution targets:

- Existing Zwift workout.
- Zwift event or race that replaces a hard workout.
- RoboPacer ride that replaces Zone 2 or tempo work.
- Custom structured workout generated from the Intervals plan.
- Minimum comeback ride.
- Recovery-only or setup-only quest.

Selection inputs:

- Planned workout intent from Intervals.
- FTP and zones.
- Fatigue, form, recent hard sessions, and recovery markers.
- Motivation and adherence risk.
- User history after missed sessions or interruptions.
- Practical friction of the execution path.

Recommended match weights for Zwift workout selection:

| Factor | Weight |
| --- | ---: |
| Purpose and intensity match | 35% |
| Time-in-zone similarity | 25% |
| Duration similarity | 15% |
| Training load similarity | 15% |
| Practical friction | 10% |

Decision thresholds:

| Score | Decision |
| ---: | --- |
| 85-100 | Use the Zwift target directly |
| 70-84 | Use Zwift if the day's goal is general |
| 50-69 | Flag for review or create a custom workout |
| 0-49 | Create a custom workout or choose a simpler recovery/comeback target |

## Quest Categories

### Training-Compatible Quests

These reinforce the planned session without adding meaningful physical load.

- Give Ride Ons.
- Hold even cadence.
- Complete post-ride RPE.
- Test a lower-friction setup.
- Ride a new route only if intensity stays within target.

### Training-Replacing Quests

These replace, rather than add to, the day's planned stimulus.

- Short Zwift race replacing VO2, threshold, or anaerobic work.
- RoboPacer ride replacing endurance or tempo.
- Group ride replacing social/endurance work.
- FTP test replacing a planned test day.
- Boss fight replacing a scheduled hard session.

### Motivation-Only Quests

These preserve habit and reduce future friction.

- Start Zwift and ride 10 minutes.
- Prepare fan, towel, bottle, and shoes.
- Log post-ride RPE.
- Review a race replay.
- Plan the next boss fight.

## Safety Rules

1. Health and recovery outrank all quests.
2. Consistency outranks perfect session execution.
3. The plan's training intent outranks game rewards.
4. Game rewards outrank performance optimization only when they do not add unsafe load.
5. No missed workout should be automatically stacked onto a future day.
6. Early phases should cap hard stimuli at two per week unless explicitly planned.
7. Race, FTP test, boss fight, threshold, and VO2 sessions count as hard stimuli.
8. ERG bias reductions of 5-10% can still clear the quest when the intent is preserved.
9. "Quit smart" can be a successful outcome when readiness is poor.

Priority order:

```text
Recovery > consistency > training quality > gamification > performance
```

## FTP Principles

FTP is level scaling. It should calibrate workout intensity, not define worth.

Rewards should primarily come from:

- Starting.
- Completing the planned intent.
- Staying in the right zones.
- Scaling down when readiness is low.
- Returning after a pause.
- Logging RPE and lessons.
- Testing FTP when planned.

Rewards should not primarily come from:

- Absolute watts.
- Raw FTP number.
- Winning races.
- Max heart rate.
- Suffer score.

When FTP increases materially, future workouts should be updated but the next week
should be protected:

- Recovery and Zone 2 can update immediately.
- Sweet spot, threshold, and VO2 targets should be capped or flagged for adaptation.
- FTP confidence should be tracked by source: manual estimate, ramp test, 20-minute
  test, race estimate, or repeated confirmed sessions.

## Missed Session Policy

Missed sessions should not create debt.

Example:

```text
Missed Tuesday VO2
  -> Wednesday is not VO2 plus Wednesday's plan
  -> Wednesday becomes either the most important single stimulus or a recovery/comeback quest
```

After a week off:

```text
Quest: Return to Watopia
Minimum clear: 10 minutes any cycling
Reward: comeback bonus
No guilt, no stacking, no compensation workout
```

## MVP Recommendation

Start with a manual-friendly implementation:

1. Read or mock the day's planned Intervals workout.
2. Classify the intent: recovery, endurance, tempo, sweet spot, threshold, VO2,
   anaerobic, race, or test.
3. Generate one IronForge daily quest with minimum, standard, and boss clear states.
4. Add a human-readable execution instruction such as "Run Zwift SST Short" or
   "Ride RoboPacer C for 30 minutes."
5. After a synced activity appears in Intervals, reconcile planned intent vs outcome.
6. Award XP for the right behavior.

Later slices can add native Zwift catalog matching, event matching, and custom workout
generation.

## Acceptance Criteria

- A daily mission can represent minimum, standard, and boss clear states.
- A quest can replace a hard session only when it satisfies the same training intent.
- A missed workout never automatically stacks onto the next day.
- A low-readiness day can produce a successful recovery or quit-smart outcome.
- Rewards are based on behavior and plan fit, not absolute performance.
- The first implementation can operate from mocked or manually entered execution
  instructions without live Zwift automation.
