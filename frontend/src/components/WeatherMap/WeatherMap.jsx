import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye } from 'lucide-react';
import { config, validateEnvironment } from '../../config/environment';

const WeatherMap = ({ weatherData, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Campus coordinates from config
  const CAMPUS_COORDINATES = {
    lat: config.CAMPUS.LAT,
    lng: config.CAMPUS.LNG
  };

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (!window.google || !window.google.maps) {
        setMapError('Google Maps API not loaded');
        return;
      }

      if (!mapRef.current) return;

      try {
        // Create map instance
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: CAMPUS_COORDINATES,
          zoom: 16,
          mapTypeId: 'hybrid',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Create custom marker with weather info
        if (weatherData) {
          createWeatherMarker();
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    // Validate environment variables
    if (!validateEnvironment()) {
      setMapError('Google Maps API key not configured');
      return;
    }

    // Load Google Maps API if not already loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => setMapError('Failed to load Google Maps API');
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  // Update marker when weather data changes
  useEffect(() => {
    if (mapInstanceRef.current && weatherData && mapLoaded) {
      createWeatherMarker();
    }
  }, [weatherData, mapLoaded]);

  const createWeatherMarker = () => {
    if (!mapInstanceRef.current || !weatherData) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create custom marker icon
    const markerIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createWeatherIconSVG())}`,
      scaledSize: new window.google.maps.Size(60, 60),
      anchor: new window.google.maps.Point(30, 30)
    };

    // Create marker
    markerRef.current = new window.google.maps.Marker({
      position: CAMPUS_COORDINATES,
      map: mapInstanceRef.current,
      icon: markerIcon,
      title: 'Wits University Campus - Weather Station',
      animation: window.google.maps.Animation.DROP
    });

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: createInfoWindowContent()
    });

    // Add click listener to marker
    markerRef.current.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, markerRef.current);
    });

    // Auto-open info window
    setTimeout(() => {
      infoWindow.open(mapInstanceRef.current, markerRef.current);
    }, 1000);
  };

  const createWeatherIconSVG = () => {
    const weather = weatherData.current;
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };

    const emoji = iconMap[weather.icon] || '🌤️';
    
    return `
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="25" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
        <text x="30" y="35" text-anchor="middle" font-size="20" fill="white">${emoji}</text>
        <text x="30" y="50" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${weather.temperature}°C</text>
      </svg>
    `;
  };

  const createInfoWindowContent = () => {
    if (!weatherData) return '';

    const weather = weatherData.current;
    const location = weatherData.location;

    return `
      <div style="padding: 10px; min-width: 200px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: #1E40AF; font-size: 16px;">${location.name}</h3>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 24px; margin-right: 8px;">${getWeatherEmoji(weather.icon)}</span>
          <div>
            <div style="font-size: 18px; font-weight: bold; color: #374151;">${weather.temperature}°C</div>
            <div style="font-size: 12px; color: #6B7280; text-transform: capitalize;">${weather.description}</div>
          </div>
        </div>
        <div style="font-size: 12px; color: #6B7280;">
          <div>Feels like: ${weather.feelsLike}°C</div>
          <div>Humidity: ${weather.humidity}%</div>
          <div>Wind: ${weather.wind.speed} m/s</div>
          ${weather.visibility ? `<div>Visibility: ${weather.visibility} km</div>` : ''}
        </div>
      </div>
    `;
  };

  const getWeatherEmoji = (icon) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
  };

  const getWeatherIcon = (icon) => {
    if (icon.includes('01')) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (icon.includes('02') || icon.includes('03') || icon.includes('04')) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (icon.includes('09') || icon.includes('10')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (icon.includes('11')) return <CloudRain className="w-6 h-6 text-purple-500" />;
    if (icon.includes('13')) return <Cloud className="w-6 h-6 text-blue-200" />;
    if (icon.includes('50')) return <Cloud className="w-6 h-6 text-gray-400" />;
    return <Sun className="w-6 h-6 text-yellow-500" />;
  };

  if (mapError) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Map Unavailable</p>
            <p className="text-sm text-gray-500">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Campus Weather Map</h3>
        {weatherData && (
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            {getWeatherIcon(weatherData.current.icon)}
            <span className="font-medium">{weatherData.current.temperature}°C</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-200"
          style={{ minHeight: '256px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Weather Details */}
      {weatherData && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <Thermometer className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Feels like</div>
              <div className="text-sm font-semibold text-blue-800">{weatherData.current.feelsLike}°C</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
            <Droplets className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Humidity</div>
              <div className="text-sm font-semibold text-green-800">{weatherData.current.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
            <Wind className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-xs text-gray-500">Wind</div>
              <div className="text-sm font-semibold text-purple-800">{weatherData.current.wind.speed} m/s</div>
            </div>
          </div>
          
          {weatherData.current.visibility && (
            <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
              <Eye className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-500">Visibility</div>
                <div className="text-sm font-semibold text-orange-800">{weatherData.current.visibility} km</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Study Recommendation */}
      {weatherData?.studyRecommendation && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              {weatherData.studyRecommendation.type === 'indoor' ? (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏠</span>
                </div>
              ) : weatherData.studyRecommendation.type === 'outdoor' ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🌳</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🔄</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800 capitalize">
                {weatherData.studyRecommendation.type} Study Recommended
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {weatherData.studyRecommendation.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;
