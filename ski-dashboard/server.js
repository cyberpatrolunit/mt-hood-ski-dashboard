const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const { Client } = require("@googlemaps/google-maps-services-js");
const snowfallService = require('./snowfallDataService');
const nwsService = require('./nwsDataService');
const openmeteoService = require('./openmeteoDataService');

const app = express();
const PORT = 18791;

// Initialize Google Maps client
// To use real Google Maps API, set GOOGLE_MAPS_API_KEY environment variable
// Get your key at: https://console.cloud.google.com/google/maps-apis/
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'DEMO_MODE';
const googleMapsClient = new Client({});

// Hood Meadows coordinates
const HOOD_MEADOWS_COORDS = {
  lat: 45.3311,
  lng: -121.6644
};
const HOOD_MEADOWS_ADDRESS = "10001 OR-35, Mt Hood, OR 97041";

// Middleware for JSON parsing
app.use(express.json());

// In-memory cache for snowfall data
let cachedData = {
  lastUpdated: new Date(),
  conditions: {
    baseDepth: 'N/A',
    newSnow24h: '0"',
    newSnow12h: '0"',
    wind: 'N/A',
    temp: 'N/A',
    status: 'Unknown'
  },
  snowfallHistory: [],
  weatherReport: {
    date: new Date(),
    report: 'Loading weather report...'
  },
  roadConditions: {
    lastUpdated: new Date(),
    roads: []
  },
  redditFeed: {
    lastUpdated: new Date(),
    posts: []
  }
};

// Initialize sample road conditions
function initializeRoadConditions() {
  cachedData.roadConditions = {
    lastUpdated: new Date(),
    roads: [
      {
        id: 'i84',
        name: 'I-84',
        description: 'Primary route from Portland',
        status: 'good', // good, caution, hazardous, closed
        visibility: 'Clear',
        surface: 'Wet',
        advisories: ['No chain requirements'],
        traffic: 'Light traffic',
        estimatedReopenTime: null
      },
      {
        id: 'hwy26',
        name: 'Highway 26',
        description: 'Alternate scenic route',
        status: 'caution',
        visibility: 'Light snow',
        surface: 'Snow/Ice',
        advisories: ['Chains required', 'Reduce speed'],
        traffic: 'Moderate with slowdowns near Government Camp',
        estimatedReopenTime: null
      },
      {
        id: 'hwy35',
        name: 'Highway 35',
        description: 'Local approach',
        status: 'good',
        visibility: 'Clear',
        surface: 'Dry',
        advisories: ['No restrictions'],
        traffic: 'Normal flow',
        estimatedReopenTime: null
      }
    ],
    closures: [],
    emergencyNotices: []
  };
}

// Initialize with sample data
function initializeSampleData() {
  const today = new Date();
  const history = [];
  
  // Generate 14 days of sample data
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      snowfall: Math.floor(Math.random() * 8) // Random snowfall 0-8 inches
    });
  }
  
  cachedData.snowfallHistory = history;
  cachedData.conditions = {
    baseDepth: '45"',
    newSnow24h: '3"',
    newSnow12h: '2"',
    wind: '15 mph SW',
    temp: '28°F',
    status: 'Open'
  };
  
  initializeRoadConditions();
  
  // Sample weather report
  cachedData.weatherReport = {
    date: new Date(),
    report: `Good morning from Mt. Hood Meadows! We're looking at excellent skiing conditions today.

OVERNIGHT SNOWFALL: We received 2 inches of fresh powder overnight, bringing our 24-hour total to 3 inches. The snow is light and dry with excellent quality.

CURRENT CONDITIONS: Base depth sits at 45 inches mid-mountain. Temperatures are hovering around 28°F at the base with winds out of the southwest at 15 mph. Visibility is excellent with partly cloudy skies.

TERRAIN UPDATE: All main lifts are operational. The upper mountain is skiing beautifully with groomed corduroy and fresh powder stashes in the trees. Cascade and Hood River Meadows chairs are running smoothly. Terrain park features are in great shape.

FORECAST: Conditions should remain stable through the afternoon. We're tracking a new weather system that could bring additional snowfall tonight into tomorrow morning - stay tuned for updates.

NOTES: With recent snowfall, please exercise caution in tree skiing areas and be aware of changing conditions. Avalanche danger is rated as MODERATE on upper elevation terrain.

Get out there and enjoy the fresh snow! See you on the mountain.

- Hood Meadows Snow Report Team`
  };
}

