import csv, os, re, shutil

PROJECT = "/home/lokesh/Downloads/folk-music-telugu-website"
SRC = f"{PROJECT}/telangana_songs"
OUT = f"{PROJECT}/telangana-songs"

TELUGU_RANGE = re.compile("[" + chr(0x0C00) + "-" + chr(0x0C7F) + "]")

# ---- 1. parse CSV ----
rows = [r for r in csv.DictReader(open(f"{PROJECT}/Telangana Folk Songs.csv", encoding="utf-8-sig")) if r["S. No."].strip()]
csv_by_num = {int(r["S. No."]): r for r in rows}
assert len(csv_by_num) == 103, len(csv_by_num)

# ---- 2. parse lyrics file ----
text = open(f"{SRC}/telangana_songs_lyrics.txt", encoding="utf-8").read()
blocks = re.split(r"\n(?=Song-\d+\s*:)", text)

HEADER_TE = re.compile(r"^\s*Telugu (?:Script|Lyrics)\s*\([^)]*\)\s*$", re.M)
HEADER_EN = re.compile(r"^\s*English Transliteration\s*$", re.M)

lyrics_by_num = {}
mismatches = []
for block in blocks:
    m = re.match(r"Song-(\d+)\s*:\s*(.*)", block)
    if not m:
        continue
    num = int(m.group(1))
    title = m.group(2).strip()

    m_te = HEADER_TE.search(block)
    m_en = HEADER_EN.search(block)
    assert m_te and m_en, f"song {num}: missing header(s)"
    te_part = block[m_te.end():m_en.start()]
    en_part = block[m_en.end():]

    te_lines = [l.strip() for l in te_part.split("\n") if l.strip()]
    en_lines = [l.strip() for l in en_part.split("\n") if l.strip()]
    # Song 004 labels its chorus "(Chorus/Pallavi):" (the chorus words follow on the next line);
    # use the same label the other songs use.
    te_lines = ["పల్లవి:" if l == "(Chorus/Pallavi):" else l for l in te_lines]
    # A few lines end with a stray "---" separator from the source document.
    te_lines = [re.sub(r"\s*-{3,}\s*$", "", l) for l in te_lines]
    en_lines = [re.sub(r"\s*-{3,}\s*$", "", l) for l in en_lines]
    en_lines = ["Pallavi (Chorus):" if l == "(Chorus/Pallavi):" else l for l in en_lines]
    if len(te_lines) != len(en_lines):
        mismatches.append((num, title, len(te_lines), len(en_lines)))

    non_telugu = [l for l in te_lines if not TELUGU_RANGE.search(l)]
    bad = [l for l in non_telugu if not re.fullmatch(r"\(.*\):?", l)]
    assert not bad, f"song {num}: unexpected non-Telugu line(s) in Telugu section: {bad}"
    if non_telugu:
        print(f"note: song {num} ({title}) uses a bracketed repeat-marker instead of repeating the Telugu text: {non_telugu[0]!r} x{len(non_telugu)}")

    lyrics_by_num[num] = {"title": title, "te": te_lines, "tr": en_lines}

if mismatches:
    print(f"\n{len(mismatches)} song(s) have a different number of Telugu lines and transliteration lines")
    print("(the site falls back to showing each layer as its own block for these; see REVIEW-NOTES.md):")
    for num, title, te_n, en_n in mismatches:
        print(f"  {num:3} {title[:40]:40} telugu={te_n} transliteration={en_n}")

assert set(lyrics_by_num) == set(csv_by_num), (set(csv_by_num) - set(lyrics_by_num), set(lyrics_by_num) - set(csv_by_num))

# ---- 3. match audio files by numeric prefix ----
audio_by_num = {}
for name in os.listdir(SRC):
    if not name.endswith(".mp3"):
        continue
    m = re.match(r"(\d+)_", name)
    assert m, f"unexpected audio filename: {name}"
    audio_by_num[int(m.group(1))] = name
assert set(audio_by_num) == set(csv_by_num), (set(csv_by_num) - set(audio_by_num), set(audio_by_num) - set(csv_by_num))

# ---- 4. write output folder, mirroring andhra-songs/ ----
# Keep values added after the first build (Telugu titles, artist/album/year research).
previous = {}
if os.path.exists(f"{OUT}/songs.csv"):
    previous = {r["no"]: r for r in csv.DictReader(open(f"{OUT}/songs.csv", encoding="utf-8-sig"))}

for sub in ("audio", "lyrics", "transliteration"):
    os.makedirs(f"{OUT}/{sub}", exist_ok=True)

csv_rows = []
for num in sorted(csv_by_num):
    no = f"{num:03d}"
    row = csv_by_num[num]
    ly = lyrics_by_num[num]

    src_audio = f"{SRC}/{audio_by_num[num]}"
    dst_audio = f"{OUT}/audio/{no}.mp3"
    if os.path.exists(dst_audio):
        os.remove(dst_audio)
    try:
        os.link(src_audio, dst_audio)
    except OSError:
        shutil.copy2(src_audio, dst_audio)

    open(f"{OUT}/lyrics/{no}.txt", "w", encoding="utf-8").write("\n".join(ly["te"]) + "\n")
    open(f"{OUT}/transliteration/{no}.txt", "w", encoding="utf-8").write("\n".join(ly["tr"]) + "\n")

    csv_rows.append({
        "no": no,
        "titleTe": previous.get(no, {}).get("titleTe", ""),
        "titleEn": row["Song Name"].strip(),
        "category": row["Genre"].strip(),
        "artist": previous.get(no, {}).get("artist", ""),
        "album": previous.get(no, {}).get("album", ""),
        "year": previous.get(no, {}).get("year", ""),
        "sourceUrl": row["Source"].strip(),
        "audioFile": f"{no}.mp3",
        "originalAudioFile": audio_by_num[num],
        "lyricsLines": len(ly["te"]),
        "transliterationLines": len(ly["tr"]),
    })

with open(f"{OUT}/songs.csv", "w", encoding="utf-8-sig", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(csv_rows[0].keys()))
    w.writeheader()
    w.writerows(csv_rows)

print(f"\nsongs: {len(csv_rows)}")
total_lines = sum(r["lyricsLines"] for r in csv_rows)
print(f"total lyric lines: {total_lines}")
for c in csv_rows[:8] + csv_rows[-3:]:
    print(c["no"], c["titleEn"][:34].ljust(34), c["category"][:16].ljust(16), c["lyricsLines"], "|", c["originalAudioFile"])
