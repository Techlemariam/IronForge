---
name: linter-fixer
description: Auto-fix ESLint, Prettier, and import organization
version: 1.0.0
category: code-quality
owner: "@polish"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - .eslintrc.json
    - prettier.config.js
  references:
    - package.json
  patterns:
    - src/**/*.ts
    - src/**/*.tsx
rules:
  - "Run ESLint fix before committing"
  - "Organize imports alphabetically"
  - "Remove unused imports"
  - "Apply consistent formatting"
---

# ✨ Linter Fixer

Automated code cleanup and formatting.

## Capabilities

- **ESLint Auto-fix**: `npm run lint -- --fix`
- **Prettier Format**: `npx prettier --write`
- **Import Sorting**: Organize imports by type
- **Dead Code Detection**: Find unused exports

## Usage

```powershell
# Fix all lint errors
npm run lint -- --fix

# Format specific file
npx prettier --write src/components/ui/Button.tsx

# Check for unused exports
npx ts-prune
```

## Integration

- **`polish.md`**: Primary workflow
- **`pre-pr.md`**: Pre-commit checks
- **`gatekeeper`**: Quality gate
