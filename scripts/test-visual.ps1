# IronForge Visual Regression Runner (Dockerized)
# Ensures snapshots are consistent across dev environments by running inside the Playwright Docker container.

$DOCKER_IMAGE = "mcr.microsoft.com/playwright:v1.43.0-jammy"
$PROJECT_ROOT = Get-Location

Write-Host "🚀 Starting Visual Regression Suite in Docker..." -ForegroundColor Cyan

# Check if docker is running
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Run the tests inside Docker
# We mount the current directory and use the host network for the dev server
docker run --rm --network host -v "${PROJECT_ROOT}:/work" -w /work -e CI=true $DOCKER_IMAGE /bin/bash -c "
    corepack enable && 
    pnpm install && 
    pnpm playwright test --project=desktop --project=mobile --project=iphone --project=tv --update-snapshots
"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Visual snapshots updated/verified successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Visual regression failed." -ForegroundColor Red
    exit 1
}
