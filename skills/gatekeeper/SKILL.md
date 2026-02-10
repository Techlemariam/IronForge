---
name: gatekeeper
description: "Pre-commit quality gate (types, lint, tests)"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# gatekeeper

This skill executes the **gatekeeper** workflow from .agent/workflows/gatekeeper.md.

## Usage

```
"Run gatekeeper"
```

Or via Discord slash command:
```
/skill gatekeeper
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/gatekeeper.md
```

Then follows the steps defined in that file.
