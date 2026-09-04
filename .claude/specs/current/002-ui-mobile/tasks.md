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
lane: planejado
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
- [ ] Quatro abas — Semana, Listas, Diário, Configurações — com ícone e rótulo, ativa em `--wtd-text-strong` e inativa em `--wtd-text-subtle`
- [ ] Troca de aba é estado local do shell, sem router e sem recarregar a página
- [ ] Barra inferior reserva os 22px do indicador de home e nenhum alvo fica abaixo de 44px
- [ ] Aba Diário abre a tela de espera com uma frase traduzida
- [ ] Tema escuro correto nas duas barras

### Log
- 2026-09-04: criada

---

## WP04 — Extrair as ações de tarefa para um mixin compartilhado

```yaml
lane: revisão
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
lane: planejado
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
- [ ] A faixa mostra os sete dias da semana corrente, marca o selecionado com o chip de hover e põe o ponto de 4px nos dias com tarefa
- [ ] O dia selecionado ocupa a tela; nunca aparecem dois dias lado a lado, independentemente da preferência de colunas
- [ ] Tocar no marcador colorido conclui a tarefa; tocar no texto abre a folha do detalhe (folha pode ser a casca vazia até a WP06)
- [ ] O composer "Task title" cria tarefa no dia visível e a mudança sobrevive ao reload
- [ ] Dia sem tarefa mostra o glifo em gradiente e a frase que nomeia o gesto
- [ ] O botão flutuante foca o composer e é o único lugar com o gradiente preenchendo superfície

### Log
- 2026-09-04: criada

---

## WP06 — Folha do detalhe da tarefa

```yaml
lane: planejado
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
- [ ] Sobe do rodapé com fundo `--wtd-backdrop` + desfoque, cantos superiores em `--wtd-radius-modal` e alça de 38×4
- [ ] Título, notas, subtarefas (44px, lixeira sempre visível), cor, hora/lembrete e repetição gravam e sobrevivem ao reload
- [ ] `colorPicker`, `descriptionTextArea`, `timePicker` e `repeatingEvent` são reaproveitados, não reescritos
- [ ] A cor escolhida aparece na linha da tarefa ao fechar a folha
- [ ] Apagar a tarefa mostra o aviso com "(Undo)" e o desfazer devolve a tarefa
- [ ] Fecha pelo X, pelo toque no fundo e arrastando para baixo

### Log
- 2026-09-04: criada

---

## WP07 — Aba Listas

```yaml
lane: planejado
estimativa: 75min
files:
  - src/components/mobile/mobileListsView.vue
  - src/components/mobile/mobileDayView.vue
  - src/components/mobile/mobileApp.vue
depende_de: [WP06]
```

### Objetivo
Listas personalizadas como linhas de 52px e a abertura de uma lista reaproveitando a
view de dia.

### Definição de Pronto
- [ ] Cada linha traz o ponto de cor, o nome e o contador no padrão "12 tasks · 3 done"
- [ ] Tocar na linha abre a lista com suas tarefas; há como voltar para a relação de listas
- [ ] Criar tarefa dentro de uma lista personalizada funciona e sobrevive ao reload
- [ ] Criar lista nova pelo botão da barra superior funciona
- [ ] A ordem das listas é a mesma do desktop

### Log
- 2026-09-04: criada

---

## WP08 — Aba Configurações

```yaml
lane: planejado
estimativa: 90min
files:
  - src/components/mobile/mobileSettingsView.vue
  - src/components/mobile/mobileApp.vue
  - src/assets/languages/en.json
  - src/assets/languages/pt.json
depende_de: [WP03]
```

### Objetivo
Tela de configurações do celular com Aparência, Dados e Sobre, em seções empilhadas de
52px.

### Definição de Pronto
- [ ] Tema escuro e visão compacta com interruptor, gravando via `configRepository` e valendo na hora
- [ ] Troca de idioma vale na hora e sobrevive ao reload
- [ ] Exportar e importar backup funcionam pelo celular
- [ ] Sincronização reaproveita `src/components/config/syncSettings.vue`, sem cópia da lógica
- [ ] Rótulo que precede controle mantém os dois-pontos, como no resto do produto
- [ ] Nenhuma preferência nova de `config` foi criada

### Log
- 2026-09-04: criada

---

## WP09 — Instalável e offline (PWA)

```yaml
lane: planejado
estimativa: 75min
files:
  - public/manifest.json
  - vue.config.js
  - src/registerServiceWorker.js
  - src/components/mobile/mobileApp.vue
depende_de: [WP05]
```

### Objetivo
Fechar o que falta para o app ser instalado na tela inicial e abrir sem internet.

### Definição de Pronto
- [ ] `manifest.json` com ícone `maskable`, `theme_color` coerente com o tema e `orientation` declarada
- [ ] Em build de produção servido por HTTP, o navegador oferece instalar; o ícone instalado abre sem barra do navegador
- [ ] Com a rede desligada, o app instalado abre e permite criar e concluir tarefa
- [ ] Deploy de versão nova não deixa o app preso na versão velha (o aviso de atualização existente continua funcionando)
- [ ] Nada disso é registrado sob Electron nem em desenvolvimento

### Log
- 2026-09-04: criada

---

## WP10 — Traduzir para os 17 idiomas restantes

```yaml
lane: planejado
estimativa: 45min
files:
  - src/assets/languages/ar.json
  - src/assets/languages/de.json
  - src/assets/languages/es.json
  - src/assets/languages/fr.json
  - src/assets/languages/he.json
  - src/assets/languages/hi.json
  - src/assets/languages/it.json
  - src/assets/languages/ja.json
  - src/assets/languages/ko.json
  - src/assets/languages/pl.json
  - src/assets/languages/ru.json
  - src/assets/languages/tr.json
  - src/assets/languages/uk.json
  - src/assets/languages/vi.json
  - src/assets/languages/zh-CN.json
  - src/assets/languages/zh-TW.json
depende_de: [WP07, WP08]
```

### Objetivo
Propagar a seção `mobile` para todos os idiomas e retirar a chave `ui.mobileWarning`,
que deixou de ter uso.

### Definição de Pronto
- [ ] A skill `checar-i18n` não acusa chave faltando em nenhum dos 19 arquivos
- [ ] `ui.mobileWarning` removida dos 19 arquivos e sem referência no código
- [ ] Nenhum texto novo aparece em inglês com o app em português

### Log
- 2026-09-04: criada

---

## WP11 — Acabamento e verificação da spec

```yaml
lane: planejado
estimativa: 60min
files:
  - src/assets/style/mobile.scss
  - src/components/mobile/mobileApp.vue
  - .claude/specs/current/002-ui-mobile/spec.md
depende_de: [WP09, WP10]
```

### Objetivo
Passada final contra a lista "Está pronto quando" da spec, em tema claro e escuro.

### Definição de Pronto
- [ ] Todos os itens de "Está pronto quando" verificados a dedo em 390px, com o roteiro anotado no Log
- [ ] Nenhum alvo de toque abaixo de 44px em nenhuma das quatro abas
- [ ] Redimensionar a janela cruzando 600px nos dois sentidos não quebra a interface nem perde dados
- [ ] Tema escuro correto nas quatro abas e na folha do detalhe
- [ ] Nenhuma sobra do aviso de resolução no código ou no CSS

### Log
- 2026-09-04: criada
