---
description: "Enable intelligent Entropy-aware routing"
command: "/entropy"
category: "infrastructure"
trigger: "manual"
primary_agent: "@manager"
---
# Workflow: Entropy Mode
1. **Triage:** Kör pwsh c:/Users/alexa/Workspaces/calculate-entropy.ps1 -ConvId "SESSION_ID" för att bedöma uppgiften.
2. **Toggle:** Kör pwsh c:/Users/alexa/Workspaces/toggle-llm.ps1 entropy.
3. **Routing:** Låt outer-config.json delegera anrop baserat på score.
