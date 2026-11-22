/* MovAi service worker — only here so the site can be installed as an app. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function () { self.clients.claim(); });
self.addEventListener("fetch", function () { /* fall through to the network */ });
