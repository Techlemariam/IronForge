---
template_id: "UNIT-TESTS"
workflow: "/unit-tests"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "1-2"
branch_prefix: "test/unit"
---

# Jules Template: /unit-tests

## Task

Write a comprehensive Vitest unit test suite for an existing module in the IronForge codebase.

## Context

IronForge is a Next.js 15 + TypeScript gamification platform using:

- **Test framework**: Vitest
- **Test location**: `tests/unit/` (mirror `src/` structure)
- **Mocking**: `vi.mock()` for external deps, `vi.fn()` for functions
- **Coverage**: Target 80%+ branch coverage for the target module

## Target Module

> **FILL IN** before dispatching:

- **Source file**: `[TARGET_SOURCE_FILE]` (e.g., `src/lib/services/XpService.ts`)
- **Test output file**: `[TARGET_TEST_FILE]` (e.g., `tests/unit/lib/services/XpService.test.ts`)

## Pre-Task: Read Source File

1. Read `[TARGET_SOURCE_FILE]` completely
2. Identify all exported functions, classes, and types
3. Find any existing test file (if it exists, extend rather than replace)
4. Look for similar test files in `tests/unit/` for patterns reference

## Test Requirements

Write tests covering:

### Happy Path

- All public functions with valid inputs
- Expected return values and side effects
- Correct data transformations

### Error Cases

- Invalid inputs (null, undefined, empty strings, out-of-range values)
- Thrown exceptions — verify error messages
- Edge cases near boundaries

### Mocking

- Mock Prisma calls using `vi.mock('@/lib/prisma')`
- Mock external API calls
- Mock Next.js specific APIs if needed (`next/navigation`, `next/headers`)
- Use `vi.resetAllMocks()` in `beforeEach`

## Acceptance Criteria

- [ ] Test file created at correct location following `tests/unit/` mirror structure
- [ ] All exported functions have at least 1 happy path test
- [ ] All error conditions tested
- [ ] No tests importing from other test files
- [ ] `pnpm test [TARGET_TEST_FILE]` exits 0
- [ ] `pnpm test --coverage` shows ≥ 70% branch coverage for target module
- [ ] No `any` in test code

## Test File Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// import { functionName } from '@/[path]'

vi.mock('@/lib/prisma', () => ({
  default: {
    // mock shape
  },
}))

describe('[ModuleName]', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('[functionName]', () => {
    it('should [expected behavior] when [condition]', async () => {
      // arrange
      // act
      // assert
    })

    it('should throw [ErrorType] when [invalid condition]', async () => {
      // ...
    })
  })
})
```

## Constraints

- Write tests in `tests/unit/` only — do NOT modify source files
- Do NOT add `console.log` in tests — use `expect` assertions
- Do NOT write integration tests that hit real database or network
- Max 2 files: the test file + optionally a test fixture/helper file

## Branch Naming

```
test/unit-[module-name]
```

Example: `test/unit-xp-service`

## Verification Steps

```bash
pnpm test tests/unit/[path-to-test]
pnpm typecheck
```

## PR Template

```
test: add unit tests for [ModuleName]

Coverage for [TARGET_SOURCE_FILE]:
- [N] test cases across [N] describe blocks
- Happy path, error cases, and edge cases covered
- Coverage: ~[N]% branch coverage

🤖 Dispatched by Jules via /unit-tests template
```
