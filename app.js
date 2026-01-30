const STORAGE_KEY = "kids-zone-state";

const defaultState = {
  players: [],
  currentTurnIndex: 0,
  history: [],
  taskLogs: [],
  tasks: [
    {
      id: "task-bed",
      title: "Make bed + tidy room",
      category: "Home Base",
      days: [true, true, true, true, true, true, true],
    },
    {
      id: "task-snack",
      title: "Healthy snack helper",
      category: "Home Base",
      days: [true, true, true, true, true, false, false],
    },
    {
      id: "task-reading",
      title: "Reading power-up",
      category: "Brain Boost",
      days: [true, true, true, true, true, false, false],
    },
    {
      id: "task-outdoor",
      title: "Outdoor stretch",
      category: "Body Boost",
      days: [false, false, true, false, true, true, true],
    },
  ],
  ai: {
    apiKey: "",
    model: "openai/gpt-4o-mini",
  },
};

const typingPrompts = [
  "I can do hard things one step at a time.",
  "Kind words help my family feel happy.",
  "I finished my chore and I feel proud.",
  "Small helpers make a big difference.",
  "Practice makes me stronger every day.",
];

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const elements = {
  profileForm: document.getElementById("profile-form"),
  playersList: document.getElementById("players-list"),
  currentTurn: document.getElementById("current-turn"),
  nextTurnButton: document.getElementById("next-turn"),
  choreForm: document.getElementById("chore-form"),
  chorePlayer: document.getElementById("chore-player"),
  choreTask: document.getElementById("chore-task"),
  scorePreview: document.getElementById("score-preview"),
  scoreboard: document.getElementById("scoreboard"),
  history: document.getElementById("history"),
  resetButton: document.getElementById("reset-data"),
  typingPrompt: document.getElementById("typing-prompt"),
  typingForm: document.getElementById("typing-form"),
  typingResult: document.getElementById("typing-result"),
  newPrompt: document.getElementById("new-prompt"),
  aiSettings: document.getElementById("ai-settings"),
  aiPrompt: document.getElementById("ai-prompt"),
  aiSend: document.getElementById("ai-send"),
  aiResponse: document.getElementById("ai-response"),
  aiMic: document.getElementById("ai-mic"),
  micStatus: document.getElementById("mic-status"),
  todayLabel: document.getElementById("today-label"),
};

const screens = Array.from(document.querySelectorAll(".screen"));
const screenButtons = Array.from(document.querySelectorAll("[data-screen-target]"));

