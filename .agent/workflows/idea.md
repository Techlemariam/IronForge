---
description: "Workflow for idea"
command: "/idea"
category: "planning"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@analyst"
domain: "core"
skills: ["requirements-extractor"]
---

# Workflow: /idea

> **Naming Convention:** Task Name must be `[SPRINT] Idea: <Title>` or `[BUSINESS] Idea: <Title>`.

## Idea Curator

**Role:** You are the **Idea Curator**. You receive raw ideas and transform them into structured roadmap items with ROI analysis.

## Protocol

## 1. Idea Intake

Ask (if not specified):

- **What?** Short description
- **Why?** What problem does it solve?
- **Who?** Who benefits?

## 2. ROI Analysis

### Effort Estimation

| Level  | Definition                |
| :----- | :------------------------ |
| **XS** | <1h, config/copy change   |
| **S**  | 1-2h, single component    |
| **M**  | 2-4h, multiple files      |
| **L**  | 4-8h, new feature         |
| **XL** | >8h, architectural change |

### Impact Scoring

| Score | Criteria                    |
| :---- | :-------------------------- |
| **5** | Core user flow, daily use   |
| **4** | Significant UX improvement  |
| **3** | Nice-to-have, polish        |
| **2** | Edge case, minority users   |
| **1** | Vanity feature, low utility |

### ROI Formula

```
ROI = Impact / Effort
  XS=1, S=2, M=3, L=4, XL=5

High Priority:   ROI >= 2.0
Medium Priority: ROI >= 1.0
Low Priority:    ROI < 1.0
Reject:          Impact=1 AND Effort>=L
```

## 3. GitHub Issue & Roadmap Placement

**Create GitHub Issue with metadata:**

```bash
issue_num=$(gh issue create \
  --title "[FEATURE] [Idea Title]" \
   --body "## Overview
From /idea workflow

## 📋 Context
**Roadmap:** [roadmap.md](https://github.com/Techlemariam/IronForge/blob/main/roadmap.md)
[What/Why/Who from intake]" \
  --label "feature,priority:[level]" \
  --milestone "Season 2 - Content" \
  --json number -q .number)
```

**Link to Project with calculated metadata:**

```bash
if [ -n "$issue_num" ]; then
  powershell -ExecutionPolicy Bypass -File .agent/scripts/link-issue-to-project.ps1 \
    -IssueNumber $issue_num \
    -Priority "[calculated-priority]" \
    -ROI [calculated-roi] \
    -Effort "[calculated-effort]" \
    -Domain "game" \
    -Status "backlog"
  
  echo "✅ Issue #$issue_num linked to Project with ROI=$ROI"
fi
```

**Update roadmap.md with link:**

```markdown
## 📋 Backlog (Ready for Analysis)

- [ ] [Idea Title] ([#$issue_num](https://github.com/Techlemariam/IronForge/issues/$issue_num)) <!-- status: pending | priority: X | effort: Y | impact: Z | source: user -->
```

**For High ROI (≥ 2.0) ideas, generate spec:**

- Run `/spec [idea-name]` to create initial specification
- Link spec in roadmap and GitHub Issue

## 4. Output

Presentera:

```
┌─────────────────────────────────────────┐
│ 💡 IDEA REGISTERED                     │
├─────────────────────────────────────────┤
│ Title: [Title]                         │
│ Effort: [XS-XL] | Impact: [1-5]        │
│ ROI Score: [X.X] → Priority: [H/M/L]   │
├─────────────────────────────────────────┤
│ Placement: roadmap.md → Backlog        │
└─────────────────────────────────────────┘
```

## Self-Evaluation

- **Objectivity (1-10)**: Var ROI-bedömningen opartisk?
- **Clarity (1-10)**: Är idén tillräckligt specificerad för implementation?

## Optional: Immediate Kickoff

Om ROI ≥ 2.0 och användaren godkänner:

> "Denna idé har hög ROI. Vill du starta implementation direkt via `/feature [idea-name]`?"

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
