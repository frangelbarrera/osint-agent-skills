# Investigating Vehicles and Registration

## What this domain covers

This guide covers OSINT investigation of motor vehicles — identifying, tracing, and verifying vehicles through license plates, Vehicle Identification Numbers (VINs), registration databases, stolen-vehicle records, and image-based identification. It encompasses: license plate recognition and lookup across jurisdictions, VIN decoding and history checks, vehicle registration databases by country (US: NMVTIS; EU: national registries; UK: DVLA; Australia: state registries), stolen-vehicle databases (Interpol Stolen Motor Vehicle database, national databases), vehicle image search and corroboration (Google Lens reverse image, plate-reader datasets), and toll-transponder tracking concepts (ETC/E-ZPass metadata as an investigative lead). It does **not** cover real-time tracking of an identified individual's vehicle without lawful basis, accessing restricted law-enforcement databases without authorisation, or any technique requiring physical contact with the vehicle.

## When to use

- A license plate appears in a photograph or video and you need to identify the vehicle or corroborate a location.
- You are investigating fraud (insurance, vehicle cloning, odometer rollback) and need a vehicle's history.
- A VIN was found in a listing, document, or breach data and you need to verify the vehicle's identity and history.
- You need to check whether a vehicle has been reported stolen across jurisdictions.
- You are conducting due diligence on a vehicle being sold or transferred.
- A vehicle image needs corroboration against known plate registrations or public listings.
- Lawful-access toll-transponder metadata is available and you need to understand movement patterns.

## Tools

| Tool | Use case | Cost |
|---|---|---|
| NICB VINCheck (US) | Stolen-vehicle and total-loss check by VIN | Free |
| NMVTIS (US) | Federal vehicle title history database | Paid (per report) |
| Vincheck.nl | International VIN check and vehicle history | Freemium |
| Vehicle Certificate of Destruction search (US) | Salvage/destroyed vehicle lookup | Free |
| DVLA Vehicle Enquiry (UK) | Tax and MOT status by registration | Free |
| askMID (UK) | Insurance database check | Free (limited) |
| Interpol SMV database | Stolen motor vehicle international check | Law-enforcement access |
| Google Lens | Reverse image search for vehicle photos | Free |
| Plate Recognizer API | License plate recognition from images | Freemium (free tier) |
| Parkotron / OpenALPR | Open-source plate recognition | Free |
| AutoTempest / CarGurus | Vehicle listing search by VIN or plate | Free |
| Bing Visual Search | Alternative reverse image search | Free |

## Procedure

1. **Plate capture.** Obtain the clearest possible image of the license plate. Note the plate format (country-specific: US plates vary by state, EU plates have a country band on the left, UK plates follow `AB12 CDE` format). Record the plate string exactly as displayed, preserving spacing and special characters.
2. **VIN extraction.** If available, extract the 17-character VIN from the vehicle (dashboard, door jamb, documents, or listing). VINs use a standardised format: WMI (country/manufacturer, chars 1-3), VDS (vehicle descriptor, chars 4-9), VIS (vehicle identifier, chars 10-17). Decode the VIN using a free decoder (Vincheck.nl, NICB VINCheck) to confirm make, model, year, plant, and serial.
3. **Registry check.** Query the relevant jurisdiction's registry:
   - **US:** Run NICB VINCheck (free) for stolen/total-loss status. Pull a NMVTIS title-history report (paid, ~$5) for title brands, odometer readings, and state registrations. Cross-reference with state DMV databases where accessible.
   - **UK:** Use DVLA Vehicle Enquiry (free) for tax and MOT status. Use askMID (free, limited) for insurance verification.
   - **EU:** Query the national vehicle registry (e.g., Kraftfahrzeugbundesamt in Germany, ANTS in France, DGT in Spain). Access levels vary by country.
   - **Australia:** Check state registries (e.g., VicRoads, Service NSW, Queensland TMR).
