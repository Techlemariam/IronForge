---
name: coder
description: "Workflow for coder"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# coder

This skill executes the **coder** workflow from .agent/workflows/coder.md.

## Usage

```
"Run coder"
```

Or via Discord slash command:
```
/skill coder
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/coder.md
```

Then follows the steps defined in that file.
