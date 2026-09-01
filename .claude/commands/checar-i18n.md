---
description: Verifica chaves de tradução faltando nos 19 idiomas
---

Verifique a integridade das traduções do projeto.

Rode:

```bash
python3 - <<'PY'
import json, glob, os
base = json.load(open('src/assets/languages/en.json'))
def flat(d, p=''):
    for k, v in d.items():
        yield from flat(v, f'{p}{k}.') if isinstance(v, dict) else iter([f'{p}{k}'])
ref = set(flat(base))
print('chaves em en.json:', len(ref))
problema = False
for f in sorted(glob.glob('src/assets/languages/*.json')):
    if f.endswith('en.json'): continue
    atual = set(flat(json.load(open(f))))
    faltando, sobrando = ref - atual, atual - ref
    if faltando or sobrando:
        problema = True
        print(os.path.basename(f), '| faltando:', sorted(faltando), '| sobrando:', sorted(sobrando))
if not problema:
    print('OK — todos os idiomas em dia com en.json')
PY
```

Depois, procure por strings visíveis ao usuário que tenham escapado do i18n:

```bash
grep -rn '>[A-Z][a-z]\{3,\}' src --include=*.vue | grep -v '\$t(' | head -30
```

Reporte o que encontrar. Só corrija se eu pedir — para chaves faltando, o
conteúdo precisa ser traduzido de verdade, não copiado do inglês.
