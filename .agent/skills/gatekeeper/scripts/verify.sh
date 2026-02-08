#!/bin/bash
# Gatekeeper - Pre-commit quality gate for IronForge

set -e

QUICK=false
if [ "$1" = "--quick" ] || [ "$1" = "-q" ]; then
    QUICK=true
fi

echo "🚦 GATEKEEPER - Quality Gate"
echo "============================="

FAILED=false

# Step 1: TypeScript
echo -e "\n📦 [1/4] TypeScript Check..."
if npm run check-types > /dev/null 2>&1; then
    echo "   ✅ Types: PASS"
else
    echo "   ❌ Types: FAIL"
    npm run check-types
    FAILED=true
fi

# Step 2: ESLint
echo -e "\n🔍 [2/4] ESLint Check..."
if npm run lint > /dev/null 2>&1; then
    echo "   ✅ Lint: PASS"
else
    echo "   ❌ Lint: FAIL"
    npm run lint
    FAILED=true
fi

# Step 3: Prisma Validate
echo -e "\n🗄️ [3/4] Prisma Schema..."
if npx prisma validate > /dev/null 2>&1; then
    echo "   ✅ Schema: VALID"
else
    echo "   ❌ Schema: INVALID"
    FAILED=true
fi

# Step 4: Tests
if [ "$QUICK" = false ]; then
    echo -e "\n🧪 [4/4] Unit Tests..."
    if npm test -- --run > /dev/null 2>&1; then
        echo "   ✅ Tests: PASS"
    else
        echo "   ❌ Tests: FAIL"
        FAILED=true
    fi
else
    echo -e "\n⏭️ [4/4] Tests: SKIPPED (Quick mode)"
fi

# Summary
echo -e "\n============================="
if [ "$FAILED" = true ]; then
    echo "❌ GATEKEEPER: BLOCKED"
    exit 1
else
    echo "✅ GATEKEEPER: PASSED"
    exit 0
fi
