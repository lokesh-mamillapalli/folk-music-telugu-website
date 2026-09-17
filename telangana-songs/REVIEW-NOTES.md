# Telangana songs: review notes

All 103 songs have Telugu lyrics, the supplied English transliteration, a line-by-line English translation,
English and Telugu "About this song" notes, and a Telugu title (`content/NNN.json`, titles copied into `songs.csv`).
`python3 validate_content.py` reports 103/103 OK.

## Please check first

### Song 068: lyrics you supplied, with corrected words
The source file had song 069's lyrics under **068 Oorumu Thunnadhi**. They are now replaced, in the source file too,
with the Telugu lyrics you supplied, split into a pallavi, five verses and an ending. The "[పాట వాయిద్యం]" music
markers are left out. The transliteration, translation and notes are new, and 068 is no longer in `skip.txt`.

The supplied text read like a transcript of the recording. With your OK, these likely mis-heard words were
corrected in the Telugu lyrics, the transliteration and the English. They were not checked against the audio, so
listen for them when you play the song:

| Where | Was | Now |
|---|---|---|
| Verse 1 | బాంబుల బల్లువ పేలలాఆఆఆ | బాంబులు భళ్ళున పేలగా |
| Verse 2 | భారతీయుల మంత | భారతీయులమంతా |
| Verse 2 | పిప్పి కాలా, చిత్తు కాలా (×2) | పిప్పి కాదా, చిత్తు కాదా |
| Verse 2 | ఊరుకుతున్నది | ఉరుకుతున్నది |
| Verse 2 | చలువయ్యకుండంత | చల్లారకుండా అంత |
| Verse 3 | శేవాళ్లతోని (×2) | శవాలతోని |
| Verse 4 | భారత ప్రజలా (×2) | భారత ప్రజల |
| Verse 4 | వెడతవు | పెడతవు |
| Verse 4 | ప్రాణ జీపాన్ని | ప్రాణ దీపాన్ని |
| Verse 5 | బగ్గుబగ్గన్నయి | భగ్గుభగ్గుమన్నయి |
| Verse 5 | మురితీస్తామన్నయి | ఉరితీస్తామన్నయి |
| Verse 5 | చావుకాయము | చావు ఖాయము |

To change any line, edit the Song-68 block in `telangana_songs/telangana_songs_lyrics.txt` (Telugu and
transliteration), run `python3 scripts/build-telangana-songs.py`, and update `content/068.json`. After the import,
the admin editor works too.

The notes name the attacks the lyrics refer to: Lumbini Park, Hyderabad (2007); Parliament, Delhi (2001); and the
Oberoi and Taj hotels, Mumbai (November 2008).

### Songs 028 and 026 are film songs, and 004 has the wrong title
- **028 Rangamma Mangamma** is from the Telugu film *Rangasthalam* (2018). Our recording (358 s) is not the film
  soundtrack version (251 s), so no singer is filled in.
- **026 Nanu Kottakuro Thittakuro** is from the film *Family Circus* (2001), music by R. P. Patnaik.
- **004 "Erra Jenda"**: the lyrics never mention an erra jenda (red flag). They are Guda Anjaiah's revolutionary song
  **"Ooru Manadira" (ఊరు మనదిరా)**, which was used in the film *Erra Sainyam* (1994), and the recording's length
  matches that film's video. The title was not changed; consider renaming the song "Ooru Manadira".

Decide whether the film songs belong in the archive.

### Song 008 is probably not in Telugu
**008 Saasu Hamara** appears to be in Gor Boli, the Banjara (Lambadi) language, written in Telugu script. Several of
its English lines are best guesses, and its "About" note says so. The artist search supports this: the same
recording is released and uploaded as a Banjara song ("Sasu Eamara Sasu" by Booda Paramesh, Banjara Videos).

### Categories that may not fit the lyrics
Categories come from your CSV. The translators noticed two that don't seem to match, and they are unchanged:
**081 Poru Bandaru** is listed as Protest but is a courtship exchange; **082 Andariki Amma** is listed as Family but
reads as a Koya tribal dance song. **068 Oorumu Thunnadhi**, a song against terrorism, stays in Social Justice as you
decided.

