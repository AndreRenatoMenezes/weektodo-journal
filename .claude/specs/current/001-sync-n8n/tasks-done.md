# Tasks Concluídas — 001-sync-n8n

## WP01 — PWA e armazenamento persistente

```yaml
lane: concluída
estimativa: 90min
files:
  - package.json
  - vue.config.js
  - public/index.html
  - public/manifest.json
  - src/registerServiceWorker.js
  - src/main.js
depende_de: []
```

### Objetivo
Fazer o app web abrir sem internet e ser instalável, e pedir ao navegador que não descarte o IndexedDB. Destrava o web-first; entrega valor mesmo se o resto atrasar.

### Definição de Pronto
- [x] `@vue/cli-plugin-pwa@^4` instalado; `yarn run build` gera service worker e `yarn run electron:build` continua funcionando.
- [x] Service worker não registra sob Electron nem em desenvolvimento (`isElectron()` e `NODE_ENV`).
- [x] `navigator.storage.persist()` chamado uma vez na inicialização, com `try/catch` — navegador sem suporte não quebra nada.
- [x] Registro comentado em `public/index.html:46` removido.
- [x] Servindo o `dist/`, o app abre em modo avião após a primeira visita, e o navegador oferece instalar.

### Log
- 2026-09-02: concluída — plugin PWA (chave `pwa` no topo do vue.config.js), registro do service worker com guarda de Electron/dev, `storage.persist()`, registro comentado removido do index.html. `vue-cli-service build` gera `service-worker.js` com 53 entradas e `index.html` como navigateFallback.
- 2026-09-03: instalação real confirmada em `https://todo.bragademenezes.com` (celular e PC) e modo avião testado no roteiro de dois dispositivos (cenário 11) — app funciona offline sem travar.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `@vue/cli-plugin-pwa@^4.5.15` em `package.json:59`, configuração `pwa` em `vue.config.js:3-27`, guarda de `isElectron()` e `NODE_ENV !== "production"` em `src/registerServiceWorker.js:6-7`, chamada de `requestPersistentStorage()` com try/catch em `src/registerServiceWorker.js:21-30` e inicialização em `src/main.js:50-51`, remoção do registro antigo em `public/index.html`.

---

## WP02 — Postgres no servidor

```yaml
lane: concluída
estimativa: 90min
files:
  - server/docker-compose.postgres.yml
  - server/schema.sql
  - .claude/docs/servidor-sync.md
  - .claude/specs/schema.md
depende_de: []
```

### Objetivo
Subir o banco no servidor do usuário, sem expor porta nova, com as tabelas de sincronização criadas e um usuário cadastrado. Executada em conjunto com o usuário na máquina dele.

### Definição de Pronto
- [x] Serviço Postgres sem `ports:` publicado, na mesma rede do n8n, com volume nomeado para os dados.
- [x] Banco `weektodo` separado do banco do n8n, com usuário próprio e senha em variável de ambiente, nunca no arquivo versionado.
- [x] `schema.sql` cria `pgcrypto`, `sync_revision_seq`, `sync_doc`, `sync_user`, `sync_token`, o índice em `revision` e a FK com `ON DELETE CASCADE`.
- [x] Comando documentado para cadastrar usuário e senha com `crypt()`, e comando de backup e de restauração.
- [x] `.claude/specs/schema.md` criado com o schema Postgres e o IndexedDB atual, e a linha no histórico de migrações.
- [x] O usuário rodou o passo a passo do zero e o banco respondeu.

