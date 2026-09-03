#!/usr/bin/env bash
# archive-feature.sh — move feature concluída para archive/<dominio>/ e regenera o índice.
#
# Uso: bash scripts/archive-feature.sh <NNN-slug>
# Rode a partir da raiz do repositório.

set -euo pipefail

[ $# -eq 1 ] || { echo "Uso: bash scripts/archive-feature.sh <NNN-slug>" >&2; exit 1; }

FEATURE_ID="$1"
SRC=".claude/specs/current/${FEATURE_ID}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES="$SCRIPT_DIR/../templates"

[ -d "$SRC" ] || { echo "Erro: $SRC não encontrado." >&2; exit 1; }

# Trava: nenhuma WP pode estar fora de 'pronto' no tasks.md (WPs vivas).
if [ -f "$SRC/tasks.md" ] && grep -qE '^lane: (planejado|fazendo|revisão|revisao)' "$SRC/tasks.md"; then
  echo "Erro: ainda há WPs não aprovadas em $SRC/tasks.md:" >&2
  grep -nE '^lane: (planejado|fazendo|revisão|revisao)' "$SRC/tasks.md" >&2
  echo "Termine ou cancele explicitamente antes de arquivar." >&2
  exit 1
fi

# Domínio vem do frontmatter do spec.md.
DOMINIO=$(sed -n 's/^dominio:[[:space:]]*//p' "$SRC/spec.md" | head -1 | tr -d '\r')
DOMINIO="${DOMINIO:-sem-dominio}"
case "$DOMINIO" in
  '<'*|'') DOMINIO="sem-dominio" ;;
esac

DEST=".claude/specs/archive/${DOMINIO}/${FEATURE_ID}"
[ -d "$DEST" ] && { echo "Erro: $DEST já existe." >&2; exit 1; }

mkdir -p ".claude/specs/archive/${DOMINIO}"
mv "$SRC" "$DEST"

TODAY=$(date +%Y-%m-%d)
if [ ! -f "$DEST/ARCHIVED.md" ]; then
  cp "$TEMPLATES/ARCHIVED.md" "$DEST/ARCHIVED.md"
  sed -i.bak \
    -e "s|<NNN-slug>|${FEATURE_ID}|g" \
    -e "s|AAAA-MM-DD|${TODAY}|g" \
    -e "s|^- \*\*Domínio:\*\* .*|- **Domínio:** ${DOMINIO}|" \
    "$DEST/ARCHIVED.md"
  rm "$DEST/ARCHIVED.md.bak"
fi

python3 "$SCRIPT_DIR/build-archive-index.py" >/dev/null

echo "✓ Arquivada em: $DEST"
echo "✓ Índice regenerado: .claude/specs/archive/INDEX.md"
echo ""
echo "Faltam 2 passos manuais:"
echo "  1. Preencher $DEST/ARCHIVED.md (resumo, WPs, desvios)"
echo "  2. Mover a feature para 'Concluídas recentemente' no ROADMAP.md"
