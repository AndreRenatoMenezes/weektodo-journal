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
        methods: {
          focusDayComposer() {
            if (this.$refs.dayView && typeof this.$refs.dayView.focusComposer === "function") {
              this.$refs.dayView.focusComposer();
            }
          },
          onOpenDetail(payload) {
            // WP06 implementará a folha do detalhe. Por ora emite evento para extensão futura.
            // eslint-disable-next-line no-unused-vars
            const { toDo, index, toDoListId } = payload;
          },
        },
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
</style>
