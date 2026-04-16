(function () {
  const { el, cardHTML, parseQuery, getSongs, getCategories } = window.FolkCommon;

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
      .map((item) => `<option value="${item}">${item}</option>`)
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

  async function filterSongs() {
    const { search, region, category, artist, sort } = collectParams();

    const songs = await getSongs({
      search: search || "",
      region: region === "All" ? "" : region,
      category: category === "All" ? "" : category,
      artist: artist === "All" ? "" : artist,
      sort
    });

    if (!songs.length) {
      songsGrid.innerHTML = '<article class="card"><p class="muted">No songs found for this filter.</p></article>';
    } else {
      songsGrid.innerHTML = songs.map((song) => cardHTML(song, "../")).join("");
    }
    countEl.textContent = `${songs.length} song(s) found`;
  }

  async function bootstrap() {
    const [songs, categories] = await Promise.all([
      getSongs({ sort: "latest" }),
      getCategories()
    ]);

    setSelectOptions(regionEl, songs.map((song) => song.region));
    setSelectOptions(categoryEl, categories);
    setSelectOptions(artistEl, songs.map((song) => song.artist));

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

    [searchEl, regionEl, categoryEl, artistEl, sortEl].forEach((input) => {
      input.addEventListener("input", () => {
        filterSongs().catch((error) => {
          songsGrid.innerHTML = `<article class="card"><p class="muted">${error.message}</p></article>`;
        });
      });
      input.addEventListener("change", () => {
        filterSongs().catch((error) => {
          songsGrid.innerHTML = `<article class="card"><p class="muted">${error.message}</p></article>`;
        });
      });
    });

    await filterSongs();
  }

  bootstrap().catch((error) => {
    songsGrid.innerHTML = `<article class="card"><p class="muted">${error.message}</p></article>`;
  });
})();
