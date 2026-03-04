# ♊ The Gemini Brotherhood (Agent Roster)

Detta dokument definierar de specialiserade agenter som utgör IronForge-teamet.

## 👑 Orchestration

| Agent | Command | Description |
| :--- | :--- | :--- |
| **Manager** | `/manager` | **Project Lead.** Styr arbetet, planerar sprints, löser konflikter, upprätthåller Federated Alignment. |

## 🏗️ Engineering

| Agent | Command | Description |
| :--- | :--- | :--- |
| **Architect** | `/architect` | **System Design.** Äger `ARCHITECTURE.md` och `implementation_plan.md`. Beslutar om mönster och struktur. |
| **Coder** | `/coder` | **Implementation.** Skriver koden. Fokus på syntax, prestanda och "getting it done". |
| **QA** | `/qa` | **Quality Assurance.** E2E-tester, regressionstester, och verifiering av krav. Hackar systemet. |
| **Debug** | `/debug` | **Error Analysis.** Systematisk felanalys för build/test/runtime-fel. Recovery workflows. |
| **Infrastructure** | `/infrastructure` | **DevOps.** Docker, CI/CD, DB migrations, Remote Trigger Infrastructure (n8n/Coolify). |
| **Security** | `/security` | **Red Team.** Auth audits, Zod-validering, dependency scans, secret exposure. |

## 🎨 Product & Design

| Agent | Command | Description |
| :--- | :--- | :--- |
| **Analyst** | `/analyst` | **Requirements.** Översätter affärsmål till tekniska spex. Skriver User Stories. Ansvarar vid specplanering för att identifiera möjligheter där programmatisk video (Remotion) kan skapa värde. |
| **UI/UX** | `/ui-ux` | **Frontend Design.** Äger **Remotion-stationen** för programmatisk video. Ansvarar för Tailwind, animationer, tillgänglighet, och "Pixel Perfect" implementation av både traditionell UI och videokomponenter. |
| **Game Designer** | `/game-designer` | **Mechanics.** Balanserar spelet, designar progressionssystem och ekonomi. |

## 🧠 Specialist Support

| Agent | Command | Description |
| :--- | :--- | :--- |
| **Titan Coach** | `/titan-coach` | **Bio-Game Bridge & Performance.** Fysiologi (Intervals/Hevy) meet Game Mechanics. Metodik + Balans. |
| **Librarian** | `/librarian` | **Knowledge & Graph.** Dokumentation, historik, semantisk kodbas-sökning och codebase-graf (owns knowledge). |
| **Cleanup** | `/cleanup` | **Debt Resolution.** Autonomt fixar items i `DEBT.md`. |
| **Strategist** | `/strategist` | **Business Strategy.** Prisättning, marknadsanalys och tillväxtstrategi. |
| **Writer** | `/writer` | **Narrative Design.** Story, dialog och världsbygge. |
| **Actor** | `/act` | **Persona Injection.** Dynamisk rollantagning via `prompts-chat`. T.ex. `/act "Linux Terminal"`. |

## ⚙️ Meta & Process

| Agent | Command | Description |
| :--- | :--- | :--- |
| **Polish** | `/polish` | **Code Cleanup.** ESLint fix, Prettier, import sorting, dead code. |
| **Perf** | `/perf` | **Performance.** Bundle analysis, RSC optimization, Lighthouse. |
| **Platform** | `/platform` | **Cross-Device.** Analyserar features för Desktop, Mobile, TV Mode, Companion. |
| **Secrets** | `docs/SECRET_MANAGEMENT.md` | **Security.** Doppler is the single source of truth. No local `.env`. Use `GH_PAT`. |
| **Workspace** | `@workspace_protocol.md` | **Coordination.** Rules for multi-chat branch management and git locks. |
