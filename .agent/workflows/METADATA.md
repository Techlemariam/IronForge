# Workflow Metadata Schema

## Overview

All workflows in `.agent/workflows/` should follow a standardized YAML frontmatter format to enable automation, analytics, and dependency tracking.

## Standard Metadata Template

```yaml
---
# Required Fields
description: "Brief one-line description of workflow purpose"
command: "/workflow-name"
category: "planning|execution|verification|deployment|monitoring|utility|meta"
trigger: "manual|scheduled|auto"
version: "1.0.0"

# Optional Fields
dependencies: ["/prerequisite-workflow"]
avg_duration_seconds: 120
success_rate_target: 95
rollback_strategy: "git_reset|none|custom"
telemetry: "enabled|disabled"
turbo_enabled: true
requires_review: false

# Agent Context
primary_agent: "@architect|@coder|@qa|@manager|etc"
domain: "infra|game|sprint|qa|bio|business|api|meta"
---
```

## Field Definitions

### Required Fields

#### `description`

- **Type**: String
- **Purpose**: One-line summary of workflow's purpose
- **Example**: `"End-to-end feature pipeline from idea to tested code"`

#### `command`

- **Type**: String
- **Purpose**: Slash command to invoke workflow
- **Format**: `/workflow-name` (lowercase, hyphens)
- **Example**: `"/feature"`

#### `category`

- **Type**: Enum
- **Values**:
  - `planning` - Requirements, design, architecture
  - `execution` - Implementation, coding, building
  - `verification` - Testing, QA, validation
  - `deployment` - Release, deployment, rollback
  - `monitoring` - Health checks, metrics, audits
  - `utility` - Tools, helpers, formatters
  - `meta` - Workflow management, self-improvement
- **Purpose**: Groups workflows by lifecycle stage

#### `trigger`

- **Type**: Enum
- **Values**:
  - `manual` - User-invoked only
  - `scheduled` - Runs on schedule (cron)
  - `auto` - Triggered automatically (e.g., session start)
- **Purpose**: Defines invocation pattern

#### `version`

- **Type**: Semver string (`X.Y.Z`)
- **Purpose**: Tracks workflow evolution
- **Increment Rules**:
  - MAJOR (X): Breaking changes to arguments/behavior
  - MINOR (Y): New features, backward-compatible
  - PATCH (Z): Bug fixes, clarifications

### Optional Fields

#### `dependencies`

- **Type**: Array of strings
- **Purpose**: Lists workflows that should run before this one
- **Example**: `["/architect", "/claim-task"]`

#### `avg_duration_seconds`

- **Type**: Integer
- **Purpose**: Expected execution time (for scheduling/alerts)
- **Default**: `null` (unknown)

#### `success_rate_target`

- **Type**: Integer (0-100)
- **Purpose**: Target success percentage for monitoring
- **Default**: `95`

#### `rollback_strategy`

- **Type**: Enum
- **Values**:
  - `git_reset` - Revert Git changes
  - `none` - No automated rollback
  - `custom` - See workflow documentation
- **Default**: `none`

#### `telemetry`

- **Type**: Enum
- **Values**: `enabled` | `disabled`
- **Purpose**: Whether to log execution metrics
- **Default**: `enabled`

#### `turbo_enabled`

- **Type**: Boolean
- **Purpose**: Whether workflow contains `// turbo` annotations for auto-run
-**Default**: `false`

#### `requires_review`

- **Type**: Boolean
- **Purpose**: Whether workflow output needs user approval before proceeding
- **Default**: `false`

#### `primary_agent`

- **Type**: String
- **Purpose**: Primary agent persona for this workflow
- **Format**: `@agent-name` (from GEMINI.md)
- **Example**: `"@architect"`

#### `domain`

- **Type**: Enum
- **Values**: `infra|game|sprint|qa|bio|business|api|meta`
- **Purpose**: Primary domain this workflow operates in

## Category Assignments

### Planning

- `/idea`, `/analyst`, `/architect`, `/feature`, `/domain-session`

### Execution

- `/coder`, `/cleanup`, `/infrastructure`, `/ui-ux`, `/schema`

### Verification

- `/qa`, `/unit-tests`, `/gatekeeper`, `/pre-deploy`, `/stresstests`

### Deployment

- `/deploy`, `/schema` (data migrations)

### Monitoring

- `/monitor-ci`, `/monitor-tests`, `/monitor-db`, `/monitor-bio`, `/monitor-logic`, `/monitor-game`, `/monitor-deploy`, `/monitor-growth`

### Utility

- `/debug`, `/polish`, `/perf`, `/security`, `/triage`, `/claim-task`, `/switch-branch`, `/health-check`

### Meta

- `/startup`, `/manager`, `/evolve`, `/librarian`, `/night-shift`

## Versioning Guidelines

### Version History Format

Add to bottom of each workflow file:

```markdown
## Version History

### 2.1.0 (2026-01-08)
- Added branch validation to Step 3.2
- Enhanced error messaging

### 2.0.0 (2026-01-05)
- BREAKING: Changed argument format from [task-id] to [prefix]/[task-id]
- Added conflict detection

### 1.0.0 (2026-01-01)
- Initial stable release
```

## Migration Plan

To add metadata to existing workflows:

1. **Audit Current State**

   ```bash
   # Count workflows without proper frontmatter
   grep -L "^version:" .agent/workflows/*.md
   ```

2. **Add Metadata Incrementally**
   - Start with high-use workflows (`/coder`, `/qa`, `/gatekeeper`)
   - Add `version: "1.0.0"` as baseline
   - Estimate `avg_duration_seconds` from experience

3. **Validate Metadata**

   ```bash
   # Check all workflows have required fields
   for file in .agent/workflows/*.md; do
     if ! grep -q "^description:" "$file"; then
       echo "Missing description: $file"
     fi
   done
   ```

## Tooling

### Future: Metadata Linter

```bash
# Planned: /validate-workflows
# Checks all frontmatter for:
# - Required fields present
# - Valid enum values
# - Dependency cycles
# - Version format
```

### Future: Dependency Visualizer

```bash
# Planned: Integration with GRAPH.md
# Auto-generates dependency graph from metadata
```

## Best Practices

1. **Keep descriptions concise** - One line max
2. **Increment versions semantically** - Follow semver strictly
3. **Document breaking changes** - In version history
4. **Set realistic success targets** - Based on actual metrics
5. **Update avg_duration** - After 10+ runs
6. **Link dependencies explicitly** - For GRAPH.md integration

## Example: Well-Formatted Workflow

```markdown
---
description: "End-to-end feature pipeline from idea to tested code"
command: "/feature"
category: "planning"
trigger: "manual"
version: "2.1.0"
dependencies: ["/claim-task", "/architect"]
avg_duration_seconds: 420
success_rate_target: 92
rollback_strategy: "git_reset"
telemetry: "enabled"
turbo_enabled: false
requires_review: true
primary_agent: "@architect"
domain: "sprint"
---

# Feature Workflow

[... content ...]

## Version History

### 2.1.0 (2026-01-08)
- Added rebase check before starting work

### 2.0.0 (2026-01-05)
- BREAKING: Now requires `/claim-task` before execution

### 1.0.0 (2026-01-01)
- Initial stable release
```
