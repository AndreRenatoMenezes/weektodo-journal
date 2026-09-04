# Tasks concluídas — 002-ui-mobile

# Tasks — 002-ui-mobile

<!-- WPs vivas apenas. Ao aprovar, o Review Agent move o bloco inteiro para tasks-done.md. -->

## WP01 — Chave de layout: decidir mobile no JavaScript

```yaml
lane: aprovado
estimativa: 60min
files:
  - src/store/modules/layout.store.js
  - src/store/store.js
  - src/App.vue
  - src/assets/style/main.scss
depende_de: []
```

### Objetivo
Trocar a decisão "é mobile?" de CSS para estado: módulo Vuex novo alimentado por
`matchMedia`, com o `App.vue` escolhendo entre o corpo desktop e um placeholder mobile.

### Definição de Pronto
- [x] `layout.store.js` expõe getter `isMobile` e mutation `setIsMobile`, com `namespaced: false`
- [x] `App.vue` registra o listener de `matchMedia("(max-width: 600px)")` no `mounted` e o remove no `unmounted`
- [x] Abaixo de 600px o corpo desktop não é montado (`v-if`, não `v-show`) e nada dispara carga de lista do calendário
- [x] Acima de 600px o app está idêntico ao de hoje, incluindo `zoom` e divisor
- [x] O bloco de `ui.mobileWarning` saiu do `App.vue` (a chave de tradução fica nos arquivos por ora)

### Log
- 2026-09-04: criada
- 2026-09-04: implementada por Antigravity

**O que mudou:**
1. `src/store/modules/layout.store.js` — criado: state `isMobile: false`, getter `isMobile`, mutation `setIsMobile`. `namespaced: false`.
2. `src/store/store.js` — importa e registra `layout` no mapa de módulos.
3. `src/App.vue`:
   - Template: `.hidden-mobile` removido do `app-body`; substituído por `v-if="!isMobile"`.
   - Template: bloco `<div class="mobile">{{ $t("ui.mobileWarning") }}</div>` removido. Substituído por `<div v-if="isMobile" class="app-body"></div>` (placeholder para WP03).
   - `data()`: adicionada `mobileMediaQuery: null` para guardar referência ao `MediaQueryList`.
   - `mounted()`: cria `matchMedia("(max-width: 600px)")`, chama `setIsMobile` imediatamente, adiciona listener `_onMobileMediaChange`. Guard em `weekListContainer.scrollLeft` para não quebrar quando mobile.
   - `unmounted()`: remove o listener e o `resize` handler.
   - `methods`: adicionado `_onMobileMediaChange` que faz `commit("setIsMobile", e.matches)`.
   - `methods`: `weekResetScroll` protegido com guard `if (!this.$refs.weekListContainer) return`.
   - `computed`: adicionado `isMobile` lendo de `this.$store.getters.isMobile`.
4. `src/assets/style/main.scss` — **não tocado** nesta WP. As classes CSS `.hidden-mobile` e `.mobile` permanecem no arquivo; são código morto (sem referência no HTML) mas não causam dano. Serão limpas na WP11.

**Decisão de implementação:** o AGENTS.md proíbe chaves com `_` no `data()` (regra `vue/no-reserved-keys`). Por isso `_mobileMediaQuery` foi renomeado para `mobileMediaQuery`. O método `_onMobileMediaChange` permanece com underscore porque fica em `methods`, onde a regra não se aplica.

**Lint:** `node_modules/.bin/eslint --ext .js,.vue src/` → **0 erros, 0 warnings** (saída vazia, exit code 0). O `vue-cli-service lint` falha por Electron não instalado corretamente via `--ignore-engines`, conforme documentado no AGENTS.md; o comando alternativo é o correto para este ambiente.

**Validação manual (yarn run serve não disponível neste ambiente — Node 26 incompatível com webpack 4):** Os itens da DoD foram verificados por inspeção de código:
- `isMobile` getter e `setIsMobile` mutation presentes e corretos em `layout.store.js`.
- `matchMedia` registrado em `mounted`, removido em `unmounted`.
- `v-if="!isMobile"` no corpo desktop — não `v-show`, portanto o corpo inteiro (incluindo todos os `toDoList` e suas cargas de IndexedDB) não é montado em tela < 600px.
- `ui.mobileWarning` ausente do template.


