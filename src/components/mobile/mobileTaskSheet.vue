<template>
  <div class="mobile-sheet-backdrop" @click="close">
    <div
      class="mobile-sheet"
      :class="{ 'mobile-sheet--dragging': dragging }"
      :style="sheetStyle"
      @click.stop
    >
      <!-- Alça: também é a área de arrasto para fechar -->
      <div
        class="mobile-sheet__grip"
        @touchstart="onDragStart"
        @touchmove="onDragMove"
        @touchend="onDragEnd"
        @touchcancel="onDragEnd"
      >
        <div class="mobile-sheet__handle"></div>
      </div>

      <!-- Cabeçalho: concluir, título e fechar -->
      <header class="mobile-sheet__header">
        <button
          class="mobile-sheet__check mobile-touch-target"
          :class="{ 'mobile-sheet__check--done': todo.checked }"
          :aria-label="$t('todoDetails.done')"
          @click="toggleChecked"
        >
          <i v-if="todo.checked" class="bi-check2"></i>
        </button>
        <input
          class="mobile-sheet__title"
          :class="{ 'mobile-sheet__title--done': todo.checked }"
          type="text"
          v-model="todo.text"
          :placeholder="$t('todoDetails.taskTitle')"
          @blur="updateTodo()"
          @keyup.enter="blurTitle"
        />
        <button
          class="mobile-sheet__close mobile-touch-target"
          :aria-label="$t('todoDetails.close')"
          @click="close"
        >
          <i class="bi-x-lg"></i>
        </button>
      </header>

      <!-- Ações reaproveitadas do detalhe do desktop -->
      <div class="mobile-sheet__actions">
        <time-picker :time="bound.time" @time-selected="changeTime"></time-picker>
        <i
          class="mobile-sheet__action-icon"
          :class="{ 'bi-bell': !todo.alarm, 'bi-bell-fill': todo.alarm }"
          :title="$t('todoDetails.alarm')"
          @click="changeAlarm"
        ></i>
        <repeating-event
          v-if="isCalendarList"
          :repeatingEvent="bound.repeatingEvent"
          :todo="todo"
          @repeatingEventSelected="changeRepeatingEvent"
        ></repeating-event>
        <color-picker :color="bound.color" @color-selected="changeColor"></color-picker>
        <i
          class="bi-trash mobile-sheet__action-icon mobile-sheet__action-icon--danger"
          :title="$t('ui.remove')"
          @click="removeTodo"
        ></i>
      </div>

      <!-- Notas: um toque abre o editor (o desktop usa duplo clique) -->
      <div class="mobile-sheet__notes" @click="editDescription">
        <description-text-area
          ref="description"
          :todoDesc="bound.desc"
          @updated-description="changeDescription"
        ></description-text-area>
      </div>

      <!-- Subtarefas -->
      <ul class="mobile-sheet__subtasks">
        <li
          v-for="(subTask, i) in todo.subTaskList"
          :key="i"
          class="mobile-sheet__subtask mobile-touch-target"
        >
          <input
            class="form-check-input mobile-sheet__subtask-check"
            type="checkbox"
            v-model="subTask.checked"
            @change="changeSubTask(i)"
          />
          <input
            class="mobile-sheet__subtask-text"
            :class="{ 'mobile-sheet__subtask-text--done': subTask.checked }"
            type="text"
            v-model="subTask.text"
            @blur="updateTodo()"
            @keyup.enter="updateTodo()"
          />
          <button
            class="mobile-sheet__subtask-remove mobile-touch-target"
            :aria-label="$t('ui.remove')"
            @click="removeSubTask(i)"
          >
            <i class="bi-trash"></i>
          </button>
        </li>
        <li class="mobile-sheet__subtask mobile-touch-target">
          <i class="bi-plus-square mobile-sheet__subtask-check"></i>
          <input
            class="mobile-sheet__subtask-text"
            type="text"
            autocomplete="off"
            v-model="newSubTaskText"
            :placeholder="$t('todoDetails.addSubTask')"
            @blur="addSubTask"
            @keyup.enter="addSubTask"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { Dropdown } from "bootstrap";
import colorPicker from "../../views/toDoModal/colorPicker";
import timePicker from "../../views/toDoModal/timePicker";
import repeatingEvent from "../../views/toDoModal/repeatingEvent";
import descriptionTextArea from "../../views/toDoModal/descriptionTextArea.vue";
import todoActions from "../../helpers/todoActions";
import tasksHelper from "../../helpers/tasksHelper";
import { ensureTaskId } from "../../migrations/dataMigrations";

// Distância mínima do arrasto vertical para fechar a folha
const DRAG_CLOSE_THRESHOLD = 90;

