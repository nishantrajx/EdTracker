const V='v1',PRE=['./','index.html','css/app.css','js/app.js','js/store.js','js/firebase-config.js','data/syllabus/class10.json','data/syllabus/class12.json','data/exams/default-dates.json','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!='GET'||!(u.origin==location.origin||u.hostname=='www.gstatic.com'))return;
 e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit||c.match('index.html'));return hit||net}))});