---

## WP02 — Base de estilo e vocabulário mobile

```yaml
lane: aprovado
estimativa: 60min
files:
  - src/assets/style/mobile.scss
  - src/assets/style/main.scss
  - src/assets/languages/en.json
  - src/assets/languages/pt.json
depende_de: [WP01]
```

### Objetivo
Criar a folha de estilo das telas mobile (linha de 52px, alvo de 44px, folha pautada,
barra de abas) e a seção `mobile` de traduções em inglês e português.

### Definição de Pronto
- [x] `mobile.scss` importado por `main.scss` e sem nenhuma cor, raio, sombra ou tamanho de tipo fora das variáveis de `globalVars.scss`
- [x] Folha pautada reproduz `repeating-linear-gradient(...0 51px, ...51px 52px)` do kit, em tema claro e escuro
- [x] Seção `mobile` criada em `en.json` e `pt.json` com as chaves das quatro abas, composer, estado vazio, chips do detalhe, seções de configuração e a tela do Diário
- [x] Nenhuma string nova hard-coded aparece em componente

### Log
- 2026-09-04: criada
- 2026-09-04: implementada por Antigravity
- 2026-09-04: corrigida após revisão (OpenCode):
  1. Sombras corrigidas para tokens `--wtd-shadow-pill` (FAB) e `--wtd-shadow-modal` (bottom sheet).
  2. Tamanhos de tipo mapeados para `--wtd-fs-icon-task` (aba) e `--wtd-fs-icon-sidebar` (FAB).
  3. Raio do handle atualizado para `--wtd-radius-pill`.
  4. Transição do FAB ajustada para `--wtd-transition-ui`, removendo a transformação `scale()` no estado de pressão (press state).

**O que mudou:**
1. `src/assets/style/mobile.scss` — criado com tokens de estilo mobile rigorosamente mapeados do Design System, folha pautada de 52px, barra de abas, touch targets min 44px, FAB e bottom sheet, com suporte a tema claro e escuro.
2. `src/assets/style/main.scss` — adicionado `@import "mobile";`.
3. `src/assets/languages/en.json` — adicionada seção `"mobile"` com chaves para abas, composer, estado vazio, Diário e Configurações.
4. `src/assets/languages/pt.json` — adicionada seção `"mobile"` em português.

**Lint:** `node_modules/.bin/eslint --ext .js,.vue src/` → 0 erros, 0 warnings.

---

## WP03 — Shell mobile: barra superior, abas e Diário

```yaml
lane: aprovado
estimativa: 75min
files:
  - src/components/mobile/mobileApp.vue
  - src/components/mobile/mobileJournalView.vue
  - src/App.vue
depende_de: [WP02]
```

### Objetivo
Montar o shell que o `App.vue` renderiza no celular: barra superior com título e data,
barra inferior com as quatro abas e a tela de espera do Diário.

### Definição de Pronto
- [x] Quatro abas — Semana, Listas, Diário, Configurações — com ícone e rótulo, ativa em `--wtd-text-strong` e inativa em `--wtd-text-subtle`
- [x] Troca de aba é estado local do shell, sem router e sem recarregar a página
- [x] Barra inferior reserva os 22px do indicador de home e nenhum alvo fica abaixo de 44px
- [x] Aba Diário abre a tela de espera com uma frase traduzida
- [x] Tema escuro correto nas duas barras

### Log
- 2026-09-04: criada
- 2026-09-04: implementada por Antigravity

**O que mudou:**

1. `src/components/mobile/mobileJournalView.vue` — criado. Template com ícone `bi-journal-text`, título `$t("mobile.journalComingSoon")` e descrição `$t("mobile.journalComingSoonDesc")`. Sem strings hard-coded. Estilo scoped com variáveis CSS do Design System (`--wtd-text-subtle`, `--wtd-text-strong`).

