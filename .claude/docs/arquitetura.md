# Arquitetura

## Ciclo de vida da aplicação

1. **`src/main.js`** cria o app Vue, registra a store, o i18n (locale inicial
   `en`), inicializa o Sentry e importa o CSS global (Bootstrap, bootstrap-icons
   e os três SCSS de `src/assets/style/`).

2. **`App.vue` → `beforeCreate()`** é onde o estado real é carregado:
   - lê `public/version.json`; se a versão for diferente de `config.version`,
     roda `migrations.migrate()`;
   - pede permissão de notificação ao navegador;
   - carrega `customTodoListIds` e `config` do localStorage para a store;
   - aplica o idioma salvo (`this.$i18n.locale`);
   - dispara `loadAllRepeatingEvent`, e no `then` calcula quantas listas devem
     carregar, apaga recorrências vencidas, define a data selecionada como hoje
     e monta o cache de datas de recorrência.

3. **`App.vue` → `mounted()`** posiciona o scroll da semana, registra o listener
   de resize, agenda o fim da splash screen (4,5 s), e no Electron envia os IPCs
   iniciais (`show-current-window`, `match-open-on-startup`).

4. Cada **`toDoList`** carrega sua própria lista do IndexedDB no `mounted` e
   avisa o `App.vue` via evento `todo-list-mounted`. Quando todas terminam, o
   `App.vue` considera a carga inicial concluída.

## Fluxo de dados

```
usuário
   │
   ▼
componente (.vue)
   │  1. this.$store.commit('mutation', payload)   → atualiza estado em memória
   │  2. xRepository.update(id, novoEstado)        → grava no disco
   ▼
store (Vuex)  ──getters──►  componentes re-renderizam
```

**A store não persiste nada por conta própria.** Praticamente todas as mutations
são síncronas e puras sobre o estado; quem chama o repository é o componente,
logo depois do commit. Isso é a convenção mais importante do projeto: se você
faz um `commit` e esquece o `update` do repository, a mudança funciona na tela e
desaparece no reload.

As poucas exceções são as *actions* de leitura em `todolist.store.js` e
`repeatingEvent.store.js`, que leem do IndexedDB e commitam o resultado.

## Camadas

### `src/repositories/` — persistência

Único lugar do código que toca `localStorage` e `indexedDB`.

| Arquivo | Responsabilidade |
|---|---|
| `storageRepository.js` | wrapper cru de localStorage (`get`/`set`/`remove`/`clean`/`as_json`/`load_json`) |
| `configRepository.js` | carrega o objeto `config`, criando o default na primeira execução |
| `customToDoListIdsRepository.js` | array das listas personalizadas |
| `dbRepository.js` | abre o IndexedDB `weekToDo` (v4) e expõe `get`/`add`/`update`/`delete`/`selectAll`/`clear` |
| `toDoListRepository.js` | grava/remove uma lista inteira de tarefas |
| `repeatingEventRepository.js` | grava/remove uma regra de recorrência |
| `repeatingEventByDateRepository.js` | marca quais recorrências já foram geradas por data |

Todos os métodos do IndexedDB abrem uma conexão nova (`dbRepository.open()`) e
trabalham em cima de `onsuccess`. Ninguém espera a conclusão da escrita.

### `src/store/modules/` — estado

Oito módulos, **todos com `namespaced: false`**. Isso significa espaço de nomes
global: um getter `config` é acessível como `$store.getters.config` de qualquer
lugar, e dois módulos não podem declarar o mesmo nome.

| Módulo | Estado |
|---|---|
| `config.store` | objeto de preferências |
| `todolist.store` | `todoLists` (por id), `cTodoListIds`, `selectedDates` |
| `repeatingEvent.store` | `repeatingEventList`, `repeatingEventByDate` |
| `repeatingEventDateCache.store` | mapa `YYYYMMDD -> [ids de recorrência]`, calculado com `rrule` para os próximos 10 anos |
| `notifications.store` | ids de `setTimeout` das notificações agendadas |
| `activeTodo.store` | tarefa aberta no modal de detalhe |
| `actions.store` | sinalizadores entre componentes (lista criada, lista a remover, tarefa selecionada) |
| `main.store` | contador de cliques, elemento para desfazer, lista a limpar |

### `src/helpers/` — lógica sem estado

| Arquivo | O que faz |
|---|---|
| `tasksHelper.js` | conta pendentes e reordena lista (concluídas ao fim, depois por horário) |
| `notifications.js` | agenda `setTimeout` para tarefas com alarme no dia de hoje e toca o som escolhido |
| `repeatingEvents.js` | materializa instâncias de tarefas recorrentes numa data e remove instâncias órfãs |
| `exportTool.js` | exporta backup `.wtdb` (JSON com localStorage + os três object stores) e importa de volta |
| `initialDataCreator.js` | cria as tarefas e listas de exemplo no primeiro uso |
| `languageHelper.js` | lista de idiomas disponíveis |
| `markdownTargetBlankLinks.js` | plugin do markdown-it para abrir links em nova aba |

## Camada Electron

`src/background.js` (processo principal) cuida de:

- janela única (`requestSingleInstanceLock`), tamanho e posição salvos em
  `electron-config`;
- **fechar esconde a janela** quando `runInBackground` está ligado; o app fica
  no tray;
- ícone de tray com menu de contexto (rótulos vêm da UI via IPC, para respeitar
  o idioma);
- IPC recebidos: `show-current-window`, `is-windows-visible`,
  `match-open-on-startup`, `set-open-on-startup`, `set-run-in-background`,
  `set-tray-context-menu-label`, `set-dark-tray-icon`, `clear-config`;
- `setWindowOpenHandler` abre links externos no navegador do sistema.

No renderer, todo código específico de desktop é protegido por `isElectron()`.
`App.vue → syncElectronConfig()` reenvia as preferências relevantes ao processo
principal sempre que elas mudam.

**Segurança:** `nodeIntegration: true` e `contextIsolation: false`. O renderer
tem Node completo. Isso é herança do upstream e deve ser levado em conta antes
de renderizar qualquer conteúdo vindo de fora.

## Rede

Depois do fork, o app **não faz nenhuma chamada de rede automática** por
padrão. Ver `src/appConfig.js`: `updateManifestUrl` e `sponsorsApiUrl` são
`null`, e o código que os usa retorna cedo. O Sentry só transmite se
`VUE_APP_SENTRY_DNS` estiver definido no build.

Links que o usuário clica (modal Sobre, modal de doação) continuam apontando
para o projeto original — isso é atribuição, não telemetria.
