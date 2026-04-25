
# Load API helpers
. "$PSScriptRoot\..\scripts\coolify-api.ps1"

# 1. Get Projects
$projects = Invoke-CoolifyAPI -Path "projects"
Write-Host "Projects Found: $($projects.Count)"

$ironforgeProject = $projects | Where-Object { $_.name -match "IronForge" }
if (-not $ironforgeProject) {
    Write-Error "IronForge project not found in Coolify."
    exit 1
}

Write-Host "Found IronForge Project: $($ironforgeProject.name) ($($ironforgeProject.uuid))"

# 2. Get Environments
$environments = Invoke-CoolifyAPI -Path "projects/$($ironforgeProject.uuid)"
# Projects response often includes environments or you might need a different path
# According to Coolify API v1, projects/{uuid} returns environments

$stagingEnv = $environments.environments | Where-Object { $_.name -match "staging" }
if (-not $stagingEnv) {
    Write-Error "Staging environment not found in IronForge project."
    exit 1
}

Write-Host "Found Staging Environment: $($stagingEnv.name)"

# 3. List Applications/Services in Staging
# Typically you need to list all resources and filter by environment
$resources = Invoke-CoolifyAPI -Path "projects/$($ironforgeProject.uuid)/$($stagingEnv.name)/resources"
Write-Host "Resources in Staging: $($resources.Count)"

$resources | ForEach-Object {
    Write-Host "- [$($_.status)] $($_.name) (Type: $($_.type))"
}
