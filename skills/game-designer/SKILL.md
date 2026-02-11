---
name: game-designer
description: "Workflow for game-designer"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# game-designer

This skill executes the **game-designer** workflow from .agent/workflows/game-designer.md.

## Usage

```
"Run game-designer"
```

Or via Discord slash command:
```
/skill game-designer
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/game-designer.md
```

Then follows the steps defined in that file.
