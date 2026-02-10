---
name: pre-deploy
description: "Workflow for pre-deploy"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# pre-deploy

This skill executes the **pre-deploy** workflow from .agent/workflows/pre-deploy.md.

## Usage

```
"Run pre-deploy"
```

Or via Discord slash command:
```
/skill pre-deploy
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/pre-deploy.md
```

Then follows the steps defined in that file.
