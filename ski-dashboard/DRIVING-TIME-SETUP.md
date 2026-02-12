# Driving Time Estimator Setup Guide

## Overview
The Hood Meadows Ski Dashboard now includes a real-time driving time estimator with traffic data powered by Google Maps API.

## Features Implemented

### 1. Driving Time Calculator Section ✅
- **Starting Address Input**: 
  - Address autocomplete (shows suggestions as you type)
  - Saves your preference to browser localStorage
  - Defaults to "Portland, OR"
  
- **Destination**: 
  - Pre-set to Hood Meadows Ski Resort
  - Read-only for consistency
  
- **Date & Time Pickers**:
  - Select departure date and time
  - Defaults to current date/time
  
- **Actions**:
  - "Calculate Drive Time" - estimates based on selected time
  - "Leave Now" - quick calculation for immediate departure

### 2. Real-Time Traffic & Estimation ✅
- **Traffic Analysis**:
  - Light traffic (green): Normal conditions
  - Moderate traffic (yellow): 15-40% slowdown
  - Heavy traffic (red): 40%+ slowdown
  
- **Information Displayed**:
  - Estimated driving time with current/predicted traffic
  - Distance to Hood Meadows
  - Estimated arrival time
  - Best route recommendation (I-84 E and OR-35 S)
  - Alternative routes with time comparisons
  
- **Smart Predictions**:
  - For future times: shows predicted traffic patterns
  - For current time: shows live traffic conditions
  - Accounts for rush hours and weekend patterns

### 3. Smart Display ✅
- **Prominent Time Display**: Large, easy-to-read format (3rem font)
- **Color-Coded Traffic**: 
  - Green badge for light traffic
  - Yellow badge for moderate
  - Red badge for heavy
  
- **Recommendations**:
  - Suggested departure time for 8 AM arrival
  - Road condition warnings when hazardous
  
- **Responsive Design**: 
  - Mobile optimized
  - Compact layout that fits on one screen
  - Matches cozy color palette (#E8D5B7, #D4A574, #9B8B7E)

### 4. Integration ✅
- **Position**: Appears after conditions grid, before snowfall chart
- **Design**: Matches dashboard's warm, cozy aesthetic
- **Persistence**: Saves address preference locally
- **Connection**: Integrates with road conditions data for warnings

### 5. Optional Enhancements ✅
- ✅ Route options (fastest route + scenic alternative)
- ✅ "Leave Now" button for instant calculations
- ❌ Estimated fuel cost (not implemented - can be added later)

## Demo Mode vs. Live Mode

### Demo Mode (Current - No API Key Required)
The dashboard works immediately with realistic simulated data:
- Generates driving times: 1.5 hours base ± 15 minutes
- Simulates traffic based on time of day:
  - 6-9 AM: Moderate traffic (morning rush)
  - 4-7 PM: Heavy traffic (evening rush)
  - 5-7 AM weekends: Moderate (ski traffic)
  - Other times: Light traffic
- Provides alternative scenic route via US-26
- Shows realistic demo data banner

### Live Mode (With Google Maps API Key)
For real-time traffic data:

1. **Get Google Maps API Key**:
   - Visit https://console.cloud.google.com/google/maps-apis/
   - Create a new project or select existing
   - Enable these APIs:
     - Distance Matrix API
     - Directions API
     - Places API (for autocomplete)
   - Create credentials → API Key
   - Restrict the key to these APIs for security

2. **Set the API Key**:
   ```bash
   export GOOGLE_MAPS_API_KEY="your_api_key_here"
   ```
   
   Or add to your shell profile (~/.zshrc or ~/.bash_profile):
   ```bash
   echo 'export GOOGLE_MAPS_API_KEY="your_api_key_here"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Restart the Server**:
   ```bash
   cd /Users/cpuai/.openclaw/workspace/ski-dashboard
   pkill -f "node server.js"
   node server.js > logs/server.log 2>&1 &
   ```

## Testing the Feature

### Manual Test
1. Open http://localhost:18791 or http://192.168.1.36:18791
2. Find the "🚗 Driving Time Estimator" section
3. Enter a starting address (or use default "Portland, OR")
4. Select date and time
5. Click "Calculate Drive Time"
6. Verify results show:
   - Estimated time
   - Traffic level (color-coded)
   - Arrival time
   - Best route
   - Recommended departure for 8 AM arrival
   - Alternative routes
   - Road warnings if conditions are hazardous

### API Test
```bash
# Test driving time calculation
curl -X POST http://localhost:18791/api/driving-time \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Portland, OR",
    "destination": "Hood Meadows Ski Resort, OR",
    "departureTime": "2026-02-12T06:00:00.000Z"
  }' | jq '.'

