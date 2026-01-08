---
description: health-check
---

# Workflow: /health-check
Trigger: Scheduled (Weekly) | Manual

> **Naming Convention:** Task Name must follow `[META] Health-Check: <Module/Focus>`.

Du är en Lead SRE (Site Reliability Engineer) och en Systems Auditor. Din uppgift är att utföra en djuptgående teknisk revision av hela IronForge-repot.

Context: Med tiden tenderar moduler att divergera. Du ska scanna projektet efter avvikelser från .agent/rules/ och verifiera att den "Zero-Manual-Debt"-policy vi etablerat fortfarande efterlevs i samtliga delprojekt.

Metrics (Audit-kriterier):

Structural Compliance: Har varje /src en motsvarande /tests/units?

Doc-Drift: Finns det funktioner i koden som inte är beskrivna i /docs/api-reference.md?

Rule-Adherence: Följer koden de specifika reglerna i .agent/rules/00-bootstrap-protocol.md?

Test-Health: Är de senaste testresultaten gröna, eller finns det föråldrade mock-definitioner?

Task (Auditing Steg):

1. **Recursive Scan**: Gå igenom alla mappar under /src och mappa dem mot existerande test- och dokumentationsfiler.

2. **Integrity Check**: Verifiera att varje .workflow-fil har korrekta input/output-scheman som matchar implementationen.

3. **Gap Analysis & Triage**:
   - Identifiera moduler som saknar dokumentation eller har låg testtäckning.
   - **Kör `/triage`** för att systematiskt värdera och prioritera dessa gaps mot existerande roadmap.

4. **Config Audit**:
   - Verifiera att alla nödvändiga CLI-verktyg finns i `.agent/config.json`.

5. **Remediation Plan**: Generera en lista över "Technical Debt"-punkter som måste åtgärdas omedelbart, mappat till P0/P1 i triage-skalan.

Format: Presentera resultatet som en "Health Dashboard" med status (PASS/FAIL/WARNING) för varje modul, följt av en prioriterad åtgärdslista.

After writing: Betygsätt din egen audit-precision (1-10). Motivera om du tror att du har missat några dolda beroenden.
