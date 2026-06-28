# Investigating Geospatial Intelligence (GEOINT)

## Scope
This guide covers geospatial intelligence in OSINT — the use of imagery, mapping, satellite data, street-level photography, flight and vessel tracking, weather data, and terrain analysis to geolocate, chronolocate, or verify a subject, event, or piece of content. It applies to journalists verifying user-generated content, conflict researchers (Bellingcat methodology), fraud analysts verifying claimed locations, disaster-response teams, and corporate due-diligence teams verifying facility claims. It covers photo geolocation, satellite imagery analysis, street-view comparison, ADS-B and AIS correlation, weather correlation, and terrain analysis. It does **not** cover tactical military GEOINT, classified imagery systems, or any technique requiring access to restricted national-technical means. It also does not cover real-time tracking of an identifiable individual without lawful basis — that is surveillance, not OSINT, and is regulated separately.

## Key questions to answer
- Where was a given photograph taken — country, region, city, specific location?
- When was the photograph taken — date, time of day, season?
- What is in the photograph that can be verified against ground-truth imagery (satellite, street view, aerial)?
- What environmental conditions (weather, vegetation state, sun angle, shadow direction) help narrow the location and time?
- Are there aircraft, vessels, vehicles, or infrastructure in the frame that can be cross-referenced against tracking data?
- What is the provenance of the image — original capture, repost, manipulation?
- Does the claimed location of an event match the geolocatable evidence?
- What satellite imagery is available for the location and time period of interest?
- What street-view coverage exists for the location, from which providers, and at what recency?
- What are the limits of GEOINT — what cannot be resolved without on-the-ground corroboration?

## Data categories
### Category 1: Image metadata (EXIF)
EXIF (Exchangeable Image File Format) metadata is embedded in many image files and may contain: GPS coordinates (if the camera or phone recorded them), capture timestamp, camera make and model, lens, exposure settings, software used to process the image, and thumbnail. EXIF is stripped by most social media platforms on upload (Twitter, Facebook, Instagram, WhatsApp) but may survive in images shared via email, Slack, Discord, Telegram (depending on settings), or direct file transfer. Tools: `exiftool` (canonical CLI), ExifPilot, online EXIF viewers. Note: EXIF can be fabricated or stripped; its presence is a signal, not a guarantee.

### Category 2: Visual landmark identification
The core Bellingcat methodology. Identify landmarks, signage, architectural features, vegetation, terrain, vehicles (with country-specific licence plates, road markings, traffic signage), infrastructure (power poles, cell tower designs, road markings), and any text visible in the frame. Cross-reference against:
- **Google Earth** — global satellite and aerial imagery, historical imagery timeline, 3D terrain, Street View integration.
- **Google Maps** — business listings, reviews (often with photos that help orient), road layouts.
- **Bing Maps** — different imagery vintage than Google; useful when Google's imagery is older.
- **Yandex Maps** — particularly strong for Russia, Eastern Europe, and parts of Asia; different imagery than Western providers.
- **Mapillary** — crowdsourced street-level imagery; covers many locations not covered by Google Street View.
- **KartaView** (formerly OpenStreetCam) — another crowdsourced street-level imagery source.
- **OpenStreetMap** — vector map data; useful for cross-referencing road layouts and POIs.

### Category 3: Shadow and sun-angle analysis
Shadows in a photograph reveal the sun's position, which combined with the date and the location gives the time of day, or combined with the time of day and location gives the date, or combined with the date and time of day gives the latitude. Tools: SunCalc, SunCalc.org, Sun Surveyor (mobile app), NOAA Solar Calculator. The angle of shadows can be measured against the image frame (if north is known) and the sun's azimuth/elevation can be computed for any candidate location/date/time. Mismatched shadows are a strong indicator of composite imagery or misattributed content.

### Category 4: Vegetation and seasonal analysis
Vegetation state (leaf-on, leaf-off, flowering, snow cover) constrains the season. Crop states, agricultural cycles, and harvest progress can narrow the date further. Cross-reference with local climate data and historical weather. Cloud cover, precipitation, and visibility conditions visible in the image can be matched against historical weather records (Weather Underground history, NOAA NCDC, Met Office historical weather, OGIMET).

