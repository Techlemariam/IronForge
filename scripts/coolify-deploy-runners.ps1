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

# SECURITY NOTE: COOLIFY_HOST must be a fully-qualified hostname (e.g., coolify.example.com) with a
# valid TLS certificate. Using a bare IP address with -SkipCertificateCheck is not supported.
# Ensure your Coolify instance has a proper domain and cert before using this script.
$coolifyHost = $env:COOLIFY_HOST
$token = $env:COOLIFY_API_TOKEN
$ghPat = $env:GH_PAT
$envName = "production"

if (-not $coolifyHost) { Write-Error "COOLIFY_HOST env var not set. Set it to your Coolify hostname (e.g., https://coolify.example.com)."; exit 1 }
if (-not $token) { Write-Error "COOLIFY_API_TOKEN not set. Run via: doppler run --"; exit 1 }

$headers = @{
  "Authorization" = "Bearer $token"
  "Accept"        = "application/json"
  "Content-Type"  = "application/json"
}

# The UUIDs for the 3 current runner services:
$runnerServices = @(
  "zcwgg0gw8s8c8gwk0wcsoccs", # github-runners
  "p8w0kcwso4w4sw484kgo0gw8", # github-runners-2
  "z80owgk0sg8c8g44cw4cgkso"  # github-runners-3
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
      - RUNNER_LABELS=self-hosted,IronForge-VPS
      - RUNNER_WORKDIR=/tmp/github-runner
      - RUNNER_GROUP=Default
      - ORG_RUNNER=false
      - LABELS=self-hosted,IronForge-VPS
      - EPHEMERAL=true
      - DISABLE_AUTO_UPDATE=true
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
'@
        
    $projects = Invoke-RestMethod -Uri "$coolifyHost/api/v1/projects" -Headers $headers
    if (-not $projects -or $projects.Count -eq 0) { Write-Error "No projects found"; exit 1 }
    $project = $projects | Select-Object -First 1
    $projectUuid = $project.uuid
    
    $envs = Invoke-RestMethod -Uri "$coolifyHost/api/v1/projects/$projectUuid/environments" -Headers $headers
    if (-not $envs -or $envs.Count -eq 0) { Write-Error "No environments found"; exit 1 }
    $envName = $envs[0].name

    $servers = Invoke-RestMethod -Uri "$coolifyHost/api/v1/servers" -Headers $headers
    if (-not $servers -or $servers.Count -eq 0) { Write-Error "No servers found"; exit 1 }
    $serverUuid = $servers[0].uuid

    for ($i = 1; $i -le 3; $i++) {
      $name = if ($i -eq 1) { "github-runners" } else { "github-runners-$i" }
      $composeContext = $composeTemplate -replace 'REPLACEME', $name -replace 'PLACEHOLDER', $ghPat
            
      $base64Compose = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($composeContext))
      
      $body = @{
        server_uuid        = $serverUuid
        project_uuid       = $projectUuid
        environment_name   = $envName
        docker_compose_raw = $base64Compose
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
