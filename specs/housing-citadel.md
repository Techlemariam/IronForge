# Housing / Citadel Customization

## Overview

Personal space for Titans with stat-boosting trophies, decorations, and functional upgrades. The Citadel serves as a home base that reflects achievements and provides passive bonuses.

## Metadata

- **Priority**: Medium
- **ROI**: 4.2
- **Effort**: M
- **GitHub Issue**: [#82](https://github.com/Techlemariam/IronForge/issues/82)

## User Stories

1. As a **Casual Titan**, I want a personal space to decorate and call my own.
2. As a **Hardcore Titan**, I want to display trophies from my achievements.
3. As a **Collector**, I want to unlock rare decorations through gameplay.
4. As a **Competitive Player**, I want citadel upgrades that provide stat bonuses.
5. As a **Social Player**, I want to visit friends' citadels.

## Acceptance Criteria

- [ ] Citadel view with placeable furniture/decorations
- [ ] Trophy wall for achievements and boss kills
- [ ] Functional rooms with passive bonuses (Training Hall, Forge, etc.)
- [ ] Room upgrades with gold investment
- [ ] Decoration shop with rotating inventory
- [ ] Friend citadel visiting

## Technical Design

### Data Model

```prisma
model Citadel {
  id          String   @id @default(cuid())
  titanId     String   @unique
  titan       Titan    @relation(fields: [titanId], references: [id])
  level       Int      @default(1)
  layout      Json     @default("{}") // Room positions
  decorations CitadelDecoration[]
  rooms       CitadelRoom[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CitadelRoom {
  id          String   @id @default(cuid())
  citadelId   String
  citadel     Citadel  @relation(fields: [citadelId], references: [id])
  roomType    String   // "training_hall", "forge", "treasury"
  level       Int      @default(1)
  bonusType   String   // "xp", "gold", "crafting"
  bonusValue  Float    @default(0.05) // 5% bonus
}

model CitadelDecoration {
  id          String   @id @default(cuid())
  citadelId   String
  citadel     Citadel  @relation(fields: [citadelId], references: [id])
  itemId      String   // Reference to decoration catalog
  position    Json     // {x, y, z}
  placedAt    DateTime @default(now())
}

model DecorationCatalog {
  id          String   @id @default(cuid())
  name        String
  category    String   // "furniture", "trophy", "wall_art"
  rarity      String   // "common", "rare", "epic", "legendary"
  source      String   // "shop", "achievement", "drop"
  cost        Int?     // Gold cost if purchasable
  imageUrl    String
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/citadel` | Get player's citadel |
| GET | `/api/citadel/[titanId]` | View another player's citadel |
| POST | `/api/citadel/decorate` | Place/move decoration |
| POST | `/api/citadel/rooms/[id]/upgrade` | Upgrade room level |
| GET | `/api/shop/decorations` | Browse decoration shop |
| POST | `/api/shop/decorations/[id]/buy` | Purchase decoration |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| CitadelView | `src/components/citadel/CitadelView.tsx` | Main citadel display |
| RoomPanel | `src/components/citadel/RoomPanel.tsx` | Room details and upgrade |
| DecorationPlacer | `src/components/citadel/DecorationPlacer.tsx` | Drag-and-drop placement |
| TrophyWall | `src/components/citadel/TrophyWall.tsx` | Achievement display |
| DecorationShop | `src/components/citadel/DecorationShop.tsx` | Purchase UI |

### State Management

- Citadel layout saved server-side
- Decoration positions stored as JSON
- Room bonuses calculated server-side and cached

## Dependencies

- [ ] Gold economy (shipped)
- [ ] Achievement system (shipped)
- [ ] Shop infrastructure (shipped)

## Out of Scope

- Real-time multiplayer visits
- Citadel PvP/raids
- Land plots outside citadel

## Open Questions

- [ ] Max room count per citadel?
- [ ] Should room bonuses stack or cap?
