
# IronForge: The Titan Engine

IronForge is a gamified fitness application that turns your home gym workouts into an RPG. It integrates with Intervals.icu for cardio metrics, uses computer vision for rep counting, and features an AI-driven coaching system.

## Features

*   **Dynamic Quest Log:** Daily workouts synced from Intervals.icu.
*   **Ultrathink Engine:** AI-driven recovery analysis (TTB - Total Training Balance).
*   **Titan Vision:** Camera-based rep counting and depth detection.
*   **RPG Progression:** Skill trees, equipment armory, and ranks.
*   **Guild Hall:** Real-time multiplayer raid bosses.

## Tech Stack

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS, Three.js (R3F)
*   **Backend:** Node.js, Express (Proxy Server)
*   **AI:** Google Gemini 2.5 Flash
*   **Vision:** MediaPipe Tasks
*   **Database:** IndexedDB (Local), Supabase (Cloud Sync)

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    INTERVALS_API_KEY=your_key_here
    INTERVALS_ATHLETE_ID=your_id_here
    API_KEY=your_google_gemini_key_here
    HEVY_API_KEY=your_hevy_api_token_here
    ```

3.  **Run Application:**
    This command starts both the Backend Proxy (Port 3001) and Frontend (Port 5173).
    ```bash
    npm start
    ```

4.  **Access:**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

Build the frontend for production:
```bash
npm run build
```
