---
description: Audita a conformidade do fork com a GPL-3.0 e a atribuição ao projeto original
---

Audite a conformidade deste fork com a GPL-3.0. Use
`.claude/docs/licenca-e-fork.md` como referência do que já foi feito e do que
está pendente.

Verifique:

1. **`LICENSE`** continua sendo o texto íntegro da GPL-3.0, sem alterações.
2. **`NOTICE`** existe, credita a obra original (autor, repositório, copyright)
   e traz o registro de modificações exigido pela seção 5a.
3. **`package.json`** declara `"license": "GPL-3.0-only"` e não aponta mais para
   o autor, o site ou o repositório do projeto original.
4. **Créditos ao autor original** continuam presentes no README e no modal
   Sobre — remover atribuição viola a licença.
5. **Nenhuma infraestrutura do upstream é usada como se fosse deste fork:**
   confira `.github/FUNDING.yml`, `.github/workflows/release.yml`,
   `netlify.toml` e `src/appConfig.js`.
6. **Dependências:** rode
   `python3 -c "import json;d=json.load(open('package.json'));print(list(d['dependencies'])+list(d['devDependencies']))"`
   e sinalize qualquer licença incompatível com GPL-3.0 (proprietária, BSL,
   SSPL, Elastic, CC BY-NC).
7. **Marca:** liste os arquivos de logo/ícone ainda com a identidade visual do
   projeto original (a lista de caminhos está em `.claude/docs/licenca-e-fork.md`).
8. **Strings de i18n** que ainda citam o nome do projeto original:
   `grep -rin "weektodo" src/assets/languages/ | head -30`

Entregue um relatório curto: o que está em conformidade, o que é violação real
e o que é apenas pendência de branding. Não altere arquivos sem eu pedir.
