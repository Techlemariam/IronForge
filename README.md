# ⚔️ IronForge RPG: The Titan Engine

**IronForge RPG** is an AI-augmented strength training platform that transforms your fitness journey into a grand strategy RPG. Train, battle raid bosses, and ascend through the ranks.

![Banner](/public/logo-rpg.png)

## 🚀 Key Features

*   **🧠 The Oracle AI**: Adaptive training intelligence (Gemini 2.5 Flash) that analyzes recovery, sleep, and performance to generate tailored programs.
*   **⚔️ Boss Battles & PvP**: Join factions, battle raid bosses, and compete in PvP seasons where physical effort deals real digital damage.
*   **📊 Cross-Domain Integration**: Unified fitness data from **Hevy** (Strength) and **Intervals.icu** (Physiology/Cardio).
*   **🏆 RPG Progression**: Deep skill trees, equipment armory, and ranks that reflect your real-world progress.
*   **🌌 Titan Vision**: Computer vision-based rep counting and form detection (MediaPipe).

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **Database**: PostgreSQL via [Prisma](https://www.prisma.io/) & [Supabase](https://supabase.com/)
*   **AI**: Google Gemini 2.5 Flash
*   **Styling**: Tailwind CSS & shadcn/ui
*   **Verification**: Vitest (Unit/Integration) & Playwright (E2E)
*   **Deployment**: Vercel & GitHub Actions

## 💻 Local Setup

1.  **Clone & Install**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file based on [.env.example](.env.example):
    ```env
    DATABASE_URL="your-postgres-url"
    DIRECT_URL="your-direct-url"
    INTERVALS_API_KEY="your-key"
    INTERVALS_ATHLETE_ID="your-id"
    HEVY_API_KEY="your-token"
    ```

3.  **Database Migration**:
    ```bash
    npx prisma migrate dev
    ```

4.  **Launch**:
    ```bash
    npm run dev
    ```

## 🛡️ Best Practices

### Branch Protection (Recommended)
This repo is configured to enforce quality via Pull Requests.
1. Go to **Settings > Branches**.
2. Add rule for `main`:
   - [x] **Require a pull request before merging**
   - [x] **Require status checks to pass before merging**
     - Search and select: `verify` (Lint/Test/Build)
     - Search and select: `e2e` (optional but recommended)
   - [x] **Do not allow bypassing the above settings**

## 🚢 Deployment

IronForge RPG is optimized for **Vercel**. Every push to `main` is automatically verified and deployed.

- **Production**: [ironforge-rpg.vercel.app](https://ironforge-rpg.vercel.app)
- **CI/CD**: Managed via GitHub Actions (`agent-verify.yml` and `deploy.yml`).

## 📜 License

Private Repo - &copy; 2025 IronForge RPG.
