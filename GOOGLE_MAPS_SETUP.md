# Google Maps Weather Integration Setup

This guide will help you set up the Google Maps API integration for the campus weather feature on the dashboard.

## 🗺️ Features

- **Interactive Campus Map**: Shows Wits University campus with satellite view
- **Weather Overlay**: Displays current weather conditions on the map
- **Weather Card**: Detailed weather information with study recommendations
- **Real-time Updates**: Weather data refreshes every 5 minutes
- **Study Recommendations**: Weather-based suggestions for indoor/outdoor study

## 🔧 Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** (optional, for future features)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Frontend Environment Variables
VITE_PUBLIC_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Key Restrictions (Recommended)

For security, restrict your API key:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:5173/*` (development)
     - `https://yourdomain.com/*` (production)
4. Under "API restrictions":
   - Choose "Restrict key"
   - Select: Maps JavaScript API, Places API

### 4. Test the Integration

1. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the dashboard
3. You should see:
   - Weather card with current conditions
   - Interactive map showing campus location
   - Weather marker on the map

## 🎯 Components

### WeatherCard
- Displays current weather conditions
- Shows study recommendations based on weather
- Auto-refreshes every 5 minutes
- Includes humidity, wind, pressure, visibility

### WeatherMap
- Interactive Google Maps with campus location
- Custom weather marker with temperature
- Satellite/hybrid view of campus
- Clickable marker with detailed weather info

### useWeather Hook
- Fetches weather data from backend API
- Handles loading states and errors
- Provides weather utilities and formatting
- Auto-refresh functionality

## 🌤️ Weather Data

The weather integration uses:
- **OpenWeatherMap API** (backend)
- **Wits University coordinates**: -26.1929, 28.0305
- **Real-time weather data** with 5-minute caching
- **Study recommendations** based on weather conditions

## 🔒 Security Notes

- API key is restricted to specific domains
- Weather data is cached to reduce API calls
- No sensitive data is exposed in frontend
- Environment variables are properly configured

## 🐛 Troubleshooting

### Map Not Loading
- Check if Google Maps API key is set correctly
- Verify API key restrictions allow your domain
- Check browser console for errors
- Ensure Maps JavaScript API is enabled

### Weather Data Not Showing
- Check if backend weather API is running
- Verify OpenWeatherMap API key in backend
- Check network requests in browser dev tools

### API Key Errors
- Ensure API key is not restricted too strictly
- Check if billing is enabled for the Google Cloud project
- Verify the API key has the correct permissions

## 📱 Responsive Design

The weather components are fully responsive:
- **Mobile**: Stacked layout with smaller map
- **Tablet**: Side-by-side layout
- **Desktop**: Full-width layout with detailed information

## 🚀 Future Enhancements

Potential improvements:
- Multiple campus locations
- Weather forecast integration
- Study location recommendations
- Weather-based notifications
- Historical weather data
- Interactive weather layers

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure API keys are properly configured
4. Check network connectivity

---

**Note**: Make sure to keep your API keys secure and never commit them to version control!
