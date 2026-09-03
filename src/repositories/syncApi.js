import axios from "axios";

// Cliente dos tres webhooks do n8n. Todo tratamento de erro fica no
// interceptador: quem chama recebe sempre um Error com `code` legivel.
const SYNC_ERROR = {
  CREDENTIAL: "erro_credencial",
  OFFLINE: "offline",
  SERVER: "erro_servidor",
};

function baseUrl(url) {
  return (url || "").replace(/\/+$/, "");
}

function client(config) {
  const instance = axios.create({
    baseURL: baseUrl(config.syncUrl),
    timeout: 20000,
    headers: { "content-type": "application/json" },
  });

  if (config.syncToken) {
    instance.defaults.headers.common.authorization = `Bearer ${config.syncToken}`;
  }

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response && error.response.status;
      const wrapped = new Error(error.message);
      if (status === 401 || status === 403) {
        wrapped.code = SYNC_ERROR.CREDENTIAL;
      } else if (!error.response) {
        // Sem resposta: servidor fora do ar, DNS, CORS ou timeout.
        wrapped.code = SYNC_ERROR.OFFLINE;
      } else {
        wrapped.code = SYNC_ERROR.SERVER;
        wrapped.status = status;
      }
      return Promise.reject(wrapped);
    }
  );

  return instance;
}

export default {
  SYNC_ERROR,

  // Troca usuario e senha por um token. A senha nao e guardada em lugar nenhum.
  async auth(config, username, password) {
    const { data } = await client(config).post("/auth", { username, password });
    return data;
  },

  async pull(config, since) {
    const { data } = await client(config).post("/pull", { since: since || 0 });
    return { revision: data.revision || 0, docs: data.docs || [] };
  },

  async push(config, docs) {
    const { data } = await client(config).post("/push", { docs });
    return {
      revision: data.revision || 0,
      aceitos: data.aceitos || [],
      rejeitados: data.rejeitados || [],
    };
  },
};
