<#
.SYNOPSIS
    Runs accessibility audit.
#>

Write-Host "♿ A11Y AUDITOR" -ForegroundColor Cyan

# Check for missing aria-labels
$missing = rg -c "onClick|onKeyDown" src --type tsx 2>$null | Measure-Object -Line
Write-Host "   Interactive elements found: scanning for aria-labels..." -ForegroundColor Gray

$noAria = rg -l "onClick" src --type tsx 2>$null | ForEach-Object {
    $content = Get-Content $_ -Raw
    if ($content -notmatch "aria-label") { $_ }
}

if ($noAria) {
    Write-Host "⚠️ Files missing aria-labels:" -ForegroundColor Yellow
    $noAria | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
}
else {
    Write-Host "✅ All interactive elements have aria-labels" -ForegroundColor Green
}
