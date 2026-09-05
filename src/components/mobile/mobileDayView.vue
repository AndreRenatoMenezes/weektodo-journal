<template>
  <div class="mobile-day-view mobile-ruled-paper" ref="dayView">
    <!-- Lista de tarefas -->
    <mobile-task-row
      v-for="(toDo, index) in tasks"
      :key="toDo.id || index"
      :toDo="toDo"
      :index="index"
      :toDoListId="listId"
      @open-detail="$emit('open-detail', $event)"
    ></mobile-task-row>

    <!-- Composer: input de nova tarefa, sempre logo depois das tarefas. Com o dia
         vazio ele fica na primeira linha da folha, e não no fim da página. -->
    <div class="mobile-day-composer">
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

    <!-- Estado vazio: ocupa o espaço restante abaixo do composer -->
    <div v-if="!loading && tasks.length === 0" class="mobile-day-empty">
      <i class="bi-plus-circle mobile-day-empty__glyph"></i>
      <p class="mobile-day-empty__title">{{ $t("mobile.emptyStateTitle") }}</p>
      <p class="mobile-day-empty__subtitle">{{ $t("mobile.emptyStateSubtitle") }}</p>
    </div>
  </div>
</template>

<script>
import mobileTaskRow from "./mobileTaskRow";
import todoActions from "../../helpers/todoActions";
import repeatingEventHelper from "../../helpers/repeatingEvents";
import moment from "moment";

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
        // Recorrência só existe no calendário; listas personalizadas não têm data
        if (!moment(listId, "YYYYMMDD", true).isValid()) {
          this.loading = false;
          return;
        }
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
      const input = this.$refs.composerInput;
      if (!input) return;
      // Foco síncrono, dentro do gesto de toque: adiar o focus() para o próximo
      // tick faz o navegador móvel descartar o gesto e não abrir o teclado.
      input.focus({ preventScroll: true });
      input.scrollIntoView({ block: "nearest" });
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
