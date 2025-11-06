# Quick Usage Guide - Standalone Map

## For TYPO3 Integration

1. Open `standalone-map.html` in a text editor
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. In TYPO3, create a new "HTML" content element
4. Paste the code into the HTML field
5. Save and publish

## Key Configuration Areas

### 1. Add Permanent KML Layers (Lines 618-630)
```javascript
const PERMANENT_KML_LAYERS = [
    {
        name: "Your Layer Name",
        url: "https://your-server.com/layer.kml",
        color: "#FF0000",
        visible: true,
        description: "Layer description"
    }
];
```

### 2. Change API Key (Line 632)
```javascript
const OPENROUTESERVICE_API_KEY = 'your_api_key_here';
```

### 3. Change Default Location (Lines 634-635)
```javascript
const DEFAULT_CENTER = [49.1983, 8.1172];  // [latitude, longitude]
const DEFAULT_ZOOM = 13;
```

## User Features

### Calculate Search Radius
1. Click on map to select center point
2. Choose transport mode (Walking/Biking/Driving)
3. Enter speed and time
4. Click "Radius berechnen"

### KML Layer Management
1. Expand "KML Layers" section
2. Click "KML hochladen" to upload files
3. Use checkboxes to show/hide layers
4. Click × to remove uploaded layers

### Export Results
- Click "Als KML exportieren" to download all calculated areas as KML

## Technical Notes
- File size: ~92KB
- No external dependencies (except CDN libraries)
- Works offline after initial load
- Mobile responsive
