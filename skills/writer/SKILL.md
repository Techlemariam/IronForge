---
name: writer
description: "Workflow for writer"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# writer

This skill executes the **writer** workflow from .agent/workflows/writer.md.

## Usage

```
"Run writer"
```

Or via Discord slash command:
```
/skill writer
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/writer.md
```

Then follows the steps defined in that file.
