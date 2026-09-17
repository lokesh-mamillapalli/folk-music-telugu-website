(function () {
  const { API_BASE, AUTH_TOKEN_KEY } = window.FolkSiteConfig;

  function el(selector) {
    return document.querySelector(selector);
  }

  function parseQuery() {
    const params = new URLSearchParams(window.location.search);
    const map = {};
    for (const [key, value] of params.entries()) {
      map[key] = value;
    }
    return map;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    return Promise.resolve();
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Each region has its own songs page under songs/. `key` is the value stored on songs.
  const REGIONS = [
    { key: "Andhra", label: "Andhra Pradesh", page: "andhra.html" },
    { key: "Telangana", label: "Telangana", page: "telangana.html" }
  ];

  function findRegion(key) {
    return REGIONS.find((region) => region.key === key) || null;
  }

  // Songs can credit several artists as "A, B, C".
  function splitArtists(value) {
    return String(value || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
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

      const ucMatch = parsed.pathname.match(/\/uc$/i);
      if (ucMatch && parsed.searchParams.get("id")) {
        return parsed.searchParams.get("id");
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

    const fileId = getGoogleDriveFileId(value);
    if (!fileId) {
      return value;
    }

    return `https://docs.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  }

  function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  }

  function setAuthToken(token) {
    if (!token) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  async function apiFetch(url, options = {}) {
    const requestUrl = `${API_BASE}${url}`;
    const headers = new Headers(options.headers || {});
    const token = getAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let body = options.body;
    if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const response = await fetch(requestUrl, {
      method: options.method || "GET",
      headers,
      body
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
    }

    if (!response.ok) {
      const error = new Error((data && (data.error || data.message)) || "Request failed");
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  function regionTagHTML(regionKey) {
    const region = findRegion(regionKey);
    return `<span class="region-tag" data-region="${escapeHtml(regionKey)}">${escapeHtml(region ? region.label : regionKey)}</span>`;
  }

  // First couple of lyric lines, used as a preview on song cards.
  function lyricPreview(lyrics) {
    const lines = String(lyrics || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const meaningful = lines.filter((line) => line.replace(/[.\s…:]/g, "").length >= 10);
    return (meaningful.length ? meaningful : lines).slice(0, 2).join(" / ");
  }

  function cardHTML(song, base = "", index = 0) {
    const delay = Math.min(index * 0.04, 0.4);
    const artists = splitArtists(song.artist);
    const artistText = artists.length > 2 ? `${artists.slice(0, 2).join(", ")} +${artists.length - 2}` : artists.join(", ");
    return `
      <article class="song-card card-reveal" data-region="${escapeHtml(song.region)}" style="animation-delay: ${delay}s">
        <div class="song-card__top">
          ${regionTagHTML(song.region)}
          <span class="cat-tag">${escapeHtml(song.category)}</span>
        </div>
        <h3 class="song-card__title-te" lang="te"><a href="${base}songs/song.html?id=${encodeURIComponent(song.id)}">${escapeHtml(song.titleTe)}</a></h3>
        <p class="song-card__title-en">${escapeHtml(song.titleEn)}</p>
        <p class="song-card__lyric" lang="te">${escapeHtml(lyricPreview(song.lyrics))}</p>
        <div class="song-card__foot">
          <span class="song-card__artist" title="${escapeHtml(artists.join(", "))}">${escapeHtml(artistText)}</span>
          <span class="song-card__cta" aria-hidden="true">Read &amp; listen →</span>
        </div>
      </article>
    `;
  }

  async function getSongs(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        params.set(key, value);
      }
    });
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/api/songs${suffix}`);
  }

  async function getSong(songId) {
    return apiFetch(`/api/songs/${encodeURIComponent(songId)}`);
  }

  async function getCategories() {
    return apiFetch("/api/categories");
  }

  async function addCategory(categoryName) {
    return apiFetch("/api/categories", {
      method: "POST",
      body: { name: categoryName }
    });
  }

  async function deleteCategory(categoryName) {
    return apiFetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
      method: "DELETE"
    });
  }

  async function createSong(songPayload) {
    return apiFetch("/api/songs", {
      method: "POST",
      body: songPayload
    });
  }

  async function updateSong(songId, songPayload) {
    return apiFetch(`/api/songs/${encodeURIComponent(songId)}`, {
      method: "PUT",
      body: songPayload
    });
  }

  async function removeSong(songId) {
    return apiFetch(`/api/songs/${encodeURIComponent(songId)}`, {
      method: "DELETE"
    });
  }

  async function adminLogin(email, password) {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setAuthToken(result.token || "");
    return result;
  }

  async function checkAdminAuth() {
    const token = getAuthToken();
    if (!token) {
      return false;
    }
    try {
      await apiFetch("/api/auth/me");
      return true;
    } catch {
      setAuthToken("");
      return false;
    }
  }

  function adminLogout() {
    setAuthToken("");
  }

  // Group songs by individual artist name, sorted by name.
  function groupSongsByArtist(songs) {
    const byArtist = new Map();
    songs.forEach((song) => {
      splitArtists(song.artist).forEach((name) => {
        if (!byArtist.has(name)) {
          byArtist.set(name, []);
        }
        byArtist.get(name).push(song);
      });
    });

    return Array.from(byArtist.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, artistSongs]) => ({ name, songs: artistSongs }));
  }

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("folkSite_theme", next);
      } catch {
        // Theme still switches for this page view without storage.
      }
    });
  }

  // Mobile menu
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  if (header && navToggle) {
    const setOpen = (open) => {
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    navToggle.addEventListener("click", () => setOpen(!header.classList.contains("nav-open")));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        setOpen(false);
      }
    });
  }

  window.FolkCommon = {
    el,
    parseQuery,
    copyText,
    slugify,
    escapeHtml,
    splitArtists,
    REGIONS,
    findRegion,
    groupSongsByArtist,
    normalizeAudioUrl,
    getGoogleDriveFileId,
    cardHTML,
    regionTagHTML,
    lyricPreview,
    getSongs,
    getSong,
    getCategories,
    addCategory,
    deleteCategory,
    createSong,
    updateSong,
    removeSong,
    adminLogin,
    checkAdminAuth,
    adminLogout
  };
})();
