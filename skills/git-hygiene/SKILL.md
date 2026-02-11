---
name: git-hygiene
description: "Diagnose and fix git health issues like merge-loops and stale branches"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# git-hygiene

This skill executes the **git-hygiene** workflow from .agent/workflows/git-hygiene.md.

## Usage

```
"Run git-hygiene"
```

Or via Discord slash command:
```
/skill git-hygiene
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/git-hygiene.md
```

Then follows the steps defined in that file.
