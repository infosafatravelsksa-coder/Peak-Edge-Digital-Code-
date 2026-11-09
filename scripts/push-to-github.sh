#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "========================================================"
  echo "  ORBIT DIGITAL GITHUB PUSH HELPER"
  echo "========================================================"
  echo "Usage: ./scripts/push-to-github.sh <YOUR_GITHUB_REPOSITORY_URL>"
  echo "Example: ./scripts/push-to-github.sh https://github.com/username/orbit-digital.git"
  echo ""
  exit 1
fi

REPO_URL="$1"

echo "→ Configuring Git remote 'origin' to: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git branch -M main

echo "→ Pushing to GitHub (branch: main)..."
git push -u origin main

echo "✓ Successfully pushed to GitHub!"