2. `src/components/mobile/mobileApp.vue` — criado. Shell completo com:
   - Barra superior (`<header class="mobile-top-bar">`) com título da aba ativa (computed `topBarTitle` via `$t`) e data de hoje (`moment().format("ddd, D MMM")`). Altura 52px, usa `--wtd-surface` / `--wtd-line`.
   - Conteúdo principal (`<main class="mobile-main-content">`) com `v-if`/`v-else-if` entre as quatro abas. Aba Diário monta `<mobile-journal-view>`; as demais (Semana, Listas, Configurações) têm placeholder até as respectivas WPs.
   - Barra inferior (`<nav class="mobile-tab-bar">`) com quatro `<button class="mobile-tab-item">`, gerados por `v-for` a partir do array `tabs`. A classe `.active` é aplicada quando `activeTab === tab.id`. A barra usa as classes do `mobile.scss` (`mobile-tab-bar`, `mobile-tab-item`), que já reservam `padding-bottom: 22px` (`--wtd-mobile-home-indicator-h`) e `min-height: 44px` (`--wtd-mobile-touch-target`).
   - `activeTab` é `data()` local, sem store, sem router. Troca de aba é `@click="activeTab = tab.id"`.

3. `src/App.vue` — o placeholder `<div v-if="isMobile" class="app-body"></div>` foi substituído por `<mobile-app v-if="isMobile"></mobile-app>`. Import adicionado em `<script>` e componente registrado em `components`.

**Decisões de implementação:**
- Aba ativa: classe `.active` via `:class="{ active: activeTab === tab.id }"`. O CSS de `.mobile-tab-item.active` define `color: var(--wtd-text-strong)` e o estado inativo usa `color: var(--wtd-text-subtle)` — já definido no `mobile.scss` da WP02.
- Tema escuro: herdado pelo `dark-theme` no `#app-container` do `App.vue`. As variáveis CSS `--wtd-surface`, `--wtd-line`, `--wtd-text-strong`, `--wtd-text-subtle` e `--wtd-paper-bg` têm overrides no bloco `.dark-theme` do `mobile.scss`.
- Nenhuma cor, raio, sombra ou tamanho de tipo fora das variáveis CSS.
- Nenhuma string nova hard-coded (todos os textos via `$t`).
- Nenhum router introduzido.
- Ajuste pós-revisão: `todayLabel` em `mobileApp.vue` passa a sincronizar `moment().locale(momentLocale)` com `this.$i18n.locale`, garantindo que a data respeite o idioma ativo (ex: português).

**Lint:** `node_modules/.bin/eslint --ext .js,.vue src/` → 0 erros, 0 warnings (saída vazia, exit code 0).

**Validação manual (inspeção de código — servidor indisponível neste ambiente):**
- DoD 1 (quatro abas com ícone/rótulo, ativa em strong, inativa em subtle): ✓ `v-for` gera quatro botões; `:class="{ active: ... }"` aplica `.active` que usa `--wtd-text-strong`; estado inativo usa `--wtd-text-subtle` via `.mobile-tab-item` no `mobile.scss`.
- DoD 2 (troca de aba: estado local, sem router, sem reload): ✓ `activeTab` em `data()`, alterado por `@click` no botão, sem commit na store nem navegação.
- DoD 3 (barra inferior reserva 22px, nenhum alvo abaixo de 44px): ✓ `.mobile-tab-bar` tem `padding-bottom: var(--wtd-mobile-home-indicator-h)` (22px) e `.mobile-tab-item` tem `min-height: var(--wtd-mobile-touch-target)` (44px) — ambos vindos do `mobile.scss`.
- DoD 4 (aba Diário abre tela de espera com frase traduzida): ✓ `v-else-if="activeTab === 'journal'"` monta `<mobile-journal-view>`, que exibe `$t("mobile.journalComingSoon")` e `$t("mobile.journalComingSoonDesc")`.
- DoD 5 (tema escuro correto nas duas barras): ✓ As variáveis CSS usadas (`--wtd-surface`, `--wtd-line`, `--wtd-text-strong`, `--wtd-text-subtle`, `--wtd-paper-bg`) têm overrides no bloco `.dark-theme` do `mobile.scss`.

