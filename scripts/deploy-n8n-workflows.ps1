$n8nHost = "https://ironforge-coolify.tailafb692.ts.net"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MThkZjhkZC0yOGJlLTQ1NWMtYWY5NS1mNTQxZTM2NGIxYjQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTIxYzc0ZWUtZDQyNC00NGZhLWE0M2YtOGRiNmE1NmZlMzlhIiwiaWF0IjoxNzc2MDg2NDQ0LCJleHAiOjE3Nzg2MzA0MDB9.BzkA3KC5QUtEFtpw1hJ0v9CSfLug1Imt457OA8tbEWw"

$headers = @{
    "X-N8N-API-KEY" = $apiKey
    "Content-Type"  = "application/json"
}

$workflows = @(
    "c:\Users\alexa\Workspaces\IronForge\n8n\interaction-router.n8n",
    "c:\Users\alexa\Workspaces\IronForge\n8n\panopticon-status.n8n"
)

foreach ($file in $workflows) {
    if (Test-Path $file) {
        $jsonContent = Get-Content -Raw -Path $file
        $uri = "$n8nHost/api/v1/workflows"
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $jsonContent -SkipCertificateCheck
        Write-Host "✅ Uploaded workspace: $($response.name) (ID: $($response.id))" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}
