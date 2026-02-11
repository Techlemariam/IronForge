---
name: monitor-game
description: "Workflow for monitor-game"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-game

This skill executes the **monitor-game** workflow from .agent/workflows/monitor-game.md.

## Usage

```
"Run monitor-game"
```

Or via Discord slash command:
```
/skill monitor-game
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-game.md
```

Then follows the steps defined in that file.
