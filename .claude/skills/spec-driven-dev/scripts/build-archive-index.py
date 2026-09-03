#!/usr/bin/env python3
"""build-archive-index.py — regenera .claude/specs/archive/INDEX.md.

Le o frontmatter YAML simples de cada spec.md arquivada e monta uma tabela
markdown navegavel, agrupada por dominio. Sem dependencias externas.

Uso:
    python3 scripts/build-archive-index.py [<raiz-do-archive>]
"""

import sys
from pathlib import Path

DEFAULT_ROOT = Path(".claude/specs/archive")


def parse_frontmatter(path: Path) -> dict:
    """Extrai pares chave: valor do bloco --- ... --- no topo do arquivo."""
    data: dict = {}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return data

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return data

    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if value.startswith("[") and value.endswith("]"):
            items = [v.strip() for v in value[1:-1].split(",") if v.strip()]
            data[key] = items
        else:
            data[key] = value
    return data


def first_paragraph_after(path: Path, heading: str) -> str:
    """Devolve a primeira linha de conteudo apos um heading markdown."""
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ""

    found = False
    for line in lines:
        if line.strip().lower().startswith(heading.lower()):
            found = True
            continue
        if found:
            stripped = line.strip()
            if not stripped or stripped.startswith("<!--"):
                continue
            if stripped.startswith("#"):
                return ""
            return stripped.lstrip("> ").strip()
    return ""


def collect(root: Path) -> list:
    features = []
    for spec_path in sorted(root.glob("*/*/spec.md")):
        feature_dir = spec_path.parent
        fm = parse_frontmatter(spec_path)
        archived = feature_dir / "ARCHIVED.md"
        afm = parse_frontmatter(archived) if archived.exists() else {}

        features.append(
            {
                "id": fm.get("feature") or feature_dir.name,
                "dominio": fm.get("dominio") or feature_dir.parent.name,
                "tags": fm.get("tags") or [],
                "resumo": first_paragraph_after(spec_path, "## Em uma frase"),
                "criada": fm.get("criada_em", ""),
                "arquivada": afm.get("arquivada_em", ""),
                "path": feature_dir.as_posix(),
                "rel": f"{feature_dir.parent.name}/{feature_dir.name}",
            }
        )
    return features


def render(features: list) -> str:
    out = ["# Índice do archive", ""]

    if not features:
        out += ["_Nenhuma feature arquivada ainda._", ""]
        return "\n".join(out)

    dominios = sorted({f["dominio"] for f in features})
    all_tags = sorted({t for f in features for t in f["tags"]})

    out += [
        f"{len(features)} feature(s) arquivada(s) em {len(dominios)} domínio(s).",
        "",
        "**Domínios:** " + " · ".join(f"[{d}](#{d})" for d in dominios),
        "",
    ]
    if all_tags:
        out += ["**Tags:** " + " · ".join(f"`{t}`" for t in all_tags), ""]
    out += ["Use Ctrl+F para buscar por tag ou palavra.", "", "---", ""]

    for dominio in dominios:
        out += [f"## {dominio}", "", "| Feature | O que faz | Tags |", "|---|---|---|"]
        for f in sorted(
            (x for x in features if x["dominio"] == dominio), key=lambda x: x["id"]
        ):
            tags = " ".join(f"`{t}`" for t in f["tags"]) or "—"
            resumo = (f["resumo"] or "—").replace("|", "\\|")
            if resumo.startswith("<"):
                resumo = "—"
            out.append(f"| [{f['id']}]({f['rel']}/spec.md) | {resumo} | {tags} |")
        out.append("")

    return "\n".join(out)


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ROOT
    if not root.is_dir():
        print(f"Erro: {root} não encontrado.", file=sys.stderr)
        return 1

    features = collect(root)
    index_path = root / "INDEX.md"
    index_path.write_text(render(features) + "\n", encoding="utf-8")
    print(f"✓ {index_path} — {len(features)} feature(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
