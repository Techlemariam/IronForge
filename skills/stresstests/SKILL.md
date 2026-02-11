---
name: stresstests
description: "Workflow for stresstests"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# stresstests

This skill executes the **stresstests** workflow from .agent/workflows/stresstests.md.

## Usage

```
"Run stresstests"
```

Or via Discord slash command:
```
/skill stresstests
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/stresstests.md
```

Then follows the steps defined in that file.
