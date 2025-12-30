# Housing / Citadel Customization
**Priority:** Medium | **Effort:** M | **ROI:** 4.2

## Overview
Personal space customization where players can decorate their Citadel with trophies, furniture, and upgrades.

## Core Features

### Room Types
- **Training Hall:** Display equipment, boost training
- **Trophy Room:** Achievement displays
- **Armory:** Equipment showcase
- **Garden:** Passive resource generation

### Customization Options
- Wall/floor themes
- Furniture placement
- Trophy displays
- Lighting effects

## Data Model
```prisma
model Citadel {
  id          String   @id @default(cuid())
  userId      String   @unique
  layout      Json     // Room positions
  decorations Json     // Placed items
  unlockedRooms String[] @default(["training_hall"])
  
  user        User @relation(fields: [userId], references: [id])
}
```

## API Actions
```typescript
getCitadelAction(userId: string): Promise<Citadel>
placeDecorationAction(userId: string, itemId: string, position: Position): Promise<void>
unlockRoomAction(userId: string, roomType: string): Promise<void>
```

## Success Metrics
- Customization engagement
- Room unlock conversion
- Time spent in citadel view
