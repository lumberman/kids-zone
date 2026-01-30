(function () {
  const elements = {
    form: document.getElementById("console-form"),
    playerSelect: document.getElementById("console-player"),
    questSelect: document.getElementById("console-quest"),
    preview: document.getElementById("console-preview"),
    currentTurn: document.getElementById("current-turn"),
    advanceTurn: document.getElementById("advance-turn"),
    history: document.getElementById("console-history"),
  };

  let bound = false;

  function getCurrentPlayer(state) {
    return state.players.find((player) => player.id === state.turn.currentPlayerId) || null;
  }

  function renderPlayers(state) {
    elements.playerSelect.innerHTML = "";
    state.players.forEach((player) => {
      const option = document.createElement("option");
      option.value = player.id;
      option.textContent = `${player.name} (age ${player.age})`;
      elements.playerSelect.appendChild(option);
    });
    const current = getCurrentPlayer(state);
    if (current) {
      elements.playerSelect.value = current.id;
    }
  }

  function renderQuests(state) {
    elements.questSelect.innerHTML = "";
    const activeQuests = state.quests.filter((quest) => quest.active);
    if (!activeQuests.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No active quests";
      elements.questSelect.appendChild(option);
      elements.questSelect.disabled = true;
      return;
    }
    elements.questSelect.disabled = false;
    activeQuests.forEach((quest) => {
      const option = document.createElement("option");
      option.value = quest.id;
      option.textContent = `${quest.title} (${quest.type})`;
      elements.questSelect.appendChild(option);
    });
  }

  function renderTurn(state) {
    const current = getCurrentPlayer(state);
    elements.currentTurn.textContent = current
      ? `${current.name}'s turn!`
      : "Add a player to start.";
    elements.advanceTurn.disabled = !current;
  }

  function renderHistory(state) {
    const items = state.logs.slice(-5).reverse();
    elements.history.innerHTML = items.length
      ? items
          .map(
            (log) =>
              `<div>• ${log.playerName} cleared “${log.questTitle}” (+${log.calc.xp} XP)</div>`
          )
          .join("")
      : '<div class="helper">No quest logs yet.</div>';
  }

  function updatePreview() {
    const state = KidsZoneStore.getState();
    const player = state.players.find((p) => p.id === elements.playerSelect.value);
    const difficulty = Number(elements.form.difficulty.value || 3);
    if (!player) {
      elements.preview.textContent = "Add players to preview scoring.";
      return;
    }
    const base = difficulty * 10;
    const xp = Math.round(base * player.multiplier);
    const coins = Math.round(xp / 5);
    elements.preview.textContent = `Base ${base} · XP ${xp} · Coins ${coins} (no chaos yet)`;
  }

  function handleAdvanceTurn() {
    KidsZoneStore.updateState((state) => {
      if (!state.turn.order.length) return state;
      const nextIndex = (state.turn.index + 1) % state.turn.order.length;
      state.turn.index = nextIndex;
      state.turn.currentPlayerId = state.turn.order[nextIndex];
      return state;
    });
    render();
  }

  function handleSubmit(event) {
    event.preventDefault();
    const state = KidsZoneStore.getState();
    const playerId = elements.playerSelect.value;
    const questId = elements.questSelect.value;
    const player = state.players.find((p) => p.id === playerId);
    const quest = state.quests.find((q) => q.id === questId);
    if (!player || !quest) return;

    const difficulty = Number(elements.form.difficulty.value || 3);
    const note = String(elements.form.note.value || "").trim();

    const event = KidsZoneEvents.getEventForLog(state.meta.day, state.logs.length + 1);
    const calc = KidsZoneScoring.calculateScore({
      difficulty,
      multiplier: player.multiplier,
      event,
    });

    KidsZoneStore.updateState((next) => {
      next.logs.push({
        id: KidsZoneStore.generateId("l"),
        ts: Date.now(),
        day: next.meta.day,
        playerId,
        playerName: player.name,
        questId,
        questTitle: quest.title,
        difficulty,
        note,
        calc,
        event: {
          id: event.id,
          title: event.title,
          flavor: event.flavor,
        },
      });

      if (next.turn.order.length) {
        const nextIndex = (next.turn.index + 1) % next.turn.order.length;
        next.turn.index = nextIndex;
        next.turn.currentPlayerId = next.turn.order[nextIndex];
      }
      return next;
    });

    elements.form.reset();
    elements.form.difficulty.value = 3;
    render();
  }

  function bind() {
    if (bound) return;
    bound = true;
    elements.form.addEventListener("submit", handleSubmit);
    elements.form.difficulty.addEventListener("input", updatePreview);
    elements.playerSelect.addEventListener("change", updatePreview);
    elements.advanceTurn.addEventListener("click", handleAdvanceTurn);
  }

  function render() {
    const state = KidsZoneStore.getState();
    bind();
    renderPlayers(state);
    renderQuests(state);
    renderTurn(state);
    renderHistory(state);
    updatePreview();
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.console = { render };
})();
