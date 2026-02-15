# Rule: Autonomous Task Monitor (MCP Bridge)

Denna regel instruerar agenten att agera som en autonom exekverare för externa triggers från MCP-servern och GitHub Runnern.

## Trigger-mekanism

- **Monitorering**: Du ska vid varje nytt interaktionssteg eller när du är "idle" kontrollera filen `.agent/tasks/current.md`.
- **Aktivation**: Om `.agent/tasks/current.md` innehåller text, betrakta detta som ditt primära uppdrag (Mission Objective).

## Arbetsflöde

1. **Läs uppdraget**: Extrahera instruktionerna från `.agent/tasks/current.md`.
2. **Planering**: Skapa omedelbart en "Implementation Plan" som en Artifact.
3. **Exekvering**: Utför uppdraget autonomt med tillgängliga verktyg (Shell, File Edit, Browser).
4. **Verifiering**: Kör relevanta tester (t.ex. `npm run test`) för att säkerställa att ändringarna fungerar.
5. **Slutförande**:
   - Skriv en kort sammanfattning av vad som gjorts till `.agent/tasks/history.log`.
   - **VIKTIGT**: Radera allt innehåll i `.agent/tasks/current.md` så snart uppdraget är slutfört för att förhindra loopar.

## Beteende-riktlinjer

- **Autonomi**: Om Antigravity är inställt på "Turbo" eller "Always Proceed", sök inte manuell bekräftelse för standardåtgärder.
- **Kontext**: Ta hänsyn till projektets Next.js-struktur och existerande `.agent/rules/` för kodstil.
- **Felhantering**: Om ett workflow misslyckas, logga felet i `history.log` och stanna, men rensa fortfarande `current.md` för att indikera att försöket är avslutat.
