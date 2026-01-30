(function () {
  const deck = [
    {
      id: "ev_lucky_find",
      title: "Lucky Find",
      xpMod: 0,
      coinMod: 0.1,
      flavorTemplates: [
        "A sock relic grants extra coins.",
        "You found shiny change in the couch!",
      ],
    },
    {
      id: "ev_focus_mode",
      title: "Focus Mode",
      xpMod: 0.1,
      coinMod: 0,
      flavorTemplates: ["Eyes on the quest. Extra XP!", "Deep focus powers you up."],
    },
    {
      id: "ev_team_cheer",
      title: "Team Cheer",
      xpMod: 0.05,
      coinMod: 0.05,
      flavorTemplates: ["Family cheers boost the reward!", "High-fives echo in the halls."],
    },
    {
      id: "ev_quiet_win",
      title: "Quiet Win",
      xpMod: 0,
      coinMod: 0,
      flavorTemplates: ["A calm win in the quest log.", "Steady steps, steady progress."],
    },
    {
      id: "ev_spark_of_joy",
      title: "Spark of Joy",
      xpMod: 0.05,
      coinMod: 0,
      flavorTemplates: ["A tiny spark adds extra XP.", "Joy flickers in the quest board."],
    },
    {
      id: "ev_bonus_coin",
      title: "Bonus Coin",
      xpMod: 0,
      coinMod: 0.08,
      flavorTemplates: ["A bonus coin bounces into your pouch.", "Coins clink softly."],
    },
    {
      id: "ev_low_grav",
      title: "Low Gravity",
      xpMod: 0.08,
      coinMod: -0.05,
      flavorTemplates: ["Low gravity makes XP float up.", "Floaty steps, steady XP."],
    },
    {
      id: "ev_treasure_map",
      title: "Treasure Map",
      xpMod: -0.05,
      coinMod: 0.1,
      flavorTemplates: ["A map trades XP for coins.", "The map points to extra coins."],
    },
    {
      id: "ev_breezy_day",
      title: "Breezy Day",
      xpMod: 0.03,
      coinMod: 0.03,
      flavorTemplates: ["A breezy day makes the quest easier.", "Wind at your back!"],
    },
    {
      id: "ev_sticky_socks",
      title: "Sticky Socks",
      xpMod: -0.05,
      coinMod: -0.05,
      flavorTemplates: ["Sticky socks slow you down a little.", "Oops! A tiny slowdown."],
    },
  ];

  function hashSeed(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function mulberry32(seed) {
    let t = seed + 0x6d2b79f5;
    return function () {
      t += 0x6d2b79f5;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getEventForLog(dayKey, logCount) {
    const seed = hashSeed(`${dayKey}:${logCount}`);
    const random = mulberry32(seed);
    const eventIndex = Math.floor(random() * deck.length);
    const event = deck[eventIndex];
    const flavorIndex = Math.floor(random() * event.flavorTemplates.length);
    const flavor = event.flavorTemplates[flavorIndex];
    return { ...event, flavor };
  }

  window.KidsZoneEvents = { deck, getEventForLog };
})();
