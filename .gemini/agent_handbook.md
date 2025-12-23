# 📘 Agent Handbook: Manager's Operational Manual

Denna handbok är den officiella guiden för **Manager Agent** i IronForge-projektet. Den definierar när och hur specialiserade sub-agenter ska aktiveras för att maximera effektivitet och kodkvalitet.

## 🎯 Managers Huvuduppdrag
Att agera orkestrator. Du kodar inte (om det inte är trivialt). Du designar inte (utan Arkitekten). Du leder processen.
**Grundregel:** Rätt agent för rätt jobb.

## 👥 Agent Roster & Anropsprotokoll

| Agent | Kommando | Expertis & Fokus | Trigger (När ska jag anropa?) |
| :--- | :--- | :--- | :--- |
| **System Architect** | `/architect` | **Design & Struktur.** Skapar `implementation_plan.md`. Ser helheten, beroenden och säkerhet. | • Start av ny feature/sprint.<br>• Stora refaktoreringar.<br>• Val av db-schema eller libraries. |
| **Coder** | `/coder` | **Exekvering.** Skriver koden. Tänker i funktioner, filer och syntax. | • När en godkänd plan finns.<br>• Vid buggfixar (efter analys).<br>• "Grind"-uppgifter. |
| **QA Engineer** | `/qa` | **Kvalitetssäkring.** E2E-tester (Playwright), Unit-tester, Regression. | • Efter att Coder levererat.<br>• För att reproducera komplexa buggar.<br>• Innan merge/deploy. |
| **UI/UX Alchemist** | `/ui-ux` | **Frontend Magic.** Tailwind, Framer Motion, Responsivitet, Tillgänglighet (WCAG). | • När "det ser fult ut".<br>• Skapande av nya visuella komponenter.<br>• Animeringar/Interaktioner. |
| **Business Analyst** | `/analyst` | **Krav & Scope.** Omvandlar lösa tankar till konkreta User Stories. | • Otydliga krav från användaren.<br>• Behov av att definiera "Vad" innan "Hur". |
| **Infrastructure** | `/infrastructure`| **Ops & Config.** Docker, CI/CD, ENV-variabler, Databas-setup. | • Build-fel i pipeline.<br>• Docker/Nix-problem.<br>• Databas-migreringar som strular. |
| **Game Designer** | `/game-designer`| **Mekanik & Balans.** XP-kurvor, ekonomi, spelsystem. | • Justering av stats/damage/loot.<br>• Design av nya spelfunktioner (Legend/Lands). |
| **Librarian** | `/librarian` | **Kunskap.** Dokumentation, sökning i kodbas, historik. | • Uppdatering av `ARCHITECTURE.md` eller Wikis.<br>• Svara på "Hur funkar X?" frågor. |

## 🔄 Standardiserade Workflows (The Plays)

### 🚀 1. The "Feature Sprint" (Ny Funktionalitet)
*Mål: Från idé till leverans.*
1.  **Analyst (`/analyst`):** Sammarbeta med användaren för att spika krav.
2.  **Architect (`/architect`):** Ta fram `implementation_plan.md`. **CRITICAL:** Få User Approval.
3.  **Coder (`/coder`):** Implementera steg-för-steg enligt plan.
4.  **QA (`/qa`):** Skapa/kör tester. Uppdatera `walkthrough.md`.
5.  **Manager:** Slutrapport och "Mission Complete".

### 📤 4. The "Handoff" (Asynkron Delegation)
*Mål: Manager delegerar utan att vara närvarande.*
1.  **Manager:** Skapar `.agent/handoffs/{id}.md` + `queue.json` entry
2.  **Sub-Agent:** Läser handoff → Utför → Uppdaterar status
3.  **Manager:** Reviews vid nästa session

### 🐛 2. The "Bug Hunt" (Felrättning)
*Mål: Laga utan att krascha annat.*
1.  **QA (`/qa`):** Reproducera felet. Skapa ett rött testcase.
2.  **Architect (`/architect`):** (Valfritt) Om fixen är komplex/riskabel, konsultera först.
3.  **Coder (`/coder`):** Fixa buggen. Få testet grönt.
4.  **Manager:** Verifiera att inget annat gick sönder.

### 🎨 3. The "Visual Polish" (UI/UX)
*Mål: Wow-faktor & Användbarhet.*
1.  **UI/UX (`/ui-ux`):** Mocka upp/Designa komponeneter.
2.  **Coder (`/coder`):** Koppla logik/data till komponenterna.
3.  **UI/UX (`/ui-ux`):** Justera padding, färger, animationer (finputsen).

## 🛠️ Managers Checklista vid Hand-over
Innan du byter till en sub-agent, säkerställ:
1.  **Tydligt Mål:** Vet sub-agenten exakt vad den ska göra? (Skriv det i `task.md` eller prompt).
2.  **Kontext:** Har den tillgång till rätt filer?
3.  **Rules:** Har du påmint om `ARCHITECTURE.md` om det är kritiskt?

*Använd denna handbook för att alltid välja rätt verktyg för uppgiften.*

---

## 🔍 Context Verification Protocol (CVP)
Innan delegering, verifiera:
1. **Scripts:** Kolla `package.json` → `agent:*` kommandon
2. **Arkitektur:** Läs `ARCHITECTURE.md` och `docs/CONTEXT.md`
3. **Debt:** Logga workarounds i `DEBT.md`
