#!/usr/bin/env pwsh
# Usage: doppler run -- pwsh scripts/n8n-create-credential.ps1
$n8nHost = "https://ironforge-coolify.tailafb692.ts.net"
$key = $env:N8N_API_KEY
$pat = $env:GH_PAT

if (-not $key) { Write-Error "N8N_API_KEY missing"; exit 1 }
if (-not $pat) { Write-Error "GH_PAT missing"; exit 1 }

$headers = @{
    "X-N8N-API-KEY" = $key
    "Content-Type"  = "application/json"
}

$payload = '{"name":"GitHub PAT","type":"httpHeaderAuth","data":{"name":"Authorization","value":"Bearer ' + $pat + '"}}'

$result = Invoke-RestMethod -Uri "$n8nHost/api/v1/credentials" `
    -Method Post `
    -Headers $headers `
    -Body $payload `
    -SkipCertificateCheck

Write-Host "Credential created!"
Write-Host "ID:   $($result.id)"
Write-Host "Name: $($result.name)"
Write-Host "Use credential ID $($result.id) in n8n workflows"
