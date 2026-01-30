(function () {
  const elements = {
    form: document.getElementById("settings-form"),
    exportArea: document.getElementById("export-json"),
    refreshExport: document.getElementById("refresh-export"),
    importForm: document.getElementById("import-form"),
    resetButton: document.getElementById("reset-data"),
  };

  let bound = false;

  function renderSettings(state) {
    elements.form.aiEnabled.value = state.settings.aiEnabled ? "true" : "false";
    elements.form.apiKey.value = state.settings.openRouter.apiKey || "";
    elements.form.model.value = state.settings.openRouter.model || "openai/gpt-4o-mini";
    elements.exportArea.value = KidsZoneStore.exportJSON(state);
  }

  function handleSave(event) {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const aiEnabled = String(formData.get("aiEnabled")) === "true";
    const apiKey = String(formData.get("apiKey") || "").trim();
    const model = String(formData.get("model") || "openai/gpt-4o-mini").trim();

    KidsZoneStore.updateState((state) => {
      state.settings.aiEnabled = aiEnabled;
      state.settings.openRouter.apiKey = apiKey;
      state.settings.openRouter.model = model || "openai/gpt-4o-mini";
      return state;
    });
    render();
  }

  function handleRefreshExport() {
    const state = KidsZoneStore.getState();
    elements.exportArea.value = KidsZoneStore.exportJSON(state);
  }

  function handleImport(event) {
    event.preventDefault();
    const formData = new FormData(elements.importForm);
    const json = String(formData.get("importJson") || "").trim();
    if (!json) return;
    const result = KidsZoneStore.importJSON(json);
    if (!result.ok) {
      alert("Import failed: invalid JSON.");
      return;
    }
    KidsZoneStore.setState(result.state);
    elements.importForm.reset();
    render();
  }

  function handleReset() {
    if (!confirm("Reset all local data?")) return;
    KidsZoneStore.resetState();
    render();
  }

  function bind() {
    if (bound) return;
    bound = true;
    elements.form.addEventListener("submit", handleSave);
    elements.refreshExport.addEventListener("click", handleRefreshExport);
    elements.importForm.addEventListener("submit", handleImport);
    elements.resetButton.addEventListener("click", handleReset);
  }

  function render() {
    const state = KidsZoneStore.getState();
    bind();
    renderSettings(state);
  }

  window.KidsZoneScreens = window.KidsZoneScreens || {};
  window.KidsZoneScreens.settings = { render };
})();
