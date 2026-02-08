<#
.SYNOPSIS
    Generates the Skills README.md dynamically from all SKILL.md files.

.DESCRIPTION
    Scans .agent/skills/*/SKILL.md files, extracts frontmatter, and generates
    the README.md registry automatically.

.EXAMPLE
    pwsh .agent/skills/scripts/generate-readme.ps1
#>

$skillsDir = Split-Path -Parent $PSScriptRoot
$skills = @()

# Find all SKILL.md files
$skillFiles = Get-ChildItem -Path $skillsDir -Filter "SKILL.md" -Recurse -File

foreach ($file in $skillFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Extract YAML frontmatter
    if ($content -match '(?s)^---\r?\n(.+?)\r?\n---') {
        $yaml = $Matches[1]
        $skill = @{
            Path        = $file.Directory.Name
            Name        = ""
            Description = ""
            Version     = ""
            Category    = ""
        }
        
        foreach ($line in $yaml -split '\r?\n') {
            if ($line -match '^(\w+):\s*(.+)$') {
                $key = $Matches[1]
                $value = $Matches[2].Trim('"', "'", ' ')
                $skill[$key] = $value
            }
        }
        
        $skills += $skill
    }
}

# Generate README
$readme = @"
# 🛠️ Agent Skills Registry

Modular specialist knowledge for IronForge workflows.

> **Auto-generated** by ``generate-readme.ps1`` - Do not edit manually.

## Structure

``````
.agent/skills/[skill-name]/
├── SKILL.md       # Instructions & context
├── scripts/       # Executable helpers
└── tests/         # Skill tests
``````

## Active Skills

| Skill | Version | Category | Description |
|:------|:-------:|:--------:|:------------|
"@

foreach ($skill in $skills | Sort-Object { $_.name }) {
    $readme += "| [$($skill.name)](./$($skill.Path)/SKILL.md) | $($skill.version) | $($skill.category) | $($skill.description) |`n"
}

$readme += @"

## Usage in Workflows

Reference skills via relative path:
``````markdown
> Execute Skill: [skill-name](.agent/skills/skill-name/SKILL.md)
``````

## Schema Validation

All SKILL.md files must conform to [SCHEMA.json](./SCHEMA.json).

## Adding New Skills

1. Create folder: ``.agent/skills/[skill-name]/``
2. Add ``SKILL.md`` with required frontmatter (name, description, version)
3. Add ``scripts/`` with cross-platform scripts (.sh + .ps1)
4. Add ``tests/`` for validation
5. Run this script to regenerate README
"@

$readmePath = Join-Path $skillsDir "README.md"
$readme | Set-Content -Path $readmePath -Encoding UTF8

Write-Host "✅ Generated $readmePath with $($skills.Count) skills" -ForegroundColor Green