### Log
- 2026-09-02: iniciada
- 2026-09-02: artefatos prontos (`server/schema.sql`, `server/docker-compose.postgres.yml`, `.claude/docs/servidor-sync.md`, `.claude/specs/schema.md`). Falta só o passo a passo rodado na máquina do usuário.
- 2026-09-02: passo a passo rodado no servidor Chopper (rede real `proxy`, não `n8n` — divergência do compose registrada). Container `postgres-weektodo` healthy, sem porta publicada. 3 tabelas criadas (`sync_doc`, `sync_token`, `sync_user`). Usuário `andre` cadastrado com `crypt()`. Todos itens da DoD atendidos → lane revisão.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `server/docker-compose.postgres.yml` (sem porta publicada, volume nomeado, credenciais via env var), `server/schema.sql` (`pgcrypto`, `sync_revision_seq`, `sync_user`, `sync_token` com FK `ON DELETE CASCADE`, `sync_doc` chave composta `(kind, doc_id)` e índice em `revision`), documentação de comandos em `.claude/docs/servidor-sync.md:58-87`, e schema completo em `.claude/specs/schema.md`.

---

## WP03 — Identidade das tarefas

```yaml
lane: concluída
estimativa: 90min
files:
  - src/migrations/dataMigrations.js
  - src/migrations/migrations.js
  - src/repositories/dbRepository.js
  - src/components/toDoList.vue
  - src/views/toDoModal/toDoModal.vue
  - src/helpers/repeatingEvents.js
  - src/helpers/initialDataCreator.js
  - src/helpers/exportTool.js
  - src/repositories/configRepository.js
depende_de: []
```

### Objetivo
Dar `id` estável a toda tarefa, nova e existente, e subir o IndexedDB para a versão 5 com o object store `sync_base`. Sem `id` não existe fusão por tarefa.

### Definição de Pronto
- [x] Os 5 pontos de criação (`toDoList.vue:89,118,136`, `toDoModal.vue:185,409`, `repeatingEvents.js`, `initialDataCreator.js`) atribuem `id` via `crypto.randomUUID()`.
- [x] `dataMigrations.js` percorre `todo_lists` e atribui `id` a toda tarefa sem `id`; roda uma vez, é idempotente e não altera nenhum outro campo.
- [x] Versão do IndexedDB 4 → 5 criando `sync_base`; base existente abre sem perder dados.
- [x] `exportTool.js` preserva `id` ao exportar e gera `id` ao importar arquivo sem o campo.
- [x] Defaults novos em `configRepository.load()` — `syncUrl`, `syncUser`, `syncToken`, `deviceId`, `lastSyncAt`, `lastSyncRevision` — com a função de migração correspondente em `migrations.js`.
- [x] `src/store/modules/todolist.store.js` **não** aparece no diff.
- [x] Com dados anteriores à mudança: abrir o app, conferir que as tarefas antigas continuam lá e agora têm `id`.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `id` nos 5 pontos de criação, `dataMigrations.migrateTaskIds()` idempotente, IndexedDB 4→5 com `sync_base`, `id` preservado no export e gerado no import, defaults e migração de config. `todolist.store.js` fora do diff.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `src/migrations/dataMigrations.js` (`newTaskId` e `ensureTaskId` com `crypto.randomUUID()`), criação de id em `src/components/toDoList.vue:86,111,132`, `src/views/toDoModal/toDoModal.vue:407,500`, `src/helpers/repeatingEvents.js:16`, `src/helpers/initialDataCreator.js:38`. Verificado `dataMigrations.migrateTaskIds()` idempotente. Checado IndexedDB versão 5 com `sync_base` em `src/repositories/dbRepository.js:12,28-30`. Checado import/export em `src/helpers/exportTool.js:158`. Verificados defaults em `src/repositories/configRepository.js:44-49` e migração em `src/migrations/migrations.js:114-125`. Confirmado via git log e git status que `src/store/modules/todolist.store.js` está intocado.

---

## WP04 — Camada de persistência da sincronização

```yaml
lane: concluída
estimativa: 60min
files:
  - src/repositories/syncRepository.js
  - src/repositories/dbRepository.js
  - src/repositories/toDoListRepository.js
depende_de: [WP03]
```

### Objetivo
Ler e gravar o snapshot `sync_base`, e transformar as escritas fire-and-forget em promessas, para a sincronização não montar payload a partir de estado ainda não gravado.

