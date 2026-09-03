import isElectron from "is-electron";

// O service worker existe so para a versao web: sob Electron o app ja carrega
// do disco, e em desenvolvimento um SW ativo mascara mudancas do hot reload.
export function registerServiceWorker() {
  if (isElectron()) return;
  if (process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.BASE_URL}service-worker.js`)
      .catch((error) => {
        console.log("service worker registration failed", error);
      });
  });
}

// Pede ao navegador que nao descarte o IndexedDB sob pressao de armazenamento.
// Sem isso, perder o banco significa perder tambem o snapshot sync_base.
export async function requestPersistentStorage() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (error) {
    console.log("persistent storage request failed", error);
    return false;
  }
}
