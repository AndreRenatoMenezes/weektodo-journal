# Servidor de sincronização

Passo a passo para subir o banco e os três webhooks no seu servidor, onde o n8n
já roda. Nenhuma porta nova é exposta na internet: o Postgres fica só na rede
interna do Docker e o n8n é a única porta de entrada.

O desenho das tabelas está em `.claude/specs/schema.md`.

---

## 1. Subir o Postgres

1. Copie o serviço de `server/docker-compose.postgres.yml` para o
   `docker-compose.yml` do n8n (ou deixe o arquivo ao lado e use
   `-f docker-compose.yml -f server/docker-compose.postgres.yml`).

2. Confira o nome da rede. O arquivo assume uma rede externa chamada `n8n`;
   veja qual a sua com:

   ```bash
   docker network ls
   ```

3. Crie o arquivo `.env` ao lado do compose, **fora do Git**:

   ```bash
   echo "POSTGRES_WEEKTODO_PASSWORD=$(openssl rand -base64 32)" >> .env
   ```

4. Suba o serviço:

   ```bash
   docker compose up -d postgres-weektodo
   docker compose ps postgres-weektodo
   ```

## 2. Criar as tabelas

```bash
docker compose exec -T postgres-weektodo \
  psql -U weektodo -d weektodo < server/schema.sql
```

Conferir:

```bash
docker compose exec postgres-weektodo \
  psql -U weektodo -d weektodo -c '\dt'
```

Devem aparecer `sync_doc`, `sync_token` e `sync_user`.

## 3. Cadastrar o usuário

A senha nunca é guardada em claro: `crypt()` com `gen_salt('bf')` gera o hash no
próprio banco.

```bash
docker compose exec postgres-weektodo \
  psql -U weektodo -d weektodo -c \
  "INSERT INTO sync_user (username, password_hash)
   VALUES ('andre', crypt('SUA_SENHA_AQUI', gen_salt('bf')));"
```

Trocar a senha depois:

```bash
docker compose exec postgres-weektodo \
  psql -U weektodo -d weektodo -c \
  "UPDATE sync_user SET password_hash = crypt('NOVA_SENHA', gen_salt('bf'))
    WHERE username = 'andre';
   DELETE FROM sync_token WHERE username = 'andre';"
```

Apagar os tokens junto desconecta os dispositivos que usavam a senha antiga.

## 4. Backup e restauração

```bash
# Backup
docker compose exec -T postgres-weektodo \
  pg_dump -U weektodo -d weektodo > weektodo-$(date +%F).sql

# Restauração (banco vazio)
docker compose exec -T postgres-weektodo \
  psql -U weektodo -d weektodo < weektodo-2026-09-02.sql
```

## 5. Credencial do Postgres no n8n

No n8n: **Credentials → New → Postgres**.

| Campo | Valor |
|---|---|
| Host | `postgres-weektodo` |
| Database | `weektodo` |
| User | `weektodo` |
| Password | o valor de `POSTGRES_WEEKTODO_PASSWORD` |
| Port | `5432` |
| SSL | desligado (rede interna do Docker) |

Nomeie a credencial **Postgres WeekToDo** — é o nome que os workflows esperam.

## 6. Importar os workflows

Importe, nesta ordem, `server/n8n/auth.json`, `server/n8n/pull.json` e
`server/n8n/push.json` (**Workflows → Import from File**).

Em cada um, ajuste dois pontos:

1. **Credencial** — todo nó Postgres vem com
   `SUBSTITUA_PELO_ID_DA_CREDENCIAL`; selecione a credencial criada no passo 5.
2. **CORS** — no nó Webhook, o campo *Allowed Origins* vem com
   `https://SEU-SITE.pages.dev`. Troque pela origem publicada do app. **Nunca
   use `*`**: qualquer site poderia falar com o seu servidor.

Ative os três workflows. As URLs ficam:

```
https://SEU-N8N/webhook/weektodo/auth
https://SEU-N8N/webhook/weektodo/pull
https://SEU-N8N/webhook/weektodo/push
```

No app, o endereço a configurar é a base: `https://SEU-N8N/webhook/weektodo`.

> Editou um workflow pela interface do n8n? Exporte de novo por cima do JSON em
> `server/n8n/` e faça commit. Caso contrário o repositório passa a mentir.

## 7. Testar os webhooks

```bash
BASE=https://SEU-N8N/webhook/weektodo

# 7.1 auth — devolve { "token": "..." }
TOKEN=$(curl -s -X POST "$BASE/auth" \
  -H 'content-type: application/json' \
  -d '{"username":"andre","password":"SUA_SENHA_AQUI"}' | jq -r .token)
echo "$TOKEN"

# 7.2 senha errada — deve responder 401 sem detalhar o motivo
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/auth" \
  -H 'content-type: application/json' \
  -d '{"username":"andre","password":"errada"}'

# 7.3 pull vazio — { "revision": 0, "docs": [] }
curl -s -X POST "$BASE/pull" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"since":0}'

# 7.4 push de um documento novo (baseRevision 0 = ainda não existe)
curl -s -X POST "$BASE/push" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"docs":[{"kind":"todo_lists","docId":"20260902","payload":[],"baseRevision":0,"deleted":false}]}'

# 7.5 push com baseRevision obsoleta — deve voltar em "rejeitados"
curl -s -X POST "$BASE/push" \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"docs":[{"kind":"todo_lists","docId":"20260902","payload":[],"baseRevision":0,"deleted":false}]}'

# 7.6 token inválido — 401
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/pull" \
  -H 'authorization: Bearer invalido' \
  -H 'content-type: application/json' -d '{"since":0}'
```

---

## Roteiro manual de dois dispositivos

Executar depois de configurar o app nos dois aparelhos (Configurações →
Sincronização). Cada passo termina com "sincronizar agora" nos dois lados.

| # | No dispositivo A | No dispositivo B | Esperado |
|---|---|---|---|
| 1 | criar tarefa "comprar pão" | — | a tarefa aparece em B |
| 2 | — | marcar "comprar pão" como feita | A mostra a tarefa marcada |
| 3 | editar a descrição | marcar/desmarcar a caixa | as duas mudanças sobrevivem |
| 4 | apagar a tarefa | editar o texto da mesma tarefa | a tarefa **permanece**, com o texto editado |
| 5 | apagar a tarefa | apagar a tarefa | some dos dois |
| 6 | modo avião, criar duas tarefas | criar uma tarefa | ao reconectar A, as três existem nos dois |
| 7 | criar lista personalizada "Casa" | — | a lista aparece em B com as tarefas |
| 8 | criar tarefa recorrente | — | B materializa a mesma tarefa **uma vez só** |
| 9 | mudar o tema para escuro | — | B fica escuro |
| 10 | mudar o número de colunas | — | B **não** muda de colunas |
| 11 | desligar o servidor, usar o app | — | app funciona normalmente e mostra `offline` |

Nada pode sumir em nenhum passo. Se sumir, é bug da fusão
(`src/helpers/syncMerge.js`) — não ajuste o servidor.
