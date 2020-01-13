/*
if ('serviceWorker' in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register('sw.js')
            .then((reg)=> console.log("Service worker is " +
                "registered for the scope "+reg.scope))
            .catch((error) => console.log(error))
    })
} else {
    console.log("Service Worker not supported");
}
*/
//new database
let db;
if (window.indexedDB) {
    let request = window.indexedDB.open("messages", 5);

    request.addEventListener("upgradeneeded", (event) => {
        console.log("Upgrade");
        db = event.target.result;
        let store;
        if (db.objectStoreNames.contains("elements")) {
            store = request.transaction.objectStore("elements")
        } else {
            store = db.createObjectStore("elements", {autoIncrement:true})
        }
        if (!store.indexNames.contains('timestampIndex')) {
           store.createIndex("timestampIndex", "timestamp");
        }

    })

    request.addEventListener("success", (event) => {
        console.log("Success");
        addElement(event.target.result, "My first message")
        addElement(event.target.result, "My second message")
        addElement(event.target.result, "My third message")
        addElement(event.target.result, "My fourth message")
       // getElement(event.target.result, 3)
        getElementWithCursor(event.target.result, 3)
    })
    request.addEventListener("error", () => {
        console.log("Error");
    })

    function addElement(db, message) {
        let tx = db.transaction("elements",'readwrite')
        let store = tx.objectStore("elements");
        let element = {text:message, timestamp:Date.now()}
        store.add(element)

        tx.addEventListener("complete", () => {
            console.log("Transacion completed - Element added");
        })

    }

    function getElement(db, key) {
        let tx = db.transaction("elements", 'readonly')
        let store = tx.objectStore("elements");

        let req = store.get(key)

        req.onsuccess = function (event) {
            let dataset = event.target.result;
            if (dataset) {
                console.log(dataset)
            } else {
                console.log("Not found")
            }
        }
        req.onerror = function (event) {
            console.log("error")
        }
    }

    function getElementWithCursor(db, key) {
        console.log("getElementWithCursor")
        let tx = db.transaction("elements", 'readonly')
        let store = tx.objectStore("elements");
        let index = store.index("timestampIndex")

        let req = index.openCursor(null,'next')

        req.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                if (cursor.value.text.indexOf("second")>-1)
                      console.log(cursor.value)
                cursor.continue();
            } else {
                console.log("Finished with cursor")
            }
        }
        req.onerror = function (event) {
            console.log("error")
        }
    }



}