const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Readable } = require("stream");
require("dotenv").config();

const app = express();
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "btp@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345678";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Add it to .env before starting server.");
  process.exit(1);
}

const songSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    titleTe: { type: String, required: true },
    titleEn: { type: String, required: true },
    region: { type: String, required: true },
    category: { type: String, required: true },
    artist: { type: String, required: true },
    lyrics: { type: String, required: true },
    audioVersions: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    links: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }
  },
  { timestamps: true }
);

const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", songSchema);
const Category = mongoose.model("Category", categorySchema);
const AdminUser = mongoose.model("AdminUser", adminUserSchema);

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapSong(songDoc) {
  return {
    id: songDoc.slug,
    titleTe: songDoc.titleTe,
    titleEn: songDoc.titleEn,
    region: songDoc.region,
    category: songDoc.category,
    artist: songDoc.artist,
    lyrics: songDoc.lyrics,
    audioVersions: songDoc.audioVersions || [],
    links: songDoc.links || [],
    addedAt: songDoc.createdAt ? new Date(songDoc.createdAt).toISOString().slice(0, 10) : ""
  };
}

function getToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice(7);
}

function requireAuth(req, res, next) {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeLinkList(list) {
  return (list || [])
    .filter((item) => item && item.url)
    .map((item) => ({ label: String(item.label || "External Link").trim(), url: String(item.url).trim() }));
}

function getGoogleDriveFileId(urlValue) {
  const value = String(urlValue || "").trim();
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("drive.google.com") && !host.includes("docs.google.com")) {
      return "";
    }

    const idFromQuery = parsed.searchParams.get("id");
    if (idFromQuery) {
      return idFromQuery;
    }

    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/i);
    if (fileMatch && fileMatch[1]) {
      return fileMatch[1];
    }
  } catch {
    return "";
  }

  return "";
}

function normalizeAudioUrl(audioUrl) {
  const value = String(audioUrl || "").trim();
  if (!value) {
    return "";
  }

  const driveFileId = getGoogleDriveFileId(value);
  if (!driveFileId) {
    return value;
  }

  return `https://docs.google.com/uc?export=download&id=${encodeURIComponent(driveFileId)}`;
}

const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://lokesh-mamillapalli.github.io"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = await AdminUser.findOne({ email });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email: user.email });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ email: req.auth.email });
});

app.get("/api/categories", async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories.map((item) => item.name));
});

app.post("/api/categories", requireAuth, async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }
  await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories.map((item) => item.name));
});

app.delete("/api/categories/:name", requireAuth, async (req, res) => {
  const name = String(req.params.name || "").trim();
  await Category.deleteOne({ name });
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories.map((item) => item.name));
});

app.get("/api/songs", async (req, res) => {
  const search = String(req.query.search || "").trim();
  const region = String(req.query.region || "").trim();
  const category = String(req.query.category || "").trim();
  const artist = String(req.query.artist || "").trim();
  const sort = String(req.query.sort || "latest").trim();

  const filter = {};
  if (region && region !== "All") {
    filter.region = region;
  }
  if (category && category !== "All") {
    filter.category = category;
  }
  if (artist && artist !== "All") {
    filter.artist = artist;
  }
  if (search) {
    filter.$or = [
      { titleTe: { $regex: search, $options: "i" } },
      { titleEn: { $regex: search, $options: "i" } },
      { lyrics: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { artist: { $regex: search, $options: "i" } },
      { region: { $regex: search, $options: "i" } }
    ];
  }

  const sortObj = sort === "alphabetical" ? { titleEn: 1 } : { createdAt: -1 };
  const songs = await Song.find(filter).sort(sortObj);
  res.json(songs.map(mapSong));
});

app.get("/api/songs/:id", async (req, res) => {
  const song = await Song.findOne({ slug: req.params.id });
  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }
  res.json(mapSong(song));
});

