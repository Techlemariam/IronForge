---
name: zod-schema-validator
description: Validates Zod schemas against API responses and forms
version: 1.0.0
category: security
owner: "@security"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/schemas/
    - src/types/
  references:
    - src/app/api/
  patterns:
    - "*.schema.ts"
rules:
  - "All API endpoints must have input/output validation"
  - "Form schemas must match backend requirements"
  - "Use strict mode for critical data"
edgeCases:
  - "Circular dependencies in schemas"
  - "Transformations affecting types"
---

# 🛡️ Zod Schema Validator

Ensures type safety and data integrity across the full stack using Zod.

## Capabilities

- **Schema Audit**: Find API routes missing validation
- **Type Sync**: Verify Zod schemas match TypeScript interfaces
- **Form Generation**: Scaffold React Hook Form from Zod schema
- **Runtime Check**: Simulate payloads to test validation logic

## Usage

```powershell
# Audit all schemas
pwsh .agent/skills/zod-schema-validator/scripts/audit-schemas.ps1

# Generate form component
@zod Create a form for 'UserProfileSchema'
```

## Integration

- **`security` workflow**: Validates input sanitization
- **`coder` agent**: Scaffolds robust forms
