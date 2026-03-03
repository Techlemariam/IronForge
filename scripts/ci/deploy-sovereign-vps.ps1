<#
.SYNOPSIS
  Deploy the Sovereign Testing Databases (L1, E2E, Guard) to the Hetzner VPS.

.DESCRIPTION
  This script connects to the Hetzner VPS over SSH, transfers the docker-compose.test.yml
  and SQL init scripts, and provisions the Sovereign PostgreSQL containers required for 
  the CI Doctor runners to perform safe database pushes without impacting remote servers.

.EXAMPLE
  doppler run --project ironforge --config prd -- pwsh scripts/ci/deploy-sovereign-vps.ps1
#>

$ErrorActionPreference = "Stop"
$vpsHost = "root@77.42.45.229"
$targetDir = "/data/ironforge-test-db"
$dbPassword = $env:SOVEREIGN_DB_PASSWORD

if (-not $dbPassword) { Write-Error "CRITICAL: SOVEREIGN_DB_PASSWORD not set."; exit 1 }

# Escape single-quotes in the password for safe YAML single-quote wrapping: ' -> ''
$yamlSafePassword = $dbPassword -replace "'", "''"

Write-Host "🚀 Beginning Sovereign DB VPS Deployment..." -ForegroundColor Cyan

# 1. Create target directory
Write-Host "Creating target directory $targetDir on $vpsHost..."
ssh -o StrictHostKeyChecking=no $vpsHost "mkdir -p $targetDir; mkdir -p $targetDir/db-init"
if ($LASTEXITCODE -ne 0) { throw "ssh mkdir failed (exit code: $LASTEXITCODE)" }

# 2. Extract specific DB definitions into local temporary compose file
# since docker-compose.test.yml contains Chromium and LHCI images we don't want to run continuously on the host
$composeContent = @"
services:
  db-l1:
    image: postgres:15-alpine
    container_name: ironforge-pg-l1
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: '$yamlSafePassword'
      POSTGRES_DB: ironforge_test
    ports:
      - "5433:5432"
    volumes:
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - coolify-net

  db-e2e:
    image: postgres:15-alpine
    container_name: ironforge-pg-e2e
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: '$yamlSafePassword'
      POSTGRES_DB: ironforge_e2e
    ports:
      - "5434:5432"
    volumes:
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - coolify-net

  db-guard:
    image: postgres:15-alpine
    container_name: ironforge-pg-guard
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: '$yamlSafePassword'
      POSTGRES_DB: ironforge_shadow_guard
    ports:
      - "5435:5432"
    volumes:
      - ./db-init:/docker-entrypoint-initdb.d
    networks:
      - coolify-net

networks:
  coolify-net:
    external: true
"@

$localTemp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $localTemp -Value $composeContent

# 3. Transfer Compose File
Write-Host "Transferring Docker Compose config..."
try {
  scp -o StrictHostKeyChecking=no $localTemp "${vpsHost}:${targetDir}/docker-compose.yml"
  if ($LASTEXITCODE -ne 0) { throw "scp docker-compose.yml failed (exit code: $LASTEXITCODE)" }
}
finally {
  if (Test-Path $localTemp) { Remove-Item $localTemp }
}

# 4. Transfer DB Init Script
Write-Host "Transferring init-db.sql..."
scp -o StrictHostKeyChecking=no "infra/ci/init-db.sql" "${vpsHost}:${targetDir}/db-init/"
if ($LASTEXITCODE -ne 0) { throw "scp init-db.sql failed (exit code: $LASTEXITCODE)" }

# 5. Start the containers
Write-Host "Starting Sovereign DB containers on VPS..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no $vpsHost "cd $targetDir && docker compose up -d"
if ($LASTEXITCODE -ne 0) { throw "ssh docker compose up failed (exit code: $LASTEXITCODE)" }

Write-Host "✅ Sovereign Databases deployed successfully!" -ForegroundColor Green
Write-Host "L1 (5433), E2E (5434), and Guard (5435) are active."
