# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd /Users/cpuai/.openclaw/workspace/ski-dashboard
npm install
```

## Step 2: Start the Dashboard

### Option A: Quick Start (Manual)

```bash
npm start
```

or

```bash
./start.sh
```

### Option B: Auto-Start on Boot

```bash
./install-autostart.sh
```

This will set up the dashboard to start automatically when your Mac boots.

## Step 3: Access the Dashboard

### From This Computer
Open your browser and go to:
- http://localhost:18791

### From Other Devices on Your Network
Open a browser on any device (phone, tablet, another computer) and go to:
- http://192.168.1.36:18791

**Note**: If this IP doesn't work, find your Mac's current IP with:
```bash
ipconfig getifaddr en0
```

Then use: `http://YOUR-IP:18791`

## Troubleshooting

### Can't Access from Other Devices?

1. **Check they're on the same WiFi network**
2. **Find your current IP address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
3. **Check macOS Firewall:**
   - System Settings → Network → Firewall
   - Make sure port 18791 is allowed

### Server Won't Start?

Check if something is using port 18791:
```bash
lsof -i :18791
```

If so, kill it or change the port in `server.js`.

### Auto-Start Not Working?

Check the logs:
```bash
cat logs/stderr.log
tail -f logs/stdout.log
```

Verify Node.js path matches your system:
```bash
which node
```

If different, edit `com.skihood.dashboard.plist` and update the path.

## Managing the Service

If you installed auto-start:

```bash
# Check if running
launchctl list | grep skihood

# Start service
launchctl start com.skihood.dashboard

# Stop service
launchctl stop com.skihood.dashboard

# View logs
tail -f logs/stdout.log
tail -f logs/stderr.log

# Uninstall auto-start
./uninstall-autostart.sh
```

## Accessing on Mobile

### iOS (iPhone/iPad)
1. Connect to the same WiFi network
2. Open Safari
3. Go to `http://192.168.1.36:18791`
4. (Optional) Tap Share → Add to Home Screen for easy access

### Android
1. Connect to the same WiFi network
2. Open Chrome
3. Go to `http://192.168.1.36:18791`
4. (Optional) Menu → Add to Home screen

## Next Steps

See the full [README.md](README.md) for:
- Customization options
- Changing refresh intervals
- Adding more data points
- Troubleshooting details
- API endpoints

---

**Enjoy your dashboard! ⛷️**
