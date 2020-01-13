console.log("Service Worker is executed")

// version 2

/*
1) add offline.html to cache
2) activate the SW
3) to fetch all the requests with the service worker
 */

const CACHE_NAME = 'cache-v3';

const FILES_TO_CACHE = ['offline.html','js/script.js'];

let cache_available = "caches" in self;

self.addEventListener("install", (event) => {
    console.log("installed")
    caches.open(CACHE_NAME).then(
        (cache) => {
            console.log("ServiceWorker - PreCaching offline.html");
            cache.addAll(FILES_TO_CACHE);
        }
    )
})

self.addEventListener("activate", (event) => {
    console.log("activated")
    //delete old caches
    caches.keys().then((keys) => {
        console.log(keys);
        return Promise.all(keys.map((key) => {
            if(key!==CACHE_NAME)
                return caches.delete(key);
        }))
    })
})

self.addEventListener("fetch", (event) => {
    console.log("fetched")
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                console.log("Network access")
                // add the network response to our cache
                //clone the response
                let responseClone = response.clone()
                caches.open(CACHE_NAME).then(
                    (cache) => {
                        console.log("Added to cache: " + event.request.url)
                        cache.put(event.request,responseClone)
                    }
                )
                return response;
            })
            .catch((error) => {
                console.log("No network access")
                return caches.open(CACHE_NAME).then(
                    (cache) => {
                        return cache.match('offline.html');
                    }
                )
            })
    )
})







