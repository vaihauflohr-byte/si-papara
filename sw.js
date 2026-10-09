/* =====================================================================
   SI Papara — service worker. Généré par si_papara_appli.py : ne pas modifier à la main.
   Grâce à lui, l'appli installée s'ouvre même sans réseau.
   Stratégie : le RÉSEAU D'ABORD, pour que les élèves voient toujours la dernière version
   déposée sur GitHub (dates des DS, nouvelles séries, contenu/calendrier.js corrigé en ligne) ;
   la copie gardée sur le téléphone ne sert que sans réseau, ou quand il est trop lent.
   Les données des élèves (Supabase) ne passent jamais par ici.
   ===================================================================== */
const VERSION = "2026-10-08T14:21";
const CACHE = "sip-site-v1";
const COEUR = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/logo-papara.svg",
  "assets/icones/icone-192.png",
  "assets/style.css",
  "assets/icones/apple-touch-icon.png",
  "config.js",
  "assets/backend.js",
  "assets/appli.js",
  "assets/signaler.js",
  "assets/moteur.js",
  "contenu/competences.js",
  "contenu/bac-si.js",
  "contenu/calendrier.js",
  "assets/calendrier.js",
  "contenu/methode-bac.js",
  "contenu/fiches-bac.js",
  "contenu/anim-bac.js",
  "assets/missions.js",
  "contenu/missions-bac.js",
  "assets/verif.js",
  "contenu/verif-bac.js",
  "assets/observe.js",
  "contenu/observe-bac.js",
  "contenu/seconde-si.js",
  "contenu/1si-s1a.js",
  "contenu/1si-s1b.js",
  "contenu/1si-s2-s6.js",
  "contenu/1si-s3.js",
  "contenu/1si-s4-s5.js",
  "contenu/tsi-s7-s11.js",
  "contenu/tsi-s8.js",
  "contenu/tsi-s9-s10.js",
  "contenu/tsi-s12-s13.js",
  "contenu/tsi-robot.js",
  "contenu/bts1.js",
  "contenu/bts2.js",
  "contenu/bts-sti.js",
  "contenu/bts-adm.js",
  "assets/app.js",
  "assets/fonts/barlow-condensed-500.woff2",
  "assets/fonts/barlow-condensed-600.woff2",
  "assets/fonts/barlow-condensed-700.woff2",
  "assets/fonts/ibm-plex-mono-400.woff2",
  "assets/fonts/ibm-plex-mono-500.woff2",
  "assets/fonts/ibm-plex-mono-600.woff2",
  "assets/fonts/ibm-plex-sans-400.woff2",
  "assets/fonts/ibm-plex-sans-500.woff2",
  "assets/fonts/ibm-plex-sans-600.woff2",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
];
const DELAI_PAGE = 6000, DELAI_FICHIER = 5000;   // au-delà (réseau très lent), la copie du téléphone répond

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(COEUR.map((u) => c.add(u).catch(() => null)));   // un fichier manquant n'empêche pas l'installation
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("sip-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const course = (p, ms) => new Promise((ok, ko) => {
  const t = setTimeout(() => ok(null), ms);
  p.then((r) => { clearTimeout(t); ok(r); }, (x) => { clearTimeout(t); ko(x); });
});

function horsLigne(page) {
  if (!page) return new Response("", { status: 503, statusText: "Hors ligne" });
  const accueil = new URL("index.html", self.registration.scope).href;
  return new Response(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SI Papara · pas de réseau</title></head><body style="font-family:system-ui,-apple-system,sans-serif;max-width:32rem;margin:14vh auto;padding:0 20px;color:#15202b;line-height:1.5">
<h1 style="font-size:1.45rem;margin:0 0 .4em">Pas de réseau</h1>
<p>Cette page n'a encore jamais été ouverte avec du réseau sur cet appareil : elle n'est pas gardée en mémoire.</p>
<p>Tes fiches et les pages déjà ouvertes, elles, marchent sans réseau.</p>
<p><a href="${accueil}" style="color:#1d3f7a;font-weight:600">Revenir à l'accueil de SI Papara</a></p></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const site = url.origin === self.location.origin;
  if (!site && url.hostname !== "cdn.jsdelivr.net") return;                       // Supabase et le reste : jamais en cache
  if (site && (/\/sw\.js$/.test(url.pathname) || /\/dev-N[^/]*\.html$/.test(url.pathname))) return;
  const page = req.mode === "navigate";
  const reseau = fetch(req);
  // chaque réponse du réseau remplace la copie du téléphone
  e.waitUntil(reseau.then((r) => {
    if (r && (r.ok || r.type === "opaque")) { const copie = r.clone(); return caches.open(CACHE).then((c) => c.put(req, copie)); }
  }).catch(() => {}));
  e.respondWith((async () => {
    try { const r = await course(reseau, page ? DELAI_PAGE : DELAI_FICHIER); if (r) return r; } catch (x) { /* pas de réseau */ }
    const c = await caches.open(CACHE);
    let garde = await c.match(req, { ignoreSearch: page });
    const racine = new URL("./", self.registration.scope);
    if (!garde && page && (url.pathname === racine.pathname || url.pathname === racine.pathname + "index.html"))
      garde = (await c.match(new URL("index.html", racine).href)) || (await c.match(racine.href));
    if (garde) return garde;
    try { return await reseau; } catch (x) { return horsLigne(page); }   // pas de copie : on attend encore le réseau
  })());
});
