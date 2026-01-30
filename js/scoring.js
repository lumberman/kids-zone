(function () {
  function calculateScore(options) {
    const difficulty = options.difficulty;
    const multiplier = options.multiplier;
    const event = options.event || {};
    const base = difficulty * 10;
    const safeXpMod = Math.max(-0.1, Math.min(0.1, event.xpMod || 0));
    const safeCoinMod = Math.max(-0.1, Math.min(0.1, event.coinMod || 0));
    const xp = Math.round(base * multiplier * (1 + safeXpMod));
    const coins = Math.round((xp / 5) * (1 + safeCoinMod));
    return {
      base,
      multiplier,
      xp,
      coins,
      eventId: event.id || "",
      eventXpMod: safeXpMod,
      eventCoinMod: safeCoinMod,
    };
  }

  window.KidsZoneScoring = { calculateScore };
})();
