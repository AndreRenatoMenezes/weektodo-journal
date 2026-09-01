module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      customFileProtocol: './',
      builderOptions: {
        appId: "io.github.andrerenatomenezes.weektodo-journal",
        productName: "WeekToDo Journal",
        publish: ["github"],
        linux: {
          category: "Utility",
          description: "Planejador semanal minimalista com diario, focado em privacidade. Fork de WeekToDo (GPL-3.0).",
          target: ["deb", "rpm", "pacman","AppImage"],
          icon: "build/icon.icns",
        },
        win: {
          target: ["nsis"],
        },
        mac: {
          category: "public.app-category.productivity",
          target: ["dmg", "pkg"],
        },
      },
    },
  }
};
