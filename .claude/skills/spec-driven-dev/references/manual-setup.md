# Criar feature sem terminal (claude.ai)

Quando `scripts/new-feature.sh` não estiver disponível.

## 1. Descobrir o próximo número

Liste as pastas em `.claude/specs/current/` e `.claude/specs/archive/*/`.
Pegue o maior prefixo `NNN` e some 1. Formato com três dígitos: `007`.

## 2. Criar a pasta

`.claude/specs/current/<NNN-slug>/`

Slug em kebab-case, começando com letra: `login-via-google`, não
`Login_Google`.

## 3. Criar os três arquivos

Copie de `templates/`: `spec.md`, `plan.md`, `tasks.md`.

Substitua em cada um:
- `<NNN-slug>` → o ID real da feature
- `AAAA-MM-DD` → a data de hoje
- `<dominio>` → o domínio, ou deixe vazio para definir depois

Não crie `tasks-done.md` agora — o Review Agent cria na primeira aprovação.

## 4. Estrutura mínima do projeto

Se ainda não existirem, crie a partir dos templates:

- `.claude/specs/INBOX.md`
- `.claude/specs/ROADMAP.md`
- `.claude/specs/schema.md` (só se o projeto tem banco)

## 5. Registrar no roadmap

Adicione a feature na seção "Em curso" do `ROADMAP.md`.
