(function () {
  const elements = {
    feed: document.getElementById("story-feed"),
  };

  function renderFeed(state) {
    if (!elements.feed) return;
    if (!state.logs.length) {
      elements.feed.innerHTML = '<div class="helper">No story entries yet.</div>';
      return;
    }
    elements.feed.innerHTML = state.logs
      .slice()
      .reverse()
      .map(
        (log) => `
        <div>
          <strong>${log.playerName}</strong> completed <em>${log.questTitle}</em>.
          <div class="small">${(log.event && log.event.title) || "Quest"}: ${
          (log.event && log.event.flavor) || ""}
          </div>
        </div>
      `
      )
      .join("");
  }

  function render() {
    const state = KidsZoneStore.getState();
    renderFeed(state);
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.story = { render };
})();
