---
description: Schema definition for workflow metadata
---

# Workflow Metadata Schema

> **Standard 1.0.0**

All workflow files in `.agent/workflows/*.md` must contain a YAML frontmatter block with the following schema.

## Schema Definition

```yaml
---
description: "Brief summary of what this workflow does"
command: "/command-name"
category: "persona|execution|monitoring|meta|utility|planning|verification|deployment"
trigger: "manual|auto|scheduled"
version: "1.0.0"
telemetry: "enabled|disabled"
primary_agent: "@agent-name"
domain: "core|game|bio|auth|meta|monitoring|database|infrastructure|qa"
---
```

## Field Reference

| Field           | Required | Description                        | Allowed Values                                                                                    |
| :-------------- | :------- | :--------------------------------- | :------------------------------------------------------------------------------------------------ |
| `description`   | Yes      | 1-line summary used in help menus. | String (quoted)                                                                                   |
| `command`       | Yes      | The slash command to invoke.       | `/name`                                                                                           |
| `category`      | Yes      | Classification for reporting.      | `persona`, `execution`, `monitoring`, `meta`, `utility`, `planning`, `verification`, `deployment` |
| `trigger`       | Yes      | How it starts.                     | `manual`, `auto`, `scheduled`                                                                     |
| `version`       | Yes      | Semantic versioning.               | `x.y.z`                                                                                           |
| `telemetry`     | Yes      | Whether metrics are logged.        | `enabled`, `disabled`                                                                             |
| `primary_agent` | Yes      | The owning agent/role.             | `@agent`, `@manager`, etc.                                                                        |
| `domain`        | Yes      | Functional area.                   | `core`, `game`, `bio`, `auth`, `meta`, `monitoring`, `database`, `infra`, `qa`                    |

## Migration Rules

1. **H1 Heading**: The first line after frontmatter MUST be a Level 1 Heading (e.g. `# Workflow Name`).
2. **No Code Fences**: Frontmatter must be at the very top, not inside \`\`\` code blocks.
3. **Filenames**: Must match the command name (e.g. `/coder` -> `coder.md`).
