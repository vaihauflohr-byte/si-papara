/* =====================================================================
   SI Papara — agrégation : le mode hors ligne (labo sans réseau, Wi-Fi sans Internet)
   Service worker propre au dossier agreg/ (portée /agreg/), enregistré par agreg/hors-ligne.js.
   - Réseau d'abord : en ligne, chaque fichier vient du site, comme sans ce fichier ; une copie est gardée.
   - Sans réseau (ou s'il ne répond pas en 5 s) : la copie gardée sert la page, ses scripts, la configuration
     publique du site et la bibliothèque Supabase (cdn.jsdelivr.net).
   - À l'installation, tous les scripts de agreg/index.html sont gardés d'un coup : une seule visite avec
     le réseau suffit pour travailler ensuite sans réseau.
   - Jamais touchés : les écritures (POST…), Supabase (connexion, progression, prépa), l'IA, les autres sites,
     les adresses à paramètres (?x=…, ce sont des vérifications) sauf la page elle-même.
   Indépendant du service worker du site (sw.js à la racine, caches « sip-… ») : celui-ci ne touche qu'à
   ses caches « agreg-hl-… ».
   ===================================================================== */
const CACHE = "agreg-hl-v1";
const DELAI = 5000;          // au-delà, la copie gardée répond (le réseau peut encore la mettre à jour)
const RACINE = new URL("./", self.location).href;           // …/agreg/
let panne = 0;               // après une panne, la copie d'abord pendant 20 s : pas d'attente à chaque fichier

const garder = (u) => (u.origin === self.location.origin ? !/\/sw\.js$/.test(u.pathname) : u.hostname === "cdn.jsdelivr.net");
const sansParam = (u) => u.origin + u.pathname;

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const liste = ["./", "./index.html", "../config.js", "../assets/logo-papara.png"];
    try {
      const r = await fetch("./index.html", { cache: "no-cache" });
      if (r.ok) for (const m of (await r.clone().text()).matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) liste.push(m[1]);
    } catch (err) { /* hors ligne à l'installation : la page se gardera à la visite suivante */ }
    await Promise.all([...new Set(liste)].map(async (x) => {
      try {
        const u = new URL(x, RACINE); if (!garder(u)) return;
        const r = await fetch(u.href, u.origin === self.location.origin ? { cache: "no-cache" } : { mode: "cors" });
        if (r.ok) await c.put(u.href, r);
      } catch (err) { /* un fichier manquant n'empêche pas les autres */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("agreg-hl-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const HORS_LIGNE = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne · agrégation</title></head>
<body style="font:16px/1.55 system-ui,sans-serif;background:#f4f7fa;color:#183047;margin:0"><main style="max-width:640px;margin:0 auto;padding:40px 22px">
<h1 style="font-size:26px">Pas de réseau</h1><p>Cette page n’a pas encore été gardée sur cet appareil. Ouvre-la une fois avec le réseau : ensuite, l’entraînement marchera aussi sans réseau.</p>
<p><a href="./index.html" style="color:#00679a">Réessayer</a></p></main></body></html>`;

self.addEventListener("fetch", (e) => {
  const q = e.request;
  if (q.method !== "GET") return;
  const u = new URL(q.url);
  if (!garder(u)) return;
  const nav = q.mode === "navigate";
  if (!nav && u.search) return;                // vérifications à paramètres : le réseau seul, rien de gardé
  e.respondWith(repondre(e, q, nav ? sansParam(u) : q.url, nav));
});

function chercher(e, c, q, cle, nav, sonde) {   // le réseau, et la copie mise à jour s'il répond
  let x = q, fin = 0;
  if (sonde) {   // la sonde : hors du cache HTTP (une demande restée sans réponse y bloquerait les suivantes), 15 s au plus
    const ac = new AbortController(); fin = setTimeout(() => ac.abort(), 15000);
    x = new Request(cle, { cache: "no-store", credentials: "same-origin", signal: ac.signal });
  }
  return fetch(x).then((r) => {
    clearTimeout(fin);
    if (r && (r.ok || r.type === "opaque") && !(nav && r.redirected)) {
      const p = c.put(cle, r.clone()).catch(() => {});
      try { e.waitUntil(p); } catch (y) { /* évènement déjà terminé : la copie se fait quand même */ }
    }
    return r;
  }, (err) => { clearTimeout(fin); throw err; });
}

async function repondre(e, q, cle, nav) {
  const c = await caches.open(CACHE);
  const copie = async () => (await c.match(cle)) || (nav ? await c.match(new URL("./index.html", RACINE).href) : undefined);
  if (Date.now() < panne) {                    // panne récente : la copie tout de suite
    const r = await copie();
    if (r) {
      // une seule sonde par page (la page elle-même) : des dizaines de demandes sans réponse boucheraient
      // les connexions du navigateur ; si elle répond, le réseau d'abord revient
      if (nav) e.waitUntil(chercher(e, c, q, cle, nav, true).then(() => { panne = 0; }, () => {}));
      return r;
    }
  }
  const reseau = chercher(e, c, q, cle, nav);
  let trop = 0;
  const attente = new Promise((ok) => { trop = setTimeout(() => ok("délai"), DELAI); });
  try {
    const r = await Promise.race([reseau, attente]);
    if (r !== "délai") { clearTimeout(trop); return r; }
    panne = Date.now() + 20000;
    const x = await copie();
    if (x) { e.waitUntil(reseau.catch(() => {})); return x; }
    return await reseau;                        // rien de gardé : on attend encore le réseau
  } catch (err) {
    clearTimeout(trop);
    panne = Date.now() + 20000;
    const x = await copie();
    if (x) return x;
    if (nav) return new Response(HORS_LIGNE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    return Response.error();
  }
}
