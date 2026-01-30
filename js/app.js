(function () {
  function getMultiplier(age) {
    if (age <= 3) return 2.2;
    if (age <= 7) return 1.7;
    if (age <= 14) return 1.0;
    return 1.0;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function updateTodayLabel() {
    const label = document.getElementById("today-label");
    if (!label) return;
    label.textContent = KidsZoneStore.getTodayKey();
  }

  window.KidsZoneUtils = { getMultiplier, formatNumber };

  function init() {
    updateTodayLabel();
    KidsZoneRouter.init(
      {
        "/main": KidsZoneScreens.main.render,
        "/players": KidsZoneScreens.players.render,
        "/quests": KidsZoneScreens.quests.render,
        "/console": KidsZoneScreens.console.render,
        "/typing": KidsZoneScreens.typing.render,
        "/story": KidsZoneScreens.story.render,
        "/settings": KidsZoneScreens.settings.render,
      },
      "/main"
    );
  }

  window.KidsZoneApp = { updateTodayLabel };

  init();
})();
