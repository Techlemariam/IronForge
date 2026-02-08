# Git Hooks

Automatic skill activation via Git hooks.

## Installation

```bash
# Copy hooks to .git/hooks
cp .agent/hooks/pre-commit .git/hooks/pre-commit
cp .agent/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-commit .git/hooks/pre-push
```

Or use the install script:

```powershell
pwsh .agent/hooks/install.ps1
```

## Hooks

| Hook | Skills | When |
|:-----|:-------|:-----|
| `pre-commit` | gatekeeper (quick) | Before each commit |
| `pre-push` | git-guard, gatekeeper (full) | Before each push |

## Bypass (Emergency Only)

```bash
git commit --no-verify -m "message"
git push --no-verify
```
