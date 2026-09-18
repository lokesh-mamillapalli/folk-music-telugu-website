"""Put the project's own instrument photos (uploaded to Google Drive) onto the instrument pages.

Reads instrument-images/drive-files.csv (name,id — written by instrument-images/drive-apps-script.js),
matches each file to an instrument by its name (dappu.jpg -> dappu), and writes an `images` entry
pointing at the Drive thumbnail URL. Where a page already had a Wikimedia photo, the project's photo
replaces it; instruments with no photo in the CSV keep whatever they had.

The entry is marked `"source": "project"` and carries no author or licence, because where these photos
came from hasn't been established — see research/instruments/STATUS.md.

Usage: python3 scripts/apply-instrument-images.py [--apply]   (dry run without --apply)
"""
import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(ROOT, "research", "instruments", "research-json")
CSV_PATH = os.path.join(ROOT, "instrument-images", "drive-files.csv")
# Drive resizes to this width, which keeps a 900 KB original from being shipped to every visitor.
THUMB_WIDTH = 1200

# One line per photo, describing what is actually visible in it.
SHOWS = {
    "andelu": "A pair of andelu — hollow metal rings struck together to keep time",
    "burra-veena": "A burra veena player holding the gourd-resonated instrument",
    "chekkalu": "Wooden chekkalu clappers fitted with metal jingles",
    "chirutalu": "A pair of chirutalu — wooden clappers with metal jingles",
    "dappu": "A dappu frame drum",
    "dolu": "A pair of dolu barrel drums",
    "gumela": "Gumela pot drums, laced with cord",
    "gummeta": "Gummeta pot drums with skin heads",
    "jamidika": "Jamidika players in a procession",
    "kalikom": "A kalikom horn being blown at a festival",
    "kikri": "A seated kikri player with the bowed fiddle",
    "kolatam-karralu": "A pair of decorated kolatam sticks",
    "maddela": "A maddela, laced along the length of the barrel",
    "oggu": "An oggu drum decorated for performance",
    "pamba": "A pair of pamba drums in their stand",
    "pillana-grovi": "A bamboo pillana grovi flute",
    "sannayi": "A sannayi (nadaswaram), the double-reed pipe",
    "talalu": "A pair of talalu — hand cymbals of bell metal",
    "tambura": "A tambura, the shoulder-held string drone",
    "tappeta": "Tappeta gullu dancers with drums tied to the chest",
}


def main():
    apply = "--apply" in sys.argv
    rows = list(csv.DictReader(open(CSV_PATH, encoding="utf-8-sig")))
    replaced, added, problems = [], [], []

    for row in rows:
        name, drive_id = row["name"].strip(), row["id"].strip()
        inst_id = os.path.splitext(name)[0]
        path = os.path.join(RESEARCH, f"{inst_id}.json")
        if not os.path.exists(path):
            problems.append(f"{name}: no instrument called {inst_id!r}")
            continue
        if not SHOWS.get(inst_id):
            problems.append(f"{name}: no caption written for {inst_id!r}")
            continue
        data = json.load(open(path, encoding="utf-8"))
        had = data.get("images") or []
        entry = {
            "imageUrl": f"https://drive.google.com/thumbnail?id={drive_id}&sz=w{THUMB_WIDTH}",
            "driveId": drive_id,
            "driveFile": name,
            "shows": SHOWS[inst_id],
            "source": "project",
        }
        (replaced if had else added).append(f"{inst_id} ({name})")
        if apply:
            data["images"] = [entry]
            json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # What still has a Wikimedia photo afterwards: pages with an image that this CSV doesn't cover.
    from_csv = {os.path.splitext(r["name"].strip())[0] for r in rows}
    kept = []
    for path in sorted(os.listdir(RESEARCH)):
        data = json.load(open(os.path.join(RESEARCH, path), encoding="utf-8"))
        images = data.get("images") or []
        if images and data["id"] not in from_csv and images[0].get("source") != "project":
            kept.append(data["id"])

    print(f"Drive photos: {len(rows)}")
    print(f"  replacing a Wikimedia photo ({len(replaced)}): {', '.join(sorted(replaced))}")
    print(f"  first photo for the page ({len(added)}): {', '.join(sorted(added))}")
    print(f"  Wikimedia photo kept, no replacement sent ({len(kept)}): {', '.join(sorted(kept))}")
    for p in problems:
        print("  PROBLEM:", p)
    print("\nwritten" if apply else "\ndry run — nothing written; pass --apply")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
