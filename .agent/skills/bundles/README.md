# Role Bundles

Agent skill presets that group related skills for specific personas.

## Usage

Reference a bundle in workflow:

```markdown
> Load Bundle: [guardian](bundles/guardian.yaml)
```

## Available Bundles

| Bundle | Agent | Skills |
|:-------|:------|:-------|
| guardian | @security | git-guard, gatekeeper, schema-guard, env-validator |
| feature-weaver | @coder | sprint-manager, sync-project, titan-slice-generator |
| quality-assurer | @qa | coverage-check, a11y-auditor, debt-scanner |
| titan-coach | @titan-coach | bio-validator, titan-health, xp-calculator, balance-checker |
| infrastructure | @infrastructure | coolify-deploy, project-linker, prisma-migrator |
