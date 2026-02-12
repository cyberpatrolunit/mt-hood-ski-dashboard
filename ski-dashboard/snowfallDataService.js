/**
 * Snowfall Data Service for Mt Hood Meadows
 * Fetches real data from SNOTEL Station 651 (Mt Hood Test Site)
 * Implements caching and year-over-year comparison functionality
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// SNOTEL Station 651: Mt Hood Test Site (5380 ft)
// Located near Hood Meadows ski area
const SNOTEL_STATION = '651';
const SNOTEL_STATE = 'OR';
const CACHE_DIR = path.join(__dirname, 'data', 'snowfall-cache');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Fetch snow depth data from SNOTEL for a specific date range
 * @param {string} startDate - YYYY-MM-DD format
 * @param {string} endDate - YYYY-MM-DD format
 * @returns {Promise<Array>} Array of {date, snowDepth, snowfall} objects
 */
async function fetchSNOTELData(startDate, endDate) {
  try {
    const url = `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${SNOTEL_STATION}:${SNOTEL_STATE}:SNTL|id=%22%22|name/${startDate},${endDate}/SNWD::value,PRCP::value`;
    
    console.log(`Fetching SNOTEL data from ${startDate} to ${endDate}...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'SkiDashboard/1.0'
      },
      timeout: 15000
    });
    
    const csvData = response.data;
    const lines = csvData.split('\n');
    
    // Find the data start (skip header comments)
    let dataStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Date,')) {
        dataStartIndex = i + 1;
        break;
      }
    }
    
    const data = [];
    let prevDepth = null;
    
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      
      const parts = line.split(',');
      if (parts.length < 2) continue;
      
      const date = parts[0];
      const snowDepth = parseFloat(parts[1]) || 0;
      const precip = parts.length > 2 ? (parseFloat(parts[2]) || 0) : 0;
      
      // Calculate new snowfall - use precipitation as the primary indicator
      // This is more accurate since depth can decrease due to settling/compression
      let snowfall = 0;
      if (precip > 0) {
        // If there's precipitation, use it as the snowfall amount
        // (Most winter precip at this elevation is snow)
        snowfall = Math.round(precip * 10) / 10;
      } else if (prevDepth !== null && snowDepth > prevDepth) {
        // If no precipitation recorded but depth increased, use the depth increase
        snowfall = Math.round((snowDepth - prevDepth) * 10) / 10;
      }
      
      data.push({
        date,
        snowDepth: Math.round(snowDepth),
        snowfall: snowfall,
        precipitation: precip
      });
      
      prevDepth = snowDepth;
    }
    
    return data;
    
  } catch (error) {
    console.error(`Error fetching SNOTEL data: ${error.message}`);
    throw error;
  }
}

/**
 * Get water year dates (Oct 1 to current date)
 * @param {number} year - The ending year of the water year (e.g., 2026 for WY 2025-2026)
 * @returns {object} {startDate, endDate}
 */
function getWaterYearDates(year) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();
  
  // If we're in Oct-Dec, water year started this calendar year
  // If we're in Jan-Sep, water year started last calendar year
  const waterYearStartYear = (year === currentYear && currentMonth >= 10) ? year : year - 1;
  
  const startDate = `${waterYearStartYear}-10-01`;
  
  // For current year, use today's date
  // For past years, use Sep 30 of the water year
  let endDate;
  if (year === currentYear) {
    const month = String(currentMonth).padStart(2, '0');
    const day = String(currentDay).padStart(2, '0');
    endDate = `${year}-${month}-${day}`;
  } else {
    endDate = `${year}-09-30`;
  }
  
  return { startDate, endDate };
}

/**
 * Get cached data if available and not expired
 * @param {string} cacheKey - Cache file key
 * @returns {object|null} Cached data or null
 */
function getCachedData(cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = Date.now() - stats.mtimeMs;
      
      if (age < CACHE_DURATION_MS) {
        const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        console.log(`Using cached data for ${cacheKey} (age: ${Math.round(age / 1000 / 60)} minutes)`);
        return data;
      }
    }
  } catch (error) {
    console.error(`Error reading cache: ${error.message}`);
  }
  
  return null;
}

/**
 * Save data to cache
 * @param {string} cacheKey - Cache file key
 * @param {object} data - Data to cache
 */
function setCachedData(cacheKey, data) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    console.log(`Cached data for ${cacheKey}`);
  } catch (error) {
    console.error(`Error writing cache: ${error.message}`);
  }
}

/**
 * Fetch historical snowfall data for multiple years
 * @param {Array<number>} years - Array of years to fetch (e.g., [2021, 2022, 2023, 2024])
 * @returns {Promise<object>} Object with year as key, data array as value
 */
async function fetchHistoricalData(years) {
  const allData = {};
  
  for (const year of years) {
    const cacheKey = `snotel-${SNOTEL_STATION}-wy${year}`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      allData[year] = cached;
      continue;
    }
    
    // Fetch from SNOTEL
    try {
      const { startDate, endDate } = getWaterYearDates(year);
      const data = await fetchSNOTELData(startDate, endDate);
      allData[year] = data;
      setCachedData(cacheKey, data);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to fetch data for year ${year}: ${error.message}`);
      allData[year] = []; // Empty array for failed years
    }
  }
  
  return allData;
}

/**
 * Calculate snowfall insights and statistics
 * @param {object} historicalData - Data from fetchHistoricalData
 * @returns {object} Insights object
 */
