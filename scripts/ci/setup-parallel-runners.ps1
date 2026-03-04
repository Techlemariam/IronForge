$ErrorActionPreference = "Stop"

Write-Host "Creating parallel runners (2, 3, 4)..." -ForegroundColor Cyan

for ($i = 2; $i -le 4; $i++) {
    $runnerDir = "C:\actions-runner-$i"
    
    if (Test-Path $runnerDir) {
        Write-Host "Cleaning up old installation at $runnerDir..." -ForegroundColor Cyan
        Remove-Item -Path $runnerDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Setting up Runner $i at $runnerDir..." -ForegroundColor Yellow
    New-Item -Path $runnerDir -ItemType Directory -Force | Out-Null
    
    Write-Host "  Copying actions-runner.zip..." -ForegroundColor Gray
    Copy-Item "C:\actions-runner\actions-runner.zip" -Destination "$runnerDir\actions-runner.zip"
    
    Set-Location $runnerDir
    Write-Host "  Extracting..." -ForegroundColor Gray
    Expand-Archive -Path "actions-runner.zip" -DestinationPath $runnerDir -Force
    
    Write-Host "  Fetching new GitHub runner token..." -ForegroundColor Gray
    # Fetch token using existing gh CLI auth
    $token = gh api -X POST /repos/Techlemariam/IronForge/actions/runners/registration-token --jq .token
    
    if (-not $token) {
        Write-Error "Failed to fetch runner token from GitHub API."
        exit 1
    }

    Write-Host "  Configuring Runner $i..." -ForegroundColor Gray
    # Note: Using exact same labels so it picks up jobs targeted at IronForge-Local
    & ".\config.cmd" --url "https://github.com/Techlemariam/IronForge" --token "$token" --unattended --replace --name "IronForge-Local-$i" --labels "self-hosted,Windows,X64,IronForge-Local"
    
    Write-Host "  Starting Runner $i in background..." -ForegroundColor Green
    # Start the runner in the background so it doesn't block this script
    Start-Process "cmd.exe" -ArgumentList "/c run.cmd" -WorkingDirectory $runnerDir -WindowStyle Hidden
}

Write-Host "All 3 additional runners deployed and started successfully!" -ForegroundColor Green
Set-Location "c:\Users\alexa\Workspaces\IronForge"
