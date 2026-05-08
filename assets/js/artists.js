(function () {
  const { el, parseQuery, getDerivedArtists, getSongs } = window.FolkCommon;
  const root = el("#artists-grid");
  if (!root) {
    return;
  }

  async function bootstrap() {
    root.innerHTML = Array.from({ length: 3 })
      .map(() => '<div class="skeleton skeleton-card"></div>')
      .join("");

    const query = parseQuery();
    const [artists, songs] = await Promise.all([getDerivedArtists(), getSongs({ sort: "latest" })]);
    const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
    const selectedArtist = String(query.artist || "").trim().toLowerCase();

    const artistsToRender = selectedArtist
      ? artists.filter((artist) => artist.name.toLowerCase() === selectedArtist)
      : artists;

    if (!artists.length) {
      root.innerHTML = '<article class="card card-reveal"><h3>No artists yet</h3><p class="meta">Add songs from Admin panel to automatically create artist profiles.</p></article>';
      return;
    }

    root.innerHTML = artistsToRender
      .map((artist, idx) => {
        const artistSongs = artist.songs.map((songId) => songsById[songId]).filter(Boolean);
        const delay = Math.min(idx * 0.1, 0.5);
        const songsList = artistSongs
          .map(
            (song) =>
              `<li style="margin: 0.3rem 0;"><a class="text-link" href="../songs/song.html?id=${encodeURIComponent(song.id)}">${song.titleTe} <span style="color:var(--muted)">(${song.titleEn})</span></a></li>`
          )
          .join("");

        return `
          <article class="card card-reveal" style="animation-delay: ${delay}s">
            <h3 style="font-size:1.15rem;">${artist.name}</h3>
            <p class="meta" style="margin-bottom:0.6rem;">${artist.bio}</p>
            <h4 style="font-size:0.9rem; color:var(--primary); margin-bottom:0.3rem;">Songs Performed</h4>
            <ul style="list-style:none; padding:0; margin:0;">${songsList || "<li class='muted'>No songs listed yet.</li>"}</ul>
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
