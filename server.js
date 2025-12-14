
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

app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
    console.log(`🔒 Security Level: ${SERVER_API_KEY ? 'MAXIMUM (Server Key Active)' : 'STANDARD (Client Key Pass-through)'}`);
});
