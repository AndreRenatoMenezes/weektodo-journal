# Adotar SDD em projeto existente

## Princípio

**Não escreva specs retroativas.** Tentar documentar todo o código legado é o
jeito mais rápido de abandonar o fluxo. Comece só com features novas; o legado
fica documentado à medida que você mexe nele.

## Passos

### 1. Criar a estrutura mínima

```
.claude/specs/
├── INBOX.md      (do template)
├── ROADMAP.md    (do template)
└── current/
```

### 2. Criar o `CLAUDE.md` na raiz

É o arquivo que todo agente lê. Deve conter, e só:

- **Stack e travas técnicas** — linguagem, framework, versões, o que não pode
  ser adicionado como dependência
- **Definição de Pronto universal** — os critérios que valem para toda WP
  (compila, lint passa, testes passam, etc). Isso evita repeti-los em cada WP.
- **Convenções** que não dá para inferir do código

Não descreva os agentes nem o fluxo SDD aqui — isso vive na skill. Duplicar
custa contexto em toda sessão.

### 3. Documentar o banco (se houver)

Crie `.claude/specs/schema.md` a partir do template, com o estado **atual** do
banco. Uma vez só. Daí em diante cada feature atualiza o delta.

Se o banco for grande, comece pelas tabelas que a próxima feature vai tocar e
vá completando. Schema parcial e honesto vale mais que schema completo e
desatualizado.

### 4. Primeira feature

Escolha uma feature pequena e real. Rode o fluxo inteiro — propor, planejar,
implementar, revisar, arquivar. O objetivo da primeira é calibrar o tamanho das
WPs, não entregar rápido.

### 5. Encher o INBOX

Toda vez que esbarrar em bug ou dívida no legado, uma linha no `INBOX.md`.
Em duas semanas você tem um roadmap real, tirado do uso e não da imaginação.

## Sobre código legado

Quando uma feature nova mexer numa área legada mal compreendida, peça uma
**WP de investigação** ao Spec Architect: uma WP cuja entrega é uma seção no
`plan.md` descrevendo o que existe. Ela vale as 30–90 min — é o que evita o
Software Engineer varrer o codebase durante a implementação.
