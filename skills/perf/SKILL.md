---
name: perf
description: "Workflow for perf"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# perf

This skill executes the **perf** workflow from .agent/workflows/perf.md.

## Usage

```
"Run perf"
```

Or via Discord slash command:
```
/skill perf
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/perf.md
```

Then follows the steps defined in that file.
