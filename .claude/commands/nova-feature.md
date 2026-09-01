---
description: Implementa uma feature nova seguindo as convenções do projeto
argument-hint: <descrição da feature>
---

Implemente a seguinte feature no WeekToDo Journal: **$ARGUMENTS**

Antes de escrever código:

1. Leia `CLAUDE.md`, `.claude/docs/arquitetura.md` e `.claude/docs/receitas.md`.
2. Se a feature toca dados persistidos, leia também
   `.claude/docs/modelo-de-dados.md`.
3. Verifique se a ideia já está em `.claude/docs/roadmap-fork.md` — se estiver,
   respeite as notas de lá.

Ao implementar, respeite obrigatoriamente:

- **Options API** (o projeto não usa `<script setup>`).
- **Persistência é do componente:** todo `this.$store.commit(...)` que muda algo
  durável vem seguido do `xRepository.update(...)` correspondente.
- **Vuex sem namespace:** confira se o nome do getter/mutation já não existe em
  outro módulo de `src/store/modules/`.
- **Zero string hard-coded na UI:** use `$t('secao.chave')` e adicione a chave
  em **todos** os arquivos de `src/assets/languages/` (19 idiomas).
- **Nova opção de config exige migração** em `src/migrations/migrations.js`.
- **Novo object store exige** bump de versão em `dbRepository.open()` e inclusão
  no `exportTool.js` (export, import e clear).
- **Código só de desktop** fica atrás de `isElectron()`.
- **URL externa** vai em `src/appConfig.js`, nunca no componente. Chamada de
  rede nova exige atualizar o `SECURITY.md`.

Ao terminar:

- Rode `yarn run lint`.
- Diga exatamente o que precisa ser testado manualmente (não há testes
  automatizados no projeto).
- Acrescente uma linha em `changelog.md`, na seção "Fork".
