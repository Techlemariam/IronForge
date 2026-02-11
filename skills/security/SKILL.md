---
name: security
description: "Workflow for security"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# security

This skill executes the **security** workflow from .agent/workflows/security.md.

## Usage

```
"Run security"
```

Or via Discord slash command:
```
/skill security
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/security.md
```

Then follows the steps defined in that file.
