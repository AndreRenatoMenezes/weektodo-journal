// layout.store.js — estado de layout em memória (não persiste no localStorage)
// Decisões de tamanho de janela não são preferências do usuário; não exigem migração.

import moment from "moment";

export default {
  namespaced: false,

  state: {
    isMobile: false,
    // Data selecionada na faixa de dias (YYYYMMDD). Inicia com o dia de hoje.
    mobileSelectedDate: moment().format("YYYYMMDD"),
  },

  getters: {
    isMobile: (state) => state.isMobile,
    mobileSelectedDate: (state) => state.mobileSelectedDate,
  },

  mutations: {
    setIsMobile(state, value) {
      state.isMobile = !!value;
    },
    setMobileSelectedDate(state, date) {
      state.mobileSelectedDate = date;
    },
  },
};
