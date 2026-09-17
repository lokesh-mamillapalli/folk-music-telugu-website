# Instruments research: status (paused 17 September 2026)

Research was paused at the user's request. Everything gathered so far is saved in this folder.

## What is here

| Path | Contents |
|---|---|
| `research-json/` | 26 research files, one per instrument. The format is described in `BRIEF.md`. |
| `BRIEF.md` | The research brief the researchers followed: what to find, which sources, output format. |
| `sources/mikkilineni-1992-teluguvari-janapada-kalarupalu/` | Full text (164 chapters) of Mikkilineni Radhakrishna Murthy, *Teluguvari Janapada Kalarupalu* (Telugu University, 1992), from Telugu Wikisource. `INDEX.txt` lists the chapter titles. This is the richest single source on Telugu folk instruments. |
| `sources/wikipedia/` | Text of the Wikipedia articles the researchers consulted. |

Copies of news articles were not saved (copyright). Every source URL is listed inside each research file.

## On the website (local only, not published)

`scripts/site/instruments.json` is built from `research-json/` by `scripts/site/curate_instruments.py`. It holds **25 instruments**, and pages are generated in `instruments/`.

To rebuild after editing or adding research files:

```bash
python3 scripts/site/curate_instruments.py --write   # checks citations, Telugu names, required fields
python3 scripts/site/build_pages.py                  # regenerates instruments/*.html (and all other pages)
```

Add `--check-links` to the first command to test that every source URL still loads.

### Researched instruments

All 26 files pass the automatic checks: required fields, Telugu name, and a valid citation on every paragraph. Human review of the content is still pending, especially for the files written just before the pause.

| Type | Instrument | File | Notes |
|---|---|---|---|
| Drum | Dappu డప్పు | dappu.json | |
| Drum | Oggu ఒగ్గు | oggu.json | Oggu Katha. Overlaps with the "Oggu dolu" section of dolu.json. |
| Drum | Jamidika (Jamuku) జమిడిక | jamidika.json | |
| Drum | Pamba పంబ | pamba.json | Written just before the pause. |
| Drum | Tappeta తప్పెట | tappeta.json | Researcher's confidence: medium-high on the dance and customs, low on construction. The Tappeta Gullu chest drum is not the same as the dappu, although dictionaries use "tappeta" for the dappu. |
| Drum | Gummeta గుమ్మెట | gummeta.json | Confidence: high on its role, medium on material. Sources conflict on clay vs brass/bronze and on one vs two skins. |
| Drum | Maddela మద్దెల | maddela.json | Confidence: medium. The construction section is thin. |
| Drum | Dolu డోలు | dolu.json | Confidence: high on temple/wedding (mangala vadyam) use, medium on tribal use. |
| Drum | Tudumu తుడుము | tudumu.json | Confidence: medium. Rests largely on one account (M. A. Rauf, quoted by Mikkilineni). Koya use not confirmed. |
| Drum | Gumela గుమేళా | gumela.json | Gond. |
| Drum | Parra పర్ర | parra.json | Gond. |
| Drum | Vette (Turbuli) వెట్టె | vette.json | Gond. |
| String | Kinnera కిన్నెర | kinnera.json | Reviewed in detail: well sourced. |
| String | Burra Veena బుర్ర వీణ | burra-veena.json | The Burrakatha instrument. |
| String | Tambura తంబుర | tambura.json | |
| String | Kikri కిక్రి | kikri.json | Pardhan/Thoti fiddle of the Gonds. Published version. |
| String | Kingri కింగ్రి | kingri.json | **Duplicate** of Kikri from a second researcher. Kept for reference and excluded from the website. Merge any useful details into kikri.json. |
| Wind | Sannayi (Nadaswaram) సన్నాయి | sannayi.json | |
| Wind | Pillana Grovi పిల్లనగ్రోవి | pillana-grovi.json | Written just before the pause. |
| Wind | Pepre పెప్రే | pepre.json | Gond. |
| Wind | Kalikom కాలికోం | kalikom.json | Gond. Written just before the pause. |
| Bells & clappers | Chirutalu చిరుతలు | chirutalu.json | |
| Bells & clappers | Talalu తాళాలు | talalu.json | |
| Bells & clappers | Andelu అందెలు | andelu.json | |
| Bells & clappers | Kolatam Karralu కోలాటం కర్రలు | kolatam-karralu.json | |
| Bells & clappers | Chekkalu చెక్కలు | chekkalu.json | Chekka Bhajana. |

