
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

// --- HEVY ENDPOINTS (The Armory) ---

// GET ALL EXERCISE TEMPLATES (The Complete Codex)
app.get('/api/hevy/exercise-templates', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });

    try {
        console.log("Assembling the Complete Exercise Codex...");
        const firstPageResponse = await axios.get('https://api.hevyapp.com/v1/exercise_templates', {
            headers: { 'api-key': HEVY_API_KEY },
            params: { pageSize: 100, page: 1 } 
        });

        let allTemplates = firstPageResponse.data.exercise_templates;
        const pageCount = firstPageResponse.data.page_count;

        if (pageCount > 1) {
            const pagePromises = [];
            for (let i = 2; i <= pageCount; i++) {
                pagePromises.push(
                    axios.get('https://api.hevyapp.com/v1/exercise_templates', {
                        headers: { 'api-key': HEVY_API_KEY },
                        params: { pageSize: 100, page: i }
                    })
                );
            }
            const subsequentPageResponses = await Promise.all(pagePromises);
            subsequentPageResponses.forEach(response => {
                allTemplates = allTemplates.concat(response.data.exercise_templates);
            });
        }

        console.log(`Codex Assembled. Total Exercises: ${allTemplates.length}`);
        res.json({ exercise_templates: allTemplates });

    } catch (error) {
        console.error("Hevy Codex Assembly Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).send({ 
            error: "Could not assemble the Exercise Codex.",
            details: error.response?.data
        });
    }
});


// Other endpoints...
app.get('/api/hevy/routines', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });
    try {
        const params = new URLSearchParams({ page: req.query.page || 1, pageSize: req.query.pageSize || 50 }).toString();
        const response = await axios.get(`https://api.hevyapp.com/v1/routines?${params}`, { headers: { 'api-key': HEVY_API_KEY } });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send({ error: "Could not fetch Battle Plans.", details: error.response?.data });
    }
});

app.get('/api/hevy/workouts', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline. Missing API Key." });
    try {
        const params = new URLSearchParams({ page: req.query.page || 1, pageSize: req.query.pageSize || 10 }).toString();
        const response = await axios.get(`https://api.hevyapp.com/v1/workouts?${params}`, { headers: { 'api-key': HEVY_API_KEY } });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send({ error: "Could not analyze past battles.", details: error.response?.data });
    }
});

// POST: Spara avslutat pass till Hevy
app.post('/api/hevy/workout', async (req, res) => {
    if (!HEVY_API_KEY) return res.status(500).send({ error: "Hevy Uplink Offline." });

    console.log("Receiving workout data...");
    const payload = req.body;

    try {
        // Hevy API förväntar sig data i formatet { "workout": { ... } }
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', payload, {
            headers: { 
                'hevy-api-token': HEVY_API_KEY,
                'Content-Type': 'application/json' 
            }
        });
        console.log("Workout saved successfully to Hevy!");
        res.json(response.data);
    } catch (error) {
        console.error("Hevy Save Error:", error.response?.data || error.message);
        // Skicka tillbaka felet till frontend så vi kan visa det
        res.status(500).send({ error: "Failed to save to Archive.", details: error.response?.data });
    }
});


app.listen(PORT, () => {
    console.log(`🏰 The Sentry Tower (Proxy) is active on port ${PORT}`);
});
