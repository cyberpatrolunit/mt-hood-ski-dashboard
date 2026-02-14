# Mt Hood Ski Dashboard 🏔️

A beautiful, real-time ski dashboard for Mt Hood Meadows featuring live weather, snowfall data, road conditions, and trip planning.

## Features

✅ **Real-Time Mountain Weather** - Live conditions from Open-Meteo API  
✅ **Snowfall History & Trends** - SNOTEL data with year-over-year comparisons  
✅ **Season Stories** - Historical insights and trend analysis  
✅ **Driving Time Estimator** - Google Maps integration for trip planning  
✅ **Road Conditions** - Live Oregon DOT TripCheck data  
✅ **Community Feed** - Latest posts from r/mthood  
✅ **Gear Checklist** - Never forget your essentials  
✅ **Mobile-First Design** - Optimized for iPhone viewing

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript + Chart.js
- **APIs:** Open-Meteo, USDA SNOTEL, Google Maps, Reddit
- **Styling:** Custom CSS with cozy mountain vibes

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start
# or
node server.js

# Server runs on http://localhost:18791
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Deploy with default Node.js settings
4. Server runs on port defined in `server.js`

### Environment Variables

No API keys required! All data sources are public.

## Data Sources

- **Weather:** [Open-Meteo](https://open-meteo.com/) - Free, no API key
- **Snowfall:** [USDA SNOTEL](https://wcc.sc.egov.usda.gov/) - Mt Hood Test Site (Station 651)
- **Road Conditions:** [Oregon TripCheck](https://www.tripcheck.com/)
- **Community:** Reddit r/mthood

## Recent Updates

- ✅ Fixed metric to imperial unit conversions (Feb 14, 2026)
- ✅ Fixed Season Stories insights display (Feb 14, 2026)
- ✅ Improved mobile chart layout for iPhone (Feb 14, 2026)

## License

MIT

---

Built with ❤️ for the Mt Hood community
