
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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


app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
});
