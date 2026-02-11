---
name: monitor-strategy
description: "Workflow for monitor-strategy"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-strategy

This skill executes the **monitor-strategy** workflow from .agent/workflows/monitor-strategy.md.

## Usage

```
"Run monitor-strategy"
```

Or via Discord slash command:
```
/skill monitor-strategy
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-strategy.md
```

Then follows the steps defined in that file.
