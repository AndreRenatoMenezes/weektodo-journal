import syncApi from "../repositories/syncApi";
import syncRepository from "../repositories/syncRepository";
import dbRepository from "../repositories/dbRepository";
import toDoListRepository from "../repositories/toDoListRepository";
import customToDoListIdsRepository from "../repositories/customToDoListIdsRepository";
import configRepository from "../repositories/configRepository";
import { mergeDocument, deepEqual } from "./syncMerge";
import moment from "moment";

// Ciclo: pull -> fusao -> gravacao local -> push -> atualizacao do sync_base.
// O servidor nao entende o formato dos documentos; tudo o que decide o que
// sobrevive esta aqui e em syncMerge.js.

const MAX_CICLOS = 3;
const DOC_UNICO = "all";

// Preferencias que valem em qualquer aparelho. Chave fora desta lista nunca e
// sincronizada, mesmo que apareca num documento vindo do servidor.
//
//   aparencia  — como o app se parece
//   conteudo   — o que o app mostra e move
//   avisos     — quando o app avisa
export const CONFIG_SINCRONIZADA = [
  // aparencia
  "darkTheme",
  "compactView",
  "fullscreenToDoModal",
  "language",
  // conteudo
  "calendar",
  "customList",
  "weekStartOnMonday",
  "startCalendarYesterday",
  "moveOldTasks",
  "autoReorderTasks",
  "moveCompletedTaskToBottom",
  "moveCompletedSubTaskToBottom",
  // avisos
  "notificationOnStartup",
  "notificationSound",
  "notificationIndicator",
];

// Preferencias deliberadamente fora: colunas, zoom, altura do calendario e
// posicao do divisor dependem do tamanho da tela; credenciais e deviceId sao
// locais por definicao; openOnStartup, runInBackground e darkTrayIcon so
// existem no desktop.

function estaConfigurado(config) {
  return !!config.syncUrl && !!config.syncToken;
}

function agora() {
  return Date.now();
}

// ---------------------------------------------------------------- leitura ---

async function lerLocal() {
  const db = await dbRepository.openAsync();
  const config = configRepository.load();
  const configSincronizada = {};
  CONFIG_SINCRONIZADA.forEach((key) => {
    if (key in config) configSincronizada[key] = config[key];
  });

  return {
    todo_lists: await dbRepository.selectAllAsync(db, "todo_lists"),
    repeating_events: await dbRepository.selectAllAsync(db, "repeating_events"),
    repeating_events_by_date: await dbRepository.selectAllAsync(db, "repeating_events_by_date"),
    custom_lists: { [DOC_UNICO]: customToDoListIdsRepository.load() },
    config: { [DOC_UNICO]: configSincronizada },
  };
}

// Snapshot da ultima sincronizacao, indexado por kind e docId.
function indexarBase(entradas) {
  const base = {};
  Object.values(entradas || {}).forEach((entrada) => {
    if (!entrada || !entrada.kind) return;
    if (!base[entrada.kind]) base[entrada.kind] = {};
    base[entrada.kind][entrada.docId] = entrada;
  });
  return base;
}

function indexarRemoto(docs) {
  const remoto = {};
  (docs || []).forEach((doc) => {
    if (!remoto[doc.kind]) remoto[doc.kind] = {};
    remoto[doc.kind][doc.docId] = doc;
  });
  return remoto;
}

// -------------------------------------------------------------- carimbagem ---

// Carimba updatedAt/updatedBy nas tarefas que mudaram desde a ultima
// sincronizacao. E aqui que a imprecisao documentada no plano acontece: o
// carimbo e do momento da deteccao, nao do clique.
function carimbarTarefas(kind, payloadLocal, payloadBase, deviceId) {
  if (kind !== "todo_lists" || !Array.isArray(payloadLocal)) return payloadLocal;
  const baseById = new Map();
  (Array.isArray(payloadBase) ? payloadBase : []).forEach((t) => {
    if (t && t.id) baseById.set(t.id, t);
  });
  const timestamp = agora();
  return payloadLocal.map((tarefa) => {
    if (!tarefa || !tarefa.id) return tarefa;
    const anterior = baseById.get(tarefa.id);
    const semMeta = (t) => {
      const copia = { ...t };
      delete copia.updatedAt;
      delete copia.updatedBy;
      return copia;
    };
    if (anterior && deepEqual(semMeta(tarefa), semMeta(anterior))) return tarefa;
    return { ...tarefa, updatedAt: timestamp, updatedBy: deviceId };
  });
}

// ---------------------------------------------------------------- gravacao ---

async function gravarLocal(store, kind, docId, payload) {
  if (kind === "todo_lists") {
    await toDoListRepository.updateAsync(docId, payload);
    store.commit("loadTodoLists", { todoListId: docId, todoList: payload });
    return;
  }
  if (kind === "custom_lists") {
    customToDoListIdsRepository.update(payload);
    store.commit("loadCustomTodoListsIds", payload);
    return;
  }
  if (kind === "config") {
    const config = configRepository.load();
    Object.keys(payload).forEach((key) => {
      if (!CONFIG_SINCRONIZADA.includes(key)) return;
      config[key] = payload[key];
      store.commit("updateConfig", { key: key, val: payload[key] });
    });
    configRepository.update(config);
    return;
  }
  const db = await dbRepository.openAsync();
  await dbRepository.updateAsync(db, kind, docId, payload);
}

