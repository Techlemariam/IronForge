---
name: doc-generator
description: Auto-generate documentation from code and maintain knowledge graph
version: 1.0.0
category: documentation
owner: "@librarian"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/
    - docs/
  references:
    - ARCHITECTURE.md
    - README.md
  patterns:
    - "*.md"
    - "*.ts"
rules:
  - "Keep docs in sync with code"
  - "Generate JSDoc from function signatures"
  - "Maintain API documentation"
  - "Update ARCHITECTURE.md on structural changes"
---

# 📚 Doc Generator

Automated documentation generation and maintenance.

## Capabilities

- **JSDoc Generation**: Create docs from TypeScript signatures
- **API Documentation**: Document all endpoints
- **Changelog Updates**: Track changes automatically
- **Graph Maintenance**: Keep codebase knowledge graph current

## Usage

```powershell
# Generate docs for a module
@librarian Document src/services/game/

# Update API docs
@librarian Refresh API documentation

# Check doc coverage
@librarian What functions are undocumented?
```

## Integration

- **`librarian.md`**: Primary workflow
- **`evolve.md`**: Architecture documentation
