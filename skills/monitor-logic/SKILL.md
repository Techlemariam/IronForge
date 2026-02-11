---
name: monitor-logic
description: "Workflow for monitor-logic"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-logic

This skill executes the **monitor-logic** workflow from .agent/workflows/monitor-logic.md.

## Usage

```
"Run monitor-logic"
```

Or via Discord slash command:
```
/skill monitor-logic
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-logic.md
```

Then follows the steps defined in that file.
