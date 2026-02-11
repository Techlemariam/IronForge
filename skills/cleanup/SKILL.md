---
name: cleanup
description: "Workflow for cleanup"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# cleanup

This skill executes the **cleanup** workflow from .agent/workflows/cleanup.md.

## Usage

```
"Run cleanup"
```

Or via Discord slash command:
```
/skill cleanup
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/cleanup.md
```

Then follows the steps defined in that file.
