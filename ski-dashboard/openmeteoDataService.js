/**
 * Open-Meteo Weather Service for Mt Hood
 * Free, accurate weather API with excellent mountain elevation support
 * No API key required
 * 
 * Uses Mt Hood summit coordinates and high-elevation data
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Mt Hood coordinates (summit elevation: 11,249 ft / 3,429 m)
const HOOD_LAT = 45.3731;
const HOOD_LNG = -121.6970;
const HOOD_ELEVATION = 3429; // meters

// Hood Meadows base area (approx 6,000 ft / 1,829 m)
const MEADOWS_LAT = 45.3311;
const MEADOWS_LNG = -121.6644;
const MEADOWS_ELEVATION = 1829; // meters

// Use /tmp for Vercel serverless environment, fallback to local for development
const CACHE_DIR = process.env.VERCEL 
  ? path.join('/tmp', 'openmeteo-cache')
  : path.join(__dirname, 'data', 'openmeteo-cache');
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

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
        console.log(`[OpenMeteo] Using cached data for ${cacheKey} (age: ${Math.round(age / 1000 / 60)}m)`);
        return data;
      }
    }
  } catch (error) {
    console.error(`[OpenMeteo] Error reading cache: ${error.message}`);
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
    console.log(`[OpenMeteo] Cached data for ${cacheKey}`);
  } catch (error) {
    console.error(`[OpenMeteo] Error writing cache: ${error.message}`);
  }
}

/**
 * Fetch weather from Open-Meteo API
 * Uses high-elevation Mt Hood coordinates
 */
async function fetchOpenMeteoData(lat = HOOD_LAT, lng = HOOD_LNG, elevation = HOOD_ELEVATION) {
  try {
    console.log(`[OpenMeteo] Fetching data for lat=${lat}, lng=${lng}, elevation=${elevation}m...`);
    
    // Open-Meteo forecast API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&elevation=${elevation}&hourly=temperature_2m,precipitation,snowfall,snow_depth,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,snow_depth_max,wind_speed_10m_max&timezone=America/Los_Angeles&forecast_days=7`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SkiDashboard/1.0 (contact: admin@example.com)'
      }
    });
    
    const data = response.data;
    
    return {
      timestamp: new Date(),
      location: {
        latitude: lat,
        longitude: lng,
        elevation: elevation,
        name: elevation > 3000 ? 'Mt Hood Summit' : 'Hood Meadows Base'
      },
      current: {
        temperature: data.hourly.temperature_2m[0],
        precipitation: data.hourly.precipitation[0],
        snowfall: data.hourly.snowfall[0],
        snowDepth: data.hourly.snow_depth[0],
        windSpeed: data.hourly.wind_speed_10m[0]
      },
      daily: data.daily,
      hourly: {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m,
        precipitation: data.hourly.precipitation,
        snowfall: data.hourly.snowfall,
        windSpeed: data.hourly.wind_speed_10m
      }
    };
    
  } catch (error) {
    console.error(`[OpenMeteo] Error fetching data: ${error.message}`);
    throw error;
  }
}

/**
 * Get current ski conditions from Open-Meteo
 */
