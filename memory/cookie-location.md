---
name: cookie-location-save-restore
description: Cookie functionality for saving and restoring map position
metadata:
  type: project
---

**Implementation:** Added cookie-based map position saving feature to the DLRG Landau services application.

**How to apply:** 
- Users can click "Aktuelle Position speichern" to save their current map view (lat, lng, zoom, map type) to a cookie.
- The map automatically restores the saved position on page load if a selected point exists.
- Auto-save triggers after 1 second of map interaction (click, drag, zoom) and after 5 seconds of inactivity.
- Users can clear the saved position with "Speicherung löschen" if needed.
- Cookie expires after 365 days.

**Why:** Enables users to revisit the website and automatically return to their previously viewed map location without manually repositioning.

[See implementation in js/main.js](https://github.com/user/repo/blob/main/js/main.js) and [js/map.js](https://github.com/user/repo/blob/main/js/map.js)
