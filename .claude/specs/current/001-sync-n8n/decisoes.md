# Decisões — 001-sync-n8n

## 2026-09-02 — Maestro
**Decisão:** rede Docker externa usada em `server/docker-compose.postgres.yml` é `proxy`, não `n8n` (nome assumido no template).
**Racional:** inventário no servidor Chopper mostrou que o `docker-compose.yml` do n8n declara `networks: [proxy]` (externa), sem rede chamada `n8n`. Ajustei o `networks:` do compose do Postgres para `proxy` ao subir o serviço.
**Alternativas rejeitadas:** criar rede nova `n8n` só para bater com o template — rejeitada por adicionar uma rede sem função, quando `proxy` já conecta os containers que precisam falar entre si.
**Custo de reverter:** baixo — troca de uma linha no `docker-compose.postgres.yml`; nenhum dado do Postgres depende do nome da rede.
**Escopo afetado:** WP02 (arquivo `server/docker-compose.postgres.yml` deveria refletir `proxy` como exemplo, hoje ainda documenta `n8n` genérico no comentário — cosmético, não bloqueia).

## 2026-09-03 — Maestro
**Decisão:** corrigi `queryReplacement` dos nós "Autenticar" em `server/n8n/pull.json` e `push.json`, de `.replace('Bearer ', '')` pra `.split(' ')[1] || ''`, e sincronizei `allowedOrigins` dos três workflows pra `https://todo.bragademenezes.com` (era placeholder `https://SEU-SITE.pages.dev`).
**Racional:** bug real achado em produção — o parser do campo "Query Parameters" do node Postgres do n8n corta a expressão na vírgula, então `.replace('a', 'b')` nunca chega inteiro; `.split(' ')[1]` não tem vírgula e resolve. Corrigido primeiro no n8n do usuário (via UI, confirmado pelos 6 testes da seção 7), depois replicado no JSON versionado — senão o próximo import reproduz o mesmo bug. Origem CORS sincronizada porque já sabíamos o domínio real (`todo.bragademenezes.com`), evitando reeditar quando a WP11 publicar.
**Alternativas rejeitadas:** deixar o JSON do repo divergente do que roda no servidor — rejeitada porque `servidor-sync.md` já avisa que isso faz o repositório mentir.
**Custo de reverter:** baixo — troca de uma expressão de string em 2 arquivos JSON, sem efeito em dado gravado.
**Escopo afetado:** WP06 (fechada em revisão). Domínio `todo.bragademenezes.com` ainda não está publicado — CORS vai bloquear tudo até a WP11 subir o site nesse domínio; isso é esperado, não é regressão.

## 2026-09-03 — Maestro
**Decisão:** o build do Cloudflare Pages usa Node 20 (`NODE_VERSION=20`) + `YARN_IGNORE_ENGINES=true`, não Node 16 como o `CLAUDE.md` assume pro ambiente local.
**Racional:** o Corepack embutido na imagem de build da Cloudflare exige Node ≥18 (usa `URL.canParse`, API que não existe no Node 16); `@achrinza/node-ipc` só aceita Node ≤17. As duas exigências são incompatíveis numa única versão — não dá pra satisfazer ambas. Resolvido rodando em Node 20 e ignorando a checagem de engine do yarn só nesse ambiente de build (variável de ambiente do projeto Cloudflare, não afeta `yarn install` local).
**Alternativas rejeitadas:** Node 17 (satisfaria o node-ipc mas quebra o Corepack, testado e falhou); manter Node 16 e tentar burlar o Corepack de outra forma — não há como desativar o Corepack via env var nessa imagem sem trocar a versão de Node.
**Custo de reverter:** baixo — são só variáveis de ambiente do projeto Cloudflare Pages; nenhum arquivo do repo depende disso além do `packageManager` já fixado em `b66c462`. Ambiente local continua Node 16 conforme `CLAUDE.md`.
**Escopo afetado:** WP11 (deploy). Vale documentar essa exceção em `.claude/docs/publicar-web.md` quando a WP11 fechar — o `CLAUDE.md` fala só do ambiente local, não do build remoto.
