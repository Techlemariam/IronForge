add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    workflow = "/health-check"
    branch   = "main"
    token    = "IF_SECURE_TRIGGER_REDACTED"
    source   = "discord"
    user     = "Antigravity#InternalTest"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://coolify.ironforge.com/webhook/ironforge-trigger" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Success!"
    $response | ConvertTo-Json
}
catch {
    Write-Error "❌ Failed: $($_.Exception.Message)"
}
