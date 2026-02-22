---
name: n8n
description: "Trigger an n8n webhook"
metadata: {"clawdbot":{"emoji":"⚡","always":false}}
---

# n8n

Trigger an n8n webhook on your Coolify instance.

## Usage

```
/n8n <webhook-slug> [json-data]
```

Example:

```
/n8n my-workflow {"foo": "bar"}
```

## Implementation

This skill sends a POST request to your n8n instance.

```bash
# parse args
WEBHOOK_SLUG="$1"
DATA="${2:-{}}"

# validation
if [ -z "$WEBHOOK_SLUG" ]; then
  echo "Error: Webhook slug required. Usage: /n8n <slug> [data]"
  exit 1
fi

# config
BASE_URL="https://coolify.ironforge.com/webhook"
URL="$BASE_URL/$WEBHOOK_SLUG"

# execute
echo "🚀 Triggering n8n webhook: $WEBHOOK_SLUG"
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$DATA"
```
