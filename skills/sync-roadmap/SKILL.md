---
name: sync-roadmap
description: "Sync roadmap.md items with GitHub Issues"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# sync-roadmap

This skill executes the **sync-roadmap** workflow from .agent/workflows/sync-roadmap.md.

## Usage

```
"Run sync-roadmap"
```

Or via Discord slash command:
```
/skill sync-roadmap
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/sync-roadmap.md
```

Then follows the steps defined in that file.
