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

  function cardHTML(song, base = "") {
    const preview = song.lyrics.length > 75 ? `${song.lyrics.slice(0, 75)}...` : song.lyrics;
    return `
      <article class="card">
        <h3>${song.titleTe}</h3>
        <p class="meta">${song.titleEn}</p>
        <p class="meta">${song.region} • ${song.category}</p>
        <p class="meta">Artist: ${song.artist}</p>
        <p class="lyrics-preview">${preview}</p>
        <div class="card-footer">
          <a class="btn" href="${base}songs/song.html?id=${encodeURIComponent(song.id)}">View Song</a>
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

  async function getDerivedArtists() {
    const songs = await getSongs();
    const byArtist = new Map();
    songs.forEach((song) => {
      if (!byArtist.has(song.artist)) {
        byArtist.set(song.artist, []);
      }
      byArtist.get(song.artist).push(song);
    });

    return Array.from(byArtist.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, artistSongs]) => ({
        name,
        bio: "Artist profile managed from Admin metadata.",
        songs: artistSongs.map((song) => song.id)
      }));
  }

  window.FolkCommon = {
    el,
    parseQuery,
    copyText,
    slugify,
    normalizeAudioUrl,
    getGoogleDriveFileId,
    cardHTML,
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
    adminLogout,
    getDerivedArtists
  };
})();
