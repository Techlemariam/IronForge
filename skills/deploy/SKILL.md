---
name: deploy
description: "Workflow for deploy"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# deploy

This skill executes the **deploy** workflow from .agent/workflows/deploy.md.

## Usage

```
"Run deploy"
```

Or via Discord slash command:
```
/skill deploy
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/deploy.md
```

Then follows the steps defined in that file.
