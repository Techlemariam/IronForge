import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from Vite Frontend
app.use(cors({ origin: ['http://localhost:5173', 'https://5175-firebase-ironforge-1765880389106.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev'] }));
app.use(express.json());

// Server-side Credentials (The Vault)
const SERVER_API_KEY = process.env.INTERVALS_API_KEY;
const SERVER_ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID;
const HEVY_API_KEY = process.env.HEVY_API_KEY;

const INTERVALS_BASE_URL = 'https://intervals.icu/api/v1';

// Helper to construct Auth Header
const getAuthHeader = (clientKey) => {
    const key = SERVER_API_KEY || clientKey;
    if (!key) return null;
    return `Basic ${Buffer.from('API_KEY:' + key).toString('base64')}`;
};

// --- PROXY ENDPOINTS ---

// ... (Intervals.icu endpoints remain unchanged) ...

// ---------------------------------------------------------
// HEVY ENDPOINTS (The Armory)
// ---------------------------------------------------------

// 1. GET ROUTINES
app.get('/api/hevy/routines', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });

    try {
        // Manually construct query string to prevent errors
        const params = new URLSearchParams({
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 50,
        }).toString();

        const response = await axios.get(`https://api.hevyapp.com/v1/routines?${params}`, {
            headers: { 'api-key': HEVY_API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Routines Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({ 
            error: "Could not fetch Battle Plans.",
            details: error.response?.data
        });
    }
});

// 2. GET WORKOUT HISTORY
app.get('/api/hevy/workouts', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });
    
    try {
        // Manually construct query string
        const params = new URLSearchParams({
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 10,
        }).toString();

        const response = await axios.get(`https://api.hevyapp.com/v1/workouts?${params}`, {
            headers: { 'api-key': HEVY_API_KEY },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy History Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({ 
            error: "Could not analyze past battles.",
            details: error.response?.data 
        });
    }
});

// POST: Save workout to Hevy
app.post('/api/hevy/workout', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline." });

    try {
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', req.body, {
            headers: { 
                'api-key': HEVY_API_KEY,
                'Content-Type': 'application/json' 
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Save Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({ 
            error: "Failed to save quest to Hevy Archive.",
            details: error.response?.data
        });
    }
});

app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
    console.log(`🔒 Security Level: ${SERVER_API_KEY ? 'MAXIMUM (Server Key Active)' : 'STANDARD (Client Key Pass-through)'}`);
    console.log(`🏋️ Hevy Integration: ${HEVY_API_KEY ? 'ONLINE' : 'OFFLINE (Key Missing)'}`);
});