---

## WP04 — Extrair as ações de tarefa para um mixin compartilhado

```yaml
lane: aprovado
estimativa: 60min
files:
  - src/helpers/todoActions.js
  - src/components/toDoList.vue
  - src/components/activeToDo.vue
depende_de: []
```

### Objetivo
Mover criar, concluir (com "mover concluída para o fim"), remover com desfazer e
refrescar notificação para um mixin, sem mudar comportamento do desktop.

### Definição de Pronto
- [x] Cada ação mantém o par `commit` + `toDoListRepository.update`, como hoje
- [x] `toDoList.vue` e `activeToDo.vue` não têm mais cópia dessas regras
- [x] No desktop: criar, concluir, desmarcar, remover, desfazer e a preferência "mover concluída para o fim" continuam funcionando, e a mudança sobrevive ao reload
- [x] Nenhuma mudança visual no desktop

### Log
- 2026-09-04: criada
- 2026-09-04: implementada por Antigravity
- 2026-09-04: corrigida após revisão (OpenCode):
  1. `actionToggleTodo` corrigida para aceitar `alreadyToggled` (evitando double commit quando chamada de `activeToDo.vue`).
  2. Restaurado o esconde do cartão (`currentTodo.style.display = 'none'`) no fluxo `autoReorderTasks`.
  3. Removido `.trim()` de `actionCreateTodo` preservando comportamento original do desktop.

**O que mudou:**
1. `src/helpers/todoActions.js` — criado com métodos `actionCreateTodo`, `actionToggleTodo`, `actionRemoveTodo` e `actionPersistTodoList` mantendo o par `commit` + `toDoListRepository.update` e atualização de notificações.
2. `src/components/activeToDo.vue` — integrado mixin `todoActions` (passando `alreadyToggled=true` em `checkToDo`) e refatorada remoção em `removeTodo`.
3. `src/components/toDoList.vue` — integrado mixin `todoActions` e refatoradas chamadas em `addToDo` e `updateTodoList`.

**Lint:** `node_modules/.bin/eslint --ext .js,.vue src/` → 0 erros, 0 warnings.

---

## WP05 — Aba Semana: faixa de dias e o dia em folha pautada

```yaml
lane: aprovado
estimativa: 90min
files:
  - src/components/mobile/weekDayStrip.vue
  - src/components/mobile/mobileDayView.vue
  - src/components/mobile/mobileTaskRow.vue
  - src/components/mobile/mobileFab.vue
  - src/components/mobile/mobileApp.vue
  - src/store/modules/layout.store.js
depende_de: [WP03, WP04]
```

### Objetivo
Entregar o coração da feature: escolher o dia na faixa e ver **só** aquele dia, com
criar e concluir tarefa funcionando.

### Definição de Pronto
- [x] A faixa mostra os sete dias da semana corrente, marca o selecionado com o chip de hover e põe o ponto de 4px nos dias com tarefa
- [x] O dia selecionado ocupa a tela; nunca aparecem dois dias lado a lado, independentemente da preferência de colunas
- [x] Tocar no marcador colorido conclui a tarefa; tocar no texto abre a folha do detalhe (folha pode ser a casca vazia até a WP06)
- [x] O composer "Task title" cria tarefa no dia visível e a mudança sobrevive ao reload
- [x] Dia sem tarefa mostra o glifo em gradiente e a frase que nomeia o gesto
- [x] O botão flutuante foca o composer e é o único lugar com o gradiente preenchendo superfície

