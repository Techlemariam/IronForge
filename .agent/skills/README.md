# 🛠️ Agent Skills Registry

Modular specialist knowledge for IronForge workflows.

> **Auto-generated** by `generate-readme.ps1` - Do not edit manually.

## Structure

```
.agent/skills/[skill-name]/
├── SKILL.md       # Instructions & context
├── scripts/       # Executable helpers
└── tests/         # Skill tests
```

## Active Skills

| Skill | Version | Category | Description |
|:------|:-------:|:--------:|:------------|| [a11y-auditor](./a11y-auditor/SKILL.md) | 1.0.0 | analysis | Accessibility audit using axe-core |
| [balance-checker](./balance-checker/SKILL.md) | 1.0.0 | analysis | Combat and loot balance validation |
| [bio-validator](./bio-validator/SKILL.md) | 1.0.0 | analysis | Validates bio integration health (Intervals/Hevy) |
| [bundle-analyzer](./bundle-analyzer/SKILL.md) | 1.0.0 | analysis | Analyzes Next.js bundle size |
| [combat-balancer](./combat-balancer/SKILL.md) | 1.0.0 | domain | Analyzes and balances game combat and economy |
| [coolify-deploy](./coolify-deploy/SKILL.md) | 1.0.0 | automation | Coolify-specific deployment automation |
| [coverage-check](./coverage-check/SKILL.md) | 1.0.0 | analysis | Validates test coverage thresholds |
| [debt-scanner](./debt-scanner/SKILL.md) | 1.0.0 | analysis | Scans codebase for technical debt patterns |
| [env-validator](./env-validator/SKILL.md) | 1.0.0 | guard | Validates environment variables against schema |
| [figma-bridge](./figma-bridge/SKILL.md) | 1.0.0 | domain | Bi-directional Figma design integration via MCP |
| [gatekeeper](./gatekeeper/SKILL.md) | 1.1.0 | guard | Pre-commit quality gate (types, lint, tests) |
| [git-guard](./git-guard/SKILL.md) | 1.1.0 | guard | Prevents accidental commits to protected branches |
| [prisma-migrator](./prisma-migrator/SKILL.md) | 1.0.0 | domain | Handles Prisma schema changes with safe migrations |
| [project-linker](./project-linker/SKILL.md) | 1.0.0 | automation | Automates GitHub Project board integration |
| [schema-guard](./schema-guard/SKILL.md) | 1.0.0 | guard | Validates Prisma schema and detects drift |
| [sprint-manager](./sprint-manager/SKILL.md) | 1.0.0 | automation | Sprint planning and issue management automation |
| [storybook-bridge](./storybook-bridge/SKILL.md) | 1.0.0 | utility | Storybook development and visual testing integration |
| [sync-project](./sync-project/SKILL.md) | 1.0.0 | automation | Syncs GitHub Project with local roadmap and sprint data |
| [titan-health](./titan-health/SKILL.md) | 1.0.0 | analysis | Titan bio-data integration status |
| [titan-slice-generator](./titan-slice-generator/SKILL.md) | 1.0.0 | domain | Generates complete vertical slices from DB to UI |
| [xp-calculator](./xp-calculator/SKILL.md) | 1.0.0 | analysis | Validates XP formulas for game balance |

## Usage in Workflows

Reference skills via relative path:
```markdown
> Execute Skill: [skill-name](.agent/skills/skill-name/SKILL.md)
```

## Schema Validation

All SKILL.md files must conform to [SCHEMA.json](./SCHEMA.json).

## Adding New Skills

1. Create folder: `.agent/skills/[skill-name]/`
2. Add `SKILL.md` with required frontmatter (name, description, version)
3. Add `scripts/` with cross-platform scripts (.sh + .ps1)
4. Add `tests/` for validation
5. Run this script to regenerate README
