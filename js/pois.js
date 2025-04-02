class POIService {
    constructor() {
        // API endpoint for POIs
        this.apiUrl = 'https://api.openrouteservice.org/pois';
        
        // API key - same as the one you provided
        this.apiKey = '5b3ce3597851110001cf624859e55459fe6d409fb3727a8b53110187';
        
        // POI markers layer group
        this.poiMarkersLayer = null;
        
        // POI types and colors
        this.poiTypes = {
            'facilities': '#F1C40F',
            'catering': '#E67E22',
            'accommodation': '#3498DB',
            'shopping': '#9B59B6',
            'transportation': '#2ECC71',
            'natural': '#1ABC9C',
            'tourism': '#F39C12',
            'entertainment': '#D35400',
            'health': '#C0392B',
            'education': '#16A085',
            'service': '#7F8C8D',
            'financial': '#2980B9',
            'amenity': '#F1C40F'
        };
        
        // Map specific POI types to categories
        this.categoryMapping = {
            'bench': 'facilities',
            'waste_basket': 'facilities',
            'drinking_water': 'facilities',
            'atm': 'financial',
            'bank': 'financial',
            'cafe': 'catering',
            'restaurant': 'catering',
            'fast_food': 'catering',
            'bar': 'catering',
            'pub': 'catering',
            'hotel': 'accommodation',
            'hostel': 'accommodation',
            'hospital': 'health',
            'pharmacy': 'health',
            'doctors': 'health',
            'school': 'education',
            'university': 'education',
            'bus_stop': 'transportation',
            'parking': 'transportation',
            'fuel': 'transportation',
            'hunting_stand': 'facilities'
        };
    }
    
    /**
     * Get POIs within a circle's bounds
     * @param {L.LatLngBounds} bounds - The bounds to search within
     * @returns {Promise<Object>} - GeoJSON of POIs
     */
    async getPOIsInBounds(bounds) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Fetching POIs within bounds:', bounds);
                
                // Center point of the bounds
                const centerLng = (bounds.getWest() + bounds.getEast()) / 2;
                const centerLat = (bounds.getSouth() + bounds.getNorth()) / 2;
                
                // Create request
                let request = new XMLHttpRequest();
                
                request.open('POST', this.apiUrl);
                
                request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('Authorization', this.apiKey);
                
                request.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        console.log('Status:', this.status);
                        console.log('Headers:', this.getAllResponseHeaders());
                        console.log('Body:', this.responseText);
                        
                        if (this.status >= 200 && this.status < 300 && this.responseText) {
                            try {
                                const data = JSON.parse(this.responseText);
                                console.log('POI data received:', data);
                                resolve(data);
                            } catch (e) {
                                console.error('Failed to parse POI response:', e);
                                resolve({ features: [] });
                            }
                        } else {
                            console.error('API returned error status:', this.status);
                            console.log('Error response:', this.responseText);
                            resolve({ features: [] });
                        }
                    }
                };
                
                // Handle network errors
                request.onerror = (e) => {
                    console.error('Network error occurred while fetching POIs:', e);
                    resolve({ features: [] });
                };
                
                // Handle timeouts
                request.timeout = 20000; // 20 seconds
                request.ontimeout = () => {
                    console.error('POI request timed out');
                    resolve({ features: [] });
                };
                
                // Create request body in exact format from example
                const bodyObj = {
                    "request": "pois",
                    "geometry": {
                        "bbox": [
                            [bounds.getWest(), bounds.getNorth()],  // [west, north]
                            [bounds.getEast(), bounds.getSouth()]   // [east, south]
                        ],
                        "geojson": {
                            "type": "Point",
                            "coordinates": [centerLng, centerLat]
                        },
                        "buffer": 500  // 500m buffer
                    }
                };
                
                // Convert to string exactly as in the example
                const body = JSON.stringify(bodyObj);
                
                console.log('POI request body:', body);
                
                request.send(body);
                
            } catch (error) {
                console.error('Error in getPOIsInBounds:', error);
                resolve({ features: [] });
            }
        });
    }
    
    /**
     * Get POIs within a circle
     * @param {L.Circle|L.GeoJSON} circle - The circle layer to search within
     * @returns {Promise<Object>} - GeoJSON of POIs
     */
    async getPOIsInCircle(circle) {
        try {
            // Get bounds from the circle
            const bounds = circle.getBounds();
            return await this.getPOIsInBounds(bounds);
        } catch (error) {
            console.error('Error getting POIs in circle:', error);
            return { features: [] };
        }
    }
    
    /**
     * Display POIs on the map
     * @param {Object} poisData - GeoJSON data of POIs
     * @param {L.Map} map - Leaflet map instance
     */
    displayPOIs(poisData, map) {
        // Remove existing POI markers if any
        if (this.poiMarkersLayer) {
            map.removeLayer(this.poiMarkersLayer);
        }
        
        // Create a new layer group for POI markers
        this.poiMarkersLayer = L.layerGroup().addTo(map);
        
        // Check if we have features
        if (!poisData.features || poisData.features.length === 0) {
            alert('Keine POIs in diesem Bereich gefunden.');
            return;
        }
        
        console.log(`Displaying ${poisData.features.length} POIs on the map`);
        
        // Create POI count by category for the legend
        const categoryCount = {};
        
        // Process each POI
        poisData.features.forEach(poi => {
            try {
                // Extract coordinates and properties
                const coords = poi.geometry.coordinates;
                const props = poi.properties;
                
                console.log("POI properties:", props); // Log the complete properties
                
                // Get the most specific POI type and category
                let poiType = 'Unknown';
                let poiCategory = 'amenity';
                
                // Check if category_ids exists
                if (props.category_ids) {
                    // Find the first category with a name
                    for (const categoryKey in props.category_ids) {
                        if (props.category_ids[categoryKey].category_name) {
                            poiType = props.category_ids[categoryKey].category_name;
                            poiCategory = props.category_ids[categoryKey].category_group || this.getCategoryFromType(poiType);
                            break;
                        }
                    }
                }
                
                // Set color based on category
                const color = this.poiTypes[poiCategory] || '#3388ff';
                
                // Update category count
                categoryCount[poiCategory] = (categoryCount[poiCategory] || 0) + 1;
                
                // Create custom icon
                const poiIcon = L.divIcon({
                    html: `<div style="background-color:${color};" class="poi-marker"></div>`,
                    className: 'poi-icon-container',
                    iconSize: [12, 12]
                });
                
                // Create marker with popup
                const marker = L.marker([coords[1], coords[0]], {
                    icon: poiIcon
                }).addTo(this.poiMarkersLayer);
                
                // Create popup content with more detailed info
                let popupContent = `<div class="poi-popup">`;
                
                // Primary name
                if (props.name) {
                    popupContent += `<h4>${props.name}</h4>`;
                } else {
                    popupContent += `<h4>${this.translateType(poiType)}</h4>`;
                }
                
                // Add POI type if it exists and is not "Unknown"
                if (poiType && poiType !== 'Unknown') {
                    popupContent += `<p>Typ: ${this.translateType(poiType)}</p>`;
                }
                
                // Add category
                popupContent += `<p>Kategorie: ${this.translateCategory(poiCategory)}</p>`;
                
                // Add distance from center if available
                if (props.distance) {
                    const distanceFormatted = props.distance < 1000 
                        ? `${Math.round(props.distance)}m` 
                        : `${(props.distance / 1000).toFixed(2)}km`;
                    popupContent += `<p>Entfernung: ${distanceFormatted}</p>`;
                }
                
                // Add OSM ID
                if (props.osm_id) {
                    popupContent += `<p>OSM ID: <a href="https://www.openstreetmap.org/${props.osm_type === 1 ? 'node' : 'way'}/${props.osm_id}" target="_blank">${props.osm_id}</a></p>`;
                }
                
                popupContent += `</div>`;
                
                marker.bindPopup(popupContent);
                
            } catch (e) {
                console.error('Error processing POI:', e);
            }
        });
        
        // Create and show the legend
        this.showPOILegend(categoryCount, map);
        
        return this.poiMarkersLayer;
    }
    
    /**
     * Get the category for a specific POI type
     * @param {string} type - The POI type
     * @returns {string} - The category
     */
    getCategoryFromType(type) {
        return this.categoryMapping[type] || 'amenity';
    }
    
    /**
     * Translate POI type to German
     * @param {string} type - The POI type
     * @returns {string} - Translated type
     */
    translateType(type) {
        const translations = {
            'bench': 'Bank',
            'waste_basket': 'Mülleimer',
            'drinking_water': 'Trinkwasser',
            'fountain': 'Brunnen',
            'toilets': 'Toiletten',
            'restaurant': 'Restaurant',
            'cafe': 'Café',
            'fast_food': 'Schnellrestaurant',
            'bar': 'Bar',
            'pub': 'Kneipe',
            'shelter': 'Unterstand',
            'atm': 'Geldautomat',
            'bank': 'Bank (Geldinstitut)',
            'pharmacy': 'Apotheke',
            'hospital': 'Krankenhaus',
            'doctors': 'Arztpraxis',
            'police': 'Polizei',
            'post_office': 'Postamt',
            'recycling': 'Recyclingstation',
            'bicycle_parking': 'Fahrradparkplatz',
            'bicycle_rental': 'Fahrradverleih',
            'fuel': 'Tankstelle',
            'hunting_stand': 'Hochsitz',
            'parking': 'Parkplatz',
            'bus_station': 'Busbahnhof',
            'bus_stop': 'Bushaltestelle',
            'ferry_terminal': 'Fährterminal',
            'Unknown': 'Unbekannter Typ'
        };
        
        return translations[type] || this.formatName(type);
    }
    
    /**
     * Translate category to German
     * @param {string} category - The category
     * @returns {string} - Translated category
     */
    translateCategory(category) {
        const translations = {
            'facilities': 'Einrichtungen',
            'catering': 'Gastronomie',
            'accommodation': 'Unterkunft',
            'shopping': 'Einkaufen',
            'transportation': 'Transport',
            'natural': 'Natur',
            'tourism': 'Tourismus',
            'entertainment': 'Unterhaltung',
            'health': 'Gesundheit',
            'education': 'Bildung',
            'service': 'Dienstleistungen',
            'financial': 'Finanzen',
            'amenity': 'Öffentliche Einrichtung'
        };
        
        return translations[category] || this.formatName(category);
    }
    
    /**
     * Format a name for display
     * @param {string} name - The name to format
     * @returns {string} - Formatted name
     */
    formatName(name) {
        if (!name) return 'Unbekannt';
        
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Format category name for display
     * @param {string} category - Raw category name
     * @returns {string} - Formatted category name
     */
    formatCategoryName(category) {
        // First try to translate it
        const translated = this.translateCategory(category);
        if (translated !== this.formatName(category)) {
            return translated;
        }
        
        // Otherwise format it
        return this.formatName(category);
    }
    
    /**
     * Show a legend with POI categories
     * @param {Object} categoryCount - Count of POIs by category
     * @param {L.Map} map - Leaflet map instance
     */
    showPOILegend(categoryCount, map) {
        // Create or update legend
        let legend = document.getElementById('poi-legend');
        
        if (!legend) {
            legend = document.createElement('div');
            legend.id = 'poi-legend';
            legend.className = 'poi-legend leaflet-control';
            document.querySelector('.leaflet-bottom.leaflet-right').appendChild(legend);
        }
        
        // Build legend content
        let legendContent = `
            <div class="legend-header">
                <h4>POI Legende</h4>
                <button id="close-legend" class="close-legend">×</button>
            </div>
            <div class="legend-content">
        `;
        
        // Add each category with count
        Object.keys(categoryCount).forEach(category => {
            const color = this.poiTypes[category] || '#3388ff';
            legendContent += `
                <div class="legend-item">
                    <span class="color-box" style="background-color:${color};"></span>
                    <span class="category-name">${this.formatCategoryName(category)}</span>
                    <span class="category-count">(${categoryCount[category]})</span>
                </div>
            `;
        });
        
        legendContent += `</div>`;
        
        // Set legend content
        legend.innerHTML = legendContent;
        
        // Add close button event
        document.getElementById('close-legend').addEventListener('click', () => {
            legend.remove();
        });
    }
    
    /**
     * Clear POIs from the map
     * @param {L.Map} map - Leaflet map instance
     */
    clearPOIs(map) {
        if (this.poiMarkersLayer) {
            map.removeLayer(this.poiMarkersLayer);
            this.poiMarkersLayer = null;
        }
        
        // Remove legend if exists
        const legend = document.getElementById('poi-legend');
        if (legend) {
            legend.remove();
        }
    }
}