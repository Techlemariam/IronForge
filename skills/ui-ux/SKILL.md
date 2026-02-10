---
name: ui-ux
description: "Workflow for ui-ux"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# ui-ux

This skill executes the **ui-ux** workflow from .agent/workflows/ui-ux.md.

## Usage

```
"Run ui-ux"
```

Or via Discord slash command:
```
/skill ui-ux
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/ui-ux.md
```

Then follows the steps defined in that file.
