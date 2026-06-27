# Case Study: Bellingcat's MH17 Investigation

## Background

On 17 July 2014, Malaysia Airlines flight MH17, a Boeing 777-200ER flying from Amsterdam to Kuala Lumpur, was destroyed by a surface-to-air missile over eastern Ukraine. All 298 people on board were killed. The Ukrainian government attributed the downing to Russian-backed separatists using a Buk surface-to-air missile system. The Russian government denied involvement and offered alternative explanations, including a Ukrainian Su-25 attack aircraft and a Ukrainian Buk. In the absence of an agreed international investigation acceptable to all parties, an open-source investigation led by Bellingcat and a wider community of citizen-journalists produced what is now the most thoroughly documented open-source attribution in modern history.

The investigation, conducted over more than five years and culminating in the 2022 report *The Buk That Downed MH17*, traced a specific Russian Buk missile system (serial number 312, later supplemented by 332) from its depot in Russia, across the border into Ukraine, to a field south of Snizhne from which the launch was conducted, and back across the border into Russia — minus one missile. The work was cited in the Dutch-led Joint Investigation Team (JIT) findings and informed the 2022 murder convictions in absentia by the District Court of The Hague.

## OSINT methodology applied

The MH17 investigation is the canonical reference for the Bellingcat methodology (see `../knowledge/methodologies/bellingcat-methodology.md`). Bellingcat's methodology codifies what was previously tacit knowledge: collect everything publicly posted, verify everything against geography and time, attribute by convergence of independent signals, and publish the underlying evidence so the work can be reproduced.

The investigation applied the methodology with rare discipline:

- **Collection.** The investigators scraped social media (VKontakte, Twitter, Instagram, YouTube) for posts originating from separatist-controlled areas of eastern Ukraine in the days surrounding the downing. Soldiers and volunteers posted photographs of military convoys, selfies with vehicles, and status updates that recorded locations and timestamps. Russian state media footage was also collected.
- **Verification.** Every image was verified through reverse image search (to detect prior circulation), through geolocation (to confirm the location claimed), and through metadata extraction (where available) to confirm timestamp. Photographs of the launch site were geolocated to a field near the village of Pervomaiske, south of Snizhne.
- **Pivoting.** Each verified image became a pivot. A photograph of a Buk in a convoy became a search for other photographs of the same convoy — matched by vehicle damage patterns, license plates, and the position of stenciled numbers. A vehicle number became a search across Russian-language social media for posts showing the same vehicle in Russia. The convoy's route was reconstructed by chaining geolocated photographs taken at different times by different photographers.
- **Attribution.** The Buk was traced to the 53rd Anti-Aircraft Missile Brigade of the Russian Armed Forces, based in Kursk. The attribution rested on unit patches visible in soldier photographs, the documented deployment of the brigade's vehicles, and the route reconstructions showing the vehicles entering Russia from Kursk.
- **Dissemination.** Bellingcat published each pivot with its underlying evidence — the photographs, the geolocation coordinates, the social media posts. The transparency allowed independent verification and made the investigation difficult to refute.

## Key OSINT findings

- **The launch site.** Geolocated to a field near Pervomaiske, south of Snizhne, based on matching terrain features in published photographs of the launch smoke plume against satellite imagery and Yandex Maps panoramas.
- **The route into Ukraine.** Reconstructed through a chain of geolocated photographs showing the Buk convoy crossing the Russian-Ukrainian border near the village of Krasnodon in the early hours of 17 July 2014.
- **The route within separatist territory.** Tracked through photographs posted by local residents and separatist fighters showing the convoy at Luhansk, Krasnodon, Torez, and Snizhne.
- **The vehicle identification.** The Buk's transport-loader vehicle was identified by its unique damage pattern (a missing side-mirror, a specific dent) across multiple photographs, and by stenciled markings matching those photographed on vehicles belonging to the 53rd Brigade in Kursk.
- **The return to Russia.** Photographs of the Buk convoy returning to Russia on the evening of 17 July, with the launcher visible and one missile missing, were geolocated to a different border crossing near the village of Dyakove.
- **The unit identification.** The 53rd Anti-Aircraft Missile Brigade attribution rested on the convergence of vehicle markings, route origination at the Kursk depot, prior deployment records of the brigade, and soldier social media posts matching the brigade's location and personnel.
- **Russian state media contradiction.** The Russian Ministry of Defense's press briefing, which presented satellite imagery allegedly showing a Ukrainian Buk near Zaroshchenske, was falsified by Bellingcat's geolocation work — the satellite imagery was shown to have been altered and the alleged location did not match the published terrain.

