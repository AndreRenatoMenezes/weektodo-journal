import dbRepository from "./dbRepository";

export default {
  update(toDoListId, toDoList) {
    let db_req = dbRepository.open();
    db_req.onsuccess = function (event) {
      let db = event.target.result;
      dbRepository.update(db, "todo_lists", toDoListId, toDoList);
    };
  },
  remove(toDoListId) {
    let db_req = dbRepository.open();
    db_req.onsuccess = function (event) {
      let db = event.target.result;
      dbRepository.delete(db, "todo_lists", toDoListId);
    };
  },
  // Variantes que resolvem so depois da gravacao terminar. A sincronizacao usa
  // estas para nunca montar payload a partir de estado ainda nao gravado.
  async updateAsync(toDoListId, toDoList) {
    const db = await dbRepository.openAsync();
    return dbRepository.updateAsync(db, "todo_lists", toDoListId, toDoList);
  },
  async removeAsync(toDoListId) {
    const db = await dbRepository.openAsync();
    return dbRepository.deleteAsync(db, "todo_lists", toDoListId);
  },
  async getAll() {
    const db = await dbRepository.openAsync();
    return dbRepository.selectAllAsync(db, "todo_lists");
  },
};