4. **Stolen-vehicle check.** Run the VIN and plate against: NICB VINCheck (US stolen), national stolen-vehicle databases (e.g., stolenwagen.nl for Netherlands, the-police.uk for UK), and Interpol's SMV database (law-enforcement access only). Document all queries and results.
5. **History report.** Pull a comprehensive vehicle history report (NMVTIS in the US, HPI Check in the UK, Carfax where available). Document: title history, odometer readings (check for rollback inconsistencies), accident/damage records, salvage/total-loss brands, number of previous owners, states/jurisdictions of registration, and lien records.
6. **Image corroboration.** Use Google Lens and Bing Visual Search to reverse-search vehicle images. Look for: the same vehicle appearing in other listings (indicating possible cloning or fraud), social-media posts showing the vehicle, and marketplace listings (AutoTrader, eBay Motors, Mobile.de) matching the plate or VIN. Use Plate Recognizer API (free tier) to extract plates from additional images for cross-referencing.
7. **Listing and marketplace search.** Search AutoTempest, CarGurus, Mobile.de, eBay Motors, and local classifieds for the VIN or plate number. Vehicle listings often reveal seller information, location, and additional photos that can corroborate or contradict claims.
8. **Toll-transponder analysis (if lawful access available).** Where ETC/E-ZPass metadata is legally available (e.g., subpoenaed records), analyse: transponder ID, plate correlation, timestamped toll-plaza crossings, and route reconstruction. Note jurisdictional limits — toll data is regulated and generally requires legal process.
9. **Document findings.** Record: plate (with jurisdiction), VIN decoded fields, registry query results, stolen-vehicle status, title history, odometer trajectory, image-search matches, marketplace listings, and any corroboration or contradictions found.

## Interpreting results

- **Title brands** (salvage, rebuilt, flood, lemon) indicate significant damage history. A "clean" title does not guarantee no damage — brands vary by state and some states have lenient branding requirements.
- **Odometer inconsistencies** (lower readings on newer titles) suggest rollback fraud. Cross-reference mileage at each title transfer.
- **Multiple state registrations** in a short period may indicate title washing — moving a vehicle to a state with weaker branding requirements to remove a salvage brand.
- **Plate mismatches** between the physical plate and the registered plate for the VIN may indicate plate cloning (duplicating a legitimate plate on a stolen vehicle) or improper transfer.
- **Vehicle cloning** (same VIN and plate on two different physical vehicles) is a known fraud pattern. Corroborate with physical characteristics (colour, trim, mileage) from the registry versus observed condition.
- **Stolen-vehicle database hits** are high-confidence indicators. Absence from databases does not guarantee the vehicle is not stolen — reporting lags and jurisdiction gaps exist.
- **Toll-transponder data** provides movement patterns but only at toll points; gaps do not mean the vehicle did not travel — it may have used non-tolled routes.

## Common false positives

- **Same make/model/colour at same location.** A vehicle image match based solely on colour and model is weak — many vehicles share these attributes. Require plate or VIN match for high confidence.
- **Plate transfer between vehicles.** Plates are sometimes legally transferred between vehicles by the same owner. A plate lookup returns the currently registered vehicle, which may differ from the vehicle in a historical photograph.
- **VIN transposition errors.** VINs use characters that are easily confused (0/O, 1/I). A single-character error produces a different vehicle's record. Always double-check VIN entry.
- **Outdated registry data.** Registration databases have update lags. A vehicle may show as registered to a previous owner if the transfer was recent.
- **Stolen-vehicle database lag.** Reports take time to propagate to national and international databases. A recent theft may not yet appear.
- **International plate confusion.** Similar plate formats exist across countries (e.g., white plates with black text in many EU states). Confirm the issuing country before querying national databases.

## Anti-patterns

- **Accessing restricted law-enforcement vehicle databases without authorisation.** NCIC (US), PNC (UK), and equivalent national police databases require law-enforcement credentials. Unauthorised access is a criminal offence.
- **Tracking an identified individual's vehicle in real time without lawful basis.** Continuous plate-reader surveillance of a specific person is regulated as surveillance, not OSINT. Ensure legal basis.
- **Publishing full plate numbers in reports without redaction.** Partially redact plates in public-facing reports (e.g., `AB12 C••`) unless the plate is already widely public.
- **Assuming a plate lookup identifies the driver.** The registered owner is not necessarily the driver at any given time. Do not conflate vehicle ownership with presence.
- **Relying on a single source for vehicle history.** NMVTIS, Carfax, and state DMV records can have gaps. Cross-reference multiple sources for critical investigations.
- **Ignoring jurisdictional privacy law.** Vehicle registration data is personal data in most jurisdictions (GDPR in EU, DPPA in US). Access and processing must comply with applicable law.
- **Treating toll-transponder data as comprehensive movement tracking.** Toll data only captures toll-point crossings, not all travel. Do not infer absence of travel from absence of toll records.

## Cross-references

- Related domains: geoint.md (vehicle geolocation from imagery), social-media.md (vehicle photos posted online), person-investigation.md (subject vehicle ownership)
- Pivot playbooks: ../pivot-playbooks/photo-to-location.md (vehicles in geolocation), ../pivot-playbooks/username-to-identity.md (marketplace seller identity)
- Ethics: ../../ethics/privacy-guidelines.md, ../../ethics/jurisdiction-rules.md, ../../ethics/legal-frameworks.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml