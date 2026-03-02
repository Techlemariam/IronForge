$ErrorActionPreference = "Stop"

$url = "https://coolify.ironforge.com/api/v1/workflows"
$apiKey = $env:N8N_API_KEY
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
