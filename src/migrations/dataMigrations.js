import dbRepository from "../repositories/dbRepository";

// Identidade estavel da tarefa. Sem ela a sincronizacao so consegue comparar
// posicao no array, que muda a cada reordenacao.
export function newTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Electron com file:// e navegadores antigos nao expoem randomUUID.
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`;
}

// Atribui id in place se a tarefa ainda nao tiver. Devolve a propria tarefa.
export function ensureTaskId(todo) {
  if (todo && !todo.id) todo.id = newTaskId();
  return todo;
}

export default {
  // Percorre todas as listas do IndexedDB e da id a toda tarefa que ainda nao
  // tem. Idempotente: rodar de novo nao reescreve nada. Nenhum outro campo e
  // tocado.
  migrateTaskIds() {
    return new Promise((resolve, reject) => {
      const db_req = dbRepository.open();
      db_req.onerror = (event) => reject(event.target.error);
      db_req.onsuccess = (event) => {
        const db = event.target.result;
        const request = dbRepository.selectAll(db, "todo_lists");
        const pending = [];
        request.onerror = (e) => reject(e.target.error);
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const todoList = cursor.value;
            if (Array.isArray(todoList) && todoList.some((todo) => todo && !todo.id)) {
              todoList.forEach(ensureTaskId);
              pending.push(dbRepository.updateAsync(db, "todo_lists", cursor.key, todoList));
            }
            cursor.continue();
          } else {
            Promise.all(pending).then(resolve, reject);
          }
        };
      };
    });
  },
};
