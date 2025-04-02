class IsochroneService {
    constructor(apiKey = null) {
        this.apiKey = '5b3ce3597851110001cf6248671c6fd4146646d8ad53a5b456b003d0';
        this.openRouteServiceUrl = 'https://api.openrouteservice.org/v2/isochrones';
        this.cache = {};
    }
    
    /**
     * Generate isochrone (time-based travel boundary) from a point
     * @param {L.LatLng} point - Starting point
     * @param {number} speedKmh - Travel speed in km/h
     * @param {number} timeMinutes - Travel time in minutes
     * @param {string} mode - Mode of transport (foot-walking, cycling-regular, driving-car)
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - GeoJSON polygon representing the reachable area
     */
    async generateIsochrone(point, speedKmh, timeMinutes, mode, options = {}) {
        try {
            // Convert transport mode to ORS format
            const orsMode = this.convertTransportMode(mode);
            
            // Adjust time based on speed if it's different from default
            let adjustedTime = timeMinutes;
            
            // Default speeds for different modes
            const defaultSpeeds = {
                'foot-walking': 5,
                'cycling-regular': 15,
                'driving-car': 70
            };
            
            // If specified speed is different from default, adjust the time
            if (defaultSpeeds[orsMode] && speedKmh !== defaultSpeeds[orsMode]) {
                const ratio = defaultSpeeds[orsMode] / speedKmh;
                adjustedTime = timeMinutes * ratio;
            }
            
            // Range is in seconds
            const rangeSeconds = Math.round(adjustedTime * 60);
            
            // Apply weather multiplier if provided
            if (options.weatherMultiplier && options.weatherMultiplier < 1) {
                // If weather slows us down, we need more time to reach the same distance
                // so we increase the time range
                const weatherAdjustedRange = Math.round(rangeSeconds / options.weatherMultiplier);
                options.range = [weatherAdjustedRange];
            } else {
                options.range = [rangeSeconds];
            }
            
            // Merge with default options
            const requestOptions = {
                locations: [[point.lng, point.lat]],
                range_type: 'time',
                ...options
            };
            
            // Try cache first
            const cacheKey = JSON.stringify({
                point: [point.lat, point.lng],
                time: adjustedTime,
                mode: orsMode,
                options: requestOptions
            });
            
            if (this.cache[cacheKey]) {
                return this.cache[cacheKey];
            }
            
            // Make API request
            const response = await fetch(`${this.openRouteServiceUrl}/${orsMode}`, {
                method: 'POST',
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestOptions)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouteService API error (${response.status}): ${errorText}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache[cacheKey] = data;
            
            return data;
        } catch (error) {
            console.error('Error generating isochrone:', error);
            throw error;
        }
    }
    
    /**
     * Generate a search area considering barriers and weather
     * @param {L.LatLng} center - Starting point
     * @param {number} speed - Travel speed in km/h
     * @param {number} timeMinutes - Travel time in minutes
     * @param {string} mode - Mode of transport
     * @param {Object} weatherData - Weather data (optional)
     * @returns {Promise<Object>} - GeoJSON representing the search area
     */
    async generateSearchArea(center, speed, timeMinutes, mode, weatherData = null) {
        try {
            let weatherMultiplier = 1.0;
            let weatherDescription = '';
            
            // Apply weather effect if data is available
            if (weatherData) {
                const weatherService = new WeatherService();
                weatherMultiplier = weatherService.getWeatherSpeedMultiplier(weatherData, mode);
                weatherDescription = weatherService.getWeatherDescription(weatherData);
            }
            
            // Additional options for the isochrone
            const options = {
                weatherMultiplier: weatherMultiplier,
                attributes: ['area'],
                smoothing: 0.25
            };
            
            // Generate the isochrone
            const isochrone = await this.generateIsochrone(
                center,
                speed,
                timeMinutes,
                mode,
                options
            );
            
            // Add metadata to the result
            if (isochrone && isochrone.features && isochrone.features.length > 0) {
                isochrone.features[0].properties.speed = speed;
                isochrone.features[0].properties.time = timeMinutes;
                isochrone.features[0].properties.mode = mode;
                
                if (weatherMultiplier < 1.0) {
                    isochrone.features[0].properties.weatherMultiplier = weatherMultiplier;
                    isochrone.features[0].properties.weatherDescription = weatherDescription;
                }
            }
            
            return isochrone;
        } catch (error) {
            console.error('Error generating search area:', error);
            throw error;
        }
    }
    
    /**
     * Convert our transport mode to OpenRouteService format
     */
    convertTransportMode(mode) {
        const modeMap = {
            'walking': 'foot-walking',
            'biking': 'cycling-regular',
            'driving': 'driving-car'
        };
        
        return modeMap[mode] || 'foot-walking';
    }
    
    /**
     * Create a fallback circle if the API fails
     */
    createFallbackCircle(center, radiusKm) {
        // Create a GeoJSON circle as fallback
        const points = [];
        const numPoints = 64;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            const dx = Math.cos(angle) * radiusKm;
            const dy = Math.sin(angle) * radiusKm;
            
            // Convert dx/dy to lat/lng (approximate)
            const lat = center.lat + (dy / 111.32);
            const lng = center.lng + (dx / (111.32 * Math.cos(center.lat * Math.PI / 180)));
            
            points.push([lng, lat]);
        }
        
        // Close the polygon
        points.push(points[0]);
        
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {
                    isFallback: true
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [points]
                }
            }]
        };
    }
}