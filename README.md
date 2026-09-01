# WeekToDo Journal

> **Fork não oficial de [WeekToDo](https://github.com/manuelernestog/weektodo)**, criado por Manuel Ernesto Garcia.
> Este projeto **não é afiliado, patrocinado nem endossado** pelo WeekToDo original.
> Licenciado sob **GPL-3.0**, a mesma licença da obra original.

Planejador semanal minimalista com foco em privacidade: todos os dados ficam no
seu dispositivo (localStorage + IndexedDB), sem conta, sem servidor. Este fork
parte do WeekToDo v2.2.0 e evolui em direção a um planejador com recursos de
diário/journal.

## Recursos herdados do WeekToDo

- Multiplataforma (Windows, macOS, Linux e web)
- Tema claro/escuro
- Listas personalizadas além do calendário semanal
- Arrastar e soltar entre listas e dias
- Multi-idioma (19 idiomas)
- Subtarefas
- Suporte a Markdown nas descrições
- Interface customizável (zoom, colunas, painéis redimensionáveis)
- Armazenamento local
- Cores e horários por tarefa
- Tarefas recorrentes (RRULE)
- Notificações e lembretes

## Recursos planejados neste fork

Ver [`.claude/docs/roadmap-fork.md`](.claude/docs/roadmap-fork.md).

## Rodando a partir do código-fonte

Pré-requisitos: git, [Node.js](https://nodejs.org/en/) (v16 é o recomendado
pelo projeto original; versões mais novas podem exigir
`NODE_OPTIONS=--openssl-legacy-provider`) e [Yarn](https://yarnpkg.com/).

```bash
git clone https://github.com/AndreRenatoMenezes/weektodo-journal
cd weektodo-journal
yarn install
yarn run serve            # versão web em http://localhost:8080
yarn run electron:serve   # versão desktop (Electron)
yarn run lint             # ESLint
yarn run build            # build web de produção
yarn run electron:build   # instaladores desktop
```

### Docker

Para rodar a versão web de desenvolvimento: `docker-compose up`

## Traduções

O arquivo base com todos os termos em inglês está em
[`src/assets/languages/en.json`](src/assets/languages/en.json). Para adicionar
um idioma, crie um novo arquivo JSON nomeado pelo
[código do idioma](https://gist.github.com/Josantonius/b455e315bc7f790d14b136d61d9ae469)
e registre-o em `src/assets/languages/languages.js`.

## Licença e atribuição

Este programa é software livre, distribuído sob a
[GNU General Public License v3.0](LICENSE).

- Obra original: **WeekToDo**, Copyright (C) Manuel Ernesto Garcia e
  colaboradores — <https://github.com/manuelernestog/weektodo>
- Trabalho derivado: **WeekToDo Journal**, Copyright (C) 2026 Andre Renato Menezes

O detalhamento da atribuição e o registro de modificações exigido pela seção 5a
da GPL-3.0 estão em [`NOTICE`](NOTICE) e em [`changelog.md`](changelog.md).

Como a GPL exige, qualquer redistribuição deste programa — incluindo a
publicação da versão web, que entrega o bundle JavaScript ao navegador do
usuário — deve manter a licença GPL-3.0 e disponibilizar o código-fonte
correspondente.

**Marcas:** o nome "WeekToDo", o logotipo e a identidade visual do projeto
original não são cobertos pela licença do software. Antes de distribuir builds
públicas deste fork, substitua nome, logotipo e ícones — ver
[`.claude/docs/licenca-e-fork.md`](.claude/docs/licenca-e-fork.md).

## Créditos

- Autor original: [Manuel Ernesto Garcia](https://manuelernestogr.bio.link/)
- Rebranding do logotipo original por [hallgraph](https://twitter.com/hallgraph)
- [Contribuidores do WeekToDo](https://github.com/manuelernestog/weektodo/graphs/contributors)

Se este fork lhe é útil, considere também
[apoiar o projeto original](https://weektodo.me/support-us/).
