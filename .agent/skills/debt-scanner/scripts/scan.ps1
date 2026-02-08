<#
.SYNOPSIS
    Scans codebase for technical debt patterns.

.PARAMETER Pattern
    Specific pattern to scan for (todo, any, ignore, catch, console).

.EXAMPLE
    pwsh .agent/skills/debt-scanner/scripts/scan.ps1
    pwsh .agent/skills/debt-scanner/scripts/scan.ps1 -Pattern "any"
#>

param(
    [string]$Pattern = "all"
)

$srcPath = "src"
$results = @{
    timestamp = Get-Date -Format "o"
    patterns  = @{}
    total     = 0
}

$patterns = @{
    "TODO"        = @{ regex = "TODO"; severity = "medium" }
    "FIXME"       = @{ regex = "FIXME"; severity = "high" }
    "any_type"    = @{ regex = ": any|as any"; severity = "medium" }
    "ts_ignore"   = @{ regex = "@ts-ignore|@ts-expect-error"; severity = "high" }
    "empty_catch" = @{ regex = "catch\s*\(\s*\)\s*\{"; severity = "high" }
    "console_log" = @{ regex = "console\.(log|debug|info)"; severity = "low" }
}

Write-Host "🔍 DEBT SCANNER" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

foreach ($name in $patterns.Keys) {
    if ($Pattern -ne "all" -and $name -notlike "*$Pattern*") { continue }
    
    $p = $patterns[$name]
    $matches = rg -c $p.regex $srcPath --type ts --type tsx 2>$null
    $count = 0
    
    if ($matches) {
        $matches | ForEach-Object {
            if ($_ -match ":(\d+)$") {
                $count += [int]$Matches[1]
            }
        }
    }
    
    $results.patterns[$name] = @{
        count    = $count
        severity = $p.severity
    }
    $results.total += $count
    
    $icon = if ($count -eq 0) { "✅" } else { "⚠️" }
    $color = if ($count -eq 0) { "Green" } else { "Yellow" }
    Write-Host "$icon $name`: $count" -ForegroundColor $color
}

Write-Host "`n===============" -ForegroundColor Cyan
Write-Host "Total: $($results.total) debt items" -ForegroundColor $(if ($results.total -eq 0) { "Green" } else { "Yellow" })

# Output JSON for CI
$results | ConvertTo-Json -Depth 3
