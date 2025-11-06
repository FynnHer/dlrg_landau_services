# DLRG Landau - Standalone Interaktive Karte

## Übersicht

`standalone-map.html` ist eine vollständige, eigenständige HTML-Datei, die alle Funktionen der DLRG Landau Vermissten-Radius-Karte enthält. Sie kann direkt in TYPO3 als HTML-Modul eingebunden werden.

## Features

### Bestehende Funktionen
- **Verschiedene Kartentypen**: Standard, Satellit, Straßen-fokussiert
- **Radiusberechnung**: 
  - Geschwindigkeits- und zeitbasierte Berechnungen
  - Mehrere Transportmodi (Zu Fuß, Fahrrad, Auto)
  - Isochronen-API Integration (OpenRouteService)
  - Straßen-Modus vs. Querfeldein-Modus
- **POI Management**:
  - POIs in berechneten Bereichen abrufen
  - Kategoriebasierte Farbcodierung
  - Deutsche Übersetzungen für POI-Typen
  - Interaktive Legende
- **Export-Funktionen**:
  - Export von Kreisen/Bereichen als KML
  - Export von POIs als KML
- **UI Features**:
  - Einklappbares Bedienfeld
  - Punktauswahl durch Klick auf die Karte
  - Liste gespeicherter Kreise mit Löschen-Funktion
  - Lade-Indikatoren

### Neue KML-Layer-Funktionen
- **KML-Parser**: Parst KML/KMZ-Dateien (Placemarks, Polygone, LineStrings, Points)
- **Layer-Verwaltung**:
  - Checkbox-basierte UI zum Ein-/Ausschalten einzelner KML-Layer
  - Upload-Button für temporäre KML-Layer
  - Vordefinierte permanente KML-Layer
  - Farbindikatoren für jeden Layer
  - "Alle ein/ausblenden"-Funktion
- **Unterstützung großer Datensätze**: Effiziente Handhabung tausender Punkte
- **Unabhängige Layer-Sichtbarkeit**: Jeder KML-Layer kann einzeln ein-/ausgeblendet werden

## Installation in TYPO3

1. Öffnen Sie TYPO3 Backend
2. Erstellen Sie ein neues Inhaltselement vom Typ "HTML"
3. Kopieren Sie den kompletten Inhalt von `standalone-map.html`
4. Fügen Sie ihn in das HTML-Feld ein
5. Speichern und veröffentlichen Sie die Seite

## Konfiguration

### Permanente KML-Layer hinzufügen

Öffnen Sie `standalone-map.html` und bearbeiten Sie die `PERMANENT_KML_LAYERS`-Konstante am Anfang des JavaScript-Abschnitts:

```javascript
const PERMANENT_KML_LAYERS = [
    {
        name: "Mein Layer",
        url: "https://example.com/layer.kml",  // URL zu KML-Datei
        color: "#FF0000",  // Layer-Farbe
        visible: true,  // Standard-Sichtbarkeit
        description: "Beschreibung des Layers"
    },
    // Oder KML-Inhalt direkt einbetten:
    {
        name: "Eingebetteter Layer",
        kmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Punkt</name>
      <Point>
        <coordinates>8.1172,49.1983,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`,
        color: "#00FF00",
        visible: false,
        description: "Direkt eingebetteter Layer"
    }
];
```

### Karten-Einstellungen ändern

```javascript
// API-Konfiguration
const OPENROUTESERVICE_API_KEY = 'IHR_API_KEY_HIER';

// Karten-Konfiguration
const DEFAULT_CENTER = [49.1983, 8.1172];  // [Breitengrad, Längengrad]
const DEFAULT_ZOOM = 13;  // Zoom-Level (1-19)
```

### Transport-Geschwindigkeiten anpassen

Die Standard-Geschwindigkeiten befinden sich in der `transportSpeeds`-Konstante:

```javascript
const transportSpeeds = {
    walking: 5,   // km/h
    biking: 15,   // km/h
    driving: 60   // km/h
};
```

## Verwendung

### Radius berechnen
1. Klicken Sie auf die Karte, um einen Punkt auszuwählen
2. Wählen Sie Transportmodus (Zu Fuß, Fahrrad, Auto)
3. Geben Sie Geschwindigkeit und Zeit ein
4. Klicken Sie auf "Radius berechnen"
5. Der berechnete Bereich wird auf der Karte angezeigt

### Erweiterte Optionen
- **Hindernisse berücksichtigen**: Verwendet Isochronen-API für realistische Berechnungen
- **Geländemodus**: 
  - "Querfeldein": Kann über Felder gehen
  - "Nur Straßen": Bleibt auf Wegen und Straßen

### POIs anzeigen
1. Berechnen Sie zuerst einen Suchbereich
2. Klicken Sie auf "POIs im letzten Kreis anzeigen"
3. POIs werden mit Farbcodierung nach Kategorie angezeigt
4. Eine Legende zeigt die POI-Kategorien und deren Anzahl

### KML-Layer verwalten
1. Klicken Sie auf die "KML Layers"-Sektion im Bedienfeld
2. **Upload**: Klicken Sie auf "KML hochladen" und wählen Sie eine KML-Datei
3. **Ein-/Ausblenden**: Verwenden Sie die Checkboxen neben den Layer-Namen
4. **Löschen**: Klicken Sie auf das "×" neben hochgeladenen Layern
5. **Alle umschalten**: "Alle ein/ausblenden"-Button

### Export
- **Als KML exportieren**: Exportiert alle berechneten Bereiche und den Mittelpunkt als KML-Datei

## Technische Details

### Verwendete Bibliotheken (via CDN)
- Leaflet.js 1.9.4 (Kartenbibliothek)
- Font Awesome 6.4.0 (Icons)

### APIs
- OpenRouteService (Isochronen und POIs)
  - API-Key: Im Code konfigurierbar
  - Rate Limits beachten (kostenloser Tier)

### Browser-Kompatibilität
- Moderne Browser mit ES6+ Unterstützung
- Chrome, Firefox, Safari, Edge (aktuelle Versionen)
- Mobile Browser werden unterstützt (responsive Design)

### Datenschutz
- Verwendet OpenRouteService API (siehe deren Datenschutzrichtlinien)
- Keine Daten werden auf eigenen Servern gespeichert
- Alle Berechnungen erfolgen client-seitig oder über externe APIs

## Fehlerbehebung

### Karte wird nicht angezeigt
- Prüfen Sie die Browser-Konsole auf Fehler
- Stellen Sie sicher, dass CDN-Links erreichbar sind
- Prüfen Sie, ob JavaScript aktiviert ist

### API-Fehler
- Prüfen Sie, ob der API-Key korrekt ist
- Überprüfen Sie API-Rate-Limits
- Prüfen Sie Netzwerkverbindung

### KML-Upload funktioniert nicht
- Stellen Sie sicher, dass die KML-Datei gültiges XML ist
- Prüfen Sie die Browser-Konsole auf Parsing-Fehler
- KMZ-Dateien müssen entpackt werden (nur .kml-Dateien werden unterstützt)

## Beispiel-KML-Datei

Eine Beispiel-KML-Datei (`test-example.kml`) ist im Repository enthalten zum Testen der KML-Upload-Funktion.

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im GitHub-Repository oder kontaktieren Sie das DLRG Landau Team.

## Lizenz

MIT License
