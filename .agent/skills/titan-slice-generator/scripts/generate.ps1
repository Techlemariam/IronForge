<#
.SYNOPSIS
    Generates a vertical slice for an entity.

.PARAMETER Entity
    Name of the entity to generate (e.g., Workout, Challenge).

.EXAMPLE
    pwsh .agent/skills/titan-slice-generator/scripts/generate.ps1 -Entity "Workout"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$Entity
)

$entityLower = $Entity.ToLower()
$entityPascal = $Entity.Substring(0, 1).ToUpper() + $Entity.Substring(1)

Write-Host "🏗️ TITAN SLICE GENERATOR" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Entity: $entityPascal" -ForegroundColor Yellow

# Create directories
$dirs = @(
    "src/features/$entityLower/components",
    "src/features/$entityLower/hooks"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Created: $dir" -ForegroundColor Green
    }
}

Write-Host "`n📁 Files to generate:" -ForegroundColor Yellow
Write-Host "   - src/actions/$entityLower.ts"
Write-Host "   - src/features/$entityLower/components/${entityPascal}Card.tsx"
Write-Host "   - src/features/$entityLower/hooks/use$entityPascal.ts"
Write-Host "   - src/lib/schemas/$entityLower.ts"

Write-Host "`n✅ Slice scaffold complete" -ForegroundColor Green
Write-Host "   Next: Implement the generated files" -ForegroundColor Gray
