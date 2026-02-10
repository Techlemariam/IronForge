---
name: strategist
description: "Workflow for strategist"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# strategist

This skill executes the **strategist** workflow from .agent/workflows/strategist.md.

## Usage

```
"Run strategist"
```

Or via Discord slash command:
```
/skill strategist
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/strategist.md
```

Then follows the steps defined in that file.