# Test autocomplete
curl "http://localhost:18791/api/autocomplete?input=Portland" | jq '.'
```

## API Endpoints

### POST /api/driving-time
Calculate driving time with traffic.

**Request Body**:
```json
{
  "origin": "Portland, OR",
  "destination": "Hood Meadows Ski Resort, OR",
  "departureTime": "2026-02-12T06:00:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "demo": false,
  "origin": "Portland, OR, USA",
  "destination": "Hood Meadows Ski Resort, OR",
  "distance": "65 miles",
  "distanceValue": 104607,
  "duration": "1 hr 30 min",
  "durationValue": 5400,
  "normalDuration": "1 hr 25 min",
  "trafficLevel": "moderate",
  "arrivalTime": "2026-02-12T07:30:00.000Z",
  "mainRoute": "I-84 E and OR-35 S",
  "recommendedDeparture": "2026-02-12T06:30:00.000Z",
  "alternativeRoutes": [],
  "warnings": []
}
```

### GET /api/autocomplete
Get address suggestions.

**Query Parameters**:
- `input`: Partial address string (min 3 characters)

**Response**:
```json
{
  "predictions": [
    {
      "description": "Portland, OR, USA",
      "place_id": "ChIJ..."
    }
  ]
}
```

## Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ localStorage for preference saving
- ✅ Responsive design for all screen sizes

## Future Enhancements
- Add fuel cost estimator based on distance and vehicle MPG
- Show weather impact on driving time
- Multi-stop route planning
- Save favorite routes
- Push notifications for optimal departure times
- Integration with calendar for automated reminders

## Troubleshooting

### "Demo mode" banner shows when I have an API key
- Ensure the environment variable is properly set: `echo $GOOGLE_MAPS_API_KEY`
- Restart the server after setting the variable
- Check server logs: `tail -f logs/server.log`

### Autocomplete not working
- Check browser console for errors (F12)
- Verify API key has Places API enabled
- Check for CORS issues in network tab

### Results not displaying
- Open browser console (F12) and check for JavaScript errors
- Verify API endpoints return data: `curl http://localhost:18791/api/driving-time`
- Check that results div has class "visible" after calculation

### Traffic data seems inaccurate
- In demo mode, traffic is simulated - get a real API key for accurate data
- Google Maps traffic is based on historical patterns and current conditions
- Weekend and holiday patterns may differ from normal weekdays

## Cost Considerations

### Google Maps API Pricing (as of 2024)
- Distance Matrix API: $5 per 1,000 requests (includes traffic data)
- Directions API: $5 per 1,000 requests
- Places Autocomplete: $2.83 per 1,000 requests (session-based)
- **Monthly free tier**: $200 credit = ~40,000 driving calculations

### Usage Estimate
For a personal dashboard:
- ~10 calculations per day = 300/month
- Cost: ~$0.04/month (well within free tier)

For public/heavy use:
- Consider implementing request caching
- Add rate limiting
- Use server-side caching for popular routes

## Security Notes
- API key should be restricted to specific APIs
- Consider adding HTTP referrer restrictions
- Don't commit API keys to version control
- Use environment variables for production
- Monitor API usage in Google Cloud Console

## Support
For issues or questions:
- Check server logs: `tail -f /Users/cpuai/.openclaw/workspace/ski-dashboard/logs/server.log`
- Verify server status: `curl http://localhost:18791/api/conditions`
- Review Google Maps API documentation: https://developers.google.com/maps/documentation

## Deployment Checklist
- [x] Install @googlemaps/google-maps-services-js dependency
- [x] Add Google Maps client initialization
- [x] Implement /api/driving-time endpoint
- [x] Implement /api/autocomplete endpoint
- [x] Add driving time UI section to index.html
- [x] Style components to match dashboard aesthetic
- [x] Add JavaScript for form handling
- [x] Implement localStorage for address preferences
- [x] Add demo mode with realistic data
- [x] Integrate with road conditions for warnings
- [x] Test API endpoints
- [x] Test UI functionality
- [x] Mobile responsive testing
- [x] Document setup process
- [ ] (Optional) Set Google Maps API key for live data
- [x] Deploy and verify

## Status: ✅ DEPLOYED AND WORKING

The driving time estimator is now live at:
- Local: http://localhost:18791
- Network: http://192.168.1.36:18791

Demo mode is active and working with realistic traffic simulations. Set GOOGLE_MAPS_API_KEY environment variable to enable live traffic data.
