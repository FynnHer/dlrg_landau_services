class WeatherService {
    constructor() {
        // Using Open-Meteo API which is free and doesn't require an API key
        this.apiUrl = 'https://api.open-meteo.com/v1/forecast';
        this.cache = {};
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes in milliseconds
    }
    
    /**
     * Get current weather for a location
     * @param {L.LatLng} location - Location coordinates
     * @returns {Promise<Object>} - Weather data
     */
    async getCurrentWeather(location) {
        try {
            const cacheKey = `weather-${location.lat.toFixed(4)}-${location.lng.toFixed(4)}`;
            
            // Check if we have cached data that's still valid
            if (this.cache[cacheKey] && 
                (Date.now() - this.cache[cacheKey].timestamp) < this.cacheExpiry) {
                return this.cache[cacheKey].data;
            }
            
            // Building the URL with parameters
            const params = new URLSearchParams({
                latitude: location.lat,
                longitude: location.lng,
                current: 'temperature_2m,precipitation,rain,showers,snowfall,wind_speed_10m,wind_direction_10m'
            });
            
            const response = await fetch(`${this.apiUrl}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache the result with a timestamp
            this.cache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    }
    
    /**
     * Calculate speed multiplier based on weather conditions
     * @param {Object} weatherData - Weather API response
     * @param {string} travelMode - Mode of transportation
     * @returns {number} - Speed multiplier (0.0-1.0)
     */
    getWeatherSpeedMultiplier(weatherData, travelMode) {
        if (!weatherData || !weatherData.current) return 1.0;
        
        const current = weatherData.current;
        let multiplier = 1.0;
        
        // Extract weather variables
        const temperature = current.temperature_2m;
        const windSpeed = current.wind_speed_10m;
        const precipitation = current.precipitation || 0;
        const snowfall = current.snowfall || 0;
        
        // Temperature effects
        if (temperature < 0) {
            // Cold weather slows people down
            multiplier -= 0.1;
            
            // Extra penalty for extremely cold temperatures
            if (temperature < -10) {
                multiplier -= 0.1;
            }
        } else if (temperature > 30) {
            // Hot weather also slows people down
            multiplier -= 0.1;
            
            // Extra penalty for extremely hot temperatures
            if (temperature > 35) {
                multiplier -= 0.1;
            }
        }
        
        // Wind effects (stronger impact on cyclists)
        if (windSpeed > 5) {
            // Base wind penalty
            const windPenalty = Math.min(0.3, (windSpeed - 5) * 0.03);
            
            if (travelMode === 'biking') {
                // Cyclists are more affected by wind
                multiplier -= windPenalty * 1.5;
            } else {
                multiplier -= windPenalty;
            }
        }
        
        // Precipitation effects
        if (precipitation > 0) {
            // Rain slows people down
            multiplier -= Math.min(0.3, precipitation * 0.1);
            
            // Extra impact for cyclists and pedestrians
            if (travelMode !== 'driving') {
                multiplier -= Math.min(0.2, precipitation * 0.05);
            }
        }
        
        // Snow effects
        if (snowfall > 0) {
            // Snow has a major impact on mobility
            multiplier -= Math.min(0.4, snowfall * 0.2);
            
            // Driving is especially affected by snow
            if (travelMode === 'driving') {
                multiplier -= Math.min(0.3, snowfall * 0.1);
            }
        }
        
        // Ensure multiplier doesn't go below 0.3 (30% of normal speed)
        return Math.max(0.3, multiplier);
    }
    
    /**
     * Get readable weather description
     * @param {Object} weatherData - Weather API response
     * @returns {string} - Human-readable weather description
     */
    getWeatherDescription(weatherData) {
        if (!weatherData || !weatherData.current) {
            return 'Wetterdaten nicht verfügbar';
        }
        
        const current = weatherData.current;
        let description = `${current.temperature_2m}°C`;
        
        if (current.precipitation > 0) {
            if (current.snowfall > 0) {
                description += `, Schneefall (${current.snowfall} mm)`;
            } else {
                description += `, Niederschlag (${current.precipitation} mm)`;
            }
        }
        
        if (current.wind_speed_10m > 0) {
            description += `, Wind: ${current.wind_speed_10m} km/h`;
        }
        
        return description;
    }
}