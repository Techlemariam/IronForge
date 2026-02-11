---
name: debug
description: "Workflow for debug"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# debug

This skill executes the **debug** workflow from .agent/workflows/debug.md.

## Usage

```
"Run debug"
```

Or via Discord slash command:
```
/skill debug
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/debug.md
```

Then follows the steps defined in that file.
