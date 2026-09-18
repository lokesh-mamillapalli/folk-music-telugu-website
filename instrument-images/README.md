# Instrument photos: upload to Drive

Your 20 photos from `images/`, renamed so each file name is the instrument's page id. `MANIFEST.csv`
lists what came from where, with each photo's size.

## What to do

1. In Google Drive, open your existing **Telugu Folk Songs** folder and create a folder inside it
   called **Instruments**.
2. Upload everything in `upload/` into it — all 20 files, names unchanged. The file name is the only
   thing that maps a photo to its page, so `dappu.jpg` must stay `dappu.jpg`.
3. Open <https://script.google.com>, New project, paste `drive-apps-script.js`, and run
   `listInstrumentImages` (same as you did for the songs).
4. It writes `drive-files.csv` into that Drive folder. Download it, put it in this folder, and tell me —
   I'll put the photos on the pages.

## What changes on the site once the links are in

| | Instruments |
|---|---|
| **Your photo replaces the Wikimedia one** (12) | chekkalu, dappu, dolu, gumela, gummeta, kikri, kolatam-karralu, maddela, oggu, sannayi, talalu, tambura |
| **Your photo is the first one** (8) | andelu, burra-veena, chirutalu, jamidika, kalikom, pamba, pillana-grovi, tappeta |
| **Keeps its Wikimedia photo** (2) | kinnera, tudumu — you didn't send a replacement for these |
| **Still has no photo** (3) | parra, pepre, vette |

That takes the archive from 14 of 25 instruments with a photo to 22 of 25. The four videos (kinnera,
kolatam-karralu, oggu, tambura) are unaffected.

## Two things to look at first

**Some photos are small.** They'll fill roughly an 800px-wide slot on the page, so anything under about
600px wide will look soft, and `oggu.png` (170×170) will look bad — it's smaller than the thumbnail it
has to fill. Worth replacing these if you can find bigger versions:

| Photo | Size |
|---|---|
| oggu.png | 170×170 |
| kalikom.jpg | 250×407 |
| gumela.png | 451×545 |
| tambura.jpg | 452×678 |
| andelu.jpg | 500×285 |
| pillana-grovi.jpg | 500×142 |
| dolu.jpg | 500×500 |
| kikri.jpg | 534×718 |
| gummeta.jpg | 547×365 |

**Where the photos came from matters.** The site is public, and every photo on it currently carries a
credit and a free licence (that's why the Wikimedia ones were used). If these 20 were downloaded from
websites, they're probably still under someone's copyright, and publishing them without permission is a
real risk — the sort of thing that can get a complaint or a takedown, and it would sit oddly in a
university project that cites its sources everywhere else. Tell me which of these applies and I'll
handle the credits accordingly:

- you or your team took the photos → they're yours, I'll credit the project
- you have the photographer's permission → I'll credit them by name
- they came from websites/search results → safer to keep the Wikimedia ones where they exist, and use
  yours only for the instruments that have no free photo at all (with a "source unknown" note), or find
  free replacements

Raw photos aren't committed to git (`images/` and `instrument-images/upload/` are ignored), so nothing
is public yet either way.