## Not finished

These were assigned but no file was written before the pause:

- **Budabukka** బుడబుక్క (Budabukkala community drum)
- **Pungi** పుంగి (snake charmer's gourd pipe; another source also mentions a "poongi" in Chindu Bhagotam)
- **Kommu / Kahala** కొమ్ము / కాహళ (horns and trumpets)
- **Shankham** శంఖం (conch)
- **Ektara** ఏకతార
- **Gajjelu** గజ్జెలు (ankle bells)
- **Jeganta** జేగంట (gong/bells of Jangam singers)

Dropped for lack of evidence: **Nagara** నగారా. It only appears in passing: the Mathura community of Adilabad play it at Gokulashtami, it is used at stick and sword-fighting displays, and the medieval play *Kridabhiramam* mentions "nagara dollu" in Veerabhadra processions.

## Leads: instruments found during research, not yet researched

From the Andhra drums researcher. Unless another source is given, the evidence is a chapter of Mikkilineni (1992) (see `sources/.../INDEX.txt`).

- **Runja రుంజ**: big drum of the Runja performers who serve the Viswabrahmins. A troupe exists at Draksharamam. Chapter "గంభీర నినాదం రుంజ వాయిద్యం".
- **Veeranam / Veerangam వీరణం**: "like a big dolu". Used in Veeranatyam, Veerabhadra rites, Golla suddulu and Oggu katha. Chapters "వీరనాట్యమే వీరుల కొలుపు" and "సుద్దులు చెప్పే గొల్లసుద్దులు".
- **Kiridi కిరిడి**: clay drum played with two sticks in Dhimsa (Araku valley). Also **Mori మోరి** (wind) and **Jodu kommu జోడుకొమ్ము** (paired horns). Chapters "గిరిజనుల సంగీత వాయిద్యాలు" and "అరకులోయలో, ఆదిమవాసుల నృత్యాలు". Also Deccan Chronicle, 2 Dec 2024: https://www.deccanchronicle.com/southern-states/andhra-pradesh/dhimsa-dancers-seek-recognition-as-artists-1843171
- **Tribal instruments described by M. A. Rauf** (chapter "గిరిజనుల సంగీత వాయిద్యాలు"):
  - Daggudu: Savara drum used at deaths and ancestral rites
  - Tapna: Raj Gond frame drum
  - Tabor: clay-bodied finger drum of the Araku valley
  - Gogod-rajan: Savara bowed fiddle with a coconut-shell body
- **Tasha / Tashamarfa తాషామార్ఫా**: drum in Veeranatyam and the Veeramushti stick fights. Chapter "వీరశైవపు వీరముష్ఠి వారు".
- **Kommu bakalu**: curved brass or copper horns blown by Budige Jangams at weddings. Chapter "బుడిగె వాయిద్యకారులే బుడిగె జంగాలు".
- **Titti తిత్తి**: used by the Pichhukuntla storytellers. Chapter "ఇంటింటా గోత్రాలు చెప్పే పిచ్చుకుంటులవారు".
- **Tokkudu billa**: foot clappers in Tholu Bommalata. https://te.wikipedia.org/wiki/తోలుబొమ్మలాట
- **Mukhaveena**: used in Tholu Bommalata. https://theprint.in/pageturner/excerpt/telling-mythological-tales-with-shadow-puppets-andhra-pradeshs-tholu-bommalata/1859414/

Useful tool for Telugu names: the AndhraBharati dictionary search, `https://andhrabharati.com/dictionary/index.php?w=<word>`, covers Sabdaratnakaram, Brown and dialect dictionaries.

## Paused by the user

- **Photos and videos/recordings for each instrument.** The research files have empty `images`, `videos` and `audio` lists. Any image used later must be freely licensed (e.g. Wikimedia Commons) and credited.
