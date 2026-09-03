---
name: spec-driven-dev
description: Orienta o desenvolvimento de software via specs em markdown como fonte da verdade, com três agentes especializados (Spec Architect, Software Engineer, Review Agent), pacotes de trabalho com lanes (planejado → fazendo → revisão → pronto) e arquivamento por domínio. Use SEMPRE que o usuário mencionar "spec-driven", "SDD", "spec architect", "feature nova", "criar spec", "implementar WP", "revisar WP", quando o projeto tiver pasta `.claude/specs/`, ou quando pedir para estruturar/migrar um projeto para desenvolvimento orientado a specs. Também dispare quando o usuário descrever uma ideia de feature e pedir para começar a trabalhar nela — esse é o gatilho mais comum.
---

# Spec-Driven Development

## Filosofia

A spec é a fonte da verdade. Se código e spec divergem, a spec ganha — o código é o bug.

Três artefatos por feature, sempre nessa ordem:

1. **`spec.md`** — o quê e por quê, em linguagem de gente. Sem código, sem arquitetura.
2. **`plan.md`** — como construir. Decisões técnicas, arquivos a tocar, banco.
3. **`tasks.md`** — pacotes de trabalho (WPs) de 30–90 min, com lanes.

Tudo é markdown. Não existe HTML, JSON ou build step neste fluxo — humano e IA leem os mesmos arquivos.

Fluxo: `propor → planejar → implementar → arquivar`, com loop de feedback de volta ao propor.

## Os três agentes

Em qualquer sessão, **um único agente está ativo**. Declare qual antes de tocar `.claude/specs/` ou `src/`. Sem agente declarado, atue como assistente neutro e não escreva nesses caminhos.

| Agente | Faz | Leia antes de agir |
|---|---|---|
| **Spec Architect** | Escreve spec/plan/tasks. Não toca código. | `agents/architect.md` |
| **Software Engineer** | Implementa WPs. Não toca specs. | `agents/engineer.md` |
| **Review Agent** | Valida WPs. Não toca código nem specs. | `agents/reviewer.md` |

Carregue **apenas** o arquivo do agente ativo. Nunca os três.

Invocação: `Modo: Spec Architect`, `[Spec Architect] <pedido>`, ou "atue como Spec Architect e...".

## Estrutura de pastas

```
.claude/specs/
├── INBOX.md          ← ideias soltas, bugs, dívidas (1 linha cada)
├── ROADMAP.md        ← features priorizadas
├── schema.md         ← banco de dados completo (fonte única da verdade)
├── current/          ← features ativas
│   └── 001-login/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md        ← WPs vivas
│       └── tasks-done.md   ← WPs aprovadas (arquivo morto, não releia)
└── archive/          ← concluídas, por domínio
    ├── INDEX.md      ← tabela de tudo já arquivado, com tags
    ├── auth/001-login/
    └── payments/002-pix/
```

**Por que `archive/` separado de `current/`:** ao criar feature nova, leia só `current/`. `archive/` é consulta sob demanda via `INDEX.md`.

**Por que archive por domínio:** reaproveitamento cross-project. Precisa da spec de "login via Google" em outro projeto? Abre `archive/auth/`.

## Regras de economia de contexto

Valem para todos os agentes. Existem porque contexto desperdiçado é o principal custo deste fluxo.

1. **Nunca leia os três artefatos "por segurança".** Cada agente tem sua lista de leitura no arquivo dele. Ela é exaustiva — o que não está lá, não leia.
2. **WP aprovada sai do `tasks.md`** e vai para `tasks-done.md`. Nunca releia `tasks-done.md` — ele existe para humano e auditoria.
3. **O banco vive em `schema.md`.** O `plan.md` da feature mostra só o delta (tabelas/colunas que ela cria ou altera). Nunca redesenhe o schema inteiro dentro de uma feature.
4. **Revisão usa `git diff`,** não leitura de arquivos inteiros.
5. **Não duplique estado.** Lane existe só no `tasks.md`. Não replique em README, ROADMAP ou comentário de código.

## Lanes de WP

```
planejado → fazendo → revisão → pronto
                ↑________|  (devolvida)
```

Movimentos válidos — tudo o mais é inválido:

- `planejado → fazendo` e `fazendo → revisão` — Software Engineer
- `revisão → pronto` e `revisão → fazendo` — Review Agent

## Criar feature nova

```bash
bash scripts/new-feature.sh <slug> [<dominio>]
# Ex: bash scripts/new-feature.sh login-via-google auth
```

Descobre o próximo NNN, cria `current/<NNN-slug>/` com `spec.md`, `plan.md` e `tasks.md` a partir dos templates. Sem terminal (claude.ai), siga `references/manual-setup.md`.

**Domínios sugeridos (kebab-case):** `auth`, `payments`, `ui`, `infra`, `api`, `reporting`, `notifications`, `admin`, `onboarding`. Determina a pasta em `archive/`. Sem domínio, vai para `archive/sem-dominio/`.

## Arquivar

Quando **todas** as WPs estão em `pronto` — Spec Architect executa:

```bash
bash scripts/archive-feature.sh <NNN-slug>
```

Move para `archive/<dominio>/`, cria `ARCHIVED.md` e regenera `INDEX.md`. Passo a passo manual em `references/archiving.md`.

Não arquive feature parcial: termine ou cancele explicitamente (cancelada também vai para archive, com o motivo no `ARCHIVED.md`).

## Templates

Comece **sempre** dos arquivos em `templates/`: `spec.md`, `plan.md`, `tasks.md`, `schema.md`, `ARCHIVED.md`, `INBOX.md`, `ROADMAP.md`.

## Quando NÃO usar

- Bug de 10 linhas → faça direto, registre no INBOX se quiser histórico.
- Protótipo descartável → SDD é overhead.
- Projeto sem `.claude/specs/` e usuário não pediu SDD → não imponha.

## Conflitos de instrução

Precedência, do mais forte ao mais fraco: escopo do agente ativo → `spec.md` → `plan.md` → `CLAUDE.md` → pedido do usuário no chat.

Se o usuário pedir algo que viola o escopo do agente ativo, **não atenda** — peça troca de agente ou ajuste da spec.

## Referências (carregue só quando precisar)

- `references/database.md` — quando e como documentar banco; migrações destrutivas
- `references/archiving.md` — arquivamento manual
- `references/migration.md` — adotar SDD em projeto existente
- `references/manual-setup.md` — criar feature sem terminal
