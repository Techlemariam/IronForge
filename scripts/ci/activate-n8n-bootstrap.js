const fs = require('fs');
const path = require('path');

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

async function activate() {
    for (const workflowPath of workflows) {
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

            // 1. List workflows to find existing
            const listResponse = await fetch(`${HOST}/api/v1/workflows?limit=100`, { headers });

            if (!listResponse.ok) {
                const text = await listResponse.text();
                throw new Error(`Failed to list workflows: ${listResponse.status} - ${text}`);
            }

            const listData = await listResponse.json();
            const workflowsList = Array.isArray(listData) ? listData : (listData.data || []);
            const existing = workflowsList.find(w => w.name === workflowData.name);

            let workflowId;
            if (existing) {
                workflowId = existing.id;
                console.log(`Workflow already exists with ID ${workflowId}. Updating...`);

                await fetch(`${HOST}/api/v1/workflows/${workflowId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(workflowData)
                });
            } else {
                console.log(`Creating new workflow...`);
                const createResponse = await fetch(`${HOST}/api/v1/workflows`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(workflowData)
                });
                const createData = await createResponse.json();
                workflowId = createData.id;
            }

            // 2. Activate
            console.log(`Activating workflow ${workflowId}...`);
            const activateResponse = await fetch(`${HOST}/api/v1/workflows/${workflowId}/activate`, {
                method: 'POST',
                headers
            });

            if (activateResponse.ok) {
                console.log(`✅ ${workflowData.name} activated successfully.`);
            } else {
                const errText = await activateResponse.text();
                console.error(`❌ Failed to activate ${workflowData.name}: ${errText}`);
            }
        } catch (error) {
            console.error(`Error processing ${workflowData.name}:`, error.message);
        }
    }
}

activate();
