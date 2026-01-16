# Premium Cosmetics Store

## Overview

In-game store for cosmetic skins, effects, and visual customizations. Purely cosmetic items that don't affect gameplay balance, funded through premium currency.

## Metadata

- **Priority**: Medium
- **ROI**: 4.0
- **Effort**: M
- **GitHub Issue**: [#83](https://github.com/Techlemariam/IronForge/issues/83)

## User Stories

1. As a **Casual Titan**, I want to customize my appearance to express my style.
2. As a **Paying Player**, I want exclusive cosmetics that show my support.
3. As a **Collector**, I want limited-time items that are rare.
4. As a **F2P Player**, I want some cosmetics earnable through gameplay.
5. As a **Guild Leader**, I want guild-themed cosmetics for my members.

## Acceptance Criteria

- [ ] Cosmetic categories: Skins, Effects, Titles, Frames
- [ ] Premium currency (Gems) purchasable with real money
- [ ] Some items earnable through gameplay (Battle Pass, Achievements)
- [ ] Rotating featured items with discounts
- [ ] Purchase history and refund window (24 hours)
- [ ] Preview before purchase

## Technical Design

### Data Model

```prisma
model Cosmetic {
  id          String   @id @default(cuid())
  name        String
  category    String   // "skin", "effect", "title", "frame"
  rarity      String   // "common", "rare", "epic", "legendary"
  priceGems   Int?     // Premium price
  priceGold   Int?     // In-game currency price
  limited     Boolean  @default(false)
  availableFrom DateTime?
  availableUntil DateTime?
  previewUrl  String
  createdAt   DateTime @default(now())
}

model TitanCosmetic {
  id          String   @id @default(cuid())
  titanId     String
  titan       Titan    @relation(fields: [titanId], references: [id])
  cosmeticId  String
  cosmetic    Cosmetic @relation(fields: [cosmeticId], references: [id])
  equipped    Boolean  @default(false)
  acquiredAt  DateTime @default(now())
  source      String   // "purchase", "reward", "achievement"
  
  @@unique([titanId, cosmeticId])
}

model GemTransaction {
  id          String   @id @default(cuid())
  titanId     String
  titan       Titan    @relation(fields: [titanId], references: [id])
  amount      Int      // Positive = purchase, negative = spend
  type        String   // "purchase", "spend", "refund"
  referenceId String?  // Cosmetic ID or order ID
  createdAt   DateTime @default(now())
}
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| GET | `/api/shop/cosmetics` | Browse cosmetic catalog |
| GET | `/api/shop/featured` | Featured/discounted items |
| POST | `/api/shop/cosmetics/[id]/buy` | Purchase cosmetic |
| POST | `/api/shop/cosmetics/[id]/refund` | Refund within window |
| GET | `/api/titans/[id]/cosmetics` | Player's owned cosmetics |
| POST | `/api/titans/[id]/cosmetics/[id]/equip` | Equip cosmetic |
| GET | `/api/gems/balance` | Current gem balance |
| POST | `/api/gems/purchase` | Buy gems (Stripe integration) |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| CosmeticShop | `src/components/shop/CosmeticShop.tsx` | Main shop browse |
| FeaturedItems | `src/components/shop/FeaturedItems.tsx` | Rotating deals |
| CosmeticPreview | `src/components/shop/CosmeticPreview.tsx` | Try before buy |
| GemPurchase | `src/components/shop/GemPurchase.tsx` | Gem bundles UI |
| Wardrobe | `src/components/titan/Wardrobe.tsx` | Equip owned cosmetics |

### State Management

- Gem balance cached client-side, validated server-side on purchase
- Cosmetic catalog cached with 1-hour TTL
- Equipped cosmetics stored in Titan profile

## Dependencies

- [ ] Stripe integration (deferred, see Business Triggers)
- [ ] Titan customization system (shipped)
- [ ] Gold economy (shipped)

## Out of Scope

- Gameplay-affecting items (strictly cosmetic)
- Trading between players
- Cosmetic crafting
- Loot boxes (ethical concern)

## Open Questions

- [ ] Gem pricing structure?
- [ ] Refund policy duration?
- [ ] Guild cosmetic bundles?
