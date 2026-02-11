---
name: monitor-bio
description: "Workflow for monitor-bio"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-bio

This skill executes the **monitor-bio** workflow from .agent/workflows/monitor-bio.md.

## Usage

```
"Run monitor-bio"
```

Or via Discord slash command:
```
/skill monitor-bio
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-bio.md
```

Then follows the steps defined in that file.
