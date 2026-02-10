<#
.SYNOPSIS
  Lightweight HTTP Listener for n8n Triggering
.DESCRIPTION
  Listens on port 18790 for POST requests to /trigger-night-shift.
  Validates a Bearer token and executes 'night-shift-trigger.ps1'.
#>

param(
    [int]$Port = 18790,
    [string]$AuthToken = "ironforge-n8n-secret-2026" 
)

$ErrorActionPreference = "Stop"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$Port/")
$listener.Start()

Write-Host "📡 n8n Listener active on port $Port"
Write-Host "   Endpoint: POST http://localhost:$Port/trigger-night-shift"
Write-Host "   Auth: Bearer $AuthToken"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $logPrefix = "[$(Get-Date -Format 'HH:mm:ss')] $($request.RemoteEndPoint.Address)"
        Write-Host "$logPrefix Request: $($request.HttpMethod) $($request.Url.AbsolutePath)"

        # 1. Method Check
        if ($request.HttpMethod -ne "POST") {
            $response.StatusCode = 405
            $response.Close()
            continue
        }

        # 2. Path Check
        if ($request.Url.AbsolutePath -ne "/trigger-night-shift") {
            $response.StatusCode = 404
            $response.Close()
            continue
        }

        # 3. Auth Check
        $authHeader = $request.Headers["Authorization"]
        if ($authHeader -ne "Bearer $AuthToken") {
            Write-Warning "$logPrefix ⛔ Unauthorized access attempt"
            $response.StatusCode = 401
            $response.Close()
            continue
        }

        # 4. Execute Trigger
        Write-Host "$logPrefix 🚀 Triggering Night Shift..."
        
        $triggerScript = Join-Path $PSScriptRoot "night-shift-trigger.ps1"
        
        if (Test-Path $triggerScript) {
            # Run non-blocking job
            Start-Job -ScriptBlock {
                param($script)
                powershell -ExecutionPolicy Bypass -File $script
            } -ArgumentList $triggerScript | Out-Null
            
            $msg = "Night Shift triggered successfully at $(Get-Date)"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.StatusCode = 200
        }
        else {
            Write-Error "Trigger script not found at $triggerScript"
            $response.StatusCode = 500
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "Listener stopped."
}
