---
name: monitor-all
description: "Centralized system health monitoring"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-all

This skill executes the **monitor-all** workflow from .agent/workflows/monitor-all.md.

## Usage

```
"Run monitor-all"
```

Or via Discord slash command:
```
/skill monitor-all
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-all.md
```

Then follows the steps defined in that file.
