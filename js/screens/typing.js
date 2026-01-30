(function () {
  const prompts = [
    "I can do hard things one step at a time.",
    "Kind words help my family feel happy.",
    "I finished my quest and I feel proud.",
    "Small helpers make a big difference.",
    "Practice makes me stronger every day.",
  ];

  const elements = {
    prompt: document.getElementById("typing-prompt"),
    form: document.getElementById("typing-form"),
    result: document.getElementById("typing-result"),
    best: document.getElementById("typing-best"),
    newPrompt: document.getElementById("new-prompt"),
  };

  let bound = false;
  let typingStart = null;

  function pickPrompt() {
    const index = Math.floor(Math.random() * prompts.length);
    elements.prompt.textContent = prompts[index];
    elements.form.typing.value = "";
    elements.result.textContent = "";
    typingStart = null;
  }

  function calculateAccuracy(prompt, typed) {
    const maxLength = Math.max(prompt.length, typed.length);
    if (!maxLength) return 0;
    let correct = 0;
    for (let i = 0; i < prompt.length; i += 1) {
      if (prompt[i] === typed[i]) correct += 1;
    }
    return correct / prompt.length;
  }

  function renderBest(state) {
    const current = state.players.find((player) => player.id === state.turn.currentPlayerId);
    if (!current) {
      elements.best.textContent = "Add a player to track best scores.";
      return;
    }
    const best = state.typing.bestByPlayer[current.id];
    if (!best) {
      elements.best.textContent = `Best for ${current.name}: none yet.`;
      return;
    }
    elements.best.textContent = `Best for ${current.name}: ${best.wpm} WPM · ${Math.round(
      best.acc * 100
    )}% accuracy.`;
  }

  function handleStart() {
    if (!typingStart) {
      typingStart = Date.now();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const state = KidsZoneStore.getState();
    const current = state.players.find((player) => player.id === state.turn.currentPlayerId);
    if (!current) {
      elements.result.textContent = "Add a player first.";
      return;
    }

    const prompt = elements.prompt.textContent.trim();
    const typed = elements.form.typing.value.trim();
    if (!typingStart) typingStart = Date.now();
    const durationMinutes = Math.max(0.1, (Date.now() - typingStart) / 60000);
    const words = prompt.split(/\s+/).length;
    const wpm = Math.round(words / durationMinutes);
    const acc = calculateAccuracy(prompt, typed);

    elements.result.textContent = `WPM: ${wpm} · Accuracy: ${Math.round(acc * 100)}%`;

    KidsZoneStore.updateState((next) => {
      const best = next.typing.bestByPlayer[current.id];
      if (!best || wpm > best.wpm) {
        next.typing.bestByPlayer[current.id] = { wpm, acc };
      }
      return next;
    });

    typingStart = null;
    render();
  }

  function bind() {
    if (bound) return;
    bound = true;
    elements.form.addEventListener("submit", handleSubmit);
    elements.form.typing.addEventListener("input", handleStart);
    elements.newPrompt.addEventListener("click", pickPrompt);
  }

  function render() {
    const state = KidsZoneStore.getState();
    bind();
    if (!elements.prompt.textContent) {
      pickPrompt();
    }
    renderBest(state);
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.typing = { render };
})();
