---
name: narrative-progression
description: Story-driven progression that keeps users coming back for the next chapter
version: 1.0.0
category: behavioral-psychology
owner: "@writer"
platforms: ["windows", "linux", "macos"]
requires: ["gamification-engine"]
context:
  primarySources:
    - src/features/story/
    - src/lib/narrative/
  references:
    - docs/LORE.md
  patterns:
    - src/features/game/
rules:
  - "Story beats unlock through effort, not time"
  - "Cliffhangers at session end"
  - "Player choices affect outcome"
  - "Lore rewards exploration"
edgeCases:
  - "Story spoilers in social features"
  - "Players who skip story content"
  - "Localization of narrative"
---

# 📖 Narrative Progression

Uses story to create emotional investment and "must know what happens next" engagement.

## Core Principle

> "The best games are the ones where you can't wait to see what happens next."
> — Every addicted gamer

## IronForge Narrative Framework

### 1. The Titan's Journey

```
ACT 1: Awakening (First 7 workouts)
  - Titan awakens in Iron Mines
  - Discovers corruption in the land
  - First boss: Shadow of Self

ACT 2: The Forge (Workouts 8-30)
  - Building strength, allies, equipment
  - Unlocking regions of the world
  - Mid-boss: The Iron Sentinel

ACT 3: The Reckoning (Ongoing)
  - Face the source of corruption
  - Shape the world through choices
  - Endless endgame content
```

### 2. Story Unlock Mechanics

| Trigger | Story Beat |
|:--------|:-----------|
| Complete 5 workouts | Chapter 1 unlocks |
| Hit first PR | Special dialogue scene |
| 7-day streak | Meet new NPC ally |
| Guild raid victory | Unlock region |
| 30-day streak | Major plot revelation |

### 3. Cliffhanger System

End each session with anticipation:

```typescript
const generateCliffhanger = (playerProgress: Progress) => {
  const hooks = [
    "The ancient door begins to open...",
    "A shadow moves in the distance.",
    "Your Titan senses something powerful nearby.",
    "The voice whispers: 'Return tomorrow...'",
  ];
  
  // Show after workout completion
  return {
    text: pickRandom(hooks),
    nextUnlock: "Complete tomorrow's quest to continue",
  };
};
```

### 4. Player Choice

Meaningful decisions:

- **Faction alignment** affects story path
- **Resource allocation** changes available quests
- **Moral choices** unlock different endings

### 5. Environmental Storytelling

- Equipment has lore descriptions
- Achievements tell mini-stories
- World changes based on collective player actions

## Usage

```
@narrative Write intro sequence for new player
@narrative Design cliffhanger system for session end
@narrative Create branching dialogue for NPC encounter
```

## Integration Points

- **Workout completion** → Story progression
- **Boss kills** → Major plot advancement
- **Streak milestones** → Character development
- **Equipment upgrades** → Lore reveals
