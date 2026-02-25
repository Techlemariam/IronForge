const https = require('https');

const API_KEY = process.env.COOLIFY_API_KEY;
const HOST = "https://ironforge-coolify.tailafb692.ts.net";

if (!API_KEY) {
    console.error("COOLIFY_API_KEY is not set");
    process.exit(1);
}

console.log("Environment Check:", {
    HAS_API_KEY: !!API_KEY,
    HOST: HOST,
    ACTION: process.env.COOLIFY_ACTION,
    APP_UUID: process.env.APP_UUID,
    CMD: process.env.CMD
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

function request(path, options = {}) {
    console.log(`> Request: ${options.method || 'GET'} ${path}`);
    return new Promise((resolve, reject) => {
        try {
            const url = new URL(HOST);
            const reqOptions = {
                method: options.method || 'GET',
                hostname: url.hostname,
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
                console.log(`< Response Status: ${res.statusCode}`);
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, data });
                    }
                });
            });

            req.on('error', (e) => {
                console.error("!! Request Error:", e.message);
                reject(e);
            });

            if (options.body) {
                const body = JSON.stringify(options.body);
                console.log(`> Body: ${body}`);
                req.write(body);
            }
            req.end();
        } catch (err) {
            console.error("!! Setup Error:", err.message);
            reject(err);
        }
    });
}

async function main() {
    const action = process.env.COOLIFY_ACTION || 'list-apps';

    if (action === 'list-apps') {
        console.log("!!! STARTING LIST-APPS OPERATION !!!");
        try {
            const res = await request('/api/v1/services');
            console.log("!!! API RESPONSE RECEIVED !!!");
            console.log("Status Code:", res.status);
            console.log("--- DATA START ---");
            console.log(JSON.stringify(res.data, null, 2));
            console.log("--- DATA END ---");
        } catch (e) {
            console.error("!!! FAILED TO LIST APPS !!!", e.message);
        }
    } else if (action === 'exec-cmd') {
        const uuid = process.env.APP_UUID;
        const command = process.env.CMD;
        console.log(`!!! STARTING EXEC-CMD OPERATION on ${uuid} !!!`);
        console.log(`Command: ${command}`);
        try {
            const res = await request(`/api/v1/applications/${uuid}/execute`, {
                method: 'POST',
                body: { command }
            });
            console.log("!!! EXEC RESPONSE RECEIVED !!!");
            console.log("Status Code:", res.status);
            console.log(JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error("!!! FAILED TO EXEC COMMAND !!!", e.message);
        }
    }
}

main();
