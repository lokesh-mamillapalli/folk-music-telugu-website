(function () {
  const { el, getSongs, cardHTML, escapeHtml, REGIONS, regionTagHTML } = window.FolkCommon;

  // Vocabulary: switch between the Andhra Pradesh and Telangana word lists.
  const vocabToggle = el("#vocab-toggle");
  if (vocabToggle) {
    vocabToggle.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-vocab]");
      if (!button) {
        return;
      }
      vocabToggle.querySelectorAll("button[data-vocab]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      document.querySelectorAll("[data-vocab-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.vocabPanel !== button.dataset.vocab;
      });
    });
  }

  const featuredRoot = el("#featured-songs");
  const themeRoot = el("#theme-cloud");
  if (!featuredRoot) {
    return;
  }

  // Pick a few songs at random so returning visitors see something new.
  function pickFeatured(songs, count) {
    const pool = songs.filter((song) => song.summaryEn);
    const source = pool.length >= count ? pool : songs;
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  }

  function renderThemes(songs) {
    if (!themeRoot) {
      return;
    }
    const groups = REGIONS.map((region) => {
      const counts = new Map();
      songs
        .filter((song) => song.region === region.key)
        .forEach((song) => counts.set(song.category, (counts.get(song.category) || 0) + 1));
      if (!counts.size) {
        return "";
      }
      const chips = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(
          ([category, count]) =>
            `<a class="chip" href="songs/${region.page}?category=${encodeURIComponent(category)}">${escapeHtml(category)} <span class="count">${count}</span></a>`
        )
        .join("");
      return `
        <div class="theme-cloud__group" data-region="${region.key}">
          <h3>Browse by theme ${regionTagHTML(region.key)}</h3>
          <div class="chip-row">${chips}</div>
        </div>
      `;
    }).join("");
    themeRoot.innerHTML = groups;
  }

  async function bootstrap() {
    const songs = await getSongs({ sort: "latest" });

    const featured = pickFeatured(songs, 3);
    featuredRoot.innerHTML = featured.length
      ? featured.map((song, i) => cardHTML(song, "", i)).join("")
      : '<article class="card empty-state"><h3>Songs are on their way</h3><p>The collection is being added. Please check back soon.</p></article>';

    renderThemes(songs);
  }

  bootstrap().catch(() => {
    featuredRoot.innerHTML =
      '<article class="card empty-state"><h3>Could not load songs right now</h3><p>The server may be waking up. Please refresh the page in a moment.</p></article>';
  });
})();
