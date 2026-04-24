# 🤖 Agent Deployment & Branching Flows

Detta dokument utgör sanningen ("Ground Truth") för hur AI-agenter (och utvecklare) bygger, branchar och deployar funktionalitet över hela produktflottan (IronForge, Taktpinne, Matlogistik). Systemet är designat för snabb rörlighet mot staging och noll risk ("Zero Hell") mot produktion.

## 🧭 Flödeskartboken

Agenter hanterar kodändringar och leveranser via tre distinkta rutter, beroende på behov av stabilitet vs. hastighet.

### 1. Staging Fast-Track (`develop`)
**Syfte:** Snabba UI-iterationer, prototyper, och testning på levande server utan lokal "Works on my machine" friktion.
*   **Regel:** Agenter FÅR och BÖR committa/pusha direkt till `develop`.
*   **Aktion:** Triggad Coolify Webhook bygger omedelbart `develop` till Web Lite / Staging-miljön.
*   **Requirements:** Ingen Pull Request krävs.

### 2. Pull Request Previews (`feat/*`)
**Syfte:** Stora refaktoreringar eller helt nya features som kräver isolerad test-miljö och granskning *utan* att kontaminera `develop`.
*   **Regel:** Agenten checkar ut as `feat/min-massiva-ombyggnad` och öppnar en PR.
*   **Aktion:** Coolify genererar automatiskt en Pull Request Environment URL.
*   **Requirements:** Granskning i den isolerade miljön.

### 3. Production Zero-Hell (`main`)
**Syfte:** Oantastlig produktionsstabilitet.
*   **Regel:** Agenter (via `git-guard`) får ALDRIG committa direkt till `main`.
*   **Aktion:** För att nå prod MÅSTE en PR skapas (oftast från `develop` -> `main`). 

## 🛡️ The Zero-Hell Review Gate (Produktion)

Ett bygge till `main` är en ceremoni. Innan en kodrad blandas med produktion sker två grind-kontroller (Quality Gates).

### A. CI/CD Quality Gate (Projekt-Agnostisk)
Alla projekt MÅSTE ha en global gränssnittspunkt i `package.json` (eller `Makefile`):

`npm run agent:verify` ELLER `pnpm run agent:verify`

Agenten bryr sig inte om testernas implementation. Den anropar enbart kommandot och förväntar sig ett noll/grönt-värde tillbaka.
Under huven (beroende på projekt) exekverar ofta `turbo run`:
1. **Lint/Typ-Säkerhet** (`tsc --noEmit`, `eslint`)
2. **Unit & Logic Testing** (`vitest`, `playwright` E2E)
3. **Security Context** (`npm audit` / `pnpm audit` / `snyk`)

### B. Jules Review Gate
Efter att de automatiserade testerna (Quality Gate A) gått igenom, kallas **Jules** (arkitektur & PR Agent) in i flödet.
Jules analyserar:
1. Efterlevs specifika System Design KIs?
2. Finns det prestandaflaskhalsar, säkerhetshål av mänsklig karaktär?
3. Lämnar arkitekturen oacceptabel teknisk skuld bakom sig?

Först när CI passerat, Jules slutfört sin positiva ackreditering, och **Mänsklig Manager** (User) godkänt, mergas koden till `main`. Coolify Production trigger sker då via Webhook.
