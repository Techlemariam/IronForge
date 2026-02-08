---
name: api-mocker
description: Mock server generation for isolated testing
version: 1.0.0
category: testing
owner: "@qa"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/lib/api/
    - tests/mocks/
  references:
    - vitest.config.ts
---

# 🎭 API Mocker

Generate mock servers and fixtures for testing.

## Capabilities

- **MSW Integration**: Mock Service Worker setup
- **Fixture Generation**: Create test data
- **Response Recording**: Capture real API responses

## Setup

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Test' });
  }),
];
```

## Integration

- `qa.md`: Test isolation
- `unit-tests.md`: Mock external APIs