// ------------------------------------------------------------------- ciclo ---

async function cicloUnico(store) {
  const config = configRepository.load();
  const deviceId = config.deviceId;
  const meta = syncRepository.getMeta();

  const local = await lerLocal();
  const base = indexarBase(await syncRepository.getAll());
  const resposta = await syncApi.pull(config, meta.lastSyncRevision);
  const remoto = indexarRemoto(resposta.docs);

  const kinds = ["todo_lists", "repeating_events", "repeating_events_by_date", "custom_lists", "config"];
  const paraEnviar = [];
  let mudouLocalmente = false;

  for (const kind of kinds) {
    const docIds = new Set([
      ...Object.keys(local[kind] || {}),
      ...Object.keys(remoto[kind] || {}),
      ...Object.keys(base[kind] || {}),
    ]);

    for (const docId of docIds) {
      const entradaBase = (base[kind] || {})[docId] || null;
      const docRemoto = (remoto[kind] || {})[docId] || null;
      const payloadBase = entradaBase ? entradaBase.payload : null;
      const revisaoBase = entradaBase ? entradaBase.revision : 0;

      const temLocal = Object.prototype.hasOwnProperty.call(local[kind] || {}, docId);
      const payloadLocalCru = temLocal ? local[kind][docId] : null;
      const payloadLocal = carimbarTarefas(kind, payloadLocalCru, payloadBase, deviceId);

      // Documento apagado no servidor e nao alterado aqui: nada a fazer.
      if (docRemoto && docRemoto.deleted && !temLocal) continue;

      const payloadRemoto = docRemoto && !docRemoto.deleted ? docRemoto.payload : null;
      const revisaoRemota = docRemoto ? docRemoto.revision : revisaoBase;

      let fundido;
      if (payloadLocal && payloadRemoto) {
        fundido = mergeDocument(kind, payloadBase, payloadLocal, payloadRemoto);
      } else if (payloadLocal) {
        fundido = payloadLocal;
      } else if (payloadRemoto) {
        fundido = payloadRemoto;
      } else {
        continue;
      }

      if (!deepEqual(fundido, payloadLocalCru)) {
        await gravarLocal(store, kind, docId, fundido);
        mudouLocalmente = true;
      }

      const precisaEnviar = !docRemoto || !deepEqual(fundido, payloadRemoto);
      if (precisaEnviar) {
        paraEnviar.push({
          kind,
          docId,
          payload: fundido,
          baseRevision: revisaoRemota || 0,
          deleted: false,
        });
      } else {
        await syncRepository.set(kind, docId, fundido, revisaoRemota || revisaoBase, false);
      }
    }
  }

  let revisaoServidor = resposta.revision;
  let rejeitados = [];
  if (paraEnviar.length > 0) {
    const push = await syncApi.push(config, paraEnviar);
    revisaoServidor = push.revision || revisaoServidor;
    rejeitados = push.rejeitados || [];
    const rejeitadosSet = new Set(rejeitados.map((r) => `${r.kind}::${r.docId}`));
    for (const doc of paraEnviar) {
      const chave = `${doc.kind}::${doc.docId}`;
      if (rejeitadosSet.has(chave)) continue;
      const aceito = (push.aceitos || []).find((a) => `${a.kind}::${a.docId}` === chave);
      await syncRepository.set(doc.kind, doc.docId, doc.payload, aceito ? aceito.revision : revisaoServidor, false);
    }
  }

  syncRepository.setMeta({
    lastSyncRevision: revisaoServidor,
    lastSyncAt: moment().toISOString(),
  });
  store.commit("updateConfig", { key: "lastSyncRevision", val: revisaoServidor });
  store.commit("updateConfig", { key: "lastSyncAt", val: moment().toISOString() });

  return { rejeitados, mudouLocalmente };
}

export default {
  CONFIG_SINCRONIZADA,

  estaConfigurado,

  // Ponto unico chamado pela abertura do app e pelo botao "sincronizar agora".
  async sync(store) {
    const config = configRepository.load();
    if (!estaConfigurado(config)) {
      store.commit("setSyncStatus", "nao_configurado");
      return { ok: false, motivo: "nao_configurado" };
    }
    if (store.getters.syncStatus === "sincronizando") {
      return { ok: false, motivo: "em_andamento" };
    }

    store.commit("setSyncStatus", "sincronizando");
    let mudou = false;
    try {
      for (let tentativa = 0; tentativa < MAX_CICLOS; tentativa += 1) {
        const resultado = await cicloUnico(store);
        mudou = mudou || resultado.mudouLocalmente;
        if (resultado.rejeitados.length === 0) break;
      }
      if (mudou) store.commit("setSyncPendingReload", true);
      store.commit("setSyncStatus", "conectado");
      store.commit("setSyncLastAt", configRepository.load().lastSyncAt);
      return { ok: true, mudou };
    } catch (error) {
      store.commit("setSyncError", error.code || "erro_servidor");
      store.commit(
        "setSyncStatus",
        error.code === syncApi.SYNC_ERROR.CREDENTIAL ? "erro_credencial" : "offline"
      );
      return { ok: false, motivo: error.code || "erro_servidor" };
    }
  },
};
