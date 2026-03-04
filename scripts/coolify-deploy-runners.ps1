<#
.SYNOPSIS
  Deploy GitHub Actions self-hosted runners to Coolify via API.
.DESCRIPTION
  Creates or manages multiple Docker Compose services in Coolify for ephemeral GitHub runners.
  Runs 3 separated services by default to enable scaling, as Coolify container_name conflicts with deploy.replicas.
  Usage: doppler run --project ironforge --config prd -- pwsh scripts/coolify-deploy-runners.ps1 -Action <create|start|stop|status>
#>

param(
  [ValidateSet("create", "start", "stop", "status")]
  [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN
$ghPat = $env:GH_PAT
$serverUuid = "swwk0owc8sokwo80w48k48w0"
$projectUuid = "n4w4sk0sok0s040w0w0koc8c"

if (-not $token) { Write-Error "COOLIFY_API_TOKEN not set. Run via: doppler run --"; exit 1 }

$headers = @{
  "Authorization" = "Bearer $token"
  "Accept"        = "application/json"
  "Content-Type"  = "application/json"
}

# The UUIDs for the 3 current runner services:
$runnerServices = @(
  "rgk0408w8oo0kswcw0g8os8k", # github-runners
  "loksowso4gwkooo8gskw8sgw", # github-runners-2
  "cwwwgwscwcswcggg0owkcccc"  # github-runners-3
)

function Get-RunnerStatus {
  Write-Host "Coolify Services Status:" -ForegroundColor Cyan
  foreach ($uuid in $runnerServices) {
    try {
      $svc = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$uuid" -Headers $headers -ErrorAction Stop
      Write-Host "  $($svc.name): $($svc.status)"
    }
    catch {
      Write-Host "  Service $($uuid): Not found" -ForegroundColor DarkGray
    }
  }

  $runners = gh api /repos/Techlemariam/IronForge/actions/runners --jq '.runners[] | select(.status == "online") | "\(.name): \(.status)"' 2>&1
  if ($runners) {
    Write-Host "`nGitHub Runners (Online):" -ForegroundColor Green
    $runners | ForEach-Object { Write-Host "  $_" }
  }
  else {
    Write-Host "`nNo runners online" -ForegroundColor Yellow
  }
}

switch ($Action) {
  "create" {
    if (-not $ghPat) { Write-Error "GH_PAT not set"; exit 1 }
    $composeTemplate = @'
services:
  runner:
    image: myoung34/github-runner:latest
    restart: always
    container_name: REPLACEME
    environment:
      - REPO_URL=https://github.com/Techlemariam/IronForge
      - ACCESS_TOKEN=PLACEHOLDER
      - RUNNER_NAME_PREFIX=IronForge-VPS
      - RUNNER_LABELS=self-hosted,IronForge-Local
      - RUNNER_WORKDIR=/tmp/github-runner
      - RUNNER_GROUP=Default
      - ORG_RUNNER=false
      - LABELS=self-hosted,IronForge-Local
      - EPHEMERAL=true
      - DISABLE_AUTO_UPDATE=true
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
'@
        
    for ($i = 1; $i -le 3; $i++) {
      $name = if ($i -eq 1) { "github-runners" } else { "github-runners-$i" }
      $composeContext = $composeTemplate -replace 'REPLACEME', $name -replace 'PLACEHOLDER', $ghPat
      $composeB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($composeContext))
            
      $body = @{
        server_uuid        = $serverUuid
        project_uuid       = $projectUuid
        environment_name   = "production"
        docker_compose_raw = $composeB64
        name               = $name
        description        = "Self-hosted GitHub Actions runner (ephemeral)"
        instant_deploy     = $true
      } | ConvertTo-Json -Depth 5

      Write-Host "Deploying $name..."
      try {
        $r = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" -Method POST -Headers $headers -Body $body
        Write-Host "  Created: $($r.uuid)" -ForegroundColor Green
      }
      catch {
        Write-Host "  Failed to create: $($_.ErrorDetails.Message)" -ForegroundColor Red
      }
    }
  }
    
  "start" {
    foreach ($uuid in $runnerServices) {
      Write-Host "Starting $uuid..."
      try { Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$uuid/start" -Method POST -Headers $headers | Out-Null } catch {}
    }
    Write-Host "Start requests sent" -ForegroundColor Green
    Start-Sleep -Seconds 10
    Get-RunnerStatus
  }
    
  "stop" {
    foreach ($uuid in $runnerServices) {
      Write-Host "Stopping $uuid..."
      try { Invoke-RestMethod -Uri "$coolifyHost/api/v1/services/$uuid/stop" -Method POST -Headers $headers | Out-Null } catch {}
    }
    Write-Host "Stop requests sent" -ForegroundColor Yellow
  }
    
  "status" {
    Get-RunnerStatus
  }
}
