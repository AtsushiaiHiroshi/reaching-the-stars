const MODULE_ID = "alcanzando-las-estrellas";

class GenericAdapter {
  static id = "generic";

  static describe() {
    return {
      system: game.system.id,
      supportsMechanicalContent: false,
      supportsSettingContent: true,
    };
  }
}

class SF2eAdapter extends GenericAdapter {
  static id = "sf2e";

  static describe() {
    return {
      system: "sf2e",
      supportsMechanicalContent: true,
      supportsSettingContent: true,
      testedSystemVersion: "1.2.0",
    };
  }
}

Hooks.once("init", () => {
  const adapter = game.system.id === "sf2e" ? SF2eAdapter : GenericAdapter;

  game.modules.get(MODULE_ID).api = {
    moduleId: MODULE_ID,
    adapter,
    getCapabilities: () => adapter.describe(),
  };

  game.settings.register(MODULE_ID, "settingOnlyMode", {
    name: "ALE.Settings.SettingOnly.Name",
    hint: "ALE.Settings.SettingOnly.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: game.system.id !== "sf2e",
  });
});

Hooks.once("ready", () => {
  const capabilities = game.modules.get(MODULE_ID).api.getCapabilities();
  console.info(`${MODULE_ID} | Ready`, capabilities);
});
