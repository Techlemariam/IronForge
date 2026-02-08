#!/bin/bash
# Git Guard Tests (Bats-style)
# Run: bash .agent/skills/git-guard/tests/git-guard.test.sh

test_main_branch_blocked() {
    # Save current branch
    original_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Test the script output when on main
    if [ "$original_branch" = "main" ]; then
        output=$(bash ../scripts/verify-branch.sh 2>&1)
        exit_code=$?
        
        if [ $exit_code -eq 1 ] && [[ "$output" == *"ERROR"* ]]; then
            echo "✅ PASS: main branch correctly blocked"
        else
            echo "❌ FAIL: main branch should be blocked"
            exit 1
        fi
    else
        echo "⏭️ SKIP: Not on main branch (current: $original_branch)"
    fi
}

test_feature_branch_allowed() {
    original_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [ "$original_branch" != "main" ]; then
        output=$(bash ../scripts/verify-branch.sh 2>&1)
        exit_code=$?
        
        if [ $exit_code -eq 0 ] && [[ "$output" == *"✅"* ]]; then
            echo "✅ PASS: feature branch allowed"
        else
            echo "❌ FAIL: feature branch should be allowed"
            exit 1
        fi
    else
        echo "⏭️ SKIP: Currently on main"
    fi
}

echo "Running git-guard tests..."
cd "$(dirname "$0")"
test_main_branch_blocked
test_feature_branch_allowed
echo "Done."
