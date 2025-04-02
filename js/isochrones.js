class IsochroneService {
    constructor() {
        // API endpoint - no trailing slash
        this.apiUrl = 'https://api.openrouteservice.org/v2/isochrones/';
        
        // API key - use the exact same one from the example
        this.apiKey = '5b3ce3597851110001cf624859e55459fe6d409fb3727a8b53110187';
    }

    /**
     * Generates an isochrone based on a starting point and distance
     * Following exactly the example provided in the documentation
     */
    async getDistanceIsochrone(point, profile, distanceKm, useRoadsOnly) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Creating isochrone for ${profile} with distance ${distanceKm}km`);
                
                // Convert km to meters (ORS API uses meters for distance)
                const distanceMeters = Math.min(distanceKm * 1000, 50000); // Max 50 km for free tier

                let request = new XMLHttpRequest();

                const url = `${this.apiUrl}${profile}`;

                request.open('POST', url);

                request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('Authorization', this.apiKey);

                // Improved response handler that properly resolves the Promise
                request.onreadystatechange = () => {
                    if (request.readyState === 4) {
                        console.log('Status:', request.status);
                        console.log('Headers:', request.getAllResponseHeaders());
                        console.log('Body:', request.responseText);
                        
                        if (request.status >= 200 && request.status < 300 && request.responseText) {
                            try {
                                const data = JSON.parse(request.responseText);
                                console.log('Parsed API response:', data);
                                resolve(data);
                            } catch (e) {
                                console.error('Failed to parse API response:', e);
                                resolve(this.createCircle(point, distanceKm));
                            }
                        } else {
                            console.error('API returned error status:', request.status);
                            resolve(this.createCircle(point, distanceKm));
                        }
                    }
                };

                // Handle network errors
                request.onerror = (e) => {
                    console.error('Network error occurred:', e);
                    resolve(this.createCircle(point, distanceKm));
                };
                
                // Handle timeouts
                request.timeout = 20000; // 20 seconds
                request.ontimeout = () => {
                    console.error('Request timed out');
                    resolve(this.createCircle(point, distanceKm));
                };

                const bodyObj = {
                    locations: [[point.lng, point.lat]],
                    range: [distanceMeters],
                    range_type: 'distance'
                };
                
                // Convert body to string EXACTLY as in the example
                const body2 = JSON.stringify(bodyObj);
                console.log("Request body:", body2);

                request.send(body2);

            } catch (error) {
                console.error('Error in getDistanceIsochrone:', error);
                resolve(this.createCircle(point, distanceKm));
            }
        });
    }
    
    /**
     * Generates a search area based on the selected transportation mode
     */
    async generateSearchArea(center, speed, timeMinutes, mode, useRoadsOnly) {
        try {
            // Calculate distance based on speed and time
            const timeHours = timeMinutes / 60;
            const distanceKm = speed * timeHours;
            
            console.log(`Calculated distance: ${distanceKm.toFixed(2)}km (${speed}km/h for ${timeMinutes}min)`);
            
            // Map UI modes to API profiles
            let profile;
            
            if (useRoadsOnly) {
                // Roads only mode
                switch (mode) {
                    case 'walking':
                        profile = 'foot-walking';
                        break;
                    case 'biking':
                        profile = 'cycling-regular';
                        break;
                    case 'driving':
                        profile = 'driving-car';
                        break;
                    default:
                        profile = 'foot-walking';
                }
            } else {
                // Cross-country mode
                switch (mode) {
                    case 'walking':
                        profile = 'foot-walking';
                        break;
                    case 'biking':
                        profile = 'cycling-mountain';
                        break;
                    case 'driving':
                        profile = 'driving-car';
                        break;
                    default:
                        profile = 'foot-walking';
                }
            }
            
            console.log(`Using profile: ${profile}, distance: ${distanceKm.toFixed(2)}km, useRoadsOnly: ${useRoadsOnly}`);
            
            // Generate isochrone
            return await this.getDistanceIsochrone(center, profile, distanceKm, useRoadsOnly);
        } catch (error) {
            console.error("Failed to generate search area:", error);
            // Create a fallback circle
            return this.createCircle(center, distanceKm);
        }
    }
    
    /**
     * Creates a simple circle (fallback)
     */
    createCircle(center, radiusKm) {
        console.log(`Creating fallback circle with radius ${radiusKm}km`);
        
        // Create a simple circle as GeoJSON
        const points = [];
        const numPoints = 64;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            const dx = Math.cos(angle) * radiusKm;
            const dy = Math.sin(angle) * radiusKm;
            
            // Convert dx/dy to lat/lng (approximation)
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
                    isFallback: true, // Flag to identify fallback circles
                    area: Math.PI * radiusKm * radiusKm // Approximate area
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [points]
                }
            }]
        };
    }
}