### Category 5: Satellite imagery
For broader-area or temporal-pattern analysis:
- **Sentinel Hub** — free tier provides Sentinel-2 (10m optical, 5-day revisit), Sentinel-1 (radar, all-weather), and Sentinel-3 imagery. Excellent for change detection over time.
- **Google Earth Engine** — programmable access to multi-decadal satellite archives including Landsat. Free for research and journalism use.
- **Planet Labs** — paid; daily 3m optical imagery; strong for recent events and frequent change detection.
- **Maxar (formerly DigitalGlobe)** — paid; sub-meter optical imagery; the source for most high-resolution imagery in news reporting.
- **Landsat archive** — free; 30m optical; the longest civilian satellite archive (1984 to present).
- **Synthetic aperture radar (SAR)** — Sentinel-1 (free), ICEYE (paid); all-weather, day-night imaging.

### Category 6: Street-view imagery
- **Google Street View** — broadest global coverage; periodic re-captures; the timeline feature shows historical captures for many locations.
- **Mapillary** — crowdsourced; broader coverage in some non-Western regions; varying quality.
- **KartaView** — crowdsourced; similar to Mapillary.
- **Bing Streetside** — Microsoft's street-view product; limited coverage but useful in some regions.
- **Yandex Panoramas** — strong coverage in Russia and former Soviet states; sometimes the only street-view available.
- **Kakao RoadView / Naver Street View** — South Korea (Google Street View is restricted in South Korea).
- **Baidu Street View** — China (Google Street View is unavailable).

### Category 7: Flight tracking
For aircraft appearing in photographs or for verifying claimed locations by air-traffic patterns:
- **ADS-B Exchange** — community-fed ADS-B receiver network; broadest coverage; does **not** filter military or private aircraft (unlike Flightradar24 and FlightAware which filter at government request). The preferred source for OSINT.
- **Flightradar24** — commercial; filters some military and private; strong analytics and historical data.
- **FlightAware** — commercial; similar to Flightradar24.
- **OpenSky Network** — academic; open ADS-B database with historical data and an API.
- **RadarBox** — commercial.

Aircraft visible in a photograph can sometimes be identified by livery, registration, or type, then cross-referenced against ADS-B tracks to confirm location and time.

### Category 8: Vessel tracking
For vessels appearing in photographs or for verifying claimed maritime locations:
- **MarineTraffic** — community-fed AIS; broadest coverage; commercial with free tier.
- **VesselFinder** — similar; commercial with free tier.
- **Global Fishing Watch** — focuses on fishing vessels; includes some vessels not in MarineTraffic/VesselFinder.
- **AISHub** — community-fed AIS network; smaller but free.
- **Equasis** — vessel registry and classification data.

Vessels visible in a photograph can sometimes be identified by name, IMO number, or distinctive features, then cross-referenced against AIS tracks to confirm location and time. Note: AIS can be spoofed or turned off; absence of a track is not absence of a vessel.

### Category 9: Weather correlation (chronolocation)
Historical weather data matched against visible conditions in the photograph (cloud cover, precipitation, snow, fog). Sources: OGIMET (historical METAR data), Weather Underground history, NOAA NCDC, Met Office historical weather, Windy (reanalysis data), Open-Meteo historical API. A photograph showing fresh snow on a specific date narrows the location to areas that received snowfall that day. A photograph showing clear skies and dry pavement narrows against areas with rainfall in the historical record.

### Category 10: Terrain analysis
Topographic features — elevation, slope, drainage patterns, coastlines — provide strong constraints. Cross-reference against:
- **Google Earth terrain** — global 3D terrain with reasonable accuracy.
- **SRTM (Shuttle Radar Topography Mission)** — free; ~30m global DEM.
- **ASTER GDEM** — free; alternative DEM.
- **OpenTopography** — DEM access portal.

