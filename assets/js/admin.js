(function () {
  const {
    el,
    slugify,
    normalizeAudioUrl,
    getSongs,
    getCategories,
    createSong,
    updateSong,
    removeSong,
    addCategory,
    deleteCategory,
    checkAdminAuth,
    adminLogout
  } = window.FolkCommon;

  const songForm = el("#song-form");
  const songList = el("#admin-song-list");
  const songCount = el("#admin-song-count");
  const categoryList = el("#category-list");
  const categoryDataList = el("#category-options");
  const formMessage = el("#song-form-message");

  const fieldMap = {
    id: "#song-id",
    titleTe: "#song-title-te",
    titleEn: "#song-title-en",
    region: "#song-region",
    category: "#song-category",
    artist: "#song-artist",
    audioUrl: "#song-audio-url",
    linkLabel: "#song-link-label",
    linkUrl: "#song-link-url",
    lyrics: "#song-lyrics"
  };

  function field(name) {
    return el(fieldMap[name]);
  }

  function resetForm() {
    songForm.reset();
    field("id").value = "";
    formMessage.textContent = "";
    formMessage.style.color = "";
  }

  function currentSongFormData() {
    const idInput = field("id").value.trim();
    const titleEn = field("titleEn").value.trim();
    const titleTe = field("titleTe").value.trim();
    const linkUrl = field("linkUrl").value.trim();
    const category = field("category").value.trim();
    const audioUrl = normalizeAudioUrl(field("audioUrl").value.trim());

    if (!audioUrl) {
      throw new Error("Please provide a playable audio URL.");
    }

    if (!category) {
      throw new Error("Please provide a category.");
    }

    const payload = {
      id: idInput || slugify(titleEn || titleTe),
      titleTe,
      titleEn,
      region: field("region").value,
      category,
      artist: field("artist").value.trim(),
      lyrics: field("lyrics").value.trim(),
      audioUrl
    };

    const links = linkUrl
      ? [
          {
            label: field("linkLabel").value.trim() || "External Link",
            url: linkUrl
          }
        ]
      : [];

    payload.links = links;
    return payload;
  }

  async function renderCategoryOptions() {
    const categories = await getCategories();
    categoryDataList.innerHTML = categories
      .map((category) => `<option value="${category}"></option>`)
      .join("");

    categoryList.innerHTML = categories
      .map(
        (category) =>
          `<span class="chip admin-chip">${category}<button class="chip-delete" type="button" data-delete-category="${category}">×</button></span>`
      )
      .join("");
  }

  async function renderSongList() {
    const songs = await getSongs({ sort: "latest" });
    songCount.textContent = `${songs.length} song(s) in database`;

    if (!songs.length) {
      songList.innerHTML = '<p class="muted">No songs added yet. Use Song Editor to add your first original song.</p>';
      return;
    }

    songList.innerHTML = songs
      .map(
        (song) => `
          <article class="admin-song-item">
            <div>
              <h3>${song.titleTe}</h3>
              <p class="meta">${song.titleEn}</p>
              <p class="meta">${song.region} • ${song.category} • ${song.artist}</p>
            </div>
            <div class="admin-actions">
              <button type="button" class="btn-secondary" data-edit-song="${song.id}">Edit</button>
              <button type="button" class="btn-secondary" data-remove-song="${song.id}">Delete</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  async function fillForm(songId) {
    const songs = await getSongs({ sort: "latest" });
    const song = songs.find((item) => item.id === songId);
    if (!song) {
      return;
    }

    field("id").value = song.id;
    field("titleTe").value = song.titleTe;
    field("titleEn").value = song.titleEn;
    field("region").value = song.region;
    field("category").value = song.category;
    field("artist").value = song.artist;
    field("lyrics").value = song.lyrics;
    field("audioUrl").value = song.audioVersions[0]?.url || "";
    field("linkLabel").value = song.links[0]?.label || "";
    field("linkUrl").value = song.links[0]?.url || "";
    formMessage.textContent = `Editing: ${song.titleEn || song.titleTe}`;
  }

  songForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let payload;
    try {
      payload = currentSongFormData();
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.style.color = "#b91c1c";
      return;
    }

    const songId = payload.id;
    if (!songId) {
      formMessage.textContent = "Please provide a valid title to generate song ID.";
      formMessage.style.color = "#b91c1c";
      return;
    }

    try {
      if (field("id").value.trim()) {
        await updateSong(field("id").value.trim(), payload);
      } else {
        await createSong(payload);
      }
      await addCategory(payload.category);
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.style.color = "#b91c1c";
      return;
    }

    formMessage.textContent = "Song saved successfully.";
    formMessage.style.color = "#166534";
    await renderCategoryOptions();
    await renderSongList();
    await fillForm(songId);
  });

  el("#song-form-reset").addEventListener("click", resetForm);

  el("#song-delete-btn").addEventListener("click", async () => {
    const songId = field("id").value.trim();
    if (!songId) {
      formMessage.textContent = "Select a song to delete.";
      formMessage.style.color = "#b91c1c";
      return;
    }
    await removeSong(songId);
    formMessage.textContent = "Song deleted.";
    formMessage.style.color = "#166534";
    resetForm();
    await renderSongList();
  });

  songList.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("button[data-edit-song]");
    if (editBtn) {
      await fillForm(editBtn.getAttribute("data-edit-song"));
      return;
    }

    const deleteBtn = event.target.closest("button[data-remove-song]");
    if (deleteBtn) {
      const songId = deleteBtn.getAttribute("data-remove-song");
      await removeSong(songId);
      await renderSongList();
      if (field("id").value === songId) {
        resetForm();
      }
    }
  });

  el("#add-category-btn").addEventListener("click", async () => {
    const value = el("#new-category").value.trim();
    if (!value) {
      return;
    }
    await addCategory(value);
    el("#new-category").value = "";
    await renderCategoryOptions();
  });

  categoryList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-delete-category]");
    if (!button) {
      return;
    }
    const value = button.getAttribute("data-delete-category");
    await deleteCategory(value);
    await renderCategoryOptions();
  });

  el("#admin-logout-btn").addEventListener("click", () => {
    adminLogout();
    window.location.href = "login.html";
  });

  async function bootstrap() {
    const authenticated = await checkAdminAuth();
    if (!authenticated) {
      window.location.href = "login.html";
      return;
    }

    await renderCategoryOptions();
    await renderSongList();
  }

  bootstrap().catch((error) => {
    formMessage.textContent = error.message;
    formMessage.style.color = "#b91c1c";
  });
})();