async function getSkiConditions() {
  const cacheKey = 'openmeteo-summit';
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data (Mt Hood summit)
  try {
    const data = await fetchOpenMeteoData(HOOD_LAT, HOOD_LNG, HOOD_ELEVATION);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[OpenMeteo] Failed to fetch ski conditions: ${error.message}`);
    
    return {
      timestamp: new Date(),
      location: { name: 'Mt Hood Summit', elevation: HOOD_ELEVATION },
      current: { temperature: null, snowfall: 0 },
      daily: { snowfall_sum: [] }
    };
  }
}

/**
 * Get base area conditions from Open-Meteo
 */
async function getBaseConditions() {
  const cacheKey = 'openmeteo-base';
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data (Hood Meadows base)
  try {
    const data = await fetchOpenMeteoData(MEADOWS_LAT, MEADOWS_LNG, MEADOWS_ELEVATION);
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`[OpenMeteo] Failed to fetch base conditions: ${error.message}`);
    
    return {
      timestamp: new Date(),
      location: { name: 'Hood Meadows Base', elevation: MEADOWS_ELEVATION },
      current: { temperature: null, snowfall: 0 },
      daily: { snowfall_sum: [] }
    };
  }
}

/**
 * Convert centimeters to inches
 * @param {number} cm - Value in centimeters
 * @returns {number} Value in inches
 */
function cmToInches(cm) {
  return cm / 2.54;
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

/**
 * Process forecast data for ski dashboard
 */
async function getSkiDashboardData() {
  const summit = await getSkiConditions();
  const base = await getBaseConditions();
  
  // Get next 3 days of forecast
  const forecast = [];
  if (summit.daily && summit.daily.time) {
    for (let i = 0; i < Math.min(3, summit.daily.time.length); i++) {
      forecast.push({
        date: summit.daily.time[i],
        tempMax: Math.round(celsiusToFahrenheit(summit.daily.temperature_2m_max[i])),
        tempMin: Math.round(celsiusToFahrenheit(summit.daily.temperature_2m_min[i])),
        snowfallSum: Math.round(cmToInches(summit.daily.snowfall_sum[i]) * 10) / 10,
        precipitationSum: summit.daily.precipitation_sum[i],
        windSpeed: summit.daily.wind_speed_10m_max[i],
        snowDepth: Math.round(cmToInches(summit.daily.snow_depth_max[i]) * 10) / 10
      });
    }
  }
  
  // Calculate 24hr snowfall
  const hourlySnowfall = summit.hourly?.snowfall || [];
  const next24hSnow = hourlySnowfall.slice(0, 24).reduce((sum, val) => sum + (val || 0), 0);
  const next24hSnowInches = cmToInches(next24hSnow);
  
  return {
    timestamp: summit.timestamp,
    summit: {
      name: 'Mt Hood Summit (11,249 ft)',
      current: {
        temperature: Math.round(celsiusToFahrenheit(summit.current.temperature)),
        snowfall: Math.round(cmToInches(summit.current.snowfall) * 10) / 10,
        snowDepth: Math.round(cmToInches(summit.current.snowDepth) * 10) / 10,
        windSpeed: Math.round(summit.current.windSpeed * 0.621371) // km/h to mph
      },
      forecast: forecast
    },
    base: {
      name: 'Hood Meadows Base (~6,000 ft)',
      current: {
        temperature: Math.round(celsiusToFahrenheit(base.current.temperature)),
        snowfall: Math.round(cmToInches(base.current.snowfall) * 10) / 10,
        snowDepth: Math.round(cmToInches(base.current.snowDepth) * 10) / 10,
        windSpeed: Math.round(base.current.windSpeed * 0.621371) // km/h to mph
      }
    },
    summary: {
      next24hSnow: `${next24hSnowInches.toFixed(1)}"`,
      nextSnowDay: forecast.find(f => f.snowfallSum > 0) ? 'Yes' : 'No snow forecast',
      elevationDifference: `Summit ${Math.round(celsiusToFahrenheit(summit.current.temperature))}°F, Base ${Math.round(celsiusToFahrenheit(base.current.temperature))}°F`
    }
  };
}

/**
 * Get 7-day forecast
 */
async function getForecast() {
  const conditions = await getSkiConditions();
  
  if (!conditions.daily || !conditions.daily.time) {
    return { error: 'Unable to fetch forecast' };
  }
  
  const forecast = [];
  for (let i = 0; i < conditions.daily.time.length; i++) {
    forecast.push({
      date: conditions.daily.time[i],
      tempMax: Math.round(celsiusToFahrenheit(conditions.daily.temperature_2m_max[i])),
      tempMin: Math.round(celsiusToFahrenheit(conditions.daily.temperature_2m_min[i])),
      snowfall: Math.round(cmToInches(conditions.daily.snowfall_sum[i]) * 10) / 10,
      precipitation: conditions.daily.precipitation_sum[i],
      windSpeed: Math.round(conditions.daily.wind_speed_10m_max[i] * 0.621371),
      snowDepth: Math.round(cmToInches(conditions.daily.snow_depth_max[i]) * 10) / 10
    });
  }
  
  return {
    location: conditions.location,
    forecast: forecast,
    timestamp: conditions.timestamp
  };
}

module.exports = {
  getSkiConditions,
  getBaseConditions,
  getSkiDashboardData,
  getForecast,
  fetchOpenMeteoData
};
