# WeekToDo Journal

Fork de [WeekToDo](https://github.com/manuelernestog/weektodo) v2.2.0 (GPL-3.0).
Planejador semanal minimalista, offline-first, que roda como app web e como
aplicativo desktop Electron a partir do mesmo código.

> **Licença:** GPL-3.0-only. Todo código novo neste repositório é GPL-3.0.
> Não copie código de projetos proprietários nem adicione dependências com
> licença incompatível. Detalhes em `.claude/docs/licenca-e-fork.md`.

## Comandos

```bash
yarn install              # instala dependências (node_modules NÃO vem no repo)
yarn run serve            # dev web em http://localhost:8080
yarn run electron:serve   # dev desktop (Electron + hot reload)
yarn run lint             # ESLint (única checagem automatizada do projeto)
yarn run build            # build web de produção -> dist/
yarn run electron:build   # instaladores desktop -> dist_electron/
docker-compose up         # dev web em container
```

Node 16 é a versão que o projeto assume (webpack 4 / vue-cli 4). Duas
armadilhas de ambiente, ambas verificadas:

- **Node ≥ 22:** `yarn install` falha com *"The engine node is incompatible"* —
  `@achrinza/node-ipc` declara suporte só até o Node 21. Contorne com
  `yarn install --ignore-engines` ou use o Node 16.
- **Node ≥ 17:** o build quebra com `ERR_OSSL_EVP_UNSUPPORTED`. Contorne com
  `NODE_OPTIONS=--openssl-legacy-provider`.

`vue-cli-service` (inclusive `lint`) carrega o plugin do electron-builder, que
exige o binário do Electron instalado. Se você instalou com `--ignore-scripts`,
rode o lint direto: `npx eslint --ext .js,.vue src/`.

**Não há testes.** `yarn test` é um `echo success`. Validação é manual: rode o
app, exercite o fluxo alterado, e rode o lint.

## Stack

Vue 3 (Options API, sem `<script setup>`) · Vuex 4 · vue-i18n 9 · Bootstrap 5 +
bootstrap-icons · SCSS · moment · rrule · markdown-it · Electron 25 via
vue-cli-plugin-electron-builder · Sentry (opcional).

## Arquitetura em uma tela

```
main.js ──► App.vue ──► sideBar / toDoList* ──► listHeader + toDoItem*
              │                                       │
              │                                       └─► toDoModal (detalhe da tarefa)
              ├─► modais (config, about, welcome, donate, tips, recurrent...)
              │
              ├─► store/  (Vuex, estado em memória — a fonte de verdade da UI)
              └─► repositories/  (persistência — localStorage e IndexedDB)
```

Regra central do projeto: **componentes falam com a store; a store não persiste
sozinha.** Quem grava é o componente, chamando o repository logo depois do
`commit`. Ver `.claude/docs/arquitetura.md`.

### Diretórios

| Caminho | Papel |
|---|---|
| `src/main.js` | bootstrap do Vue, i18n, Sentry, CSS global |
| `src/App.vue` | shell da aplicação (861 linhas): carrega config, monta o calendário, controla scroll/divisor, checagens de versão, integração Electron |
| `src/background.js` | processo principal do Electron (janela, tray, IPC, single instance) |
| `src/appConfig.js` | **identidade do fork e endpoints externos** — endpoint `null` desativa a feature |
| `src/components/` | blocos de UI reutilizáveis (listas, itens, sidebar, toasts, modais de confirmação) |
| `src/views/` | telas e modais (configurações, detalhe da tarefa, recorrência, boas-vindas, doação) |
| `src/store/modules/` | 8 módulos Vuex, todos com `namespaced: false` |
| `src/repositories/` | única camada que toca `localStorage` e `IndexedDB` |
| `src/helpers/` | lógica sem estado (notificações, recorrência, ordenação, export/import, markdown) |
| `src/migrations/` | migrações do objeto de config entre versões |
| `src/assets/languages/` | 19 arquivos de tradução + `languages.js` |
| `src/assets/style/` | SCSS global (`globalVars`, `main`, `uiComponents`) |
| `public/` | assets estáticos, `index.html`, `manifest.json`, `version.json`, sons |

## Modelo de dados

Duas camadas de persistência, ambas locais:

**localStorage** (via `storageRepository`)
- `config` — objeto único com ~30 preferências (tema, colunas, zoom, sons,
  comportamento). Default e lista completa em `configRepository.load()`.
- `customTodoListIds` — array `[{listId, listName}]` das listas personalizadas.

**IndexedDB** `weekToDo` v4 (via `dbRepository`), três object stores:
- `todo_lists` — chave é o **id da lista**, valor é o array de tarefas.
  O id é `YYYYMMDD` para dias do calendário e o nome da lista para listas
  personalizadas.
- `repeating_events` — regras de recorrência (RRULE) + o molde da tarefa.
- `repeating_events_by_date` — marca quais recorrências já foram materializadas
  em cada data, para não duplicar.

Formato de uma tarefa:

```js
{ text, checked, listId, desc, subTaskList: [{text, checked, editing}],
  color, priority, tags, time, alarm, repeatingEvent }
```

Detalhes e armadilhas em `.claude/docs/modelo-de-dados.md`.

## Convenções

- **Options API.** Componentes novos seguem o mesmo estilo dos existentes.
- **Vuex sem namespace.** Todos os módulos usam `namespaced: false`, então
  getters e mutations vivem num espaço global — nomes precisam ser únicos.
- **Persistir é responsabilidade do componente.** Sempre o par:
  `this.$store.commit(...)` seguido de `xRepository.update(...)`. Esquecer o
  segundo faz a mudança sumir no reload.
- **Nada de string hard-coded na UI.** Use `$t('secao.chave')` e adicione a
  chave em **todos** os 19 arquivos de `src/assets/languages/`.
- **Nova preferência de config exige migração.** Adicione o default em
  `configRepository.load()` **e** uma função nova em `migrations.js`, senão
  usuários que já têm dados ficam com a chave `undefined`.
- **URLs externas vão em `src/appConfig.js`**, nunca hard-coded no componente.
- Datas sempre com `moment` no formato `YYYYMMDD` para ids de lista.

## Armadilhas conhecidas

- `aboutModal.vue` referencia `<sponsor-modal>` e `<collaborators-modal>` sem
  importar/registrar os componentes — `collaborators-modal` nem existe no repo.
  O Vue emite warning no console. Herdado do upstream, ainda não corrigido.
- `dbRepository` abre uma conexão nova a cada operação e usa callbacks crus;
  não há tratamento de erro além de `console.log`.
- Escritas no IndexedDB são fire-and-forget: ninguém espera `onsuccess`.
- A versão em `public/version.json` é comparada com `config.version` para
  disparar `migrations.migrate()` e o toast de novidades. Ao mudar a versão,
  atualize `public/version.json` **e** `package.json`.
- `nodeIntegration: true` e `contextIsolation: false` no Electron
  (`vue.config.js`, `background.js`): o renderer tem acesso total ao Node.
  Qualquer conteúdo remoto renderizado no app é risco direto.
- Todo acesso a Electron passa por `isElectron()`; código que só existe no
  desktop precisa desse guard, senão quebra a versão web.

## Este fork

Mudanças já feitas em relação ao upstream, e o que ainda falta antes de
publicar (nome, logo, ícones), estão em `.claude/docs/licenca-e-fork.md`.
Ideias de recursos para o journal estão em `.claude/docs/roadmap-fork.md`.
