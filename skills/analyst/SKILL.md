---
name: analyst
description: "Workflow for analyst"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# analyst

This skill executes the **analyst** workflow from .agent/workflows/analyst.md.

## Usage

```
"Run analyst"
```

Or via Discord slash command:
```
/skill analyst
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/analyst.md
```

Then follows the steps defined in that file.
