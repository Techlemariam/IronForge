$ErrorActionPreference = "Stop"
Write-Host "Creating C:\actions-runner folder..." -ForegroundColor Cyan
Get-Service "actions.runner.*" -ErrorAction SilentlyContinue | Stop-Service -Force -ErrorAction SilentlyContinue
Get-Process "Runner.Listener" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (Test-Path "C:\actions-runner") {
    Write-Host "Cleaning up old installation..." -ForegroundColor Cyan
    Remove-Item -Path "C:\actions-runner" -Recurse -Force
}
New-Item -Path "C:\actions-runner" -ItemType Directory -Force

Set-Location "C:\actions-runner"

Write-Host "Downloading runner package..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://github.com/actions/runner/releases/download/v2.331.0/actions-runner-win-x64-2.331.0.zip" -OutFile "actions-runner.zip"

Write-Host "Verifying checksum..." -ForegroundColor Cyan
$hash = (Get-FileHash -Path "actions-runner.zip" -Algorithm SHA256).Hash
if ($hash -ne "473E74B86CD826E073F1C1F2C004D3FB9E6C9665D0D51710A23E5084A601C78A") {
    Write-Error "Checksum mismatch! Expected 473E74B86CD826E073F1C1F2C004D3FB9E6C9665D0D51710A23E5084A601C78A but got $hash"
    exit 1
}

Write-Host "Extracting..." -ForegroundColor Cyan
Expand-Archive -Path "actions-runner.zip" -DestinationPath "C:\actions-runner" -Force

Write-Host "Configuring runner..." -ForegroundColor Cyan
& ".\config.cmd" --url "https://github.com/Techlemariam/IronForge" --token "AHW4UCDBEORB7BEV6GBA5UDJRJGQG" --unattended --replace --name "IronForge-Local"

Write-Host "Installation complete! Starting runner interactively..." -ForegroundColor Green
& ".\run.cmd"
