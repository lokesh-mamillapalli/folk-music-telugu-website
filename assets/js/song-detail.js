(function () {
  const { API_BASE = "" } = window.FolkSiteConfig || {};

  const {
    el,
    parseQuery,
    copyText,
    cardHTML,
    getSongs,
    getSong,
    getCategories,
    updateSong,
    removeSong,
    addCategory,
    checkAdminAuth,
    normalizeAudioUrl,
    getGoogleDriveFileId
  } = window.FolkCommon;
  const root = el("#song-detail-root");
  if (!root) {
    return;
  }

  const { id } = parseQuery();

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getDriveFallbackUrls(value) {
    const fileId = getGoogleDriveFileId(value);
    if (!fileId) {
      return [];
    }

    const encoded = encodeURIComponent(fileId);
    const candidates = [
      `https://docs.google.com/uc?export=download&id=${encoded}`,
      `https://docs.google.com/uc?export=open&id=${encoded}`,
      `https://drive.google.com/uc?export=download&id=${encoded}`,
      `https://drive.google.com/uc?id=${encoded}`
    ];

    return Array.from(new Set(candidates));
  }

  function toAudioProxyUrl(sourceUrl, baseUrl = "") {
    const value = String(sourceUrl || "").trim();
    if (!value) {
      return "";
    }

    const normalizedBase = String(baseUrl || "").replace(/\/$/, "");
    return `${normalizedBase}/api/audio?url=${encodeURIComponent(value)}`;
  }

  function resolveApiBaseCandidates() {
    const candidates = [];

    const configuredBase = String(API_BASE || "").trim();
    if (configuredBase) {
      candidates.push(configuredBase);
    }

    if (window.location.hostname.endsWith("github.io")) {
      candidates.push("https://folk-music-telugu-website.onrender.com");
    }

    candidates.push("");
    return Array.from(new Set(candidates));
  }

  function collectAdminEditPayload(currentSong) {
    const payload = {
      titleTe: el("#edit-title-te").value.trim(),
      titleEn: el("#edit-title-en").value.trim(),
      region: el("#edit-region").value,
      category: el("#edit-category").value.trim(),
      artist: el("#edit-artist").value.trim(),
      lyrics: el("#edit-lyrics").value.trim(),
      audioUrl: normalizeAudioUrl(el("#edit-audio-url").value.trim())
    };

    const linkLabel = el("#edit-link-label").value.trim();
    const linkUrl = el("#edit-link-url").value.trim();
    payload.links = linkUrl
      ? [
          {
            label: linkLabel || "External Link",
            url: linkUrl
          }
        ]
      : [];

    if (!payload.titleTe || !payload.titleEn || !payload.region || !payload.category || !payload.artist || !payload.lyrics) {
      throw new Error("Please fill all required fields.");
    }

    if (!payload.audioUrl) {
      throw new Error("Please provide a playable audio URL.");
    }

    return payload;
  }

  async function bootstrap() {
    if (!id) {
      root.innerHTML = `
        <section class="card">
          <h1>Song not found</h1>
          <p class="muted">Please return to the songs page and choose a valid song.</p>
          <p><a class="btn" href="index.html">Back to Songs</a></p>
        </section>
      `;
      return;
    }

    const song = await getSong(id);
    const isAdmin = await checkAdminAuth();
    const categories = isAdmin ? await getCategories() : [];
    const related = (await getSongs({ category: song.category, sort: "latest" }))
      .filter((item) => item.id !== song.id)
      .slice(0, 2);

    const categoryOptions = categories
      .map((category) => `<option value="${escapeHtml(category)}"></option>`)
      .join("");

    const adminEditor = isAdmin
      ? `
        <section class="card" style="margin-top: 0.9rem;">
          <h2>Admin Quick Edit</h2>
          <form id="song-inline-edit-form" class="admin-form-grid" style="margin-top: 0.7rem;">
            <label>
              Telugu Title
              <input id="edit-title-te" type="text" value="${escapeHtml(song.titleTe)}" required />
            </label>
            <label>
              English Title
              <input id="edit-title-en" type="text" value="${escapeHtml(song.titleEn)}" required />
            </label>
            <label>
              Region
              <select id="edit-region" required>
                <option value="Telangana" ${song.region === "Telangana" ? "selected" : ""}>Telangana</option>
                <option value="Andhra" ${song.region === "Andhra" ? "selected" : ""}>Andhra</option>
              </select>
            </label>
            <label>
              Category
              <input id="edit-category" list="edit-category-options" type="text" value="${escapeHtml(song.category)}" required />
              <datalist id="edit-category-options">${categoryOptions}</datalist>
            </label>
            <label>
              Artist
              <input id="edit-artist" type="text" value="${escapeHtml(song.artist)}" required />
            </label>
            <label class="full-row">
              Audio URL
              <input id="edit-audio-url" type="url" value="${escapeHtml(song.audioVersions[0]?.url || "")}" required />
            </label>
            <label class="full-row">
              Song Link Label (optional)
              <input id="edit-link-label" type="text" value="${escapeHtml(song.links[0]?.label || "")}" />
            </label>
            <label class="full-row">
              Song Link URL (optional)
              <input id="edit-link-url" type="url" value="${escapeHtml(song.links[0]?.url || "")}" />
            </label>
            <label class="full-row">
              Lyrics
              <textarea id="edit-lyrics" rows="8" required>${escapeHtml(song.lyrics)}</textarea>
            </label>
            <div class="admin-actions full-row">
              <button class="btn" type="submit">Save Changes</button>
              <button class="btn-secondary" id="song-inline-delete" type="button">Delete Song</button>
            </div>
          </form>
          <p id="song-inline-edit-message" class="muted"></p>
        </section>
      `
      : "";

    root.innerHTML = `
      <section class="song-layout">
        <article>
          <h1 class="song-title-te">${song.titleTe}</h1>
          <p class="song-title-en">${song.titleEn}</p>

          <div class="card">
            <h2>Audio Player</h2>
            <audio id="main-audio" controls preload="none" src="${song.audioVersions[0]?.url || ""}"></audio>
          </div>

          <article class="lyrics">
            <h2>Lyrics</h2>
            <p>${song.lyrics}</p>
          </article>

          <section class="card" style="margin-top: 0.9rem;">
            <h2>Links to Songs</h2>
            <div class="mini-links">
              ${song.links.map((link) => `<a class="text-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`).join("")}
            </div>
          </section>
          ${adminEditor}
        </article>

        <aside>
          <section class="card">
            <h2>Metadata</h2>
            <div class="details-list">
              <div><strong>Region:</strong> <a class="text-link" href="index.html?region=${encodeURIComponent(song.region)}">${song.region}</a></div>
              <div><strong>Category:</strong> <a class="text-link" href="index.html?category=${encodeURIComponent(song.category)}">${song.category}</a></div>
              <div><strong>Artist:</strong> <a class="text-link" href="../artists/index.html?artist=${encodeURIComponent(song.artist)}">${song.artist}</a></div>
            </div>
            <div class="mini-links">
              <button class="btn" id="share-btn">Share</button>
              <button class="btn-secondary" id="copy-link-btn">Copy Link</button>
            </div>
          </section>

          <section class="card" style="margin-top: 0.9rem;">
            <h2>Related Songs</h2>
            <div id="related-songs" class="grid"></div>
          </section>
        </aside>
      </section>
    `;

    const audio = el("#main-audio");
    const primaryAudioUrl = String(song.audioVersions[0]?.url || "").trim();
    const fallbackUrls = getDriveFallbackUrls(primaryAudioUrl);
    const apiBaseCandidates = resolveApiBaseCandidates();
    const sourceCandidates = Array.from(new Set([primaryAudioUrl, ...fallbackUrls]));

    const proxiedCandidates = sourceCandidates
      .flatMap((sourceUrl) => apiBaseCandidates.map((baseUrl) => toAudioProxyUrl(sourceUrl, baseUrl)))
      .filter(Boolean);

    if (proxiedCandidates.length) {
      audio.src = proxiedCandidates[0];
    }

    let fallbackIndex = 0;

    audio.addEventListener("error", () => {
      while (fallbackIndex < proxiedCandidates.length && proxiedCandidates[fallbackIndex] === audio.src) {
        fallbackIndex += 1;
      }

      if (fallbackIndex < proxiedCandidates.length) {
        audio.src = proxiedCandidates[fallbackIndex];
        fallbackIndex += 1;
        audio.play().catch(() => {});
      }
    });

    const relatedRoot = el("#related-songs");
    if (!related.length) {
      relatedRoot.innerHTML = '<p class="muted">No related songs yet.</p>';
    } else {
      relatedRoot.innerHTML = related.map((item) => cardHTML(item, "../")).join("");
    }

    el("#copy-link-btn").addEventListener("click", async () => {
      await copyText(window.location.href);
      alert("Song link copied");
    });

    el("#share-btn").addEventListener("click", async () => {
      const shareData = {
        title: `${song.titleTe} | Telugu Folk Songs`,
        text: `${song.titleEn} - ${song.category}`,
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error && error.name !== "AbortError") {
            await copyText(window.location.href);
          }
        }
        return;
      }
      await copyText(window.location.href);
      alert("Song link copied");
    });

    if (isAdmin) {
      const messageEl = el("#song-inline-edit-message");
      const editForm = el("#song-inline-edit-form");
      const deleteBtn = el("#song-inline-delete");

      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let payload;

        try {
          payload = collectAdminEditPayload(song);
        } catch (error) {
          messageEl.textContent = error.message;
          messageEl.style.color = "#b91c1c";
          return;
        }

        try {
          await updateSong(song.id, payload);
          await addCategory(payload.category);
          messageEl.textContent = "Saved. Reloading with latest data...";
          messageEl.style.color = "#166534";
          setTimeout(() => window.location.reload(), 500);
        } catch (error) {
          messageEl.textContent = error.message || "Failed to update song.";
          messageEl.style.color = "#b91c1c";
        }
      });

      deleteBtn.addEventListener("click", async () => {
        const confirmed = window.confirm("Delete this song permanently?");
        if (!confirmed) {
          return;
        }
        try {
          await removeSong(song.id);
          window.location.href = "index.html";
        } catch (error) {
          messageEl.textContent = error.message || "Failed to delete song.";
          messageEl.style.color = "#b91c1c";
        }
      });
    }
  }

  bootstrap().catch(() => {
    root.innerHTML = `
      <section class="card">
        <h1>Song not found</h1>
        <p class="muted">Please return to the songs page and choose a valid song.</p>
        <p><a class="btn" href="index.html">Back to Songs</a></p>
      </section>
    `;
  });
})();
