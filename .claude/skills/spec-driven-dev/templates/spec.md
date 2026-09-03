---
feature: <NNN-slug>
dominio: <auth|payments|ui|infra|api|reporting|notifications|admin|onboarding|...>
tags: []
status: esclarecendo   # esclarecendo | pronto
criada_em: AAAA-MM-DD
---

# <Nome da feature em linguagem comum>

## Em uma frase

<O que muda para quem usa. Máximo 25 palavras. Sem nome de arquivo, tabela ou biblioteca.>

## ⚠️ Preciso da sua decisão

<!-- Segunda seção do arquivo, sempre. Remova inteira se não houver pendência.
     Cada item: pergunta em português comum, 2-3 opções com o trade-off, e uma recomendação. -->

1. **<A pergunta, sem jargão>**
   - **A)** <opção> → <o que ganha> / <o que perde>
   - **B)** <opção> → <o que ganha> / <o que perde>
   - *Recomendo <X>, porque <motivo em uma linha>.*

## O que muda na prática

- **Hoje:** <como é agora>
- **Depois:** <como fica>

## O que o sistema precisa lembrar

<!-- Só se a feature guarda informação nova. Regras de negócio, não tabelas.
     Remova a seção se não se aplica. -->

- <Um cliente pode ter vários pedidos>
- <Todo pedido tem um cliente — não existe pedido sem dono>
- <Se o cliente for excluído, os pedidos ficam (histórico fiscal)>

## Está pronto quando

<!-- Verificável por quem não programa. Cada item é algo que dá pra testar clicando. -->

- [ ] <Faço X, acontece Y>
- [ ] <Se der errado em Z, vejo a mensagem W>

## Não entra agora

- <O que fica explicitamente de fora, para ninguém cobrar depois>

---

<details>
<summary>Detalhes técnicos (a IA lê, você não precisa)</summary>

**Restrições:**
- <trava técnica, limite de plataforma, requisito de compliance>

**Depende de:**
- <feature, serviço externo ou credencial que precisa existir antes>

**Cenários alternativos:**
- <situação> → <comportamento esperado>

</details>
