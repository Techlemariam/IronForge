# Kodbasgenomgång – föreslagna aktiviteter (2026-05-20)

## 1) Stavfel
- **Observation:** Testnamnet och kommentaren använder "warmup" istället för den mer konsekventa formen "warm-up" som används i övrig dokumentation/stil.
- **Plats:** `tests/unit/lib/volume.test.ts`
- **Aktivitet:**
  1. Byt text i testbeskrivning/kommentarer från `warmup` till `warm-up`.
  2. Kör en snabb sökning i testkatalogen för att harmonisera samma stavning.
  3. Kör berörda tester för att säkerställa att ändringen enbart är textuell.

## 2) Bugg
- **Observation:** I budgetberäkningen sätts `baselineRHR` alltid till `60` oavsett `baseMetrics`:
  `const baselineRHR = baseMetrics?.hrvBaseline ? 60 : 60;`
  Detta gör villkoret verkningslöst och riskerar felaktig återhämtningslogik.
- **Plats:** `src/services/budget-calculator.ts`
- **Aktivitet:**
  1. Inför ett faktiskt baseline-fält för vilopuls i `SystemMetrics` (t.ex. `restingHrBaseline`).
  2. Använd detta i beräkningen med vettig fallback.
  3. Lägg till/uppdatera enhetstest som täcker hög/låg vilopuls relativt baseline.

## 3) Avvikelse i kommentarer/dokumentation
- **Observation:** Kommentaren för stegregeln säger "Low step count" men kodgrenen förstärker CNS vid **högt** stegvärde (`> 10000`). Kommentarens formulering skapar tvetydighet mot implementationen.
- **Plats:** `src/services/budget-calculator.ts`
- **Aktivitet:**
  1. Dela upp kommentaren i två tydliga rader: en för hög aktivitetsnivå (`>10000`) och en för låg (`<2000`).
  2. Verifiera att samma semantik används i eventuell produktdokumentation för readiness/budget.

## 4) Testförbättring
- **Observation:** Testet "VC-03: Excludes warmup sets" återanvänder i praktiken samma förväntning som VC-01 och verifierar inte isolerat att just warm-up-filter fungerar.
- **Plats:** `tests/unit/lib/volume.test.ts`
- **Aktivitet:**
  1. Skapa ett separat testfall med endast warm-up-set och förvänta `0` volym.
  2. Lägg till gränsfall med blandade settyper (`normal`, `warmup`, ev. `drop`).
  3. Säkerställ att testnamn uttrycker en enda tydlig assertion per test.
