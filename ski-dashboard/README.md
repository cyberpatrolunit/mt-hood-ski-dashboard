# Hood Meadows Ski Conditions Dashboard

A real-time ski conditions dashboard for Mt. Hood Meadows, accessible on your local network.

## Features

- ⛷️ **Live Conditions**: Base depth, new snow, wind, temperature, and resort status
- 🚗 **Driving Time Estimator**: Real-time traffic estimates to Hood Meadows (NEW!)
- 📊 **Interactive Graph**: 14-day snowfall history with hover details
- 📝 **Daily Weather Report**: Full written weather report from Hood Meadows
- 🛣️ **Road Conditions**: Live highway conditions, closures, and advisories
- ❄️ **Dynamic Snow Effect**: Animated particle snowfall that scales with current conditions
- 🎿 **Gear Checklist**: Interactive packing checklist with progress tracking
- 🔄 **Auto-Refresh**: Updates every 30 minutes automatically
- 🌙 **Cozy Theme**: Warm ski-lodge aesthetic, easy on the eyes
- 📱 **Mobile Responsive**: Works great on phones, tablets, and desktops
- 🕐 **Last Updated**: Timestamp shows when data was last refreshed

### New Features (v3.0)

**🚗 Driving Time Estimator with Real-Time Traffic**
- Calculate drive time from any starting point to Hood Meadows
- Real-time traffic analysis (light/moderate/heavy)
- Estimated arrival time based on departure time
- Color-coded traffic indicators (green/yellow/red)
- Address autocomplete for easy input
- Alternative route options
- Smart recommendations:
  - Suggested departure time for 8 AM arrival
  - Road hazard warnings based on current conditions
  - Traffic-aware route selection
- Date/time picker for planning future trips
- "Leave Now" button for instant calculations
- Saves your starting address preference
- **Demo mode** with realistic traffic simulations (no API key needed)
- **Live mode** with Google Maps API for actual traffic data
- Mobile-optimized layout matching dashboard aesthetic

See [DRIVING-TIME-SETUP.md](DRIVING-TIME-SETUP.md) for setup instructions and API configuration.

### Features from v2.0

**📝 Daily Weather Report Section**
- Displays Hood Meadows' daily written weather report
- Scrollable section with professional typography
- Auto-updates every 30 minutes
- Includes date/time stamp

**❄️ Particle Snow Effect**
- HTML5 Canvas-based animated snowfall
- Particle density scales with current snowfall:
  - 0-1": Light snow (20-50 particles)
  - 1-3": Moderate snow (50-100 particles)
  - 3-6": Heavy snow (100-200 particles)
  - 6"+: Blizzard conditions (200-300 particles)
- Wind effect based on current wind speed
- Mobile-optimized (50% particle reduction on small screens)
- Smooth 60fps animation that doesn't obstruct content

See [WEATHER-SNOW-FEATURES.md](WEATHER-SNOW-FEATURES.md) for detailed documentation.

**🎿 Interactive Gear Checklist**
- Fun, interactive packing checklist for ski trips
- 5 categories: Gear, Accessories, Snacks, Tech, Essentials
- Progress bar with motivational messages
- Drag & drop to reorder items
- Add custom items to any category
- Collapsible categories
- Sound effects toggle (satisfying "ding" on check)
- Persistent state (saves to localStorage)
- 100% completion celebration with confetti! 🎉
- Print-friendly version
- Mobile-optimized for packing on-the-go

See [GEAR-CHECKLIST.md](GEAR-CHECKLIST.md) for detailed documentation.

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/cpuai/.openclaw/workspace/ski-dashboard
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on port 18791.

### 3. Access the Dashboard

**From this computer:**
- http://localhost:18791

**From other devices on your network:**
- http://192.168.1.36:18791

Simply open a web browser on any device connected to your local network and navigate to the network URL.

## Auto-Start on Boot (LaunchAgent)

To make the dashboard start automatically when your Mac boots:

### 1. Verify Node.js Path

First, check where Node.js is installed:

```bash
which node
```

If the path is different from `/usr/local/bin/node`, edit the plist file:

```bash
nano com.skihood.dashboard.plist
```

Update the path in the `ProgramArguments` section.

### 2. Install the LaunchAgent

```bash
# Copy the plist to LaunchAgents directory
cp com.skihood.dashboard.plist ~/Library/LaunchAgents/

# Load the agent
launchctl load ~/Library/LaunchAgents/com.skihood.dashboard.plist

# Verify it's running
launchctl list | grep skihood
```

### 3. Manage the Service

