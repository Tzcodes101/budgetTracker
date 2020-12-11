const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
};

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoincrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    };
};

request.onerror = function(e) {
    console.log("Error" + e.target.errorCode);
};

function saveRecord(data) {
    console.log(data);
    const trans = db.transaction(["pending"], "readwrite");
    const store = trans.objectStore("pending");
  
    store.add(data);
};

function checkDatabase() {
    const trans = db.transaction(["pending"], "readwrite");
    const store = trans.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", 
                    "Content-Type": "applicaiton/json"
                }
            })
            .then(res => {
                res.json();
            })
            .then(() => {
                const trans = db.transaction(["pending"], "readwrite");
                const store = trans.objectStore("pending");
                store.clear();
            })
        }
    }
};

window.addEventListener("online", checkDatabase);