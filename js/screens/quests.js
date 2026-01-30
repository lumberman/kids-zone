(function () {
  const elements = {
    form: document.getElementById("quest-form"),
    list: document.getElementById("quest-list"),
  };

  let bound = false;

  function questRow(quest) {
    const row = document.createElement("div");
    row.className = "list-row";
    row.dataset.id = quest.id;
    row.innerHTML = `
      <label class="inline-input">
        <span class="small">Title</span>
        <input type="text" name="title" value="${quest.title}" />
      </label>
      <label class="inline-input">
        <span class="small">Type</span>
        <select name="type">
          <option value="chore" ${quest.type === "chore" ? "selected" : ""}>Chore</option>
          <option value="learning" ${quest.type === "learning" ? "selected" : ""}>Learning</option>
          <option value="kindness" ${quest.type === "kindness" ? "selected" : ""}>Kindness</option>
          <option value="creative" ${quest.type === "creative" ? "selected" : ""}>Creative</option>
        </select>
      </label>
      <label class="inline-input">
        <span class="small">Base</span>
        <input type="number" name="baseValue" min="5" max="50" value="${quest.baseValue}" />
      </label>
      <div class="inline-actions">
        <label class="inline-input">
          <span class="small">Active</span>
          <select name="active">
            <option value="true" ${quest.active ? "selected" : ""}>Yes</option>
            <option value="false" ${!quest.active ? "selected" : ""}>No</option>
          </select>
        </label>
        <button type="button" data-action="save">Save</button>
      </div>
    `;
    return row;
  }

  function renderList(state) {
    elements.list.innerHTML = "";
    if (!state.quests.length) {
      elements.list.innerHTML = '<p class="helper">No quests yet.</p>';
      return;
    }
    state.quests.forEach((quest) => {
      elements.list.appendChild(questRow(quest));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "chore");
    const baseValue = Number(formData.get("baseValue") || 10);
    if (!title) return;

    KidsZoneStore.updateState((state) => {
      state.quests.push({
        id: KidsZoneStore.generateId("q"),
        title,
        type,
        baseValue,
        active: true,
      });
      return state;
    });

    elements.form.reset();
    elements.form.baseValue.value = 10;
    render();
  }

  function handleSave(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "save") return;
    const row = target.closest(".list-row");
    if (!row) return;
    const questId = row.dataset.id;
    if (!questId) return;

    const titleInput = row.querySelector("input[name='title']");
    const typeSelect = row.querySelector("select[name='type']");
    const baseInput = row.querySelector("input[name='baseValue']");
    const activeSelect = row.querySelector("select[name='active']");

    const title = String((titleInput && titleInput.value) || "").trim();
    const type = String((typeSelect && typeSelect.value) || "chore");
    const baseValue = Number((baseInput && baseInput.value) || 10);
    const active = String((activeSelect && activeSelect.value) || "true") === "true";
    if (!title) return;

    KidsZoneStore.updateState((state) => {
      state.quests = state.quests.map((quest) =>
        quest.id === questId
          ? { ...quest, title, type, baseValue, active }
          : quest
      );
      return state;
    });
    render();
  }

  function bind() {
    if (bound) return;
    bound = true;
    elements.form.addEventListener("submit", handleSubmit);
    elements.list.addEventListener("click", handleSave);
  }

  function render() {
    const state = KidsZoneStore.getState();
    bind();
    renderList(state);
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.quests = { render };
})();