// Scrape Hood Meadows data
async function scrapeHoodMeadowsData() {
  try {
    console.log('Fetching Hood Meadows data...');
    
    // Try to get data from the main page
    const response = await axios.get('https://www.skihood.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const html = response.data;
    
    // Extract data from HTML (the site shows snow data in the header)
    // Look for JSON data in script tags
    const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        console.log('Found Next.js data:', JSON.stringify(data).substring(0, 200));
      } catch (e) {
        console.log('Could not parse Next.js data');
      }
    }
    
    // Try to fetch weather report from blog or conditions page
    await scrapeWeatherReport();
    
    // Fetch road conditions
    await fetchRoadConditions();
    
    // For now, we'll use sample data since the site requires JavaScript rendering
    // In production, you could use Puppeteer or similar to scrape dynamic content
    
    console.log('Data fetched successfully');
    cachedData.lastUpdated = new Date();
    
  } catch (error) {
    console.error('Error fetching data:', error.message);
    // Keep using cached data on error
  }
}

// Scrape weather report from Hood Meadows
async function scrapeWeatherReport() {
  try {
    // Try multiple possible sources for the weather report
    const urls = [
      'https://www.skihood.com/the-mountain/mountain-report',
      'https://www.skihood.com/blog',
      'https://www.skihood.com/the-mountain/conditions'
    ];
    
    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          timeout: 8000
        });
        
        const $ = cheerio.load(response.data);
        
        // Look for report-like content
        // This will need to be customized based on their actual HTML structure
        let reportText = '';
        
        // Try to find report content (adjust selectors as needed)
        const possibleSelectors = [
          '.snow-report',
          '.daily-report',
          '.mountain-report',
          'article',
          '.blog-post'
        ];
        
        for (const selector of possibleSelectors) {
          const element = $(selector).first();
          if (element.length && element.text().trim().length > 100) {
            reportText = element.text().trim();
            break;
          }
        }
        
        if (reportText && reportText.length > 100) {
          cachedData.weatherReport = {
            date: new Date(),
            report: reportText
          };
          console.log('Successfully fetched weather report from:', url);
          return;
        }
      } catch (err) {
        console.log(`Could not fetch from ${url}:`, err.message);
      }
    }
    
    console.log('Using cached weather report');
    
  } catch (error) {
    console.error('Error fetching weather report:', error.message);
  }
}

