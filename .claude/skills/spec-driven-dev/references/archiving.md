# Arquivamento manual

Use quando não houver terminal (claude.ai) ou por preferência.
Com terminal: `bash scripts/archive-feature.sh <NNN-slug>` faz os passos 1–5.

## Pré-condição

Todas as WPs em `lane: pronto` (confira em `tasks.md` — o que já foi aprovado
está em `tasks-done.md`). Se houver WP em outra lane, **não arquive**: termine
ou cancele explicitamente. Cancelada também vai para archive, com o motivo no
`ARCHIVED.md`.

Confirme também que `schema.md` está atualizado, se a feature mexeu em banco.
Ele **não** é arquivado junto — é permanente e fica na raiz de `.claude/specs/`.

## Passos

### 1. Confirmar o domínio

Frontmatter do `spec.md`, campo `dominio`. Se vazio, defina antes de arquivar.
Sugestões: `auth`, `payments`, `ui`, `infra`, `api`, `reporting`,
`notifications`, `admin`, `onboarding`. Nenhum encaixa? Invente uma palavra em
kebab-case (`search`, `messaging`, `import-export`). Sem acento, sem espaço.

Não mude o domínio no momento de arquivar — ajuste antes, depois arquive.

### 2. Mover a pasta

`.claude/specs/current/<NNN-slug>/` → `.claude/specs/archive/<dominio>/<NNN-slug>/`

Mova tudo, incluindo `tasks-done.md`. A pasta em `current/` deve sumir.

### 3. Criar `ARCHIVED.md`

Copie de `templates/ARCHIVED.md` e preencha. O resumo é sobre o **resultado
observável**, no passado — não sobre o processo.

### 4. Regenerar o índice

`python3 scripts/build-archive-index.py` — lê o frontmatter de todas as specs
arquivadas e reescreve `archive/INDEX.md`.

Sem terminal: adicione a linha da feature manualmente na tabela do `INDEX.md`.
É markdown simples, não quebra nada.

### 5. Atualizar `ROADMAP.md`

Remova de "Em curso", adicione em "Concluídas recentemente". Máximo 5 itens
lá — o histórico completo vive no `INDEX.md`.

### 6. Comunicar

> *"Feature `<NNN-slug>` arquivada em `archive/<dominio>/`. Índice atualizado.
> Próxima feature no roadmap: `<próxima>`."*

## O que NÃO fazer

- **Não edite `spec.md` ou `plan.md` ao arquivar.** Ficam congelados como
  artefato histórico. Divergências vão para "Desvios da spec original" no
  `ARCHIVED.md`.
- **Não delete nada.** Cancelamento preserva os arquivos.
- **Não junte várias features num `ARCHIVED.md`.** Cada feature tem o seu.
