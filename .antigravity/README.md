# Antigravity Auto Wake-up Configuration

This directory contains configuration for Antigravity's Auto Wake-up feature.

## Files

| File | Purpose |
|:-----|:--------|
| `wake-up.json` | Main configuration for scheduled wake-up workflows |

## How It Works

1. **Quota Reset Detection**: When your Antigravity quota resets (typically midnight UTC), the system checks `wake-up.json`.

2. **Workflow Execution**: If conditions are met, it runs the `primary` workflow (`/night-shift`).

3. **Fallback Handling**: If the primary fails or is blocked (e.g., dirty git), the `fallback` workflow runs instead.

4. **PR Creation**: On success, a summary PR is created with all changes.

## Configuration Options

### Schedule

```json
"schedule": {
  "preferredTime": "02:00",      // Local time (Europe/Stockholm)
  "daysOfWeek": ["monday", "wednesday", "friday"],
  "skipHolidays": false
}
```

### Conditions

| Condition | Default | Description |
|:----------|:--------|:------------|
| `requireCleanGit` | `true` | Skip if uncommitted changes exist |
| `skipIfPROpen` | `true` | Skip if a night-shift PR is pending review |
| `skipIfCIFailing` | `true` | Skip if main branch CI is red |
| `maxConsecutiveFailures` | `3` | Disable after N failures (requires manual reset) |

### Quota Management

```json
"quotaManagement": {
  "reservePercentage": 20,     // Always keep 20% for manual work
  "maxTokensPerSession": 50000 // Cap per wake-up session
}
```

## Manual Override

To trigger a wake-up manually:

```bash
# In Antigravity chat:
/night-shift

# Or via CLI (if configured):
antigravity wake-up --now
```

## Disabling

Set `"enabled": false` in `wake-up.json` to pause auto wake-up.
