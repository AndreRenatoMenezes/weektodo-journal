// layout.store.js — estado de layout em memória (não persiste no localStorage)
// Decisões de tamanho de janela não são preferências do usuário; não exigem migração.

export default {
  namespaced: false,

  state: {
    isMobile: false,
  },

  getters: {
    isMobile: (state) => state.isMobile,
  },

  mutations: {
    setIsMobile(state, value) {
      state.isMobile = !!value;
    },
  },
};
