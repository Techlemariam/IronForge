---
name: spec
description: "Auto-generate specification documents for roadmap items"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# spec

This skill executes the **spec** workflow from .agent/workflows/spec.md.

## Usage

```
"Run spec"
```

Or via Discord slash command:
```
/skill spec
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/spec.md
```

Then follows the steps defined in that file.
