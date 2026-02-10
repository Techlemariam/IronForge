---
name: health-check
description: "Workflow for health-check"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# health-check

This skill executes the **health-check** workflow from .agent/workflows/health-check.md.

## Usage

```
"Run health-check"
```

Or via Discord slash command:
```
/skill health-check
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/health-check.md
```

Then follows the steps defined in that file.
