const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    titleTe: { type: String, required: true },
    titleEn: { type: String, required: true },
    region: { type: String, required: true },
    category: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "" },
    year: { type: String, default: "" },
    lyrics: { type: String, required: true },
    // Line-aligned with `lyrics`: line N of each field belongs to lyric line N.
    lyricsTransliteration: { type: String, default: "" },
    lyricsTranslation: { type: String, default: "" },
    summaryEn: { type: String, default: "" },
    summaryTe: { type: String, default: "" },
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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

module.exports = {
  Song,
  Category,
  AdminUser,
  slugify,
  escapeRegex,
  getGoogleDriveFileId,
  normalizeAudioUrl
};
