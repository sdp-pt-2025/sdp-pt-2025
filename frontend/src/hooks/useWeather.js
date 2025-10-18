import { useState, useEffect, useCallback } from 'react';
import { config } from '../config/environment';

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const BASE_URL = config.PUBLIC_URL;

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/weather`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch weather data');
      }

      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  const fetchWeatherForecast = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/api/weather/forecast`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch weather forecast');
      }

      return data;
    } catch (err) {
      console.error('Error fetching weather forecast:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  const getStudyRecommendations = useCallback(async (studyType = 'indoor', duration = 120) => {
    try {
      const response = await fetch(`${BASE_URL}/api/weather/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyType,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error(`Study recommendations API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to get study recommendations');
      }

      return data;
    } catch (err) {
      console.error('Error fetching study recommendations:', err);
      throw err;
    }
  }, [BASE_URL]);

  // Fetch weather data on mount
  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Auto-refresh weather data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  const refreshWeather = useCallback(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const getWeatherIcon = (icon) => {
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

  const getWeatherDescription = (description) => {
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  const getTemperatureColor = (temp) => {
    if (temp < 10) return 'text-blue-600';
    if (temp < 20) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStudyRecommendationColor = (type) => {
    switch (type) {
      case 'indoor':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'outdoor':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'flexible':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    
    const now = new Date();
    const diff = now - lastUpdated;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return lastUpdated.toLocaleDateString();
  };

  return {
    weatherData,
    loading,
    error,
    lastUpdated,
    refreshWeather,
    fetchWeatherForecast,
    getStudyRecommendations,
    getWeatherIcon,
    getWeatherDescription,
    getTemperatureColor,
    getStudyRecommendationColor,
    formatLastUpdated,
  };
};

export default useWeather;
