# Git Guard - Branch Protection Script (PowerShell)
# Prevents accidental operations on protected branches

$currentBranch = git rev-parse --abbrev-ref HEAD

if ($currentBranch -eq "main") {
    Write-Host "⛔ ERROR: You are on the 'main' branch" -ForegroundColor Red
    Write-Host "   The main branch is protected. You must create a feature branch."
    Write-Host ""
    Write-Host "   Run: /claim-task [task-description]"
    Write-Host "   Or manually: git checkout -b [prefix]/[description]"
    exit 1
}

Write-Host "✅ Branch: $currentBranch" -ForegroundColor Green
