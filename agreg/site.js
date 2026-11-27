/* =====================================================================
   SI Papara — entraînement à l'agrégation (espace personnel du professeur)
   Branche la page agreg/index.html sur le site : accès réservé au professeur connecté (même session
   que prof.html), progression enregistrée dans Supabase (table agreg_progression, supabase/agreg.sql),
   correction des réponses rédigées par l'IA (fonction Supabase « agreg », supabase/functions/agreg).
   Prépa du mercredi (agreg/prepa.js) : documents de la préparation aux concours lus dans le compartiment privé
   « agreg-prepa » (supabase/agreg-prepa.sql).
   Sans ce fichier, la page fonctionne seule, avec la progression gardée dans le navigateur.
   Sans réseau (labo) : panne() le signale, et agreg/hors-ligne.js ouvre la page avec la progression de ce
   navigateur si le professeur s'y est déjà connecté ; l'IA et la prépa répondent « hors_ligne ».
   ===================================================================== */
(function () {
  const C = window.SIP_CONFIG || {};
  const ERR = (c) => ({ non_deployee: "La fonction de correction « agreg » n’est pas encore déployée dans Supabase.", cle_absente: "La clé de l’API Claude n’est pas configurée dans Supabase.", session_expired: "Session expirée : reconnecte-toi dans l’espace professeur.", hors_ligne: "Pas de réseau : l’IA reviendra avec la connexion. Le reste de l’entraînement marche hors ligne." }[c]);
  if (!C.supabaseUrl || !C.supabaseAnonKey || !window.supabase) {
    // site configuré mais bibliothèque Supabase pas chargée : pas de réseau
    if (C.supabaseUrl && C.supabaseAnonKey) {
      const ko = async () => { throw { code: "hors_ligne" }; };
      const sample = async () => ko(); sample.json = ko; sample.limits = async () => ({ maxPromptBytes: 40000, images: { maxCount: 1 } });
      window.AGREG_HOOK = { ready: Promise.resolve(false), panne: () => true, synced: () => false, sample, prepa: { programme: ko, textes: ko, liens: ko }, err: ERR };
    } else window.AGREG_HOOK = { ready: Promise.resolve(false) };
    return;
  }
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, storageKey: "sip_prof_auth" } });
  const URL_IA = String(C.supabaseUrl).replace(/\/+$/, "") + "/functions/v1/agreg";
  let uid = null, synchro = false, minuterie = null, dernier = null, panne = false;
  const reseau = (e) => !!e && (e.name === "AuthRetryableFetchError" || e.status === 0 || /failed to fetch|networkerror|load failed|network request failed/i.test(String(e.message || "")));

  const session = async () => { const { data, error } = await sb.auth.getSession(); if (error && reseau(error)) panne = true; return data && data.session ? data.session : null; };
  const ready = (async () => {
    try {
      const s = await session(); if (!s) { if (navigator.onLine === false) panne = true; return false; }
      const r = await sb.rpc("is_prof"); if (r.error && (!r.status || reseau(r.error))) { panne = true; return false; }
      if (!r.data) return false; uid = s.user.id; return true;
    }
    catch (e) { panne = true; return false; }
  })();
  const horsLigne = () => navigator.onLine === false || panne;

  // progression : une ligne par professeur ; si la table n'existe pas encore, on reste sur le navigateur
  async function pull() {
    const { data, error } = await sb.from("agreg_progression").select("donnees").eq("user_id", uid).maybeSingle();
    if (error) { synchro = false; return null; }
    synchro = true; return data ? data.donnees : null;
  }
  function push(st) {
    if (!uid || !synchro) return;
    dernier = st; clearTimeout(minuterie);
    minuterie = setTimeout(() => { sb.from("agreg_progression").upsert({ user_id: uid, donnees: dernier, maj: new Date().toISOString() }).then(() => {}, () => {}); }, 1500);
  }

  // photo de copie : réduite avant l'envoi (1 600 px au plus, JPEG)
  function image(fichier) {
    return new Promise((ok) => {
      if (!fichier) return ok(null);
      const img = new Image(), u = URL.createObjectURL(fichier);
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        ok({ type: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] });
      };
      img.onerror = () => { URL.revokeObjectURL(u); ok(null); };
      img.src = u;
    });
  }
  async function appel(mode, prompt, opts) {
    opts = opts || {};
    const s = await session(); if (!s) throw { code: horsLigne() ? "hors_ligne" : "session_expired" };
    const corps = { mode, prompt: String(prompt).slice(0, 40000), image: await image(opts.images && opts.images[0]) };
    let r;
    try {
      r = await fetch(URL_IA, { method: "POST", signal: opts.signal, headers: { "Content-Type": "application/json", apikey: C.supabaseAnonKey, Authorization: "Bearer " + s.access_token }, body: JSON.stringify(corps) });
    } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : horsLigne() ? "hors_ligne" : "upstream_error" }; }
    let d = null; try { d = await r.json(); } catch (e) { /* réponse vide */ }
    if (!r.ok) throw { code: r.status === 401 ? "session_expired" : r.status === 404 ? "non_deployee" : r.status === 429 ? "rate_limited" : d && d.erreur === "CLE_ABSENTE" ? "cle_absente" : d && d.erreur === "JSON" ? "invalid_json" : "upstream_error" };
    return d;
  }
  const sample = async (prompt, opts) => { const d = await appel("texte", prompt, opts); if (opts && opts.onText) opts.onText({ text: d.texte, delta: d.texte }); return { text: d.texte, truncated: false }; };
  sample.json = async (prompt, opts) => (await appel("json", prompt, opts)).objet;
  sample.limits = async () => ({ maxPromptBytes: 40000, images: { maxCount: 1, maxInputBytes: 2e7, mediaTypes: ["image/jpeg", "image/png", "image/webp"] } });

  // Prépa du mercredi : documents du formateur dans le compartiment PRIVÉ « agreg-prepa » (supabase/agreg-prepa.sql),
  // lisibles par le seul professeur connecté ; les PDF s'ouvrent par des liens signés.
  const BAC = "agreg-prepa";
  async function lireJSON(chemin) {
    const { data, error } = await sb.storage.from(BAC).download(chemin);
    if (error) throw { code: /not.?found|bucket/i.test(String(error.message || error.error || "")) || error.statusCode === "404" ? "prepa_absente" : "prepa_erreur" };
    return JSON.parse(await data.text());
  }
  const prepa = {
    programme: () => lireJSON("programme.json"),
    textes: () => lireJSON("textes.json"),
    async liens(chemins, duree) {
      if (!chemins.length) return {};
      const { data, error } = await sb.storage.from(BAC).createSignedUrls(chemins, duree || 3600);
      if (error) throw { code: "prepa_erreur" };
      const o = {};
      (data || []).forEach((x) => { if (x && x.signedUrl && !x.error) o[x.path] = x.signedUrl; });
      return o;
    },
  };

  window.AGREG_HOOK = { ready, pull, push, sample, prepa, synced: () => synchro, panne: () => panne, err: ERR };
})();
