---
name: manager
description: "Workflow for manager"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# manager

This skill executes the **manager** workflow from .agent/workflows/manager.md.

## Usage

```
"Run manager"
```

Or via Discord slash command:
```
/skill manager
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/manager.md
```

Then follows the steps defined in that file.
