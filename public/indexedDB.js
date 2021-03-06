const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
};

//create new db request for a db called "budget"
let db;
const request = indexedDB.open("budget", 1);

//check for offline transactions if online
request.onsuccess = function (event) {
    console.log("db initialized");
    db = event.target.result;
    console.log(db);
    if (navigator.onLine) {
        checkDatabase();
    };
};



//create and name object store as pending; want it to autoincrement 
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoincrement: true });
    // db.onerror = function(event) {
    //     console.log("trouble loading db" + event);
    // }
    // const store = db.createObjectStore("pending", { keyPath: "name" });


    // var transaction = db.transaction(["pending"], "readwrite");

};


//note if there is an error
request.onerror = function (e) {
    console.log("Error" + e.target.errorCode);
};


function saveRecord(data) {
    console.log(data);
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    // var storeRequest = store.put("data", data);
    var storeRequest = store.add(data);

    storeRequest.onsuccess = function(event) {
        console.log(event + "added successfully");
    }
};

//open the transaction from the pending db to access the pending object store
//store all the data from the pending object store as a variable
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    //post everything in object store and post to the API
    //then clear store 
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
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                })
                .catch(function (err) {
                    if (err) {
                        console.log(err);
                    };
                });

        }
    }
};

function deletePending() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.clear();
}

window.addEventListener("online", checkDatabase);