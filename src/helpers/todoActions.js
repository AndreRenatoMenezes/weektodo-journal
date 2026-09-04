import toDoListRepository from "../repositories/toDoListRepository";
import notifications from "./notifications";
import tasksHelper from "./tasksHelper";
import { newTaskId } from "../migrations/dataMigrations";
import { Toast } from "bootstrap";

export default {
  methods: {
    /**
     * Criar uma nova tarefa em uma lista.
     * Sem .trim() no texto para preservar o comportamento original do desktop.
     * Realiza commit na store Vuex e atualiza IndexedDB via repository.
     */
    actionCreateTodo(listId, text) {
      if (!text || text === "") return null;

      const newTodo = {
        id: newTaskId(),
        text: text,
        checked: false,
        listId: listId,
        desc: "",
        subTaskList: [],
        color: "none",
        priority: 0,
        tags: [],
        time: null,
        alarm: false,
        repeatingEvent: null,
      };

      this.$store.commit("addTodo", newTodo);
      this.actionPersistTodoList(listId);
      return newTodo;
    },

    /**
     * Concluir / desmarcar uma tarefa, aplicando regras de ordenação e mover para o fim.
     * Se alreadyToggled for true, assume que o commit("checkTodo") já foi realizado pelo chamador.
     */
    actionToggleTodo(toDoListId, index, alreadyToggled = false) {
      if (!alreadyToggled) {
        this.$store.commit("checkTodo", { toDoListId, index });
      }

      const list = this.$store.getters.todoLists[toDoListId];
      if (list && list[index]) {
        if (list[index].checked && this.$store.getters.config.moveCompletedTaskToBottom) {
          if (this.$refs && this.$refs.currentTodo) {
            this.$refs.currentTodo.style.display = "none";
          }
          this.$store.commit("moveTodoToEnd", { toDoListId, index });
        }
      }

      if (this.$store.getters.config.autoReorderTasks) {
        if (this.$refs && this.$refs.currentTodo) {
          this.$refs.currentTodo.style.display = "none";
        }
        const reordered = tasksHelper.reorderTasksList(this.$store.getters.todoLists[toDoListId]);
        this.actionPersistTodoList(toDoListId, reordered);
      } else {
        this.actionPersistTodoList(toDoListId);
      }
    },

    /**
     * Remover tarefa com suporte a desfazer (Toast + setUndoElement).
     */
    actionRemoveTodo(toDoListId, index, toDo) {
      const targetTodo = toDo || (this.$store.getters.todoLists[toDoListId] && this.$store.getters.todoLists[toDoListId][index]);
      if (!targetTodo) return;

      this.$store.commit("setUndoElement", { type: "task", todo: targetTodo, index });
      this.$store.commit("removeTodo", { toDoListId, index });
      this.actionPersistTodoList(toDoListId);

      const toastEl = document.getElementById("taskRemoved");
      if (toastEl) {
        const toast = new Toast(toastEl);
        toast.show();
      }

      if (typeof this.hideToDoItem === "function") {
        this.hideToDoItem();
      }
    },

    /**
     * Persistir lista no IndexedDB e atualizar notificações do dia.
     */
    actionPersistTodoList(toDoListId, listData) {
      const listToSave = listData || this.$store.getters.todoLists[toDoListId];
      notifications.refreshDayNotifications(this, toDoListId);
      toDoListRepository.update(toDoListId, listToSave);
    },
  },
};