let state = loadState();
let typingStartTime = null;

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultState };
  try {
    return { ...defaultState, ...JSON.parse(saved) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ageMultiplier(age) {
  return Math.max(1, 2 - (age - 3) * 0.07);
}

function formatMultiplier(age) {
  return `${ageMultiplier(age).toFixed(2)}x`;
}

function getCurrentPlayer() {
  return state.players[state.currentTurnIndex] || null;
}

function setTurn(index) {
  if (state.players.length === 0) {
    state.currentTurnIndex = 0;
  } else {
    state.currentTurnIndex = (index + state.players.length) % state.players.length;
  }
}

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function getWeekStart(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekDates() {
  const start = getWeekStart(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function getTodayIndex() {
  const day = new Date().getDay();
  return (day + 6) % 7;
}

function updateTodayLabel() {
  elements.todayLabel.textContent = dayLabels[getTodayIndex()];
}

function renderPlayers() {
  elements.playersList.innerHTML = "";
  state.players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="player-badge">
        <span class="badge-dot" style="background:${player.color}"></span>
        <strong>${player.name}</strong> (age ${player.age}) · ${formatMultiplier(player.age)}
      </div>
      <button type="button" data-index="${index}" class="secondary">Remove</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.players.splice(index, 1);
      setTurn(state.currentTurnIndex);
      saveState();
      render();
    });
    elements.playersList.appendChild(card);
  });

  elements.chorePlayer.innerHTML = state.players
    .map(
      (player, index) =>
        `<option value="${index}">${player.name} (age ${player.age})</option>`
    )
    .join("");
}

function renderTasks() {
  elements.choreTask.innerHTML = state.tasks
    .map((task) => `<option value="${task.id}">${task.title}</option>`)
    .join("");
}

function renderTurn() {
  const current = getCurrentPlayer();
  elements.currentTurn.textContent = current
    ? `${current.name}'s turn!`
    : "Add a player to start.";
  elements.nextTurnButton.disabled = !current;
}

function renderScoreboard() {
  elements.scoreboard.innerHTML = "";
  if (!state.tasks.length) {
    elements.scoreboard.innerHTML =
      '<p class="helper">No quests yet. Add one in the Chore Console.</p>';
    return;
  }

  const categories = state.tasks.reduce((grouped, task) => {
    grouped[task.category] = grouped[task.category] || [];
    grouped[task.category].push(task);
    return grouped;
  }, {});

  const weekDates = getWeekDates();
  const todayIndex = getTodayIndex();

  Object.entries(categories).forEach(([category, tasks]) => {
    const categoryWrap = document.createElement("div");
    categoryWrap.className = "quest-category";
    categoryWrap.innerHTML = `<h3>${category}</h3>`;

    tasks.forEach((task) => {
      const row = document.createElement("div");
      row.className = "quest-row";

      const name = document.createElement("div");
      name.className = "quest-name";
      name.textContent = task.title;
      row.appendChild(name);

      let totalDue = 0;
      let completed = 0;

      weekDates.forEach((date, index) => {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";
        dayCell.textContent = dayLabels[index];

        const isDue = task.days[index];
        const dateKey = getDateKey(date);
        const isDone = state.taskLogs.some(
          (log) => log.taskId === task.id && log.date === dateKey
        );

        if (isDue) {
          totalDue += 1;
          dayCell.classList.add("is-due");
        }
        if (isDone) {
          completed += 1;
          dayCell.classList.add("is-done");
        }
        if (index === todayIndex) {
          dayCell.classList.add("is-today");
        }

        row.appendChild(dayCell);
      });

      const progress = document.createElement("div");
      progress.className = "quest-progress";
      const percent = totalDue ? Math.round((completed / totalDue) * 100) : 0;
      progress.textContent = `${percent}%`;
      row.appendChild(progress);

      categoryWrap.appendChild(row);
    });

    elements.scoreboard.appendChild(categoryWrap);
  });
}

function renderHistory() {
  elements.history.innerHTML =
    state.history
      .slice(0, 6)
      .map((entry) => `<div>• ${entry}</div>`)
      .join("") || '<div class="helper">No activity yet.</div>';
}

function updateScorePreview() {
  const playerIndex = Number(elements.chorePlayer.value || 0);
  const player = state.players[playerIndex];
  if (!player) {
    elements.scorePreview.textContent = "Add players to preview scores.";
    return;
  }
  const complexity = Number(elements.choreForm.complexity.value || 3);
  const points = Math.round(complexity * 10 * ageMultiplier(player.age));
  elements.scorePreview.textContent = `Estimated points: ${points} (complexity ${complexity} × ${formatMultiplier(
    player.age
  )}).`;
}

function renderTypingPrompt() {
  const prompt = typingPrompts[Math.floor(Math.random() * typingPrompts.length)];
  elements.typingPrompt.textContent = prompt;
  elements.typingForm.typing.value = "";
  typingStartTime = null;
  elements.typingResult.textContent = "";
}

function logHistory(message) {
  state.history.unshift(message);
  if (state.history.length > 12) state.history.pop();
}

function render() {
  renderPlayers();
  renderTasks();
  renderTurn();
  renderScoreboard();
  renderHistory();
  updateScorePreview();
  updateTodayLabel();
}

function handleAddPlayer(event) {
  event.preventDefault();
  const formData = new FormData(elements.profileForm);
  const name = String(formData.get("name")).trim();
  const age = Number(formData.get("age"));
  const color = String(formData.get("color"));
  if (!name || !age) return;

  state.players.push({
    id: crypto.randomUUID(),
    name,
    age,
    color,
    score: 0,
  });
  saveState();
  elements.profileForm.reset();
  elements.profileForm.age.value = age;
  render();
}

function handleNextTurn() {
  setTurn(state.currentTurnIndex + 1);
  saveState();
  renderTurn();
}

function logTaskCompletion(taskId) {
  const todayKey = getDateKey(new Date());
  state.taskLogs = state.taskLogs.filter(
    (log) => !(log.taskId === taskId && log.date === todayKey)
  );
  state.taskLogs.push({ taskId, date: todayKey });
}

function handleChoreSubmit(event) {
  event.preventDefault();
  const playerIndex = Number(elements.chorePlayer.value);
  const player = state.players[playerIndex];
  if (!player) return;
  const taskId = String(elements.choreForm.task.value);
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const note = String(elements.choreForm.note.value || "").trim();
  const complexity = Number(elements.choreForm.complexity.value);

  const points = Math.round(complexity * 10 * ageMultiplier(player.age));
  player.score = (player.score || 0) + points;
  logTaskCompletion(taskId);

  const message = note
    ? `${player.name} cleared "${task.title}" (${note}) for ${points} pts.`
    : `${player.name} cleared "${task.title}" for ${points} pts.`;
  logHistory(message);

  elements.choreForm.reset();
  elements.choreForm.complexity.value = 3;
  setTurn(playerIndex + 1);
  saveState();
  render();
}

function handleTypingSubmit(event) {
  event.preventDefault();
  const player = getCurrentPlayer();
  if (!player) return;

  const prompt = elements.typingPrompt.textContent.trim();
  const typed = elements.typingForm.typing.value.trim();
  if (!typingStartTime) {
    typingStartTime = Date.now();
  }
  const durationMinutes = Math.max(0.1, (Date.now() - typingStartTime) / 60000);
  const words = prompt.split(/\s+/).length;
  const wpm = Math.round(words / durationMinutes);

  if (typed !== prompt) {
    elements.typingResult.textContent = "Try again! Type the prompt exactly.";
    return;
  }

  const basePoints = Math.max(5, Math.round(wpm));
  const points = Math.round(basePoints * ageMultiplier(player.age));
  player.score = (player.score || 0) + points;
  logHistory(`${player.name} earned ${points} pts in typing (${wpm} WPM).`);
  elements.typingResult.textContent = `Nice job! ${wpm} WPM · +${points} points.`;
  typingStartTime = null;
  saveState();
  render();
}

function handleTypingStart() {
  if (!typingStartTime) typingStartTime = Date.now();
}

function handleReset() {
  if (!confirm("Reset all players and scores?")) return;
  state = { ...defaultState };
  saveState();
  render();
  renderTypingPrompt();
}

function saveAiSettings(event) {
  event.preventDefault();
  const formData = new FormData(elements.aiSettings);
  state.ai.apiKey = String(formData.get("apiKey")).trim();
  state.ai.model = String(formData.get("model")).trim() || defaultState.ai.model;
  saveState();
  elements.aiResponse.textContent = "AI settings saved on this device.";
}

async function handleAiSend() {
  const prompt = elements.aiPrompt.value.trim();
  if (!prompt) return;
  if (!state.ai.apiKey) {
    elements.aiResponse.textContent = "Please save an OpenRouter API key first.";
    return;
  }

  elements.aiResponse.textContent = "Thinking...";
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.ai.apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Kids Zone",
      },
      body: JSON.stringify({
        model: state.ai.model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "AI request failed.");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "No response.";
    elements.aiResponse.textContent = message;
  } catch (error) {
    elements.aiResponse.textContent = "AI error: " + error.message;
  }
}