### Correction: song 004 (Erra Jenda)
An earlier version of these notes said this song's chorus text was missing. That was wrong. The source used the
heading "(Chorus/Pallavi):" six times, and the chorus words are written out on the line after each heading. Those
headings are now "పల్లవి:" / "Pallavi (Chorus):", like every other song, and the build script applies the same
change if it is re-run.

## Songs that also exist in the Andhra collection (kept, as you decided)
Songs **072–084** come from the JioSaavn album *Old Is Gold Janapada Geethalu*. Nine of them are the same recordings
as Andhra songs 016–024: Kallu Muntha, Rela Re, Lalaguda Lambadola, Seta Seta, Botla Botla, Yeniyallo, Poru Bandaru,
Panta Senu, Gajala Edla Bandi. The other four (Jampandu Pillo, Vayyari Bama Ro, Bapanolla Pilla, Andariki Amma) are
new. All 13 are kept as Telangana songs. On import, the nine Telangana copies get their own web addresses ending in
"-telangana" (for example `kallu-muntha-telangana`), so the Andhra pages are not overwritten.

## Artist, album and year
Artists are filled in for 80 of the 103 songs. The website doesn't require an artist: songs without one simply don't
show a "Sung by" line or appear on the Artists page. Album and year are filled in only for the first 40 below.

- **044–059** (16 songs): JioSaavn album *SUPERHIT Telangana Folk Songs* (2021), singers as JioSaavn lists them.
- **072–084** (13 songs): JioSaavn album *Old Is Gold Janapada Geethalu* (2010).
- **093–103** (11 songs): *Vimalakka Hits* (2023) by **Vimalakka**, confirmed track by track with the iTunes API.
- **40 more songs** (added later, table below): found by searching YouTube, JioSaavn and iTunes for each song and
  keeping only versions whose length matches our audio file, so the credit belongs to this recording and not to
  another singer's version of the same song. Most archive.org files turned out to be downloads of specific YouTube
  uploads, whose titles or descriptions name the singer.

**Confirmed** means the length matches within 3 seconds and the source names the singer. **Likely** (002, 034, 035, 064)
means the evidence is good but not exact; the reason is in the table. Please listen to the likely ones if you can.

