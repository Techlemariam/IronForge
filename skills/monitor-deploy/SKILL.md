---
name: monitor-deploy
description: "Workflow for monitor-deploy"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-deploy

This skill executes the **monitor-deploy** workflow from .agent/workflows/monitor-deploy.md.

## Usage

```
"Run monitor-deploy"
```

Or via Discord slash command:
```
/skill monitor-deploy
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-deploy.md
```

Then follows the steps defined in that file.
