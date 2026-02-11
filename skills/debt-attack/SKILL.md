---
name: debt-attack
description: "Workflow for debt-attack"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# debt-attack

This skill executes the **debt-attack** workflow from .agent/workflows/debt-attack.md.

## Usage

```
"Run debt-attack"
```

Or via Discord slash command:
```
/skill debt-attack
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/debt-attack.md
```

Then follows the steps defined in that file.
