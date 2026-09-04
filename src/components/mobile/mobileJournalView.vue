<template>
  <div class="mobile-journal-view">
    <div class="mobile-journal-content">
      <i class="bi-journal-text mobile-journal-icon"></i>
      <h2 class="mobile-journal-title">{{ $t("mobile.journalComingSoon") }}</h2>
      <p class="mobile-journal-desc">{{ $t("mobile.journalComingSoonDesc") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobileJournalView",
};
</script>

<style scoped>
.mobile-journal-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.mobile-journal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.mobile-journal-icon {
  font-size: 3rem;
  color: var(--wtd-text-subtle);
  margin-bottom: 8px;
}

.mobile-journal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--wtd-text-strong);
  margin: 0;
}

.mobile-journal-desc {
  font-size: 0.9rem;
  color: var(--wtd-text-subtle);
  margin: 0;
  max-width: 260px;
  line-height: 1.5;
}
</style>
