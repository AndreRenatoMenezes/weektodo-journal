# Tasks — 002-ui-mobile

<!-- WPs vivas apenas. Ao aprovar, o Review Agent move o bloco inteiro para tasks-done.md. -->

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
