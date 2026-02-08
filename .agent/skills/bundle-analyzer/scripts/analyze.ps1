<#
.SYNOPSIS
    Analyzes bundle size.
#>

Write-Host "📦 BUNDLE ANALYZER" -ForegroundColor Cyan

# Build and analyze
Write-Host "   Building for analysis..." -ForegroundColor Gray
$env:ANALYZE = "true"
npm run build 2>&1 | Select-String "First Load|Route" | ForEach-Object {
    Write-Host "   $_" -ForegroundColor Gray
}

Write-Host "✅ Bundle analysis complete" -ForegroundColor Green
