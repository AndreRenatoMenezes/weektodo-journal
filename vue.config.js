module.exports = {
  // @vue/cli-plugin-pwa le esta chave no topo, nao dentro de pluginOptions.
  pwa: {
    name: "WeekToDo Journal",
    themeColor: "#ffffff",
    msTileColor: "#2b5797",
    // O manifest versionado em public/manifest.json e a base; o plugin so
    // acrescenta a tag <link> e o que faltar.
    manifestPath: "manifest.json",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "default",
    iconPaths: {
      favicon32: "fav_icons/favicon-32x32.png",
      favicon16: "fav_icons/favicon-16x16.png",
      appleTouchIcon: "apple-touch-icon.png",
      maskIcon: "fav_icons/safari-pinned-tab.svg",
      msTileImage: "fav_icons/mstile-150x150.png",
    },
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      // sw.js e resquicio do upstream e nunca e registrado; fora do precache.
      exclude: [/\.map$/, /^manifest.*\.js$/, /^sw\.js$/, /^googled.*\.html$/],
      navigateFallback: "index.html",
      skipWaiting: true,
      clientsClaim: true,
    },
  },
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
