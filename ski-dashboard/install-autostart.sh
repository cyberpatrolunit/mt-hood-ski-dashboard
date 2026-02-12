#!/bin/bash
# Install Hood Meadows Dashboard as Auto-Start Service

PLIST_FILE="com.skihood.dashboard.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_DEST="$LAUNCH_AGENTS_DIR/$PLIST_FILE"

echo "================================================"
echo "Hood Meadows Dashboard - Auto-Start Installer"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "   Please install Node.js first: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found at: $(which node)"
echo ""

# Create LaunchAgents directory if it doesn't exist
if [ ! -d "$LAUNCH_AGENTS_DIR" ]; then
    echo "Creating LaunchAgents directory..."
    mkdir -p "$LAUNCH_AGENTS_DIR"
fi

# Check if already installed
if [ -f "$PLIST_DEST" ]; then
    echo "⚠️  LaunchAgent already installed. Unloading existing service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null
    echo ""
fi

# Copy plist file
echo "Installing LaunchAgent..."
cp "$PLIST_FILE" "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

# Load the service
echo "Loading service..."
launchctl load "$PLIST_DEST"

# Wait a moment for service to start
sleep 2

# Check if service is running
if launchctl list | grep -q "com.skihood.dashboard"; then
    echo ""
    echo "✅ SUCCESS! Dashboard is now set to auto-start on boot."
    echo ""
    echo "Service Details:"
    echo "  • Service name: com.skihood.dashboard"
    echo "  • Working directory: /Users/cpuai/.openclaw/workspace/ski-dashboard"
    echo "  • Logs: logs/stdout.log and logs/stderr.log"
    echo ""
    echo "Access your dashboard:"
    echo "  • Local:   http://localhost:18791"
    echo "  • Network: http://192.168.1.36:18791"
    echo ""
    echo "Manage the service:"
    echo "  • Start:   launchctl start com.skihood.dashboard"
    echo "  • Stop:    launchctl stop com.skihood.dashboard"
    echo "  • Status:  launchctl list | grep skihood"
    echo "  • Logs:    tail -f logs/stdout.log"
    echo ""
else
    echo ""
    echo "⚠️  Warning: Service may not have started correctly."
    echo "   Check logs in the logs/ directory for errors."
    echo ""
fi
