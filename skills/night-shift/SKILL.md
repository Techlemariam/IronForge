---
name: night-shift
description: "Autonomous nightly maintenance workflow"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# night-shift

This skill executes the **night-shift** workflow from .agent/workflows/night-shift.md.

## Usage

```
"Run night-shift"
```

Or via Discord slash command:
```
/skill night-shift
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/night-shift.md
```

Then follows the steps defined in that file.
