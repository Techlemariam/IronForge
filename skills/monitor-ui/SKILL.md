---
name: monitor-ui
description: "Comprehensive UI Health & Accessibility Audit"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# monitor-ui

This skill executes the **monitor-ui** workflow from .agent/workflows/monitor-ui.md.

## Usage

```
"Run monitor-ui"
```

Or via Discord slash command:
```
/skill monitor-ui
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/monitor-ui.md
```

Then follows the steps defined in that file.
