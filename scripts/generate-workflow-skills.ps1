# Generate OpenClaw skills from .agent/workflows
# This enables Discord slash commands like /skill health-check

$workflowsDir = ".agent/workflows"
$skillsDir = "skills"

# Get all workflow files (excluding metadata files and guards)
$workflows = Get-ChildItem -Path $workflowsDir -Filter "*.md" | Where-Object {
    $_.Name -notin @("INDEX.md", "GRAPH.md", "MANUAL.md", "METADATA.md") -and
    $_.Name -notlike "*-permissions.md"
}

Write-Host "🦞 Generating skills for $($workflows.Count) workflows..." -ForegroundColor Cyan

foreach ($workflow in $workflows) {
    $workflowName = $workflow.BaseName
    $skillPath = Join-Path $skillsDir $workflowName
    
    # Create skill directory
    New-Item -ItemType Directory -Path $skillPath -Force | Out-Null
    
    # Read workflow metadata
    $workflowContent = Get-Content $workflow.FullName -Raw
    $description = "Execute the $workflowName workflow"
    
    # Extract description from frontmatter if available
    if ($workflowContent -match '(?s)description:\s*"([^"]+)"') {
        $description = $matches[1]
    }
    
    # Generate SKILL.md
    $skillContent = @"
---
name: $workflowName
description: "$description"
metadata: {"clawdbot":{"emoji":"🤖","always":false}}
---

# $workflowName

This skill executes the **$workflowName** workflow from `.agent/workflows/$workflowName.md`.

## Usage

``````
"Run $workflowName"
``````

Or via Discord slash command:
``````
/skill $workflowName
``````

## Implementation

This skill reads and executes the workflow file:

``````bash
cat .agent/workflows/$workflowName.md
``````

Then follows the steps defined in that file.
"@
    
    # Write SKILL.md
    $skillMdPath = Join-Path $skillPath "SKILL.md"
    Set-Content -Path $skillMdPath -Value $skillContent -Encoding UTF8
    
    Write-Host "  ✓ Created skill: $workflowName" -ForegroundColor Green
}

Write-Host "`n✅ Done! Generated $($workflows.Count) skills." -ForegroundColor Green
Write-Host "Restart OpenClaw to register them as Discord slash commands." -ForegroundColor Yellow
