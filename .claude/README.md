# Pasta `.claude/`

Configuração e documentação do projeto para uso com o
[Claude Code](https://claude.com/claude-code).

```
.claude/
├── settings.json          # permissões de ferramenta (versionado)
├── settings.local.json    # sobrescritas pessoais (ignorado pelo git)
├── commands/              # comandos de barra do projeto
│   ├── nova-feature.md    # /nova-feature <descrição>
│   ├── checar-i18n.md     # /checar-i18n
│   └── conformidade-gpl.md# /conformidade-gpl
└── docs/                  # documentação de referência
    ├── arquitetura.md     # ciclo de vida, camadas, fluxo de dados, Electron
    ├── modelo-de-dados.md # localStorage, IndexedDB, formato da tarefa, backup
    ├── receitas.md        # passo a passo das alterações mais comuns
    ├── i18n.md            # como mexer nas 19 traduções
    ├── licenca-e-fork.md  # GPL-3.0, o que já foi feito, o que falta
    └── roadmap-fork.md    # o que este fork quer ser  <- preencher
```

O `CLAUDE.md` na raiz é carregado automaticamente em toda sessão e aponta para
estes documentos. Os arquivos em `docs/` são lidos sob demanda — mantê-los
separados evita ocupar contexto com detalhe que nem sempre é necessário.

Começando um recurso novo? Registre a ideia em `docs/roadmap-fork.md` primeiro,
depois use `/nova-feature`.
