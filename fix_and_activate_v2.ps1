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

$workflow = @{
    name        = "IF Remote Trigger"
    nodes       = @(
        @{
            id          = "95be271a-5109-4a0b-bd9e-0fe8a7ca5943"
            name        = "Webhook"
            type        = "n8n-nodes-base.webhook"
            typeVersion = 1
            position    = @(-400, 112)
            parameters  = @{
                path       = "ironforge-trigger"
                options    = @{}
                httpMethod = "POST"
            }
        },
        @{
            id          = "bbfa8fb0-90cf-43c6-a729-41be03cd58b6"
            name        = "Validate Token"
            type        = "n8n-nodes-base.if"
            typeVersion = 1
            position    = @(-208, 112)
            parameters  = @{
                conditions = @{
                    string = @(
                        @{
                            value1    = "={{ `$json.token }}"
                            operation = "equals"
                            value2    = "={{ `$env.REMOTE_TRIGGER_SECRET }}"
                        }
                    )
                }
            }
        },
        @{
            id          = "c21284a3-6375-4828-a9fb-2ca83ed5675e"
            name        = "Trigger GitHub Action"
            type        = "n8n-nodes-base.httpRequest"
            typeVersion = 3
            position    = @(0, 0)
            parameters  = @{
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
        },
        @{
            id          = "fe1930e2-e352-48cf-ad27-68377bf23591"
            name        = "Reject"
            type        = "n8n-nodes-base.respondToWebhook"
            typeVersion = 1
            position    = @(0, 208)
            parameters  = @{
                respondWith  = "json"
                responseBody = "={{ { success: false, error: 'Invalid token' } }}"
                options      = @{}
            }
        },
        @{
            id          = "d5e2e067-eace-4e3a-853e-43ff9399c26d"
            name        = "Success Response"
            type        = "n8n-nodes-base.respondToWebhook"
            typeVersion = 1
            position    = @(208, 0)
            parameters  = @{
                respondWith  = "json"
                responseBody = "={{ { success: true, workflow: `$json.workflow, message: 'Workflow triggered successfully' } }}"
                options      = @{}
            }
        }
    )
    connections = @{
        Webhook                 = @{
            main = @(@(@{ node = "Validate Token"; type = "main"; index = 0 }))
        }
        "Validate Token"        = @{
            main = @(
                @(@{ node = "Trigger GitHub Action"; type = "main"; index = 0 }),
                @(@{ node = "Reject"; type = "main"; index = 0 })
            )
        }
        "Trigger GitHub Action" = @{
            main = @(@(@{ node = "Success Response"; type = "main"; index = 0 }))
        }
    }
    settings    = @{
        executionOrder = "v1"
        availableInMCP = $true
    }
}

$body = $workflow | ConvertTo-Json -Depth 10

try {
    # 1. Update workflow
    $updateResponse = Invoke-RestMethod -Uri "https://ironforge-coolify.tailafb692.ts.net/api/v1/workflows/RgDX5gDwrj8gsKzw" -Method Put -Headers $headers -Body $body
    Write-Host "✅ Workflow update requested."

    # 2. Activate workflow
    $activateHeaders = @{
        "X-N8N-API-KEY" = $headers["X-N8N-API-KEY"]
        "Content-Type"  = "application/json"
    }
    # n8n activation endpoint might not need a body, but we'll send an empty object
    $activateResponse = Invoke-RestMethod -Uri "https://ironforge-coolify.tailafb692.ts.net/api/v1/workflows/RgDX5gDwrj8gsKzw/activate" -Method Post -Headers $activateHeaders -Body "{}"
    Write-Host "✅ Workflow activated successfully."
}
catch {
    Write-Error "❌ FAILED: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