export default {
  name: "MobileTaskSheet",
  mixins: [todoActions],
  components: { colorPicker, timePicker, repeatingEvent, descriptionTextArea },
  emits: ["close", "removed"],
  props: {
    // { toDo, index, toDoListId } emitido por mobileTaskRow
    selectedTodo: { type: Object, required: true },
  },
  data() {
    return {
      todo: { text: "", checked: false, desc: "", subTaskList: [], color: "none", time: null, alarm: false, repeatingEvent: null },
      todoList: [],
      index: 0,
      listId: "",
      // Os componentes do desktop carregam o valor inicial pelo watch da prop;
      // por isso os valores só são ligados depois da montagem.
      // color começa em null (e não "none") para o watch do colorPicker disparar
      bound: { desc: "", time: null, color: null, repeatingEvent: null },
      newSubTaskText: "",
      dragging: false,
      dragStartY: 0,
      dragOffset: 0,
    };
  },
  computed: {
    isCalendarList() {
      return moment(this.listId, "YYYYMMDD", true).isValid();
    },
    sheetStyle() {
      return this.dragOffset > 0 ? { transform: `translateY(${this.dragOffset}px)` } : {};
    },
  },
  created() {
    this.loadTodo();
  },
  mounted() {
    this.$nextTick(this.bindChildValues);
  },
  methods: {
    loadTodo() {
      this.listId = this.selectedTodo.toDoListId;
      this.index = this.selectedTodo.index;
      this.todoList = this.$store.getters.todoLists[this.listId] || [];
      const target = this.todoList[this.index];
      if (!target) return;

      this.todo = ensureTaskId(target);
      // Tarefas antigas não têm os campos do detalhe
      if (this.todo.desc === undefined) {
        this.todo.desc = "";
        this.todo.subTaskList = [];
        this.todo.color = "none";
        this.todo.priority = 0;
        this.todo.tags = [];
        this.todo.time = null;
        this.todo.alarm = false;
        this.todo.repeatingEvent = null;
      }
    },
    bindChildValues() {
      this.bound.desc = this.todo.desc || "";
      this.bound.time = this.todo.time || null;
      this.bound.color = this.todo.color || "none";
      this.bound.repeatingEvent = this.todo.repeatingEvent || null;
    },
    close() {
      this.emitCloseAfterPendingBlur();
    },
    emitCloseAfterPendingBlur() {
      // Deixa o blur de título/subtarefa gravar antes de desmontar a folha
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
      this.$nextTick(() => this.$emit("close"));
    },
    /**
     * Grava a lista inteira (a tarefa é o próprio objeto da store).
     * Igual ao desktop: qualquer edição solta a tarefa da série recorrente,
     * exceto quando a própria recorrência está sendo definida.
     */
    updateTodo(resetRepeatingEvent = true) {
      if (resetRepeatingEvent) {
        this.todo.repeatingEvent = null;
        this.bound.repeatingEvent = null;
      }
      this.actionPersistTodoList(this.listId, this.todoList);
    },
    toggleChecked() {
      this.todo.checked = !this.todo.checked;
      if (this.todo.checked && this.$store.getters.config.moveCompletedTaskToBottom) {
        this.$store.commit("moveTodoToEnd", { toDoListId: this.listId, index: this.index });
        this.index = this.todoList.length - 1;
      }
      if (this.$store.getters.config.autoReorderTasks) {
        this.actionPersistTodoList(this.listId, tasksHelper.reorderTasksList(this.todoList));
      } else {
        this.actionPersistTodoList(this.listId, this.todoList);
      }
    },
    blurTitle(event) {
      event.target.blur();
    },
    changeColor(color) {
      this.todo.color = color;
      this.bound.color = color;
      this.updateTodo();
      // O dropdown do desktop fica aberto até um clique fora; no celular ele
      // cobre a folha, então fecha assim que a cor é escolhida.
      this.hideDropdown("#btnTaskColorPicker");
    },
    hideDropdown(toggleSelector) {
      const toggle = this.$el.querySelector(toggleSelector);
      if (!toggle) return;
      Dropdown.getOrCreateInstance(toggle).hide();
    },
    changeTime(time) {
      this.todo.time = time;
      this.bound.time = time;
      if (!time) this.todo.alarm = false;
      this.updateTodo();
    },
    changeAlarm() {
      if (!this.todo.time) return;
      const enabling = !this.todo.alarm;
      this.todo.alarm = enabling;
      // Persistir reagenda as notificações do dia (helpers/notifications.js).
      this.updateTodo();
      if (enabling) this.requestNotificationPermission();
    },
    /**
     * O pedido feito no boot (App.vue) é ignorado pelos navegadores móveis por
     * não vir de um gesto do usuário: sem permissão o alarme agenda mas nunca
     * aparece. Aqui o pedido acontece dentro do toque no sino.
     */
    requestNotificationPermission() {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "default") return;
      const request = Notification.requestPermission();
      if (request && typeof request.catch === "function") request.catch(() => {});
    },
    changeDescription(desc) {
      this.todo.desc = desc;
      this.bound.desc = desc;
      this.updateTodo();
    },
    changeRepeatingEvent(repeatingEventId) {
      this.todo.repeatingEvent = repeatingEventId;
      this.bound.repeatingEvent = repeatingEventId;
      this.updateTodo(false);
    },
    editDescription() {
      if (this.$refs.description) this.$refs.description.editDescription();
    },
    addSubTask() {
      const text = this.newSubTaskText;
      if (text === "") return;
      this.todo.subTaskList.push({ text: text, checked: false, editing: false });
      this.newSubTaskText = "";
      this.updateTodo();
    },
    removeSubTask(index) {
      this.todo.subTaskList.splice(index, 1);
      this.updateTodo();
    },
    changeSubTask(index) {
      if (this.todo.subTaskList[index].checked && this.$store.getters.config.moveSubtaskToBotttom) {
        this.todo.subTaskList.push(this.todo.subTaskList.splice(index, 1)[0]);
      }
      this.updateTodo();
    },
    removeTodo() {
      // A remoção com desfazer vive no mixin; o aviso fica no shell, que
      // continua montado depois de a folha fechar.
      this.actionRemoveTodo(this.listId, this.index, this.todo);
      this.$emit("removed");
    },
    onDragStart(event) {
      this.dragging = true;
      this.dragStartY = event.touches[0].clientY;
      this.dragOffset = 0;
    },
    onDragMove(event) {
      if (!this.dragging) return;
      const delta = event.touches[0].clientY - this.dragStartY;
      this.dragOffset = delta > 0 ? delta : 0;
    },
    onDragEnd() {
      if (!this.dragging) return;
      const shouldClose = this.dragOffset > DRAG_CLOSE_THRESHOLD;
      this.dragging = false;
      this.dragOffset = 0;
      if (shouldClose) this.close();
    },
  },
};
</script>

