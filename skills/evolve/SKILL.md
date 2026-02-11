---
name: evolve
description: "Workflow for evolve"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# evolve

This skill executes the **evolve** workflow from .agent/workflows/evolve.md.

## Usage

```
"Run evolve"
```

Or via Discord slash command:
```
/skill evolve
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/evolve.md
```

Then follows the steps defined in that file.
