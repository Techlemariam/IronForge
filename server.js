
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from Vite Frontend
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Server-side Credentials (The Vault)
// If these are set in the server environment, they override client-provided keys.
const SERVER_API_KEY = process.env.INTERVALS_API_KEY;
const SERVER_ATHLETE_ID = process.env.INTERVALS_ATHLETE_ID;
const HEVY_API_KEY = process.env.HEVY_API_KEY;

const INTERVALS_BASE_URL = 'https://intervals.icu/api/v1';

// Helper to construct Auth Header
const getAuthHeader = (clientKey) => {
    // Priority: Server Env -> Client Header (for flexibility)
    const key = SERVER_API_KEY || clientKey;
    if (!key) return null;
    return `Basic ${Buffer.from('API_KEY:' + key).toString('base64')}`;
};

// --- PROXY ENDPOINTS ---

// 1. GET Wellness Data
app.get('/api/wellness', async (req, res) => {
    const { date, athleteId } = req.query;
    const clientKey = req.headers['x-client-key'];
    
    const targetId = SERVER_ATHLETE_ID || athleteId;
    const authHeader = getAuthHeader(clientKey);

    if (!authHeader || !targetId) {
        return res.status(401).json({ error: 'Access Denied. Missing Credentials.' });
    }

    try {
        const response = await axios.get(`${INTERVALS_BASE_URL}/athlete/${targetId}/wellness/${date}`, {
            headers: { 'Authorization': authHeader }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`[Proxy Error] Wellness: ${error.message}`);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch wellness data from Oracle.' });
    }
});

// 2. GET Recent Activities
app.get('/api/activities', async (req, res) => {
    const { athleteId } = req.query;
    const clientKey = req.headers['x-client-key'];

    const targetId = SERVER_ATHLETE_ID || athleteId;
    const authHeader = getAuthHeader(clientKey);

    if (!authHeader || !targetId) {
        return res.status(401).json({ error: 'Access Denied. Missing Credentials.' });
    }

    try {
        const response = await axios.get(`${INTERVALS_BASE_URL}/athlete/${targetId}/activities?limit=5`, {
            headers: { 'Authorization': authHeader }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`[Proxy Error] Activities: ${error.message}`);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch activities.' });
    }
});

// 3. GET Calendar Events
app.get('/api/events', async (req, res) => {
    const { oldest, newest, athleteId } = req.query;
    const clientKey = req.headers['x-client-key'];

    const targetId = SERVER_ATHLETE_ID || athleteId;
    const authHeader = getAuthHeader(clientKey);

    if (!authHeader || !targetId) {
        return res.status(401).json({ error: 'Access Denied. Missing Credentials.' });
    }

    try {
        const response = await axios.get(`${INTERVALS_BASE_URL}/athlete/${targetId}/events?oldest=${oldest}&newest=${newest}`, {
            headers: { 'Authorization': authHeader }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`[Proxy Error] Events: ${error.message}`);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch events.' });
    }
});

// 4. GET Planned Workout (Today's Specific Quest)
app.get('/api/planned-workout', async (req, res) => {
    const { date, athleteId } = req.query;
    const clientKey = req.headers['x-client-key'];
    const targetId = SERVER_ATHLETE_ID || athleteId;
    const authHeader = getAuthHeader(clientKey);

    if (!authHeader || !targetId) {
        return res.status(401).json({ error: 'Access Denied. Missing Credentials.' });
    }

    try {
        // Fetch events for the specific date
        const response = await axios.get(`${INTERVALS_BASE_URL}/athlete/${targetId}/events?oldest=${date}&newest=${date}`, {
            headers: { 'Authorization': authHeader }
        });
        
        // Filter for the first workout found
        // Intervals categorizes structured training as 'WORKOUT'
        const workout = response.data.find(e => e.category === 'WORKOUT');
        
        if (workout) {
            res.json(workout);
        } else {
            res.status(404).json({ message: 'No workout planned for today.' });
        }
    } catch (error) {
        console.error(`[Proxy Error] Planned Workout: ${error.message}`);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch planned workout.' });
    }
});

// ---------------------------------------------------------
// HEVY ENDPOINTS (The Armory)
// ---------------------------------------------------------

// 1. GET ROUTINES (Dina sparade passmallar)
app.get('/api/hevy/routines', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });

    try {
        const response = await axios.get('https://api.hevyapp.com/v1/routines', {
            headers: { 'hevy-api-token': HEVY_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Routines Error:", error.message);
        res.status(500).send({ error: "Could not fetch Battle Plans." });
    }
});

// 2. GET WORKOUT HISTORY (För framtida analys/Weakness Auditor)
app.get('/api/hevy/workouts', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });
    
    // Hämta de senaste 10 passen som default
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;

    try {
        const response = await axios.get(`https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${pageSize}`, {
            headers: { 'hevy-api-token': HEVY_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy History Error:", error.message);
        res.status(500).send({ error: "Could not analyze past battles." });
    }
});

// POST: Spara avslutat pass till Hevy
app.post('/api/hevy/workout', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline." });

    const workoutData = req.body; // Måste vara formaterat enligt Hevy docs

    try {
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', workoutData, {
            headers: { 
                'hevy-api-token': HEVY_API_KEY,
                'Content-Type': 'application/json' 
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Save Error:", error.response?.data || error.message);
        res.status(500).send({ error: "Failed to save quest to Hevy Archive." });
    }
});

app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
    console.log(`🔒 Security Level: ${SERVER_API_KEY ? 'MAXIMUM (Server Key Active)' : 'STANDARD (Client Key Pass-through)'}`);
    console.log(`🏋️ Hevy Integration: ${HEVY_API_KEY ? 'ONLINE' : 'OFFLINE (Key Missing)'}`);
});
