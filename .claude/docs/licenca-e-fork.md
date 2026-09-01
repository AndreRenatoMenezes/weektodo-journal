# Licença e situação do fork

## Resumo

O WeekToDo é licenciado sob **GNU GPL v3.0** (arquivo `LICENSE`, texto padrão,
sem termos adicionais da seção 7). Isso permite modificar e redistribuir, com
condições.

## O que você pode fazer

- Modificar o código à vontade, adicionar e remover recursos
- Distribuir sua versão (binários desktop, versão web, Docker)
- **Cobrar** por ela — a GPL não proíbe venda
- Usar as dependências atuais (MIT/Apache/BSD) sem conflito

## O que é obrigatório ao distribuir

1. **Manter GPL-3.0.** Não é possível relicenciar como MIT, fechar o código nem
   transformar em produto proprietário.
2. **Fornecer o código-fonte completo** a quem receber o programa.
3. **Marcar as modificações** de forma destacada, com data (GPL-3 §5a) —
   cumprido por `NOTICE` + `changelog.md` + histórico de commits.
4. **Preservar os avisos de copyright** e a cópia da `LICENSE`.
5. **Não adicionar restrições extras** (ex.: proibir redistribuição, ou
   ativação que impeça o usuário de rodar a própria build modificada).

## Dois pontos que costumam passar batido

**Versão web.** A GPL-3 (diferente da AGPL) não obriga a abrir o código só por
rodar em servidor. Mas este app é uma SPA: o navegador do usuário **baixa o
bundle JavaScript**, e isso é distribuição. Se você hospedar a versão web
publicamente, ofereça o código-fonte correspondente. Trate como obrigatório.

**Nome e logo.** Copyright e marca são coisas separadas. A GPL entrega o código,
**não** o direito de usar o nome "WeekToDo", o logotipo ou o domínio.

## Já feito neste fork

- `package.json`: nome, autor, homepage, repositório e `license: GPL-3.0-only`
- `NOTICE`: atribuição à obra original e registro de modificações (§5a)
- `README.md`, `CONTRIBUTING.md`, `SECURITY.md`: reescritos, mantendo créditos
- `changelog.md`: seção "Fork" no topo, histórico do upstream preservado
- `.github/FUNDING.yml`: limpo (apontava para o financiamento do upstream)
- `.github/workflows/release.yml`: publica releases neste repositório
- `netlify.toml`: removido o redirect para o domínio do upstream
- `vue.config.js`: `appId` e `productName` próprios
- `public/index.html` e `public/manifest.json`: título, descrição, Open Graph
- `src/appConfig.js`: identidade e endpoints externos centralizados
- Chamadas automáticas aos servidores do upstream desativadas (checagem de
  atualização e API de patrocinadores)
- Modal Sobre exibe a atribuição ao projeto original e aponta para este repo
- `LICENSE` **intacto** — como deve ser

## Pendente antes de distribuir publicamente

- [ ] **Escolher um nome definitivo.** "WeekToDo Journal" ainda carrega a marca
      do projeto original. Um nome próprio é o caminho seguro.
- [ ] **Substituir logotipo e ícones.** Arquivos a trocar:
      - `public/WeekToDo-Logo-Color.svg`, `public/WeekToDo-icon-128.png`,
        `public/WeekToDo-icon-white-128.png`, `public/WeekToDo-logo-512x512.png`
      - `public/img/logo-color.svg`, `public/img/logo-white.svg`,
        `public/img/weektodo-isologo-color.svg`,
        `public/img/weektodo-isologo-white.svg`,
        `public/img/WeekToDoDarkLogo.webp`, `public/img/WeekToDoLightLogo.webp`
      - `public/fav_icons/*`, `public/favicon.ico`, `public/apple-touch-icon.png`,
        `public/icon.png`, `public/trayIcon*`
      - `build/icon.*`, `build/icon/*`, `build/icons/*`
      - `src/assets/img/WeekToDo-icon-white-128.png`
      - `public/Avatar.webp` (foto do autor original, usada no modal Sobre —
        mantenha apenas se o crédito continuar lá)
- [ ] **Decidir o que fazer com a área de doação.** `donateModal`,
      `sponsorModal`, `donate/donateLists.js`, `paymentMethod.vue` e o link
      "apoiar" na sidebar continuam apontando para o financiamento do projeto
      original. Opções: manter como crédito, remover, ou repontar para você.
      (Manter é legítimo; misturar com a marca do fork é que confunde.)
- [ ] **Definir o endpoint de atualização** em `src/appConfig.js`
      (`updateManifestUrl`) se quiser checagem de versão nas builds desktop.
- [ ] **`public/googled50c8321df2bd61b.html`** é a verificação do Google Search
      Console do site original. Pode apagar.
- [ ] **Sentry:** decidir se mantém. Sem `VUE_APP_SENTRY_DNS` no build, não
      envia nada; o DSN do upstream não é acessível a você de qualquer forma.
- [ ] Revisar `src/assets/languages/*.json` — várias strings citam "WeekToDo"
      pelo nome (modal Sobre, boas-vindas, dicas, doação).

## Ao adicionar dependências

Compatíveis com GPL-3.0: MIT, BSD, ISC, Apache-2.0, LGPL, MPL-2.0, GPL-3.0.
**Incompatíveis:** proprietárias, "source available" (BSL, SSPL, Elastic),
CC BY-NC, e Apache-2.0 só seria problema em projetos GPL-2.0 — aqui, sob
GPL-3.0, é compatível.
