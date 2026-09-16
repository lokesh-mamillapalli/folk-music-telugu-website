(function () {
  const { el, cardHTML, parseQuery, getSongs, getCategories, escapeHtml, splitArtists } = window.FolkCommon;

  const searchEl = el("#songs-search");
  const regionEl = el("#filter-region");
  const categoryEl = el("#filter-category");
  const artistEl = el("#filter-artist");
  const sortEl = el("#sort-by");
  const songsGrid = el("#songs-grid");
  const countEl = el("#songs-count");

  if (!songsGrid) {
    return;
  }

  const query = parseQuery();

  function optionsFor(values) {
    return ["All", ...Array.from(new Set(values)).sort()];
  }

  function setSelectOptions(target, values) {
    target.innerHTML = optionsFor(values)
      .map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)
      .join("");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function collectParams() {
    const search = normalize(searchEl.value);
    const region = regionEl.value;
    const category = categoryEl.value;
    const artist = artistEl.value;
    const sortBy = sortEl.value;

    return {
      search,
      region,
      category,
      artist,
      sort: sortBy
    };
  }

  function showSkeletons(count = 6) {
    songsGrid.innerHTML = Array.from({ length: count })
      .map(() => '<div class="skeleton skeleton-card"></div>')
      .join("");
  }

  let latestRequest = 0;

  async function filterSongs() {
    const { search, region, category, artist, sort } = collectParams();
    const requestId = ++latestRequest;

    showSkeletons();

    const songs = await getSongs({
      search: search || "",
      region: region === "All" ? "" : region,
      category: category === "All" ? "" : category,
      artist: artist === "All" ? "" : artist,
      sort
    });

    // Ignore responses that arrive after a newer search has started.
    if (requestId !== latestRequest) {
      return;
    }

    if (!songs.length) {
      songsGrid.innerHTML = '<article class="card"><p class="muted">No songs found for this filter.</p></article>';
    } else {
      songsGrid.innerHTML = songs.map((song, i) => cardHTML(song, "../", i)).join("");
    }
    countEl.textContent = `${songs.length} song(s) found`;
  }

  async function bootstrap() {
    showSkeletons();

    const [songs, categories] = await Promise.all([
      getSongs({ sort: "latest" }),
      getCategories()
    ]);

    setSelectOptions(regionEl, songs.map((song) => song.region));
    setSelectOptions(categoryEl, categories);
    setSelectOptions(artistEl, songs.flatMap((song) => splitArtists(song.artist)));

    if (query.region) {
      regionEl.value = query.region;
    }
    if (query.category) {
      categoryEl.value = query.category;
    }
    if (query.artist) {
      artistEl.value = query.artist;
    }
    if (query.sort && ["latest", "alphabetical"].includes(query.sort)) {
      sortEl.value = query.sort;
    }
    if (query.search) {
      searchEl.value = query.search;
    }

    // Selects fire both "input" and "change"; listen to one event per control and
    // debounce typing so 100+ songs aren't refetched on every keystroke.
    let debounceTimer;
    const runFilter = () => {
      filterSongs().catch((error) => {
        songsGrid.innerHTML = `<article class="card"><p class="muted">${escapeHtml(error.message)}</p></article>`;
      });
    };
    searchEl.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runFilter, 300);
    });
    [regionEl, categoryEl, artistEl, sortEl].forEach((input) => {
      input.addEventListener("change", runFilter);
    });

    await filterSongs();
  }

  bootstrap().catch((error) => {
    songsGrid.innerHTML = `<article class="card"><p class="muted">${escapeHtml(error.message)}</p></article>`;
  });
})();
