class KMLExporter {
    constructor() {
        this.namespace = 'http://www.opengis.net/kml/2.2';
    }

    /**
     * Erstellt KML-Inhalt für alle gespeicherten Kreise
     * @param {Array} circles - Array der Kreise
     * @param {Object} selectedPoint - Der ausgewählte Mittelpunkt
     * @returns {string} KML-String
     */
    exportCirclesToKML(circles, selectedPoint) {
        if (!circles || circles.length === 0) {
            throw new Error('Keine Kreise zum Exportieren vorhanden.');
        }

        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="${this.namespace}">
  <Document>
    <name>DLRG Landau - Suchradius Export</name>
    <description>Exportierte Suchradius-Kreise vom ${new Date().toLocaleString('de-DE')}</description>
    
    <Style id="circleStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>330000ff</color>
      </PolyStyle>
    </Style>
    
    <Style id="centerStyle">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>`;

        // Mittelpunkt hinzufügen
        if (selectedPoint) {
            kmlContent += `
    <Placemark>
      <name>Suchzentrum</name>
      <description>Mittelpunkt der Suchradius-Berechnung</description>
      <styleUrl>#centerStyle</styleUrl>
      <Point>
        <coordinates>${selectedPoint.lng},${selectedPoint.lat},0</coordinates>
      </Point>
    </Placemark>`;
        }

        // Kreise hinzufügen
        circles.forEach((circleObj, index) => {
            const coordinates = this.getCircleCoordinates(circleObj, selectedPoint);
            
            kmlContent += `
    <Placemark>
      <name>Suchradius ${index + 1}</name>
      <description>${this.escapeXML(circleObj.description)}</description>
      <styleUrl>#circleStyle</styleUrl>
      <Polygon>
        <extrude>0</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${coordinates}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
        });

        kmlContent += `
  </Document>
</kml>`;

        return kmlContent;
    }

    /**
     * Extrahiert Koordinaten aus einem Kreis
     */
    getCircleCoordinates(circleObj, centerPoint) {
        // Für erweiterte Kreise (GeoJSON/Isochrone)
        if (circleObj.isAdvanced && circleObj.circle.toGeoJSON) {
            const geoJson = circleObj.circle.toGeoJSON();
            if (geoJson.features && geoJson.features[0] && geoJson.features[0].geometry) {
                const coords = geoJson.features[0].geometry.coordinates[0];
                return coords.map(coord => `${coord[0]},${coord[1]},0`).join('\n              ');
            }
        }
        
        // Für einfache Kreise
        if (circleObj.circle && circleObj.circle.getRadius) {
            const radius = circleObj.circle.getRadius(); // in Metern
            const center = circleObj.circle.getLatLng();
            return this.generateCircleCoordinates(center, radius / 1000); // Konvertierung zu km
        }

        // Fallback: Kreis aus Beschreibung extrahieren
        const radiusMatch = circleObj.description.match(/\((\d+\.?\d*) km\)/);
        if (radiusMatch && centerPoint) {
            const radius = parseFloat(radiusMatch[1]);
            return this.generateCircleCoordinates(centerPoint, radius);
        }

        return '';
    }

    /**
     * Generiert Kreis-Koordinaten basierend auf Mittelpunkt und Radius
     */
    generateCircleCoordinates(center, radiusKm) {
        const points = [];
        const numPoints = 64;
        
        for (let i = 0; i <= numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            const dx = Math.cos(angle) * radiusKm;
            const dy = Math.sin(angle) * radiusKm;
            
            // Konvertierung dx/dy zu lat/lng
            const lat = center.lat + (dy / 111.32);
            const lng = center.lng + (dx / (111.32 * Math.cos(center.lat * Math.PI / 180)));
            
            points.push(`${lng},${lat},0`);
        }
        
        return points.join('\n              ');
    }

    /**
     * Escapes XML-Zeichen
     */
    escapeXML(str) {
        return str.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    /**
     * Startet den Download der KML-Datei
     */
    downloadKML(kmlContent, filename = 'suchradius-export.kml') {
        const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
    }
}