let recognition;
function setupMicrophone() {
  if ("webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => {
      elements.micStatus.textContent = "Listening...";
    };
    recognition.onerror = () => {
      elements.micStatus.textContent = "Microphone error or permission denied.";
    };
    recognition.onend = () => {
      elements.micStatus.textContent = "";
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      elements.aiPrompt.value = transcript;
    };
  } else {
    elements.micStatus.textContent = "Microphone not supported on this device.";
  }
}

function startMicrophone() {
  if (!recognition) {
    setupMicrophone();
  }
  if (recognition) {
    recognition.start();
  }
}

function showScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === targetId);
  });
}

function ensureDefaults() {
  if (!Array.isArray(state.tasks) || state.tasks.length === 0) {
    state.tasks = [...defaultState.tasks];
  }
  if (!Array.isArray(state.taskLogs)) {
    state.taskLogs = [];
  }
}

function init() {
  ensureDefaults();
  render();
  renderTypingPrompt();
  elements.profileForm.addEventListener("submit", handleAddPlayer);
  elements.nextTurnButton.addEventListener("click", handleNextTurn);
  elements.choreForm.addEventListener("submit", handleChoreSubmit);
  elements.choreForm.complexity.addEventListener("input", updateScorePreview);
  elements.chorePlayer.addEventListener("change", updateScorePreview);
  elements.typingForm.addEventListener("submit", handleTypingSubmit);
  elements.typingForm.typing.addEventListener("input", handleTypingStart);
  elements.newPrompt.addEventListener("click", renderTypingPrompt);
  elements.resetButton.addEventListener("click", handleReset);
  elements.aiSettings.addEventListener("submit", saveAiSettings);
  elements.aiSend.addEventListener("click", handleAiSend);
  elements.aiMic.addEventListener("click", startMicrophone);

  screenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.screenTarget);
    });
  });

  elements.aiSettings.apiKey.value = state.ai.apiKey || "";
  elements.aiSettings.model.value = state.ai.model || defaultState.ai.model;
}

init();
