---
name: feature
description: "Workflow for feature"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# feature

This skill executes the **feature** workflow from .agent/workflows/feature.md.

## Usage

```
"Run feature"
```

Or via Discord slash command:
```
/skill feature
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/feature.md
```

Then follows the steps defined in that file.
