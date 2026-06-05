# Travel Radius Map

Eine webbasierte Karte zur Visualisierung von Suchradien und Lauf-/Fahrzeiten. Nutzer wählen einen Punkt auf der Karte, definieren Geschwindigkeit und Zeit und erhalten daraus einen Radius bzw. eine Isodistanz auf der Karte.

## Changelog

### 05.06.2026
- Cookie zur Speicherung der aktuellen Kartenposition
- Geschwindigkeitsberechnung über Parameter im Popup-Rechner
- UI aufgeräumt und verbessert

## Was neu ist

- Kartenposition bleibt beim nächsten Besuch erhalten
- Gehgeschwindigkeit kann in einem Popup berechnet und direkt ins Geschwindigkeitsfeld übernommen werden
- Erweiterte Optionen sind kompakter und übersichtlicher aufgebaut
- POIs, KML-Export und Kreisverwaltung sind weiterhin integriert

## Funktionsweise

1. Du klickst auf die Karte und setzt damit den Mittelpunkt für die Berechnung.
2. Danach wählst du Fortbewegungsart, Geschwindigkeit und Zeit.
3. Beim Klick auf „Radius berechnen“ wird aus den Eingaben ein Suchradius berechnet.
4. Falls Hindernisse berücksichtigt werden, wird eine Isochrone über die OpenRouteService-API erzeugt.
5. Wenn die API keine verwertbare Antwort liefert, wird automatisch ein Fallback-Kreis erzeugt.
6. Die aktuelle Kartenposition kann gespeichert werden und wird beim nächsten Laden automatisch wiederhergestellt.
7. Der Gehgeschwindigkeit-Rechner öffnet sich in einem Popup und kann den berechneten km/h-Wert direkt in das Hauptformular übernehmen.

## Features

- Vollbild-Interaktive Karte mit Leaflet
- Kartenposition per Cookie speicherbar
- Punkt auf der Karte auswählen
- Geschwindigkeit manuell eingeben oder per Modus wählen
- Zeit für die Berechnung definieren
- Mehrere Kreise speichern und löschen
- POIs im letzten Kreis anzeigen
- KML-Export für Suchbereiche
- Popup-Rechner für Gehgeschwindigkeit

## Projektstruktur

```
dlrg_landau_services
├── index.html
├── walking-speed-calculator.html
├── css
│   └── styles.css
├── js
│   ├── main.js
│   ├── map.js
│   ├── utils.js
│   ├── travelCircle.js
│   ├── weather.js
│   ├── isochrones.js
│   ├── pois.js
│   └── kmlExport.js
├── assets
│   └── icons
├── README.md
└── package.json
```

## Starten

1. Projekt öffnen.
2. `index.html` im Browser starten oder über einen lokalen Server aufrufen.
3. Einen Punkt auf der Karte setzen und die gewünschte Berechnung starten.

## Hinweise zur Nutzung

- Der Standard-Kartenausschnitt startet mit einer allgemeinen Deutschlandansicht.
- Die erweiterte Optionen-Sektion ist standardmäßig eingeklappt.
- Der Gehgeschwindigkeit-Rechner dient als Hilfsmittel und schreibt seinen Wert nicht automatisch, sondern erst nach Übernahme ins Formular.
- Die gespeicherte Kartenposition ist an den Browser gebunden und wird per Cookie abgelegt.

## Mitwirken

Verbesserungen, Fehlerberichte und Vorschläge sind willkommen.