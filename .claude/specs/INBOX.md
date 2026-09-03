# Inbox

Ideias, bugs e dívidas soltas. **Uma linha cada.** Sem detalhamento — quando
virar feature, o Spec Architect abre uma spec.

## Ideias
-

## Bugs
- `aboutModal.vue` usa `<sponsor-modal>` e `<collaborators-modal>` sem importar; `collaborators-modal` nem existe no repo.

## Dívidas técnicas
- `netlify.toml` é resquício do upstream e libera `Access-Control-Allow-Origin = "*"`; sem efeito no Cloudflare Pages, mas deve sair.
- `dbRepository` abre conexão nova a cada operação e trata erro só com `console.log`.
- Segredo de sincronização em `localStorage` com `nodeIntegration: true` no Electron — revisar quando o app renderizar qualquer conteúdo remoto.
- Projeto sem infraestrutura de teste (`yarn test` é `echo success`); decidir se adota uma.
- `configModal.vue` tem 520 linhas com todas as abas inline; extrair para componentes.
- `public/sw.js` é resquício do upstream (nunca registrado) e agora está excluído do precache do PWA; deve sair.
- Lápides de `sync_doc` com mais de 90 dias só são limpas por comando manual; automatizar se o banco crescer.
