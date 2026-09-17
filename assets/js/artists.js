(function () {
  const { el, parseQuery, getSongs, escapeHtml, groupSongsByArtist, findRegion, regionTagHTML } = window.FolkCommon;
  const root = el("#artists-grid");
  const toggle = el("#artist-region-toggle");
  const countEl = el("#artists-count");
  if (!root) {
    return;
  }

  const VISIBLE_SONGS = 5;
  const query = parseQuery();
  const selectedArtist = String(query.artist || "").trim().toLowerCase();
  let region = findRegion(query.region) ? query.region : "All";
  let allSongs = [];

  function updateUrl() {
    const params = new URLSearchParams(window.location.search);
    if (region === "All") {
      params.delete("region");
    } else {
      params.set("region", region);
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${suffix}`);
  }

  function initials(name) {
    const words = name.replace(/[^A-Za-z\s]/g, " ").split(/\s+/).filter((word) => word.length > 1);
    const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
    return picked.map((word) => word[0].toUpperCase()).join("") || name.slice(0, 1).toUpperCase();
  }

  function avatarVariant(name) {
    let hash = 0;
    for (const char of name) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return hash % 5;
  }

  function songItem(song) {
    return `<li><a href="../songs/song.html?id=${encodeURIComponent(song.id)}"><span class="te" lang="te">${escapeHtml(song.titleTe)}</span><span class="en">${escapeHtml(song.titleEn)}</span></a></li>`;
  }

  function artistCard(artist, idx) {
    const count = artist.songs.length;
    const regions = Array.from(new Set(artist.songs.map((song) => song.region))).map(regionTagHTML).join("");
    const visible = artist.songs.slice(0, VISIBLE_SONGS).map(songItem).join("");
    const rest = artist.songs.slice(VISIBLE_SONGS);
    const more = rest.length
      ? `<details class="artist-more">
           <summary><span class="when-closed">Show all ${count} songs</span><span class="when-open">Show fewer</span></summary>
           <ul class="artist-songs" style="margin-top: 0;">${rest.map(songItem).join("")}</ul>
         </details>`
      : "";

    return `
      <article class="artist-card card-reveal" style="animation-delay: ${Math.min(idx * 0.03, 0.3)}s">
        <div class="artist-card__head">
          <span class="avatar avatar--${avatarVariant(artist.name)}" aria-hidden="true">${escapeHtml(initials(artist.name))}</span>
          <div>
            <h3>${escapeHtml(artist.name)}</h3>
            <p class="artist-card__meta">${count} song${count === 1 ? "" : "s"} ${regions}</p>
          </div>
        </div>
        <ul class="artist-songs">${visible}</ul>
        ${more}
      </article>
    `;
  }

  function messageCard(title, text) {
    return `<article class="card empty-state"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`;
  }

  function render() {
    toggle.querySelectorAll("button[data-region]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.region === region));
    });

    const songs = region === "All" ? allSongs : allSongs.filter((song) => song.region === region);
    let artists = groupSongsByArtist(songs);
    if (selectedArtist) {
      artists = artists.filter((artist) => artist.name.toLowerCase() === selectedArtist);
    }

    const regionLabel = region === "All" ? "" : findRegion(region).label;
    countEl.textContent = selectedArtist ? "" : `${artists.length} artist${artists.length === 1 ? "" : "s"}`;

    const backLink = selectedArtist ? '<p class="back-link"><a class="text-link" href="index.html">← Show all artists</a></p>' : "";

    if (!artists.length) {
      let card;
      if (selectedArtist) {
        card = regionLabel
          ? messageCard("No songs in this region", `This artist has no ${regionLabel} songs yet. Try “All Artists”.`)
          : messageCard("Artist not found", "Please go back and choose an artist from the list.");
      } else if (regionLabel) {
        card = messageCard(`${regionLabel} artists coming soon`, `Artists will appear here as soon as ${regionLabel} songs are added to the archive.`);
      } else {
        card = messageCard("No artists yet", "Artists appear here automatically when songs are added.");
      }
      root.innerHTML = backLink + card;
      return;
    }

    root.innerHTML = backLink + artists.map(artistCard).join("");
  }

  toggle.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-region]");
    if (!button || button.dataset.region === region) {
      return;
    }
    region = button.dataset.region;
    updateUrl();
    render();
  });

  async function bootstrap() {
    root.innerHTML = Array.from({ length: 6 })
      .map(() => '<div class="skeleton skeleton-card"></div>')
      .join("");
    allSongs = await getSongs({ sort: "alphabetical" });
    render();
  }

  bootstrap().catch((error) => {
    root.innerHTML = messageCard("Could not load artists", error.message || "Please refresh the page in a moment.");
  });
})();
