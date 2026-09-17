# Research brief: instruments of Telugu folk music

You are researching musical instruments used in the folk music of Andhra Pradesh and Telangana for a university
folk-music archive website (B.Tech project "Folk Music of Andhra Pradesh and Telangana"). Each instrument will get
its own public web page. Accuracy matters more than volume: everything you write must come from sources you actually
read. Never invent facts, names, dates, rituals or quotes.

## What to find for each instrument
1. Correct names: English/romanised name(s) and the Telugu script name (verify spelling, e.g. from Telugu Wikipedia
   or reputable Telugu-language sources). Other regional names.
2. What it is: type/classification (e.g. frame drum, friction drum, double-reed wind), size, appearance.
3. How it is made: materials (wood, skin, gourd, bamboo, metal...), how it is built and tuned, who makes it.
4. How it is played: posture, sticks/fingers, techniques, typical ensemble.
5. Cultural practices and beliefs: rules about making or playing it (for example: materials that must be used, it
   must be made by a certain community, worship/puja before playing, heating the skin over fire before a
   performance, taboos, who may or may not play it, rituals, legends about its origin). Look specifically for these.
6. Where it is used: which communities, which songs and performance traditions (e.g. Oggu Katha, Burrakatha,
   Jamukula Katha, Bonalu, jataras, weddings, funerals, dances), which region/districts.
7. Current state: endangered? notable living/historic players (only if a source names them).
8. Media:
   - Images: ONLY freely licensed images from Wikimedia Commons. Search with the API, e.g.
     curl -s "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=20&format=json&srsearch=Dappu+drum"
     and get licence details with
     curl -s "https://commons.wikimedia.org/w/api.php?action=query&titles=File:NAME.jpg&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json"
     Record the file page URL, a 1200px thumb URL, author (Artist), licence short name and licence URL, and what the
     photo shows. Only keep images that clearly show THIS instrument. If there is no free image, leave the list empty.
   - Sound: YouTube videos (or Commons audio) in which you can clearly hear/see the instrument being played
     (solo, demonstration, documentary or performance). Verify each video exists and allows embedding with
     curl -s -o /dev/null -w "%{http_code}" "https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=VIDEO_ID"
     (200 = OK; anything else = don't use). Record URL, title, channel, and one sentence on what the viewer hears.
     Prefer reputable channels (Sahapedia, IGNCA, Doordarshan/Prasar Bharati, state culture departments, news
     channels, well-known artists). 1-3 videos per instrument.

Good sources: Sahapedia, IGNCA, Sangeet Natak Akademi, state culture/tourism departments, The Hindu, Deccan
Chronicle, Telangana Today, The New Indian Express, Times of India, academic papers/theses (Shodhganga), books
(Google Books), museum catalogues, Wikipedia (English and Telugu) as a starting point but confirm key facts elsewhere.
Use WebSearch and WebFetch (and curl via Bash for the APIs above). Aim for 3+ independent sources per instrument.

## Output: one JSON file per instrument
Write to /tmp/claude-1000/-home-lokesh-Downloads-folk-music-telugu-website/7a4488b1-e2ce-4f35-b09b-f718feddff9c/scratchpad/instrument-research/<id>.json
(id = lowercase-hyphenated romanised name, e.g. "dappu", "pillana-grovi"). Valid UTF-8 JSON, Telugu written directly:

{
  "id": "dappu",
  "nameEn": "Dappu",
  "nameTe": "డప్పు",
  "otherNames": [{"en": "Palaka", "te": "పలక"}],
  "category": "drum | wind | string | idiophone",
  "classification": "Frame drum (membranophone)",
  "regions": ["Telangana", "Andhra"],
  "communities": ["Madiga"],
  "summary": "One or two plain sentences for the instrument card.",
  "sections": {
    "about": ["Paragraph with citation markers like [1][3]."],
    "construction": ["..."],
    "playing": ["..."],
    "cultural": ["..."],
    "usage": ["..."]
  },
  "traditions": ["Dappu dance", "Bonalu"],
  "facts": [{"label": "Materials", "value": "..."}, {"label": "Played with", "value": "..."}],
  "images": [{"filePage": "...", "imageUrl": "...", "author": "...", "license": "CC BY-SA 4.0", "licenseUrl": "...", "shows": "..."}],
  "videos": [{"url": "https://www.youtube.com/watch?v=...", "title": "...", "channel": "...", "what": "..."}],
  "audio": [{"filePage": "...", "url": "...", "author": "...", "license": "..."}],
  "sources": [{"title": "...", "publisher": "...", "url": "..."}],
  "uncertain": ["Anything you could not confirm, conflicting accounts, spelling doubts."]
}

Rules for the text:
- Write clear, neutral, readable English for the general public (no hype). 1-4 paragraphs per section; leave a section
  as an empty list if you found nothing reliable. Put [n] citation markers (1-based index into "sources") at the end
  of sentences/paragraphs they support. Every paragraph needs at least one marker.
- Only include an instrument if you find real evidence that it is used in Telugu folk traditions of Andhra Pradesh or
  Telangana. If an assigned instrument turns out to be the same as another (e.g. two names for one instrument), make
  one file and explain in "uncertain" / your final reply.
- Respect communities: describe caste/community associations factually and respectfully, as sources do.

## Final reply
List the files you wrote, one line each with how confident you are, plus: instruments you came across that belong
to Telugu folk music but were NOT in your assignment (name + one-line evidence + source URL), so they can be researched
next. Do not run heavy local programs (the user's laptop overheats); only web requests and small JSON files.
