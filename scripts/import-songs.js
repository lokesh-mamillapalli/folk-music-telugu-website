#!/usr/bin/env node
/*
 * Import songs from a prepared folder into MongoDB.
 *
 *   node scripts/import-songs.js andhra-songs            # dry run: checks everything, writes nothing
 *   node scripts/import-songs.js andhra-songs --apply    # create/update the songs in the database
 *   node scripts/import-songs.js telangana-songs --apply # region is taken from the folder name,
 *                                                        # or pass --region=Andhra|Telangana
 *
 * Folder layout:
 *   songs.csv                      no,titleTe,titleEn,category,artist,album,year,sourceUrl,...
 *   lyrics/NNN.txt                 Telugu lyrics, one line per line
 *   transliteration/NNN.txt        same lines in English letters
 *   content/NNN.json               { no, titleTe, translation[], summaryEn, summaryTe }
 *   drive-files.csv                name,id  (Google Drive file id for NNN.mp3, from the Apps Script)
 *   skip.txt (optional)            song numbers to leave out for now, one per line: "068  reason"
 *
 * Songs are matched to existing records by slug (from the English title), so running it
 * again updates songs instead of duplicating them. If a song with the same slug already exists
 * in the OTHER region (the same recording can belong to both collections), this region's copy
 * gets its own slug with the region appended, e.g. "kallu-muntha-telangana".
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { Song, Category, slugify, normalizeAudioUrl } = require("../models");

const REGIONS = ["Andhra", "Telangana"];

function sourceLabel(url) {
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (host.includes("jiosaavn")) return "Listen on JioSaavn";
  if (host.includes("youtube") || host.includes("youtu.be")) return "Watch on YouTube";
  if (host.includes("archive.org")) return "Listen on the Internet Archive";
  if (host.includes("music.apple.com")) return "Listen on Apple Music";
  return "Original source";
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  return body.map((r) => Object.fromEntries(header.map((key, idx) => [key.trim(), (r[idx] || "").trim()])));
}

function readLines(file) {
  return fs
    .readFileSync(file, "utf8")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildSongs(folder, driveIds, region) {
  const skip = readSkipList(path.join(folder, "skip.txt"));
  const rows = parseCsv(fs.readFileSync(path.join(folder, "songs.csv"), "utf8")).filter((row) => !skip.has(row.no));
  const problems = [];
  const warnings = [];
  const slugs = new Map();
  const songs = [];

  rows.forEach((row) => {
    const no = row.no;
    const where = `${no} ${row.titleEn}`;
    const need = (rel) => {
      const file = path.join(folder, rel);
      if (!fs.existsSync(file)) {
        problems.push(`${where}: missing ${rel}`);
        return null;
      }
      return file;
    };

    const lyricsFile = need(`lyrics/${no}.txt`);
    const translitFile = need(`transliteration/${no}.txt`);
    const contentFile = need(`content/${no}.json`);
    if (!lyricsFile || !translitFile || !contentFile) {
      return;
    }

    const lyrics = readLines(lyricsFile);
    const translit = readLines(translitFile);
    let content;
    try {
      content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
    } catch (error) {
      problems.push(`${where}: content/${no}.json is not valid JSON (${error.message})`);
      return;
    }
    const translation = Array.isArray(content.translation) ? content.translation.map((l) => String(l).trim()) : [];

    if (translit.length !== lyrics.length) {
      // The song page shows the layers as separate blocks when counts differ, so this is not fatal.
      warnings.push(`${where}: transliteration has ${translit.length} lines, lyrics ${lyrics.length}`);
    }
    if (translation.length !== lyrics.length) {
      problems.push(`${where}: translation has ${translation.length} lines, lyrics ${lyrics.length}`);
    }
    if (translation.some((line) => !line)) {
      problems.push(`${where}: translation has empty lines`);
    }

    const titleTe = (row.titleTe || content.titleTe || "").trim();
    const summaryEn = String(content.summaryEn || "").trim();
    const summaryTe = String(content.summaryTe || "").trim();
    ["titleEn", "category"].forEach((key) => {
      if (!row[key]) {
        problems.push(`${where}: songs.csv column ${key} is empty`);
      }
    });
    if (!titleTe) problems.push(`${where}: no Telugu title`);
    if (!summaryEn) problems.push(`${where}: no English summary`);
    if (!summaryTe) problems.push(`${where}: no Telugu summary`);

    const audioName = row.audioFile || `${no}.mp3`;
    const driveId = driveIds ? driveIds.get(audioName) : null;
    if (driveIds && !driveId) {
      problems.push(`${where}: ${audioName} not found in drive-files.csv`);
    }

    const slug = slugify(row.titleEn);
    if (!slug) {
      problems.push(`${where}: English title gives an empty slug`);
    } else if (slugs.has(slug)) {
      problems.push(`${where}: same slug "${slug}" as song ${slugs.get(slug)}`);
    }
    slugs.set(slug, no);

    const links = [];
    if (/^https?:\/\//i.test(row.sourceUrl || "")) {
      const albumLabel = row.album ? ` — ${row.album}${row.year ? ` (${row.year})` : ""}` : "";
      links.push({ label: `${sourceLabel(row.sourceUrl)}${albumLabel}`, url: row.sourceUrl });
    }

    songs.push({
      no,
      doc: {
        slug,
        titleTe,
        titleEn: row.titleEn,
        region,
        category: row.category,
        artist: row.artist || "",
        album: row.album || "",
        year: row.year || "",
        lyrics: lyrics.join("\n"),
        lyricsTransliteration: translit.join("\n"),
        lyricsTranslation: translation.join("\n"),
        summaryEn,
        summaryTe,
        audioVersions: driveId
          ? [{ label: "Primary Audio", url: normalizeAudioUrl(`https://drive.google.com/file/d/${driveId}/view`) }]
          : [],
        links
      }
    });
  });

  return { rows, songs, problems, warnings, skip };
}

function readSkipList(file) {
  const skip = new Map();
  if (fs.existsSync(file)) {
    fs.readFileSync(file, "utf8").split("\n").forEach((line) => {
      const match = line.match(/^\s*(\d{3})\b\s*(.*)$/);
      if (match) {
        skip.set(match[1], match[2].trim());
      }
    });
  }
  return skip;
}

function readDriveIds(file) {
  if (!fs.existsSync(file)) {
    return null;
  }
  const map = new Map();
  parseCsv(fs.readFileSync(file, "utf8")).forEach((row) => {
    if (row.name && row.id) {
      map.set(row.name, row.id);
    }
  });
  return map;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const folder = path.resolve(args.find((arg) => !arg.startsWith("--")) || "andhra-songs");
  const driveArg = args.find((arg) => arg.startsWith("--drive="));
  const driveFile = driveArg ? path.resolve(driveArg.slice(8)) : path.join(folder, "drive-files.csv");

  const regionArg = args.find((arg) => arg.startsWith("--region="));
  const region = regionArg
    ? regionArg.slice(9)
    : REGIONS.find((r) => path.basename(folder).toLowerCase().includes(r.toLowerCase())) || "";
  if (!REGIONS.includes(region)) {
    console.error(`Could not tell the region from the folder name. Pass --region=${REGIONS.join("|")}`);
    process.exit(1);
  }

  const driveIds = readDriveIds(driveFile);
  const { rows, songs, problems, warnings, skip } = buildSongs(folder, driveIds, region);

  console.log(`Folder: ${folder}`);
  console.log(`Region: ${region}`);
  if (skip.size) {
    console.log(`Skipping ${skip.size} song(s) listed in skip.txt:`);
    skip.forEach((reason, no) => console.log(`  - ${no}${reason ? `: ${reason}` : ""}`));
  }
  console.log(`songs.csv rows: ${rows.length}, ready: ${songs.length}`);
  console.log(driveIds ? `Drive ids: ${driveIds.size} files listed in ${path.basename(driveFile)}` : `Drive ids: ${driveFile} not found`);

  if (!driveIds) {
    problems.push("drive-files.csv is missing, so songs would have no audio");
  }
  if (warnings.length) {
    console.log(`\n${warnings.length} note(s) (not blocking):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    problems.forEach((p) => console.log(`  - ${p}`));
  }

  if (!process.env.MONGODB_URI) {
    console.error("\nMONGODB_URI missing from .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });

  // Keep the two regions' copies of the same recording apart: if the slug is taken by a song in the
  // other region, this region's copy uses "<slug>-<region>" instead.
  const suffix = `-${region.toLowerCase()}`;
  const candidates = songs.flatMap((s) => [s.doc.slug, s.doc.slug + suffix]);
  const found = new Map((await Song.find({ slug: { $in: candidates } }, { slug: 1, region: 1 })).map((s) => [s.slug, s.region]));
  const renamed = [];
  songs.forEach((s) => {
    const baseRegion = found.get(s.doc.slug);
    if (baseRegion && baseRegion !== region) {
      s.doc.slug += suffix;
      renamed.push(s.doc.slug);
    }
  });
  if (renamed.length) {
    console.log(`\n${renamed.length} song(s) also exist in the other region; this region's copy uses its own slug: ${renamed.join(", ")}`);
  }
  const existing = new Set(Array.from(found.entries()).filter(([, r]) => r === region).map(([slug]) => slug));
  const toUpdate = songs.filter((s) => existing.has(s.doc.slug));
  console.log(`\nWould create ${songs.length - toUpdate.length} new song(s), update ${toUpdate.length} existing: ${toUpdate.map((s) => s.doc.slug).join(", ") || "none"}`);

  if (!apply) {
    console.log("\nDry run only — nothing was written. Re-run with --apply to import.");
    await mongoose.disconnect();
    process.exit(problems.length ? 1 : 0);
  }
  if (problems.length) {
    console.error("\nNot importing: fix the problems above first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  // Insert from the last song to the first so that song 001 is the newest and
  // appears first under the "Latest" sort on the Songs page.
  for (const { no, doc } of [...songs].reverse()) {
    await Song.findOneAndUpdate({ slug: doc.slug }, { $set: doc }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
    process.stdout.write(`${no} `);
  }
  const categories = Array.from(new Set(songs.map((s) => s.doc.category)));
  for (const name of categories) {
    await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  console.log(`\n\nImported ${songs.length} songs; categories ensured: ${categories.join(", ")}`);
  console.log(`Songs in database now: ${await Song.countDocuments()}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
