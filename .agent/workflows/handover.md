---
description: "Workflow for handover"
command: "/handover"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Handover Workflow

Använd det här workflowet för att överlämna pågående arbete, kontext, eller felanalyser till en annan agent via Antigravitys "Shared Memory"-lager. Detta ersätter ad-hoc `.agent/handoffs/`-filer.

## Usage

```
/handover [receiver-agent] [topic]
```

**Mottagare (Exempel):** `@coder`, `@qa`, `@architect`, `@infrastructure`, `all`
**Topic (Exempel):** `HANDOFF`, `ALERT`, `TASK`, `REVIEW`

---

## Step 1: Sammanställ Kontext

Samla in relevant information från den aktuella sessionen:

1. **Mål:** Vad arbetades det med? (referera gärna till `task.md` eller `roadmap.md`)
2. **Filer ändrade:** Vilka filer har du rört?
3. **Problem:** Varför görs överlämningen? (Finns det ett test som failar, kraschar builden, eller är featuren helt enkelt klar för QA?)
4. **Nästa steg:** Vad exakt förväntas den mottagande agenten göra?

---

## Step 2: Bygg Meddelandet

Skapa innehållet (Markdown-format):

```markdown
### Överlämning: [Uppgiftens Namn]

**Kontext:** 
[Kort beskrivning av läget]

**Filer:**
- `src/components/MyComponent.tsx`
- `tests/my-component.spec.ts`

**Åtgärd Krävs:**
[Specifika instruktioner till nästa agent]
```

---

## Step 3: Skicka AgentMessage

Skicka meddelandet genom att exekvera sänd-scriptet:

```powershell
# Exempel
pwsh .agent/scripts/agent-message-send.ps1 `
  -To "@qa" `
  -From "@coder" `
  -Topic "HANDOFF" `
  -TaskId "R-03" `
  -Content "### Överlämning... [ditt markdown-innehåll]"
```

*Notera att om `-TaskId` (ex. "R-03") eller `-PRNumber` finns tillgängligt bör dessa skickas med för spårbarhet.*

> [!TIP]
> För multirads-innehåll (vilket rekommenderas), spara först din markdown-text i en temporär fil, läs in den som en variabel och skicka den.
>
> ```powershell
> $content = Get-Content -Raw -Path ./temp-message.md
> pwsh .agent/scripts/agent-message-send.ps1 -To "@coder" -From "@architect" -Topic "HANDOFF" -Content $content
> rm ./temp-message.md
> ```

---

## Inbox Check (När du startar en ny session)

När du (som mottagande agent) blir inkallad till en ny session (t.ex via ett `/domain-session` eller manuellt uppdrag), bör du alltid kolla din inbox.

```powershell
# Kolla meddelanden adresserade till din roll
pwsh .agent/scripts/agent-message-read.ps1 -Role "@coder"

# Kolla globala systemmeddelanden
pwsh .agent/scripts/agent-message-read.ps1 -Role "all"
```

Scriptet kommer automatiskt hämta alla `UNREAD` meddelanden och därefter markera dem som `READ`. Base your initial planning on the contents of these messages.
