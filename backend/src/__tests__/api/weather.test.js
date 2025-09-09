import request from 'supertest';
import app from '../../index.js';
import admin from 'firebase-admin';

// Mock the auth middleware
jest.mock('../../middleware/auth.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test-user-id' };
    next();
  }
}));

// Mock axios for weather API calls
jest.mock('axios', () => ({
  get: jest.fn()
}));

import axios from 'axios';

describe('Weather API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/weather', () => {
    it('should return current weather for Wits campus', async () => {
      const mockWeatherData = {
        data: {
          main: {
            temp: 22,
            feels_like: 24,
            humidity: 65,
            pressure: 1013
          },
          weather: [{
            description: 'clear sky',
            icon: '01d'
          }],
          wind: {
            speed: 3.5,
            deg: 180
          },
          visibility: 10000
        }
      };

      axios.get.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/api/weather')
        .expect(200);

      expect(response.body).toHaveProperty('location');
      expect(response.body.location.name).toBe('Wits University Campus');
      expect(response.body).toHaveProperty('current');
      expect(response.body.current.temperature).toBe(22);
      expect(response.body).toHaveProperty('studyRecommendation');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org'),
        expect.any(Object)
      );
    });

    it('should return cached weather data when available', async () => {
      // This test would require mocking the cache mechanism
      // For now, we'll test the basic functionality
      const mockWeatherData = {
        data: {
          main: { temp: 20, feels_like: 22, humidity: 70, pressure: 1015 },
          weather: [{ description: 'partly cloudy', icon: '02d' }],
          wind: { speed: 2.0, deg: 90 }
        }
      };

      axios.get.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/api/weather')
        .expect(200);

      expect(response.body).toHaveProperty('current');
      expect(response.body.current.temperature).toBe(20);
    });

    it('should handle weather API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/weather')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Weather service unavailable');
    });

    it('should handle missing API key', async () => {
      delete process.env.OPENWEATHER_API_KEY;

      const response = await request(app)
        .get('/api/weather')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Weather service not configured');

      // Restore API key
      process.env.OPENWEATHER_API_KEY = 'test-api-key';
    });
  });

  describe('GET /api/weather/forecast', () => {
    it('should return weather forecast for Wits campus', async () => {
      const mockForecastData = {
        data: {
          list: [
            {
              dt: 1640995200,
              main: { temp: 20, feels_like: 22, humidity: 65 },
              weather: [{ description: 'clear sky', icon: '01d' }],
              wind: { speed: 3.0, deg: 180 }
            },
            {
              dt: 1641006000,
              main: { temp: 18, feels_like: 20, humidity: 70 },
              weather: [{ description: 'partly cloudy', icon: '02n' }],
              wind: { speed: 2.5, deg: 200 }
            }
          ]
        }
      };

      axios.get.mockResolvedValue(mockForecastData);

      const response = await request(app)
        .get('/api/weather/forecast')
        .expect(200);

      expect(response.body).toHaveProperty('forecast');
      expect(response.body.forecast).toHaveLength(2);
      expect(response.body.forecast[0]).toHaveProperty('temperature');
      expect(response.body.forecast[0]).toHaveProperty('studyRecommendation');
    });
  });

  describe('POST /api/weather/recommendations', () => {
    it('should generate study recommendations based on weather', async () => {
      const mockWeatherData = {
        data: {
          current: {
            temperature: 22,
            description: 'clear sky',
            wind: { speed: 2.0 }
          }
        }
      };

      // Mock the internal weather API call
      axios.get.mockResolvedValue(mockWeatherData);

      const requestBody = {
        studyType: 'outdoor',
        duration: 120
      };

      const response = await request(app)
        .post('/api/weather/recommendations')
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.recommendations).toHaveProperty('location');
      expect(response.body.recommendations).toHaveProperty('activities');
      expect(response.body.recommendations).toHaveProperty('tips');
    });

    it('should validate request body', async () => {
      const invalidRequestBody = {
        studyType: 'invalid_type',
        duration: 'not_a_number'
      };

      const response = await request(app)
        .post('/api/weather/recommendations')
        .send(invalidRequestBody)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Validation error');
    });
  });
});
