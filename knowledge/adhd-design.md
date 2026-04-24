# 🧠 Domain: AuDHD Design Patterns

**Owner:** @manager, @ui-ux
**Focus:** Neurodivergent-informed design for Autism + ADHD co-occurrence.
**Applies to:** IronForge (primary), potentially all Brotherhood projects.

## The AuDHD Paradox

| Autism Needs | ADHD Needs | Design Implication |
|:---|:---|:---|
| Predictability | Novelty | **Stable framework, variable content** |
| Routine | Flexibility | **Scaffolded routines with escape hatches** |
| Low ambiguity | Quick decisions | **Curated choices, not infinite menus** |
| Sensory control | Sensory-seeking | **Adaptive UI intensity** |
| Deep expertise | Scattered attention | **Focused views, depth on demand** |
| External structure | Poor self-regulation | **System provides the structure** |

## Core Principles

### 1. Initiation Architecture (ADHD-Critical)

The hardest part is starting. Design for the transition, not the task.

- **Pre-flight Countdown:** Break "go train" into micro-steps (change clothes → fill water → check today's plan → start timer).
- **Activation Energy Reduction:** One tap from "not doing" to "doing." Minimize decisions between intent and action.
- **Context Pre-loading:** Show today's workout plan proactively before the user even opens the app.
- **Momentum Preservation:** Never interrupt flow to ask "are you sure?" during a workout.

### 2. Decision Offloading (Autism + ADHD)

Every decision costs executive function. Budget decisions like money.

- **"Today's Mission" View:** Single card showing what to do now. Not a dashboard of 15 options.
- **Oracle-First UX:** The Oracle should tell you what to do, not ask what you want.
- **Preset-Heavy:** Default everything. User can customize LATER, not during action.
- **Binary Choices:** "Train or Rest?" not "Choose from 6 activity types."

### 3. Routine Scaffolding (Autism-Critical)

The system must build AND protect the routine.

- **Schedule Anchoring:** Link workouts to time-of-day (morning/evening windows).
- **Deviation Alerts:** Surface when a routine breaks. "You usually train Tuesdays — want to reschedule?"
- **Streak Protection:** Grace periods, "partial credit," and make-up windows.
- **Pattern Recognition:** Learn the user's natural rhythm and reinforce it.

### 4. Adaptive Intensity (AuDHD)

Not every day is a "Commander Mode" day.

- **Auto-Tone Selection:** Recovery/sleep data → UI intensity level.
- **Quiet Mode:** Minimal animations, muted colors, essential info only.
- **Commander Mode:** Full HUD, aggressive branding, gamification at max.
- **Companion Mode:** Gentle, encouraging, "good enough" messaging.
- **User Override:** Always let the user manually switch modes.

### 5. "Good Enough" Reinforcement (ADHD-Critical)

Perfectionism + ADHD = paralysis. The system must break this loop.

- **Show Up > PR:** Celebrate attendance, not just records.
- **Partial Completion:** "You did 3 of 5 exercises — that counts. +XP."
- **Anti-Guilt Messaging:** "Missed yesterday? Today is a new quest."
- **Progress ≠ Linear:** Visualize consistency over time, not just peak performance.

### 6. Time Awareness (ADHD-Critical)

ADHD brains experience time differently. Help them feel it.

- **Elapsed Timers:** Always visible during workouts.
- **"Time Since Last Workout":** Prominent on dashboard.
- **Window Countdown:** "Your evening training window opens in 2h."
- **"Wrap Up" Nudge:** Gentle alert when workout exceeds expected duration.
- **No Open-Ended Sessions:** Every session has an expected duration.

### 7. Interruption Resilience (Life Context)

Kids interrupt. Life interrupts. The system must handle this gracefully.

- **Quick Save:** One-tap workout pause with auto-resume capability.
- **Partial Logging:** Log what was done, even if session was cut short.
- **"Come Back" Recovery:** If app is reopened after interruption, show where you left off.
- **No Punishment:** Never penalize shortened sessions (no streak breaks for partial workouts).

## Anti-Patterns ⛔

| Anti-Pattern | Why It Hurts AuDHD | Fix |
|:---|:---|:---|
| **Information overload dashboard** | Decision paralysis, overwhelm | "Today's One Thing" default view |
| **Only celebrating PRs** | Perfectionism spiral | Celebrate consistency |
| **Complex multi-step configuration** | Executive function tax | Smart defaults, configure later |
| **Notification spam** | Sensory overload + guilt | Batched, tone-matched notifications |
| **"Are you sure?" confirmations** | Breaks momentum during action | Undo instead of confirm |
| **Infinite scroll content** | Hyperfocus trap | Bounded, paginated views |
| **Time-sensitive FOMO mechanics** | Anxiety + guilt when missed | Grace periods, catch-up mechanics |

## Implementation Priority

1. **Today's Mission View** (replaces dashboard as default) — S effort
2. **Launch Sequence** (task initiation micro-steps) — M effort
3. **Quiet Mode / Companion Tone** — M effort
4. **Routine Guardian** (schedule anchoring + deviation alerts) — M effort
5. **Interruption Resilience** (quick save + partial logging) — S effort
6. **Time Blindness Tools** (window countdown + elapsed timers) — S effort
