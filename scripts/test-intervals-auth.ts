import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const API_KEY = process.env.INTERVALS_API_KEY || process.env.VITE_INTERVALS_API_KEY;
const USER_ID = process.env.INTERVALS_ATHLETE_ID || process.env.VITE_INTERVALS_ATHLETE_ID || process.env.INTERVALS_USER_ID;

const BASE_URL = 'https://intervals.icu/api/v1';

async function testAuth(method: 'Basic' | 'Bearer') {
    console.log(`Testing ${method} Auth...`);
    if (!API_KEY || !USER_ID) {
        console.error("Missing Keys");
        return;
    }

    let authHeader = '';
    if (method === 'Basic') {
        authHeader = `Basic ${btoa('API_KEY:' + API_KEY)}`;
    } else {
        authHeader = `Bearer ${API_KEY}`;
    }

    try {
        const response = await fetch(`${BASE_URL}/athlete/${USER_ID}/wellness?oldest=2024-01-01&newest=2024-01-01`, {
            headers: { 'Authorization': authHeader }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            console.log("Success!");
            const data = await response.json();
            console.log("Data sample:", JSON.stringify(data).substring(0, 50));
        } else {
            console.log("Failed.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
    console.log('---');
}

async function main() {
    console.log(`API Key Length: ${API_KEY?.length}`);
    await testAuth('Basic');
    await testAuth('Bearer');
}

main();
