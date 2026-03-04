ERRORS=0

for file in .github/workflows/*.yml; do
  # Skip itself and specialized workflows that don't use Node standard runners
  if [[ "$file" == *"/governance-guard.yml" || "$file" == *"/labeler.yml" || "$file" == *"/release-drafter.yml" || "$file" == *"/stale.yml" || "$file" == *"/scorecard.yml" || "$file" == *"/project-automation.yml" || "$file" == *"/dependabot-auto-merge.yml" || "$file" == *"/runner-heartbeat.yml" ]]; then continue; fi

  echo "Auditing $file..."

  # Check for node-version: 22
  # We check for '22' or "22" or version used in the composite action
  if ! grep -qiE "node-version: ['\"]?22['\"]?|NODE_VERSION: ['\"]?22['\"]?|setup-ironforge" "$file"; then
    echo "❌ $file: Missing node-version: 22 standardization"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for pnpm 10
  if ! grep -qE "version: ['\"]?10['\"]?|setup-ironforge" "$file"; then
    # Some workflows might not use pnpm (governance only), so we check if setup-pnpm is used at all
    if grep -q "pnpm/action-setup" "$file"; then
      echo "❌ $file: Uses pnpm but not version 10"
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # Check for checkout v4 or newer
  if grep -q "actions/checkout@v" "$file" && ! grep -qE "actions/checkout@v[4-9]" "$file"; then
    echo "❌ $file: Uses outdated checkout action (use @v4+)"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "⚠️ Found $ERRORS governance violations. Please fix them to match IronForge standards."
else
  echo "✅ All workflows meet Titan-Tier standards."
fi
