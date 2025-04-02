class TerrainAnalyzer {
    /**
     * Adjust travel speed based on terrain
     * @param {number} baseSpeed - Base speed in km/h
     * @param {number} slope - Slope in degrees
     * @returns {number} - Adjusted speed
     */
    static adjustSpeedForSlope(baseSpeed, slope) {
        // Simple model: reduce speed by 5% for each degree of uphill slope
        // For downhill, increase speed but max at 20% increase
        if (slope > 0) {
            // Uphill
            return baseSpeed * Math.max(0.2, 1 - (slope * 0.05));
        } else {
            // Downhill
            return baseSpeed * Math.min(1.2, 1 + (Math.abs(slope) * 0.02));
        }
    }
    
    /**
     * Fetch terrain data along a path
     * @param {Array} path - Array of [lat, lng] coordinates
     * @returns {Promise} - Elevation data for path
     */
    static async getElevationProfile(path) {
        // Using Open Elevation API or similar
        const locations = path.map(point => `${point[0]},${point[1]}`).join('|');
        const url = `https://api.open-elevation.com/api/v1/lookup?locations=${locations}`;
        
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching elevation data:', error);
            return null;
        }
    }
}