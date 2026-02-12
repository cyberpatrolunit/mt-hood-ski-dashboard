#!/bin/bash
# Allow Node.js (ski-dashboard) through macOS firewall on port 18791
# This adds an exception without disabling the entire firewall

echo "Adding firewall exception for Node.js on port 18791..."

# Find the Node.js binary path
NODE_PATH=$(which node)
echo "Node.js path: $NODE_PATH"

# Add Node.js to firewall exceptions
echo "Adding firewall rule..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add "$NODE_PATH"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp "$NODE_PATH"

echo ""
echo "✅ Firewall configured!"
echo "   Node.js is now allowed through the firewall"
echo ""
echo "🧪 Test from another device:"
echo "   http://192.168.1.36:18791"
echo ""
