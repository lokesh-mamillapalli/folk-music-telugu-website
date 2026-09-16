"""Check andhra-songs/content/NNN.json files.

Usage: python3 andhra-songs/validate_content.py [001 002 ...]   (no args = all songs)
"""
import csv, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
TELUGU = re.compile(r"[ఀ-౿]")

songs = {r["no"]: r for r in csv.DictReader(open(f"{ROOT}/songs.csv", encoding="utf-8-sig"))}
wanted = sys.argv[1:] or sorted(songs)
problems = 0

for no in wanted:
    errs = []
    lyrics = open(f"{ROOT}/lyrics/{no}.txt", encoding="utf-8").read().rstrip("\n").split("\n")
    path = f"{ROOT}/content/{no}.json"
    if not os.path.exists(path):
        print(f"{no}: MISSING content file")
        problems += 1
        continue
    try:
        data = json.load(open(path, encoding="utf-8"))
    except Exception as exc:
        print(f"{no}: INVALID JSON - {exc}")
        problems += 1
        continue

    if data.get("no") != no:
        errs.append(f"'no' is {data.get('no')!r}")
    title_te = data.get("titleTe", "")
    if not title_te or not TELUGU.search(title_te):
        errs.append("titleTe missing or not Telugu")
    tr = data.get("translation")
    if not isinstance(tr, list):
        errs.append("translation is not a list")
    else:
        if len(tr) != len(lyrics):
            errs.append(f"translation has {len(tr)} lines, lyrics have {len(lyrics)}")
        for i, line in enumerate(tr):
            if not isinstance(line, str) or not line.strip():
                errs.append(f"translation line {i + 1} empty")
            elif TELUGU.search(line):
                errs.append(f"translation line {i + 1} contains Telugu script")
    s_en = data.get("summaryEn", "")
    s_te = data.get("summaryTe", "")
    words_en = len(s_en.split())
    if words_en < 80 or words_en > 300:
        errs.append(f"summaryEn has {words_en} words (want 80-300)")
    if TELUGU.search(s_en):
        errs.append("summaryEn contains Telugu script")
    te_chars = len(TELUGU.findall(s_te))
    if te_chars < 250:
        errs.append(f"summaryTe too short or not Telugu ({te_chars} Telugu chars)")
    extra = set(data) - {"no", "titleTe", "translation", "summaryEn", "summaryTe"}
    if extra:
        errs.append(f"unexpected keys {sorted(extra)}")

    if errs:
        problems += 1
        print(f"{no}: " + "; ".join(errs))
    else:
        print(f"{no}: OK ({len(lyrics)} lines, summaryEn {words_en} words)")

print(f"\n{len(wanted) - problems}/{len(wanted)} OK")
sys.exit(1 if problems else 0)
