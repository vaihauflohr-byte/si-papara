/* =====================================================================
   SI Papara — entraînement à l'agrégation (espace personnel du professeur)
   Branche la page agreg/index.html sur le site : accès réservé au professeur connecté (même session
   que prof.html), progression enregistrée dans Supabase (table agreg_progression, supabase/agreg.sql),
   correction des réponses rédigées par l'IA (fonction Supabase « agreg », supabase/functions/agreg).
   Sans ce fichier, la page fonctionne seule, avec la progression gardée dans le navigateur.
   ===================================================================== */
(function () {
  const C = window.SIP_CONFIG || {};
  if (!C.supabaseUrl || !C.supabaseAnonKey || !window.supabase) { window.AGREG_HOOK = { ready: Promise.resolve(false) }; return; }
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, storageKey: "sip_prof_auth" } });
  const URL_IA = String(C.supabaseUrl).replace(/\/+$/, "") + "/functions/v1/agreg";
  let uid = null, synchro = false, minuterie = null, dernier = null;

  const session = async () => { const { data } = await sb.auth.getSession(); return data && data.session ? data.session : null; };
  const ready = (async () => {
    try { const s = await session(); if (!s) return false; const r = await sb.rpc("is_prof"); if (!r.data) return false; uid = s.user.id; return true; }
    catch (e) { return false; }
  })();

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
    const s = await session(); if (!s) throw { code: "session_expired" };
    const corps = { mode, prompt: String(prompt).slice(0, 40000), image: await image(opts.images && opts.images[0]) };
    let r;
    try {
      r = await fetch(URL_IA, { method: "POST", signal: opts.signal, headers: { "Content-Type": "application/json", apikey: C.supabaseAnonKey, Authorization: "Bearer " + s.access_token }, body: JSON.stringify(corps) });
    } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "upstream_error" }; }
    let d = null; try { d = await r.json(); } catch (e) { /* réponse vide */ }
    if (!r.ok) throw { code: r.status === 401 ? "session_expired" : r.status === 404 ? "non_deployee" : r.status === 429 ? "rate_limited" : d && d.erreur === "CLE_ABSENTE" ? "cle_absente" : d && d.erreur === "JSON" ? "invalid_json" : "upstream_error" };
    return d;
  }
  const sample = async (prompt, opts) => { const d = await appel("texte", prompt, opts); if (opts && opts.onText) opts.onText({ text: d.texte, delta: d.texte }); return { text: d.texte, truncated: false }; };
  sample.json = async (prompt, opts) => (await appel("json", prompt, opts)).objet;
  sample.limits = async () => ({ maxPromptBytes: 40000, images: { maxCount: 1, maxInputBytes: 2e7, mediaTypes: ["image/jpeg", "image/png", "image/webp"] } });

  window.AGREG_HOOK = {
    ready, pull, push, sample, synced: () => synchro,
    err: (c) => ({ non_deployee: "La fonction de correction « agreg » n’est pas encore déployée dans Supabase.", cle_absente: "La clé de l’API Claude n’est pas configurée dans Supabase.", session_expired: "Session expirée : reconnecte-toi dans l’espace professeur." }[c]),
  };
})();