// Fetch road conditions from ODOT TripCheck
// NOTE: This requires an API key from https://apiportal.odot.state.or.us/
// For now, using simulated data - replace with real API calls
async function fetchRoadConditions() {
  try {
    console.log('Fetching road conditions...');
    
    // REAL API INTEGRATION:
    // 1. Sign up at https://apiportal.odot.state.or.us/
    // 2. Subscribe to TripCheck API
    // 3. Replace this with actual API call:
    /*
    const response = await axios.get('https://api.tripcheck.com/v1/RoadWeather/GetReports', {
      headers: {
        'Ocp-Apim-Subscription-Key': 'YOUR_API_KEY_HERE'
      }
    });
    
    // Parse XML or JSON response and map to our format
    const roads = parseODOTResponse(response.data);
    cachedData.roadConditions = {
      lastUpdated: new Date(),
      roads: roads,
      closures: extractClosures(response.data),
      emergencyNotices: extractEmergencyNotices(response.data)
    };
    */
    
    // Simulated data with realistic variations
    const conditions = ['good', 'caution', 'hazardous'];
    const visibilities = ['Clear', 'Light snow', 'Heavy snow', 'Fog'];
    const surfaces = ['Dry', 'Wet', 'Snow/Ice', 'Icy patches'];
    
    // Simulate changing conditions
    const i84Status = Math.random() > 0.7 ? 'caution' : 'good';
    const hwy26Status = Math.random() > 0.5 ? 'caution' : 'good';
    const hwy35Status = Math.random() > 0.8 ? 'caution' : 'good';
    
    cachedData.roadConditions = {
      lastUpdated: new Date(),
      roads: [
        {
          id: 'i84',
          name: 'I-84',
          description: 'Primary route from Portland',
          status: i84Status,
          visibility: i84Status === 'caution' ? 'Light snow' : 'Clear',
          surface: i84Status === 'caution' ? 'Wet' : 'Dry',
          advisories: i84Status === 'caution' ? ['Reduce speed', 'Use caution'] : ['No restrictions'],
          traffic: i84Status === 'caution' ? 'Moderate with slowdowns' : 'Normal flow',
          estimatedReopenTime: null
        },
        {
          id: 'hwy26',
          name: 'Highway 26',
          description: 'Alternate scenic route',
          status: hwy26Status,
          visibility: hwy26Status === 'caution' ? 'Light snow' : 'Clear',
          surface: hwy26Status === 'caution' ? 'Snow/Ice' : 'Wet',
          advisories: hwy26Status === 'caution' ? ['Chains required above Government Camp', 'Reduce speed'] : ['No chain requirements'],
          traffic: hwy26Status === 'caution' ? 'Moderate with slowdowns near Government Camp' : 'Normal flow',
          estimatedReopenTime: null
        },
        {
          id: 'hwy35',
          name: 'Highway 35',
          description: 'Local approach from Hood River',
          status: hwy35Status,
          visibility: hwy35Status === 'caution' ? 'Fog' : 'Clear',
          surface: hwy35Status === 'caution' ? 'Icy patches' : 'Dry',
          advisories: hwy35Status === 'caution' ? ['Watch for ice', 'Reduce speed'] : ['No restrictions'],
          traffic: 'Light traffic',
          estimatedReopenTime: null
        }
      ],
      closures: [],
      emergencyNotices: hwy26Status === 'hazardous' ? ['Highway 26: Winter storm warning in effect until 6 PM'] : []
    };
    
    console.log('Road conditions updated');
    
  } catch (error) {
    console.error('Error fetching road conditions:', error.message);
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for driving time estimation
app.post('/api/driving-time', async (req, res) => {
  try {
    const { origin, destination, departureTime } = req.body;
    
    // Use Hood Meadows as default destination
    const dest = destination || HOOD_MEADOWS_ADDRESS;
    
    // If no API key, return demo data
    if (GOOGLE_MAPS_API_KEY === 'DEMO_MODE') {
      return res.json(generateDemoTravelData(origin, dest, departureTime));
    }
    
    // Parse departure time
    let departureTimeParam = departureTime ? new Date(departureTime).getTime() / 1000 : Math.floor(Date.now() / 1000);
    
    // Call Google Maps Directions API with traffic model
    const response = await googleMapsClient.directions({
      params: {
        origin: origin,
        destination: dest,
        mode: "driving",
        departure_time: departureTimeParam,
        traffic_model: "best_guess",
        alternatives: true,
        key: GOOGLE_MAPS_API_KEY
      }
    });
    
    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Unable to calculate route' });
    }
    
    const routes = response.data.routes;
    const mainRoute = routes[0];
    const leg = mainRoute.legs[0];
    
    // Calculate traffic level based on duration vs duration_in_traffic
    const normalDuration = leg.duration.value;
    const trafficDuration = leg.duration_in_traffic ? leg.duration_in_traffic.value : normalDuration;
    const trafficRatio = trafficDuration / normalDuration;
    
    let trafficLevel = 'light';
    if (trafficRatio > 1.4) trafficLevel = 'heavy';
    else if (trafficRatio > 1.15) trafficLevel = 'moderate';
    
    // Calculate arrival time
    const arrivalTime = new Date(departureTimeParam * 1000 + trafficDuration * 1000);
    
    // Prepare alternative routes
    const alternativeRoutes = routes.slice(1, 3).map(route => ({
      summary: route.summary,
      distance: route.legs[0].distance.text,
      duration: route.legs[0].duration.text,
      durationValue: route.legs[0].duration.value
    }));
    
    // Calculate recommended departure time for 8 AM arrival
    const targetArrival = new Date(departureTimeParam * 1000);
    targetArrival.setHours(8, 0, 0, 0);
    if (targetArrival < new Date()) {
      targetArrival.setDate(targetArrival.getDate() + 1);
    }
    const recommendedDeparture = new Date(targetArrival.getTime() - trafficDuration * 1000);
    
    res.json({
      success: true,
      origin: leg.start_address,
      destination: leg.end_address,
      distance: leg.distance.text,
      distanceValue: leg.distance.value,
      duration: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
      durationValue: trafficDuration,
      normalDuration: leg.duration.text,
      trafficLevel: trafficLevel,
      arrivalTime: arrivalTime.toISOString(),
      mainRoute: mainRoute.summary,
      recommendedDeparture: recommendedDeparture.toISOString(),
      alternativeRoutes: alternativeRoutes,
      warnings: mainRoute.warnings || []
    });
    
  } catch (error) {
    console.error('Error calculating driving time:', error.message);
    
    // Return demo data on error
    const { origin, destination, departureTime } = req.body;
    res.json(generateDemoTravelData(origin, destination || HOOD_MEADOWS_ADDRESS, departureTime));
  }
});

// API endpoint for address autocomplete
app.get('/api/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input || input.length < 3) {
      return res.json({ predictions: [] });
    }
    
    // If no API key, return demo suggestions
    if (GOOGLE_MAPS_API_KEY === 'DEMO_MODE') {
      const demoSuggestions = [
        'Portland, OR',
        'Gresham, OR',
        'Beaverton, OR',
        'Lake Oswego, OR',
        'Hood River, OR',
        'The Dalles, OR'
      ].filter(place => place.toLowerCase().includes(input.toLowerCase()));
      
      return res.json({
        predictions: demoSuggestions.map((place, idx) => ({
          description: place,
          place_id: `demo_${idx}`
        }))
      });
    }
    
    const response = await googleMapsClient.placeAutocomplete({
      params: {
        input: input,
        types: 'address',
        components: 'country:us',
        key: GOOGLE_MAPS_API_KEY
      }
    });
    
    res.json({
      predictions: response.data.predictions
    });
    
  } catch (error) {
    console.error('Error in autocomplete:', error.message);
    res.json({ predictions: [] });
  }
});

