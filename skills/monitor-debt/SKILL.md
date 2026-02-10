---
name: monitor-debt
description: "Workflow for monitor-debt"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-debt

This skill executes the **monitor-debt** workflow from .agent/workflows/monitor-debt.md.

## Usage

```
"Run monitor-debt"
```

Or via Discord slash command:
```
/skill monitor-debt
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-debt.md
```

Then follows the steps defined in that file.
