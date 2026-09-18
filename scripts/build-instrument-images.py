"""Arrange the user-supplied instrument photos in images/ for upload to Google Drive.

Copies each photo to instrument-images/upload/<instrument-id>.<ext>, so the file name is the
instrument's page id and nothing has to be matched up by hand later. The extension comes from the
file's real format (Pillow), not from whatever it was named, and every id is checked against
scripts/site/instruments.json so a typo can't create an orphan file.

Usage: python3 scripts/build-instrument-images.py
"""
import csv
import json
import os
import shutil

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images")
OUT = os.path.join(ROOT, "instrument-images")
UPLOAD = os.path.join(OUT, "upload")

# source file in images/  ->  instrument id (the id is also the page name, e.g. instruments/dappu.html)
MAPPING = {
    "andelu.jpg": "andelu",
    "burra_veena.jpg": "burra-veena",
    "chekkalu.jpg": "chekkalu",
    "chirutalu.jpg": "chirutalu",
    "dappu.jpg": "dappu",
    "dolu.jpg": "dolu",
    "gumela.png": "gumela",
    "gummeta.jpeg": "gummeta",
    "jamidika.jpg": "jamidika",
    "kalikom.jpg": "kalikom",
    "kikri.jpg": "kikri",
    "kolatam sticks.jpg": "kolatam-karralu",
    "maddela.png": "maddela",
    "oggu.png": "oggu",
    "pamba.jpeg": "pamba",
    "pilangrovi.jpg": "pillana-grovi",
    "Sannayi.jpg": "sannayi",
    "talalu.jpg": "talalu",
    "tambura.jpeg": "tambura",
    "tappeta gullu.jpg": "tappeta",
}
EXT = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp", "GIF": "gif"}
# Below this, the photo would look soft filling the ~800px-wide slot on an instrument page.
MIN_WIDTH = 600


def main():
    instruments = {i["id"]: i for i in json.load(open(os.path.join(ROOT, "scripts", "site", "instruments.json"), encoding="utf-8"))}
    unknown = sorted(set(MAPPING.values()) - set(instruments))
    assert not unknown, f"these ids are not instruments: {unknown}"
    missing = sorted(set(os.listdir(SRC)) - set(MAPPING) - {".DS_Store"})
    assert not missing, f"files in images/ with no mapping: {missing}"

    os.makedirs(UPLOAD, exist_ok=True)
    for stale in os.listdir(UPLOAD):
        os.remove(os.path.join(UPLOAD, stale))

    rows, small = [], []
    for source, inst_id in sorted(MAPPING.items(), key=lambda kv: kv[1]):
        path = os.path.join(SRC, source)
        with Image.open(path) as im:
            fmt, (width, height) = im.format, im.size
        ext = EXT.get(fmt)
        assert ext, f"{source}: unexpected image format {fmt}"
        target = f"{inst_id}.{ext}"
        shutil.copy2(path, os.path.join(UPLOAD, target))
        if width < MIN_WIDTH:
            small.append((target, width, height))
        rows.append({
            "instrumentId": inst_id,
            "file": target,
            "nameEn": instruments[inst_id]["nameEn"],
            "nameTe": instruments[inst_id]["nameTe"],
            "originalFile": source,
            "format": fmt,
            "width": width,
            "height": height,
            "kb": round(os.path.getsize(path) / 1024),
        })

    with open(os.path.join(OUT, "MANIFEST.csv"), "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    for row in rows:
        print(f"  {row['file']:24} {row['width']:>5}x{row['height']:<5} {row['kb']:>5} KB   <- {row['originalFile']}")
    print(f"\n{len(rows)} photo(s) ready in instrument-images/upload/")
    if small:
        print(f"\nLow resolution (under {MIN_WIDTH}px wide — will look soft on the page):")
        for name, width, height in small:
            print(f"  {name}  {width}x{height}")
    covered = set(MAPPING.values())
    print("\nInstruments with no photo in this batch:", ", ".join(sorted(set(instruments) - covered)) or "none")


if __name__ == "__main__":
    main()
