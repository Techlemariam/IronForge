#!/bin/bash
ERRORS=0
for file in .github/workflows/*.yml; do
  if [[ "$file" == *"/governance-guard.yml" || "$file" == *"/labeler.yml" || "$file" == *"/release-drafter.yml" || "$file" == *"/stale.yml" || "$file" == *"/scorecard.yml" || "$file" == *"/project-automation.yml" || "$file" == *"/dependabot-auto-merge.yml" || "$file" == *"/runner-heartbeat.yml" ]]; then continue; fi

  echo -n "Auditing $file... "
  
  # Check for node-version: 22
  if ! grep -qiE "node-version: ['\"]?22['\"]?|NODE_VERSION: ['\"]?22['\"]?|setup-ironforge" "$file"; then
    echo "❌ Missing Node 22"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Check for pnpm 10
  if grep -q "pnpm/action-setup" "$file" && ! grep -qE "version: ['\"]?10['\"]?|setup-ironforge" "$file"; then
    echo "❌ Missing pnpm 10"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  # Check for checkout v4 or newer
  if grep -q "actions/checkout@v" "$file" && ! grep -qE "actions/checkout@v[4-9]" "$file"; then
    echo "❌ Outdated checkout"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  
  echo "✅"
done
echo "Total Errors: $ERRORS"
