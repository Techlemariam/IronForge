---
name: idea
description: "Workflow for idea"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# idea

This skill executes the **idea** workflow from .agent/workflows/idea.md.

## Usage

```
"Run idea"
```

Or via Discord slash command:
```
/skill idea
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/idea.md
```

Then follows the steps defined in that file.
