# Tasks — 002-ui-mobile

<!-- WPs vivas apenas. Ao aprovar, o Review Agent move o bloco inteiro para tasks-done.md. -->

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
