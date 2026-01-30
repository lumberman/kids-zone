(function () {
  const STORAGE_KEY = "kidszone_v1";
  const VERSION = 1;

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function generateId(prefix) {
    const rand = Math.floor(Math.random() * 1000000);
    return `${prefix}_${Date.now()}_${rand}`;
  }

  function seedQuests() {
    return [
      {
        id: generateId("q"),
        title: "Put away toys",
        type: "chore",
        baseValue: 10,
        active: true,
      },
      {
        id: generateId("q"),
        title: "Reading power-up",
        type: "learning",
        baseValue: 10,
        active: true,
      },
      {
        id: generateId("q"),
        title: "Kindness helper",
        type: "kindness",
        baseValue: 10,
        active: true,
      },
      {
        id: generateId("q"),
        title: "Creative sketch",
        type: "creative",
        baseValue: 10,
        active: true,
      },
    ];
  }

  function createDefaultState() {
    const today = getTodayKey();
    return {
      meta: { version: VERSION, day: today, lastActiveTs: Date.now() },
      settings: {
        theme: "pixel",
        audio: true,
        aiEnabled: false,
        openRouter: { apiKey: "", model: "openai/gpt-4o-mini" },
      },
      players: [],
      quests: seedQuests(),
      turn: { currentPlayerId: "", order: [], index: 0 },
      logs: [],
      typing: { bestByPlayer: {} },
    };
  }

  function normalizeState(raw) {
    const fallback = createDefaultState();
    if (!raw || typeof raw !== "object") return fallback;

    const meta = raw.meta || {};
    const settings = raw.settings || {};
    const openRouter = settings.openRouter || {};
    const turn = raw.turn || {};
    const typing = raw.typing || {};

    const state = {
      meta: {
        version: VERSION,
        day: meta.day || fallback.meta.day,
        lastActiveTs: meta.lastActiveTs || Date.now(),
      },
      settings: {
        theme: settings.theme || "pixel",
        audio: settings.audio !== false,
        aiEnabled: !!settings.aiEnabled,
        openRouter: {
          apiKey: openRouter.apiKey || "",
          model: openRouter.model || "openai/gpt-4o-mini",
        },
      },
      players: Array.isArray(raw.players) ? raw.players : [],
      quests: Array.isArray(raw.quests) && raw.quests.length ? raw.quests : seedQuests(),
      turn: {
        currentPlayerId: turn.currentPlayerId || "",
        order: Array.isArray(turn.order) ? turn.order : [],
        index: Number.isFinite(turn.index) ? turn.index : 0,
      },
      logs: Array.isArray(raw.logs) ? raw.logs : [],
      typing: {
        bestByPlayer: typing.bestByPlayer || {},
      },
    };

    return state;
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return normalizeState(null);
    try {
      const parsed = JSON.parse(saved);
      return normalizeState(parsed);
    } catch (error) {
      return normalizeState(null);
    }
  }

  function saveState(nextState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  function exportJSON(state) {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(json) {
    try {
      const parsed = JSON.parse(json);
      const normalized = normalizeState(parsed);
      return { ok: true, state: normalized };
    } catch (error) {
      return { ok: false, error: "Invalid JSON" };
    }
  }

  let state = loadState();

  function syncDay() {
    const today = getTodayKey();
    if (state.meta.day !== today) {
      state.meta.day = today;
    }
    state.meta.lastActiveTs = Date.now();
  }

  function syncTurnOrder() {
    const playerIds = state.players.map((player) => player.id);
    const currentOrder = state.turn.order.filter((id) => playerIds.includes(id));
    const missing = playerIds.filter((id) => !currentOrder.includes(id));
    state.turn.order = currentOrder.concat(missing);
    if (!state.turn.order.length) {
      state.turn.currentPlayerId = "";
      state.turn.index = 0;
      return;
    }
    if (!state.turn.currentPlayerId || !playerIds.includes(state.turn.currentPlayerId)) {
      state.turn.currentPlayerId = state.turn.order[0];
      state.turn.index = 0;
    } else {
      state.turn.index = Math.max(0, state.turn.order.indexOf(state.turn.currentPlayerId));
    }
  }

  function getState() {
    syncDay();
    syncTurnOrder();
    return state;
  }

  function setState(nextState) {
    state = normalizeState(nextState);
    syncDay();
    syncTurnOrder();
    saveState(state);
    return state;
  }

  function updateState(updater) {
    const next = updater(getState());
    return setState(next || state);
  }

  function resetState() {
    state = createDefaultState();
    saveState(state);
    return state;
  }

  window.KidsZoneStore = {
    STORAGE_KEY,
    createDefaultState,
    exportJSON,
    importJSON,
    getState,
    setState,
    updateState,
    resetState,
    generateId,
    getTodayKey,
  };
})();
