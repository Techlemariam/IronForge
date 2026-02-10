---
name: polish
description: "Workflow for polish"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# polish

This skill executes the **polish** workflow from .agent/workflows/polish.md.

## Usage

```
"Run polish"
```

Or via Discord slash command:
```
/skill polish
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/polish.md
```

Then follows the steps defined in that file.
