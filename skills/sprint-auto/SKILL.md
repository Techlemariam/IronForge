---
name: sprint-auto
description: "Workflow for sprint-auto"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# sprint-auto

This skill executes the **sprint-auto** workflow from .agent/workflows/sprint-auto.md.

## Usage

```
"Run sprint-auto"
```

Or via Discord slash command:
```
/skill sprint-auto
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/sprint-auto.md
```

Then follows the steps defined in that file.
