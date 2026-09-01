# Segurança e privacidade

Todos os dados deste aplicativo são gravados **localmente no seu dispositivo**
(`localStorage` e `IndexedDB` do navegador ou do Electron). Não existe conta de
usuário, não existe servidor deste projeto e nenhum dado de tarefas sai da sua
máquina.

## Conexões de rede

Este fork **removeu as chamadas automáticas de rede** que a versão original
fazia aos servidores do WeekToDo (verificação de atualização e busca de
patrocinadores). Ver `src/appConfig.js`: os endpoints correspondentes estão
definidos como `null` e as funções que os usam não fazem nada enquanto assim
permanecerem.

O que ainda pode gerar tráfego:

- **Sentry** (`@sentry/vue`, inicializado em `src/main.js`): só envia dados se a
  variável de ambiente `VUE_APP_SENTRY_DNS` estiver definida no build. Sem essa
  variável, nada é enviado.
- **Links clicados pelo usuário** (modal Sobre, modal de doação): abrem o
  navegador no site do projeto original. Nada é enviado automaticamente.

## Reportando uma vulnerabilidade

Abra uma issue em
<https://github.com/AndreRenatoMenezes/weektodo-journal/issues>. Se a falha for
sensível, descreva o impacto sem publicar o exploit e peça um canal privado.

Vulnerabilidades herdadas do projeto original devem ser reportadas também ao
[WeekToDo](https://github.com/manuelernestog/weektodo).
