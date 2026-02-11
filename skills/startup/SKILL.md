---
name: startup
description: "Workflow for startup"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# startup

This skill executes the **startup** workflow from .agent/workflows/startup.md.

## Usage

```
"Run startup"
```

Or via Discord slash command:
```
/skill startup
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/startup.md
```

Then follows the steps defined in that file.
