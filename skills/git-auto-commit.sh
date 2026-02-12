#!/bin/bash
# Auto-commit workspace changes with intelligent commit messages

WORKSPACE="/Users/cpuai/.openclaw/workspace"
cd "$WORKSPACE" || exit 1

# Check if there are changes
if [[ -z $(git status --porcelain) ]]; then
    echo '{"status": "clean", "message": "No changes to commit"}'
    exit 0
fi

# Get changed files
CHANGED_FILES=$(git status --short | head -20)

# Generate commit message based on changes
if echo "$CHANGED_FILES" | grep -q "memory/"; then
    MSG="Update memory logs"
elif echo "$CHANGED_FILES" | grep -q "ski-dashboard"; then
    MSG="Update ski dashboard"
elif echo "$CHANGED_FILES" | grep -q "dashboard/"; then
    MSG="Update system dashboard"
elif echo "$CHANGED_FILES" | grep -q ".md"; then
    MSG="Update documentation"
else
    MSG="Update workspace"
fi

# Add timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
FULL_MSG="$MSG - $TIMESTAMP"

# Stage and commit
git add -A
git commit -m "$FULL_MSG" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo "{\"status\": \"success\", \"message\": \"$FULL_MSG\", \"commit\": \"$COMMIT_HASH\"}"
else
    echo '{"status": "error", "message": "Commit failed"}'
    exit 1
fi
