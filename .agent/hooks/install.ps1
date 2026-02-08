<#
.SYNOPSIS
    Installs Git hooks for automatic skill activation.
#>

$hooksDir = ".git/hooks"
$sourceDir = ".agent/hooks"

Write-Host "🔧 Installing Git Hooks..." -ForegroundColor Cyan

# Pre-commit
$preCommit = Join-Path $hooksDir "pre-commit"
Copy-Item -Path (Join-Path $sourceDir "pre-commit") -Destination $preCommit -Force
Write-Host "   ✅ Installed: pre-commit" -ForegroundColor Green

# Pre-push
$prePush = Join-Path $hooksDir "pre-push"
Copy-Item -Path (Join-Path $sourceDir "pre-push") -Destination $prePush -Force
Write-Host "   ✅ Installed: pre-push" -ForegroundColor Green

Write-Host "`n✅ Git hooks installed!" -ForegroundColor Green
Write-Host "   Skills will now run automatically on commit/push." -ForegroundColor Gray
