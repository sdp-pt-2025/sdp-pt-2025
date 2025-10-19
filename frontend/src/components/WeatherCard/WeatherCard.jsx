import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  RefreshCw, 
  MapPin, 
  Clock,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap
} from 'lucide-react';
import useWeather from '../../hooks/useWeather';

const WeatherCard = ({ className = "" }) => {
  const {
    weatherData,
    loading,
    error,
    refreshWeather,
    getWeatherIcon,
    getWeatherDescription,
    getTemperatureColor,
    getStudyRecommendationColor,
    formatLastUpdated
  } = useWeather();

  const getWeatherIconComponent = (description) => {
    if (!description) return <Sun className="w-8 h-8 text-yellow-500" />;
    
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (desc.includes('cloud')) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (desc.includes('rain') || desc.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (desc.includes('thunder') || desc.includes('storm')) return <Zap className="w-8 h-8 text-purple-500" />;
    if (desc.includes('snow') || desc.includes('sleet')) return <CloudSnow className="w-8 h-8 text-blue-200" />;
    if (desc.includes('fog') || desc.includes('mist')) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  if (loading && !weatherData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading weather...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Campus Weather</h3>
          <button
            onClick={refreshWeather}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh weather"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center h-32 text-red-500">
          <div className="text-center">
            <Cloud className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Weather unavailable</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Cloud className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No weather data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { current, location, studyRecommendation } = weatherData;

  // Handle both Google API format (latitude/longitude) and legacy format (lat/lon)
  const lat = location.coordinates.latitude || location.coordinates.lat;
  const lon = location.coordinates.longitude || location.coordinates.lon;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Campus Weather</h3>
        </div>
        <div className="flex items-center space-x-2">
          {formatLastUpdated() && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatLastUpdated()}
            </span>
          )}
          <button
            onClick={refreshWeather}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh weather"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">
            {getWeatherIcon(current.description)}
          </div>
          <div>
            <div className={`text-3xl font-bold ${getTemperatureColor(current.temperature)}`}>
              {current.temperature}°C
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {getWeatherDescription(current.description)}
            </div>
            <div className="text-xs text-gray-500">
              Feels like {current.feelsLike}°C
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">{location.name}</div>
          <div className="text-xs text-gray-500">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
          <Droplets className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">Humidity</div>
            <div className="text-sm font-semibold text-blue-800">{current.humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <Wind className="w-4 h-4 text-green-600" />
          <div>
            <div className="text-xs text-gray-500">Wind</div>
            <div className="text-sm font-semibold text-green-800">{current.wind.speed} km/h</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
          <Thermometer className="w-4 h-4 text-purple-600" />
          <div>
            <div className="text-xs text-gray-500">Pressure</div>
            <div className="text-sm font-semibold text-purple-800">{current.pressure} hPa</div>
          </div>
        </div>
        
        {current.visibility && (
          <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
            <Eye className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-xs text-gray-500">Visibility</div>
              <div className="text-sm font-semibold text-orange-800">{current.visibility} km</div>
            </div>
          </div>
        )}
      </div>

      {/* Study Recommendation */}
      {studyRecommendation && (
        <div className={`p-4 rounded-lg border-2 ${getStudyRecommendationColor(studyRecommendation.type)}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {studyRecommendation.type === 'indoor' ? (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🏠</span>
                </div>
              ) : studyRecommendation.type === 'outdoor' ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🌳</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🔄</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold capitalize mb-1">
                {studyRecommendation.type} Study Recommended
              </div>
              <div className="text-xs opacity-90">
                {studyRecommendation.message}
              </div>
              <div className="text-xs mt-1 opacity-75">
                Confidence: {studyRecommendation.confidence}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;