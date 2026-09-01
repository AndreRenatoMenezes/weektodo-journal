# Modelo de dados

Tudo é local. Não existe servidor, conta de usuário ou sincronização.

## localStorage

### `config`
Objeto único com todas as preferências. O default vive em
`src/repositories/configRepository.js`:

| Chave | Default | Significado |
|---|---|---|
| `darkTheme` | `false` | tema escuro |
| `customList` / `calendar` | `true` | mostrar cada um dos dois painéis |
| `firstTimeOpen` | `true` | dispara o modal de boas-vindas |
| `language` | `"en"` | locale do vue-i18n |
| `version` | versão atual | comparada com `public/version.json` |
| `checkUpdates` | `true` | checagem de atualização (desativada neste fork) |
| `columns` / `customColumns` | `5` | colunas visíveis em cada painel |
| `zoom` | `100` | zoom da interface em % |
| `calendarHeight` | `calc(50% - 50px)` | altura do painel do calendário |
| `notificationOnStartup` | `true` | notificar tarefas do dia ao abrir |
| `notificationSound` | `"pop"` | som (`pop`, `positive`, `bell`, `soft`, `tiny`, `piano`, `soft-bell`, `metal`, `none`) |
| `openOnStartup` / `runInBackground` | `true` | comportamento do desktop |
| `moveOldTasks` | `true` | mover tarefas não feitas de dias passados |
| `mainDividerPosition` | `1` | 0 = calendário maximizado, 1 = meio, 2 = listas maximizadas |
| `darkTrayIcon` | `false` | ícone claro/escuro no tray |
| `importing` | `false` | flag usada durante import de backup |
| `compactView` | `true` | densidade das listas |
| `startCalendarYesterday` | `false` | primeira coluna é ontem |
| `notificationIndicator` | `true` | bolinha de pendências |
| `autoReorderTasks` | `false` | reordenar automaticamente |
| `moveCompletedTaskToBottom` | `true` | concluídas vão para o fim |
| `moveCompletedSubTaskToBottom` | `true` | idem para subtarefas |
| `fullscreenToDoModal` | `false` | modal de detalhe em tela cheia |
| `weekStartOnMonday` | `true` | primeiro dia da semana |
| `lastDayOpened` | hoje | detecta virada de dia |
| `dateToShowInitialDonateModal` / `InitialDonateModalShown` | — | agendamento do modal de doação |
| `reportErrors` | `false` | (só criada por migração) envio de erros |

### `customTodoListIds`
Array na ordem de exibição:
```js
[{ listId: "Projetos", listName: "Projetos" }, ...]
```
O `listId` de uma lista personalizada **é o nome dela**. Renomear implica mover
os dados de chave no IndexedDB.

## IndexedDB

Banco `weekToDo`, versão **4**, definido em `src/repositories/dbRepository.js`.

### `todo_lists`
- **chave:** id da lista
  - dia do calendário → `"YYYYMMDD"` (ex.: `"20260901"`)
  - lista personalizada → o nome da lista
- **valor:** array de tarefas

```js
{
  text: "Comprar pão",
  checked: false,
  listId: "20260901",
  desc: "",                 // markdown
  subTaskList: [ { text, checked, editing } ],
  color: "none",            // "none" ou hex, ex. "#77e785"
  priority: 0,
  tags: [],                 // presente no modelo, ainda sem UI
  time: null,               // "HH:mm"
  alarm: false,             // dispara notificação em `time`
  repeatingEvent: null      // id da regra que gerou esta instância
}
```

`priority` e `tags` existem no modelo desde o upstream mas **não têm interface**
— são pontos de extensão prontos para o fork usar.

### `repeating_events`
- **chave:** id da regra
- **valor:** `{ id, repeating_rule, end_date, data }`, onde `repeating_rule` é
  uma string RRULE (biblioteca `rrule`) e `data` é o molde da tarefa a ser criada.

### `repeating_events_by_date`
- **chave:** id da lista/data
- **valor:** `{ [idDaRegra]: true }` — marca que aquela recorrência já foi
  materializada naquela data, evitando duplicação.

## Como a recorrência funciona

1. `repeatingEventDateCache.store` expande cada RRULE com `rrule.between(hoje,
   hoje + 10 anos)` e monta o mapa `YYYYMMDD -> [ids de regra]`. Isso fica só em
   memória.
2. Quando uma `toDoList` de uma data monta, `helpers/repeatingEvents.js`
   consulta esse cache; para cada regra ainda não materializada naquela data,
   clona `regra.data`, ajusta o `listId` e insere a tarefa.
3. A materialização é registrada em `repeating_events_by_date`, então a tarefa
   não é recriada no próximo carregamento.
4. `App.vue → deleteOldRepeatingEvents()` remove regras cujo `end_date` já
   passou.

Consequência prática: **tarefas recorrentes só existem no banco depois que o
dia é aberto na interface**. Antes disso, elas são apenas uma regra.

## Backup

`helpers/exportTool.js` gera um arquivo `.wtdb` — JSON contendo o dump do
localStorage mais os três object stores:

```js
{ config, customTodoListIds, todoLists: {...}, repeating_events: {...},
  repeating_events_by_date: {...} }
```

O import valida apenas a presença da chave `config`, sobrescreve tudo e roda as
migrações. Não há versionamento de formato no arquivo de backup — se você mudar
o formato dos dados no fork, **acrescente uma migração** e considere gravar um
número de versão no backup.

## Regras ao mexer nos dados

- **Nova preferência de config:** adicione o default em `configRepository.load()`
  *e* uma função nova em `src/migrations/migrations.js`, chamada dentro de
  `migrate()`. Sem a migração, quem já usa o app fica com a chave `undefined`.
- **Novo campo na tarefa:** trate `undefined` na leitura; tarefas antigas não
  terão o campo. Uma migração de dados exigiria varrer todos os `todo_lists`.
- **Novo object store:** incremente a versão do IndexedDB em `dbRepository.open()`
  e crie o store dentro de `onupgradeneeded`. Lembre de incluí-lo no
  `exportTool` (export, import e clear).
