import express from "express";
import axios from "axios";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Wits University campus coordinates
const WITS_COORDINATES = {
    lat: -26.1929,
    lon: 28.0305,
};

// Cache for weather data
let weatherCache = {
    data: null,
    timestamp: null,
};

/**
 * Get current weather for Wits campus
 * GET /api/weather
 */
router.get("/", async (req, res) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Weather service not configured",
                message: "OpenWeather API key not found",
            });
        }

        // Check cache first
        const cacheDuration =
            parseInt(process.env.WEATHER_CACHE_DURATION) || 300000; // 5 minutes default
        const now = Date.now();

        if (
            weatherCache.data &&
            weatherCache.timestamp &&
            now - weatherCache.timestamp < cacheDuration
        ) {
            return res.json({
                ...weatherCache.data,
                cached: true,
                cacheAge: Math.floor((now - weatherCache.timestamp) / 1000),
            });
        }

        // Fetch fresh weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${WITS_COORDINATES.lat}&lon=${WITS_COORDINATES.lon}&appid=${apiKey}&units=metric`;

        const response = await axios.get(weatherUrl, {
            timeout: 10000,
            headers: {
                "User-Agent": "Campus-Study-Buddy/1.0",
            },
        });

        const weatherData = {
            location: {
                name: "Wits University Campus",
                coordinates: WITS_COORDINATES,
            },
            current: {
                temperature: Math.round(response.data.main.temp),
                feelsLike: Math.round(response.data.main.feels_like),
                humidity: response.data.main.humidity,
                pressure: response.data.main.pressure,
                visibility: response.data.visibility
                    ? Math.round(response.data.visibility / 1000)
                    : null,
                uvIndex: response.data.uvi || null,
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon,
                wind: {
                    speed: response.data.wind.speed,
                    direction: response.data.wind.deg,
                },
            },
            timestamp: new Date().toISOString(),
            studyRecommendation: getStudyRecommendation(response.data),
        };

        // Update cache
        weatherCache = {
            data: weatherData,
            timestamp: now,
        };

        res.json(weatherData);
    } catch (error) {
        console.error("Weather API error:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                error: "Weather service error",
                message:
                    error.response.data.message ||
                    "Failed to fetch weather data",
            });
        }

        if (error.code === "ECONNABORTED") {
            return res.status(408).json({
                error: "Weather service timeout",
                message: "Weather service is taking too long to respond",
            });
        }

        res.status(500).json({
            error: "Weather service unavailable",
            message: "Unable to fetch weather data at this time",
        });
    }
});

/**
 * Get weather forecast for Wits campus
 * GET /api/weather/forecast
 */
router.get("/forecast", async (req, res) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "Weather service not configured",
                message: "OpenWeather API key not found",
            });
        }

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${WITS_COORDINATES.lat}&lon=${WITS_COORDINATES.lon}&appid=${apiKey}&units=metric`;

        const response = await axios.get(forecastUrl, {
            timeout: 10000,
            headers: {
                "User-Agent": "Campus-Study-Buddy/1.0",
            },
        });

        // Process forecast data (next 5 days, 3-hour intervals)
        const forecast = response.data.list.slice(0, 8).map((item) => ({
            datetime: new Date(item.dt * 1000).toISOString(),
            temperature: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            humidity: item.main.humidity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            wind: {
                speed: item.wind.speed,
                direction: item.wind.deg,
            },
            studyRecommendation: getStudyRecommendation(item),
        }));

        res.json({
            location: {
                name: "Wits University Campus",
                coordinates: WITS_COORDINATES,
            },
            forecast,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Weather forecast API error:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                error: "Weather forecast service error",
                message:
                    error.response.data.message ||
                    "Failed to fetch weather forecast",
            });
        }

        res.status(500).json({
            error: "Weather forecast service unavailable",
            message: "Unable to fetch weather forecast at this time",
        });
    }
});

/**
 * Get study recommendations based on weather
 * POST /api/weather/recommendations
 */
router.post(
    "/recommendations",
    [
        body("studyType")
            .optional()
            .isIn(["indoor", "outdoor", "group", "individual"]),
        body("duration").optional().isInt({ min: 30, max: 480 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: "Validation error",
                    details: errors.array(),
                });
            }

            const { studyType = "indoor", duration = 120 } = req.body;

            // Get current weather
            const weatherResponse = await axios.get(
                `${req.protocol}://${req.get("host")}/api/weather`,
            );
            const weather = weatherResponse.data;

            const recommendations = generateStudyRecommendations(
                weather,
                studyType,
                duration,
            );

            res.json({
                weather: weather.current,
                studyType,
                duration,
                recommendations,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Weather recommendations error:", error.message);
            res.status(500).json({
                error: "Unable to generate study recommendations",
                message: "Failed to process weather-based recommendations",
            });
        }
    },
);

