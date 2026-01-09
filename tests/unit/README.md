# Unit Test Structure

## Directory Mapping

Unit tests **MUST** mirror the `src/` directory structure exactly.

### Pattern

```
src/actions/[domain]/[file].ts  →  tests/unit/actions/[domain]/[file].test.ts
src/services/[file].ts          →  tests/unit/services/[file].test.ts
src/features/[feature]/[file].ts →  tests/unit/features/[feature]/[file].test.ts
src/lib/[file].ts               →  tests/unit/lib/[file].test.ts
```

### Examples

| Source File | Test File |
|-------------|-----------|
| `src/actions/pvp/duel.ts` | `tests/unit/actions/pvp/duel.test.ts` |
| `src/services/OracleService.ts` | `tests/unit/services/OracleService.test.ts` |
| `src/features/training/logic/buffs.ts` | `tests/unit/features/training/logic/buffs.test.ts` |
| `src/lib/wilks.ts` | `tests/unit/lib/wilks.test.ts` |

## Rules

1. **No tests in `src/`**: All test files belong in `tests/unit/`
2. **Mirror structure**: Subdirectories must match exactly
3. **Naming convention**: `[filename].test.ts` or `[filename].test.tsx`
4. **One-to-one mapping**: Each source file should have a corresponding test file

## Running Tests

```bash
# All unit tests
npm test

# Specific file
npm test -- OracleService

# Watch mode
npm test -- --watch
```

## Coverage

```bash
npm run test:coverage
```

Target: 80% coverage for services and actions.
