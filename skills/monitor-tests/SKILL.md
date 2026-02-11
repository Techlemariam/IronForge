---
name: monitor-tests
description: "Workflow for monitor-tests"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-tests

This skill executes the **monitor-tests** workflow from .agent/workflows/monitor-tests.md.

## Usage

```
"Run monitor-tests"
```

Or via Discord slash command:
```
/skill monitor-tests
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-tests.md
```

Then follows the steps defined in that file.
