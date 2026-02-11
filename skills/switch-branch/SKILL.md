---
name: switch-branch
description: "Workflow for switch-branch"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# switch-branch

This skill executes the **switch-branch** workflow from .agent/workflows/switch-branch.md.

## Usage

```
"Run switch-branch"
```

Or via Discord slash command:
```
/skill switch-branch
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/switch-branch.md
```

Then follows the steps defined in that file.
