# Roadmap do fork

> Este arquivo é o lugar de registrar o que **este** fork quer ser, além do
> WeekToDo original. Mantenha-o atualizado: é o primeiro documento que o Claude
> lê ao começar uma feature nova.

## Direção

*(a definir — descreva aqui, em 2 ou 3 frases, o que o "Journal" acrescenta ao
planejador semanal.)*

## Ideias

Nada aqui está decidido. Preencha, corte e reordene.

| Ideia | Estado | Notas |
|---|---|---|
| Entrada de diário por dia | a decidir | Um texto longo por data, separado da lista de tarefas. Poderia ser um novo object store `journal_entries` com chave `YYYYMMDD`, ou um campo na config da lista do dia. Ver `.claude/docs/receitas.md`. |
| Tags nas tarefas | a decidir | O campo `tags` **já existe** no modelo de dados e não tem UI. Custo baixo. |
| Prioridade nas tarefas | a decidir | O campo `priority` **já existe** e não tem UI. Custo baixo. |
| Busca / filtro | a decidir | Há ícones de busca e filtro comentados em `src/components/layout/sideBar.vue`. |
| Sincronização entre dispositivos | a decidir | Muda a premissa de privacidade do app. Exigiria servidor ou provedor externo, e a decisão precisa aparecer no `SECURITY.md`. |
| Modo mobile / touch | a decidir | Está no roadmap do upstream; a UI atual assume largura mínima de 1000px. |
| Temas | a decidir | Hoje só claro/escuro, via classe `dark-theme` e variáveis em `src/assets/style/globalVars.scss`. |

## Regras para qualquer feature nova

- Segue as convenções do `CLAUDE.md` (Options API, commit + repository, i18n).
- Nenhuma string em português hard-coded na interface: tudo por `$t`.
- Nada de chamada de rede sem entrada em `src/appConfig.js` e sem atualizar o
  `SECURITY.md` — a promessa de privacidade é o principal atrativo deste app.
- Mudou o formato dos dados? Escreva a migração junto, no mesmo commit.
- Feature nova entra no `changelog.md`, seção "Fork".
