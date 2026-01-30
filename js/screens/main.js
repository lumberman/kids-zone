(function () {
  const elements = {
    scoreboard: document.getElementById("main-scoreboard"),
  };

  function renderScoreboard(state) {
    const container = elements.scoreboard;
    if (!container) return;
    container.innerHTML = "";
    if (!state.players.length) {
      container.innerHTML = '<p class="helper">Add players to start logging quests.</p>';
      return;
    }

    const today = state.meta.day;

    state.players.forEach((player) => {
      const todayLogs = state.logs.filter(
        (log) => log.playerId === player.id && log.day === today
      );
      const totalLogs = state.logs.filter((log) => log.playerId === player.id);

      const todayXp = todayLogs.reduce(
        (sum, log) => sum + ((log.calc && log.calc.xp) || 0),
        0
      );
      const todayCoins = todayLogs.reduce(
        (sum, log) => sum + ((log.calc && log.calc.coins) || 0),
        0
      );
      const totalXp = totalLogs.reduce(
        (sum, log) => sum + ((log.calc && log.calc.xp) || 0),
        0
      );
      const totalCoins = totalLogs.reduce(
        (sum, log) => sum + ((log.calc && log.calc.coins) || 0),
        0
      );

      const card = document.createElement("div");
      card.className = "score-card";
      card.innerHTML = `
        <div class="score-row">
          <strong>${player.name}</strong>
          <span class="pill" style="border-color:${player.color};color:${player.color}">${player.color}</span>
        </div>
        <div class="score-row">
          <span>Today XP</span>
          <strong>${KidsZoneUtils.formatNumber(todayXp)}</strong>
        </div>
        <div class="score-row">
          <span>Today Coins</span>
          <strong>${KidsZoneUtils.formatNumber(todayCoins)}</strong>
        </div>
        <div class="score-row">
          <span>Total XP</span>
          <strong>${KidsZoneUtils.formatNumber(totalXp)}</strong>
        </div>
        <div class="score-row">
          <span>Total Coins</span>
          <strong>${KidsZoneUtils.formatNumber(totalCoins)}</strong>
        </div>
        <div class="small">${
          todayLogs.length
            ? todayLogs
                .map(
                  (log) => `• ${(log.event && log.event.title) || "Quest"}: ${log.questTitle}`
                )
                .join("<br>")
            : "No logs yet today."
        }</div>
      `;
      container.appendChild(card);
    });
  }

  function render() {
    const state = KidsZoneStore.getState();
    renderScoreboard(state);
    KidsZoneApp.updateTodayLabel();
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.main = { render };
})();
