# Campaign Mode Enhancement

## Overview

Procedural storyline generation based on player progression data. The campaign adapts to the player's training style, strengths, and goals, creating a personalized narrative experience.

## Metadata

- **Priority**: High
- **ROI**: 4.3
- **Effort**: L
- **GitHub Issue**: [#79](https://github.com/Techlemariam/IronForge/issues/79)

## User Stories

1. As a **Casual Titan**, I want a story that motivates me to keep training.
2. As a **Hardcore Titan**, I want campaign difficulty to scale with my power level.
3. As a **Strength-focused Player**, I want storylines that feature strength challenges.
4. As a **Cardio-focused Player**, I want campaign chapters with endurance themes.
5. As a **Returning Player**, I want to continue my story where I left off.

## Acceptance Criteria

- [ ] Campaign chapters unlock based on level/progression
- [ ] Story branches based on player archetype (Strength/Cardio/Hybrid)
- [ ] Chapter completion rewards (XP, items, lore)
- [ ] Boss fights integrated into storyline
- [ ] Dialogue system with character interactions
- [ ] Campaign progress tracking and replay

## Technical Design

### Data Model

```prisma
model CampaignChapter {
  id            String   @id @default(cuid())
  order         Int      // Chapter sequence
  title         String
  description   String
  archetype     String?  // null = all, "strength", "cardio", "hybrid"
  requirements  Json     // {level: 10, boss: "fire_giant"}
  bossId        String?
  rewards       Json     // {xp: 500, item: "legendary_sword"}
  dialogues     CampaignDialogue[]
  createdAt     DateTime @default(now())
}

model CampaignDialogue {
  id         String   @id @default(cuid())
  chapterId  String
  chapter    CampaignChapter @relation(fields: [chapterId], references: [id])
  speaker    String   // NPC name
  text       String
  order      Int
  choices    Json?    // Optional branching choices
}

model TitanCampaignProgress {
  id              String   @id @default(cuid())
  titanId         String   @unique
  titan           Titan    @relation(fields: [titanId], references: [id])
  currentChapter  Int      @default(1)
  completedChapters Int[]  @default([])
  choiceHistory   Json     @default("[]") // Tracks branching decisions
  updatedAt       DateTime @updatedAt
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/campaign/current` | Current chapter for player |
| GET | `/api/campaign/chapters` | All available chapters |
| POST | `/api/campaign/[id]/start` | Begin chapter |
| POST | `/api/campaign/[id]/complete` | Mark chapter complete |
| POST | `/api/campaign/dialogue/[id]/choice` | Record player choice |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| CampaignMap | `src/components/campaign/CampaignMap.tsx` | Chapter overview |
| DialogueBox | `src/components/campaign/DialogueBox.tsx` | NPC conversations |
| ChapterCard | `src/components/campaign/ChapterCard.tsx` | Chapter details |
| StoryChoice | `src/components/campaign/StoryChoice.tsx` | Branching options |
| CampaignRewards | `src/components/campaign/CampaignRewards.tsx` | Completion rewards |

### State Management

- Campaign progress stored server-side
- Dialogue state cached in localStorage during chapter
- Real-time updates not needed (single-player experience)

## Dependencies

- [ ] Boss system (shipped)
- [ ] Loot/reward system (shipped)
- [ ] Player archetype detection (needs implementation)

## Out of Scope

- Multiplayer campaign
- Voice acting
- Animated cutscenes
- User-generated campaigns

## Open Questions

- [ ] How many chapters initially? (Suggestion: 10-15)
- [ ] Should choices affect gameplay or just story?
