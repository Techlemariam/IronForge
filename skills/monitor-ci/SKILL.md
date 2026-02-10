---
name: monitor-ci
description: "Workflow for monitor-ci"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-ci

This skill executes the **monitor-ci** workflow from .agent/workflows/monitor-ci.md.

## Usage

```
"Run monitor-ci"
```

Or via Discord slash command:
```
/skill monitor-ci
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-ci.md
```

Then follows the steps defined in that file.
