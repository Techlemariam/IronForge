const url = 'https://ironforge-coolify.tailafb692.ts.net/webhook/ironforge-trigger';
const data = {
    workflow: '/health-check',
    token: process.env.REMOTE_TRIGGER_SECRET
};

console.log(`Sending to: ${url}`);
console.log(`Token: ${data.token}`);

// Node 18+ has native fetch
fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
    .then(async res => {
        console.log(`STATUS: ${res.status}`);
        console.log(`TEXT: ${await res.text()}`);
    })
    .catch(e => {
        console.error("FETCH ERROR:", e);
        if (e.cause) console.error("CAUSE:", e.cause);
    });
