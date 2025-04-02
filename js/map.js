let map;
let markers = [];
let circles = [];
let selectedPoint = null;
let currentMapLayer;

// Define map layers
const mapLayers = {
    standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }),
    
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }),
    
    streets: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
        maxZoom: 19
    })
};

// Coordinates for Landau in der Pfalz
const LANDAU_COORDS = [49.1983, 8.1172];
const DEFAULT_ZOOM = 13;

function initMap() {
    // Initialize the map centered on Landau in der Pfalz
    map = L.map('map').setView(LANDAU_COORDS, DEFAULT_ZOOM);

    // Set the default map layer (standard)
    currentMapLayer = mapLayers.standard;
    currentMapLayer.addTo(map);

    // Add click event listener
    map.on('click', onMapClick);
}

function changeMapType(type) {
    // Remove current layer
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }

    // Add new layer based on selection
    switch(type) {
        case 'satellite':
            currentMapLayer = mapLayers.satellite;
            break;
        case 'streets':
            currentMapLayer = mapLayers.streets;
            break;
        default:
            currentMapLayer = mapLayers.standard;
    }

    currentMapLayer.addTo(map);
}

function onMapClick(e) {
    // Clear existing marker if there is one
    if (markers.length > 0) {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    // Save selected point
    selectedPoint = e.latlng;

    // Add a new marker
    const marker = L.marker(e.latlng).addTo(map);
    markers.push(marker);
    
    // Show coordinates in popup
    marker.bindPopup(`Ausgewählter Punkt<br>Breitengrad: ${e.latlng.lat.toFixed(5)}<br>Längengrad: ${e.latlng.lng.toFixed(5)}`).openPopup();
}

function addTravelCircle(radius, color, description) {
    if (!selectedPoint) {
        alert('Bitte wählen Sie zuerst einen Punkt auf der Karte aus!');
        return null;
    }

    const circle = L.circle(selectedPoint, {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: radius * 1000 // Convert km to meters
    }).addTo(map);

    circle.bindTooltip(description);
    circles.push({ circle, description });
    
    return { circle, description };
}

function removeCircle(index) {
    if (circles[index]) {
        map.removeLayer(circles[index].circle);
        circles.splice(index, 1);
    }
}

function clearAll() {
    // Remove all circles
    circles.forEach(circle => map.removeLayer(circle.circle));
    circles = [];
    
    // Remove all markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Reset selected point
    selectedPoint = null;
}

function highlightStreets() {
    // This would typically use a routing API like OSRM or MapBox
    alert('Straßenhervorhebung erfordert eine Routing-API-Integration.');
}

// Initialize the map when the window loads
window.addEventListener('load', initMap);