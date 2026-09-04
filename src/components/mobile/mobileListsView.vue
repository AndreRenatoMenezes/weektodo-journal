<template>
  <div class="mobile-lists-view">
    <!-- Sem listas personalizadas ainda -->
    <div v-if="lists.length === 0" class="mobile-lists-empty">
      <i class="bi-list-task mobile-lists-empty__glyph"></i>
      <p class="mobile-lists-empty__title">{{ $t("mobile.emptyStateTitle") }}</p>
      <p class="mobile-lists-empty__subtitle">{{ $t("mobile.newList") }}</p>
    </div>

    <!-- Relação de listas, na mesma ordem do desktop -->
    <ul v-else class="mobile-lists">
      <li
        v-for="(list, index) in lists"
        :key="list.listId"
        class="mobile-list-row mobile-row-52"
        @click="openList(list.listId)"
      >
        <span class="mobile-list-row__dot" :style="{ backgroundColor: listColor(list.listId) }"></span>

        <input
          v-if="editingIndex === index"
          :ref="'listNameInput' + index"
          class="mobile-list-row__name-input"
          type="text"
          v-model="editingName"
          :placeholder="$t('mobile.newList')"
          @click.stop
          @blur="doneEditName(index)"
          @keyup.enter="doneEditName(index)"
        />
        <template v-else>
          <span class="mobile-list-row__name">{{ list.listName || $t("mobile.newList") }}</span>
          <span class="mobile-list-row__count">{{ countLabel(list.listId) }}</span>
          <button
            class="mobile-list-row__rename mobile-touch-target"
            :aria-label="list.listName || $t('mobile.newList')"
            @click.stop="editName(index)"
          >
            <i class="bi-pencil"></i>
          </button>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
import customToDoListIdsRepository from "../../repositories/customToDoListIdsRepository";
import toDoListRepository from "../../repositories/toDoListRepository";
import moment from "moment";

export default {
  name: "MobileListsView",
  emits: ["open-list"],
  data() {
    return {
      editingIndex: null,
      editingName: "",
    };
  },
  computed: {
    lists() {
      return this.$store.getters.cTodoListIds;
    },
  },
  created() {
    this.loadLists();
  },
  watch: {
    lists: {
      handler() {
        this.loadLists();
      },
      deep: true,
    },
  },
  methods: {
    loadLists() {
      // Carrega o conteúdo de cada lista para os contadores ficarem certos
      this.lists.forEach((list) => {
        if (!this.$store.getters.todoLists[list.listId]) {
          this.$store.dispatch("loadTodoLists", list.listId);
        }
      });
    },
    tasksOf(listId) {
      return this.$store.getters.todoLists[listId] || [];
    },
    countLabel(listId) {
      const tasks = this.tasksOf(listId);
      const done = tasks.filter((task) => task.checked).length;
      return this.$t("mobile.tasksDone", { done: done, total: tasks.length });
    },
    listColor(listId) {
      // A lista não guarda cor própria; usa a primeira cor presente nas tarefas
      const colored = this.tasksOf(listId).find((task) => task.color && task.color !== "none");
      return colored ? colored.color : "var(--wtd-text-subtle)";
    },
    openList(listId) {
      if (this.editingIndex !== null) return;
      this.$emit("open-list", listId);
    },
    /**
     * Cria a lista com o mesmo formato de id do desktop (sideBar.vue) e já
     * abre o campo de nome, que no celular não tem duplo clique.
     */
    createList() {
      const newList = { listId: moment().format("YYYYMMDDTHHmmssS"), listName: "" };
      this.$store.commit("actionsCListCreatedUpdate", true);
      this.$store.commit("newCustomTodoList", newList);
      customToDoListIdsRepository.update(this.$store.getters.cTodoListIds);
      toDoListRepository.update(newList.listId, this.$store.getters.todoLists[newList.listId]);
      this.editName(this.lists.length - 1);
    },
    editName(index) {
      this.editingIndex = index;
      this.editingName = this.lists[index].listName || "";
      this.$nextTick(() => {
        const input = this.$refs["listNameInput" + index];
        const el = Array.isArray(input) ? input[0] : input;
        if (el) {
          el.focus();
          el.select();
        }
      });
    },
    doneEditName(index) {
      if (this.editingIndex === null) return;
      this.editingIndex = null;
      this.$store.commit("updateCustomTodoList", { index: index, name: this.editingName });
      customToDoListIdsRepository.update(this.$store.getters.cTodoListIds);
    },
  },
};
</script>

<style scoped>
.mobile-lists-view {
  flex: 1;
  overflow-y: auto;
}

/* Estado vazio */
.mobile-lists-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 8px;
}

.mobile-lists-empty__glyph {
  font-size: 3rem;
  background: var(--wtd-brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-lists-empty__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
  margin: 0;
}

.mobile-lists-empty__subtitle {
  font-size: 0.875rem;
  color: var(--wtd-text-subtle);
  margin: 0;
}

/* Relação de listas */
.mobile-lists {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--wtd-line);
  cursor: pointer;
}

.mobile-list-row__dot {
  width: 10px;
  height: 10px;
  min-width: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mobile-list-row__name {
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-list-row__count {
  font-size: 0.8rem;
  color: var(--wtd-text-subtle);
  white-space: nowrap;
}

.mobile-list-row__name-input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
}

.mobile-list-row__rename {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--wtd-text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
