import { createServer } from 'http';
import { parse } from 'url';
import crypto from 'crypto';
const PORT = process.env.WEBHOOK_PORT || 3030;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'ironforge-webhook-secret';
/**
 * Webhook server for receiving workflow triggers from external systems (n8n, Coolify, etc.)
 */
export function startWebhookServer() {
    const server = createServer(async (req, res) => {
        const parsedUrl = parse(req.url || '', true);
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Signature');
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        // Health check endpoint
        if (parsedUrl.pathname === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }));
            return;
        }
        // Webhook trigger endpoint
        if (parsedUrl.pathname === '/webhook/trigger' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const payload = JSON.parse(body);
                    // Verify signature if provided
                    const signature = req.headers['x-webhook-signature'];
                    if (signature) {
                        const expectedSignature = crypto
                            .createHmac('sha256', WEBHOOK_SECRET)
                            .update(body)
                            .digest('hex');
                        if (signature !== expectedSignature) {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid signature' }));
                            return;
                        }
                    }
                    // Validate payload
                    if (!payload.workflow || !payload.model) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Missing workflow or model' }));
                        return;
                    }
                    // Import dynamically to avoid circular dependencies
                    const fs = await import('fs');
                    const path = await import('path');
                    // Write task signal for Antigravity
                    const taskDir = path.resolve(process.cwd(), '../../.agent/tasks');
                    const taskPath = path.join(taskDir, 'current.md');
                    const taskContent = `# Autonomous Mission: ${payload.workflow}
Model: ${payload.model}
Triggered via Webhook at ${new Date().toISOString()}
Source: ${payload.source || 'external'}

## Instructions
Execute the \`/${payload.workflow}\` workflow using the ${payload.model} model.

This task was triggered by an external webhook and should use Antigravity's native quota system.

## Webhook Details
- Timestamp: ${payload.timestamp || new Date().toISOString()}
- Source: ${payload.source || 'unknown'}
`;
                    if (!fs.existsSync(taskDir)) {
                        fs.mkdirSync(taskDir, { recursive: true });
                    }
                    fs.writeFileSync(taskPath, taskContent);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Workflow triggered successfully',
                        workflow: payload.workflow,
                        model: payload.model,
                        taskPath: taskPath
                    }));
                    console.log(`✅ Webhook trigger successful: ${payload.workflow} (${payload.model})`);
                }
                catch (error) {
                    console.error('Webhook error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                }
            });
            return;
        }
        // 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    });
    server.listen(PORT, () => {
        console.log(`🌐 Webhook server listening on port ${PORT}`);
        console.log(`   Health: http://localhost:${PORT}/health`);
        console.log(`   Trigger: http://localhost:${PORT}/webhook/trigger`);
    });
    return server;
}
// Generate signature for webhook authentication
export function generateWebhookSignature(payload, secret = WEBHOOK_SECRET) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
