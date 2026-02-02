---
name: issue-template-validator
description: Validate GitHub issue templates are properly filled
version: 1.0.0
category: project-management
owner: "@manager"
platforms: ["windows", "linux", "macos"]
context:
  primarySources:
    - .github/ISSUE_TEMPLATE/
  references:
    - .github/release.yml
---

# 📋 Issue Template Validator

Ensures issues follow templates correctly.

## Templates

| Template | Required Fields |
|:---------|:----------------|
| Bug Report | Steps, Expected, Actual |
| Feature Request | Problem, Solution, Alternatives |
| Task | Acceptance Criteria |

## Validation Rules

1. Title follows convention: `[TYPE]: Description`
2. All required sections filled
3. Labels applied correctly
4. Milestone assigned (if applicable)

## Auto-Triage

```yaml
# Poor issue → Request more info
if missing_sections:
  add_label("needs-info")
  comment("Please fill in...")

# Good issue → Ready for work
if complete:
  add_label("ready")
```

## Integration

- `triage.md`: Issue processing
- `manager.md`: Sprint planning