```bash
# Start the service
launchctl start com.skihood.dashboard

# Stop the service
launchctl stop com.skihood.dashboard

# Restart after changes
launchctl unload ~/Library/LaunchAgents/com.skihood.dashboard.plist
launchctl load ~/Library/LaunchAgents/com.skihood.dashboard.plist

# Remove auto-start
launchctl unload ~/Library/LaunchAgents/com.skihood.dashboard.plist
rm ~/Library/LaunchAgents/com.skihood.dashboard.plist
```

## Accessing from Other Devices

### Find Your IP Address

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

or

```bash
ipconfig getifaddr en0
```

### Connect from Other Devices

1. **iPhone/iPad**: Open Safari and go to `http://YOUR-IP:18791`
2. **Android**: Open Chrome and go to `http://YOUR-IP:18791`
3. **Other Computers**: Open any browser and go to `http://YOUR-IP:18791`

**Example**: If your Mac's IP is `192.168.1.36`, use:
- http://192.168.1.36:18791

### Firewall Settings

If you can't connect from other devices, you may need to allow the port through macOS firewall:

1. Open **System Settings** > **Network** > **Firewall**
2. Click **Options**
3. Add Node.js or the specific port 18791

## Logs

View logs to troubleshoot issues:

```bash
# View recent logs
tail -f logs/stdout.log
tail -f logs/stderr.log

# View all logs
cat logs/stdout.log
cat logs/stderr.log
```

## Data Source

The dashboard fetches data from Mt. Hood Meadows' website (https://www.skihood.com). 

**Note**: The current version includes sample/simulated data for the 14-day snowfall history. For production use with real historical data, you would need to either:
1. Integrate with Hood Meadows' official API (if available)
2. Use a third-party snow report service
3. Implement a database to track daily snowfall over time
4. Use web scraping with a headless browser (Puppeteer) to extract dynamic content

## Customization

### Change Port

Edit `server.js` and modify the `PORT` constant:

```javascript
const PORT = 18791; // Change to your preferred port
```

### Change Refresh Interval

Edit `server.js` to change auto-refresh frequency (default: 30 minutes):

```javascript
// Refresh data every 30 minutes (1800000 ms)
setInterval(() => {
  scrapeHoodMeadowsData();
}, 30 * 60 * 1000); // Change this value
```

Also update `public/index.html`:

```javascript
// Auto-refresh every 30 minutes
setInterval(refreshData, 30 * 60 * 1000); // Change this value
```

### Add More Data Points

Edit `server.js` to add more condition fields:

```javascript
conditions: {
  baseDepth: 'N/A',
  newSnow24h: '0"',
  // Add more fields here
}
```

Then update `public/index.html` to display them.

## Troubleshooting

### Server Won't Start

- Check if port 18791 is already in use:
  ```bash
  lsof -i :18791
  ```
- Try a different port in `server.js`

### Can't Access from Other Devices

- Make sure all devices are on the same network
- Check firewall settings
- Verify your IP address hasn't changed
- Try using the computer name: `http://CPU-Mac-mini.local:18791`

### Data Not Updating

- Check logs for errors
- Verify internet connection
- The site may have changed structure - update scraper

### LaunchAgent Not Starting

- Check Node.js path with `which node`
- View system logs: `log show --predicate 'process == "launchd"' --last 10m | grep skihood`
- Ensure file permissions are correct: `chmod 644 ~/Library/LaunchAgents/com.skihood.dashboard.plist`

## Development

### Run with Auto-Restart (Development Mode)

```bash
npm install -g nodemon
npm run dev
```

Changes to `server.js` will automatically restart the server.

### Project Structure

```
ski-dashboard/
├── server.js                    # Node.js Express server
├── package.json                 # Dependencies
├── com.skihood.dashboard.plist  # LaunchAgent configuration
├── public/
│   └── index.html              # Frontend dashboard
├── logs/
│   ├── stdout.log              # Standard output logs
│   └── stderr.log              # Error logs
└── README.md                    # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Scraping**: Axios, Cheerio
- **Frontend**: HTML5, CSS3, JavaScript
- **Charting**: Chart.js
- **Auto-Start**: macOS LaunchAgent

## URLs Reference

### Local Access
- **Main Dashboard**: http://localhost:18791
- **API - Current Conditions**: http://localhost:18791/api/conditions
- **API - Snowfall History**: http://localhost:18791/api/snowfall-history

### Network Access (from other devices)
- **Main Dashboard**: http://192.168.1.36:18791
- **API - Current Conditions**: http://192.168.1.36:18791/api/conditions
- **API - Snowfall History**: http://192.168.1.36:18791/api/snowfall-history
- **API - Weather Report**: http://192.168.1.36:18791/api/weather-report

Replace `192.168.1.36` with your actual local IP address.

## License

MIT

## Support

For issues or questions, check the logs in the `logs/` directory or review the Hood Meadows website for any structural changes that might affect data scraping.

---

**Enjoy tracking the powder! ⛷️❄️**