// Generate demo travel data when API key is not available
function generateDemoTravelData(origin, destination, departureTime) {
  const baseTime = 5400; // 1.5 hours in seconds
  const variation = Math.random() * 1800 - 900; // +/- 15 minutes
  const travelTime = Math.floor(baseTime + variation);
  
  // Simulate traffic based on time of day
  const depTime = departureTime ? new Date(departureTime) : new Date();
  const hour = depTime.getHours();
  let trafficMultiplier = 1.0;
  let trafficLevel = 'light';
  
  // Morning rush hour (6-9 AM)
  if (hour >= 6 && hour <= 9) {
    trafficMultiplier = 1.3;
    trafficLevel = 'moderate';
  }
  // Evening rush hour (4-7 PM)
  else if (hour >= 16 && hour <= 19) {
    trafficMultiplier = 1.4;
    trafficLevel = 'heavy';
  }
  // Weekend mornings (5-7 AM)
  else if ((depTime.getDay() === 0 || depTime.getDay() === 6) && hour >= 5 && hour <= 7) {
    trafficMultiplier = 1.2;
    trafficLevel = 'moderate';
  }
  
  const trafficTime = Math.floor(travelTime * trafficMultiplier);
  const arrivalTime = new Date(depTime.getTime() + trafficTime * 1000);
  
  // Calculate recommended departure for 8 AM arrival
  const targetArrival = new Date(depTime);
  targetArrival.setHours(8, 0, 0, 0);
  if (targetArrival < new Date()) {
    targetArrival.setDate(targetArrival.getDate() + 1);
  }
  const recommendedDeparture = new Date(targetArrival.getTime() - trafficTime * 1000);
  
  return {
    success: true,
    demo: true,
    origin: origin || 'Portland, OR',
    destination: destination,
    distance: '65 miles',
    distanceValue: 104607,
    duration: formatDuration(trafficTime),
    durationValue: trafficTime,
    normalDuration: formatDuration(travelTime),
    trafficLevel: trafficLevel,
    arrivalTime: arrivalTime.toISOString(),
    mainRoute: 'I-84 E and OR-35 S',
    recommendedDeparture: recommendedDeparture.toISOString(),
    alternativeRoutes: [
      {
        summary: 'US-26 E (Scenic Route)',
        distance: '68 miles',
        duration: formatDuration(Math.floor(trafficTime * 1.15)),
        durationValue: Math.floor(trafficTime * 1.15)
      }
    ],
    warnings: []
  };
}

