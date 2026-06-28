# Investigating Satellite Imagery

## What this domain covers

This guide covers the use of satellite and aerial imagery in OSINT investigations — acquiring, analysing, and interpreting overhead imagery to geolocate, chronolocate, verify claims, monitor activity, and detect change. It encompasses: open satellite imagery sources (Sentinel Hub, Landsat, Google Earth, Bing Maps Aerial, OpenStreetMap), commercial providers (Maxar, Planet, Airbus) for reference, and analysis techniques including change detection (before/after imagery comparison), facility identification, shadow analysis for building-height estimation, vehicle counting, and construction monitoring. It applies to journalists verifying claimed events, conflict researchers (Bellingcat methodology), disaster-response assessment, corporate due diligence (verifying facility claims), environmental monitoring, and infrastructure analysis. It does **not** cover classified imagery systems, real-time tracking of individuals from space (not achievable with open sources), or any technique requiring access to restricted national-technical means.

## When to use

- A photograph or video claims to show a location, and you need overhead imagery to verify.
- You need to assess damage after a natural disaster, conflict event, or industrial accident.
- You are monitoring construction activity at a facility over time.
- You need to verify a company's claimed operational footprint (factory, mine, logistics hub).
- You need to estimate building heights or layout from shadow analysis.
- You are counting vehicles at a facility to estimate activity levels.
- You need to chronolocate an image by matching visible features against historical imagery.

## Tools

| Tool | Use case | Cost |
|---|---|---|
| Sentinel Hub EO Browser | Free Sentinel-2 (10m optical, 5-day revisit), Sentinel-1 (SAR), Sentinel-3 imagery | Free |
| Google Earth | Global high-resolution imagery, historical imagery timeline, 3D terrain, measurement tools | Free |
| Google Earth Engine | Programmatic access to multi-decadal satellite archives (Landsat, Sentinel, MODIS) | Free (research/journalism) |
| Bing Maps Aerial | Alternative high-resolution imagery, different vintage than Google | Free |
| QGIS | Open-source GIS software for geospatial analysis and map composition | Free |
| OpenStreetMap | Vector map data for cross-referencing roads, buildings, POIs | Free |
| Mapillary / KartaView | Crowdsourced street-level imagery for ground truth | Free |
| Yandex Maps | Alternative imagery source, strong coverage in Russia/Eastern Europe | Free |
| Planet Labs | Daily 3m optical imagery, frequent revisit for change detection | Paid |
| Maxar (DigitalGlobe) | Sub-meter high-resolution imagery | Paid |
| Airbus | High-resolution optical and SAR imagery | Paid |
| SunCalc / NOAA Solar Calculator | Sun-angle and shadow analysis | Free |

## Procedure

1. **Identify coordinates.** Determine the latitude and longitude of the area of interest. Sources: geocoded photographs, address lookup, known facility name, map search, or prior geolocation work. Record coordinates in decimal degrees with appropriate precision (5 decimal places ≈ 1m).
2. **Select imagery source.** Match the source to the analysis goal:
   - **Broad area / change detection:** Sentinel-2 (10m, 5-day revisit) via Sentinel Hub EO Browser.
   - **High-resolution verification:** Google Earth (sub-meter in many areas, historical timeline).
   - **Alternative vintage:** Bing Maps Aerial (often different capture date than Google).
   - **Programmatic bulk analysis:** Google Earth Engine (Landsat archive back to 1984, Sentinel-2 back to 2015).
   - **Radar (all-weather, day-night):** Sentinel-1 via Sentinel Hub.
   - **Street-level ground truth:** Mapillary, KartaView, Google Street View.
3. **Select date range.** For change detection, identify the event date and pull imagery from before and after. Sentinel-2 has 5-day revisit; Google Earth historical imagery varies by location (some areas have annual coverage, others have multi-year gaps). Record the imagery capture date shown in the source.
4. **Analyse features.** Examine the imagery for:
   - **Buildings and structures:** Footprint, height (via shadow length and sun angle), function (industrial vs residential vs military).
   - **Vehicles:** Count, type (large trucks vs passenger cars), distribution patterns.
   - **Infrastructure:** Roads, fences, gates, parking areas, loading docks, rail spurs.
   - **Environmental indicators:** Vegetation health (NDVI from Sentinel-2), water bodies, ground disturbance, burn scars.
   - **Construction activity:** Bare earth, foundation excavation, scaffolding, cranes (visible at high resolution), progressive building stages.