A specific mountain silhouette in the background of a photograph can be matched against the DEM-derived silhouette from candidate viewpoints.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| `exiftool` | EXIF metadata extraction | Free |
| Google Earth | Imagery, historical, 3D terrain | Free |
| Google Street View | Street-level imagery | Free |
| Mapillary / KartaView | Crowdsourced street-view | Free |
| Sentinel Hub | Sentinel-1/2/3 satellite imagery | Freemium |
| Google Earth Engine | Multi-decadal satellite archives | Free (research) |
| SunCalc / Sun Surveyor | Sun position calculation | Free / Paid |
| ADS-B Exchange | Unfiltered flight tracking | Free |
| Flightradar24 / FlightAware | Commercial flight tracking | Freemium |
| MarineTraffic / VesselFinder | Vessel tracking | Freemium |
| OGIMET / Weather Underground history | Historical weather | Free |
| SRTM / ASTER GDEM | Digital elevation models | Free |
| Yandex Maps / Panoramas | Russia and former USSR coverage | Free |
| Baidu Maps / Kakao RoadView | China and South Korea coverage | Free |

## Methodology
1. **Establish provenance.** Where did the image come from? Is it original, reposted, or manipulated? Pull the highest-resolution version available. Reverse-image-search (Google, Yandex, TinEye, Bing) to find earlier appearances.
2. **Extract EXIF.** `exiftool` for any file you have direct access to. Record GPS, timestamp, camera model, software. Treat as a signal, not a guarantee — EXIF can be fabricated.
3. **Visual landmark survey.** Walk through the image systematically: foreground, midground, background. Note every identifiable feature: signage (language, alphabet, format), architecture (building style, materials), vegetation (species, season), vehicles (make, model, licence plate format), infrastructure (road markings, power poles, cell tower design), terrain, sky.
4. **Generate candidate locations.** From the strongest constraints (a specific landmark, a language, a licence plate format), generate a shortlist of candidate regions or cities.
5. **Cross-reference against satellite and street view.** For each candidate, pull Google Earth, Bing Maps, Yandex Maps imagery. Pull Google Street View, Mapillary, KartaView. Look for matching landmarks, building layouts, road geometries.
6. **Constrain with shadows and sun angle.** If shadows are visible and the date is known, compute the sun's azimuth/elevation for the candidate location at the capture time; verify the shadow direction and length match. If the date is unknown, use shadow analysis to constrain it.
7. **Constrain with vegetation and weather.** Cross-reference visible vegetation state against seasonal expectations for the candidate region. Cross-reference visible weather against historical weather records for the candidate date.
8. **Cross-reference with flight and vessel data.** If aircraft or vessels are visible, identify them and check ADS-B or AIS tracks for the candidate time and location.
9. **Constrain with terrain.** If terrain is visible, match against DEM-derived silhouettes from candidate viewpoints.
10. **Triangulate.** Combine multiple constraints. A single weak constraint (e.g., "looks European") is not enough; multiple strong constraints (e.g., "Cyrillic signage + specific building + matching Street View + matching shadow + matching weather") is a high-confidence geolocation.
11. **Document uncertainty.** For each constraint, record the strength and the confidence. For the final geolocation, record the overall confidence and the alternative candidates considered.
12. **Pivot.** Geolocation may enable further investigation — the venue may have a website, the event may have been reported, the people may be identifiable. Hand to person-investigation (../../knowledge/domains/person-investigation.md), social-media investigation (../../knowledge/domains/social-media.md), or event-investigation workflows as appropriate.
13. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **Reverse-image-search false negatives.** Google's reverse image search increasingly fails to find older reposts. Use Yandex (often stronger for non-English content and for faces), TinEye (strong for exact matches), and Bing in parallel.
- **EXIF stripping by platforms.** Most social media platforms strip EXIF on upload. Absence of EXIF is the default, not a signal of manipulation.
- **EXIF fabrication.** EXIF can be edited with `exiftool` or any image editor. Treat EXIF as one signal among many, not as ground truth.
- **Imagery vintage mismatch.** Google Earth's default imagery may be years old. The Street View timeline feature shows historical captures — the most recent capture is not always the current view. Always check the imagery date.
- **Shadow direction errors.** Shadow direction depends on hemisphere, time of day, and time of year. Northern-hemisphere intuition fails in the southern hemisphere; winter sun angles differ dramatically from summer.
- **Vegetation season shift.** Vegetation state varies by micro-climate, altitude, and recent weather. A "spring in May" assumption fails in high-altitude or high-latitude regions.
- **AIS and ADS-B gaps.** Tracking coverage is uneven — receivers are concentrated in populated areas. Absence of a track does not mean absence of a vessel or aircraft.
- **AIS and ADS-B spoofing.** Both can be spoofed. A track that shows a vessel in one location may be a broadcast from elsewhere. Treat with caution for high-stakes work.
- **Street-view staleness.** Street View captures may be years old. The current view may differ — buildings demolished, signage changed, vegetation grown.
- **Crowdsourced imagery quality.** Mapillary and KartaView imagery quality varies enormously. A blurry capture may obscure the very feature you need to verify.
- **Manipulated imagery.** Image manipulation is increasingly sophisticated (AI-generated content, deepfakes, conventional Photoshop). Apply error-level analysis, examine shadows for consistency, examine reflections, examine edge artifacts. If manipulation is suspected, route to a specialist.
- **Overconfidence from a single match.** A single landmark match is not a geolocation. Require multiple independent constraints.
- **Cultural and linguistic misreading.** Signage in unfamiliar scripts is easy to misread. Use native-speaker review for high-stakes work.

