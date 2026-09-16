(function () {
  const { el, parseQuery, getSongs, escapeHtml, groupSongsByArtist, findRegion } = window.FolkCommon;
  const root = el("#artists-grid");
  const toggle = el("#artist-region-toggle");
  const countEl = el("#artists-count");
  if (!root) {
    return;
  }

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

  function regionTags(songs) {
    return Array.from(new Set(songs.map((song) => song.region)))
      .map((key) => `<span class="card-region-badge">${escapeHtml(findRegion(key)?.label || key)}</span>`)
      .join(" ");
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

    const showAllLink = selectedArtist
      ? '<p style="grid-column: 1 / -1;"><a class="text-link" href="index.html">← Show all artists</a></p>'
      : "";

    if (!artists.length) {
      let message;
      if (selectedArtist) {
        message = regionLabel
          ? `No ${escapeHtml(regionLabel)} songs by this artist. Try "All Artists".`
          : "No artist found with this name.";
      } else if (regionLabel) {
        message = `${escapeHtml(regionLabel)} artists will appear here once ${escapeHtml(regionLabel)} songs are added.`;
      } else {
        message = "Artists appear here automatically when songs are added from the Admin panel.";
      }
      root.innerHTML = `${showAllLink}<article class="card"><p class="muted">${message}</p></article>`;
      return;
    }

    root.innerHTML =
      showAllLink +
      artists
        .map((artist, idx) => {
          const delay = Math.min(idx * 0.05, 0.5);
          const count = artist.songs.length;
          const songsList = artist.songs
            .map(
              (song) =>
                `<li style="margin: 0.3rem 0;"><a class="text-link" href="../songs/song.html?id=${encodeURIComponent(song.id)}">${escapeHtml(song.titleTe)} <span style="color:var(--muted)">(${escapeHtml(song.titleEn)})</span></a></li>`
            )
            .join("");

          return `
            <article class="card card-reveal" style="animation-delay: ${delay}s">
              <h3 style="font-size:1.15rem;">${escapeHtml(artist.name)}</h3>
              <p class="meta" style="margin-bottom:0.6rem;">${count} song${count === 1 ? "" : "s"} ${regionTags(artist.songs)}</p>
              <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.3rem;">Songs Performed</h4>
              <ul style="list-style:none; padding:0; margin:0;">${songsList}</ul>
            </article>
          `;
        })
        .join("");
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
    root.innerHTML = Array.from({ length: 4 })
      .map(() => '<div class="skeleton skeleton-card"></div>')
      .join("");
    allSongs = await getSongs({ sort: "alphabetical" });
    render();
  }

  bootstrap().catch((error) => {
    root.innerHTML = `<article class="card"><p class="muted">${escapeHtml(error.message)}</p></article>`;
  });
})();
