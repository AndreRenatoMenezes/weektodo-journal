<template>
  <div class="d-flex flex-column mt-2 h-100">
    <p class="sync-desc">{{ $t("sync.description") }}</p>

    <div class="mb-3">
      <label class="form-label" for="syncUrlInput">{{ $t("sync.serverUrl") }}</label>
      <input class="form-control" type="url" id="syncUrlInput" v-model="form.syncUrl"
        placeholder="https://n8n.exemplo.com/webhook/weektodo" :disabled="connected" />
    </div>

    <div class="mb-3">
      <label class="form-label" for="syncUserInput">{{ $t("sync.user") }}</label>
      <input class="form-control" type="text" id="syncUserInput" v-model="form.syncUser" autocomplete="username"
        :disabled="connected" />
    </div>

    <div class="mb-1" v-if="!connected">
      <label class="form-label" for="syncPasswordInput">{{ $t("sync.password") }}</label>
      <input class="form-control" type="password" id="syncPasswordInput" v-model="form.password"
        autocomplete="current-password" @keyup.enter="connect" />
    </div>
    <p class="sync-hint mb-3" v-if="!connected">{{ $t("sync.passwordNotStored") }}</p>

    <div class="d-flex mb-3">
      <button v-if="!connected" class="btn btn-primary me-2" :disabled="!canConnect" @click="connect">
        {{ $t("sync.connect") }}
      </button>
      <button v-if="connected" class="btn btn-primary me-2" :disabled="status === 'sincronizando'" @click="syncNow">
        {{ $t("sync.syncNow") }}
      </button>
      <button v-if="connected" class="btn btn-outline-secondary" @click="disconnect">
        {{ $t("sync.disconnect") }}
      </button>
    </div>

    <div class="sync-state">
      <div class="d-flex justify-content-between">
        <span>{{ $t("sync.status") }}</span>
        <span :class="statusClass">{{ statusLabel }}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span>{{ $t("sync.lastSync") }}</span>
        <span>{{ lastSyncLabel }}</span>
      </div>
    </div>

    <p class="sync-error mt-3" v-if="status === 'erro_credencial'">{{ $t("sync.credentialErrorHelp") }}</p>
    <p class="sync-hint mt-3" v-if="status === 'offline'">{{ $t("sync.offlineHelp") }}</p>
  </div>
</template>

<script>
import moment from "moment";
import configRepository from "../../repositories/configRepository";
import syncApi from "../../repositories/syncApi";
import syncEngine from "../../helpers/syncEngine";

export default {
  name: "syncSettings",
  data() {
    return {
      form: {
        syncUrl: this.$store.getters.config.syncUrl || "",
        syncUser: this.$store.getters.config.syncUser || "",
        password: "",
      },
    };
  },
  computed: {
    status: function () {
      return this.$store.getters.syncStatus;
    },
    connected: function () {
      return !!this.$store.getters.config.syncToken;
    },
    canConnect: function () {
      return !!this.form.syncUrl && !!this.form.syncUser && !!this.form.password;
    },
    statusLabel: function () {
      const labels = {
        nao_configurado: this.$t("sync.statusNotConfigured"),
        conectado: this.$t("sync.statusConnected"),
        sincronizando: this.$t("sync.statusSyncing"),
        offline: this.$t("sync.statusOffline"),
        erro_credencial: this.$t("sync.statusCredentialError"),
      };
      return labels[this.status] || labels.nao_configurado;
    },
    statusClass: function () {
      if (this.status === "erro_credencial") return "sync-error";
      if (this.status === "offline") return "sync-hint";
      return "";
    },
    lastSyncLabel: function () {
      const at = this.$store.getters.config.lastSyncAt;
      return at ? moment(at).format("DD/MM/YYYY HH:mm") : this.$t("sync.never");
    },
  },
  methods: {
    saveConfig: function (values) {
      Object.keys(values).forEach((key) => {
        this.$store.commit("updateConfig", { key: key, val: values[key] });
      });
      configRepository.update(this.$store.getters.config);
    },
    connect: async function () {
      this.$store.commit("setSyncStatus", "sincronizando");
      try {
        const data = await syncApi.auth(
          { syncUrl: this.form.syncUrl },
          this.form.syncUser,
          this.form.password
        );
        this.saveConfig({
          syncUrl: this.form.syncUrl,
          syncUser: this.form.syncUser,
          syncToken: data.token,
        });
        // A senha some da memoria assim que o token chega.
        this.form.password = "";
        this.$store.commit("setSyncStatus", "conectado");
        this.syncNow();
      } catch (error) {
        this.$store.commit("setSyncError", error.code || "erro_servidor");
        this.$store.commit(
          "setSyncStatus",
          error.code === syncApi.SYNC_ERROR.CREDENTIAL ? "erro_credencial" : "offline"
        );
      }
    },
    disconnect: function () {
      this.saveConfig({ syncToken: null });
      this.$store.commit("setSyncStatus", "nao_configurado");
    },
    syncNow: function () {
      syncEngine.sync(this.$store);
    },
  },
};
</script>

<style scoped lang="scss">
.sync-desc {
  font-size: 0.85rem;
  opacity: 0.8;
}

.sync-hint {
  font-size: 0.8rem;
  opacity: 0.7;
}

.sync-error {
  font-size: 0.8rem;
  color: #ed544b;
}

.sync-state {
  font-size: 0.85rem;
  border-top: 1px solid rgba(128, 128, 128, 0.3);
  padding-top: 0.75rem;
}
</style>
