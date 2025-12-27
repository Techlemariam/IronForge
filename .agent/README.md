# 📖 IronForge Workflow System Manual

## Snabbstart

Aktivera en workflow genom att skriva `/kommando` i chatten:

```
/manager          → Starta orchestration
/coder            → Implementera kod
/qa               → Kör tester
```

---

## 🎭 Agent Roster (29 workflows)

### Orchestration
| Command | Roll |
|:--------|:-----|
| `/manager` | Projektledare, delegerar till rätt agent |

### Engineering
| Command | Roll |
|:--------|:-----|
| `/architect` | Systemdesign, implementation_plan.md |
| `/coder` | Skriver kod |
| `/qa` | Tester, kvalitetssäkring |
| `/infrastructure` | DevOps, Docker, CI/CD |
| `/security` | Auth audits, Zod-validering, secret scans |

### Product & Design
| Command | Roll |
|:--------|:-----|
| `/analyst` | Krav, user stories |
| `/ui-ux` | Frontend design, Tailwind, animationer |
| `/game-designer` | Spelmekanik, balansering |

### Specialists
| Command | Roll |
|:--------|:-----|
| `/performance-coach` | Träningsfysiologi |
| `/titan-coach` | Bio-to-game translation |
| `/librarian` | Dokumentation, historik |
| `/cleanup` | Löser DEBT.md items |

### Meta & Process
| Command | Roll |
|:--------|:-----|
| `/pre-deploy` | Final check innan deploy |
| `/schema` | Prisma migrations |
| `/polish` | ESLint, Prettier, cleanup |
| `/perf` | Bundle analysis, Lighthouse |
| `/health-check` | System audit |
| `/evolve` | Self-improvement |

---

## 🔗 Standard-kedjor

### Feature Flow
```
/analyst → /architect → /schema → /coder → /polish → /qa → /pre-deploy
```

### Bug Fix
```
/qa → /coder → /qa
```

### UI Polish
```
/ui-ux → /coder → /ui-ux
```

### Release
```
/qa → /security → /perf → /pre-deploy → Deploy
```

---

## 💡 Tips

1. **Starta med `/manager`** om du är osäker – den delegerar automatiskt
2. **Kombinera workflows**: `/health-check` + `/evolve` ger fullständig audit
3. **Handoffs**: Manager skapar `.agent/handoffs/` för asynkront arbete
4. **Turbo-mode**: Lägg `// turbo` i workflow för auto-run

---

## 📁 Filstruktur

```
.agent/
├── workflows/       ← 29 workflow-definitioner
├── rules/           ← Bootstrap-protokoll
├── feedback/        ← Health reports, audits
├── handoffs/        ← Asynkrona delegationer
├── memory/          ← Preferences, learning
└── sprints/         ← Sprint history
```

---

## ⚡ Vanliga kommandon

| Scenario | Kommando |
|:---------|:---------|
| Ny feature | `/manager` eller `/feature [namn]` |
| Bugfix | `/qa` → `/coder` |
| Refaktorering | `/architect` → `/coder` → `/polish` |
| Deploy-check | `/pre-deploy` |
| Schema-ändring | `/schema` |
| Performance-audit | `/perf` |
| Full system-audit | `/health-check` + `/evolve` |