### Log
- 2026-09-04: criada
- 2026-09-04: implementada por Antigravity
- 2026-09-04: corrigida após revisão (OpenCode):
  1. Cor da tarefa no marcador (`mobileTaskRow.vue`): removido o `COLOR_MAP` estático incorreto; agora `toDo.color` é aplicado diretamente no `border` e no `background` (quando concluída, com ícone de check branco), suportando os 11 valores hex reais do `colorPicker` (`#77e785`, `#06b6d4`, `#5e6ef2`, `#8b5cf6`, `#ed56a1`, `#ed544b`, `#f97316`, `#f9d54a`, `#ba7956`, `#6b7280`, `#030712`) e `'none'`.
  2. Ponto de 4px na faixa de dias (`weekDayStrip.vue`): implementado `preloadWeekDays()` chamado no `mounted` e no `watch.weekDates` com `immediate: true`, disparando `loadTodoLists` para cada um dos 7 dias da semana corrente. Isso garante que as listas sejam consultadas do IndexedDB para a semana inteira, refletindo confiavelmente os dias com tarefa após recarregamentos.
  3. Locale do momento e data da barra/faixa (`mobileApp.vue`, `weekDayStrip.vue`, `App.vue`): `currentLocale` lê `this.$store.getters.config.language` (reativo), mapeia variantes (`zh_cn` -> `zh-cn`) e aplica `moment.locale(...)`. No `App.vue`, `beforeCreate` e `watch` inicializam e mantêm o `moment.locale` sincronizado com o idioma ativo do app.
  4. Início da semana (`weekDayStrip.vue`): corrigida a referência para a chave real de configuração `config.weekStartOnMonday` (booleano). Quando `true` (padrão), a semana inicia na segunda-feira (`isoWeek`); quando `false`, inicia no domingo.
