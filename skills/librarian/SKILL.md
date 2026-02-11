---
name: librarian
description: "Workflow for librarian"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# librarian

This skill executes the **librarian** workflow from .agent/workflows/librarian.md.

## Usage

```
"Run librarian"
```

Or via Discord slash command:
```
/skill librarian
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/librarian.md
```

Then follows the steps defined in that file.
