# 🎯 Remote Workflow Triggering

IronForge supports universal workflow triggering from any device or service.

## 📱 Triggering from GitHub Mobile

1. Open the GitHub Mobile app.
2. Navigate to the **IronForge** repository.
3. Go to the **Actions** tab.
4. Select the **🎯 Remote Trigger** workflow.
5. Tap **Run workflow**.
6. Enter the parameters:
   - **workflow**: The name of the workflow (e.g., `night-shift`, `polish`, `cleanup`).
   - **mode**:
     - `antigravity-signal`: Priorities Antigravity native execution (writes to `.agent/tasks`).
     - `direct-execution`: Force immediate execution on the GitHub runner.
   - **model**: Model selection (`gemini-2.5-flash` or `gemini-2.5-pro`).

## ☁️ Triggering via Google API

Use the script in `scripts/google-trigger.js` to integrate with Google Apps Script or Cloud Functions.

### Payload Schema

```json
{
  "event_type": "google-api-trigger",
  "client_payload": {
    "workflow": "night-shift",
    "mode": "antigravity-signal",
    "token": "YOUR_REMOTE_TRIGGER_SECRET",
    "model": "gemini-2.5-flash"
  }
}
```

## 🐳 Docker Optimization

Workflows now run in a pre-built Docker container (`Dockerfile.agent`).

- **Speed**: Reduces "Setup Node" and "Install Dependencies" time from ~2 mins to <30 seconds.
- **Consistency**: Guarantees the same environment across all triggers.
- **Image**: Built automatically via `.github/workflows/agent-image.yml`.

## 🔐 Security

- **REMOTE_TRIGGER_SECRET**: Required for `repository_dispatch` events.
- **GITHUB_PAT**: Required for API calls (must have `repo` and `workflow` scopes).
