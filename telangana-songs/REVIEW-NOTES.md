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

### Song 028 may be a film song
**028 Rangamma Mangamma** appears to be the song from the Telugu film *Rangasthalam* (2018), not a traditional folk
song. It is included as given; decide whether it belongs in the archive.

### Song 008 is probably not in Telugu
**008 Saasu Hamara** appears to be in Gor Boli, the Banjara (Lambadi) language, written in Telugu script. Several of
its English lines are best guesses, and its "About" note says so.

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
Filled in for 40 songs from sources that name the singer; left blank for 63 rather than guessed. The website no
longer requires an artist: songs without one simply don't show a "Sung by" line or appear on the Artists page.

- **044–059** (16 songs): JioSaavn album *SUPERHIT Telangana Folk Songs* (2021), singers as JioSaavn lists them.
- **072–084** (13 songs): JioSaavn album *Old Is Gold Janapada Geethalu* (2010).
- **093–103** (11 songs): *Vimalakka Hits* (2023) by **Vimalakka**, confirmed track by track with the iTunes API.
- **001–035** (archive.org item `arrjp-t`): blank. The item names only its uploader, and the files have no artist tags.
- **036–043, 060–071, 085–092** (4 shared YouTube videos): blank. The channels (Cpim Telangana, Amulya Audios and
  Videos, Lalithaa Audios And Videos) are publishers, not the singers.

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

## Next steps
1. Upload `audio/001.mp3`–`audio/103.mp3` to Google Drive → `Telugu Folk Songs/Telangana`, run
   `drive-apps-script.js`, and put the resulting `drive-files.csv` in this folder.
2. `node scripts/import-songs.js telangana-songs` (test run, writes nothing), then add `--apply` to import.

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
