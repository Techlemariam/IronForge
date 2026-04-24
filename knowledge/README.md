# 🧠 IronForge Knowledge Base

This directory contains persistent, high-level domain knowledge and architectural decisions that supplement the automated [Knowledge Graph](../.agent/memory/knowledge-graph.json).

## Structure by Domain

- **[META](./meta.md)**: Agent workflows, rules, and repository health.
- **[CI](./ci.md)**: Continuous Integration protocols, failure prevention, and historical context.
- **[GAME](./game.md)**: Gameplay systems, mechanics, and design philosophy.
- **[INFRA](./infra.md)**: Infrastructure, deployment, and database management.
- **[BIO](./bio.md)**: External API integrations (Hevy, Intervals.icu, Garmin), recovery tracking.
- **[AuDHD Design](./adhd-design.md)**: Neurodivergent-informed design patterns for Autism + ADHD.

## User Context

- **[USER.md](../USER.md)**: Alex's profile, AuDHD context, training setup, and preferences.

## Usage

Agents should consult these files during **Domain Sessions** to understand context that cannot be easily inferred from code alone.

**AuDHD Design patterns** (`adhd-design.md`) must be consulted before any UI/UX work. These are not optional guidelines — they are architectural requirements.

## Maintenance

- **Librarian**: Updates these files during `/librarian` workflows.
- **Architect**: Updates architectural decisions here.
- **Manager**: Reviews and validates against product strategy.
