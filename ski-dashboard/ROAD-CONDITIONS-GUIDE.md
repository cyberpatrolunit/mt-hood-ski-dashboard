# Road Conditions & Closure Alerts - Implementation Guide

## Overview
The Hood Meadows ski dashboard now includes real-time road conditions and closure alerts for the three main routes to the resort:
- **I-84**: Primary route from Portland
- **Highway 26**: Alternate scenic route
- **Highway 35**: Local approach from Hood River

## Features Implemented

### 1. Road Conditions Display
Each road shows:
- **Status Badge**: Color-coded indicators (Green = Good, Yellow = Caution, Red = Hazardous, Gray = Closed)
- **Visibility**: Current visibility conditions with weather icons
- **Surface Conditions**: Road surface state (dry/wet/snow/ice)
- **Advisories**: Chain requirements, speed warnings, and other alerts
- **Traffic Status**: Current traffic flow and slowdowns
- **Reopening Times**: Estimated reopening for closed roads

### 2. Alert Banners
- Prominent alerts for road closures
- Emergency notices for severe weather
- Color-coded warnings with icons

### 3. Mobile Responsive
- Optimized for iPhone viewing
- Clear, large text for easy reading while driving
- Swipeable/scrollable road cards
- Touch-friendly interface

### 4. Auto-Refresh
- Updates every 30 minutes with conditions data
- Displays last updated timestamp
- Maintains cozy dashboard aesthetic

## API Integration

### Current Status: Mock Data
The dashboard currently uses **simulated road conditions** with realistic variations to demonstrate functionality.

### Connecting to Real Data Sources

#### Option 1: ODOT TripCheck API (Recommended)

**Setup:**
1. Register at https://apiportal.odot.state.or.us/
2. Subscribe to "TripCheck API" product
3. Obtain API subscription key
4. Update `server.js` in the `fetchRoadConditions()` function

**Implementation:**
```javascript
// In server.js, replace the fetchRoadConditions() function:

async function fetchRoadConditions() {
  try {
    const API_KEY = 'YOUR_SUBSCRIPTION_KEY_HERE';
    
    // Fetch road and weather reports
    const response = await axios.get(
      'https://api.tripcheck.com/v1/RoadWeather/GetReports',
      {
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY
        }
      }
    );
    
    // Parse XML response
    const $ = cheerio.load(response.data, { xmlMode: true });
    const roads = [];
    
    // Extract relevant road reports for Hood Meadows routes
    $('Report').each((i, elem) => {
      const route = $(elem).find('Route').text();
      
      // Filter for I-84, Highway 26, Highway 35
      if (route.includes('84') || route.includes('26') || route.includes('35')) {
        roads.push({
          id: parseRouteId(route),
          name: route,
          description: getRouteDescription(route),
          status: parseConditionStatus($(elem)),
          visibility: $(elem).find('Visibility').text() || 'Unknown',
          surface: $(elem).find('SurfaceCondition').text() || 'Unknown',
          advisories: parseAdvisories($(elem)),
          traffic: $(elem).find('TrafficInfo').text() || 'Unknown',
          estimatedReopenTime: $(elem).find('EstimatedReopen').text() || null
        });
      }
    });
    
    cachedData.roadConditions = {
      lastUpdated: new Date(),
      roads: roads,
      closures: extractClosures($),
      emergencyNotices: extractEmergencyNotices($)
    };
    
  } catch (error) {
    console.error('Error fetching road conditions:', error.message);
    // Falls back to cached data
  }
}
```

#### Option 2: Web Scraping TripCheck
If API access is not available, you can scrape the TripCheck website:

```javascript
async function scrapeRoadConditions() {
  try {
    // Fetch road conditions page
    const response = await axios.get('https://www.tripcheck.com/Pages/Road-Conditions', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Parse road conditions from HTML
    // Structure will depend on TripCheck's HTML layout
    // Look for sections containing I-84, Highway 26, Highway 35
    
    // Example parsing logic:
    const roads = [];
    $('.road-report').each((i, elem) => {
      const roadName = $(elem).find('.road-name').text();
      // ... parse other fields
    });
    
    cachedData.roadConditions = {
      lastUpdated: new Date(),
      roads: roads,
      closures: [],
      emergencyNotices: []
    };
    
  } catch (error) {
    console.error('Error scraping road conditions:', error.message);
  }
}
```

#### Option 3: Weather.gov API (Supplementary)
Use NOAA weather data for additional context:

```javascript
async function fetchWeatherConditions() {
  try {
    // Government Camp weather station (near Hood Meadows)
    const response = await axios.get(
      'https://api.weather.gov/stations/KGOV/observations/latest'
    );
    
    const data = response.data.properties;
    
    // Use weather data to supplement road conditions
    const temp = data.temperature.value;
    const windSpeed = data.windSpeed.value;
    const visibility = data.visibility.value;
    
    // Update road conditions based on weather
    updateRoadConditionsFromWeather(temp, windSpeed, visibility);
    
  } catch (error) {
    console.error('Error fetching weather:', error.message);
  }
}
```

