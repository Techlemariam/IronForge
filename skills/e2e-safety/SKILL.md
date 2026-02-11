---
name: e2e-safety
description: "Workflow for e2e-safety"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# e2e-safety

This skill executes the **e2e-safety** workflow from .agent/workflows/e2e-safety.md.

## Usage

```
"Run e2e-safety"
```

Or via Discord slash command:
```
/skill e2e-safety
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/e2e-safety.md
```

Then follows the steps defined in that file.
