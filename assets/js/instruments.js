(function () {
  // Index page: filter instrument cards by type.
  const filter = document.getElementById("instrument-filter");
  const grid = document.getElementById("instrument-grid");
  const countEl = document.getElementById("instrument-count");
  if (!filter || !grid) {
    return;
  }

  filter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) {
      return;
    }
    const value = button.dataset.filter;
    filter.querySelectorAll("button[data-filter]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    let visible = 0;
    grid.querySelectorAll(".inst-card").forEach((card) => {
      const show = value === "all" || card.dataset.category === value;
      card.hidden = !show;
      visible += show ? 1 : 0;
    });
    grid.querySelectorAll("[data-group]").forEach((title) => {
      title.hidden = value !== "all" && title.dataset.group !== value;
    });
    if (countEl) {
      countEl.textContent = `${visible} instrument${visible === 1 ? "" : "s"}`;
    }
  });
})();
