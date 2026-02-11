---
name: domain-session
description: "Workflow for domain-session"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# domain-session

This skill executes the **domain-session** workflow from .agent/workflows/domain-session.md.

## Usage

```
"Run domain-session"
```

Or via Discord slash command:
```
/skill domain-session
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/domain-session.md
```

Then follows the steps defined in that file.
