(function () {
  const { el, parseQuery, getDerivedArtists, getSongs } = window.FolkCommon;
  const root = el("#artists-grid");
  if (!root) {
    return;
  }

  async function bootstrap() {
    const query = parseQuery();
    const [artists, songs] = await Promise.all([getDerivedArtists(), getSongs({ sort: "latest" })]);
    const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
    const selectedArtist = String(query.artist || "").trim().toLowerCase();

    const artistsToRender = selectedArtist
      ? artists.filter((artist) => artist.name.toLowerCase() === selectedArtist)
      : artists;

    if (!artists.length) {
      root.innerHTML = '<article class="card"><h3>No artists yet</h3><p class="meta">Add songs from Admin panel to automatically create artist profiles.</p></article>';
      return;
    }

    root.innerHTML = artistsToRender
      .map((artist) => {
        const artistSongs = artist.songs.map((songId) => songsById[songId]).filter(Boolean);
        const songsList = artistSongs
          .map(
            (song) =>
              `<li><a class="text-link" href="../songs/song.html?id=${encodeURIComponent(song.id)}">${song.titleTe} (${song.titleEn})</a></li>`
          )
          .join("");

        return `
          <article class="card">
            <h3>${artist.name}</h3>
            <p class="meta">${artist.bio}</p>
            <h4>Songs Performed</h4>
            <ul>${songsList || "<li>No songs listed yet.</li>"}</ul>
          </article>
        `;
      })
      .join("");

    if (!root.innerHTML) {
      root.innerHTML = '<article class="card"><h3>No artist found</h3><p class="meta">Please go back and select a valid artist.</p></article>';
    }
  }

  bootstrap().catch((error) => {
    root.innerHTML = `<article class="card"><p class="muted">${error.message}</p></article>`;
  });
})();
