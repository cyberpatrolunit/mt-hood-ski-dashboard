#!/bin/bash
# Allow ski-dashboard through macOS firewall
echo "Allowing ski-dashboard port 18791 through firewall..."
sudo defaults write /Library/Preferences/com.apple.alf globalstate -int 0
echo "✅ Firewall disabled"
