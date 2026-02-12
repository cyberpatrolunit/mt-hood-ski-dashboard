# Hood Meadows Dashboard - Quick Reference

## 🌐 Access URLs

### This Computer
```
http://localhost:18791
```

### Other Devices (Network)
```
http://192.168.1.36:18791
```

## ⚡ Quick Commands

### Start Server
```bash
cd /Users/cpuai/.openclaw/workspace/ski-dashboard
npm start
```
or
```bash
./start.sh
```

### Enable Auto-Start
```bash
./install-autostart.sh
```

### Disable Auto-Start
```bash
./uninstall-autostart.sh
```

### Check If Running
```bash
lsof -i :18791
```

### View Logs
```bash
tail -f logs/stdout.log
```

### Find Your IP
```bash
ipconfig getifaddr en0
```

## 🔧 Manage Service

### Start
```bash
launchctl start com.skihood.dashboard
```

### Stop
```bash
launchctl stop com.skihood.dashboard
```

### Check Status
```bash
launchctl list | grep skihood
```

### Restart
```bash
launchctl stop com.skihood.dashboard
launchctl start com.skihood.dashboard
```

## 📱 Mobile Access

1. Connect to same WiFi
2. Open browser
3. Go to: `http://192.168.1.36:18791`

## 📊 API Endpoints

```
GET /api/conditions           # Current conditions
GET /api/snowfall-history     # 14-day history
POST /api/refresh             # Force data refresh
```

## 🔍 Troubleshooting

### Can't Connect from Phone?
- Same WiFi network?
- Firewall blocking port 18791?
- IP address changed? Run: `ipconfig getifaddr en0`

### Port Already in Use?
```bash
lsof -i :18791
# Kill process or change port in server.js
```

### Not Auto-Starting?
```bash
# Check Node path
which node

# Should be: /opt/homebrew/bin/node
# If different, edit com.skihood.dashboard.plist
```

## 📖 Full Docs

- **README.md** - Complete documentation
- **SETUP.md** - Setup guide
- **COMPLETION-SUMMARY.md** - Project overview

---

**Status**: ✅ Running on port 18791
**Refresh**: Auto every 30 minutes
