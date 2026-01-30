(function () {
  const elements = {
    form: document.getElementById("player-form"),
    list: document.getElementById("players-list"),
  };

  let bound = false;

  function buildPlayerCard(player) {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-badge">
        <span class="badge-dot" style="background:${player.color}"></span>
        <div>
          <strong>${player.name}</strong>
          <div class="small">Age ${player.age} · ${player.multiplier.toFixed(2)}×</div>
        </div>
      </div>
      <div class="inline-actions">
        <button type="button" data-action="remove" data-id="${player.id}" class="secondary">Remove</button>
      </div>
    `;
    return card;
  }

  function renderList(state) {
    elements.list.innerHTML = "";
    if (!state.players.length) {
      elements.list.innerHTML = '<p class="helper">No players yet. Add one above.</p>';
      return;
    }
    state.players.forEach((player) => {
      elements.list.appendChild(buildPlayerCard(player));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const name = String(formData.get("name") || "").trim();
    const age = Number(formData.get("age"));
    const color = String(formData.get("color") || "#6c7bff");
    if (!name || !age) return;

    const multiplier = KidsZoneUtils.getMultiplier(age);

    KidsZoneStore.updateState((state) => {
      state.players.push({
        id: KidsZoneStore.generateId("p"),
        name,
        age,
        color,
        multiplier,
        createdAt: Date.now(),
      });
      return state;
    });

    elements.form.reset();
    elements.form.age.value = age;
    render();
  }

  function handleRemove(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "remove") return;
    const playerId = target.dataset.id;
    if (!playerId) return;
    if (!confirm("Remove this player?")) return;

    KidsZoneStore.updateState((state) => {
      state.players = state.players.filter((player) => player.id !== playerId);
      state.logs = state.logs.filter((log) => log.playerId !== playerId);
      return state;
    });
    render();
  }

  function bind() {
    if (bound) return;
    bound = true;
    elements.form.addEventListener("submit", handleSubmit);
    elements.list.addEventListener("click", handleRemove);
  }

  function render() {
    const state = KidsZoneStore.getState();
    bind();
    renderList(state);
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.players = { render };
})();
