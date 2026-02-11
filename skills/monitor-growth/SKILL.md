---
name: monitor-growth
description: "Workflow for monitor-growth"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-growth

This skill executes the **monitor-growth** workflow from .agent/workflows/monitor-growth.md.

## Usage

```
"Run monitor-growth"
```

Or via Discord slash command:
```
/skill monitor-growth
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-growth.md
```

Then follows the steps defined in that file.
