# GitHub Project Helper Scripts

This directory contains PowerShell scripts for automating GitHub Project integration.

## Scripts

### `link-pr-to-project.ps1`

Links a Pull Request to GitHub Project #4 and sets its status.

```powershell
# Auto-detect PR from current branch
.\link-pr-to-project.ps1

# Specify PR number and status
.\link-pr-to-project.ps1 -PRNumber 42 -Status "in_review"

# Dry run (show what would happen)
.\link-pr-to-project.ps1 -WhatIf
```

**Parameters:**

- `-PRNumber` (optional): GitHub PR number. Auto-detected if not specified.
- `-Status` (optional): Status to set. Default: `in_review`. Options: `backlog`, `in_progress`, `in_review`, `merged_staging`, `done`
- `-WhatIf`: Show actions without executing.

---

### `link-issue-to-project.ps1`

Links a GitHub Issue to Project #4 with full metadata.

```powershell
# Link with explicit metadata
.\link-issue-to-project.ps1 -IssueNumber 42 -Priority "high" -Domain "game" -Effort "L"

# Auto-parse metadata from roadmap.md
.\link-issue-to-project.ps1 -IssueNumber 42 -Auto

# Dry run
.\link-issue-to-project.ps1 -IssueNumber 42 -WhatIf
```

**Parameters:**

- `-IssueNumber` (required): GitHub Issue number.
- `-Priority` (optional): `critical`, `high`, `medium`, `low`
- `-Domain` (optional): `game`, `infra`, `bio`, `social`, `commerce`
- `-Effort` (optional): `S`, `M`, `L`, `XL`
- `-ROI` (optional): Numeric ROI value.
- `-Status` (optional): Default: `backlog`
- `-Auto`: Auto-parse metadata from `roadmap.md` HTML comments.
- `-WhatIf`: Show actions without executing.

---

### `refresh-project-config.ps1`

Fetches current Project field IDs from GitHub API and updates `github-project.json`.

```powershell
# Refresh all field IDs
.\refresh-project-config.ps1

# Dry run
.\refresh-project-config.ps1 -WhatIf
```

---

## Configuration

All scripts read from `.agent/config/github-project.json`:

```json
{
  "projectId": "PVT_kwHOAe3KCM4BMt-p",
  "projectNumber": 4,
  "owner": "Techlemariam",
  "fields": {
    "status": { "id": "...", "options": { "backlog": "...", ... } },
    "priority": { ... },
    "effort": { ... },
    "domain": { ... },
    "roi": { "id": "..." }
  }
}
```

## Cross-Platform

Bash versions are available in `scripts/bash/` for Linux/macOS environments.

## Archive

Legacy one-off scripts are archived in `scripts/archive/`:

- `update-project-fields.ps1` - Bulk update for issues #73-88
- `repair-issues.ps1` - Body reformatter
- `reformat-issues.ps1` - Template engine
- `sync-timeline.ps1` - Timeline sync