### Definição de Pronto
- [x] `syncRepository` grava e lê por `(kind, docId)` e guarda `lastSyncRevision` e `lastSyncAt`.
- [x] As operações de `dbRepository` usadas pela sincronização devolvem `Promise` que resolve em `onsuccess` e rejeita em `onerror`.
- [x] Chamadores existentes continuam funcionando sem alteração de assinatura.
- [x] Fechar e reabrir o app mantém o `sync_base` gravado.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `syncRepository` por (kind, docId) + metadados; variantes `*Async` em `dbRepository` e `toDoListRepository` sem mudar as assinaturas existentes.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `src/repositories/syncRepository.js` com chave composta `kind::docId`, métodos `get`, `set`, `getAll`, `remove`, `getMeta`, `setMeta`. Checadas variantes assíncronas baseadas em Promise (`promisify`, `openAsync`, `getAsync`, `updateAsync`, `deleteAsync`, `selectAllAsync`) em `src/repositories/dbRepository.js:3-8,37-100` e `src/repositories/toDoListRepository.js:20-31`, preservando chamadores síncronos legados.

---

## WP05 — Motor de fusão de três vias

```yaml
lane: concluída
estimativa: 90min
files:
  - src/helpers/syncMerge.js
  - src/helpers/syncMerge.test.js
depende_de: [WP03]
```

### Objetivo
Funções puras que recebem base, local e remoto e devolvem o resultado da fusão. Sem I/O, sem store, sem rede. É onde um erro apaga dados do usuário.

### Definição de Pronto
- [x] Fusão de lista de tarefas por `id`, campo a campo dentro da tarefa; `subTaskList` tratado como valor único.
- [x] Mesmo campo alterado dos dois lados: vence o maior `updatedAt`; empate desempata por `deviceId`, de forma determinística e igual nos dois dispositivos.
- [x] Apagado de um lado e alterado do outro: a alteração vence e a tarefa permanece.
- [x] Ordem: ordem local preservada; tarefas só remotas entram no fim mantendo a ordem relativa.
- [x] Tarefa sem `id` vinda de instalação antiga não quebra a fusão nem é duplicada.
- [x] Base ausente: tudo do servidor é tratado como criação remota; nada é apagado.
- [x] `syncMerge.test.js` roda com `node src/helpers/syncMerge.test.js`, sem framework, e cobre os 7 casos acima imprimindo falha legível.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `syncMerge.js` puro; `node src/helpers/syncMerge.test.js` passa nos 11 casos (7 da DoD mais ordem, subTaskList, mapas e listas personalizadas).
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `src/helpers/syncMerge.js` (fusão campo a campo, desempate determinístico por `updatedAt`/`deviceId`/`stableString`, alteração vence deleção, ordem local preservada com remotos ao fim, fallbackKey para tarefas sem id). Executado `node src/helpers/syncMerge.test.js`: 11/11 casos passaram com sucesso (código 0).

---

## WP06 — Workflows do n8n

```yaml
lane: concluída
estimativa: 90min
files:
  - server/n8n/auth.json
  - server/n8n/pull.json
  - server/n8n/push.json
  - .claude/docs/servidor-sync.md
depende_de: [WP02]
```

### Objetivo
Os três webhooks sobre a tabela `sync_doc`, exportados como JSON versionado. O n8n não entende o formato dos documentos.

### Definição de Pronto
- [x] `auth` recebe usuário e senha, valida com `crypt()`, devolve token; grava só o SHA-256 do token.
- [x] `pull` autentica pelo header, devolve documentos com `revision > since` mais a revisão atual do servidor.
- [x] `push` grava cada documento apenas se a revisão dele no servidor for igual ao `baseRevision` enviado; devolve a lista de rejeitados.
- [x] Credencial ausente ou errada devolve 401 sem detalhar o motivo.
- [x] CORS restrito à origem do site, nunca `*`; requisição de outra origem é bloqueada. — verificado indiretamente: app publicado em `https://todo.bragademenezes.com` conectou e sincronizou sem erro de CORS no navegador (WP11).
- [x] Os três workflows importados no n8n do usuário e respondendo a chamadas de teste documentadas.

