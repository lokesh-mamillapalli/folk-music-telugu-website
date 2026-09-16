#!/usr/bin/env node
/*
 * Import songs from a prepared folder into MongoDB.
 *
 *   node scripts/import-songs.js andhra-songs            # dry run: checks everything, writes nothing
 *   node scripts/import-songs.js andhra-songs --apply    # create/update the songs in the database
 *
 * Folder layout:
 *   songs.csv                      no,titleTe,titleEn,category,artist,album,year,sourceUrl,...
 *   lyrics/NNN.txt                 Telugu lyrics, one line per line
 *   transliteration/NNN.txt        same lines in English letters
 *   content/NNN.json               { no, titleTe, translation[], summaryEn, summaryTe }
 *   drive-files.csv                name,id  (Google Drive file id for NNN.mp3, from the Apps Script)
 *
 * Songs are matched to existing records by slug (from the English title), so running it
 * again updates songs instead of duplicating them.
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { Song, Category, slugify, normalizeAudioUrl } = require("../models");

const REGION = "Andhra";

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

function buildSongs(folder, driveIds) {
  const rows = parseCsv(fs.readFileSync(path.join(folder, "songs.csv"), "utf8"));
  const problems = [];
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
      problems.push(`${where}: transliteration has ${translit.length} lines, lyrics ${lyrics.length}`);
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
    ["titleEn", "category", "artist"].forEach((key) => {
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
      links.push({ label: `Listen on JioSaavn${albumLabel}`, url: row.sourceUrl });
    }

    songs.push({
      no,
      doc: {
        slug,
        titleTe,
        titleEn: row.titleEn,
        region: REGION,
        category: row.category,
        artist: row.artist,
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

  return { rows, songs, problems };
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

  const driveIds = readDriveIds(driveFile);
  const { rows, songs, problems } = buildSongs(folder, driveIds);

  console.log(`Folder: ${folder}`);
  console.log(`songs.csv rows: ${rows.length}, ready: ${songs.length}`);
  console.log(driveIds ? `Drive ids: ${driveIds.size} files listed in ${path.basename(driveFile)}` : `Drive ids: ${driveFile} not found`);

  if (!driveIds) {
    problems.push("drive-files.csv is missing, so songs would have no audio");
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

  const existing = new Set((await Song.find({ slug: { $in: songs.map((s) => s.doc.slug) } }, { slug: 1 })).map((s) => s.slug));
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
