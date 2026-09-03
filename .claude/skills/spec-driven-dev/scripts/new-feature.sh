#!/usr/bin/env bash
# new-feature.sh — cria uma nova feature em .claude/specs/current/<NNN-slug>/
#
# Uso:
#   bash scripts/new-feature.sh <slug> [<dominio>]
# Ex:
#   bash scripts/new-feature.sh login-via-google auth
#
# Rode a partir da raiz do repositório.

set -euo pipefail

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "Uso: bash scripts/new-feature.sh <slug> [<dominio>]" >&2
  exit 1
fi

SLUG="$1"
DOMINIO="${2:-}"

[[ "$SLUG" =~ ^[a-z][a-z0-9-]*$ ]] || {
  echo "Erro: slug inválido. Use a-z, 0-9, hífens; comece com letra." >&2; exit 1; }

if [ -n "$DOMINIO" ] && ! [[ "$DOMINIO" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Erro: domínio inválido. Use a-z, 0-9, hífens; comece com letra." >&2; exit 1
fi

[ -d ".claude/specs" ] || {
  echo "Erro: rode a partir da raiz do repo (esperava .claude/specs/)." >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES="$SCRIPT_DIR/../templates"
[ -d "$TEMPLATES" ] || { echo "Erro: templates não encontrados em $TEMPLATES" >&2; exit 1; }

mkdir -p .claude/specs/current .claude/specs/archive

# Próximo NNN, olhando current/ e archive/ (que tem subpastas por domínio).
set +e
HIGHEST=$(
  {
    find .claude/specs/current -maxdepth 1 -mindepth 1 -type d 2>/dev/null
    find .claude/specs/archive -mindepth 1 -type d 2>/dev/null
  } | sed 's|.*/||' | grep -E '^[0-9]{3}-' | sed 's/-.*$//' | sort -n | tail -1
)
set -e

if [ -z "$HIGHEST" ]; then NEXT="001"; else NEXT=$(printf "%03d" $((10#$HIGHEST + 1))); fi

FEATURE_ID="${NEXT}-${SLUG}"
DIR=".claude/specs/current/${FEATURE_ID}"
[ -d "$DIR" ] && { echo "Erro: $DIR já existe." >&2; exit 1; }

TODAY=$(date +%Y-%m-%d)
mkdir -p "$DIR"

for f in spec.md plan.md tasks.md; do
  cp "$TEMPLATES/$f" "$DIR/$f"
  sed -i.bak \
    -e "s|<NNN-slug>|${FEATURE_ID}|g" \
    -e "s|AAAA-MM-DD|${TODAY}|g" \
    "$DIR/$f"
  rm "$DIR/$f.bak"
done

# Domínio no frontmatter da spec, se informado.
if [ -n "$DOMINIO" ]; then
  sed -i.bak "s|^dominio: .*|dominio: ${DOMINIO}|" "$DIR/spec.md"
  rm "$DIR/spec.md.bak"
fi

# Arquivos de projeto, se ainda não existem.
[ -f .claude/specs/INBOX.md ]   || cp "$TEMPLATES/INBOX.md"   .claude/specs/INBOX.md
[ -f .claude/specs/ROADMAP.md ] || cp "$TEMPLATES/ROADMAP.md" .claude/specs/ROADMAP.md

echo "✓ Feature criada: $DIR"
echo "  ├── spec.md   ← comece por aqui"
echo "  ├── plan.md"
echo "  └── tasks.md"
echo ""
[ -z "$DOMINIO" ] && echo "⚠ Sem domínio. Defina no frontmatter do spec.md antes de arquivar."
echo "Próximo passo (Spec Architect): preencher spec.md e levantar as decisões pendentes."
