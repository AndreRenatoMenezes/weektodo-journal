<template>
  <div class="mobile-app-shell">
    <!-- Barra superior -->
    <header class="mobile-top-bar">
      <span class="mobile-top-bar__title">{{ topBarTitle }}</span>
      <span class="mobile-top-bar__date">{{ todayLabel }}</span>
    </header>

    <!-- Conteúdo da aba ativa -->
    <main class="mobile-main-content">
      <!-- Aba Semana -->
      <template v-if="activeTab === 'week'">
        <week-day-strip></week-day-strip>
        <mobile-day-view
          ref="dayView"
          :listId="mobileSelectedDate"
          @open-detail="onOpenDetail"
        ></mobile-day-view>
        <mobile-fab @click="focusDayComposer"></mobile-fab>
      </template>

      <!-- Aba Listas: placeholder até WP07 -->
      <div v-else-if="activeTab === 'lists'" class="mobile-placeholder-tab">
        <i class="bi-list-task mobile-placeholder-icon"></i>
        <p class="mobile-placeholder-text">{{ $t("mobile.listsTab") }}</p>
      </div>

      <!-- Aba Diário -->
      <mobile-journal-view v-else-if="activeTab === 'journal'"></mobile-journal-view>

      <!-- Aba Configurações: placeholder até WP08 -->
      <div v-else-if="activeTab === 'settings'" class="mobile-placeholder-tab">
        <i class="bi-gear mobile-placeholder-icon"></i>
        <p class="mobile-placeholder-text">{{ $t("mobile.settingsTab") }}</p>
      </div>
    </main>

    <!-- Barra de abas inferior -->
    <nav class="mobile-tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="mobile-tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        <span>{{ $t(tab.labelKey) }}</span>
      </button>
    </nav>

    <!-- Casca da folha de detalhe: WP06 substitui o corpo pelo detalhe completo -->
    <div v-if="detailTask" class="mobile-detail-backdrop" @click="closeDetail">
      <div class="mobile-detail-sheet" @click.stop>
        <header class="mobile-detail-sheet__header">
          <span class="mobile-detail-sheet__title">{{ detailTask.toDo.text }}</span>
          <button
            class="mobile-detail-sheet__close"
            :aria-label="$t('todoDetails.close')"
            @click="closeDetail"
          >
            <i class="bi-x-lg"></i>
          </button>
        </header>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import mobileJournalView from "./mobileJournalView";
import weekDayStrip from "./weekDayStrip";
import mobileDayView from "./mobileDayView";
import mobileFab from "./mobileFab";

export default {
  name: "MobileApp",
  components: {
    mobileJournalView,
    weekDayStrip,
    mobileDayView,
    mobileFab,
  },
  data() {
    return {
      activeTab: "week",
      detailTask: null,
      tabs: [
        { id: "week",     icon: "bi-calendar3",   labelKey: "mobile.weekTab"     },
        { id: "lists",    icon: "bi-list-task",    labelKey: "mobile.listsTab"    },
        { id: "journal",  icon: "bi-journal-text", labelKey: "mobile.journalTab"  },
        { id: "settings", icon: "bi-gear",         labelKey: "mobile.settingsTab" },
      ],
    };
  },
  computed: {
    mobileSelectedDate() {
      return this.$store.getters.mobileSelectedDate;
    },
    topBarTitle() {
      const tabMap = {
        week:     "mobile.weekTab",
        lists:    "mobile.listsTab",
        journal:  "mobile.journalTab",
        settings: "mobile.settingsTab",
      };
      return this.$t(tabMap[this.activeTab]);
    },
    currentLocale() {
      const lang = (this.$store.getters.config && this.$store.getters.config.language) || this.$i18n.locale || "en";
      return lang === "zh_cn" ? "zh-cn" : lang === "zh_tw" ? "zh-tw" : lang;
    },
    todayLabel() {
      return moment().locale(this.currentLocale).format("ddd, D MMM");
    },
  },
  methods: {
    focusDayComposer() {
      if (this.$refs.dayView && typeof this.$refs.dayView.focusComposer === "function") {
        this.$refs.dayView.focusComposer();
      }
    },
    onOpenDetail(payload) {
      // WP06 implementará a folha do detalhe completa. Por ora, guarda a tarefa
      // selecionada e abre a casca da folha, para o toque no texto ter resposta.
      this.detailTask = payload;
    },
    closeDetail() {
      this.detailTask = null;
    },
  },
};
</script>

<style scoped>
/* Barra superior */
.mobile-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  min-height: 52px;
  padding: 0 16px;
  background-color: var(--wtd-surface);
  border-bottom: 1px solid var(--wtd-line);
  box-sizing: border-box;
  flex-shrink: 0;
}

.mobile-top-bar__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
}

.mobile-top-bar__date {
  font-size: 0.8rem;
  color: var(--wtd-text-subtle);
}

/* Conteúdo principal */
.mobile-main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--wtd-paper-bg);
  position: relative;
}

/* Placeholders de abas ainda não implementadas */
.mobile-placeholder-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
}

.mobile-placeholder-icon {
  font-size: 3rem;
  color: var(--wtd-text-subtle);
}

.mobile-placeholder-text {
  font-size: 1rem;
  color: var(--wtd-text-subtle);
  margin: 0;
}

/* Casca da folha de detalhe (WP06 completa o corpo) */
.mobile-detail-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 1050;
}

.mobile-detail-sheet {
  width: 100%;
  background-color: var(--wtd-surface);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 12px 16px;
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
}

.mobile-detail-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
}

.mobile-detail-sheet__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
}

.mobile-detail-sheet__close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--wtd-text-subtle);
  min-width: 44px;
  min-height: 44px;
}
</style>