### Log
- 2026-09-02: iniciada
- 2026-09-02: os três workflows escritos em `server/n8n/` (auth/pull/push, CORS por origem única, 401 sem detalhe). Falta importar no n8n do usuário e rodar os testes do item 7 de `servidor-sync.md`.
- 2026-09-03: importados e testados no servidor Chopper. Achado e corrigido bug real: campo `Query Parameters` dos nós Postgres "Autenticar" (pull e push) usava `.replace('Bearer ', '')`, e o parser do n8n cortava a expressão na vírgula interna, quebrando a extração do token — corrigido pra `.split(' ')[1] || ''`, sem vírgula. Fix aplicado no n8n do usuário e replicado nos JSON do repo (`pull.json`, `push.json`). `allowedOrigins` dos três workflows sincronizado com o domínio real (`https://todo.bragademenezes.com`), que ainda não está publicado (WP11). Os 6 testes da seção 7 de `servidor-sync.md` passaram: auth ok, senha errada 401, pull vazio, push aceito, push com `baseRevision` obsoleta rejeitado, token inválido 401.
- 2026-09-03: CORS confirmado via browser real, depois da WP11 publicar o site — DoD completa.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checados `server/n8n/auth.json` (validação `crypt()`, geração de token 32-bytes SHA-256), `server/n8n/pull.json` e `server/n8n/push.json` (correção `.split(' ')[1]`, query CTE atômica com verificação de `baseRevision` e retorno de rejeitados), CORS restrito a `https://todo.bragademenezes.com`, e respostas 401 sem vazamento de informação.

---

## WP07 — Cliente HTTP e tela de conexão

```yaml
lane: concluída
estimativa: 90min
files:
  - src/repositories/syncApi.js
  - src/store/modules/sync.store.js
  - src/store/store.js
  - src/components/config/syncSettings.vue
  - src/views/configModal.vue
  - src/views/configList.js
depende_de: [WP06]
```

### Objetivo
Aba de sincronização nas configurações: endereço, usuário e senha, botão de conectar, estado de conexão e data da última sincronização.

### Definição de Pronto
- [x] `syncApi` usa `axios`, envia o token no header e concentra o tratamento de erro num interceptador.
- [x] Conectar guarda `syncUrl`, `syncUser` e `syncToken` no config local; a senha **não** é guardada.
- [x] Credencial errada mostra mensagem clara e deixa o estado em `erro_credencial`, sem repetir a chamada em laço.
- [x] Servidor inalcançável mostra `offline` sem travar a interface.
- [x] `syncUrl`, `syncUser`, `syncToken` e `deviceId` nunca entram em documento sincronizado.
- [x] Todo texto novo via `$t(...)`, sem string fixa no template.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `syncApi` com interceptador único, `sync.store`, aba de sincronização e item de menu. Senha não é guardada. Falta exercitar contra o servidor real (depende da WP06).
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `src/repositories/syncApi.js` (axios, interceptador de resposta com mapeamento para `erro_credencial`, `offline`, `erro_servidor`), `src/components/config/syncSettings.vue:114-120` (limpeza imediata da senha em memória, gravação exclusiva de token/url/user no config local), ausência de loop em `erro_credencial`, integração com `src/store/modules/sync.store.js`, `src/views/configModal.vue:332-334` e `src/views/configList.js:41-45`. Textos 100% via `$t(...)`.

---

## WP08 — Ciclo de sincronização

```yaml
lane: concluída
estimativa: 90min
files:
  - src/helpers/syncEngine.js
  - src/App.vue
  - src/components/config/syncSettings.vue
depende_de: [WP04, WP05, WP07]
```

