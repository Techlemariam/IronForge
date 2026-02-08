#!/bin/bash
# Git Guard - Branch Protection Script
# Prevents accidental operations on protected branches

current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" = "main" ]; then
  echo "⛔ ERROR: You are on the 'main' branch"
  echo "   The main branch is protected. You must create a feature branch."
  echo ""
  echo "   Run: /claim-task [task-description]"
  echo "   Or manually: git checkout -b [prefix]/[description]"
  exit 1
fi

echo "✅ Branch: $current_branch"
