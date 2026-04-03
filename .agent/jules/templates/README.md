# Jules Templates — Tier 1

Reusabla prompt-paket för Jules async-delegering. Varje template är redo att dispatcha via `/jules-handoff`.

## Hur man använder

```bash
# 1. Kopiera template till pending/
cp .agent/jules/templates/[template].md .agent/jules/pending/[task-id].md

# 2. Fyll i markerade platshållare:
#    - [TARGET_FILE], [DEBT_ID], [FEATURE_NAME], etc.

# 3. Dispatcha via handoff-workflowet
/jules-handoff prompt ".agent/jules/pending/[task-id].md"
```

## Tillgängliga Templates

| Template | Workflow | Uppskattade filer | Branch-prefix |
|:---------|:---------|:------------------|:--------------|
| [cleanup.md](cleanup.md) | `/cleanup` | 1–3 | `chore/cleanup` |
| [debt-attack.md](debt-attack.md) | `/debt-attack` | 1–5 | `fix/debt` |
| [unit-tests.md](unit-tests.md) | `/unit-tests` | 1–2 | `test/unit` |
| [polish.md](polish.md) | `/polish` | hela codebase (lint) | `chore/polish` |
| [autonomous-gardener.md](autonomous-gardener.md) | `/autonomous-gardener` | 3–8 docs | `docs/garden` |
| [spec.md](spec.md) | `/spec` | 2 | `docs/spec` |

## Scope Guard (gäller alla templates)

Jules AVBRYTER automatiskt om task berör:

- `prisma/migrations` — DB-migrationer
- `src/lib/auth` — authentication
- `.github/workflows` — CI/CD
- `docker-compose*` — infrastruktur
- Mer än 5 filer i fler än 2 kataloger

## Placeholders att fylla i

Templates med `[FILL IN]`-markeringar kräver manuell preparation:

| Template | Kräver input |
|:---------|:-------------|
| `cleanup.md` | `[TARGET_FILE]` |
| `debt-attack.md` | `[DEBT_ID]` |
| `unit-tests.md` | `[TARGET_SOURCE_FILE]`, `[TARGET_TEST_FILE]` |
| `polish.md` | Inga — helt autonomt |
| `autonomous-gardener.md` | Inga — helt autonomt |
| `spec.md` | `[FEATURE_NAME]`, `[FEATURE_ID]`, `[DESCRIPTION]` |