// Helper function to format duration in seconds to human-readable string
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

// API endpoint for current conditions
app.get('/api/conditions', (req, res) => {
  res.json({
    lastUpdated: cachedData.lastUpdated,
    conditions: cachedData.conditions
  });
});

// API endpoint for snowfall history
app.get('/api/snowfall-history', (req, res) => {
  res.json({
    history: cachedData.snowfallHistory
  });
});

// API endpoint for weather report
app.get('/api/weather-report', (req, res) => {
  res.json(cachedData.weatherReport);
});

// Fetch Reddit posts about Hood Meadows
async function fetchRedditPosts() {
  try {
    console.log('Fetching Reddit posts...');
    
    // Fetch from r/mthoodmeadows
    const searchUrl = 'https://www.reddit.com/r/mthoodmeadows/hot.json?limit=8';
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'SkiDashboard/1.0'
      },
      timeout: 10000
    });
    
    const posts = response.data.data.children
      .filter(child => child.kind === 't3') // Filter for posts only
      .map(child => {
        const post = child.data;
        const createdDate = new Date(post.created_utc * 1000);
        const now = new Date();
        const hoursDiff = Math.floor((now - createdDate) / (1000 * 60 * 60));
        
        let timeAgo;
        if (hoursDiff < 1) {
          const minutesDiff = Math.floor((now - createdDate) / (1000 * 60));
          timeAgo = `${minutesDiff}m ago`;
        } else if (hoursDiff < 24) {
          timeAgo = `${hoursDiff}h ago`;
        } else {
          const daysDiff = Math.floor(hoursDiff / 24);
          timeAgo = `${daysDiff}d ago`;
        }
        
        // Get preview text (first 100 chars of selftext)
        let preview = '';
        if (post.selftext && post.selftext.length > 0) {
          preview = post.selftext.substring(0, 100).replace(/\n/g, ' ').trim();
          if (post.selftext.length > 100) preview += '...';
        }
        
        return {
          id: post.id,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit_name_prefixed,
          url: `https://www.reddit.com${post.permalink}`,
          upvotes: post.ups,
          comments: post.num_comments,
          timeAgo: timeAgo,
          created: createdDate.toISOString(),
          preview: preview,
          thumbnail: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null
        };
      })
      .slice(0, 8); // Top 8 posts
    
    cachedData.redditFeed = {
      lastUpdated: new Date(),
      posts: posts
    };
    
    console.log(`Fetched ${posts.length} Reddit posts`);
    
  } catch (error) {
    console.error('Error fetching Reddit posts:', error.message);
    // Keep existing cached data on error
  }
}

// API endpoint for road conditions
app.get('/api/road-conditions', (req, res) => {
  res.json(cachedData.roadConditions);
});

// API endpoint for Reddit community feed
app.get('/api/reddit-feed', (req, res) => {
  res.json(cachedData.redditFeed);
});

