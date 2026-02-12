/**
 * National Weather Service Data Service for Mt Hood
 * Fetches snowfall and weather data from NWS API
 * Uses forecast and observation data for accuracy
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// NWS forecast office and grid points for Mt Hood area
const NWS_OFFICE = 'PQR'; // Portland Forecast Office
const NWS_GRID_X = 104;
const NWS_GRID_Y = 102;

// Higher elevation forecast points (approximations for Mt Hood)
const HOOD_MEADOWS_LAT = 45.3311;
const HOOD_MEADOWS_LNG = -121.6644;

const CACHE_DIR = path.join(__dirname, 'data', 'nws-cache');
const CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours for forecasts

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Get cached data if available and not expired
 */
function getCachedData(cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = Date.now() - stats.mtimeMs;
      
      if (age < CACHE_DURATION_MS) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        console.log(`[NWS] Using cached data for ${cacheKey} (age: ${Math.round(age / 1000 / 60)}m)`);
        return data;
      }
    }
  } catch (error) {
    console.error(`[NWS] Error reading cache: ${error.message}`);
  }
  
  return null;
}

/**
 * Save data to cache
 */
function setCachedData(cacheKey, data) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    console.log(`[NWS] Cached data for ${cacheKey}`);
  } catch (error) {
    console.error(`[NWS] Error writing cache: ${error.message}`);
  }
}

/**
 * Fetch current NWS forecast for Mt Hood area
 */
async function fetchNWSForecast() {
  try {
    console.log('[NWS] Fetching forecast from National Weather Service...');
    
    // Get forecast for Portland grid point (adjusted for elevation)
    const forecastUrl = `https://api.weather.gov/gridpoints/${NWS_OFFICE}/${NWS_GRID_X},${NWS_GRID_Y}/forecast`;
    
    const response = await axios.get(forecastUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SkiDashboard/1.0 (contact: admin@example.com)'
      }
    });
    
    const forecast = response.data.properties;
    
    // Extract relevant snow/weather periods
    const periods = forecast.periods || [];
    const nextSnowPeriod = periods.find(p => 
      p.detailedForecast.toLowerCase().includes('snow') ||
      p.shortForecast.toLowerCase().includes('snow')
    );
    
    const currentPeriod = periods[0] || {};
    
    return {
      timestamp: new Date(),
      forecast: {
        current: {
          temperature: currentPeriod.temperature,
          tempUnit: currentPeriod.temperatureUnit,
          windSpeed: currentPeriod.windSpeed,
          windDirection: currentPeriod.windDirection,
          shortForecast: currentPeriod.shortForecast,
          detailedForecast: currentPeriod.detailedForecast,
          icon: currentPeriod.icon
        },
        nextSnow: nextSnowPeriod ? {
          name: nextSnowPeriod.name,
          shortForecast: nextSnowPeriod.shortForecast,
          detailedForecast: nextSnowPeriod.detailedForecast
        } : null,
        periods: periods.slice(0, 7) // Next 7 periods
      }
    };
    
  } catch (error) {
    console.error(`[NWS] Error fetching forecast: ${error.message}`);
    throw error;
  }
}

/**
 * Get current conditions and recent snowfall
 */
async function getNWSCurrentConditions() {
  const cacheKey = 'nws-forecast';
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data
  try {
    const forecast = await fetchNWSForecast();
    setCachedData(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error(`[NWS] Failed to fetch conditions: ${error.message}`);
    
    // Return fallback data
    return {
      timestamp: new Date(),
      forecast: {
        current: {
          temperature: null,
          shortForecast: 'Unable to load',
          detailedForecast: 'NWS data unavailable'
        },
        periods: []
      }
    };
  }
}

/**
 * Get snowfall estimate from forecast text
 * Parses text like "2-4 inches of snow expected"
 */
function parseSnowfallFromForecast(detailedForecast) {
  if (!detailedForecast) return { min: 0, max: 0 };
  
  const text = detailedForecast.toLowerCase();
  
  // Look for patterns like "2-4 inches" or "4 to 6 inches"
  const patterns = [
    /(\d+)\s*(?:to|-)\s*(\d+)\s*inches/,
    /(\d+(?:\.\d+)?)\s*inches/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      } else {
        const amount = parseFloat(match[1]);
        return { min: amount, max: amount };
      }
    }
  }
  
  return { min: 0, max: 0 };
}

/**
 * Process forecast for ski dashboard
 */
async function getSkiDashboardData() {
  const forecast = await getNWSCurrentConditions();
  const current = forecast.forecast.current;
  
  // Extract snowfall info
  let expected24hSnow = '0"';
  if (forecast.forecast.nextSnow) {
    const snow = parseSnowfallFromForecast(forecast.forecast.nextSnow.detailedForecast);
    if (snow.max > 0) {
      expected24hSnow = snow.min === snow.max ? `${snow.max}"` : `${snow.min}-${snow.max}"`;
    }
  }
  
  return {
    timestamp: forecast.timestamp,
    conditions: {
      temperature: current.temperature ? `${current.temperature}°${current.tempUnit}` : 'N/A',
      wind: current.windSpeed ? `${current.windSpeed} ${current.windDirection || ''}`.trim() : 'N/A',
      conditions: current.shortForecast || 'Unknown',
      expected24hSnow: expected24hSnow,
      detailedForecast: current.detailedForecast || ''
    },
    forecast: {
      nextSnow: forecast.forecast.nextSnow,
      periods: forecast.forecast.periods
    }
  };
}

module.exports = {
  getNWSCurrentConditions,
  getSkiDashboardData,
  parseSnowfallFromForecast,
  fetchNWSForecast
};
