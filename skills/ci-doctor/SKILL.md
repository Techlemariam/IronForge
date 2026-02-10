---
name: ci-doctor
description: "Comprehensive CI failure prevention and resolution (v2.0)"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# ci-doctor

This skill executes the **ci-doctor** workflow from .agent/workflows/ci-doctor.md.

## Usage

```
"Run ci-doctor"
```

Or via Discord slash command:
```
/skill ci-doctor
```

## Implementation

This skill reads and executes the workflow file:

```bash
cat .agent/workflows/ci-doctor.md
```

Then follows the steps defined in that file.
