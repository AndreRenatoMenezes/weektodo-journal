<template>
  <div class="mobile-app-shell">
    <!-- Barra superior -->
    <header class="mobile-top-bar">
      <button
        v-if="openListId"
        class="mobile-top-bar__back mobile-touch-target"
        :aria-label="$t('mobile.back')"
        @click="closeList"
      >
        <i class="bi-chevron-left"></i>
      </button>
      <span class="mobile-top-bar__title">{{ topBarTitle }}</span>
      <button
        v-if="activeTab === 'lists' && !openListId"
        class="mobile-top-bar__action mobile-touch-target"
        :aria-label="$t('mobile.newList')"
        @click="createList"
      >
        <i class="bi-plus-lg"></i>
      </button>
      <span v-else class="mobile-top-bar__date">{{ todayLabel }}</span>
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

      <!-- Aba Listas: relação de listas ou uma lista aberta -->
      <template v-else-if="activeTab === 'lists'">
        <mobile-lists-view
          v-if="!openListId"
          ref="listsView"
          @open-list="onOpenList"
        ></mobile-lists-view>
        <template v-else>
          <mobile-day-view
            ref="listView"
            :listId="openListId"
            @open-detail="onOpenDetail"
          ></mobile-day-view>
          <mobile-fab @click="focusListComposer"></mobile-fab>
        </template>
      </template>

      <!-- Aba Diário -->
      <mobile-journal-view v-else-if="activeTab === 'journal'"></mobile-journal-view>

      <!-- Aba Configurações -->
      <mobile-settings-view v-else-if="activeTab === 'settings'"></mobile-settings-view>
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

    <!-- Folha do detalhe da tarefa -->
    <mobile-task-sheet
      v-if="detailTask"
      :selectedTodo="detailTask"
      @close="closeDetail"
      @removed="onTaskRemoved"
    ></mobile-task-sheet>

    <!-- Aviso de tarefa removida com desfazer (vive fora da folha, que fecha ao apagar) -->
    <div class="mobile-toast-host">
      <toast-message
        ref="taskRemovedToast"
        id="mobileTaskRemoved"
        :text="$t('todoDetails.taskRemoved')"
        :sub-text="'(' + $t('ui.undo') + ')'"
        @subTextClick="undoRemoveTask"
      ></toast-message>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { Toast } from "bootstrap";
import mobileJournalView from "./mobileJournalView";
import weekDayStrip from "./weekDayStrip";
import mobileDayView from "./mobileDayView";
import mobileFab from "./mobileFab";
import mobileTaskSheet from "./mobileTaskSheet";
import mobileListsView from "./mobileListsView";
import mobileSettingsView from "./mobileSettingsView";
import toastMessage from "../toastMessage";
import todoActions from "../../helpers/todoActions";

export default {
  name: "MobileApp",
  mixins: [todoActions],
  components: {
    mobileJournalView,
    weekDayStrip,
    mobileDayView,
    mobileFab,
    mobileTaskSheet,
    mobileListsView,
    mobileSettingsView,
    toastMessage,
  },
  data() {
    return {
      activeTab: "week",
      detailTask: null,
      openListId: null,
      tabs: [
        { id: "week",     icon: "bi-calendar3",   labelKey: "mobile.weekTab"     },
        { id: "lists",    icon: "bi-list-task",    labelKey: "mobile.listsTab"    },
        { id: "journal",  icon: "bi-journal-text", labelKey: "mobile.journalTab"  },
        { id: "settings", icon: "bi-gear",         labelKey: "mobile.settingsTab" },
      ],
    };
  },
  watch: {
    activeTab(newTab) {
      if (newTab !== "lists") this.openListId = null;
    },
  },
  computed: {
    mobileSelectedDate() {
      return this.$store.getters.mobileSelectedDate;
    },
    topBarTitle() {
      if (this.openListId) {
        const list = this.$store.getters.cTodoListIds.find((x) => x.listId === this.openListId);
        return (list && list.listName) || this.$t("mobile.newList");
      }
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
    onOpenList(listId) {
      this.openListId = listId;
    },
    closeList() {
      this.openListId = null;
    },
    createList() {
      if (this.$refs.listsView) {
        this.$refs.listsView.createList();
      }
    },
    focusListComposer() {
      if (this.$refs.listView && typeof this.$refs.listView.focusComposer === "function") {
        this.$refs.listView.focusComposer();
      }
    },
    onOpenDetail(payload) {
      this.detailTask = payload;
    },
    closeDetail() {
      this.detailTask = null;
    },
    onTaskRemoved() {
      this.closeDetail();
      if (this.$refs.taskRemovedToast) {
        this.$refs.taskRemovedToast.show();
      }
    },
    undoRemoveTask() {
      const undo = this.$store.getters.undoElement;
      if (!undo || !undo.todo) return;
      this.$store.commit("insertTodo", {
        toDoListId: undo.todo.listId,
        index: undo.index,
        toDo: undo.todo,
      });
      this.actionPersistTodoList(undo.todo.listId);
      const toastEl = document.getElementById("mobileTaskRemoved");
      if (toastEl) {
        Toast.getInstance(toastEl) ? Toast.getInstance(toastEl).hide() : new Toast(toastEl).hide();
      }
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

.mobile-top-bar__back,
.mobile-top-bar__action {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--wtd-text-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin: 0 -12px;
}

.mobile-top-bar__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Host do aviso de remoção */
.mobile-toast-host {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 76px;
  z-index: 1060;
  pointer-events: none;
}

.mobile-toast-host :deep(.toast) {
  pointer-events: auto;
  width: 100%;
}
</style>