## Ethical considerations
- **Individual identification.** Geolocating a photograph of an identifiable individual is processing of personal data. The individual may have a reasonable expectation of privacy even in a public place; this varies by jurisdiction (US generally permits, EU/UK applies GDPR). Document the lawful basis.
- **Military and operational sensitivity.** Geolocating military equipment, troop positions, or critical infrastructure may, in some jurisdictions, constitute an offence (e.g., UK Official Secrets Act, US 18 USC § 795). Consult counsel for work near military installations.
- **Conflict-zone harm minimisation.** Geolocating content in active conflict zones may enable harm to identifiable individuals or groups. Apply a harm-minimisation test before publishing. Bellingcat's editorial guidelines are a useful reference.
- **Source protection.** The source of a geolocated image may be at risk if identified. Protect source identity in publication.
- **Victim identification.** Geolocated content may identify victims of abuse, trafficking, or conflict. Do not republish identifying content without a documented public-interest test and consent where feasible.
- **Satellite imagery licensing.** Commercial satellite imagery is licensed; redistribution rights vary. Do not redistribute paid imagery (Maxar, Planet) without licensing rights; use the provider's approved preview or attribution mechanism.
- **Street-view publication.** Republishing Google Street View imagery is subject to Google's terms of service. Use screen captures with attribution, or use OpenStreetMap-derived sources where licensing is more permissive.
- **Children.** Geolocating content featuring children invokes heightened protections. Halt and consult safeguarding lead.
- **Disinformation awareness.** GEOINT is increasingly used to debunk or to perpetuate disinformation. Apply rigorous provenance checking; be aware that adversaries may attempt to geolocate fabricated content to lend it credibility.
- **Mental-health awareness.** Conflict-zone GEOINT involves repeated exposure to graphic content. Use rotation, debriefing, and counselling resources.
- **Operational OPSEC.** If investigating a hostile actor, your own GEOINT queries may be observable. Use a clean environment; do not tip off the actor.

## Output
Produce a GEOINT report using the template at ../../templates/reports/geoint-report.md. The report must include: image provenance, EXIF metadata table, visual landmark survey, candidate-location generation, satellite/street-view cross-reference table, shadow/sun-angle analysis, vegetation/weather analysis, flight/vessel correlation if applicable, terrain analysis, final geolocation with confidence and alternatives considered, uncertainty documentation, confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/image-to-location.md, ../pivot-playbooks/flight-to-location.md, ../pivot-playbooks/vessel-to-location.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/geoint-harm-minimisation.md, ../../ethics/personal-data.md, ../../ethics/source-protection.md
- Case studies: ../../case-studies/bellingcat-style-geolocation.md, ../../case-studies/conflict-content-verification.md
