(function () {
  function validateResponse(data, allowedIds) {
    if (!data || typeof data !== "object") return null;
    const eventId = String(data.eventId || "");
    if (!allowedIds.includes(eventId)) return null;
    const flavor = String(data.flavor || "").slice(0, 200);
    let sideQuest = null;
    if (data.sideQuest) {
      const type = data.sideQuest.type;
      const prompt = String(data.sideQuest.prompt || "").slice(0, 120);
      const rewardCoins = Number(data.sideQuest.rewardCoins || 0);
      if (
        ["typing_sprint", "math_sprint", "kindness"].includes(type) &&
        rewardCoins >= 0 &&
        rewardCoins <= 10
      ) {
        sideQuest = { type, prompt, rewardCoins };
      }
    }
    return { eventId, flavor, sideQuest };
  }

  async function requestAIEvent() {
    return null;
  }

  window.KidsZoneAI = { validateResponse, requestAIEvent };
})();
