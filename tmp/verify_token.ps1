
$token = $env:GH_PAT
if (-not $token) {
    Write-Error "GH_PAT is not set in environment"
    exit 1
}

Write-Host "Verifying token: $($token.Substring(0,10))..."

$headers = @{
    "Authorization"        = "Bearer $token"
    "Accept"               = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    Write-Host "Target: https://api.github.com/user"
    $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
    Write-Host "Success! Authenticated as: $($response.login)"
}
catch {
    Write-Host "User endpoint failed (Normal for fine-grained tokens with restricted scope)."
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    Write-Host "Target: https://api.github.com/repos/Techlemariam/IronForge"
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/Techlemariam/IronForge" -Headers $headers -Method Get
    Write-Host "Success! Repo Name: $($response.full_name)"
    Write-Host "Permissions: $($response.permissions | ConvertTo-Json)"
}
catch {
    Write-Host "Repo endpoint failed. Token might lack permissions for this repo."
    Write-Host "Error: $($_.Exception.Message)"
}
