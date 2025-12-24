# 📋 Technical Debt Log

> Workarounds och shortcuts som behöver refaktoreras. Cleanup Agent kan använda denna fil för asynkron refactoring.

| Date | File | Issue | Owner | Status |
|:-----|:-----|:------|:------|:-------|
| 2025-12-23 | `src/services/*` | Legacy adapters - ska konverteras till Server Actions (Started: Progression/Hevy) | @architect | In Progress |
| 2025-12-23 | `src/actions/combat.ts` | Prisma Monster type mismatch - fixed with PrismaMonster type | @coder | ✅ Resolved |
| 2025-12-23 | `src/features/game/CombatArena.tsx` | `Equipment` type missing `rarity`/`image` props for `LootReveal` | @coder | ✅ Resolved (was false positive) |

---

## Guidelines

- **Lägg till:** När en agent tvingas göra en workaround p.g.a. tidsbrist
- **Cleanup:** Kör `/coder` med denna fil som input för refaktorering
- **Status:** `Open` → `In Progress` → `Resolved`
