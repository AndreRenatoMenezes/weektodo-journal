---
feature: 001-sync-n8n
dominio: infra
tags: [sync, multi-dispositivo, offline-first, n8n]
status: pronto
criada_em: 2026-09-01
---

# Sincronizar as tarefas entre meus dispositivos

## Em uma frase

As tarefas passam a ser as mesmas no PC de casa, no PC do trabalho e no celular, sem eu precisar copiar nada.

## O que muda na prática

- **Hoje:** cada dispositivo tem a própria cópia. O que você escreve no trabalho não existe em casa, e não dá para saber se está faltando algo.
- **Depois:** você abre o app pelo navegador — nada para instalar — informa endereço, usuário e senha do seu servidor uma vez por dispositivo. Ao abrir, ele puxa o que mudou; um botão "sincronizar agora" envia e recebe quando você quiser. Sem internet, tudo continua funcionando — sincroniza quando a conexão volta.
- **Em todos os dispositivos:** o app fica num endereço público na internet, onde só a tela mora. Suas tarefas continuam apenas no aparelho e no seu servidor.
- **Instalação opcional:** navegador oferece "instalar aplicativo". Instalado, o app abre em janela própria, funciona sem internet e o navegador para de descartar seus dados sozinho.

## Como ficou decidido

- **Conflito entre dispositivos:** resolvido tarefa a tarefa. Cada tarefa fica na versão mais recente e as duas listas se juntam; nada é descartado em bloco.
- **Onde os dados ficam:** num banco próprio no seu servidor, separado do banco do n8n, alcançável só de dentro do servidor. O n8n continua sendo o único componente exposto à internet.
- **Como o app é usado:** pelo navegador, em todos os dispositivos, sem instalar programa. A tela fica numa hospedagem estática pública e gratuita. A versão de desktop continua existindo e funcionando, mas deixa de ser o caminho principal.
- **Funcionar sem internet:** o app guarda uma cópia de si mesmo no navegador e pede ao navegador para não descartar seus dados. Instalar como aplicativo reforça as duas coisas.
- **Configurações:** sincronizam as que valem em qualquer aparelho (tema, idioma, início da semana, comportamento das tarefas). As que dependem do tamanho da tela ou do sistema — colunas, zoom, divisor, bandeja, inicialização — ficam por aparelho.
- **Quando sincroniza:** puxa sozinho ao abrir o app; o resto é no botão.
- **Entrar no servidor:** tela de conexão com endereço, usuário e senha. Não há sessão que expira nem tela de bloqueio.

## O que o sistema precisa lembrar

- Cada tarefa passa a ter identidade própria e a data da última mudança — é isso que permite juntar edições feitas em lugares diferentes.
- Tarefa apagada fica registrada como apagada por um tempo; senão ela volta do outro dispositivo.
- As tarefas que se repetem sincronizam junto com as tarefas comuns.
- O servidor guarda a última versão de cada lista, não o histórico.
- Cada dispositivo lembra quando sincronizou pela última vez, para pedir só o que mudou desde então.

## Está pronto quando

- [ ] Informo endereço, usuário e senha nas configurações e vejo "conectado" ou uma mensagem de erro clara.
- [ ] Crio uma tarefa no PC, abro o outro dispositivo, e ela está lá.
- [ ] Marco uma tarefa como feita em um lado e ela aparece feita no outro.
- [ ] Apago uma tarefa em um lado e ela não volta.
- [ ] Fico sem internet, edito, volto a ter internet: minhas edições sobem e as do outro dispositivo descem, sem nada sumir.
- [ ] Mudo o tema no PC e ele acompanha no celular; mudo o número de colunas e cada aparelho mantém o seu.
- [ ] Abro o endereço do app no navegador, coloco em modo avião e ele continua abrindo e funcionando.
- [ ] O navegador me oferece instalar o app, e instalado ele abre em janela própria.
- [ ] Sem servidor configurado, o app funciona exatamente como hoje.
- [ ] Minhas tarefas de antes da sincronização continuam lá depois da atualização.
- [ ] Sigo um passo a passo escrito e coloco o servidor e o endereço público no ar do zero, sem precisar descobrir nada por fora.

## Não entra agora

- Compartilhar listas com outras pessoas; conta de usuário, login com sessão, vários usuários no mesmo servidor.
- Criptografia ponta a ponta — protegeria contra o próprio servidor, que é seu, ao custo de perder tudo se a chave se perder.
- Histórico de versões ou desfazer entre dispositivos.
- Sincronizar arquivos anexos ou sons.
- Aviso em tempo real de mudança feita em outro dispositivo (sem servidor empurrando).
- App nativo de celular.
- Aposentar a versão de desktop — ela continua no repositório e compilando, só deixa de ser prioridade.

---

<details>
<summary>Detalhes técnicos (a IA lê, você não precisa)</summary>

