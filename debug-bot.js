const https = require('https');
const url = 'https://ironforge-coolify.tailafb692.ts.net/webhook/ironforge-trigger';
const data = JSON.stringify({
    workflow: '/health-check',
    token: process.env.REMOTE_TRIGGER_SECRET
});

console.log(`Sending to: ${url}`);
console.log(`Payload: ${data}`);

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    rejectUnauthorized: false
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error("ERROR:", e);
});

req.write(data);
req.end();