## Status Color Mapping

The dashboard uses color-coded status indicators:

```javascript
// Status determination logic
function determineRoadStatus(conditions) {
  if (conditions.closed) return 'closed';
  
  if (conditions.surface.includes('ice') || 
      conditions.visibility < 0.25 ||
      conditions.chainRequirement === 'required') {
    return 'hazardous';
  }
  
  if (conditions.surface.includes('snow') ||
      conditions.visibility < 1.0 ||
      conditions.chainRequirement === 'advised') {
    return 'caution';
  }
  
  return 'good';
}
```

## UI Customization

### Color Scheme
Matches the cozy dashboard aesthetic:
- Good: `#8FB59A` (soft green)
- Caution: `#FFB088` (warm orange)
- Hazardous: `#D4816F` (warm red)
- Closed: `#9B8B7E` (muted gray)

### Icons
Standard emoji icons for broad compatibility:
- ✅ Good conditions
- ⚠️ Caution
- 🚨 Hazardous
- 🚫 Closed
- ☀️ Clear visibility
- 🌨️ Light snow
- ❄️ Heavy snow
- 🌫️ Fog
- 🛣️ Surface conditions
- 🚦 Traffic information

### Mobile Optimization
Already implemented:
- Responsive grid layout
- Touch-friendly cards
- Large, readable text
- Collapsible sections (can expand if needed)

## Testing

### Local Testing
The dashboard is running at:
- Local: http://localhost:18791
- Network: http://192.168.1.36:18791

### API Testing
Test the road conditions endpoint:
```bash
curl http://localhost:18791/api/road-conditions | jq
```

### Simulate Different Conditions
Modify the `fetchRoadConditions()` function in `server.js` to test different scenarios:
- Road closures
- Hazardous conditions
- Chain requirements
- Traffic delays

## Deployment

### Production Checklist
- [ ] Obtain ODOT TripCheck API key
- [ ] Update API endpoints in `server.js`
- [ ] Configure refresh interval (default: 30 minutes)
- [ ] Test with real data
- [ ] Monitor error logging
- [ ] Set up API rate limiting if needed
- [ ] Configure CORS if dashboard is public-facing

### Environment Variables
Consider using environment variables for API keys:

```javascript
// In server.js
const TRIPCHECK_API_KEY = process.env.TRIPCHECK_API_KEY || 'YOUR_KEY_HERE';
```

Add to `.env` file:
```
TRIPCHECK_API_KEY=your_actual_key_here
```

## Maintenance

### Data Accuracy
- Verify road condition mappings match ODOT data
- Update status logic as needed
- Monitor for API changes

### Performance
- Cache road conditions for 30 minutes
- Implement graceful fallback on API errors
- Log failed API calls for monitoring

### User Feedback
Consider adding:
- Manual refresh button
- Last updated timestamp (already implemented)
- Report incorrect data button
- Link to official TripCheck site

## Future Enhancements

### Possible Additions
1. **Chain Status Locations**: Show specific chain-up areas
2. **Camera Integration**: Add road condition cameras from ODOT
3. **Route Comparison**: Suggest best route based on conditions
4. **Push Notifications**: Alert on significant changes
5. **Historical Data**: Show typical conditions by date/time
6. **Weather Forecast**: 24-hour road condition predictions
7. **Mountain Pass Reports**: Include additional nearby passes
8. **Avalanche Conditions**: Link to NWAC avalanche reports

### API Endpoints to Consider
- ODOT Camera feeds: `/api/CCTV/GetInventory`
- Traffic incidents: `/api/Incidents/GetIncidents`
- Dynamic message signs: `/api/DMS/GetStatus`
- Weather stations: `/api/RWIS/GetStatus`

## Support

### Resources
- ODOT TripCheck: https://www.tripcheck.com
- TripCheck API Portal: https://apiportal.odot.state.or.us/
- API Documentation: https://tripcheck.com/Pages/API
- ODOT Support: tripcheck.support@odot.state.or.us

### Troubleshooting

**API Not Responding:**
- Verify API key is correct
- Check rate limits
- Ensure network connectivity
- Review ODOT service status

**Data Not Updating:**
- Check server logs for errors
- Verify cron/refresh interval
- Test API endpoint manually
- Clear cached data

**Display Issues:**
- Check browser console for JS errors
- Verify CSS is loading
- Test on different devices/browsers
- Clear browser cache

## Summary

The road conditions and closure alerts feature is now fully integrated into the Hood Meadows ski dashboard. The UI is complete and functional with simulated data. To activate real-time data:

1. Sign up for ODOT TripCheck API access
2. Update the `fetchRoadConditions()` function with your API key
3. Test thoroughly with real data
4. Deploy and monitor

The feature provides critical safety information to skiers and helps them plan their trips with up-to-date road conditions and closure information, all in a mobile-responsive, easy-to-read format that matches the cozy aesthetic of the dashboard.
