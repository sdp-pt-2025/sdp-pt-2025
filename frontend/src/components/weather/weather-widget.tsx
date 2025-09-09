import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WeatherData {
  location: {
    name: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number | null;
    uvIndex: number | null;
    description: string;
    icon: string;
    wind: {
      speed: number;
      direction: number;
    };
  };
  timestamp: string;
  studyRecommendation: {
    type: string;
    message: string;
    confidence: string;
  };
  cached?: boolean;
  cacheAge?: number;
}

interface WeatherWidgetProps {
  className?: string;
  showForecast?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  className = '', 
  showForecast = false 
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchWeather = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const token = await user.getIdToken();
      
      const response = await fetch('/api/weather', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      setWeather(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchForecast = async () => {
    if (!user || !showForecast) return;
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/weather/forecast', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const data = await response.json();
      setForecast(data.forecast || []);
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    }
  };

  useEffect(() => {
    fetchWeather();
    if (showForecast) {
      fetchForecast();
    }
  }, [user, showForecast]);

  const getWeatherIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <Sun className="h-6 w-6 text-yellow-500" />,
      '01n': <Sun className="h-6 w-6 text-yellow-300" />,
      '02d': <Cloud className="h-6 w-6 text-gray-400" />,
      '02n': <Cloud className="h-6 w-6 text-gray-500" />,
      '03d': <Cloud className="h-6 w-6 text-gray-500" />,
      '03n': <Cloud className="h-6 w-6 text-gray-600" />,
      '04d': <Cloud className="h-6 w-6 text-gray-600" />,
      '04n': <Cloud className="h-6 w-6 text-gray-700" />,
      '09d': <CloudRain className="h-6 w-6 text-blue-500" />,
      '09n': <CloudRain className="h-6 w-6 text-blue-600" />,
      '10d': <CloudRain className="h-6 w-6 text-blue-500" />,
      '10n': <CloudRain className="h-6 w-6 text-blue-600" />,
      '11d': <CloudRain className="h-6 w-6 text-purple-500" />,
      '11n': <CloudRain className="h-6 w-6 text-purple-600" />,
      '13d': <Cloud className="h-6 w-6 text-blue-200" />,
      '13n': <Cloud className="h-6 w-6 text-blue-300" />,
      '50d': <Cloud className="h-6 w-6 text-gray-400" />,
      '50n': <Cloud className="h-6 w-6 text-gray-500" />
    };
    return iconMap[icon] || <Cloud className="h-6 w-6 text-gray-500" />;
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'indoor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outdoor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'flexible':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather at Wits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Weather at Wits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">{error}</p>
            <Button 
              onClick={fetchWeather} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {weather.location.name}
            </CardTitle>
            <Button 
              onClick={fetchWeather} 
              variant="ghost" 
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {weather.cached && (
            <p className="text-xs text-gray-500">
              Cached {weather.cacheAge}s ago
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.current.icon)}
              <div>
                <div className="text-3xl font-bold">
                  {weather.current.temperature}°C
                </div>
                <div className="text-sm text-gray-600">
                  Feels like {weather.current.feelsLike}°C
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium capitalize">
                {weather.current.description}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(weather.timestamp)}
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span>{weather.current.wind.speed} m/s</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-gray-500" />
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-gray-500" />
              <span>{weather.current.pressure} hPa</span>
            </div>
            {weather.current.visibility && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-500" />
                <span>{weather.current.visibility} km</span>
              </div>
            )}
          </div>

          {/* Study Recommendation */}
          <div className="pt-2 border-t">
            <Badge 
              variant="outline" 
              className={getRecommendationColor(weather.studyRecommendation.type)}
            >
              {weather.studyRecommendation.type.toUpperCase()}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {weather.studyRecommendation.message}
            </p>
          </div>

          {/* Forecast */}
          {showForecast && forecast.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                8-Hour Forecast
              </h4>
              <div className="space-y-2">
                {forecast.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getWeatherIcon(item.icon)}
                      <span>{formatTime(item.datetime)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.temperature}°C</span>
                      <span className="text-gray-500 capitalize">
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherWidget;
