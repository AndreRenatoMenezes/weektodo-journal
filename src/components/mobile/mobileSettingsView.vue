<template>
  <div class="mobile-settings-view">
    <!-- Aparência -->
    <h2 class="mobile-settings__section">{{ $t("mobile.appearance") }}</h2>

    <div class="mobile-settings__row mobile-row-52">
      <label class="mobile-settings__label" for="mobileDarkTheme">{{ $t("settings.darkTheme") }}</label>
      <div class="form-check form-switch mobile-settings__switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="mobileDarkTheme"
          v-model="configData.darkTheme"
          @change="changeConfig('darkTheme', configData.darkTheme)"
        />
      </div>
    </div>

    <div class="mobile-settings__row mobile-row-52">
      <label class="mobile-settings__label" for="mobileCompactView">{{ $t("settings.compactView") }}</label>
      <div class="form-check form-switch mobile-settings__switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="mobileCompactView"
          v-model="configData.compactView"
          @change="changeConfig('compactView', configData.compactView)"
        />
      </div>
    </div>

    <div class="mobile-settings__row mobile-row-52">
      <label class="mobile-settings__label" for="mobileLanguage">{{ $t("settings.language") }}:</label>
      <select
        id="mobileLanguage"
        class="form-select mobile-settings__select"
        v-model="configData.language"
        @change="changeConfig('language', configData.language)"
      >
        <option v-for="option in languageOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Dados -->
    <h2 class="mobile-settings__section">{{ $t("mobile.data") }}</h2>

    <div class="mobile-settings__row mobile-row-52">
      <label class="mobile-settings__label" for="mobileExportData">{{ $t("settings.exportData") }}</label>
      <button id="mobileExportData" type="button" class="btn border mobile-settings__button" @click="exportData">
        <i class="bi-cloud-arrow-down me-2"></i>{{ $t("settings.export") }}
      </button>
    </div>

    <div class="mobile-settings__row mobile-row-52">
      <label class="mobile-settings__label" for="mobileImportData">{{ $t("settings.importData") }}</label>
      <button id="mobileImportData" type="button" class="btn border mobile-settings__button" @click="$refs.loadData.click()">
        <i class="bi-cloud-arrow-up me-2"></i>{{ $t("settings.import") }}
      </button>
      <input type="file" class="d-none" accept=".wtdb" ref="loadData" @change="importData($event)" />
    </div>

    <!-- Sincronização: a tela do desktop, sem cópia da lógica -->
    <h2 class="mobile-settings__section">{{ $t("settings.sync") }}</h2>
    <div class="mobile-settings__sync">
      <sync-settings></sync-settings>
    </div>

    <!-- Sobre -->
    <h2 class="mobile-settings__section">{{ $t("mobile.about") }}</h2>

    <div class="mobile-settings__row mobile-row-52">
      <span class="mobile-settings__label">{{ $t("about.version") }}:</span>
      <span class="mobile-settings__value">{{ version }}</span>
    </div>

    <div class="mobile-settings__row mobile-row-52">
      <span class="mobile-settings__label">{{ appName }}</span>
      <a class="mobile-settings__value" :href="siteUrl" target="_blank" rel="noopener">{{ $t("about.site") }}</a>
    </div>

    <p class="mobile-settings__desc">{{ $t("about.desc") }}</p>

    <!-- O exportTool procura estes ids; no celular os do desktop não existem -->
    <importing-modal :id="'exportingModal'" :text="$t('settings.exporting')"></importing-modal>
    <div class="mobile-settings__toast-host">
      <toast-message id="invalidFile" :text="$t('settings.invalidFile')"></toast-message>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import configRepository from "../../repositories/configRepository";
import exportTool from "../../helpers/exportTool";
import syncSettings from "../config/syncSettings.vue";
import importingModal from "../../views/importingModal.vue";
import toastMessage from "../toastMessage";
import appConfig from "../../appConfig";

export default {
  name: "MobileSettingsView",
  components: { syncSettings, importingModal, toastMessage },
  data() {
    return {
      configData: this.$store.getters.config,
      // Mesma relação de idiomas do configModal do desktop
      languageOptions: [
        { value: "en", label: "English" },
        { value: "es", label: "Español" },
        { value: "fr", label: "Français" },
        { value: "de", label: "Deutsch" },
        { value: "it", label: "Italiano" },
        { value: "pt", label: "Português" },
        { value: "ru", label: "русский" },
        { value: "hi", label: "हिंदी" },
        { value: "ja", label: "日本" },
        { value: "pl", label: "Polski" },
        { value: "ar", label: "عرب" },
        { value: "ko", label: "한국어" },
        { value: "zh_cn", label: "简体中文" },
        { value: "zh_tw", label: "繁體中文" },
        { value: "uk", label: "український" },
        { value: "tr", label: "Türk" },
        { value: "vi", label: "Tiếng Việt" },
        { value: "he", label: "עִברִית" },
      ],
    };
  },
  computed: {
    version() {
      return this.configData.version;
    },
    appName() {
      return appConfig.name;
    },
    siteUrl() {
      return appConfig.siteUrl;
    },
  },
  methods: {
    changeConfig(key, val) {
      this.$nextTick(function () {
        this.$store.commit("updateConfig", { val: val, key: key });
        configRepository.update(this.$store.getters.config);
        if (key === "language") this.$i18n.locale = val;
      });
    },
    exportData() {
      const exportingModal = new Modal(document.getElementById("exportingModal"), { backdrop: "static" });
      exportingModal.show();
      exportTool.export();
    },
    /**
     * O import termina em reload quando o arquivo é válido e, quando não é, só
     * mostra o aviso. Diferente do export, nada aqui espera um modal aberto, e
     * abrir um deixaria a tela travada no caminho do arquivo inválido.
     */
    importData(event) {
      exportTool.import(event);
      // Permite escolher o mesmo arquivo de novo
      event.target.value = "";
    },
  },
};
</script>

<style scoped>
.mobile-settings-view {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 24px;
}

.mobile-settings__section {
  margin: 0;
  padding: 16px 16px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--wtd-text-subtle);
}

.mobile-settings__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--wtd-line);
}

.mobile-settings__label {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 0.95rem;
  color: var(--wtd-text-strong);
}

.mobile-settings__value {
  font-size: 0.875rem;
  color: var(--wtd-text-subtle);
}

.mobile-settings__switch {
  margin: 0;
  padding: 0;
  min-height: var(--wtd-mobile-touch-target);
  display: flex;
  align-items: center;
}

.mobile-settings__switch .form-check-input {
  width: 2.8em;
  height: 1.4em;
  margin: 0;
  cursor: pointer;
}

.mobile-settings__select {
  width: auto;
  max-width: 55%;
  min-height: var(--wtd-mobile-touch-target);
}

.mobile-settings__button {
  min-height: var(--wtd-mobile-touch-target);
  white-space: nowrap;
  color: var(--wtd-text-strong);
}

.mobile-settings__sync {
  padding: 0 16px;
}

.mobile-settings__desc {
  padding: 12px 16px 0;
  margin: 0;
  font-size: 0.8rem;
  color: var(--wtd-text-subtle);
}

.mobile-settings__toast-host {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 76px;
  z-index: 1060;
  pointer-events: none;
}

.mobile-settings__toast-host :deep(.toast) {
  pointer-events: auto;
  width: 100%;
}
</style>