function calculateInsights(historicalData) {
  const years = Object.keys(historicalData).map(Number).sort((a, b) => b - a);
  const currentYear = years[0];
  const lastYear = years[1];
  
  if (!historicalData[currentYear] || !historicalData[lastYear]) {
    return null;
  }
  
  // Calculate total snowfall for each year
  const yearTotals = {};
  for (const year of years) {
    const data = historicalData[year];
    const total = data.reduce((sum, day) => sum + day.snowfall, 0);
    yearTotals[year] = Math.round(total * 10) / 10;
  }
  
  // Calculate averages
  const allTotals = Object.values(yearTotals);
  const historicalAverage = Math.round((allTotals.reduce((a, b) => a + b, 0) / allTotals.length) * 10) / 10;
  
  // Current season vs last season
  const currentTotal = yearTotals[currentYear];
  const lastTotal = yearTotals[lastYear];
  const vsLastYear = Math.round((currentTotal - lastTotal) * 10) / 10;
  const vsLastYearPercent = lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : 0;
  
  // Vs historical average
  const vsAverage = Math.round((currentTotal - historicalAverage) * 10) / 10;
  const vsAveragePercent = historicalAverage > 0 ? Math.round(((currentTotal - historicalAverage) / historicalAverage) * 100) : 0;
  
  // Find best month
  let bestMonth = null;
  let bestMonthTotal = 0;
  
  for (const year of years) {
    const data = historicalData[year];
    const monthlyTotals = {};
    
    for (const day of data) {
      const month = day.date.substring(0, 7); // YYYY-MM
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += day.snowfall;
    }
    
    for (const [month, total] of Object.entries(monthlyTotals)) {
      if (total > bestMonthTotal) {
        bestMonthTotal = total;
        bestMonth = month;
      }
    }
  }
  
  const bestMonthName = bestMonth ? new Date(bestMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';
  
  // Trend indicator
  let trend = '→';
  if (vsLastYearPercent > 10) trend = '↑';
  else if (vsLastYearPercent < -10) trend = '↓';
  
  return {
    currentYear: {
      year: currentYear,
      total: currentTotal,
      daysWithData: historicalData[currentYear].length
    },
    lastYear: {
      year: lastYear,
      total: lastTotal
    },
    comparison: {
      vsLastYear,
      vsLastYearPercent,
      vsAverage,
      vsAveragePercent,
      trend
    },
    bestMonth: {
      month: bestMonthName,
      total: Math.round(bestMonthTotal * 10) / 10
    },
    historicalAverage,
    yearTotals
  };
}

/**
 * Get snowfall data for the dashboard
 * Includes current season and last 30 days
 * @returns {Promise<object>} Dashboard data
 */
async function getSnowfallDashboardData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Fetch last 30 days for quick view
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];
  
  const cacheKey = `snotel-${SNOTEL_STATION}-last30`;
  let last30Days = getCachedData(cacheKey);
  
  if (!last30Days) {
    last30Days = await fetchSNOTELData(startDate, endDate);
    setCachedData(cacheKey, last30Days);
  }
  
  return {
    last30Days,
    currentSnowDepth: last30Days.length > 0 ? last30Days[last30Days.length - 1].snowDepth : 0,
    last24Hours: last30Days.length > 0 ? last30Days[last30Days.length - 1].snowfall : 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get year-over-year comparison data
 * @param {Array<number>} years - Years to compare (default: last 4 years)
 * @returns {Promise<object>} Comparison data with aligned dates
 */
async function getYearOverYearData(years = null) {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Default to last 4 water years
  if (!years) {
    years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  }
  
  // Fetch all historical data
  const historicalData = await fetchHistoricalData(years);
  
  // Calculate insights
  const insights = calculateInsights(historicalData);
  
  // Align data by day-of-water-year for charting
  const alignedData = alignDataByWaterYearDay(historicalData);
  
  return {
    historicalData,
    alignedData,
    insights,
    years: years.sort((a, b) => b - a),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Align historical data by water year day for easy comparison
 * @param {object} historicalData - Data from fetchHistoricalData
 * @returns {Array} Array of {dayOfYear, date labels, values for each year}
 */
function alignDataByWaterYearDay(historicalData) {
  const aligned = [];
  const years = Object.keys(historicalData).map(Number).sort((a, b) => b - a);
  
  // Find max days in any year
  let maxDays = 0;
  for (const year of years) {
    maxDays = Math.max(maxDays, historicalData[year].length);
  }
  
  for (let dayIndex = 0; dayIndex < maxDays; dayIndex++) {
    const dataPoint = {
      dayOfWaterYear: dayIndex + 1,
      dateLabels: {},
      snowDepth: {},
      snowfall: {},
      cumulativeSnowfall: {}
    };
    
    for (const year of years) {
      const yearData = historicalData[year];
      if (dayIndex < yearData.length) {
        const day = yearData[dayIndex];
        const date = new Date(day.date);
        dataPoint.dateLabels[year] = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dataPoint.snowDepth[year] = day.snowDepth;
        dataPoint.snowfall[year] = day.snowfall;
        
        // Calculate cumulative snowfall
        if (dayIndex === 0) {
          dataPoint.cumulativeSnowfall[year] = day.snowfall;
        } else if (dayIndex > 0 && aligned[dayIndex - 1]) {
          dataPoint.cumulativeSnowfall[year] = (aligned[dayIndex - 1].cumulativeSnowfall[year] || 0) + day.snowfall;
        }
      }
    }
    
    aligned.push(dataPoint);
  }
  
  return aligned;
}

module.exports = {
  fetchSNOTELData,
  fetchHistoricalData,
  getSnowfallDashboardData,
  getYearOverYearData,
  calculateInsights
};
