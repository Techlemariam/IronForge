#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/coolify-deploy-n8n.ps1
# Deploys n8n as a Docker Compose service on Coolify via the API.

$coolifyHost = "https://ironforge-coolify.tailafb692.ts.net"
$token = $env:COOLIFY_API_TOKEN

if (-not $token) { Write-Error "COOLIFY_API_TOKEN missing"; exit 1 }

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Step 1: List projects to find project UUID
Write-Host "Fetching Coolify projects..." -ForegroundColor Cyan
$projects = Invoke-RestMethod -Uri "$coolifyHost/api/v1/projects" `
    -Headers $headers `
    -SkipCertificateCheck

Write-Host "Projects:"
$projects | ForEach-Object { Write-Host "  [$($_.uuid)] $($_.name)" }

# Step 2: Pick the first project and its first environment
$project = $projects[0]
$projectUuid = $project.uuid
$envUuid = $project.environments[0].uuid

Write-Host ""
Write-Host "Using project: $($project.name) ($projectUuid)" -ForegroundColor Green
Write-Host "Using environment: $($project.environments[0].name) ($envUuid)" -ForegroundColor Green

# Step 3: Read the docker-compose file
$composeContent = Get-Content -Raw docker/n8n.yml

# Step 4: Get list of servers
$servers = Invoke-RestMethod -Uri "$coolifyHost/api/v1/servers" `
    -Headers $headers `
    -SkipCertificateCheck

$serverUuid = $servers[0].uuid
Write-Host "Using server: $($servers[0].name) ($serverUuid)" -ForegroundColor Green

# Step 5: Deploy the Docker Compose service
Write-Host ""
Write-Host "Deploying n8n Docker Compose service..." -ForegroundColor Yellow

$deployBody = @{
    project_uuid       = $projectUuid
    environment_name   = $project.environments[0].name
    server_uuid        = $serverUuid
    type               = "docker-compose"
    name               = "n8n"
    docker_compose_raw = $composeContent
    instant_deploy     = $true
} | ConvertTo-Json -Depth 5

$result = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" `
    -Method Post `
    -Headers $headers `
    -Body $deployBody `
    -SkipCertificateCheck

Write-Host ""
Write-Host "n8n deployed!" -ForegroundColor Green
Write-Host "Service UUID: $($result.uuid)"
Write-Host "URL: $($result.fqdn)"
Write-Host $result | ConvertTo-Json -Depth 3
