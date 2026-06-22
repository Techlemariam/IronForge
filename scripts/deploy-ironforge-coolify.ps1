#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/deploy-ironforge-coolify.ps1
# Triggers a redeployment of the IronForge application on Coolify, runs smoke tests, and updates GitHub Commit Statuses.

. "$PSScriptRoot/coolify-api.ps1"

$appUuid = $env:IRONFORGE_COOLIFY_APP_UUID
if (-not $appUuid) {
    # Fallback to COOLIFY_APP_ID if set in Doppler or env
    $appUuid = $env:COOLIFY_APP_ID
}

if (-not $appUuid) {
    Write-Error "IRONFORGE_COOLIFY_APP_UUID or COOLIFY_APP_ID is not set. Please add it to your environment or Doppler config."
    exit 1
}

$smokeTestUrl = $env:NEXT_PUBLIC_APP_URL
if (-not $smokeTestUrl) {
    $smokeTestUrl = "http://localhost:3001"
}

# Helper to update GitHub Commit/PR Statuses
function Set-GitHubCommitStatus {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("pending", "success", "failure", "error")]
        [string]$State,
        
        [Parameter(Mandatory = $true)]
        [string]$Description,
        
        [string]$TargetUrl
    )
    
    $token = $env:GH_PAT
    if (-not $token) { $token = $env:GITHUB_TOKEN }
    if (-not $token) {
        Write-Warning "GH_PAT or GITHUB_TOKEN not set. Skipping GitHub commit status update."
        return
    }
    
    try {
        $commitSha = (git rev-parse HEAD).Trim()
        $uri = "https://api.github.com/repos/Techlemariam/IronForge/statuses/$commitSha"
        
        $headers = @{
            "Authorization"        = "Bearer $token"
            "Accept"               = "application/vnd.github+json"
            "X-GitHub-Api-Version" = "2022-11-28"
            "User-Agent"           = "ironforge-deploy-script"
        }
        
        $body = @{
            state       = $State
            description = $Description
            context     = "coolify/deploy"
        }
        if ($TargetUrl) { $body.target_url = $TargetUrl }
        
        $json = $body | ConvertTo-Json -Compress
        $res = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -ContentType "application/json" -Body $json
        Write-Host "Updated GitHub commit status ($commitSha) to: $State" -ForegroundColor Gray
    }
    catch {
        Write-Warning "Could not update GitHub commit status: $($_.Exception.Message)"
    }
}

Write-Host "Triggering deployment for IronForge (UUID: $appUuid) on Coolify..." -ForegroundColor Cyan
Set-GitHubCommitStatus -State "pending" -Description "Preparing deployment to Coolify..."

try {
    # 1. Trigger deployment (Coolify v4 standard deployment API)
    $response = Invoke-CoolifyAPI -Path "applications/$appUuid/deploy" -Method "Post"
    Write-Host "Deployment triggered successfully!" -ForegroundColor Green
    if ($response.message) {
        Write-Host "Message: $($response.message)"
    }
    
    $deploymentUuid = $response.deployment_uuid
    if (-not $deploymentUuid) {
        Write-Warning "No deployment UUID returned from Coolify. Skipping progress monitoring."
        Set-GitHubCommitStatus -State "success" -Description "Deployment triggered (no UUID returned)."
        exit 0
    }

    Set-GitHubCommitStatus -State "pending" -Description "Building and deploying on Coolify..." -TargetUrl $script:coolifyHost
    Write-Host "Deployment UUID: $deploymentUuid" -ForegroundColor Yellow
    Write-Host "Monitoring deployment progress (polling every 10 seconds)..." -ForegroundColor Cyan

    $timeoutSeconds = 600 # 10 minutes timeout
    $elapsed = 0
    $status = "queued"

    # 2. Poll deployment progress until completion
    while ($status -eq "queued" -or $status -eq "in_progress") {
        if ($elapsed -ge $timeoutSeconds) {
            $errMessage = "Timeout reached waiting for deployment to complete."
            Set-GitHubCommitStatus -State "failure" -Description $errMessage
            Write-Error $errMessage
            exit 1
        }

        Start-Sleep -Seconds 10
        $elapsed += 10

        try {
            $deployDetails = Invoke-CoolifyAPI -Path "deployments/$deploymentUuid" -Method "Get"
            $status = $deployDetails.status
            Write-Host "[$elapsed s] Current Status: $status"
        }
        catch {
            Write-Warning "Could not fetch deployment status: $($_.Exception.Message)"
        }
    }

    if ($status -ne "success") {
        $errMessage = "Deployment finished with status: $status"
        Set-GitHubCommitStatus -State "failure" -Description $errMessage
        Write-Error $errMessage
        exit 1
    }

    Write-Host "🎉 Deployment completed successfully in $elapsed seconds!" -ForegroundColor Green
    Set-GitHubCommitStatus -State "pending" -Description "Deployment succeeded. Starting smoke tests..." -TargetUrl $smokeTestUrl

    # 3. CD Post-Deploy Smoke Test (Health check)
    Write-Host "Running post-deploy smoke test against: $smokeTestUrl" -ForegroundColor Cyan
    Start-Sleep -Seconds 5 # Give the container a brief moment to start up

    $maxRetries = 5
    $retryCount = 0
    $smokePass = $false

    while (-not $smokePass -and $retryCount -lt $maxRetries) {
        $retryCount++
        try {
            # Execute HTTP request to the application to verify it is responsive
            $smokeResponse = Invoke-RestMethod -Uri $smokeTestUrl -Method Get -TimeoutSec 10
            $smokePass = $true
            Write-Host "✅ Smoke test passed! Application responded successfully on $smokeTestUrl" -ForegroundColor Green
            Set-GitHubCommitStatus -State "success" -Description "Deployment succeeded and smoke tests passed (HTTP 200)." -TargetUrl $smokeTestUrl
        }
        catch {
            Write-Warning "[$retryCount/$maxRetries] Smoke test attempt failed: $($_.Exception.Message)"
            if ($retryCount -lt $maxRetries) {
                Start-Sleep -Seconds 5
            }
        }
    }

    if (-not $smokePass) {
        $errMessage = "Smoke test failed after $maxRetries attempts."
        Set-GitHubCommitStatus -State "failure" -Description $errMessage -TargetUrl $smokeTestUrl
        Write-Error "❌ $errMessage. Please check application logs."
        exit 1
    }
}
catch {
    $errMessage = "An error occurred during deployment/smoke testing: $($_.Exception.Message)"
    Set-GitHubCommitStatus -State "failure" -Description $errMessage
    Write-Error $errMessage
    exit 1
}
