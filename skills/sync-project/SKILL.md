---
name: sync-project
description: "Bi-directional sync between GitHub Project and roadmap.md"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# sync-project

This skill executes the **sync-project** workflow from .agent/workflows/sync-project.md.

## Usage

```
"Run sync-project"
```

Or via Discord slash command:
```
/skill sync-project
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/sync-project.md
```

Then follows the steps defined in that file.
