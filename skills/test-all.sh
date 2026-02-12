#!/bin/bash
# Test all skills

echo "🧪 Testing Skills..."
echo ""

WORKSPACE="/Users/cpuai/.openclaw/workspace"
cd "$WORKSPACE" || exit 1

# Activate Python environment
source gmail_env/bin/activate

echo "1️⃣ Testing Git Auto-Commit..."
bash skills/git-auto-commit.sh
echo ""

echo "2️⃣ Testing Gmail Check..."
if [ -f "google_token.pickle" ]; then
    python3 skills/check-gmail.py
else
    echo "⚠️  Not authenticated. Run: python3 skills/gmail-auth.py"
fi
echo ""

echo "3️⃣ Testing Calendar Check..."
if [ -f "google_token.pickle" ]; then
    python3 skills/check-calendar.py 48
else
    echo "⚠️  Not authenticated. Run: python3 skills/gmail-auth.py"
fi
echo ""

echo "✅ Tests complete!"
