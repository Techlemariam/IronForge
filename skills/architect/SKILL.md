---
name: architect
description: "Workflow for architect"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# architect

This skill executes the **architect** workflow from .agent/workflows/architect.md.

## Usage

```
"Run architect"
```

Or via Discord slash command:
```
/skill architect
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/architect.md
```

Then follows the steps defined in that file.
