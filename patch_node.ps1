add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(ServicePoint srvPoint, X509Certificate certificate, WebRequest request, int certificateProblem) { return true; }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$headers = @{
    "X-N8N-API-KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MThkZjhkZC0yOGJlLTQ1NWMtYWY5NS1mNTQxZTM2NGIxYjQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwNjI2MTgxfQ.MtuAV2QCu98qhn7CbuVm1PYsDvCun_7KTwt3iIFgZYA"
    "Content-Type"  = "application/json"
}

$patch = @{
    parameters = @{
        url              = "https://api.github.com/repos/Techlemariam/IronForge/dispatches"
        method           = "POST"
        sendHeaders      = $true
        headerParameters = @{
            parameters = @(
                @{ name = "Accept"; value = "application/vnd.github.v3+json" }
                @{ name = "Authorization"; value = "token REDACTED_TOKEN" }
            )
        }
        sendBody         = $true
        specifyBody      = "json"
        jsonBody         = "={{ JSON.stringify({ event_type: 'remote-trigger', client_payload: { workflow: `$json.workflow || '/health-check', branch: `$json.branch || 'main', token: `$json.token } }) }}"
        options          = @{}
    }
}

$body = $patch | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://coolify.ironforge.com/api/v1/workflows/RgDX5gDwrj8gsKzw/nodes/c21284a3-6375-4828-a9fb-2ca83ed5675e" -Method Patch -Headers $headers -Body $body
    Write-Host "✅ Node patched successfully!"
    $response | ConvertTo-Json
}
catch {
    Write-Error "❌ Patch failed: $($_.Exception.Message)"
}
