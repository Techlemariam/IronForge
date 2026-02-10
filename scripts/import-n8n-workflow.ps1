$ErrorActionPreference = "Stop"

$url = "https://ironforge-coolify.tailafb692.ts.net/api/v1/workflows"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MThkZjhkZC0yOGJlLTQ1NWMtYWY5NS1mNTQxZTM2NGIxYjQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNjI2MTgxfQ.MtuAV2QCu98qhn7CbuVm1PYsDvCun_7KTwt3iIFgZYA"
$n8nDir = "c:\Users\alexa\Workspaces\IronForge\n8n"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$files = Get-ChildItem -Path $n8nDir -Filter "*.json"

foreach ($file in $files) {
    Write-Host "Importing: $($file.Name)..."
    $json = Get-Content $file.FullName -Raw
    
    try {
        $params = @{
            Uri         = $url
            Method      = "Post"
            Body        = $json
            ContentType = "application/json"
            Headers     = @{ "X-N8N-API-KEY" = $apiKey }
        }
        $response = Invoke-RestMethod @params
        Write-Host "  OK - ID: $($response.id) | Name: $($response.name)" -ForegroundColor Green
    }
    catch {
        $errBody = $_.ErrorDetails.Message
        Write-Warning "  FAILED: $errBody"
    }
}

Write-Host "`nDone."