// API endpoint to force refresh
app.post('/api/refresh', async (req, res) => {
  await scrapeHoodMeadowsData();
  await fetchRedditPosts();
  res.json({ success: true, lastUpdated: cachedData.lastUpdated });
});

// ============================================
// SNOWFALL DATA API ENDPOINTS (Real SNOTEL Data)
// ============================================

// API endpoint for year-over-year snowfall comparison
app.get('/api/snowfall/year-over-year', async (req, res) => {
  try {
    const yearsParam = req.query.years;
    let years = null;
    
    if (yearsParam) {
      years = yearsParam.split(',').map(y => parseInt(y.trim()));
    }
    
    const data = await snowfallService.getYearOverYearData(years);
    res.json(data);
  } catch (error) {
    console.error('Error fetching year-over-year data:', error);
    res.status(500).json({ error: 'Failed to fetch snowfall data' });
  }
});

// API endpoint for current season dashboard data
app.get('/api/snowfall/dashboard', async (req, res) => {
  try {
    const data = await snowfallService.getSnowfallDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch snowfall data' });
  }
});

// API endpoint for refreshing snowfall cache
app.post('/api/snowfall/refresh', async (req, res) => {
  try {
    // Clear cache by deleting cache files
    const cacheDir = path.join(__dirname, 'data', 'snowfall-cache');
    if (fs.existsSync(cacheDir)) {
      const files = fs.readdirSync(cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(cacheDir, file));
      }
    }
    
    res.json({ success: true, message: 'Cache cleared. Next request will fetch fresh data.' });
  } catch (error) {
    console.error('Error refreshing snowfall cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

// ============================================
// NATIONAL WEATHER SERVICE API ENDPOINTS
// ============================================

// API endpoint for NWS current conditions
app.get('/api/nws/conditions', async (req, res) => {
  try {
    const data = await nwsService.getSkiDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching NWS conditions:', error);
    res.status(500).json({ error: 'Failed to fetch NWS data' });
  }
});

// API endpoint for NWS forecast
app.get('/api/nws/forecast', async (req, res) => {
  try {
    const data = await nwsService.getNWSCurrentConditions();
    res.json(data);
  } catch (error) {
    console.error('Error fetching NWS forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// ============================================
// OPEN-METEO WEATHER API ENDPOINTS
// (Accurate mountain elevation forecasting)
// ============================================

// API endpoint for Open-Meteo ski conditions (summit + base)
app.get('/api/openmeteo/ski-conditions', async (req, res) => {
  try {
    const data = await openmeteoService.getSkiDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Open-Meteo ski conditions:', error);
    res.status(500).json({ error: 'Failed to fetch ski conditions' });
  }
});

// API endpoint for Open-Meteo 7-day forecast
app.get('/api/openmeteo/forecast', async (req, res) => {
  try {
    const data = await openmeteoService.getForecast();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Open-Meteo forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// API endpoint for Open-Meteo summit conditions
app.get('/api/openmeteo/summit', async (req, res) => {
  try {
    const data = await openmeteoService.getSkiConditions();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Open-Meteo summit data:', error);
    res.status(500).json({ error: 'Failed to fetch summit data' });
  }
});

// API endpoint for Open-Meteo base conditions
app.get('/api/openmeteo/base', async (req, res) => {
  try {
    const data = await openmeteoService.getBaseConditions();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Open-Meteo base data:', error);
    res.status(500).json({ error: 'Failed to fetch base data' });
  }
});

// Initialize sample data
initializeSampleData();

// Refresh data every 30 minutes
setInterval(() => {
  scrapeHoodMeadowsData();
  fetchRedditPosts();
}, 30 * 60 * 1000);

// Initial scrape
scrapeHoodMeadowsData();
fetchRedditPosts();

app.listen(PORT, () => {
  console.log(`Hood Meadows Ski Dashboard running on:`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://192.168.1.36:${PORT}`);
  console.log(`\nAuto-refresh: every 30 minutes`);
});
