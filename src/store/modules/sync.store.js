// Estado da sincronizacao. Nao guarda credencial: url, usuario e token vivem no
// config, e a senha nao e guardada em lugar nenhum.
const state = {
  syncStatus: "nao_configurado", // nao_configurado | conectado | sincronizando | offline | erro_credencial
  syncLastAt: null,
  syncError: null,
  syncPendingReload: false,
};

const getters = {
  syncStatus(state) {
    return state.syncStatus;
  },
  syncLastAt(state) {
    return state.syncLastAt;
  },
  syncError(state) {
    return state.syncError;
  },
  syncPendingReload(state) {
    return state.syncPendingReload;
  },
};

const mutations = {
  setSyncStatus(state, status) {
    state.syncStatus = status;
    if (status !== "erro_credencial" && status !== "offline") state.syncError = null;
  },
  setSyncLastAt(state, value) {
    state.syncLastAt = value;
  },
  setSyncError(state, error) {
    state.syncError = error;
  },
  // Marcado quando a fusao trouxe mudanca: a tela precisa recarregar as listas.
  setSyncPendingReload(state, value) {
    state.syncPendingReload = value;
  },
};

const actions = {};

export default {
  namespaced: false,
  state,
  getters,
  actions,
  mutations,
};
