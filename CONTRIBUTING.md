# Contribuindo com o WeekToDo Journal

Este projeto é um fork de [WeekToDo](https://github.com/manuelernestog/weektodo),
licenciado sob GPL-3.0. Contribuições são bem-vindas.

## Antes de abrir um PR

Correções que também façam sentido no projeto original devem, de preferência,
ser enviadas **também** para o [upstream](https://github.com/manuelernestog/weektodo/issues).
Isso mantém os dois projetos saudáveis e reduz divergência.

## Licença das contribuições

Ao enviar um pull request, você concorda em licenciar sua contribuição sob a
**GNU General Public License v3.0**, a mesma licença deste projeto. Não são
aceitas contribuições sob licenças incompatíveis com a GPL-3.0, nem código
copiado de projetos proprietários.

## Reportando problemas

Use a [página de issues](https://github.com/AndreRenatoMenezes/weektodo-journal/issues)
deste fork. Descreva o sistema operacional, se está usando a versão web ou
desktop, e os passos para reproduzir.

Problemas que existem também no WeekToDo original devem ser reportados lá.

## Rodando a partir do código-fonte

Pré-requisitos: git, [Node.js](https://nodejs.org/en/) (v16 recomendado),
[Yarn](https://yarnpkg.com/).

```bash
git clone https://github.com/AndreRenatoMenezes/weektodo-journal
cd weektodo-journal
yarn install
yarn run serve            # versão web
yarn run electron:serve   # versão desktop
```

## Padrões de código

- Vue 3 Options API (o projeto não usa `<script setup>`)
- Estado global em Vuex 4, módulos com `namespaced: false`
- Toda persistência passa pela camada `src/repositories/`
- Nenhuma string visível ao usuário fica hard-coded: use i18n (`$t`) e adicione
  a chave em **todos** os arquivos de `src/assets/languages/`
- Rode `yarn run lint` antes de abrir o PR

Detalhes de arquitetura em [`CLAUDE.md`](CLAUDE.md) e `.claude/docs/`.

## Código de conduta

Seja objetivo, cordial e mantenha a discussão no tema da issue.
