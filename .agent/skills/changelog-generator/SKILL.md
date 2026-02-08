---
name: changelog-generator
description: Automated CHANGELOG.md from conventional commits
version: 1.0.0
category: documentation
owner: "@librarian"
platforms: ["windows", "linux", "macos"]
requires: ["doc-generator"]
context:
  primarySources:
    - CHANGELOG.md
  references:
    - .git/
---

# 📝 Changelog Generator

Auto-generate CHANGELOG from git history.

## Conventional Commits

| Prefix | Section |
|:-------|:--------|
| `feat:` | ✨ Features |
| `fix:` | 🐛 Bug Fixes |
| `docs:` | 📚 Documentation |
| `perf:` | ⚡ Performance |
| `refactor:` | ♻️ Refactoring |

## Command

```powershell
# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

## Integration

- `librarian.md`: Documentation updates
- `pre-pr.md`: Validate commit format
