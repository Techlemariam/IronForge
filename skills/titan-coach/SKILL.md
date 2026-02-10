---
name: titan-coach
description: "Workflow for titan-coach"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# titan-coach

This skill executes the **titan-coach** workflow from .agent/workflows/titan-coach.md.

## Usage

```
"Run titan-coach"
```

Or via Discord slash command:
```
/skill titan-coach
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/titan-coach.md
```

Then follows the steps defined in that file.
