
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const { INTERVALS_API_KEY, INTERVALS_USER_ID } = process.env;

app.use(cors());
app.use(express.json());

const getHevyApiKey = (req) => {
    const apiKey = req.headers['x-hevy-api-key'];
    if (!apiKey) {
        console.error("Hevy API key is missing from the request headers.");
    }
    return apiKey;
};

// --- HEVY ENDPOINTS (The Armory) ---

// GET ALL EXERCISE TEMPLATES (The Complete Codex)
app.get('/api/hevy/exercise-templates', async (req, res) => {
    const hevyApiKey = getHevyApiKey(req);
    if (!hevyApiKey) return res.status(401).send({ error: "Hevy API Key is required." });

    try {
        const url = 'https://api.hevyapp.com/v1/exercise_templates';
        let allExercises = [];
        let page = 1;
        let keepFetching = true;

        while (keepFetching) {
            try {
                const response = await axios.get(url, {
                    headers: { 'api-key': hevyApiKey },
                    params: { per_page: 100, page: page }
                });

                const exercises = response.data.exercise_templates;

                if (exercises && exercises.length > 0) {
                    allExercises.push(...exercises);
                    page++;
                } else {
                    keepFetching = false;
                }
            } catch (error) {
                // Hevy API returns an error when a page is out of bounds. We'll catch it to gracefully end the loop.
                if (error.response && error.response.data && error.response.data.error === 'Page not found') {
                    keepFetching = false; // This is the expected end of pagination.
                } else {
                    throw error; // For any other unexpected errors, we should fail loudly.
                }
            }
        }

        res.json({ exercise_templates: allExercises });

    } catch (error) {
        console.error("Hevy Codex Assembly Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({
            error: "Could not assemble the Exercise Codex.",
            details: error.response?.data
        });
    }
});

// GET ROUTINES
app.get('/api/hevy/routines', async (req, res) => {
    const hevyApiKey = getHevyApiKey(req);
    if (!hevyApiKey) return res.status(401).send({ error: "Hevy API Key is required." });

    try {
        const response = await axios.get('https://api.hevyapp.com/v1/routines', {
            headers: { 'api-key': hevyApiKey },
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        console.error("Failed to fetch Hevy routines:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({
            error: "Could not fetch Battle Plans.",
            details: error.response?.data
        });
    }
});

// GET WORKOUTS
app.get('/api/hevy/workouts', async (req, res) => {
    const hevyApiKey = getHevyApiKey(req);
    if (!hevyApiKey) return res.status(401).send({ error: "Hevy API Key is required." });

    try {
        const response = await axios.get('https://api.hevyapp.com/v1/workouts', {
            headers: { 'api-key': hevyApiKey },
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        console.error("Failed to fetch Hevy workouts:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({
            error: "Could not analyze past battles.",
            details: error.response?.data
        });
    }
});

// POST WORKOUT
app.post('/api/hevy/workout', async (req, res) => {
    const hevyApiKey = getHevyApiKey(req);
    if (!hevyApiKey) return res.status(401).send({ error: "Hevy API Key is required." });

    try {
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', req.body, {
            headers: {
                'api-key': hevyApiKey,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Save Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({
            error: "Failed to save to Archive.",
            details: error.response?.data
        });
    }
});

// ENDPOINT: Hämta historisk aktivitetsdata (för Weakness Auditor)
app.get('/api/intervals/history', async (req, res) => {
    if (!INTERVALS_API_KEY || !INTERVALS_USER_ID) {
        return res.status(500).send({ error: "Oracle Uplink Failed. API keys missing." });
    }

    // Beräkna datum för 90 dagar sedan (grovt, för att begränsa datasetet)
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
    const oldestDate = threeMonthsAgo.toISOString().split('T')[0];

    // Intervals API för aktiviteter
    // Vi lägger till fält i queryn för att få TSS (Training Stress Score) och tid i zoner.
    const url = `https://intervals.icu/api/v1/athlete/${INTERVALS_USER_ID}/activities?oldest=${oldestDate}&newest=${today}&include=tss,duration,type,zone_stats`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${INTERVALS_API_KEY}` }
        });

        // Returnera den filtrerade datan (den är rå, men det är bra)
        res.json(response.data);

    } catch (error) {
        console.error("Intervals History Error:", error.message);
        res.status(500).send({ error: "Could not retrieve historical cardio data." });
    }
});


app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
});
