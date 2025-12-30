# Campaign Mode Enhancement
**Priority:** High | **Effort:** L | **ROI:** 4.3
**Type:** Enhancement to existing `CampaignTracker.tsx`

> 📖 **Story Content:** [Campaign Story Bible](campaign-story-bible.md)

## Overview
Add story-driven narrative elements to the existing campaign/progression system.

## Current State
- `src/components/CampaignTracker.tsx` - Gates and progress tracking
- Phase-based progression with requirements
- No story content or narrative

## Enhancement Scope

### 1. Story Chapters
Each training phase tied to a narrative arc.

```typescript
interface StoryChapter {
  id: string;
  phaseId: string;          // Links to existing phase
  title: string;
  synopsis: string;
  scenes: StoryScene[];
  characters: Character[];
  unlockCondition: PhaseGate;
}

interface StoryScene {
  id: string;
  type: 'DIALOGUE' | 'NARRATION' | 'CHOICE' | 'BATTLE_INTRO';
  content: string;
  speaker?: Character;
  choices?: StoryChoice[];
  triggeredBy: 'PHASE_START' | 'PHASE_MID' | 'PHASE_END' | 'ACHIEVEMENT';
}

interface StoryChoice {
  text: string;
  effect: {
    stat?: { name: string; change: number };
    reputation?: { faction: string; change: number };
    unlock?: string;
  };
}
```

### 2. Characters/NPCs
Recurring characters that guide the player.

```typescript
interface Character {
  id: string;
  name: string;
  title: string;
  portrait: string;
  faction: string;
  personality: string;
  dialogueStyle: string;
}

// Example characters
const CHARACTERS = [
  {
    id: 'commander_marcus',
    name: 'Commander Marcus',
    title: 'Iron Legion Commander',
    faction: 'IRON_LEGION',
    personality: 'Stern but fair veteran warrior',
  },
  {
    id: 'sage_elara',
    name: 'Sage Elara',
    title: 'Keeper of the Forge',
    faction: 'ARCANE_ORDER',
    personality: 'Wise, mysterious, speaks in metaphors',
  },
  {
    id: 'rival_kain',
    name: 'Kain the Unyielding',
    title: 'Champion of the Pit',
    faction: 'RIVAL',
    personality: 'Arrogant but respects strength',
  },
];
```

### 3. Story Progression
Tied to training milestones.

## Story Content Structure

### Chapter 1: The Awakening (Levels 1-10)
**Synopsis:** You awaken in the Citadel with fragmented memories. Commander Marcus tasks you with proving your worth.

| Trigger | Scene |
|---------|-------|
| Phase Start | Marcus introduces training grounds |
| First Workout | "The iron remembers you..." |
| Level 5 | Sage Elara reveals the Titan within |
| Level 10 | Choice: Join Iron Legion or seek own path |

### Chapter 2: The Trials (Levels 11-25)
**Synopsis:** To unlock your Titan's full potential, you must pass the Three Trials.

### Chapter 3: The Rival (Levels 26-40)
**Synopsis:** Kain challenges you to prove who is truly strongest.

## Data Model

```prisma
model StoryProgress {
  id            String   @id @default(cuid())
  userId        String   @unique
  currentChapter Int     @default(1)
  completedScenes String[] @default([])
  choices       Json     // Record of player choices
  reputation    Json     // Faction reputation
  
  user          User     @relation(fields: [userId], references: [id])
}
```

## API Actions

### `src/actions/story.ts`
```typescript
// Get current story state
getStoryProgressAction(userId: string): Promise<StoryProgress>

// Get pending scenes to display
getPendingScenesAction(userId: string): Promise<StoryScene[]>

// Mark scene as viewed
markSceneViewedAction(userId: string, sceneId: string): Promise<void>

// Make story choice
makeStoryChoiceAction(userId: string, sceneId: string, choiceIndex: number): Promise<ChoiceResult>

// Get all chapters with completion status
getChaptersOverviewAction(userId: string): Promise<ChapterOverview[]>
```

## UI Components

### `src/components/StoryModal.tsx`
- Full-screen narrative display
- Character portrait
- Dialogue text with typewriter effect
- Choice buttons
- Skip option

### `src/components/ChapterProgress.tsx`
- Chapter list with completion
- Current chapter highlighted
- Locked chapters greyed

### `src/components/CharacterCard.tsx`
- NPC portrait and info
- Relationship level
- Unlock status

## Story Content Files

```
src/data/story/
├── chapters/
│   ├── chapter-1-awakening.ts
│   ├── chapter-2-trials.ts
│   └── chapter-3-rival.ts
├── characters.ts
├── dialogues.ts
└── choices.ts
```

## Integration Points
- `CampaignTracker.tsx`: Trigger scenes on phase changes
- `achievements.ts`: Trigger scenes on unlocks
- `combat.ts`: Story boss intros
- `training.ts`: Post-workout character comments

## Success Metrics
- Story chapter completion > 70%
- Choice engagement rate
- User feedback on narrative
- Retention during story phases
