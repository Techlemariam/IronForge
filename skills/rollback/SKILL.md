---
name: rollback
description: "Emergency rollback workflow"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# rollback

This skill executes the **rollback** workflow from .agent/workflows/rollback.md.

## Usage

```
"Run rollback"
```

Or via Discord slash command:
```
/skill rollback
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/rollback.md
```

Then follows the steps defined in that file.
