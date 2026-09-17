(function () {
  const { API_BASE = "" } = window.FolkSiteConfig || {};

  const {
    el,
    parseQuery,
    copyText,
    cardHTML,
    escapeHtml,
    splitArtists,
    findRegion,
    regionTagHTML,
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
  const LAYERS_KEY = "folkSite_lyricLayers";
  const SUMMARY_LANG_KEY = "folkSite_summaryLang";

  function readPref(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function writePref(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode); preferences are optional.
    }
  }

  function messageHTML(title, text) {
    return `
      <section class="card empty-state" style="margin-top: 48px;">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
        <p style="margin-top: 1.2rem;"><a class="btn" href="index.html">Browse songs</a></p>
      </section>
    `;
  }

  function flashButton(button, text) {
    const original = button.textContent;
    button.textContent = text;
    setTimeout(() => {
      button.textContent = original;
    }, 1800);
  }

  function splitLines(value) {
    return String(value || "")
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function paragraphs(value) {
    return String(value || "")
      .replace(/\r/g, "")
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${escapeHtml(part)}</p>`)
      .join("");
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

  function lyricsHTML(song) {
    const te = splitLines(song.lyrics);
    const tr = splitLines(song.lyricsTransliteration);
    const en = splitLines(song.lyricsTranslation);
    const hasTr = tr.length > 0;
    const hasEn = en.length > 0;

    const toggles = hasTr || hasEn
      ? `
        <div class="layer-toggles" role="group" aria-label="Choose lyric layers">
          <label><input type="checkbox" data-layer="te" checked /> తెలుగు</label>
          ${hasTr ? '<label><input type="checkbox" data-layer="tr" checked /> Transliteration</label>' : ""}
          ${hasEn ? '<label><input type="checkbox" data-layer="en" checked /> English</label>' : ""}
        </div>
      `
      : "";

    const aligned = (!hasTr || tr.length === te.length) && (!hasEn || en.length === te.length);
    let body;
    if (aligned) {
      body = te
        .map(
          (line, i) => `
            <div class="lyric-line">
              <p class="lyric-te">${escapeHtml(line)}</p>
              ${hasTr ? `<p class="lyric-tr">${escapeHtml(tr[i])}</p>` : ""}
              ${hasEn ? `<p class="lyric-en">${escapeHtml(en[i])}</p>` : ""}
            </div>
          `
        )
        .join("");
    } else {
      // Line counts differ (e.g. edited by hand), so show each layer as its own block.
      const block = (lines, cls, heading) =>
        lines.length
          ? `<div class="lyric-block"><h3>${heading}</h3>${lines.map((line) => `<p class="${cls}">${escapeHtml(line)}</p>`).join("")}</div>`
          : "";
      body = block(te, "lyric-te", "తెలుగు") + block(tr, "lyric-tr", "Transliteration") + block(en, "lyric-en", "English");
    }

    return `
      <section class="card lyrics-panel" aria-labelledby="lyrics-title">
        <div class="lyrics-head">
          <h2 class="card-title" id="lyrics-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h16M4 14h10M4 18h7"/></svg> Lyrics</h2>
          ${toggles}
        </div>
        <div id="lyrics-lines" class="lyrics-lines">${body}</div>
      </section>
    `;
  }

  function summaryHTML(song) {
    if (!song.summaryEn && !song.summaryTe) {
      return "";
    }
    const both = song.summaryEn && song.summaryTe;
    return `
      <section class="card summary-card" aria-labelledby="about-title">
        <div class="lyrics-head">
          <h2 class="card-title" id="about-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg> About this song</h2>
          ${both ? `
            <div class="summary-tabs" role="tablist">
              <button type="button" role="tab" data-summary-lang="en">English</button>
              <button type="button" role="tab" data-summary-lang="te">తెలుగు</button>
            </div>
          ` : ""}
        </div>
        ${song.summaryEn ? `<div class="summary-body" data-summary="en">${paragraphs(song.summaryEn)}</div>` : ""}
        ${song.summaryTe ? `<div class="summary-body summary-te" data-summary="te" lang="te">${paragraphs(song.summaryTe)}</div>` : ""}
      </section>
    `;
  }

  function setupLyricToggles() {
    const container = el("#lyrics-lines");
    const boxes = Array.from(document.querySelectorAll(".layer-toggles input[data-layer]"));
    if (!container || !boxes.length) {
      return;
    }

    const saved = readPref(LAYERS_KEY, "te,tr,en").split(",");
    const available = boxes.map((box) => box.dataset.layer);
    const initial = saved.filter((layer) => available.includes(layer));
    boxes.forEach((box) => {
      box.checked = initial.length ? initial.includes(box.dataset.layer) : true;
    });

    function apply() {
      boxes.forEach((box) => container.classList.toggle(`hide-${box.dataset.layer}`, !box.checked));
    }

    boxes.forEach((box) => {
      box.addEventListener("change", () => {
        if (!boxes.some((item) => item.checked)) {
          box.checked = true; // keep at least one layer visible
        }
        apply();
        writePref(LAYERS_KEY, boxes.filter((item) => item.checked).map((item) => item.dataset.layer).join(","));
      });
    });
    apply();
  }

  function setupSummaryTabs() {
    const tabs = Array.from(document.querySelectorAll("[data-summary-lang]"));
    if (!tabs.length) {
      return;
    }
    function show(lang) {
      tabs.forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.summaryLang === lang)));
      document.querySelectorAll("[data-summary]").forEach((body) => {
        body.hidden = body.dataset.summary !== lang;
      });
    }
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        show(tab.dataset.summaryLang);
        writePref(SUMMARY_LANG_KEY, tab.dataset.summaryLang);
      });
    });
    show(readPref(SUMMARY_LANG_KEY, "en") === "te" ? "te" : "en");
  }

  function collectAdminEditPayload() {
    const payload = {
      titleTe: el("#edit-title-te").value.trim(),
      titleEn: el("#edit-title-en").value.trim(),
      region: el("#edit-region").value,
      category: el("#edit-category").value.trim(),
      artist: el("#edit-artist").value.trim(),
      album: el("#edit-album").value.trim(),
      year: el("#edit-year").value.trim(),
      lyrics: el("#edit-lyrics").value.trim(),
      lyricsTransliteration: el("#edit-transliteration").value.trim(),
      lyricsTranslation: el("#edit-translation").value.trim(),
      summaryEn: el("#edit-summary-en").value.trim(),
      summaryTe: el("#edit-summary-te").value.trim(),
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

    if (!payload.titleTe || !payload.titleEn || !payload.region || !payload.category || !payload.lyrics) {
      throw new Error("Please fill all required fields.");
    }

    if (!payload.audioUrl) {
      throw new Error("Please provide a playable audio URL.");
    }

    return payload;
  }

  function adminEditorHTML(song, categories) {
    const categoryOptions = categories
      .map((category) => `<option value="${escapeHtml(category)}"></option>`)
      .join("");
    const regionOptions = ["Andhra", "Telangana"]
      .map((region) => `<option value="${region}" ${song.region === region ? "selected" : ""}>${region}</option>`)
      .join("");

    return `
      <section class="card">
        <h2 class="card-title">Admin quick edit</h2>
        <form id="song-inline-edit-form" class="admin-form-grid">
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
            <select id="edit-region" required>${regionOptions}</select>
          </label>
          <label>
            Category
            <input id="edit-category" list="edit-category-options" type="text" value="${escapeHtml(song.category)}" required />
            <datalist id="edit-category-options">${categoryOptions}</datalist>
          </label>
          <label class="full-row">
            Artists (comma separated)
            <input id="edit-artist" type="text" value="${escapeHtml(song.artist)}" placeholder="Leave blank if not known" />
          </label>
          <label>
            Album
            <input id="edit-album" type="text" value="${escapeHtml(song.album)}" />
          </label>
          <label>
            Year
            <input id="edit-year" type="text" value="${escapeHtml(song.year)}" />
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
            Telugu Lyrics (one line per line)
            <textarea id="edit-lyrics" rows="8" required>${escapeHtml(song.lyrics)}</textarea>
          </label>
          <label class="full-row">
            Transliteration (same lines, same order)
            <textarea id="edit-transliteration" rows="8">${escapeHtml(song.lyricsTransliteration)}</textarea>
          </label>
          <label class="full-row">
            English Translation (same lines, same order)
            <textarea id="edit-translation" rows="8">${escapeHtml(song.lyricsTranslation)}</textarea>
          </label>
          <label class="full-row">
            About this song (English)
            <textarea id="edit-summary-en" rows="5">${escapeHtml(song.summaryEn)}</textarea>
          </label>
          <label class="full-row">
            పాట గురించి (Telugu)
            <textarea id="edit-summary-te" rows="5">${escapeHtml(song.summaryTe)}</textarea>
          </label>
          <div class="admin-actions full-row">
            <button class="btn" type="submit">Save Changes</button>
            <button class="btn-secondary" id="song-inline-delete" type="button">Delete Song</button>
          </div>
        </form>
        <p id="song-inline-edit-message" class="muted"></p>
      </section>
    `;
  }

  async function bootstrap() {
    if (!id) {
      root.innerHTML = messageHTML("Song not found", "Please go back to the songs list and choose a song.");
      return;
    }

    const song = await getSong(id);
    const isAdmin = await checkAdminAuth();
    const categories = isAdmin ? await getCategories() : [];
    const related = (await getSongs({ category: song.category, region: song.region, sort: "latest" }))
      .filter((item) => item.id !== song.id)
      .slice(0, 3);

    document.title = `${song.titleTe} (${song.titleEn}) | Telugu Folk Songs`;

    // Link back to the song's region page and highlight it in the top navigation.
    const region = findRegion(song.region);
    const regionPage = region ? region.page : "index.html";
    const regionLabel = region ? region.label : song.region;
    document.querySelectorAll(".nav-links a").forEach((link) => {
      if (region && link.getAttribute("href").endsWith(`songs/${region.page}`)) {
        link.setAttribute("aria-current", "page");
      }
    });

    const artistLinks = splitArtists(song.artist)
      .map((name) => `<a href="../artists/index.html?artist=${encodeURIComponent(name)}">${escapeHtml(name)}</a>`)
      .join(", ");
    const safeLinks = song.links.filter((link) => /^https?:\/\//i.test(link.url));
    const albumText = song.album ? `${escapeHtml(song.album)}${song.year ? ` (${escapeHtml(song.year)})` : ""}` : "";

    root.dataset.region = song.region;
    root.innerHTML = `
      <header class="song-hero">
        <a class="breadcrumb" href="${regionPage}">← ${escapeHtml(regionLabel)} Songs</a>
        <div class="song-hero__tags">
          ${regionTagHTML(song.region)}
          <a class="cat-tag" href="${regionPage}?category=${encodeURIComponent(song.category)}">${escapeHtml(song.category)}</a>
        </div>
        <h1 class="song-title-te" lang="te">${escapeHtml(song.titleTe)}</h1>
        <p class="song-title-en">${escapeHtml(song.titleEn)}</p>
        ${artistLinks || albumText ? `<p class="song-hero__meta">${artistLinks ? `Sung by ${artistLinks}` : ""}${artistLinks && albumText ? " · " : ""}${albumText}</p>` : ""}
      </header>

      <div class="song-layout">
        <div class="song-main">
          <section class="card audio-card" aria-labelledby="audio-title">
            <h2 class="card-title" id="audio-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> Listen</h2>
            <audio id="main-audio" controls preload="none"></audio>
            <p class="audio-note">Audio streams from Google Drive, so the first play can take a few seconds to start.</p>
          </section>

          ${lyricsHTML(song)}
          ${summaryHTML(song)}
          ${isAdmin ? adminEditorHTML(song, categories) : ""}
        </div>

        <aside class="song-aside">
          <section class="card">
            <h2 class="card-title">Details</h2>
            <div class="details-list">
              <div><strong>Region</strong><a href="${regionPage}">${escapeHtml(regionLabel)}</a></div>
              <div><strong>Category</strong><a href="${regionPage}?category=${encodeURIComponent(song.category)}">${escapeHtml(song.category)}</a></div>
              ${artistLinks ? `<div><strong>Artists</strong><span>${artistLinks}</span></div>` : ""}
              ${albumText ? `<div><strong>Album</strong><span>${albumText}</span></div>` : ""}
            </div>
            <div class="share-row">
              <button class="btn" id="share-btn" type="button">Share</button>
              <button class="btn-secondary" id="copy-link-btn" type="button">Copy link</button>
            </div>
          </section>

          ${safeLinks.length ? `
          <section class="card">
            <h2 class="card-title">Source</h2>
            <div class="link-list">
              ${safeLinks.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(link.label)}</span><span aria-hidden="true">↗</span></a>`).join("")}
            </div>
          </section>
          ` : ""}

          <section class="card">
            <h2 class="card-title">More ${escapeHtml(song.category)}</h2>
            <div id="related-songs" class="related-list"></div>
          </section>
        </aside>
      </div>
    `;

    setupLyricToggles();
    setupSummaryTabs();

    const audio = el("#main-audio");
    const primaryAudioUrl = String(song.audioVersions[0]?.url || "").trim();
    const sourceCandidates = Array.from(new Set([primaryAudioUrl, ...getDriveFallbackUrls(primaryAudioUrl)])).filter(Boolean);
    const apiBaseCandidates = resolveApiBaseCandidates();
    const proxiedCandidates = sourceCandidates
      .flatMap((sourceUrl) => apiBaseCandidates.map((baseUrl) => toAudioProxyUrl(sourceUrl, baseUrl)))
      .filter(Boolean);

    let candidateIndex = 0;
    if (proxiedCandidates.length) {
      audio.src = proxiedCandidates[0];
    }

    audio.addEventListener("error", () => {
      candidateIndex += 1;
      if (candidateIndex < proxiedCandidates.length) {
        audio.src = proxiedCandidates[candidateIndex];
        audio.play().catch(() => {});
      }
    });

    const relatedRoot = el("#related-songs");
    if (!related.length) {
      relatedRoot.innerHTML = '<p class="muted">No related songs yet.</p>';
    } else {
      relatedRoot.innerHTML = related.map((item, i) => cardHTML(item, "../", i)).join("");
    }

    el("#copy-link-btn").addEventListener("click", async () => {
      await copyText(window.location.href);
      flashButton(el("#copy-link-btn"), "Link copied ✓");
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
      flashButton(el("#share-btn"), "Link copied ✓");
    });

    if (isAdmin) {
      const messageEl = el("#song-inline-edit-message");
      const editForm = el("#song-inline-edit-form");
      const deleteBtn = el("#song-inline-delete");

      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let payload;

        try {
          payload = collectAdminEditPayload();
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

  bootstrap().catch((error) => {
    const notFound = error && error.status === 404;
    root.innerHTML = notFound
      ? messageHTML("Song not found", "Please go back to the songs list and choose a song.")
      : messageHTML("Could not load this song", "The server may be waking up. Please wait a moment and refresh the page.");
  });
})();
