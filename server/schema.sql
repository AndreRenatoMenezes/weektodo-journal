-- WeekToDo Journal — schema de sincronização (Postgres)
--
-- O servidor é burro: guarda documentos JSON opacos versionados por um contador
-- global. Ele não conhece o formato de uma tarefa e não resolve conflito — isso
-- vive no cliente, em src/helpers/syncMerge.js.
--
-- Aplicar com:
--   docker compose exec -T postgres-weektodo \
--     psql -U weektodo -d weektodo < server/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Relógio lógico do servidor. Cada escrita em sync_doc consome o próximo valor,
-- e o pull pede tudo com revision > since.
CREATE SEQUENCE IF NOT EXISTS sync_revision_seq;

CREATE TABLE IF NOT EXISTS sync_user (
    username      text PRIMARY KEY,
    password_hash text        NOT NULL,
    criado_em     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_token (
    token_hash text PRIMARY KEY,
    username   text        NOT NULL REFERENCES sync_user (username) ON DELETE CASCADE,
    criado_em  timestamptz NOT NULL DEFAULT now(),
    usado_em   timestamptz
);

-- kind separa os espaços de nome: uma lista personalizada pode se chamar
-- "20260902" e colidir com um dia do calendário.
CREATE TABLE IF NOT EXISTS sync_doc (
    kind       text        NOT NULL,
    doc_id     text        NOT NULL,
    payload    jsonb       NOT NULL,
    revision   bigint      NOT NULL DEFAULT nextval('sync_revision_seq'),
    deleted    boolean     NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (kind, doc_id)
);

-- O pull varre por revisão, nunca por chave primária.
CREATE INDEX IF NOT EXISTS sync_doc_revision_idx ON sync_doc (revision);

-- Documento apagado vira lápide (deleted = true); apagar a linha faria o
-- documento voltar do outro dispositivo no próximo ciclo.
--
-- Manutenção sugerida (rodar manualmente de tempos em tempos):
--   DELETE FROM sync_doc WHERE deleted AND updated_at < now() - interval '90 days';
