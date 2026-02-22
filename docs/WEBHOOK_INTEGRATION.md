# Webhook Integration Guide

This document explains how to use the IronForge Factory MCP webhook server for triggering autonomous workflows from external systems.

## Overview

The webhook server provides an HTTP endpoint that external systems (n8n, Coolify, custom scripts) can use to trigger autonomous workflows in Antigravity.

## Starting the Webhook Server

### Enable in MCP Server

Set the `ENABLE_WEBHOOK_SERVER` environment variable to `true`:

**In `mcp_config.json`:**

```json
{
  "mcpServers": {
    "ironforge-factory": {
      "command": "node",
      "args": [
        "c:/Users/alexa/Workspaces/IronForge/mcp/factory-server/build/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
        "REPO_OWNER": "Techlemariam",
        "REPO_NAME": "IronForge",
        "ENABLE_WEBHOOK_SERVER": "true",
        "WEBHOOK_PORT": "3030",
        "WEBHOOK_SECRET": "${env:WEBHOOK_SECRET}"
      }
    }
  }
}
```

**Set environment variable:**

```powershell
[System.Environment]::SetEnvironmentVariable("WEBHOOK_SECRET", "your-secret-key", "User")
```

## Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**

```json
{
  "status": "healthy",
  "uptime": 12345.67,
  "timestamp": "2026-02-16T23:45:00Z"
}
```

**Example:**

```bash
curl http://localhost:3030/health
```

### Trigger Workflow

**POST** `/webhook/trigger`

Triggers an autonomous workflow via Antigravity.

**Headers:**

- `Content-Type: application/json`
- `X-Webhook-Signature: <hmac-sha256-signature>` (optional but recommended)

**Payload:**

```json
{
  "workflow": "night-shift",
  "model": "gemini-2.5-flash",
  "source": "n8n",
  "timestamp": "2026-02-16T23:45:00Z"
}
```

**Parameters:**

- `workflow` (required): Workflow name (`night-shift`, `cleanup`, `polish`, etc.)
- `model` (required): Model to use (`gemini-2.5-flash`, `gemini-2.5-pro`)
- `source` (optional): Source system identifier
- `timestamp` (optional): Trigger timestamp

**Response (Success):**

```json
{
  "success": true,
  "message": "Workflow triggered successfully",
  "workflow": "night-shift",
  "model": "gemini-2.5-flash",
  "taskPath": "C:\\Users\\alexa\\Workspaces\\IronForge\\.agent\\tasks\\current.md"
}
```

**Response (Error):**

```json
{
  "error": "Missing workflow or model"
}
```

## Authentication

### Signature Verification

To secure your webhooks, use HMAC-SHA256 signatures.

**Generate signature (Node.js):**

```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  workflow: "night-shift",
  model: "gemini-2.5-flash",
  source: "n8n"
});

const secret = "your-webhook-secret";
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log('Signature:', signature);
```

**Generate signature (Python):**

```python
import hmac
import hashlib
import json

payload = json.dumps({
    "workflow": "night-shift",
    "model": "gemini-2.5-flash",
    "source": "n8n"
})

secret = b"your-webhook-secret"
signature = hmac.new(secret, payload.encode(), hashlib.sha256).hexdigest()

print(f"Signature: {signature}")
```

**Send with signature:**

```bash
curl -X POST http://localhost:3030/webhook/trigger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: YOUR_SIGNATURE_HERE" \
  -d '{"workflow":"night-shift","model":"gemini-2.5-flash","source":"curl"}'
```

## Integration Examples

### n8n Integration

1. **HTTP Request Node:**
   - Method: `POST`
   - URL: `http://localhost:3030/webhook/trigger`
   - Authentication: `Header Auth`

2. **Headers:**

   ```json
   {
     "Content-Type": "application/json",
     "X-Webhook-Signature": "={{ $nodeParams['webhookSignature'] }}"
   }
   ```

3. **Body:**

   ```json
   {
     "workflow": "{{ $json.workflow }}",
     "model": "gemini-2.5-flash",
     "source": "n8n",
     "timestamp": "{{ $now.toISO() }}"
   }
   ```

4. **Code Node (for signature):**

   ```javascript
   const crypto = require('crypto');
   
   const payload = JSON.stringify({
     workflow: items[0].json.workflow,
     model: "gemini-2.5-flash",
     source: "n8n",
     timestamp: new Date().toISOString()
   });
   
   const signature = crypto
     .createHmac('sha256', $env.WEBHOOK_SECRET)
     .update(payload)
     .digest('hex');
   
   return [{
     json: {
       ...items[0].json,
       webhookSignature: signature
     }
   }];
   ```

### PowerShell Script

```powershell
$payload = @{
    workflow = "cleanup"
    model = "gemini-2.5-flash"
    source = "powershell"
    timestamp = (Get-Date -Format "o")
} | ConvertTo-Json

# Generate signature
$secret = $env:WEBHOOK_SECRET
$hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($secret))
$hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payload))
$signature = -join ($hash | ForEach-Object { $_.ToString("x2") })

# Send request
$headers = @{
    "Content-Type" = "application/json"
    "X-Webhook-Signature" = $signature
}

Invoke-RestMethod -Uri "http://localhost:3030/webhook/trigger" `
    -Method Post `
    -Headers $headers `
    -Body $payload
```

### GitHub Actions

```yaml
- name: Trigger Workflow via Webhook
  run: |
    $payload = @{
      workflow = "night-shift"
      model = "gemini-2.5-flash"
      source = "github-actions"
      timestamp = (Get-Date -Format "o")
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3030/webhook/trigger" `
      -Method Post `
      -ContentType "application/json" `
      -Body $payload
  shell: pwsh
```

## Testing

### Test Webhook Locally

```bash
# Health check
curl http://localhost:3030/health

# Trigger without signature
curl -X POST http://localhost:3030/webhook/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflow":"cleanup","model":"gemini-2.5-flash","source":"test"}'

# Verify task signal was created
cat C:\Users\alexa\Workspaces\IronForge\.agent\tasks\current.md
```

## Troubleshooting

### Webhook Server Not Starting

**Issue**: Server doesn't start or port is in use

**Solutions**:

- Check `ENABLE_WEBHOOK_SERVER=true` is set
- Verify port is not in use: `netstat -ano | findstr :3030`
- Change port: Set `WEBHOOK_PORT` environment variable
- Check MCP server logs

### Signature Verification Fails

**Issue**: Getting `401 Invalid signature` error

**Solutions**:

- Verify `WEBHOOK_SECRET` matches on both sides
- Check payload is EXACTLY the same (no extra whitespace)
- Ensure UTF-8 encoding
- Test without signature first, add after

### Task Signal Not Picked Up

**Issue**: Webhook succeeds but Antigravity doesn't pick up task

**Solutions**:

- Verify Antigravity is running
- Check `.agent/tasks/current.md` was created
- Restart Antigravity to reload MCP servers
- Check file permissions

## Security Best Practices

1. **Always use signatures** in production
2. **Use HTTPS** if exposing webhook publicly
3. **Rotate secrets** regularly
4. **Validate payload** strictly
5. **Rate limit** requests
6. **Log all webhook calls** for audit trail
7. **Use firewall** to restrict access

## Future Enhancements

- [ ] Add rate limiting
- [ ] Implement webhook retry logic
- [ ] Add webhook event log/history
- [ ] Support multiple webhook secrets
- [ ] Add webhook management API
- [ ] Integrate with API gateway
