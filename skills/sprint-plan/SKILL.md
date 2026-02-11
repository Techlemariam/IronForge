---
name: sprint-plan
description: "Workflow for sprint-plan"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# sprint-plan

This skill executes the **sprint-plan** workflow from .agent/workflows/sprint-plan.md.

## Usage

```
"Run sprint-plan"
```

Or via Discord slash command:
```
/skill sprint-plan
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/sprint-plan.md
```

Then follows the steps defined in that file.
