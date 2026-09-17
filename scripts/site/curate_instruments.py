"""Validate instrument research files and assemble scripts/site/instruments.json.

Research files live in research/instruments/research-json/ (one JSON per instrument, format in
research/instruments/BRIEF.md). Then rebuild the pages with scripts/site/build_pages.py.

Usage: python3 scripts/site/curate_instruments.py [--check-links] [--write]
"""
import concurrent.futures as cf
import glob
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
RESEARCH = os.path.join(ROOT, "research", "instruments", "research-json")
OUT = os.path.join(HERE, "instruments.json")
# Research files kept for reference but not published (e.g. duplicates of another page).
EXCLUDE = {"kingri"}  # same instrument as kikri.json, which has more sources
TELUGU = re.compile(r"[ఀ-౿]")
CATEGORIES = {"drum", "wind", "string", "idiophone"}
REGIONS = {"Andhra", "Telangana"}
SECTIONS = ["about", "construction", "playing", "cultural", "usage"]
KEEP = ["id", "nameEn", "nameTe", "otherNames", "category", "classification", "regions", "communities",
        "summary", "sections", "traditions", "facts", "sources", "uncertain"]


def check(inst, path):
    errs, warns = [], []
    for key in ["id", "nameEn", "nameTe", "category", "summary", "sections", "sources"]:
        if not inst.get(key):
            errs.append(f"missing {key}")
    if inst.get("id") and os.path.basename(path) != f"{inst['id']}.json":
        warns.append("file name differs from id")
    if inst.get("nameTe") and not TELUGU.search(inst["nameTe"]):
        errs.append("nameTe has no Telugu script")
    if inst.get("category") not in CATEGORIES:
        errs.append(f"bad category {inst.get('category')!r}")
    bad_regions = set(inst.get("regions", [])) - REGIONS
    if bad_regions:
        warns.append(f"regions normalised from {sorted(bad_regions)}")
    n_sources = len(inst.get("sources", []))
    paragraphs = 0
    for section in SECTIONS:
        for para in (inst.get("sections") or {}).get(section, []):
            paragraphs += 1
            markers = [int(m) for m in re.findall(r"\[(\d+)\]", para)]
            if not markers:
                errs.append(f"{section}: paragraph without citation: {para[:60]}…")
            for m in markers:
                if m < 1 or m > n_sources:
                    errs.append(f"{section}: citation [{m}] out of range (sources={n_sources})")
    if paragraphs == 0:
        errs.append("no paragraphs")
    if not (inst.get("sections") or {}).get("about"):
        warns.append("no 'about' section")
    for s in inst.get("sources", []):
        if not str(s.get("url", "")).startswith("http"):
            errs.append(f"source without URL: {s.get('title')}")
    return errs, warns, paragraphs


def normalise_regions(regions):
    out = []
    for r in regions or []:
        low = r.lower()
        if "andhra" in low or "rayalaseema" in low or "coastal" in low:
            key = "Andhra"
        elif "telangana" in low:
            key = "Telangana"
        else:
            continue
        if key not in out:
            out.append(key)
    return out


def link_status(url):
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0 (link check)"})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        return exc.code
    except Exception as exc:
        return type(exc).__name__


def main():
    check_links = "--check-links" in sys.argv
    write = "--write" in sys.argv
    files = sorted(glob.glob(os.path.join(RESEARCH, "*.json")))
    curated, total_errs = [], 0
    for path in files:
        try:
            inst = json.load(open(path, encoding="utf-8"))
        except Exception as exc:
            print(f"✗ {os.path.basename(path)}: invalid JSON ({exc})")
            total_errs += 1
            continue
        if inst.get("id") in EXCLUDE:
            print(f"- {inst.get('id')}: kept in research, not published (see EXCLUDE)")
            continue
        errs, warns, paragraphs = check(inst, path)
        status = "✗" if errs else "✓"
        print(f"{status} {inst.get('id')}: {inst.get('nameEn')} / {inst.get('nameTe')} [{inst.get('category')}] "
              f"{paragraphs} paragraphs, {len(inst.get('sources', []))} sources")
        for e in errs:
            print("    ERROR", e)
        for w in warns:
            print("    warn ", w)
        total_errs += len(errs)
        if not errs:
            clean = {k: inst.get(k) for k in KEEP if inst.get(k) not in (None, "", [])}
            clean["regions"] = normalise_regions(inst.get("regions"))
            clean["sections"] = {k: v for k, v in (inst.get("sections") or {}).items() if k in SECTIONS and v}
            curated.append(clean)

    if check_links:
        urls = sorted({s["url"] for inst in curated for s in inst.get("sources", [])})
        with cf.ThreadPoolExecutor(8) as ex:
            results = dict(zip(urls, ex.map(link_status, urls)))
        bad = {u: c for u, c in results.items() if not (isinstance(c, int) and c < 400)}
        print(f"\nlinks checked: {len(urls)}, not OK: {len(bad)}")
        for u, c in bad.items():
            print(f"    {c}  {u}")

    ids = [i["id"] for i in curated]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        print("DUPLICATE ids:", dupes)
    print(f"\n{len(curated)} valid instrument(s), {total_errs} error(s)")
    if write:
        json.dump(curated, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print("wrote", OUT)


if __name__ == "__main__":
    main()