## Tools and sources used

- **VKontakte** — `https://vk.com/` — primary source of soldier and volunteer social media posts.
- **Twitter / X** — `https://twitter.com/` — real-time posting by residents and journalists.
- **Yandex Maps / panoramas** — `https://yandex.com/maps/` — Russian-language street view, more comprehensive than Google Street View for rural eastern Ukraine.
- **Google Earth Pro** — `https://www.google.com/earth/` — satellite imagery and historical-imagery timeline for geolocation.
- **Google Reverse Image Search, TinEye, Yandex Image Search** — reverse image search for verification.
- **SunCalc** — `https://www.suncalc.org/` — sun-position analysis for timestamp verification.
- **Bellingcat's Online Investigation Toolkit** — curated registry of geolocation tools.
- **Court filings from the District Court of The Hague** — `https://www.courtofthehague.org/` — published evidence chain.

## Lessons for the agent

The MH17 investigation teaches an autonomous agent that **OSINT attribution is a graph problem, not a single-identification problem.** The investigation did not rest on identifying a single soldier or a single vehicle; it rested on the convergence of dozens of independently-verified images, each chained to the next by terrain matching, vehicle damage, route continuity, and time-of-day consistency. An agent performing attribution must treat each finding as a node in a graph, not as a standalone conclusion. A single match — a single reverse image search hit, a single facial recognition match — is an investigative lead, not an attribution.

The investigation also teaches the discipline of **evidence publication.** Bellingcat's work was durable because every claim was published with its supporting artifacts. An autonomous agent that produces attribution claims without publishing the underlying source URLs, image hashes, and geolocation coordinates is producing unverifiable product. The agent should default to embedding source URLs and observation timestamps in every finding block, even when the user did not explicitly request them.

Finally, the agent should internalize the **false-positive discipline** demonstrated here. Bellingcat repeatedly rejected identifications that could not be independently corroborated — a soldier who looked like another soldier, a vehicle that resembled another vehicle. Each rejection was documented. An autonomous agent should adopt the same standard: when a facial recognition result, a metadata match, or a vehicle identification cannot be corroborated by an independent signal, the agent labels it "Unverified" and does not promote it. The cost of a false attribution in a real-world investigation is reputational and sometimes legal. The agent's default posture must be conservative.

## Attribution

- Bellingcat. *MH17 — The Open Source Investigation, Three Years On.* `https://www.bellingcat.com/category/mh17/`
- Bellingcat. *The Buk That Downed MH17.* `https://www.bellingcat.com/news/uk-and-europe/2018/05/25/the-buk-that-downed-mh17-three-years-on/`
- Bellingcat. *Origin of the Separatist Buk.* `https://www.bellingcat.com/wp-content/uploads/2015/10/Origin-of-the-Separatists-Buk-A-Bellingcat-Forward-Trace-25-October-2015.pdf`
- District Court of The Hague. *MH17 Trial Judgment.* 17 November 2022. `https://www.gerechtshof-denhaag.nl/`
- Joint Investigation Team. Public statements and evidence summaries via the Dutch Public Prosecution Service. `https://www.om.nl/`
- Higgins, Eliot. *We Are Bellingcat.* Bloomsbury, 2021.
