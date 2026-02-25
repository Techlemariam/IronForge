const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.N8N_API_KEY;
const HOST = process.env.N8N_HOST || "https://ironforge-coolify.tailafb692.ts.net";

if (!API_KEY) {
    console.error("N8N_API_KEY is not set");
    process.exit(1);
}

const workflows = [
    'n8n/ci-triage-router.json',
    'n8n/reviewer-aggregator.json'
];

async function request(url, options = {}) {
    const { method = 'GET', headers = {}, body } = options;

    // Use global fetch if available (Node 18+)
    if (typeof fetch === 'function') {
        try {
            const res = await fetch(url, options);
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch (e) { data = text; }
            return { ok: res.ok, status: res.status, data };
        } catch (e) {
            console.warn("Fetch failed, falling back to https module:", e.message);
        }
    }

    // Fallback to https module
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            method,
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            headers: {
                ...headers,
                'Content-Length': body ? Buffer.byteLength(body) : 0
            },
            rejectUnauthorized: false // Required for Tailscale/Private SSL
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsedData;
                try { parsedData = JSON.parse(data); } catch (e) { parsedData = data; }
                resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsedData });
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(body);
        req.end();
    });
}

async function activate() {
    console.log("--- ACTIVATION BOOTSTRAP START ---");
    console.log(`Target Host: ${HOST}`);
    console.log(`API Key Length: ${API_KEY ? API_KEY.length : 0}`);

    console.log(`Starting activation on ${HOST}...`);

    for (const workflowPath of workflows) {
        console.log(`Looking for file: ${workflowPath}`);
        const filePath = path.resolve(workflowPath);
        if (!fs.existsSync(filePath)) {
            console.error(`Workflow file not found: ${workflowPath}`);
            continue;
        }

        const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Processing ${workflowPath} (Workflow: ${workflowData.name})...`);

        try {
            const headers = {
                'X-N8N-API-KEY': API_KEY,
                'Content-Type': 'application/json'
            };

            // 1. List workflows
            const { ok, status, data } = await request(`${HOST}/api/v1/workflows?limit=100`, { headers });

            if (!ok) {
                throw new Error(`Failed to list workflows: ${status} - ${JSON.stringify(data)}`);
            }

            const workflowsList = Array.isArray(data) ? data : (data.data || []);
            const existing = workflowsList.find(w => w.name === workflowData.name);

            let workflowId;
            if (existing) {
                workflowId = existing.id;
                console.log(`Workflow already exists with ID ${workflowId}. Updating...`);

                await request(`${HOST}/api/v1/workflows/${workflowId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(workflowData)
                });
            } else {
                console.log(`Creating new workflow...`);
                const createRes = await request(`${HOST}/api/v1/workflows`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(workflowData)
                });
                if (!createRes.ok) throw new Error(`Create failed: ${createRes.status} - ${JSON.stringify(createRes.data)}`);
                workflowId = createRes.data.id;
            }

            // 2. Activate
            console.log(`Activating workflow ${workflowId}...`);
            const activateRes = await request(`${HOST}/api/v1/workflows/${workflowId}/activate`, {
                method: 'POST',
                headers
            });

            if (activateRes.ok) {
                console.log(`✅ ${workflowData.name} activated successfully.`);
            } else {
                console.error(`❌ Failed to activate ${workflowData.name}: ${JSON.stringify(activateRes.data)}`);
            }
        } catch (error) {
            console.error(`Error processing ${workflowData.name || workflowPath}:`, error.message);
        }
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

activate().catch(err => {
    console.error("Activation failed:", err);
    process.exit(1);
});