app.get("/api/audio", async (req, res) => {
  const sourceUrl = String(req.query.url || "").trim();
  if (!sourceUrl) {
    res.status(400).json({ error: "Missing audio url" });
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    res.status(400).json({ error: "Invalid audio url" });
    return;
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: "Unsupported protocol" });
    return;
  }

  const requestHeaders = {};
  if (req.headers.range) {
    requestHeaders.Range = req.headers.range;
  }

  let upstream;
  try {
    upstream = await fetch(parsedUrl.toString(), {
      redirect: "follow",
      headers: requestHeaders
    });
  } catch {
    res.status(502).json({ error: "Failed to fetch audio source" });
    return;
  }

  if (!upstream.ok && upstream.status !== 206) {
    res.status(502).json({ error: "Audio source returned an error" });
    return;
  }

  const passthroughHeaders = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified"
  ];

  passthroughHeaders.forEach((headerName) => {
    const value = upstream.headers.get(headerName);
    if (value) {
      res.setHeader(headerName, value);
    }
  });

  if (!res.getHeader("content-type")) {
    res.setHeader("content-type", "audio/mpeg");
  }

  res.status(upstream.status === 206 ? 206 : 200);

  if (!upstream.body) {
    res.end();
    return;
  }

  Readable.fromWeb(upstream.body).pipe(res);
});

app.post("/api/songs", requireAuth, async (req, res) => {
  const titleTe = String(req.body.titleTe || "").trim();
  const titleEn = String(req.body.titleEn || "").trim();
  const region = String(req.body.region || "").trim();
  const category = String(req.body.category || "").trim();
  const artist = String(req.body.artist || "").trim();
  const lyrics = String(req.body.lyrics || "").trim();
  let audioUrl = normalizeAudioUrl(req.body.audioUrl);

  if (!titleTe || !titleEn || !region || !category || !artist || !lyrics) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  if (!audioUrl) {
    res.status(400).json({ error: "Provide a playable audio URL (Google Drive link is allowed)" });
    return;
  }

  let slug = slugify(req.body.id || titleEn || titleTe);
  if (!slug) {
    slug = `song-${Date.now()}`;
  }
  const existing = await Song.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const links = normalizeLinkList(parseJsonArray(req.body.links));

  const song = await Song.create({
    slug,
    titleTe,
    titleEn,
    region,
    category,
    artist,
    lyrics,
    audioVersions: [{ label: "Primary Audio", url: audioUrl }],
    links
  });

  await Category.updateOne({ name: category }, { $setOnInsert: { name: category } }, { upsert: true });
  res.status(201).json(mapSong(song));
});

app.put("/api/songs/:id", requireAuth, async (req, res) => {
  const song = await Song.findOne({ slug: req.params.id });
  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  const titleTe = String(req.body.titleTe || song.titleTe).trim();
  const titleEn = String(req.body.titleEn || song.titleEn).trim();
  const region = String(req.body.region || song.region).trim();
  const category = String(req.body.category || song.category).trim();
  const artist = String(req.body.artist || song.artist).trim();
  const lyrics = String(req.body.lyrics || song.lyrics).trim();
  let audioUrl = normalizeAudioUrl(req.body.audioUrl || song.audioVersions[0]?.url || "");

  if (!audioUrl) {
    res.status(400).json({ error: "Provide a playable audio URL (Google Drive link is allowed)" });
    return;
  }

  const links = normalizeLinkList(parseJsonArray(req.body.links));

  song.titleTe = titleTe;
  song.titleEn = titleEn;
  song.region = region;
  song.category = category;
  song.artist = artist;
  song.lyrics = lyrics;
  song.audioVersions = audioUrl ? [{ label: "Primary Audio", url: audioUrl }] : [];
  song.links = links;
  await song.save();

  await Category.updateOne({ name: category }, { $setOnInsert: { name: category } }, { upsert: true });
  res.json(mapSong(song));
});

app.delete("/api/songs/:id", requireAuth, async (req, res) => {
  await Song.deleteOne({ slug: req.params.id });
  res.json({ ok: true });
});

app.use(express.static(ROOT));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

async function ensureAdminUser() {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await AdminUser.findOne({ email });
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  if (!existing) {
    await AdminUser.create({ email, passwordHash: hash });
    return;
  }
  const isValid = await bcrypt.compare(ADMIN_PASSWORD, existing.passwordHash);
  if (!isValid) {
    existing.passwordHash = hash;
    await existing.save();
  }
}

async function bootstrap() {
  await mongoose.connect(MONGODB_URI);

  await ensureAdminUser();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
