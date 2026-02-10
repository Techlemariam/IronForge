---
name: unit-tests
description: "Workflow for unit-tests"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# unit-tests

This skill executes the **unit-tests** workflow from .agent/workflows/unit-tests.md.

## Usage

```
"Run unit-tests"
```

Or via Discord slash command:
```
/skill unit-tests
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/unit-tests.md
```

Then follows the steps defined in that file.
