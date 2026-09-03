// Envolve um IDBRequest cru numa Promise. As funcoes sincronas abaixo continuam
// devolvendo o request, para nao quebrar os chamadores existentes.
function promisify(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = (event) => resolve(event.target.result);
        req.onerror = (event) => reject(event.target.error);
    });
}

export default {
    open() {
        var req = indexedDB.open('weekToDo', 5);
        req.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains("todo_lists")) {
                db.createObjectStore('todo_lists', {autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events")) {
                db.createObjectStore('repeating_events', {autoIncrement: false});
            }

            if (!db.objectStoreNames.contains("repeating_events_by_date")) {
                db.createObjectStore('repeating_events_by_date', {autoIncrement: false});
            }

            // Snapshot da ultima versao sincronizada, base da fusao de tres vias.
            if (!db.objectStoreNames.contains("sync_base")) {
                db.createObjectStore('sync_base', {autoIncrement: false});
            }
        }
        req.onerror = function (event) {
            console.log('error opening database ' + event.target.errorCode);
        }
        return req;
    },
    openAsync() {
        return new Promise((resolve, reject) => {
            const req = this.open();
            req.onsuccess = (event) => resolve(event.target.result);
            req.onerror = (event) => reject(event.target.error);
        });
    },
    get(db, table, id) {
        let tx = db.transaction([table], 'readonly');
        let store = tx.objectStore(table);
        let req = store.get(id);
        return req;
    },
    getAsync(db, table, id) {
        return promisify(this.get(db, table, id));
    },
    add(db, table, id, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.add(obj, id);
        return req;
    },
    update(db, table, id, obj) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let new_obj = JSON.parse(JSON.stringify(obj));
        let req = store.put(new_obj,id);
        return req;
    },
    updateAsync(db, table, id, obj) {
        return promisify(this.update(db, table, id, obj));
    },
    delete(db, table, id) {
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.delete(id);
        return req;
    },
    deleteAsync(db, table, id) {
        return promisify(this.delete(db, table, id));
    },
    selectAll(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.openCursor();
        return req;
    },
    // Percorre o object store inteiro e devolve { chave: valor }.
    selectAllAsync(db, table) {
        return new Promise((resolve, reject) => {
            const req = this.selectAll(db, table);
            const result = {};
            req.onerror = (event) => reject(event.target.error);
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    result[cursor.key] = cursor.value;
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
        });
    },
    clear(db, table){
        let tx = db.transaction([table], 'readwrite');
        let store = tx.objectStore(table);
        let req = store.clear();
        return req;
    }
};
