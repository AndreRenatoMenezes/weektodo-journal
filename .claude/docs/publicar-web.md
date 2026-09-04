# Publicar no Cloudflare Pages

Passo a passo pra colocar o app web no ar, testado de verdade em 2026-09-03.

## 1. Criar o projeto

**Cloudflare Dashboard → Workers & Pages → Create.** A tela mais recente do
dashboard mistura Workers e Pages num fluxo só — se aparecer um campo **Deploy
command** com `npx wrangler deploy`, você está no caminho de Workers, não de
Pages. Procura a opção **Pages** antes de conectar o repositório.

Conecta o repositório `AndreRenatoMenezes/weektodo-journal`.

- **Build command:** `yarn run build`
- **Build output directory:** `dist`
- **Root directory:** `/`

## 2. Variáveis de ambiente

O Node 16 que o `CLAUDE.md` assume pro ambiente local **não funciona** no
build da Cloudflare — o Corepack embutido na imagem dela exige Node ≥18
(`URL.canParse`), e essa exigência é incompatível com a trava de engine do
`@achrinza/node-ipc` (só aceita Node ≤17). Não existe uma versão de Node que
satisfaça as duas ao mesmo tempo, então a saída é rodar em Node mais novo e
ignorar a checagem de engine do yarn — só nesse ambiente, o `yarn install`
local continua em Node 16 sem flag nenhuma.

| Variável | Valor |
|---|---|
| `NODE_VERSION` | `20` |
| `NODE_OPTIONS` | `--openssl-legacy-provider` |
| `YARN_IGNORE_ENGINES` | `true` |

Não adiciona nenhuma variável de Sentry — mantém desligado.

`NODE_OPTIONS=--openssl-legacy-provider` só é válida a partir do Node 17; se
um dia trocar `NODE_VERSION` pra 16 de novo (não recomendo, veja acima), essa
variável **quebra o build** — Node 16 não reconhece a flag.

## 3. `packageManager` fixado

`package.json` tem `"packageManager": "yarn@1.22.22"`. Sem isso, o Corepack da
Cloudflare tenta destravar a versão mais recente do Yarn (4.x) — incompatível
com o `yarn.lock` v1 (clássico) deste projeto.

## 4. Domínio custom

**Custom domains → Set up a custom domain** → `todo.bragademenezes.com`. Mesma
zona DNS do `n8n.bragademenezes.com`, o Cloudflare cria o CNAME sozinho.

`src/appConfig.js` (`siteUrl`) e os três workflows do n8n (`allowedOrigins`,
ver `.claude/docs/servidor-sync.md`) já apontam pra esse domínio.

## Diagnóstico rápido de build quebrado

| Erro no log | Causa |
|---|---|
| `--openssl-legacy-provider is not allowed in NODE_OPTIONS` | `NODE_VERSION` está em 16 com a flag ligada — tira a flag ou sobe a versão |
| `URL.canParse is not a function` dentro de `corepack.cjs` | Node < 18 tentando rodar o Corepack — sobe `NODE_VERSION` |
| `error @achrinza/node-ipc@... incompatible ... Got "20.x"` | Node ≥18 sem `YARN_IGNORE_ENGINES=true` |
