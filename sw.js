/* MovAi service worker — only here so the site can be installed as an app. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function () { self.clients.claim(); });
/* Share target: when the user shares an audio file to MovAi (Android
   share sheet), the file is stashed in Cache Storage and the My Songs
   page picks it up and saves it to My Songs. */
function swB64(buf){
  var bytes = new Uint8Array(buf), out = "", i, chunk = 8192;
  for (i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(out);
}
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method === "POST" && u.pathname.endsWith("movai-new-songs.html")) {
    e.respondWith((async function () {
      try {
        var fd = await e.request.formData();
        var files = fd.getAll("audio").filter(function (f) { return f && f.size; });
        var out = [];
        for (var i = 0; i < files.length; i++) {
          var f = files[i];
          out.push({ name: f.name || ("shared-" + Date.now() + ".mp3"), type: f.type || "audio/mpeg", size: f.size, data: swB64(await f.arrayBuffer()) });
        }
        if (out.length) {
          var cache = await caches.open("movai-share");
          await cache.put(new Request("/movai-shared-audio"), new Response(JSON.stringify({ title: fd.get("title") || "", text: fd.get("text") || "", files: out, at: Date.now() }), { headers: { "Content-Type": "application/json" } }));
        }
      } catch (err) {}
      return Response.redirect(new URL("movai-new-songs.html?shared=1", e.request.url).href, 303);
    })());
    return;
  }
  /* fall through to the network */
});