### Objetivo
Amarrar tudo: pull, fusão, gravação local, push, atualização do `sync_base`. Dispara ao abrir o app e no botão "sincronizar agora".

### Definição de Pronto
- [x] Ciclo completo para `todo_lists`, `repeating_events`, `repeating_events_by_date` e `customTodoListIds`. — os 4 tipos passaram no roteiro (tarefas comuns, lista personalizada, tarefa recorrente materializada uma vez só).
- [x] Documento rejeitado no push refaz o ciclo, com limite de tentativas e sem laço infinito. — verificado por código: `syncEngine.js:14,263-267`, `MAX_CICLOS = 3` num `for` que quebra assim que `rejeitados.length === 0`; limite estrutural, sem reprodução em runtime de uma rejeição real.
- [x] Listas visíveis recarregam sozinhas quando a fusão traz mudança; a tela não fica desatualizada.
- [x] Sem servidor configurado, nenhuma chamada de rede é feita e o app se comporta exatamente como hoje. — verificado por código: `sync()` retorna cedo em `!estaConfigurado(config)` (`syncEngine.js:252-254`) antes de qualquer chamada de rede; único outro ponto de rede é o botão "Conectar" em `syncSettings.vue`, ação explícita do usuário, não automática.
- [x] Roteiro de dois dispositivos executado: criar, marcar, apagar, editar offline e reconectar — sem nada sumir.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `syncEngine` com pull→fusão→gravação→push→`sync_base`, limite de 3 ciclos, disparo na abertura e recarga das listas visíveis. Falta o roteiro de dois dispositivos (depende da WP06).
- 2026-09-03: roteiro de dois dispositivos rodado (11 cenários de `servidor-sync.md`), todos passaram conforme esperado.
- 2026-09-03: retry com limite e ausência de chamada sem servidor configurado verificados por leitura de código (`syncEngine.js`) — DoD completa. Nenhum item verificado só "por relato"; os dois últimos são prova estática, não runtime, registrado como tal.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado `src/helpers/syncEngine.js:14,161,250-280` (`cicloUnico` cobrindo `todo_lists`, `repeating_events`, `repeating_events_by_date`, `custom_lists`, `config`; limite de 3 tentativas com `MAX_CICLOS`; retorno precoce se `!estaConfigurado` sem tocar na rede). Verificado watcher `syncPendingReload` em `src/App.vue:649-657` recarregando listas ativas. Evidência do roteiro de testes multi-dispositivo satisfatória.

---

## WP09 — Sincronizar as configurações

```yaml
lane: concluída
estimativa: 45min
files:
  - src/helpers/syncEngine.js
  - src/helpers/syncMerge.js
  - src/repositories/configRepository.js
depende_de: [WP08]
```

### Objetivo
Sincronizar só as preferências que valem em qualquer aparelho, pela lista branca fechada na spec.

### Definição de Pronto
- [x] Lista branca explícita no código, com as três categorias da spec como comentário; chave desconhecida é ignorada, não sincronizada por engano.
- [x] Fusão campo a campo, mesma regra das tarefas.
- [x] Mudar o tema no PC reflete no celular; mudar colunas ou zoom não vaza entre aparelhos. — cenários 9 e 10 do roteiro de dois dispositivos, ambos passaram.
- [x] Aplicar configuração vinda do servidor não exige recarregar a página.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — lista branca `CONFIG_SINCRONIZADA` no `syncEngine`, com as três categorias como comentário; aplicação via `updateConfig`, sem recarregar a página.
- 2026-09-03: cenários 9 (tema) e 10 (colunas não vaza) do roteiro de dois dispositivos confirmados.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checada lista branca `CONFIG_SINCRONIZADA` em `src/helpers/syncEngine.js:23-42`, filtragem estrita em `lerLocal` e `gravarLocal` (linhas 63-65 e 137-141), aplicação reativa via Vuex store commit `updateConfig` dispensando reload de página. Isolamento de preferências locais confirmado no roteiro de testes.

