(function () {
  const { el, cardHTML, parseQuery, getSongs, getCategories, escapeHtml, splitArtists, findRegion } = window.FolkCommon;

  const searchEl = el("#songs-search");
  const categoryEl = el("#filter-category");
  const artistEl = el("#filter-artist");
  const sortEl = el("#sort-by");
  const songsGrid = el("#songs-grid");
  const countEl = el("#songs-count");

  if (!songsGrid) {
    return;
  }

  const query = parseQuery();
  // Region pages (songs/andhra.html, songs/telangana.html) set data-region on <main>;
  // songs/index.html has none and lists every song.
  const fixedRegion = songsGrid.closest("[data-region]")?.dataset.region || "";

  // Old links like songs/index.html?region=Andhra now belong on the region page.
  if (!fixedRegion && findRegion(query.region)) {
    const params = new URLSearchParams(window.location.search);
    params.delete("region");
    const suffix = params.toString() ? `?${params.toString()}` : "";
    window.location.replace(`${findRegion(query.region).page}${suffix}`);
    return;
  }

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
    return {
      search: normalize(searchEl.value),
      category: categoryEl.value,
      artist: artistEl.value,
      sort: sortEl.value
    };
  }

  function showSkeletons(count = 6) {
    songsGrid.innerHTML = Array.from({ length: count })
      .map(() => '<div class="skeleton skeleton-card"></div>')
      .join("");
  }

  let latestRequest = 0;
  let regionHasSongs = true;

  async function filterSongs() {
    const { search, category, artist, sort } = collectParams();
    const requestId = ++latestRequest;

    showSkeletons();

    const songs = await getSongs({
      search: search || "",
      region: fixedRegion,
      category: category === "All" ? "" : category,
      artist: artist === "All" ? "" : artist,
      sort
    });

    // Ignore responses that arrive after a newer search has started.
    if (requestId !== latestRequest) {
      return;
    }

    if (!songs.length) {
      const message = regionHasSongs
        ? "No songs found for this filter."
        : `${escapeHtml(findRegion(fixedRegion)?.label || fixedRegion)} songs are being added to the collection. Please check back soon.`;
      songsGrid.innerHTML = `<article class="card"><p class="muted">${message}</p></article>`;
    } else {
      songsGrid.innerHTML = songs.map((song, i) => cardHTML(song, "../", i)).join("");
    }
    countEl.textContent = `${songs.length} song${songs.length === 1 ? "" : "s"}`;
  }

  async function bootstrap() {
    showSkeletons();

    const [songs, categories] = await Promise.all([
      getSongs({ sort: "latest", region: fixedRegion }),
      fixedRegion ? Promise.resolve(null) : getCategories()
    ]);
    regionHasSongs = songs.length > 0;

    // On a region page, only offer categories and artists that have songs in that region.
    setSelectOptions(categoryEl, categories || songs.map((song) => song.category));
    setSelectOptions(artistEl, songs.flatMap((song) => splitArtists(song.artist)));

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
    // A value that isn't in the list leaves the select blank; fall back to "All".
    [categoryEl, artistEl].forEach((select) => {
      if (!select.value) {
        select.value = "All";
      }
    });

    // Debounce typing so 100+ songs aren't refetched on every keystroke.
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
    [categoryEl, artistEl, sortEl].forEach((input) => {
      input.addEventListener("change", runFilter);
    });

    await filterSongs();
  }

  bootstrap().catch((error) => {
    songsGrid.innerHTML = `<article class="card"><p class="muted">${escapeHtml(error.message)}</p></article>`;
  });
})();
