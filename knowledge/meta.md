# 🧠 Domain: META

**Owner:** @manager, @librarian
**Focus:** Workflows, Documentation, Rules, Repository Health.

## 🔑 Key Workflows

- **`/domain-session`**: The entry point for focused development. Loads domain context.
- **`/librarian`**: Manages documentation and knowledge graph.
- **`/evolve`**: Handles major version upgrades and system evolution.
- **`/triage`**: Sorts and prioritizes backlog items.

## 📜 Core Documents

1. **`GEMINI.md`**: The Agent Roster. Defines roles and responsibilities.
2. **`ARCHITECTURE.md`**: The technical North Star.
3. **`.antigravityrules`**: Strict operational rules (Server-First, Zero-Debt).

## 🤖 Agents

- **Manager**: Orchestration and planning.
- **Librarian**: Knowledge management.
- **Cleanup**: Technical debt resolution.

## 💡 Insights & Decisions

- **Workflow Metadata**: All workflows must have standardized YAML frontmatter for telemetry and parsing.
- **Knowledge Graph**: Stored in `.agent/memory/knowledge-graph.json`. Generated via `scripts/generate-knowledge-graph.ts`.
