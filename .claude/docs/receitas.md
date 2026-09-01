# Receitas

Passo a passo das alterações mais comuns, seguindo as convenções do projeto.

## Adicionar uma preferência em Configurações

1. **Default:** acrescente a chave em `default_config`,
   `src/repositories/configRepository.js`.
2. **Migração:** crie uma função nova em `src/migrations/migrations.js` e
   chame-a em `migrate()`:
   ```js
   function v2_3_0() {
     let config = configRepository.load();
     if (!("minhaOpcao" in config)) {
       config["minhaOpcao"] = false;
       configRepository.update(config);
     }
   }
   ```
   Sem isso, quem já usa o app fica com `undefined`.
3. **UI:** adicione o controle em `src/views/configModal.vue`, na aba
   apropriada (as abas são declaradas em `src/views/configList.js`).
4. **Gravar:** no handler do controle, o par de sempre:
   ```js
   this.$store.commit("updateConfig", { key: "minhaOpcao", val: novoValor });
   configRepository.update(this.$store.getters.config);
   ```
5. **i18n:** rótulo e descrição em `src/assets/languages/*.json`, seção
   `settings`.
6. **Electron (se aplicável):** se o processo principal precisa saber da opção,
   envie por IPC em `App.vue → syncElectronConfig()` e trate em
   `src/background.js`.

## Adicionar um campo na tarefa

O objeto de tarefa é criado em vários lugares — procure por `repeatingEvent:`
para achá-los (`initialDataCreator.js`, `toDoList.vue`, `toDoModal.vue`).

1. Acrescente o campo com um default em todos esses pontos de criação.
2. **Leia sempre de forma defensiva:** tarefas gravadas antes da sua mudança não
   terão o campo. Use `todo.meuCampo ?? valorPadrao`.
3. Edição no modal de detalhe: `src/views/toDoModal/toDoModal.vue`.
4. Depois de alterar, persista a lista inteira:
   ```js
   toDoListRepository.update(listId, this.$store.getters.todoLists[listId]);
   ```
5. Se o campo precisar existir em tarefas antigas, escreva uma migração que
   varra `todo_lists` no IndexedDB — o `migrations.js` atual só migra o objeto
   `config`, então esse seria um tipo novo de migração.

**Atalho:** os campos `priority` e `tags` já existem no modelo e não têm
interface. Se o recurso couber neles, não precisa mexer no formato dos dados.

## Adicionar um object store novo no IndexedDB

1. Incremente a versão em `dbRepository.open()`:
   ```js
   var req = indexedDB.open('weekToDo', 5);
   ```
2. Crie o store dentro de `onupgradeneeded`, sempre com o guard
   `if (!db.objectStoreNames.contains("meu_store"))`.
3. Crie um repository dedicado em `src/repositories/`, no mesmo formato dos
   existentes.
4. **Inclua o store nas três operações de `src/helpers/exportTool.js`:**
   `export`, `import` e `clear`. Esquecer isso quebra backup e "limpar dados".

## Adicionar um módulo na store

1. Crie `src/store/modules/meuModulo.store.js` com o formato padrão
   (`state`, `getters`, `mutations`, `actions`, `namespaced: false`).
2. Registre em `src/store/store.js`.
3. Como não há namespace, **verifique se os nomes de getters e mutations já não
   existem** em outro módulo.

## Adicionar um modal

1. Crie o `.vue` em `src/views/`, no padrão Bootstrap 5:
   ```html
   <div class="modal fade" id="meuModal" tabindex="-1" aria-hidden="true">
   ```
2. Importe, registre em `components` e coloque a tag no template de `App.vue`
   (junto dos outros modais, perto do fim).
3. Abra por atributo (`data-bs-toggle="modal" data-bs-target="#meuModal"`) ou
   programaticamente (`new Modal(document.getElementById("meuModal")).show()`,
   importando `Modal` de `bootstrap`).
4. Textos via `$t`.

## Adicionar um som de notificação

1. Coloque o `.ogg` em `public/sounds/`.
2. Acrescente o `case` em `playNotificationSound()`,
   `src/helpers/notifications.js`.
3. Adicione a opção no seletor da aba Notificações em `configModal.vue`.

## Mudar a versão do app

Atualize **os dois** arquivos, com o mesmo valor:
- `public/version.json` — lido pelo código; se diferir de `config.version`,
  dispara `migrations.migrate()` e o toast de novidades
- `package.json` — usado pelo electron-builder

E registre as mudanças em `changelog.md` (também é o que cumpre a §5a da GPL).

## Antes de commitar

```bash
yarn run lint
yarn run serve          # exercite o fluxo que você mudou
```

Não há testes automatizados no projeto. Se for adicionar, comece pelos helpers
puros (`tasksHelper`, `repeatingEvents`) — são os que dão retorno mais rápido.