| No. | Artist | | Evidence |
|---|---|---|---|
| 001 | Kousalya | Confirmed | YouTube upload titled 'Singer Kousalya ... Aaku Pacha Chandamama', 311 s (ours 311 s) [source](https://www.youtube.com/watch?v=eQW5O-0xoeA) |
| 002 | Gaddar | Likely | YouTube upload 'Amma Telanganama Akali Kekala Gaanama (Gaddar)', 598 s (ours 594 s) [source](https://www.youtube.com/watch?v=vyo5JeXOVBI) |
| 003 | Kodari Sreenu | Confirmed | YouTube upload 'Asaidula Haarati by Kodari Sreenu', 411 s (ours 411 s) [source](https://www.youtube.com/watch?v=VRLtJsVKBbw) |
| 007 | Vadlakonda Anil Kumar | Confirmed | Two uploads 'O Raye Maradala', 246 s (ours 246 s), 'Singer: V Anil kumar', lyricist Pattipati Ramanakar [source](https://www.youtube.com/watch?v=WJXT1GO2kIs) |
| 008 | Booda Paramesh | Confirmed | Official release 'Sasu Eamara Sasu' by Booda Paramesh (lyricist Banoth Janakiram), 424 s (ours 424 s) [source](https://www.youtube.com/watch?v=sEbde0XFMu0) |
| 011 | Vimalakka | Confirmed | YouTube upload 'Veera Kishora Veera Kishora - Vimalakka Songs', 430 s (ours 430 s) [source](https://www.youtube.com/watch?v=8VFt7izyWRE) |
| 012 | Matla Tirupathi, Ramadevi, Aruna, Venu | Confirmed | YouTube upload 'Andala Deviki Garbam ayyindo', 301 s (ours 300 s), singers listed [source](https://www.youtube.com/watch?v=q1iCGUaj61Y) |
| 013 | Ramadevi | Confirmed | JioSaavn 'Atta O Atta' by Ramadevi, 322 s (ours 322 s); official release 'Atho Oo Atha' (Anilkumar, Ramadevi) 322 s |
| 015 | Jadala Ramesh | Confirmed | TeluguOne upload 'Attaru Saibo Raaraa ... Jadala Ramesh', 257 s (ours 256 s) [source](https://www.youtube.com/watch?v=gtwD7aUJ5x8) |
| 016 | Vadlakonda Anil Kumar | Confirmed | V6 Dhoom Thadaka performance by Vadlakonda Anil and team, 320 s (ours 319 s) [source](https://www.youtube.com/watch?v=pWUzQeQxVyg) |
| 017 | Vadlakonda Anil Kumar | Confirmed | YouTube upload 'Erra Chira Katukuna Pilla', 322 s (ours 321 s), 'Singer Vadlakonda Anil Kumar' [source](https://www.youtube.com/watch?v=hu2t3I0d7JQ) |
| 018 | Vadlakonda Anil Kumar | Confirmed | TeluguOne upload 'Gal Gal Sappulla Gajulu Thestane | by Vadlakonda Anil', 281 s (ours 281 s) [source](https://www.youtube.com/watch?v=Zj-DCM7WYx0) |
| 021 | Peddapuli Eshwar | Confirmed | TeluguOne upload 'Gunna Gunna Mamidi ... Peddapuli Eshwar', 317 s (ours 317 s) [source](https://www.youtube.com/watch?v=OlIFSl5xinI) |
| 023 | Gidde Ram Narsaiah | Confirmed | V6 Dhoom Thadaka performance by Gidde Ram Narsaiah and team, 477 s (ours 477 s) [source](https://www.youtube.com/watch?v=puaBLIu7mWo) |
| 025 | Ramadevi | Confirmed | YouTube upload 'Na Andam chudo bavayyo', 362 s (ours 362 s), 'Singer: Ramadevi' [source](https://www.youtube.com/watch?v=wrKkMqvjGYc) |
| 029 | Jangi Reddy | Confirmed | TeluguOne upload 'Rava Rava Yellammaku | by Jangi Reddy', 278 s (ours 277 s) [source](https://www.youtube.com/watch?v=qOMXBO1pzF8) |
| 030 | Telu Vijaya | Confirmed | JioSaavn 'Regurthi Thallalla' by Telu Vijaya (album Singarala Chinnadi), 296 s (ours 295 s); YouTube upload names Telu Vijaya, 295 s |
| 031 | Gidde Ram Narsaiah | Confirmed | TeluguOne upload 'Sara Saramma Sara ... Gidde Ram Narasaiah', 387 s (ours 387 s) [source](https://www.youtube.com/watch?v=vJLjepgcCJc) |
| 033 | Jangi Reddy, Sunitha | Confirmed | TeluguOne upload 'Tella Cheera Tella Raika | by Jangi Reddy, Sunitha', 205 s (ours 204 s) [source](https://www.youtube.com/watch?v=MiFZz4uw09s) |
| 034 | Vadlakonda Anil Kumar, Swarna | Likely | Official release 'Edike Pilla Singari Rajitha' by Vadlakonda Anil Kumar and Swarna, 257 s (ours 262 s); the song is a man-woman duet [source](https://www.youtube.com/watch?v=3w3RrkBIDt0) |
| 035 | Vadlakonda Anil Kumar | Likely | Official release 'Egili Varanga' by Vadlakonda Anil Kumar, 210 s (ours 214 s); the woman's voice is not credited [source](https://www.youtube.com/watch?v=LHUMT-NLkWw) |
| 036 | Chinthala Yadagiri | Confirmed | Official release 'Yemantu Cheppane Yeruvaaka' by Chinthala Yadagiri, 415 s (ours 415 s) [source](https://www.youtube.com/watch?v=8wScwopdUp8) |
| 037 | Chinthala Yadagiri | Confirmed | Official release 'Vuru Viduvamannadi Karuvu' by Chinthala Yadagiri, 328 s (ours 327 s) [source](https://www.youtube.com/watch?v=Id-jqNmVVps) |
| 038 | Chinthala Yadagiri | Confirmed | Official release 'Ratanala Rasullo Rajole' by Chinthala Yadagiri, 403 s (ours 402 s) [source](https://www.youtube.com/watch?v=IRU336dBK00) |
| 039 | Chinthala Yadagiri | Confirmed | JioSaavn and iTunes 'O Palle Na Thalli Kalpavalli' by Chinthala Yadagiri, 332 s (ours 331 s) |
| 040 | Chinthala Yadagiri | Confirmed | JioSaavn 'Appula Badha Talaleka' by Chinthala Yadagiri, 327 s (ours 327 s) |
| 041 | Chinthala Yadagiri | Confirmed | JioSaavn 'Pachani Ma Palletooru' by Chinthala Yadagiri, 626 s (ours 624 s) |
| 042 | Chinthala Yadagiri | Confirmed | Official release 'Entha Cheppina Teeru Raithanna' by Chinthala Yadagiri, 314 s (ours 314 s) [source](https://www.youtube.com/watch?v=Dy2aWyvC_os) |
| 043 | Chinthala Yadagiri | Confirmed | Official release 'Krru Uudipoindi Nagali Bandamtho' by Chinthala Yadagiri, 451 s (ours 450 s) [source](https://www.youtube.com/watch?v=RPFNokZonAQ) |
| 060 | Gaddam Ramesh | Confirmed | JioSaavn album Jagore: 'Adavilona Thirige' by Gaddam Ramesh, 293 s (ours 292 s) [source](https://www.jiosaavn.com/album/jagore/QTpbLTX6Owg_) |
| 061 | Garjana | Confirmed | JioSaavn album Jagore: 'Illidisi Ellipothunna' by Garjana, 327 s (ours 329 s); official release 328 s [source](https://www.youtube.com/watch?v=S3ElMyXe2Ho) |
| 062 | S. V. Mallik Teja, Swarna | Confirmed | JioSaavn album Jagore: 'Muddula Bavayyo' by S.V. Mallik Teja and Swarnalatha (Swarna), 273 s (ours 271 s) [source](https://www.jiosaavn.com/album/jagore/QTpbLTX6Owg_) |
| 063 | Swarna | Confirmed | Label upload 'Arataku Lanti' (Sri Vishwa Audios), 'Singer: Swarna', 469 s (ours 468 s) [source](https://www.youtube.com/watch?v=COatrOVfIK4) |
| 064 | Akunuri Devaiah | Likely | JioSaavn album Jagore: 'Vadagandla Vana' by Akunuri Devaiah, 295 s (ours 277 s); the other five songs of this jukebox are all on Jagore [source](https://www.jiosaavn.com/album/jagore/QTpbLTX6Owg_) |
| 065 | Gaddam Ramesh | Confirmed | JioSaavn album Jagore: 'Emi Dubai' by Gaddam Ramesh, 253 s (ours 252 s) [source](https://www.jiosaavn.com/album/jagore/QTpbLTX6Owg_) |
| 087 | Shankar | Confirmed | JioSaavn album Amma Rave Devi Rave (2017): 'Gubha Gubha Guggilalu' by Shankar, 179 s (ours 181 s) |
| 089 | D. Sarangapani | Confirmed | JioSaavn album Pedama antaru Durgama antaru (2017): 'Podham Padhe Jatharo' by D. Sarangapani, 283 s (ours 281 s) |
| 090 | Shankar, Ramesh | Confirmed | JioSaavn album Jubilee Hills Peddamma (2016): 'Yeduru Leni' by Shankar and Ramesh, 388 s (ours 387 s) |
| 091 | Ramesh | Confirmed | JioSaavn albums Amma Rave Devi Rave (2017) and Jubilee Hills Peddamma (2016): 'Amma Rave Devi Rave' by Ramesh, 183 s (ours 183 s) |
| 092 | Ramesh, Ramu | Confirmed | JioSaavn albums Amma Rave Devi Rave (2017) and Bonalama Bonalu (2016): 'Dandalu Dandalu' by Ramesh and Ramu, 311-314 s (ours 312 s) |

Still blank (23 songs), because no source could be matched to our recording, the sources disagree, or you chose to
leave the song without an artist:

| No. | Why |
|---|---|
| 004 | Left blank at your request. The recording appears to be the film version of "Ooru Manadira" (see above), whose soundtrack credits S. P. Balasubrahmanyam. |
| 005 | The matching upload (339 s) is a 2013 title-song video that names only its dancers; released versions by Veddepally Srinivas and Lalitha Sagari are 11 s longer. |
| 006 | No upload with a matching length names a singer. |
| 009 | The closest credited version (B. Susheela and Banda Venkanna, 279 s) is 8 s longer, so probably a different recording. |
| 010 | Two credited versions match the length: "Singer Swamy" (249-250 s) and Matla Thirupathi (248 s). Listening is the only way to tell. |
| 014 | The matching upload (346 s) has no credits. |
| 019 | No credited version with a matching length. |
| 020 | The matching upload (298 s) has no credits. |
| 022 | Credited versions have different lengths: Peddapuli Eshwar and Lalitha Sagari (214 s), Prashanth and Usha Sri (241 s). |
| 024 | The length matches releases with different credits: Gujja Srinivas (2004 album) and Vadlakonda Anil Kumar (2025 releases). |
| 026 | Left blank at your request. It is the film song from *Family Circus* (2001); the soundtrack credits R. P. Patnaik and Lenina Chowdary. |
| 027 | The matching V6 Dhoom Thadaka performance (242 s) says only "folk singer and her team". |
| 028 | The film version by M. M. Manasi is 251 s; ours is 358 s, so it is a different recording. |
| 032 | The length matches a 2025 release credited to Jadala Ramesh, but a 2004 album credits Vadlakonda Anil Kumar and Anthadpula Ramadevi, and the same two sources disagree on 024 as well. |
| 066-071 | From a 2016 Lalithaa Audios compilation; the matching re-uploads have no credits. |
| 085 | Releases credit different singers (Laxman, N. Ganesh Rao, Srishilam). |
| 086 | Releases credit different singers (Ramesh and Ramu; Ramesh and Eshwar; P. N. Lingaraju). |
| 088 | Releases credit different singers (Ramesh and Eshwar; Laxman; P. N. Lingaraju). |

## Transliteration line counts that differ from the lyrics
In 8 songs the supplied transliteration is split into a different number of lines than the Telugu. It was left as
given (there's no reliable rule to re-split it). The translation always follows the Telugu lines, and the song page
shows the three versions as separate blocks for these songs. The import lists them as notes, not errors.

| No. | Song | Telugu lines | Transliteration lines |
|---|---|---|---|
| 008 | Saasu Hamara | 13 | 14 |
| 055 | Gunna Gunna Maavulla | 3 | 4 |
| 061 | Illidisi Yellipottunna | 4 | 8 |
| 062 | Muddula Bavayyo | 10 | 27 |
| 063 | Na Aratakulanti | 6 | 28 |
| 065 | Yemi Dubai Yemi | 11 | 24 |
| 067 | Ma Palle Yentho Muddhu | 8 | 5 |
| 070 | Ratanala Koduka Raara | 32 | 24 |

## Status
All 103 songs were imported to the website on 2026-09-17, with audio from Google Drive (`drive-files.csv`). To
change a song, edit these files and run `node scripts/import-songs.js telangana-songs` (test run), then add
`--apply`; or use the website's admin editor.

## Lines the translators were unsure about
Folk dialect has words that could not be pinned down. These are best readings; a Telugu speaker who knows the
Telangana dialect should look them over. Line numbers refer to `lyrics/NNN.txt`. Any line can be corrected later
through the website's admin editor.

### Songs 003–012
- 008 "Saasu Hamara" appears to be in Gor Boli (the Banjara/Lambadi language) written in Telugu script, not Telugu; its "About" note says so and several lines are best guesses (L1 "సవాల్ దేఖే", L2 "ఛోడ్ కోని", L4 "లుడితి" = ladle?, L6/L8 "ఇచ్చాడ కాడియే" / "హరమత లేరి", L10/L12 "దాలేన ముతౌ కర" / "బుగలి ఘరాన మారు కేరి")
- 003 L6 "రుద్ర ధారు": read as "a wrathful torrent"
- 003 L12 "కోచాలు": "fence-sitters", guessed from context
- 003 L18 "నాజీలను వంచినోళ్ళం": left literal ("brought the Nazis to their knees")
- 004 L11 "సబ్బెట": unknown word, guessed "crowbar"
- 004 L15 "పాలి నుండి అమ్మ దాక": "from the farmhand to the mother" — "పాలి" uncertain
- 005 L3–4 "మందులోడా": "medicine man"; could also be Telangana slang for "boozer"
- 006 L4 "సెంగో పిల్లా" kept as sung; "బవురుపొలేశాలు" read as bahurupa veshalu ("false faces")
- 009 L3 "వచ్చిపోర తెనాలి": unsure how Tenali fits
- 009 L6, L9 "సరసాల లింగేశం సయ్యంటి యమ పాశం", "నా సంత నిండినోడా": uncertain
- 010 L4 "పువ్వాదిన పెట్టి రాయే": "put a flower in your hair and come" (guess)

### Songs 013–030
- 028 "Rangamma Mangamma" looks like the film song from Rangasthalam (2018), not a traditional folk song — worth checking whether it belongs in the archive (left in; summary doesn't mention it)
- 013, 014: speaker tags use family roles ("Daughter-in-law:", "Mother-in-law:", "Son-in-law:") as in the source; in 013 lines 4 and 8 the source's speaker labels seem to be on the wrong lines (translated as labelled)
- 013 L3, L5, L7: curses/insults guessed ("jettalu putta", "nallikutloda", "deeni bonda uruga")
- 014 L3, L9, L10, L11/15/16: several guesses ("enchigaada", "olisi pukkukunta", "entha menattanu nenu", "soorelukalu unna")
- 015 L3 "ektanu" unknown (kept as "ekta"); L1 sender unclear; closing "naameke" unclear
- 016 L1 "aakallu dubballu", "coffee jonnalu"; L7 "jetti pattamu" (big town, or an ornament?)
- 018 L2 "bangaaru puchu jadalu": "braids with golden tassels"
- 020: unclear whether Golla Mallamma is the daughter-in-law or mother-in-law (read as daughter-in-law)
- 022 L3–4 "geesukontiva / geeki geeki", "baarishaala" = the bar
- 027 (single line) "naayi dhoro", "peddolla gundello nilichivi": ambiguous
- 028 L3, L5; 029 L1: unclear phrases / who mounts the chariot
- A stray "---" separator at the end of one Telugu line in 018 and in 027 (from the source document) has been removed

### Songs 031–045
- 031 L2 "naatu battalu kattaalo": read as "bind it up in coarse country cloth" (part of the brewing)
- 032 L1 "sinnamga / sannamga poyeti": taken as "walking softly / daintily"
- 032 L2–4 "...lev giraaki": "giraaki" read as "so dear / in such demand"
- 033 L1 "tellavaaranga taanama": "taanama" read as "a bath?"
- 033 L2 "naalugu gottanga": "as the clock strikes four"
- 033 L3 "chengulaara tuvvaala": very unclear, "my towel with the fringed ends"; second half read as the girl's retort (least certain line in this batch)
- 034 L11 "aalu lenide solu lenide": rhyming idiom, "with no wife yet and nothing settled"
- 034 L17 "aitaara macchi": guessed "so come on then, dear"
- 035 L2 "anumaanamu aagulavonu": read as a curse, "curse this suspicion of yours"
- 035 L15 "chettoda nee dinaalu gaanu", "nalla mokapoda": read as insults/curses
- 036 L1 "Eruvaka" kept as a name (first-ploughing season); "eti paata" read as "what song", not "river song"
- 037 L1, L5 "goodu vidavamannadi vadhuvu": "vadhuvu" (bride) doesn't fit; rendered "the burden" — please check
- 039 L4 "nuvvu leni bathukamma": "a life without you, mother"; summary notes a possible pun on the Bathukamma festival
- 042 L1 "entha cheppina theeru": "theeru" taken as "never end"
- 043 L4 "praanam teeyaka bathakalenayya": "I cannot go on living, sir, except by taking my own life"

### Songs 046–070
- 047 L1 and chorus "డబుల్ రంగు బిల్లింగంట": read as "double-coloured trim"
- 047 L5 "లస్కోరోడు": "Lashkar fellow" (Secunderabad), may be other slang
- 048 L3 "ఆలుల చూపులు తిప్పని సుందరి": "the beauty no one could take their eyes off"
- 049 L1, L2, L5, L7, L9, L15, L17: much of this song looks garbled in the source (village names apparently written down by ear); several lines are loose guesses
- 061 L2 "ఈత కొట్టినాది కుంది": కుంది read as a pond (కుంట)
- 063 L1 "ఆ అలు": read as అ ఆ లు ("my first letters")
- 066 L3: looks garbled; loose rendering
- 067 L7 "సిందువ హోరులు": "the din of the Chindu dancers"; "సై అంటూ" unclear
- 069 L5 "పాలపర్తి పొంతపొదలు", "వునికి కనికి": guessed as "the thickets of Palaparthi" and tuniki/kanuga trees
- 070 L18 "నీ అవ్వ సేత పువ్వు": literal "flower in your mother's hand"; may have meant బువ్వ (food)
- 070 L28 "గుండెవురు అయింది": "my heart is choking", uncertain

### Songs 071–080
- 071 L1 "ఓరి ఆద్యా" taken as a name; L4 "గిడుకు" = "gadget" (guess); L6 "కానైపోదటు", "పిల్లు" = phone bill (guess)
- 072/073/076 "Jampandu" refrain "నాలప్పరి సెండు" / "నా లబ్బరి సెంటు": "my lavender scent", uncertain
- 072 L1 "జారుకుంట రేపి పాటికీ"; L4 "వజ్జో వో పిల్లా": readings uncertain
- 073 refrain "సుక్కెంట పక్కకు చాప తునకెత్తిన బస్సు వోలె": tentative parse (చాప = fish)
- 074 L7 "రేపు చుక్కా వెలుగ మొక్కా": "we'll bow as the morning star shines"
- 075 L4, L6, L8: several passages reconstructed; guesses
- 076/077 "పలకమాను" treated as a place name; "బున్నాలు" unidentified ("trinkets")
- 076 title: titleTe set to "సెట సెట" to match titleEn, though 076's lyrics spell it "చిట చిట"
- 076 L4 "ఎత్తు భలే ఏరు వాకా": may refer to ఏరువాక
- 077 L5 "తుడి దారు చిన్న దాన"; 077/078 "ఒగలుమారి చిరుకు చూపులే": approximate
- 072–078 are medleys that reuse each other's verses (e.g. 073 and 076 reuse the Jampandu Pillo verses) — this is in the source, not a copying error

### Songs 081–086, 096–103
- Category in songs.csv may not fit the lyrics: 081 is listed as Protest but the lyrics are a courtship exchange; 082 is listed as Family but reads as a Koya tribal dance song. Categories left as given; summaries mention it.
- 081 L1–4 "తమ్మా కాపుల గంగూ", "మామ కొడుక సాయి": names/readings uncertain
- 082 L5 "నరజాతినే నమ్మవద్దు" (probably outsiders); L7 "సమర చెంచు" (Samara may mean Savara)
- 084 L2, L4 "పైడి మోక లేరే దానా", "చెమ్మడు రెమ్మలు": partly unidentified
- 096 L2 / 101 L3 "ఆయేటి వోనంగా": "as the year begins"; 096 L7 uncertain
- 097 "సుద్దరోళ్ళ అవ్వ": "mother of us Shudra folk"; L4–5 ambiguous
- 098 L5, L9: least clear passages, guesses
- 100 L4, L7, L10, L13: several guesses; "అన్నపు డెబ్బై" read as the 1/70 Act (tribal land law)
- 101 L3–7: several guesses
- Summaries add short common-knowledge context: 086 Lashkar = Secunderabad; 099 Kaloji Narayana Rao and "Naa Godava"; 101 Jalayagnam irrigation programme; 100 the 1/70 Act
