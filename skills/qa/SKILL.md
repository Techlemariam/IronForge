---
name: qa
description: "Workflow for qa"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# qa

This skill executes the **qa** workflow from .agent/workflows/qa.md.

## Usage

```
"Run qa"
```

Or via Discord slash command:
```
/skill qa
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/qa.md
```

Then follows the steps defined in that file.