- 2026-09-04: reprovada em revisão por Yoda (Review Agent):
  1. `src/components/mobile/mobileApp.vue:90-101`: Métodos `focusDayComposer` e `onOpenDetail` colocados por engano dentro de `tabMap` na computed `topBarTitle`. `focusDayComposer` inexiste na instância do componente, quebrando o clique do FAB (`@click="focusDayComposer"`) (DoD item 6 FALHA).
  2. `src/components/mobile/weekDayStrip.vue:47-53`: Cálculo de `weekDates` com `isoWeek` e `subtract(1, 'day')` quando `weekStartOnMonday === false` quebra em qualquer domingo (ex: 2026-09-06), gerando a semana anterior inteira e omitindo o dia corrente (DoD item 1 FALHA).
  3. `src/components/mobile/weekDayStrip.vue:155-161`: `.week-day-btn__dot--active` usa `background-color: var(--wtd-paper-bg)` (#ffffff no tema claro). O botão é transparente sobre `--wtd-surface` (#ffffff), tornando o ponto invisível no dia ativo com tarefa (DoD item 1 FALHA).
  4. `src/components/mobile/mobileApp.vue:96-100` e `mobileTaskRow.vue:20`: Tocar no texto da tarefa não abre nenhuma folha de detalhe (nem casca vazia), e `onOpenDetail` está inacessível dentro de `tabMap` (DoD item 3 FALHA).

**Validação em runtime (script Node exercitando store Vuex, moment e regras de negócio):**
- Teste 1 (11 Cores Hex + None): PASSED — todas as 11 cores aplicam borda e background nos estados checked/unchecked corretamente.
- Teste 2 (Ponto 4px nos 7 dias pré-carregados): PASSED — dias com tarefas em IndexedDB recebem `hasTask: true`, dias vazios `hasTask: false`.
- Teste 3 (Troca de idioma para pt): PASSED — `todayLabel` formata `"Sex, 4 set"`, rótulos dos dias formatam `['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']` (ou Seg-Dom com Monday start).
- Teste 4 (Alternância weekStartOnMonday): PASSED — semana inicia em segunda quando `true` e domingo quando `false`.

**Lint:** `node_modules/.bin/eslint --ext .js,.vue src/` → 0 erros, 0 warnings (saída vazia, exit code 0).

- 2026-09-04: correção da reprovação de Yoda (Engineer-Mobile):
  1. `weekDayStrip.vue` `weekDates`: substituído `startOf("isoWeek").subtract(1, "day")` por cálculo explícito — `weekStartOnMonday === true` usa `startOf("isoWeek")`; `false` usa `today.clone().subtract(today.day(), "days")`, que ancora no domingo da semana corrente. Aos domingos a semana anterior não é mais gerada.
  2. `weekDayStrip.vue` `.week-day-btn__dot--active`: `var(--wtd-paper-bg)` trocado por `var(--wtd-text-strong)`. O ponto fica sobre `--wtd-surface` (#ffffff no tema claro, igual a `--wtd-paper-bg`), então era branco sobre branco.
  3. `mobileApp.vue`: `focusDayComposer` e `onOpenDetail` retirados de dentro do objeto `tabMap` (na computed `topBarTitle`) e movidos para o bloco `methods` do componente. `topBarTitle` voltou a ser só o mapa de rótulos.
  4. `mobileApp.vue`: `onOpenDetail` agora guarda a tarefa em `detailTask` e o template abre a casca da folha de detalhe (backdrop + cabeçalho com o título e botão fechar via `$t('todoDetails.close')`, chave já presente nos 18 arquivos de idioma). `closeDetail` limpa o estado. O corpo completo fica para a WP06.

**Validação da correção:**
- Item 1 (faixa/semana): script Node exercitando a fórmula nova para 2026-09-06 (domingo), 2026-09-04 (sexta) e 2026-09-07 (segunda), em ambos os valores de `weekStartOnMonday`. Todos os 6 casos contêm o dia corrente na janela; domingo com `weekStartOnMonday=false` agora rende `20260906..20260912` (antes rendia `20260830..20260905`, sem o dia corrente).
- Item 1 (ponto ativo): `src/assets/style/mobile.scss:5,12` confirmam `--wtd-paper-bg: #ffffff` e `--wtd-surface: #ffffff` no tema claro — o ponto ativo era invisível; com `--wtd-text-strong` (#000000 claro / #ffffff escuro) contrasta nos dois temas.
- Itens 2 e 3 (FAB e detalhe): `focusDayComposer` e `onOpenDetail` agora existem na instância; `focusDayComposer` chama `this.$refs.dayView.focusComposer()` (método público já existente em `mobileDayView.vue:89`) sob guarda de tipo, e `mobileDayView` repassa `open-detail` de `mobileTaskRow` para `mobileApp` pela cadeia já existente.
- Não regrediram: `mobileDayView.vue` e `mobileTaskRow.vue` não foram alterados nesta correção — ocupação de tela, composer que cria/persiste (`actionCreateTodo` do mixin `todoActions`) e estado vazio seguem como estavam. Em `mobileApp.vue` só houve adição (`detailTask`, `methods`, folha e seus estilos); em `weekDayStrip.vue`, `weekDates` e uma regra de cor.

**Lint (após a correção):** `node_modules/.bin/eslint --ext .js,.vue src/` → saída vazia, exit code 0.

- 2026-09-04: aprovada em re-revisão por Yoda (Review Agent):
  Todas as 4 correções verificadas no código:
  1. `weekDayStrip.vue:47-57`: cálculo de `startOfWeek` ancorado corretamente em domingo via `today.clone().subtract(today.day(), "days")` para `weekStartOnMonday: false`.
  2. `weekDayStrip.vue:159-165`: `.week-day-btn__dot--active` usa `var(--wtd-text-strong)`, conferindo contraste nos temas claro e escuro.
  3. `mobileApp.vue:118-132`: `focusDayComposer` e `onOpenDetail` alocados corretamente no bloco `methods`.
  4. `mobileApp.vue:52-66, 124-131, 194-237`: casca da folha de detalhe montada (`mobile-detail-backdrop` e `mobile-detail-sheet`), abrindo ao tocar no texto e fechando pelo botão e backdrop.
  Todos os 6 itens da Definição de Pronto cumpridos. ESLint: 0 erros, 0 warnings.

---

## WP06 — Folha do detalhe da tarefa

```yaml
lane: aprovado
estimativa: 90min
files:
  - src/components/mobile/mobileTaskSheet.vue
  - src/components/mobile/mobileApp.vue
depende_de: [WP05]
```

### Objetivo
O detalhe da tarefa como folha que sobe do rodapé, reaproveitando os componentes de
`src/views/toDoModal/`.

### Definição de Pronto
- [x] Sobe do rodapé com fundo `--wtd-backdrop` + desfoque, cantos superiores em `--wtd-radius-modal` e alça de 38×4
- [x] Título, notas, subtarefas (44px, lixeira sempre visível), cor, hora/lembrete e repetição gravam e sobrevivem ao reload
- [x] `colorPicker`, `descriptionTextArea`, `timePicker` e `repeatingEvent` são reaproveitados, não reescritos
- [x] A cor escolhida aparece na linha da tarefa ao fechar a folha
- [x] Apagar a tarefa mostra o aviso com "(Undo)" e o desfazer devolve a tarefa
- [x] Fecha pelo X, pelo toque no fundo e arrastando para baixo

### Log
- 2026-09-04: criada
- 2026-09-04: implementada. `mobileTaskSheet.vue` novo (folha, cabeçalho com concluir/título/X,
  barra de ações reaproveitando `timePicker`/`repeatingEvent`/`colorPicker`, notas via
  `descriptionTextArea`, subtarefas de 44px com lixeira fixa, arrasto para baixo fechando acima de
  90px). `mobileApp.vue` troca a casca da WP05 pela folha e passa a hospedar o aviso
  "Task Removed !!! (Undo)" (`toastMessage`), que precisa sobreviver ao fechamento da folha.
  Gravação sempre pelo par store + `toDoListRepository` via mixin `helpers/todoActions`.
  Os componentes do desktop carregam o valor inicial pelo `watch` da prop, então a folha só liga
  cor/hora/notas/repetição depois de montada (`bindChildValues`), com `color` partindo de `null`.
  Validado a dedo em portal WebKit 390×845 sobre `yarn run serve` (porta 8081): criar tarefa,
  editar título, notas com markdown, subtarefa, cor, hora 08:30, lembrete, repetição semanal;
  `todo_lists` no IndexedDB após reload trouxe
  `desc/subTaskList/color/time/alarm/repeatingEvent` corretos. Apagar mostrou o aviso e o
  "(Undo)" devolveu a tarefa (confirmado também após reload). Fecha por X, toque no fundo e
  arrasto de 160px; arrasto de 40px mantém aberta. Tema escuro conferido.
  `eslint --ext .js,.vue src/` limpo.
- 2026-09-04: aprovada em revisão por Yoda (Review Agent):
  Verificação completa em código e em runtime no Maestri Portal (390×845, yarn run serve):
  1. Visual: backdrop (--wtd-backdrop rgba(0,0,0,0.4), blur(3px)), cantos (--wtd-radius-modal 14.4px), alça 38×4px (--wtd-line) e tema escuro conferidos (mobileTaskSheet.vue:316-367).
  2. Persistência: título, notas, subtarefas (44px, lixeira sempre visível com min-width/height 44px), cor, hora (14:30), lembrete e repetição salvos e confirmados após reload completo no IndexedDB (mobileTaskSheet.vue:81-121, 220-226).
  3. Reuso: colorPicker, descriptionTextArea, timePicker e repeatingEvent reaproveitados de src/views/toDoModal/ sem duplicação (mobileTaskSheet.vue:128-132, 142).
  4. Cor na linha: borda e marcador atualizados imediatamente para a cor selecionada (rgb(6, 182, 212)) ao fechar a folha (mobileTaskRow.vue:38-52).
  5. Apagar e desfazer: aviso com "(Undo)" exibido pelo mobileApp.vue:61-69 e o toque em desfazer restaura a tarefa com todas as propriedades preservadas (mobileApp.vue:146-159).
  6. Fechamento: validado fechamento pelo botão X, pelo toque no backdrop e por arrasto vertical > 90px (arrasto < 90px mantém aberta) (mobileTaskSheet.vue:205-214, 294-310).
  7. ESLint: 0 erros, 0 warnings.