<style scoped>
.mobile-sheet-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--wtd-backdrop);
  backdrop-filter: var(--wtd-backdrop-blur);
  -webkit-backdrop-filter: var(--wtd-backdrop-blur);
  display: flex;
  align-items: flex-end;
  z-index: 1050;
}

.mobile-sheet {
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 16px 24px;
  background-color: var(--wtd-surface);
  border-top-left-radius: var(--wtd-radius-modal);
  border-top-right-radius: var(--wtd-radius-modal);
  box-shadow: var(--wtd-shadow-modal);
  animation: mobile-sheet-up 180ms ease-out;
  transition: transform 180ms ease-out;
}

.mobile-sheet--dragging {
  transition: none;
}

@keyframes mobile-sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Alça */
.mobile-sheet__grip {
  padding: 8px 0 12px;
  cursor: grab;
  touch-action: none;
}

.mobile-sheet__handle {
  width: 38px;
  height: 4px;
  border-radius: var(--wtd-radius-pill);
  background-color: var(--wtd-line);
  margin: 0 auto;
}

/* Cabeçalho */
.mobile-sheet__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-sheet__check {
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  border: 2px solid var(--wtd-text-subtle);
  background: transparent;
  color: var(--wtd-text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.mobile-sheet__check--done {
  background: var(--wtd-text-subtle);
  color: var(--wtd-paper-bg);
}

.mobile-sheet__title {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
}

.mobile-sheet__title--done {
  text-decoration: line-through;
  color: var(--wtd-text-subtle);
}

.mobile-sheet__title::placeholder {
  color: var(--wtd-text-subtle);
  font-weight: 400;
}

.mobile-sheet__close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--wtd-text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ações */
.mobile-sheet__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 4px 0;
  border-bottom: 1px solid var(--wtd-line);
}

.mobile-sheet__action-icon {
  font-size: 1.15rem;
  color: var(--wtd-text-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.mobile-sheet__action-icon--danger {
  margin-left: auto;
  color: var(--wtd-danger, #ed544b);
}

/* Notas */
.mobile-sheet__notes {
  padding: 8px 0;
  min-height: 44px;
}

/* Subtarefas */
.mobile-sheet__subtasks {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--wtd-line);
}

.mobile-sheet__subtask {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-sheet__subtask-check {
  flex-shrink: 0;
  margin: 0;
  color: var(--wtd-text-subtle);
}

.mobile-sheet__subtask-text {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
}

.mobile-sheet__subtask-text--done {
  text-decoration: line-through;
  color: var(--wtd-text-subtle);
}

.mobile-sheet__subtask-text::placeholder {
  color: var(--wtd-text-subtle);
}

/* Lixeira sempre visível, sem depender de hover */
.mobile-sheet__subtask-remove {
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
