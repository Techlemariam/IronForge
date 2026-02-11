---
name: claim-task
description: "Workflow for claim-task"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# claim-task

This skill executes the **claim-task** workflow from .agent/workflows/claim-task.md.

## Usage

```
"Run claim-task"
```

Or via Discord slash command:
```
/skill claim-task
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/claim-task.md
```

Then follows the steps defined in that file.
