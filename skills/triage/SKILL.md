---
name: triage
description: "Workflow for triage"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# triage

This skill executes the **triage** workflow from .agent/workflows/triage.md.

## Usage

```
"Run triage"
```

Or via Discord slash command:
```
/skill triage
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/triage.md
```

Then follows the steps defined in that file.
