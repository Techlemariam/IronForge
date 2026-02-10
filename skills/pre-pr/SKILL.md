---
name: pre-pr
description: "Complete pre-PR validation and automatic PR creation"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# pre-pr

This skill executes the **pre-pr** workflow from .agent/workflows/pre-pr.md.

## Usage

```
"Run pre-pr"
```

Or via Discord slash command:
```
/skill pre-pr
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/pre-pr.md
```

Then follows the steps defined in that file.
