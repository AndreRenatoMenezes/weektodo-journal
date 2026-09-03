// Identidade do fork e endpoints externos.
//
// Este arquivo centraliza tudo que aponta para fora do aplicativo. Endpoints
// com valor `null` desativam a funcionalidade que os utiliza — é assim que este
// fork deixa de chamar automaticamente os servidores do projeto original.
export default {
  name: "WeekToDo Journal",
  repoUrl: "https://github.com/AndreRenatoMenezes/weektodo-journal",
  siteUrl: "https://todo.bragademenezes.com",
  changelogUrl: "https://github.com/AndreRenatoMenezes/weektodo-journal/blob/main/changelog.md",

  // JSON no formato { "version": "x.y.z" }. `null` desativa a checagem de
  // atualização no Electron.
  updateManifestUrl: null,

  // API de patrocinadores exibida na splash screen. `null` desativa a chamada.
  sponsorsApiUrl: null,

  // Projeto original do qual este fork deriva (GPL-3.0). Usado para atribuição.
  upstream: {
    name: "WeekToDo",
    author: "Manuel Ernesto Garcia",
    siteUrl: "https://weektodo.me",
    repoUrl: "https://github.com/manuelernestog/weektodo",
  },
};
