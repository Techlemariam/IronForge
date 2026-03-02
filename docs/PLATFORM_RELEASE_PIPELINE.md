# Platform Release Pipeline Architecture

Detta dokument beskriver IronForge's strategi för att säkerställa att varje kodändring är optimerad och verifierad för alla våra målplattformar. Denna pipeline är baserad på definitionerna i `PLATFORM_MATRIX.md`.

## 1. Vision & Syfte

Traditionell CI/CD testar bara ifall koden "fungerar". Vår **Platform Release Pipeline** testar ifall koden *fungerar bra i den kontext användaren befinner sig i*. En knapp som är perfekt på en datorskärm kan vara obrukbar från tre meter bort i "TV Mode" eller för liten för fingrar i "Mobile Web" med 3G-uppkoppling.

- **Inga kompromisser:** Vi pushar inte funktioner som prioriterar en plattform på bekostnad av en annan utan aktivt arkitektbeslut.
- **Kontext-verifikation:** En release *bevisar* att den fungerar via Playwright E2E Matrix.

## 2. CI/CD Matrix: The Verification Flow

Vi integrerar detta i `.github/workflows/ci-cd.yml` (efter `l2-verification` men före `deploy-verification`). Målet är en full Playwright Matrix Strategy.

### The Playwright Matrix

När E2E-testerna triggas körs de i parallella kontexter via `playwright.config.ts`:

1. **Desktop (Primary Acquisition & Planning)**
    - **Browser:** Chromium, Firefox, WebKit
    - **Viewport:** 1920x1080
    - **Input:** Mouse & Keyboard
    - **Focus:** Kompletta layouter, hover-states, "heavy lifting" (analys/charts).

2. **Mobile Web / PWA (Primary Retention)**
    - **Browser:** Mobile Safari/Chrome (Device Emulation)
    - **Viewport:** 390x844 (iPhone 12/13/14) o.d.
    - **Input:** Touch
    - **Simulering:** Throttlat nätverk (3G) samt nedstängning av nätverk mitt i tester (Offline-first / IndexedDB validering).
    - **Focus:** Logging, swipes, offline-tillgänglighet.

3. **TV Mode (Differentiation)**
    - **Viewport:** 1920x1080 (Skalat upp, "10-foot UI")
    - **Input:** Endast tangentbordspilar (Keyboard Navigation emulation).
    - **Focus:** Stora typsnitt, hög kontrast, auto-hide av UI, och (senare) Companion WebSocket pairing.

## 3. Playwright Projektkonfiguration (Arkitektur)

För att åstadkomma Matrix-tester, modifierar vi framtida `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // 1. Desktop
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    // 2. Mobile (Touch + Network constraints)
    {
      name: 'mobile',
      use: { 
        ...devices['Pixel 5'], 
        hasTouch: true,
      },
      // Framtida test: Offline-simulering
    },
    // 3. TV Mode (10-foot UI, Keyboard only)
    {
      name: 'tv',
      use: { 
        viewport: { width: 1920, height: 1080 },
        // Emulera en TV-environment där datan uppdateras passivt
      },
    },
  ],
});
```

## 4. Segmenterade Release Notes

Vår Changelog-generator eller `/writer` agent instrueras att sluta presentera platta listor av ändringar.
Vid varje taggad release byggs Release Notes upp i sektioner som:

- 💻 **Desktop & Analytics:** Vad hände för "Planners"?
- 📱 **Mobile & Gym:** Hur maximerar detta dagens pass?
- 📺 **TV & Companion:** Vad är the "Wow Factor" för hemmagymmet?

## 5. Implementationsplan

1. **[Fas 1 - Nu:]** Skapa `e2e/platform-smoke.spec.ts` som explicit tittar efter att specifik DOM laddas för specifika plattformar.
2. **[Fas 2:]** Uppdatera `ci-cd.yml` `🎭 E2E Tests` jobbet (rad ~197) att uttryckligen skriva ut resultaten per projekt-matris.
3. **[Fas 3 - Framtid:]** Vercel/Coolify "Platform Preview URLs" där UI/UX manuellt kan godkänna t.ex. `tv-preview.branch-name.ironforge.com`.
