<template>
  <button class="mobile-fab" @click="$emit('click')" :aria-label="$t('mobile.taskTitlePlaceholder')">
    <i class="bi-plus-lg"></i>
  </button>
</template>

<script>
export default {
  name: "MobileFab",
  emits: ["click"],
};
</script>

<!-- Sem <style> scoped: a classe .mobile-fab já está definida em mobile.scss (WP02) -->
