import dbRepository from "./dbRepository";
import configRepository from "./configRepository";

// Snapshot da ultima versao sincronizada de cada documento. E o "base" da fusao
// de tres vias: base x local x remoto. Chave composta porque uma lista
// personalizada pode se chamar 20260902 e colidir com um dia do calendario.
function key(kind, docId) {
  return `${kind}::${docId}`;
}

export default {
  key,

  async get(kind, docId) {
    const db = await dbRepository.openAsync();
    const entry = await dbRepository.getAsync(db, "sync_base", key(kind, docId));
    return entry || null;
  },

  // Devolve { "kind::docId": { kind, docId, payload, revision, deleted } }.
  async getAll() {
    const db = await dbRepository.openAsync();
    return dbRepository.selectAllAsync(db, "sync_base");
  },

  async set(kind, docId, payload, revision, deleted = false) {
    const db = await dbRepository.openAsync();
    return dbRepository.updateAsync(db, "sync_base", key(kind, docId), {
      kind,
      docId,
      payload,
      revision,
      deleted,
    });
  },

  async remove(kind, docId) {
    const db = await dbRepository.openAsync();
    return dbRepository.deleteAsync(db, "sync_base", key(kind, docId));
  },

  // Metadados do ciclo vivem no config, junto das credenciais, e nunca sao
  // sincronizados.
  getMeta() {
    const config = configRepository.load();
    return {
      lastSyncRevision: config.lastSyncRevision || 0,
      lastSyncAt: config.lastSyncAt || null,
    };
  },

  setMeta({ lastSyncRevision, lastSyncAt }) {
    const config = configRepository.load();
    if (lastSyncRevision !== undefined) config.lastSyncRevision = lastSyncRevision;
    if (lastSyncAt !== undefined) config.lastSyncAt = lastSyncAt;
    configRepository.update(config);
    return config;
  },
};
