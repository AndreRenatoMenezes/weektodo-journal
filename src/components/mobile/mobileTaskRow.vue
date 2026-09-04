<template>
  <div class="mobile-task-row mobile-row-52" :class="{ 'mobile-task-row--done': toDo.checked }">
    <!-- Marcador colorido / checkbox: toque conclui a tarefa -->
    <button
      class="mobile-task-row__marker mobile-touch-target"
      :class="{ 'mobile-task-row__marker--colored': hasColor }"
      :style="markerStyle"
      @click.stop="toggleDone"
      :aria-label="$t('todoDetails.done')"
    >
      <i v-if="toDo.checked" class="bi-check2"></i>
    </button>

    <!-- Texto: toque abre o detalhe -->
    <span
      class="mobile-task-row__text"
      :class="{ 'mobile-task-row__text--done': toDo.checked }"
      @click.stop="openDetail"
    >{{ toDo.text }}</span>
  </div>
</template>

<script>
import todoActions from "../../helpers/todoActions";

export default {
  name: "MobileTaskRow",
  mixins: [todoActions],
  props: {
    toDo:      { type: Object, required: true },
    index:     { type: Number, required: true },
    toDoListId:{ type: String, required: true },
  },
  computed: {
    hasColor() {
      return Boolean(this.toDo.color && this.toDo.color !== "none");
    },
    markerStyle() {
      if (!this.hasColor) {
        return {
          border: "2px solid var(--wtd-text-subtle)",
          background: this.toDo.checked ? "var(--wtd-text-subtle)" : "transparent",
          color: this.toDo.checked ? "var(--wtd-paper-bg)" : "var(--wtd-text-subtle)",
        };
      }
      const color = this.toDo.color;
      return {
        border: `2px solid ${color}`,
        background: this.toDo.checked ? color : "transparent",
        color: this.toDo.checked ? "#ffffff" : color,
      };
    },
  },
  methods: {
    toggleDone() {
      this.actionToggleTodo(this.toDoListId, this.index);
    },
    openDetail() {
      // Abre o detalhe via evento para o mobileApp tratar (WP06 implementa a folha)
      this.$emit("open-detail", { toDo: this.toDo, index: this.index, toDoListId: this.toDoListId });
    },
  },
};
</script>

<style scoped>
.mobile-task-row {
  display: flex;
  align-items: center;
  padding: 0 8px 0 4px;
  box-sizing: border-box;
  gap: 4px;
  cursor: default;
}

.mobile-task-row__marker {
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  flex-shrink: 0;
  /* touch-target wrapping: pai tem min-height 44px */
}

.mobile-task-row__text {
  flex: 1;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.mobile-task-row__text--done {
  text-decoration: line-through;
  color: var(--wtd-text-subtle);
}
</style>
