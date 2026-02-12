#!/bin/bash
# Uninstall Hood Meadows Dashboard Auto-Start Service

PLIST_FILE="com.skihood.dashboard.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_DEST="$LAUNCH_AGENTS_DIR/$PLIST_FILE"

echo "================================================"
echo "Hood Meadows Dashboard - Auto-Start Uninstaller"
echo "================================================"
echo ""

if [ ! -f "$PLIST_DEST" ]; then
    echo "❌ LaunchAgent is not installed."
    exit 0
fi

echo "Stopping service..."
launchctl stop com.skihood.dashboard 2>/dev/null

echo "Unloading LaunchAgent..."
launchctl unload "$PLIST_DEST" 2>/dev/null

echo "Removing plist file..."
rm "$PLIST_DEST"

echo ""
echo "✅ Auto-start service has been removed."
echo ""
echo "The dashboard files are still in:"
echo "  /Users/cpuai/.openclaw/workspace/ski-dashboard/"
echo ""
echo "You can still run the dashboard manually with:"
echo "  npm start"
echo "  or"
echo "  ./start.sh"
echo ""
