
import dotenv from 'dotenv';
import { getWellness } from '../src/lib/intervals';

dotenv.config();

async function checkApi() {
    const apiKey = process.env.INTERVALS_API_KEY;
    const athleteId = process.env.INTERVALS_ATHLETE_ID;

    if (!apiKey || !athleteId) {
        console.error("❌ Missing INTERVALS_API_KEY or INTERVALS_ATHLETE_ID in .env");
        process.exit(1);
    }

    console.log(`Connecting to Intervals.icu for Athlete ${athleteId}...`);

    try {
        const today = new Date().toISOString().split('T')[0];
        const data = await getWellness(today, apiKey, athleteId);

        if (!data) {
            console.log("⚠️ No wellness data found for today.");
            return;
        }

        console.log("✅ Data Received!");
        console.log("--- Fields Present ---");

        // Check specific fields requested
        // getWellness returns a normalized object if we look at lib/intervals.ts
        // Wait, getWellness calls API and returns... let's check lib/intervals via imports?
        // The script imports from src/lib/intervals.

        // Check for GPE Requirements
        const required = ['restingHR', 'hrv', 'sleepScore', 'comments', 'spO2', 'bodyBattery'];
        const missing = required.filter(k => !(k in data) && !(data as any)[k]);

        if (missing.length === 0) {
            console.log("✅ All Core GPE fields present.");
        } else {
            console.log("⚠️ Missing Fields:", missing.join(', '));
        }

        console.log("--- Sample Data ---");
        console.log(JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("❌ API Call Failed", e);
    }
}

checkApi();
