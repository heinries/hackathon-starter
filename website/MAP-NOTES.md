# Anole map milestone

## Source review — 25 September 2026

- Houston OEM: https://houstonoem.org/extreme-heat/ links to the supplied cooling-centre experience: https://experience.arcgis.com/experience/9f7f09cf040641aa8f92a22025cf4419.
- Verified the Experience item configuration, rather than assuming it exposed an API. Its web map is `461bdd26d6ec452ca530fe6d41973f25`; that map references feature-service item `99f6279831a549ec8260da38ddc9b51c` (`COH_MassCare Public`).
- Layer: https://services3.arcgis.com/aDc3tOL5l9SNklhS/arcgis/rest/services/COH_MassCare_Public/FeatureServer/0 — `COH_Cooling_Centers`, displayed in the official map as “Daytime Cooling Centers”.
- Publisher provenance: linked by Houston Office of Emergency Management; ArcGIS owner `E176344_COHOEM`, portal `COHOEM.maps.arcgis.com`. The item's formal attribution field is empty.
- A read-only query returned point geometry in WGS84 (`outSR=4326`). Native geometry is Web Mercator (3857). Fields: `OBJECTID`, `NAME`, `PHONE`, `Status`, `Category`, `ADDRESS`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`, `GlobalID`, `Holidays`.
- Layer data-edit timestamp: `1787331587757` (21 August 2026 UTC). Item modified: 24 August 2026, 18:46:29 UTC. Metadata timestamps are not evidence of current availability or a visit to an individual facility.
- Reuse terms: item `licenseInfo` and `accessInformation`, and service/layer copyright fields, are empty. Public query access does not establish a reuse licence. No official records or coordinates are republished in Anole.
- Inspected https://houston-mycity.opendata.arcgis.com/ and its City GIS organization (`NummVBqZSIJKUeVR`); an ArcGIS organization search for “cooling” returned zero items. Inspected https://data.houstontx.gov/; its CKAN `package_search?q=cooling` returned zero datasets. These searches are not an assertion that no other relevant dataset exists.

## Points actually used

All points are manually selected demonstration positions in Houston, not observed facilities or cooling centres. Their placement makes no assertion about the real place underneath. Metadata is in the static cards in `explore.html`; popups read those same fields.

| Demo | Category | Latitude | Longitude |
| --- | --- | --- | --- |
| 01 | Walkways | 29.7650 | -95.3900 |
| 02 | Street lighting | 29.7580 | -95.3700 |
| 03 | Preparedness | 29.7490 | -95.3820 |
| 04 | Community spaces | 29.7540 | -95.3980 |

Source: Anole fictional demo. All sample dates are 24 September 2026. Conditions are fictional/unverified. Follow-up: what people tried is not recorded; what worked is unknown. Storage of follow-up records is a future capability.

## Map operation and dependencies

Leaflet 1.9.4 is vendored in `vendor/leaflet/` with its BSD-2-Clause licence. Original project licence is unchanged. No npm/build step or API key.

Basemap: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, visibly attributed to OpenStreetMap contributors. Tile policy: https://operations.osmfoundation.org/policies/tiles/. Standard human interactive browsing with browser cache headers and HTTP Referer; no tile prefetch, bulk/offline download or proxy. Use an HTTP server, not a file URL, for tiles. Tile delivery requires network access and is best effort. Automated checks block external image requests; do not run automated pan/zoom crawls against OSM tiles.

Pan, zoom, numbered marker popups, category filtering and reset work in-browser. List links open existing sample details. Category filtering remains in `app.js`; separate `map.js` synchronizes markers. The static list is available if JavaScript, Leaflet or tiles fail. Without JavaScript all samples remain visible; filters need JavaScript. Capture is unchanged.

No current cooling-centre feed, facility validation, route planning, GPS, posting, database storage or recorded follow-ups. The official OEM/ArcGIS link is a separate external information source.

Preview: `python3 -m http.server 8000 --directory website`, then open http://localhost:8000/explore.html.
