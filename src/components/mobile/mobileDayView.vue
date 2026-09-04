<template>
  <div class="mobile-day-view mobile-ruled-paper" ref="dayView">
    <!-- Estado vazio: sem tarefas -->
    <div v-if="!loading && tasks.length === 0" class="mobile-day-empty">
      <i class="bi-plus-circle mobile-day-empty__glyph"></i>
      <p class="mobile-day-empty__title">{{ $t("mobile.emptyStateTitle") }}</p>
      <p class="mobile-day-empty__subtitle">{{ $t("mobile.emptyStateSubtitle") }}</p>
    </div>

    <!-- Lista de tarefas -->
    <template v-else>
      <mobile-task-row
        v-for="(toDo, index) in tasks"
        :key="toDo.id || index"
        :toDo="toDo"
        :index="index"
        :toDoListId="listId"
        @open-detail="$emit('open-detail', $event)"
      ></mobile-task-row>
    </template>

    <!-- Composer: input de nova tarefa (sempre visível no final da lista) -->
    <div class="mobile-day-composer" :class="{ 'mobile-day-composer--empty': tasks.length === 0 }">
      <input
        ref="composerInput"
        class="mobile-day-composer__input"
        type="text"
        v-model="newTaskText"
        :placeholder="$t('mobile.taskTitlePlaceholder')"
        @keyup.enter="createTask"
        @blur="createTask"
      />
    </div>
  </div>
</template>

<script>
import mobileTaskRow from "./mobileTaskRow";
import todoActions from "../../helpers/todoActions";
import repeatingEventHelper from "../../helpers/repeatingEvents";

export default {
  name: "MobileDayView",
  components: { mobileTaskRow },
  mixins: [todoActions],
  props: {
    listId: { type: String, required: true },
  },
  emits: ["open-detail"],
  data() {
    return {
      newTaskText: "",
      loading: false,
    };
  },
  computed: {
    tasks() {
      return this.$store.getters.todoLists[this.listId] || [];
    },
  },
  watch: {
    listId: {
      immediate: true,
      handler(newId) {
        this.loadDay(newId);
      },
    },
  },
  methods: {
    loadDay(listId) {
      // Inicializa slot vazio para evitar erro de `addTodo` antes de carregar
      if (!this.$store.getters.todoLists[listId]) {
        this.$store.commit("loadTodoLists", { todoListId: listId, todoList: [] });
      }
      this.loading = true;
      this.$store.dispatch("loadTodoLists", listId).then(() => {
        this.$store.dispatch("loadRepeatingEventGeneratedByDate", listId).then(() => {
          repeatingEventHelper.generateRepeatingEventsIntances(listId, this);
          this.loading = false;
        });
      });
    },
    createTask() {
      const text = this.newTaskText.trim();
      if (!text) return;
      this.actionCreateTodo(this.listId, text);
      this.newTaskText = "";
    },
    focusComposer() {
      this.$nextTick(() => {
        if (this.$refs.composerInput) {
          this.$refs.composerInput.focus();
        }
      });
    },
  },
};
</script>

<style scoped>
.mobile-day-view {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Estado vazio */
.mobile-day-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 24px 0;
  text-align: center;
  gap: 8px;
}

.mobile-day-empty__glyph {
  font-size: 3rem;
  /* Gradiente preenchendo o glifo via background-clip */
  background: var(--wtd-brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-day-empty__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
  margin: 0;
}

.mobile-day-empty__subtitle {
  font-size: 0.875rem;
  color: var(--wtd-text-subtle);
  margin: 0;
}

/* Composer */
.mobile-day-composer {
  min-height: 52px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.mobile-day-composer--empty {
  /* Quando a lista está vazia, o composer fica logo após o estado vazio */
  margin-top: 16px;
}

.mobile-day-composer__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
  min-height: 44px;
}

.mobile-day-composer__input::placeholder {
  color: var(--wtd-text-subtle);
}
</style>