**Restrições:**
- Único componente do servidor exposto à internet é o n8n. Postgres sobe no mesmo `docker-compose` sem `ports:` publicado, alcançável só pela rede interna do Docker; banco `weektodo` separado do banco do n8n, para backup independente.
- Stack travada: Vue 3 Options API, Vuex 4 sem namespace, IndexedDB via `dbRepository`, sem backend próprio. Dependência nova só com licença compatível com GPL-3.0.
- Persistência hoje: `todo_lists` (chave = `YYYYMMDD` ou nome da lista, valor = array de tarefas), `repeating_events`, `repeating_events_by_date`. Tarefa não tem `id` nem `updatedAt` — identidade é a posição no array. Merge por tarefa exige migração do formato, com preservação obrigatória dos dados existentes.
- Toda escrita atual é fire-and-forget (`dbRepository` não espera `onsuccess`); sync confiável exige encapsular isso.
- **Web-first.** O navegador é o alvo principal em todos os dispositivos; Electron continua compilando e funcionando, mas nenhum caminho pode depender de `isElectron()`. Recursos exclusivos do desktop (bandeja, iniciar com o sistema, notificação nativa) seguem atrás desse guard.
- **PWA é requisito, não extra.** Sem service worker, web-first significa que sem rede o app nem carrega. Ligar o registro comentado, adicionar o plugin PWA e definir a estratégia de cache dos assets. Entra antes dos pacotes de sync do cliente.
- **Risco de descarte de dados pelo navegador.** IndexedDB não é permanente: Safari no iOS apaga dados de sites não instalados após 7 dias sem uso; navegadores baseados em Chromium e o Firefox descartam sob pressão de disco. Mitigação obrigatória: chamar `navigator.storage.persist()` e orientar a instalação como aplicativo. Sem isso, web-first é regressão em relação ao Electron de hoje.
- **Ponto de partida é servidor zero.** Existe só o n8n instalado, nada mais configurado. Postgres, workflows, hospedagem e domínio são entregas desta feature, cada uma com passo a passo executável pelo usuário, não pré-requisitos assumidos.
- Origem pública chamando o n8n exige CORS restrito a essa origem — nunca `*`.
- Endpoint do servidor e credenciais são por dispositivo: entram no `config` local e **nunca** no payload sincronizado.
- Service worker está comentado em `public/index.html:46` e não há plugin PWA no `package.json`.
- Cloudflare Pages: build com Node 16 (webpack 4 / vue-cli 4) e `NODE_OPTIONS=--openssl-legacy-provider` se a imagem usar Node ≥ 17. Ver armadilhas de ambiente no `CLAUDE.md`.

**Configurações — lista branca (a fechar no plan, chaves de `configRepository.load()`):**
- *Sincronizam:* `darkTheme`, `language`, `weekStartOnMonday`, `startCalendarYesterday`, `moveOldTasks`, `autoReorderTasks`, `moveCompletedTaskToBottom`, `moveCompletedSubTaskToBottom`, `notificationIndicator`, `notificationSound`, `customList`, `calendar`, `compactView`.
- *Por aparelho:* `columns`, `customColumns`, `zoom`, `calendarHeight`, `mainDividerPosition`, `fullscreenToDoModal`, `darkTrayIcon`, `openOnStartup`, `runInBackground`, `notificationOnStartup`, `checkUpdates`.
- *Nunca sincronizam:* `version`, `firstTimeOpen`, `lastDayOpened`, `importing`, `dateToShowInitialDonateModal`, `InitialDonateModalShown`.

**Entregas de infraestrutura (não são pré-requisitos — são pacotes de trabalho):**
- Serviço Postgres no `docker-compose` do n8n, sem `ports:` publicado, banco `weektodo` separado, com script de criação de tabelas e rotina de backup.
- Workflows n8n exportados como JSON versionado no repositório: autenticação (endereço/usuário/senha → token de longa duração), pull e push, com CORS restrito à origem do site.
- Projeto no Cloudflare Pages ligado ao repositório, com build correto e domínio definido.
- Cada uma acompanha um passo a passo em `.claude/docs/` que o usuário executa no servidor dele.

**Depende de:**
- n8n já instalado e acessível por HTTPS com domínio estável — única coisa que já existe hoje.

**Cenários alternativos:**
- Servidor fora do ar → app segue offline, marca pendências, tenta na próxima sincronização; nenhum erro bloqueante.
- Credencial errada / 401 → estado "não conectado" nas configurações, sem loop de retentativa.
- Relógio do dispositivo errado → registrar contador de versão por tarefa junto com a hora, para não depender só do relógio.
- Duas abas do mesmo dispositivo → a última escrita local vence; sem tratamento especial.
- Migração de formato com dados existentes → executada uma vez, idempotente, sem perda; ver `src/migrations/`.

**Estratégia:** servidor burro, cliente inteligente. O n8n expõe autenticação, pull e push sobre armazenamento chave-valor por lista; toda a lógica de merge fica em JS no repositório, testável e versionada. Evita lógica de negócio dentro de nós do n8n.

</details>
