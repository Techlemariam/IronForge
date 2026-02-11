---
name: schema
description: "Workflow for schema"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# schema

This skill executes the **schema** workflow from .agent/workflows/schema.md.

## Usage

```
"Run schema"
```

Or via Discord slash command:
```
/skill schema
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/schema.md
```

Then follows the steps defined in that file.
