import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const API_KEY = process.env.HEVY_API_KEY;
const BASE_URL = 'https://api.hevyapp.com/v1';

async function testHevy() {
    console.log(`Testing Hevy API...`);
    if (!API_KEY) {
        console.error("Missing HEVY_API_KEY");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/workouts?page=1&pageSize=1`, {
            headers: {
                'api-key': API_KEY,
                'accept': 'application/json'
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            console.log("Success!");
            const data = await response.json();
            console.log("Data sample:", JSON.stringify(data).substring(0, 50));
        } else {
            const err = await response.text();
            console.error("Failed:", err);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testHevy();