5. **Compare historical imagery.** In Google Earth, use the historical imagery timeline slider to step through available dates. In Sentinel Hub, use the time filter to compare acquisitions across dates. Document what changed, when, and the direction of change (expansion, demolition, new construction, activity surge or decline).
6. **Shadow analysis.** For building-height estimation: measure shadow length in the imagery (using the measurement tool in Google Earth or QGIS), determine the sun elevation angle for the location and capture date/time (using SunCalc or NOAA Solar Calculator), and compute height: `height = shadow_length × tan(sun_elevation_angle)`. This is approximate — terrain slope and shadow direction must be accounted for.
7. **Cross-reference with vector data.** Overlay OpenStreetMap data in QGIS to compare mapped features (roads, buildings, POIs) against what is visible in the imagery. Discrepancies may indicate outdated map data, unauthorised construction, or intentional map suppression.
8. **Document findings.** For each observation: record the imagery source, capture date, resolution, coordinates, and a description of the observed features. Capture screenshots with scale bars and north arrows. Note cloud cover or other image-quality limitations.
9. **Assess confidence.** Satellite imagery interpretation is inferential. A building that looks like a factory may be a warehouse. Vehicle counts are approximate. Shadow-based height estimates have ±20% error margins. State confidence levels and required corroboration.

## Interpreting results

- **Change detection** provides strong evidence of activity timing. New construction visible between two dates constrains the construction window. However, imagery revisit gaps mean the exact start date may be uncertain by days to months.
- **Vehicle counting** gives a rough activity proxy. Counts vary by time of day, day of week, and season. A single image is a snapshot — multiple images over time establish patterns.
- **Shadow analysis** yields approximate building heights. Accuracy depends on precise sun-angle data, accurate shadow-length measurement, and flat terrain. Errors compound with terrain slope and building orientation.
- **Sentinel-2 resolution (10m)** is sufficient for identifying large structures, vehicle clusters, vegetation changes, and ground disturbance, but cannot identify individual vehicles or small features. Use high-resolution sources for detail.
- **Historical imagery gaps** vary by location. Well-covered areas (major cities, conflict zones) may have annual or better coverage. Remote areas may have multi-year gaps. Document gaps explicitly.
- **SAR imagery (Sentinel-1)** penetrates cloud cover and works at night, but interpretation requires different skills than optical imagery. Radar shadows, layover, and speckle can be misinterpreted. Use SAR for change detection where optical is cloud-obscured.

## Common false positives

- **Cloud cover and shadows** can obscure features or be mistaken for them. Always check the cloud-cover percentage in Sentinel-2 metadata. Dark radar shadows in optical imagery can resemble water bodies or burned areas.
- **Image stitching artifacts.** Mosaicked imagery (common in Google Earth's default view) may show seams where different captures meet, with features disappearing or shifting at the boundary. Check the capture date indicator and switch to a single-date layer when possible.
- **Seasonal vegetation changes** can be mistaken for construction or destruction. Leaf-on vs leaf-off imagery changes the appearance of vegetation dramatically. Compare same-season imagery for change detection.
- **Resolution limitations.** At 10m resolution (Sentinel-2), a large building may appear as a few pixels. Do not over-interpret small features. Use high-resolution imagery to confirm.
- **Shadow misinterpretation.** Shadows from terrain (hills, mountains) can be confused with building shadows. Distinguish by checking terrain data and shadow direction consistency.
- **Outdated imagery.** Google Earth's default view may be years old in some areas. Always check the imagery date. What you see may not reflect current ground conditions.
- **Colour anomalies** from atmospheric correction or sensor artifacts in Sentinel-2 can be mistaken for ground features. Compare multiple dates to distinguish persistent features from artifacts.

## Anti-patterns

- **Treating a single image as definitive evidence of current conditions.** Imagery is a point-in-time snapshot. Conditions may have changed. Use multiple dates for pattern analysis.
- **Over-interpreting low-resolution imagery.** Sentinel-2's 10m pixels cannot resolve individual vehicles, small structures, or personnel. Do not claim identification that exceeds the resolution.
- **Ignoring imagery dates.** Comparing images from different seasons or years without accounting for temporal differences leads to false change detections. Always record and compare capture dates.
- **Publishing imagery without source attribution and date.** Every satellite image in a report must cite the source (e.g., "Sentinel-2, ESA, captured 2024-06-15"), the resolution, and the coordinates.
- **Assuming commercial imagery is necessary for all investigations.** Free sources (Sentinel-2, Google Earth, Landsat) are sufficient for most OSINT purposes. Commercial imagery is rarely needed and often expensive.
- **Failing to account for terrain in shadow analysis.** Sloped terrain distorts shadow length. Use digital elevation models (DEMs) in QGIS to correct for terrain.
- **Confusing optical and SAR imagery.** They show different things. SAR measures radar reflectivity, not optical appearance. Do not describe a SAR image as if it were a photograph.
- **Neglecting ground-truth verification.** Satellite imagery is most powerful when combined with ground-level sources (street view, social-media photos, witness reports). Do not rely on overhead imagery alone for high-confidence claims.

## Cross-references

- Related domains: geoint.md (geolocation methodology, street-view analysis, photo verification), ip-investigation.md (facility infrastructure correlation)
- Pivot playbooks: ../pivot-playbooks/photo-to-location.md (geolocating images using overhead imagery)
- Ethics: ../../ethics/privacy-guidelines.md, ../../ethics/legal-frameworks.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml