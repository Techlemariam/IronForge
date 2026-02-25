const https = require('https');

const API_KEY = process.env.COOLIFY_API_KEY;
const HOST = "https://ironforge-coolify.tailafb692.ts.net";

if (!API_KEY) {
    console.error("COOLIFY_API_KEY is not set");
    process.exit(1);
}

function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const reqOptions = {
            method: options.method || 'GET',
            hostname: new URL(HOST).hostname,
            port: 443,
            path: path,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

async function main() {
    const action = process.env.COOLIFY_ACTION || 'list-apps';

    if (action === 'list-apps') {
        console.log("Listing Coolify applications...");
        try {
            const res = await request('/api/v1/applications');
            console.log("Status:", res.status);
            console.log(JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error("Failed to list apps:", e.message);
        }
    } else if (action === 'exec-cmd') {
        const uuid = process.env.APP_UUID;
        const command = process.env.CMD;
        console.log(`Executing command on ${uuid}: ${command}`);
        try {
            const res = await request(`/api/v1/applications/${uuid}/execute`, {
                method: 'POST',
                body: { command }
            });
            console.log("Status:", res.status);
            console.log(JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error("Failed to exec command:", e.message);
        }
    }
}

main();
