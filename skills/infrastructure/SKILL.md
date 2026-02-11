---
name: infrastructure
description: "Workflow for infrastructure"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# infrastructure

This skill executes the **infrastructure** workflow from .agent/workflows/infrastructure.md.

## Usage

```
"Run infrastructure"
```

Or via Discord slash command:
```
/skill infrastructure
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/infrastructure.md
```

Then follows the steps defined in that file.
