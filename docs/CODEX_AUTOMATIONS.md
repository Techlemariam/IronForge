# Codex Automations

This file collects reusable Codex workflows for repo maintenance. These workflows are designed for safe, reviewable work: no deploys, no production access, no secrets, and no auto-merge.

## Shared Safety Rules

- Never work directly on `main`.
- Create a new branch from current `main`.
- Push branches only, never push directly to `main`.
- Open a Pull Request against `main`.
- Run only safe local/static commands unless the workflow explicitly says otherwise.
- Do not commit secrets, private IP addresses, host output, or local override files.
- Do not deploy.
- Do not auto-merge.

## Automation A: Weekly Repo Health Report

Run weekly or manually through Codex.

Input:

- `repo`

Do:

- Run `git status`.
- Identify language/framework.
- Find test/lint/build scripts.
- List open TODO/FIXME items.
- List old branches/PRs when GitHub access is available.
- Create `docs/reports/YYYY-MM-DD-repo-health.md` or a GitHub issue.

Constraints:

- No code changes.

## Automation B: Backlog Groomer

Input:

- `README`
- `docs/backlog.md`
- issues

Do:

- Propose top 5 next tasks.
- Mark quick wins.
- Mark risky tasks.
- Create issue suggestions.

Constraints:

- No code changes.

## Automation C: PR Review Assistant

Input:

- Current branch/PR

Do:

- Summarize diff.
- Assign risk class.
- Report test/lint results.
- Run security/secrets scan.
- Suggest reviewer checklist.

Constraints:

- No merge.

## Automation D: Small PR Generator

Input:

- One approved issue.

Do:

- Create branch.
- Implement minimal solution.
- Run tests.
- Open PR.

Constraints:

- No auto-merge.

## Prompt: Repo Health Watcher

```text
Du arbetar i repo: <IronForge eller Taktpinne>.

Mal:
Skapa en repo health report utan kodandringar.

Skapa branch:
chore/repo-health-report-YYYYMMDD

Gor:
1. Identifiera sprak, framework, package manager och entrypoints.
2. Hitta install/test/lint/build-kommandon.
3. Kor endast sakra lokala kommandon.
4. Lista TODO/FIXME och uppenbara dev-frictions.
5. Dokumentera i docs/reports/YYYY-MM-DD-repo-health.md.
6. Foresla topp 5 nasta tasks.

Sakerhetsregler:
- Inga secrets.
- Ingen deploy.
- Ingen production access.
- Ingen infra.
- Ingen kodandring utanfor docs/reports.
- Ingen auto-merge.

Validering:
- Kor test/lint om sakert och dokumentera resultat.
- git diff --check.
- secret scan mot andrade filer.

PR-output:
- Sammanfattning
- Kommandon korda
- Risker
- Rekommenderade nasta issues

Commit message:
Add repo health report
```
## Prompt: Backlog Groomer

```text
Du arbetar i repo: <IronForge eller Taktpinne>.

Mal:
Uppdatera backlog till en AI-agentvanlig lista med sma, konkreta tasks.

Skapa branch:
chore/backlog-grooming

Las:
- README
- docs/repo-readiness.md om den finns
- docs/backlog.md om den finns
- package/test config

Gor:
1. Skapa/uppdatera docs/backlog.md.
2. Dela in tasks:
   - Quick wins
   - Bugs/stability
   - Tests/quality
   - Product improvements
   - Larger later
3. Varje task ska ha:
   - titel
   - scope
   - berorda filer/moduler om mojligt
   - acceptance criteria
   - test command
   - riskniva
   - bra prompt for Codex

Sakerhetsregler:
- Endast docs/backlog.md och eventuellt docs/repo-readiness.md.
- Ingen kodandring.
- Ingen deploy.
- Inga secrets.

Commit message:
Groom development backlog
```

## Prompt: PR Review Assistant

```text
Du arbetar i repo: <IronForge eller Taktpinne>.

Mal:
Reviewa aktuell branch som om du ar senior reviewer.

Gor:
1. Las git diff mot main.
2. Sammanfatta andringen.
3. Identifiera risker:
   - correctness
   - security
   - secrets/config
   - tests
   - maintainability
4. Kor relevanta test/lint om mojligt.
5. Skapa docs/reviews/YYYY-MM-DD-branch-review.md.

Gor inga kodandringar utover review-dokumentet.

Output:
- Blocking issues
- Non-blocking suggestions
- Testresultat
- Rekommenderat merge/ej merge
```

## Prompt: Small PR Generator

```text
Du arbetar i repo: <IronForge eller Taktpinne>.

Mal:
Implementera exakt en liten backlog-task.

Task:
<klistra in task fran docs/backlog.md>

Regler:
- En logisk andring.
- Ingen stor refactor.
- Ingen ny dependency utan tydlig motivering.
- Inga secrets.
- Ingen deploy.
- Kor test/lint.
- Om scope vaxer, stoppa och rapportera.

PR ska innehalla:
- Problem
- Losning
- Testresultat
- Risk
- Rollback

Commit message:
<imperativ kort commit>
```

## PR Body Template

```markdown
## Syfte

Kort beskrivning av andringen.

## Andringar

-
-
-

## Sakerhetsgranser

- [ ] Inga live-kommandon mot Panopticon-hostar kordes
- [ ] Inga secrets committades
- [ ] Inga privata IP-adresser committades
- [ ] Ingen host-output committades
- [ ] Ingen andring av SSHD/firewall/root-login/deploy/rollback
- [ ] Lokala override-filer ar fortsatt ignored

## Validering

Korda kontroller:

git diff --check
ANSIBLE_CONFIG=$PWD/ansible.cfg ansible-playbook ... --syntax-check
ansible-lint ...
terraform fmt -recursive -check

Risk

Lag / Medel / Hog

Rollback

Revert PR eller specifik rollback-instruktion.
```
