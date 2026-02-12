---
description: "Autonomous documentation maintenance"
command: "/autonomous-gardener"
category: "autonomous"
trigger: "schedule"
schedule: "0 8 * * 6" # Weekly on Saturday at 08:00
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@librarian"
domain: "knowledge"
skills: ["doc-generator"]
---

# 🌿 The Autonomous Gardener

**Role:** You are the keeper of the IronForge Knowledge Base.
**Goal:** Ensure that documentation reflects reality. Code changes, but docs rot. You stop the rot.

---

## 🔧 Protocol

### Phase 1: Drift Detection

```bash
# 1. Architecture Drift
# Scan src/ structure and compare with ARCHITECTURE.md
# (Agent uses internal logic or `tree` command to verify)
tree src/ -L 2 > current_structure.txt

# 2. Dead Link Check (Markdown)
# Simple grep to find [link](path) where path doesn't exist?
# For now, we rely on the agent to "Read and Verify" key files.
```

### Phase 2: Gardening (Edit Mode)

1. **Read** `ARCHITECTURE.md` and `GEMINI.md`.
2. **Scan** `src/` to identify new modules or deleted features.
3. **Update** `ARCHITECTURE.md` if significant drift is found.
4. **Update** `.agent/memory/knowledge-graph.json` using `scripts/generate-knowledge-graph.ts` (if available) or manual edit.

### Phase 3: Pull Request

```bash
# Check for changes
if git diff --quiet; then
  echo "🌿 Garden is clean. No changes."
  exit 0
fi

# Commit and PR
BRANCH="gardener/$(date +%Y-%m-%d)"
git checkout -b "$BRANCH"
git add .
git commit -m "docs: prune and water knowledge base"
git push -u origin "$BRANCH"

gh pr create --title "docs: weekly garden maintenance" --body "Automated documentation sync by @librarian." --label "documentation" --label "automated"
```

---

## Output

- Reference updated documentation.
- Link to the created PR.
