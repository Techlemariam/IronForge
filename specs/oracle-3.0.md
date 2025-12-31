# Oracle 3.0: The Proactive Coach

## Objective
To evolve "The Iron Oracle" from a passive chatbot into a **Proactive AI Coach** that monitors user data in the background and pushes actionable insights ("Decrees") without waiting for user prompts.

## Core Pillars

### 1. From Reactive to Proactive
- **Current (V2)**: User asks "Should I train?", Oracle checks data -> Responds.
- **New (V3)**: Oracle checks data at 6:00 AM.
    - If Recovery < 30%: Sends "⚠️ High Injury Risk. Rest Day Enforced."
    - If Recovery > 90%: Sends "🚀 Prime Condition. Go for PR."
    - If Neutral: No message (avoid spam).

### 2. Deeper Context Window
Integrate new data sources into the LLM System Prompt:
- **Power Score**: "You are coaching a [Tier] Tier athlete."
- **PvP Status**: "User has an active duel ending in 2 days. They are trailing by 5km."
- **Recent Trends**: "User volume increased 20% this week (Sharp Spike)."

### 3. Architecture Changes

#### A. The "Oracle Cycle" (Background Job)
New scheduled job (via Vercel Cron or GitHub Actions) running daily:
1.  **Ingest**: Intervals.icu (Wellness), Hevy (Volume), IronForge (PvP).
2.  **Analyze**: Calculate `RecoveryScore`, `InjuryProb`, `PowerTrend`.
3.  **Decide**: Does this require intervention?
4.  **Act**: Update `TitanState` (Buff/Debuff) + Send Notification.

#### B. Notification Channels
- **In-App**: "Decree Active" banner (already exists, but needs push).
- **External**: Setup for Telegram/Discord bot integration (future).

#### C. LLM Integration
- **Model Switch**: Allow switching between `Gemini 2.5` (Speed/Cost) and `GPT-4o` (Reasoning/Coach).
- **Structured Output**: Oracle should return JSON decrees, not just text, to programmatically lock/unlock app features.

## Technical Requirements
1.  **Cron Job**: `/api/cron/daily-oracle`.
2.  **Notification Service**: `src/services/notifications.ts`.
3.  **Enhanced Prompt**: `src/lib/prompts/oracle-system.ts` (Dynamic generation).

## Roadmap
- [ ] **Phase 1**: Backend Assessment (Can we run cron?).
- [ ] **Phase 2**: Prompt Engineering (Include new PvP/Power stats).
- [ ] **Phase 3**: "Push" Notification Prototype (In-app toast on login).