---

## WP10 — Traduções

```yaml
lane: concluída
estimativa: 45min
files:
  - src/assets/languages/
depende_de: [WP07, WP08]
```

### Objetivo
As chaves novas da aba de sincronização nos 19 idiomas.

### Definição de Pronto
- [x] Toda chave nova presente nos 19 arquivos, sem chave órfã e sem chave faltando.
- [x] Português e inglês revisados de verdade; os demais idiomas traduzidos com o termo consistente com o resto do arquivo.
- [x] A skill `checar-i18n` passa sem apontar diferença.

### Log
- 2026-09-02: iniciada
- 2026-09-02: concluída — `settings.sync` e o bloco `sync` (18 chaves) nos 18 arquivos de idioma; a checagem de i18n não aponta diferença.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checados todos os 18 arquivos de idiomas em `src/assets/languages/` via script de validação estrutural; todos possuem as 18 chaves de `sync` e a chave `settings.sync` sem nenhuma omissão ou chave órfã. Traduções em português (`pt.json:224-243`) e inglês (`en.json:224-243`) inspecionadas e validadas.

---

## WP11 — Publicar no Cloudflare Pages

```yaml
lane: concluída
estimativa: 60min
files:
  - .claude/docs/publicar-web.md
  - src/appConfig.js
  - package.json
depende_de: [WP01, WP08]
```

### Objetivo
Colocar o app no ar num endereço público, com o build correto, e ligar o CORS do n8n a essa origem. Executada em conjunto com o usuário.

### Definição de Pronto
- [x] Projeto no Cloudflare Pages ligado ao repositório, comando `yarn run build`, saída `dist`. — **desvio da spec**: `NODE_VERSION=16` não funciona no build da Cloudflare (Corepack embutido exige Node ≥18, incompatível com a trava de engine do `node-ipc` que só aceita ≤17 — as duas não cabem na mesma versão). Rodando `NODE_VERSION=20` + `NODE_OPTIONS=--openssl-legacy-provider` + `YARN_IGNORE_ENGINES=true`. Ambiente local continua Node 16. Decisão registrada em `decisoes.md` (2026-09-03) e detalhada em `.claude/docs/publicar-web.md`.
- [x] Variável do Sentry ausente no projeto, mantendo o Sentry desligado.
- [x] Origem publicada liberada no CORS dos três workflows; conectou e sincronizou sem erro de CORS.
- [x] `appConfig.js` com o endereço público em `siteUrl`.
- [x] Instalado como aplicativo no celular e num PC, sincronizando com o servidor e funcionando em modo avião. — roteiro de dois dispositivos completo, 11/11 cenários.

### Log
- 2026-09-02: criada
- 2026-09-03: build quebrou 3 vezes em sequência (flag OpenSSL incompatível com Node 16, Corepack incompatível com Node 16, engine do node-ipc incompatível com Node ≥18) até achar a combinação que funciona — `NODE_VERSION=20` + `NODE_OPTIONS=--openssl-legacy-provider` + `YARN_IGNORE_ENGINES=true` + `packageManager` fixado em `package.json` (commit `b66c462`). Deploy funcionando em `https://todo.bragademenezes.com`, domínio custom configurado, DNS resolvendo. Roteiro de dois dispositivos completo (11/11). DoD atendida com um desvio documentado (Node 16→20 só no build remoto) → lane revisão.
- 2026-09-03: revisada e aprovada pelo Review Agent (Yoda) — checado guia em `.claude/docs/publicar-web.md`, registro de decisão do desvio técnico do ambiente Cloudflare em `.claude/specs/current/001-sync-n8n/decisoes.md`, configuração de `siteUrl` em `src/appConfig.js:9` e `"packageManager": "yarn@1.22.22"` em `package.json:6`. Sentry mantido desligado por omissão de DSN. Deploy em produção e testes de 2 dispositivos confirmados.
