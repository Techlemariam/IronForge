# n8n Integration Templates

This directory contains pre-built n8n workflow templates for integrating with the IronForge Factory MCP webhook server.

## Available Templates

### 1. Scheduled Workflow Trigger

**File:** `scheduled-workflow-trigger.json`

**Description:** Automatically trigger autonomous workflows on a schedule (e.g., daily at 2 AM for night-shift)

**Features:**

- Schedule trigger (cron-based)
- Automatic signature generation
- HTTP webhook call
- Success/error notifications (Slack)

**Setup:**

1. Import template into n8n
2. Configure schedule in "Schedule: Daily 2 AM" node
3. Set workflow and model in "Generate Payload & Signature" node
4. Configure Slack notifications (optional)
5. Set `WEBHOOK_SECRET` environment variable in n8n
6. Activate workflow

### 2. Manual Workflow Trigger

**File:** `manual-workflow-trigger.json`

**Description:** Manually trigger workflows with custom parameters

**Features:**

- Manual trigger
- Configurable workflow and model parameters
- Signature generation
- HTTP webhook call

**Setup:**

1. Import template into n8n
2. Set workflow parameters in "Set Workflow Parameters" node
3. Set `WEBHOOK_SECRET` environment variable in n8n
4. Execute manually

## Environment Variables

Set these in n8n Settings → Variables:

```
WEBHOOK_SECRET=your-secure-webhook-secret
```

## Importing Templates

1. Open n8n
2. Click "+" to create new workflow
3. Click "⋮" (three dots) → "Import from File"
4. Select JSON template file
5. Configure nodes as needed
6. Save and activate

## Customization

### Change Workflow

Edit the JavaScript code node:

```javascript
const workflow = 'cleanup';  // Options: night-shift, polish, cleanup, etc.
const model = 'gemini-2.5-flash';  // Options: gemini-2.5-flash, gemini-2.5-pro
```

### Change Schedule

Edit the Schedule Trigger node:

- Mode: Hour
- Hour: 2 (2 AM)
- Minute: 0

### Add Multiple Workflows

Use the "Split Into Batches" node to trigger multiple workflows in sequence.

## Testing

### Test Connection

Add an HTTP Request node to test webhook health:

```
Method: GET
URL: http://localhost:3030/health
```

### Test Without Signature

For testing, you can temporarily remove signature verification by removing the `X-Webhook-Signature` header.

## Troubleshooting

### Connection Refused

**Issue:** `ECONNREFUSED localhost:3030`

**Solutions:**

- Verify webhook server is running
- Check `ENABLE_WEBHOOK_SERVER=true` in MCP config
- Restart MCP server
- Check firewall settings

### Invalid Signature

**Issue:** `401 Invalid signature`

**Solutions:**

- Ensure `WEBHOOK_SECRET` matches in both n8n and MCP server
- Check payload is stringified correctly
- Verify no extra whitespace in payload

### Workflow Not Triggered

**Issue:** Webhook succeeds but Antigravity doesn't execute

**Solutions:**

- Check Antigravity is running
- Verify `.agent/tasks/current.md` was created
- Check MCP server logs
- Restart Antigravity

## Advanced Examples

### Conditional Triggering

Trigger different workflows based on conditions:

```javascript
// In Code node
const hour = new Date().getHours();
const workflow = hour < 12 ? 'cleanup' : 'night-shift';
```

### Multi-Workflow Sequence

Trigger multiple workflows with delays:

1. HTTP Request → Trigger workflow 1
2. Wait (5 min)
3. HTTP Request → Trigger workflow 2

### Error Handling

Add error workflow for failed triggers:

1. Try: HTTP Request
2. Catch: Error notification + retry logic

## Resources

- [Webhook Integration Guide](../WEBHOOK_INTEGRATION.md)
- [Antigravity Quota Strategy](../ANTIGRAVITY_QUOTA_STRATEGY.md)
- [n8n Documentation](https://docs.n8n.io)