/**
 * Helper function to get study recommendation based on weather
 */
function getStudyRecommendation(weatherData) {
    const temp = weatherData.main.temp;
    const description = weatherData.weather[0].description.toLowerCase();
    const windSpeed = weatherData.wind?.speed || 0;
    const humidity = weatherData.main.humidity;

    // Temperature-based recommendations
    if (temp < 10) {
        return {
            type: "indoor",
            message: "Cold weather - perfect for indoor study sessions",
            confidence: "high",
        };
    } else if (temp > 30) {
        return {
            type: "indoor",
            message: "Hot weather - stay cool with indoor study",
            confidence: "high",
        };
    } else if (temp >= 18 && temp <= 25) {
        return {
            type: "outdoor",
            message: "Pleasant weather - great for outdoor study groups",
            confidence: "high",
        };
    }

    // Weather condition-based recommendations
    if (description.includes("rain") || description.includes("storm")) {
        return {
            type: "indoor",
            message: "Rainy weather - indoor study recommended",
            confidence: "high",
        };
    } else if (description.includes("clear") || description.includes("sunny")) {
        return {
            type: "outdoor",
            message: "Clear skies - perfect for outdoor study",
            confidence: "medium",
        };
    } else if (description.includes("cloud")) {
        return {
            type: "flexible",
            message: "Cloudy weather - both indoor and outdoor options work",
            confidence: "medium",
        };
    }

    // Wind-based recommendations
    if (windSpeed > 15) {
        return {
            type: "indoor",
            message: "Windy conditions - indoor study more comfortable",
            confidence: "medium",
        };
    }

    return {
        type: "flexible",
        message: "Weather conditions are suitable for various study options",
        confidence: "low",
    };
}

/**
 * Generate detailed study recommendations
 */
function generateStudyRecommendations(weather, studyType, duration) {
    const temp = weather.current.temperature;
    const description = weather.current.description;
    const windSpeed = weather.current.wind.speed;
    const humidity = weather.current.humidity;

    const recommendations = {
        location: [],
        timing: [],
        activities: [],
        tips: [],
    };

    // Location recommendations
    if (studyType === "outdoor" || studyType === "group") {
        if (
            temp >= 18 &&
            temp <= 25 &&
            windSpeed < 10 &&
            !description.includes("rain")
        ) {
            recommendations.location.push({
                type: "outdoor",
                places: [
                    "Library courtyard",
                    "Central campus lawn",
                    "Student center outdoor area",
                ],
                reason: "Perfect weather for outdoor study",
            });
        } else {
            recommendations.location.push({
                type: "indoor",
                places: ["Library study rooms", "Student center", "Cafeteria"],
                reason: "Weather conditions favor indoor study",
            });
        }
    } else {
        recommendations.location.push({
            type: "indoor",
            places: ["Library quiet zones", "Study pods", "Empty classrooms"],
            reason: "Indoor study provides better focus",
        });
    }

    // Timing recommendations
    if (temp > 25) {
        recommendations.timing.push({
            time: "morning",
            reason: "Cooler temperatures in the morning",
        });
    } else if (temp < 15) {
        recommendations.timing.push({
            time: "afternoon",
            reason: "Warmer temperatures in the afternoon",
        });
    }

    // Activity recommendations
    if (studyType === "group") {
        recommendations.activities.push(
            "Group discussions",
            "Peer teaching",
            "Study games",
        );
    } else {
        recommendations.activities.push(
            "Reading",
            "Note-taking",
            "Problem solving",
        );
    }

    // Weather-specific tips
    if (humidity > 70) {
        recommendations.tips.push(
            "High humidity - stay hydrated and take breaks",
        );
    }
    if (windSpeed > 10) {
        recommendations.tips.push(
            "Windy conditions - secure your study materials",
        );
    }
    if (description.includes("sun")) {
        recommendations.tips.push(
            "Sunny weather - use sunscreen for outdoor study",
        );
    }

    return recommendations;
}

export default router;
