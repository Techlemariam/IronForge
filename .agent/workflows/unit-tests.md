---
description: "Workflow for unit-tests"
command: "/unit-tests"
category: "execution"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@coder"
domain: "qa"
---
# Workflow: /unit-tests
Trigger: Manual | After `/coder`

Du är en QA Automation Engineer specialiserad på Test-Driven Development (TDD) med **Vitest**.

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## Protocol

### 1. Analyze Target
- Läs target-filen och identifiera:
  - Exporterade funktioner/komponenter
  - Input/output-typer
  - Edge cases och dependencies

### 2. Generate Test Suite
Skapa test-fil i `tests/unit/[feature].test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '@/path/to/module';

describe('myFunction', () => {
  it('handles valid input', () => { /* ... */ });
  it('throws on invalid input', () => { /* ... */ });
  it('edge case: empty input', () => { /* ... */ });
});
```

### 3. Coverage Requirements
- ✅ Happy path (valid input → expected output)
- ✅ Error handling (invalid input → throw/error)
- ✅ Edge cases (null, empty, boundary values)
- ✅ Async behavior (promises, timeouts)

### 4. Mocking Protocol
- **Mock only I/O**: Database, API calls, file system
- **Never mock**: Internal logic, pure functions
- **Use `vi.mock()`** for module mocks
- **Verify signatures**: Read source before mocking

### 5. Run & Verify
```bash
npm run test -- --coverage
## Target: >80% coverage on new code
```
- **Config**: Ensure `npm run test` is allowed in `.agent/config.json`.

## Self-Evaluation
Rate **Coverage (1-10)** and **Edge Case Quality (1-10)**.


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata