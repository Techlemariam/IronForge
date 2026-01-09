# Git Merge Strategy: Sprint 22 & 23 - KOMPLETT ANALYS

**Datum**: 2026-01-09  
**Status**: Alla uncommittade ändringar analyserade

---

## Uncommittade Ändringar (Git Status)

### Staged Changes (Redan i staging)

```
renamed: .agent/sprints/next.md -> .agent/sprints/history/sprint-22.md
renamed: src/services/BudgetCalculator.test.ts -> tests/unit/services/BudgetCalculator.test.ts
renamed: src/services/__tests__/GeminiService.test.ts -> tests/unit/services/GeminiService.test.ts
renamed: src/services/GoalPriorityEngine.test.ts -> tests/unit/services/GoalPriorityEngine.test.ts
renamed: src/services/MobilityAuditor.test.ts -> tests/unit/services/MobilityAuditor.test.ts
renamed: src/services/__tests__/oracle.test.ts -> tests/unit/services/oracle.test.ts
renamed: src/services/__tests__/progression.test.ts -> tests/unit/services/progression.test.ts
renamed: src/services/__tests__/trainingMemoryManager.test.ts -> tests/unit/services/trainingMemoryManager.test.ts
```

**Åtgärd**: Dessa ingår i "Test Infrastructure" branch.

### Modified (Uncommitted)

```
.agent/memory/knowledge-graph.json
.agent/sprints/current.md
.agent/sprints/history/sprint-22.md
.lighthouserc.json
DEBT.md
docs/CONTEXT.md
docs/api-reference.md
prisma/seed.ts
src/app/api/chat/route.ts
src/components/ui/ForgeButton.tsx
src/components/ui/TvHud.tsx
src/features/dashboard/CitadelHub.tsx
tests/unit/services/*.test.ts (7 filer)
```

### Untracked (Nya filer)

```
.agent/docs/
.agent/sprints/history/sprint-21.md
.agent/sprints/next.md
src/actions/territory.ts
src/app/(authenticated)/territories/
src/components/ui/TutorialTooltip.tsx
src/config/
src/features/leaderboard/components/
src/services/OracleService.ts
src/services/TerritoryControlService.ts
tests/unit/README.md
tests/unit/actions/territory.test.ts
tests/unit/services/OracleService.test.ts
tests/unit/services/TerritoryControlService.test.ts
```

---

## UPPDATERAD MERGE-STRATEGI

### Branch 1: chore/test-infrastructure

**Omfattar**:

```bash
# Staged renames
git add tests/unit/services/BudgetCalculator.test.ts
git add tests/unit/services/GeminiService.test.ts
git add tests/unit/services/GoalPriorityEngine.test.ts
git add tests/unit/services/MobilityAuditor.test.ts
git add tests/unit/services/oracle.test.ts
git add tests/unit/services/progression.test.ts
git add tests/unit/services/trainingMemoryManager.test.ts

# New files
git add tests/unit/README.md

# Modified test files (import fixes)
git add tests/unit/services/*.test.ts
```

**Commit**:

```bash
git commit -m "chore: Test infrastructure cleanup

- Move 7 tests from src/ to tests/unit/
- Fix all import paths to use @ aliases
- Create test structure documentation
- All type checks passing"
```

---

### Branch 2: feat/oracle-3.0

**Omfattar**:

```bash
# New service
git add src/services/OracleService.ts

# Modified API route
git add src/app/api/chat/route.ts

# New test
git add tests/unit/services/OracleService.test.ts
```

**Commit**:

```bash
git commit -m "feat: Oracle 3.0 - GPE-grounded AI coach

- Add OracleService bridging GPE and LLM
- Inject deterministic strategy into chat API
- Add unit tests for OracleService"
```

---

### Branch 3: feat/guild-territories

**Omfattar**:

```bash
# Database seeding
git add prisma/seed.ts

# Services
git add src/services/TerritoryControlService.ts

# Actions
git add src/actions/territory.ts

# UI Route
git add src/app/(authenticated)/territories/

# Tests
git add tests/unit/services/TerritoryControlService.test.ts
git add tests/unit/actions/territory.test.ts
```

**Commit**:

```bash
git commit -m "feat: Guild Territories - Conquest system

- Seed 2 WorldRegions and 4 Territories
- Add TerritoryControlService with influence logic
- Create /territories route with TerritoryMap
- Add server actions and unit tests"
```

---

### Branch 4: refactor/leaderboard-hub

**Omfattar**:

```bash
# New components
git add src/features/leaderboard/components/
```

**Commit**:

```bash
git commit -m "refactor: Consolidate leaderboards into unified hub

- Create LeaderboardHub with PvP/Faction/Friends tabs
- Extract shared LeaderboardPlayerCard component
- Unified filters (Global/City)"
```

---

### Branch 5: feat/tutorial-tooltips

**Omfattar**:

```bash
# New component
git add src/components/ui/TutorialTooltip.tsx

# New config
git add src/config/
```

**Commit**:

```bash
git commit -m "feat: Tutorial tooltips for complex mechanics

- Create TutorialTooltip component with dismiss logic
- Add 8 tooltip configs (Dual-Coefficient, Buffs, TSB, etc.)
- LocalStorage persistence for 'Don't show again'"
```

---

### Branch 6: chore/sprint-management (NY!)

**Omfattar**:

```bash
# Sprint files
git add .agent/sprints/current.md
git add .agent/sprints/history/sprint-21.md
git add .agent/sprints/history/sprint-22.md
git add .agent/sprints/next.md

# Documentation
git add .agent/docs/
git add docs/CONTEXT.md
git add docs/api-reference.md
git add DEBT.md

# Knowledge graph
git add .agent/memory/knowledge-graph.json
```

**Commit**:

```bash
git commit -m "chore: Sprint 22 & 23 management updates

- Archive Sprint 21 and Sprint 22
- Update current sprint to Sprint 23
- Create Sprint 24 placeholder
- Update DEBT.md and documentation
- Add Git merge strategy document"
```

---

### Branch 7: chore/ui-polish (NY!)

**Omfattar**:

```bash
# UI component updates
git add src/components/ui/ForgeButton.tsx
git add src/components/ui/TvHud.tsx
git add src/features/dashboard/CitadelHub.tsx

# Lighthouse config
git add .lighthouserc.json
```

**Commit**:

```bash
git commit -m "chore: UI polish and Lighthouse updates

- Update ForgeButton, TvHud, CitadelHub components
- Adjust Lighthouse thresholds"
```

---

## SAKNADE FILER I URSPRUNGLIG STRATEGI

### ❌ Inte täckta i ursprunglig strategi

1. `.agent/sprints/*` - Sprint management filer
2. `.agent/docs/` - Git merge strategy dokument
3. `.agent/memory/knowledge-graph.json` - Kunskapsgraf
4. `docs/CONTEXT.md`, `docs/api-reference.md` - Dokumentation
5. `DEBT.md` - Technical debt log
6. `.lighthouserc.json` - Lighthouse config
7. `src/components/ui/ForgeButton.tsx` - UI component
8. `src/components/ui/TvHud.tsx` - UI component
9. `src/features/dashboard/CitadelHub.tsx` - Dashboard component

### ✅ Lösning: 2 nya branches

- **Branch 6**: `chore/sprint-management` - Sprint och dokumentation
- **Branch 7**: `chore/ui-polish` - UI-komponenter och config

---

## UPPDATERAD MERGE-ORDNING

1. **chore/test-infrastructure** - Inga dependencies
2. **chore/sprint-management** - Inga dependencies
3. **chore/ui-polish** - Inga dependencies
4. **feat/oracle-3.0** - Beror på test-infrastructure
5. **feat/guild-territories** - Beror på test-infrastructure
6. **refactor/leaderboard-hub** - Inga dependencies
7. **feat/tutorial-tooltips** - Inga dependencies

---

## KOMPLETT MERGE-KOMMANDO SEKVENS

```bash
# 1. Test Infrastructure
git checkout -b chore/test-infrastructure
git add tests/unit/
git commit -m "chore: Test infrastructure cleanup"
git checkout main
git merge --no-ff chore/test-infrastructure
git push origin main

# 2. Sprint Management
git checkout -b chore/sprint-management
git add .agent/sprints/ .agent/docs/ .agent/memory/ docs/ DEBT.md
git commit -m "chore: Sprint 22 & 23 management updates"
git checkout main
git merge --no-ff chore/sprint-management
git push origin main

# 3. UI Polish
git checkout -b chore/ui-polish
git add src/components/ui/ src/features/dashboard/ .lighthouserc.json
git commit -m "chore: UI polish and Lighthouse updates"
git checkout main
git merge --no-ff chore/ui-polish
git push origin main

# 4. Oracle 3.0
git checkout -b feat/oracle-3.0
git add src/services/OracleService.ts src/app/api/chat/route.ts tests/unit/services/OracleService.test.ts
git commit -m "feat: Oracle 3.0 - GPE-grounded AI coach"
git checkout main
git merge --no-ff feat/oracle-3.0
git push origin main

# 5. Guild Territories
git checkout -b feat/guild-territories
git add prisma/seed.ts src/services/TerritoryControlService.ts src/actions/territory.ts src/app/(authenticated)/territories/ tests/unit/services/TerritoryControlService.test.ts tests/unit/actions/territory.test.ts
git commit -m "feat: Guild Territories - Conquest system"
git checkout main
git merge --no-ff feat/guild-territories
git push origin main

# 6. Leaderboard Hub
git checkout -b refactor/leaderboard-hub
git add src/features/leaderboard/components/
git commit -m "refactor: Consolidate leaderboards into unified hub"
git checkout main
git merge --no-ff refactor/leaderboard-hub
git push origin main

# 7. Tutorial Tooltips
git checkout -b feat/tutorial-tooltips
git add src/components/ui/TutorialTooltip.tsx src/config/
git commit -m "feat: Tutorial tooltips for complex mechanics"
git checkout main
git merge --no-ff feat/tutorial-tooltips
git push origin main
```

---

## VERIFIERING

Efter varje merge:

```bash
npm run check-types
npm run test
npm run build
```

---

## SAMMANFATTNING

**Totalt 7 branches** (ursprungligen 5):

- ✅ Alla uncommittade ändringar täckta
- ✅ Logisk gruppering per feature
- ✅ Dependency-baserad merge-ordning
- ✅ Inga konflikter förväntas

**Nya branches**:

- `chore/sprint-management` - Sprint och dokumentation
- `chore/ui-polish` - UI-komponenter och config
