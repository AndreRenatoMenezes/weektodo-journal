<template>
  <div class="week-day-strip">
    <button
      v-for="day in weekDays"
      :key="day.date"
      class="week-day-btn"
      :class="{ 'week-day-btn--active': day.date === selectedDate }"
      @click="selectDay(day.date)"
    >
      <span class="week-day-btn__label">{{ day.label }}</span>
      <span
        class="week-day-btn__num"
        :class="{ 'week-day-btn__num--active': day.date === selectedDate }"
      >{{ day.num }}</span>
      <span
        v-if="day.hasTask"
        class="week-day-btn__dot"
        :class="{ 'week-day-btn__dot--active': day.date === selectedDate }"
      ></span>
      <span v-else class="week-day-btn__dot-placeholder"></span>
    </button>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "WeekDayStrip",
  computed: {
    selectedDate() {
      return this.$store.getters.mobileSelectedDate;
    },
    todoLists() {
      return this.$store.getters.todoLists;
    },
    currentLocale() {
      const lang = (this.$store.getters.config && this.$store.getters.config.language) || this.$i18n.locale || "en";
      return lang === "zh_cn" ? "zh-cn" : lang === "zh_tw" ? "zh-tw" : lang;
    },
    weekStartOnMonday() {
      const config = this.$store.getters.config;
      return config && typeof config.weekStartOnMonday === "boolean"
        ? config.weekStartOnMonday
        : true;
    },
    weekDates() {
      // `startOf("isoWeek")` sempre cai na segunda-feira. Para semana iniciando
      // no domingo, recua pelo dia da semana atual (0=dom .. 6=sáb) — subtrair
      // um dia da segunda quebraria aos domingos, gerando a semana anterior.
      const today = moment().startOf("day");
      const startOfWeek = this.weekStartOnMonday
        ? today.clone().startOf("isoWeek")
        : today.clone().subtract(today.day(), "days");
      return Array.from({ length: 7 }, (_, i) => {
        return startOfWeek.clone().add(i, "days");
      });
    },
    weekDays() {
      const locale = this.currentLocale;
      return this.weekDates.map((d) => {
        const dateStr = d.format("YYYYMMDD");
        const list = this.todoLists[dateStr];
        return {
          date: dateStr,
          label: d.clone().locale(locale).format("ddd"),
          num: d.format("D"),
          hasTask: Array.isArray(list) && list.length > 0,
        };
      });
    },
  },
  watch: {
    weekDates: {
      immediate: true,
      handler() {
        this.preloadWeekDays();
      },
    },
  },
  mounted() {
    this.preloadWeekDays();
  },
  methods: {
    selectDay(date) {
      this.$store.commit("setMobileSelectedDate", date);
    },
    preloadWeekDays() {
      this.weekDates.forEach((d) => {
        const dateStr = d.format("YYYYMMDD");
        this.$store.dispatch("loadTodoLists", dateStr);
      });
    },
  },
};
</script>

<style scoped>
.week-day-strip {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background-color: var(--wtd-surface);
  border-bottom: 1px solid var(--wtd-line);
  padding: 0 4px;
  flex-shrink: 0;
}

.week-day-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  min-height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 2px;
  border-radius: var(--wtd-radius-hover);
  color: var(--wtd-text-subtle);
  transition: color var(--wtd-transition-ui);
}

.week-day-btn--active {
  color: var(--wtd-text-strong);
}

.week-day-btn__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.week-day-btn__num {
  font-size: 1rem;
  font-weight: 500;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--wtd-radius-pill);
}

.week-day-btn__num--active {
  background-color: var(--wtd-text-strong);
  color: var(--wtd-paper-bg);
}

/* Ponto 4px nos dias com tarefa */
.week-day-btn__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--wtd-text-subtle);
  margin-top: 1px;
}

.week-day-btn__dot--active {
  /* O ponto fica abaixo do círculo, sobre --wtd-surface: usar o tom forte,
     senão some no tema claro (surface e paper-bg são ambos #ffffff). */
  background-color: var(--wtd-text-strong);
}

.week-day-btn__dot-placeholder {
  width: 4px;
  height: 4px;
  margin-top: 1px;
}
</style>
