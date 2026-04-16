(function () {
  const { SONGS } = window.FolkSiteData;
  const { el, cardHTML } = window.FolkCommon;

  const search = el("#home-search");
  const allSongsRoot = el("#all-songs");
  const newSongsRoot = el("#new-songs");
  const categoriesRoot = el("#category-shortcuts");

  if (!allSongsRoot || !newSongsRoot || !categoriesRoot) {
    return;
  }

  const latest = [...SONGS]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 3);

  const categories = Array.from(new Set(SONGS.map((song) => song.category))).sort();

  function renderCategories() {
    categoriesRoot.innerHTML = categories
      .map(
        (category) =>
          `<button class="chip" data-category="${category}">${category}</button>`
      )
      .join("");

    categoriesRoot.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) {
        return;
      }
      const category = button.getAttribute("data-category");
      window.location.href = `songs/index.html?category=${encodeURIComponent(category)}`;
    });
  }

  function renderNewSongs() {
    newSongsRoot.innerHTML = latest.map((song) => cardHTML(song, "")).join("");
  }

  function renderAllSongs(query = "") {
    const normalized = query.trim().toLowerCase();
    const filtered = SONGS.filter((song) => {
      if (!normalized) {
        return true;
      }
      const searchable = [
        song.titleTe,
        song.titleEn,
        song.lyrics,
        song.category,
        song.artist,
        song.region
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalized);
    });
    allSongsRoot.innerHTML = filtered.map((song) => cardHTML(song, "")).join("");
  }

  search.addEventListener("input", (event) => {
    renderAllSongs(event.target.value);
  });

  renderCategories();
  renderNewSongs();
  renderAllSongs();
})();
