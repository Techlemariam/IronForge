---
name: platform
description: "Workflow for platform"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# platform

This skill executes the **platform** workflow from .agent/workflows/platform.md.

## Usage

```
"Run platform"
```

Or via Discord slash command:
```
/skill platform
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/platform.md
```

Then follows the steps defined in that file.
