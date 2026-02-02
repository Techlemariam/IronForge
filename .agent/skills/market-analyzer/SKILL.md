---
name: market-analyzer
description: Competitive analysis, pricing strategy, and market positioning
version: 1.0.0
category: strategy
owner: "@strategist"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - docs/STRATEGY.md
    - docs/PRICING.md
  references:
    - roadmap.md
  patterns: []
rules:
  - "Analyze competitors monthly"
  - "Track pricing trends in fitness apps"
  - "Identify market gaps"
  - "Validate pricing against value delivered"
---

# 📊 Market Analyzer

Competitive intelligence and strategic positioning.

## Capabilities

- **Competitor Tracking**: Monitor similar apps (Fitbod, Strong, etc.)
- **Pricing Analysis**: Compare subscription tiers
- **Feature Matrix**: Gap analysis vs competitors
- **Trend Detection**: Emerging fitness tech trends

## Competitor Landscape

| Competitor | Pricing | Unique Feature |
|:-----------|:--------|:---------------|
| Fitbod | $13/mo | AI workout generation |
| Strong | $5/mo | Simple, clean UI |
| Hevy | Free/Pro | Social features |
| **IronForge** | TBD | Gamification + Bio-integration |

## Usage

```
@strategist Analyze our pricing vs Fitbod
@strategist What features do competitors lack?
@strategist Identify our unique value proposition
```

## Integration

- **`strategist.md`**: Primary workflow
- **`monitor-strategy.md`**: Monthly reviews
