# 🧠 IronForge Knowledge Base

This directory contains persistent, high-level domain knowledge and architectural decisions that supplement the automated [Knowledge Graph](../.agent/memory/knowledge-graph.json).

## Structure by Domain

- **[META](./meta.md)**: Agent workflows, rules, and repository health.
- **[CI](./ci.md)**: Continuous Integration protocols, failure prevention, and historical context.
- **[GAME](./game.md)**: Gameplay systems, mechanics, and design philosophy.
- **[INFRA](./infra.md)**: Infrastructure, deployment, and database management.

## Usage

Agents should consult these files during **Domain Sessions** to understand context that cannot be easily inferred from code alone.

## Maintenance

- **Librarian**: Updates these files during `/librarian` workflows.
- **Architect**: updates architectural decisions here.
