# Premium Cosmetics Store
**Priority:** Medium | **Effort:** M | **ROI:** 4.0

## Overview
Purchasable cosmetic items that don't affect gameplay balance.

## Cosmetic Categories

### Titan Skins
- Full body appearance changes
- Animated variants
- Seasonal exclusives

### Equipment Skins
- Weapon appearances
- Armor visual overrides
- Effect particles

### Avatars & Frames
- Profile pictures
- Border frames
- Animated frames

### Effects
- Auras
- Victory animations
- Workout completion effects

## Pricing Tiers
| Tier | Gems | Examples |
|------|------|----------|
| Common | 100 | Basic recolors |
| Rare | 300 | New models |
| Epic | 600 | Animated |
| Legendary | 1200 | Full sets |

## Data Model
```prisma
model CosmeticItem {
  id          String   @id @default(cuid())
  name        String
  category    String
  tier        String
  priceGems   Int
  isLimited   Boolean  @default(false)
  expiresAt   DateTime?
  assets      Json     // Image/animation URLs
}

model UserCosmetic {
  id          String   @id @default(cuid())
  userId      String
  cosmeticId  String
  equippedAt  DateTime?
  purchasedAt DateTime @default(now())
  
  user        User @relation(fields: [userId], references: [id])
  cosmetic    CosmeticItem @relation(fields: [cosmeticId], references: [id])
  
  @@unique([userId, cosmeticId])
}
```

## Success Metrics
- Gem purchase conversion
- Cosmetic equip rate
- Limited item FOMO engagement
