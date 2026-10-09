/* =====================================================================
   SI Papara — couche données.
   Deux implémentations avec la même API :
     - Supabase (production) si config.js est rempli
     - Démo (localStorage de ce navigateur) sinon
   ===================================================================== */
window.SIP = window.SIP || {};

(function (SIP) {
  const CFG = window.SIP_CONFIG || {};
  SIP.CFG = CFG;
  SIP.CYCLE = CFG.dureeCycleJours || 60;

  SIP.NIVEAUX = [
    { id: "2SI", nom: "Seconde SI", court: "2de SI", groupe: "Lycée" },
    { id: "1SI", nom: "Première SI", court: "1re SI", groupe: "Lycée" },
    { id: "TSI", nom: "Terminale SI", court: "Tle SI", groupe: "Lycée" },
    { id: "BTS1-STI", nom: "BTS 1 STI", court: "BTS1 STI", groupe: "BTS Électrotechnique", desc: "Conception : étude préliminaire, détaillée, réalisation" },
    { id: "BTS1-ADM", nom: "BTS 1 ADM", court: "BTS1 ADM", groupe: "BTS Électrotechnique", desc: "Analyse, diagnostic, maintenance" },
    { id: "BTS2-STI", nom: "BTS 2 STI", court: "BTS2 STI", groupe: "BTS Électrotechnique", desc: "Conception : étude préliminaire, détaillée, réalisation" },
    { id: "BTS2-ADM", nom: "BTS 2 ADM", court: "BTS2 ADM", groupe: "BTS Électrotechnique", desc: "Analyse, diagnostic, maintenance" }
  ];
  SIP.niveau = (id) => SIP.NIVEAUX.find((n) => n.id === id);

  // ---------- Dates (Tahiti = UTC-10, sans heure d'été) ----------
  SIP.aujourdhui = () => new Date(Date.now() - 10 * 3600e3).toISOString().slice(0, 10);
  SIP.joursEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400e3);
  SIP.ajouterJours = (d, n) => new Date(Date.parse(d) + n * 86400e3).toISOString().slice(0, 10);
  SIP.lundi = (d) => {
    const t = new Date(Date.parse(d || SIP.aujourdhui()));
    const wd = (t.getUTCDay() + 6) % 7; // 0 = lundi
    return SIP.ajouterJours(t.toISOString().slice(0, 10), -wd);
  };
  SIP.jourTahiti = (iso) => new Date(Date.parse(iso) - 10 * 3600e3).toISOString().slice(0, 10);
  SIP.fmtDate = (iso, avecHeure) => {
    if (!iso) return "—";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (m) return `${m[3]}/${m[2]}/${m[1].slice(2)}`; // date seule (déjà en heure de Tahiti)
    const d = new Date(iso);
    const o = { timeZone: "Pacific/Tahiti", day: "2-digit", month: "2-digit", year: "2-digit" };
    if (avecHeure) Object.assign(o, { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleString("fr-FR", o);
  };
  SIP.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Session élève ----------
  const CLE_SESSION = "sip_session";
  SIP.session = {
    get() { try { return JSON.parse(localStorage.getItem(CLE_SESSION)); } catch (e) { return null; } },
    set(s) { try { localStorage.setItem(CLE_SESSION, JSON.stringify(s)); } catch (e) {} },
    clear() { try { localStorage.removeItem(CLE_SESSION); } catch (e) {} }
  };

  // ---------- File d'attente hors-ligne ----------
  const CLE_FILE = "sip_file_attente";
  const lireFile = () => { try { return JSON.parse(localStorage.getItem(CLE_FILE)) || []; } catch (e) { return []; } };
  const ecrireFile = (f) => { try { localStorage.setItem(CLE_FILE, JSON.stringify(f)); } catch (e) {} };
  SIP.enAttente = () => lireFile().length;

  // =====================================================================
  //  Backend DÉMO
  // =====================================================================
  function BackendDemo() {
    const CLE = "sip_demo_db";
    const load = () => {
      let db;
      try { db = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
      if (!db) {
        db = { eleves: [], entrainements: [], fiches_suivi: [], lectures: [], seq: 1 };
        SIP.NIVEAUX.forEach((n) => db.eleves.push({ id: "demo-" + n.id, niveau: n.id, nom: "demo", pin: "1234", actif: true, cree_le: new Date().toISOString() }));
        try { localStorage.setItem(CLE, JSON.stringify(db)); } catch (e) {}
      }
      return db;
    };
    const save = (db) => { try { localStorage.setItem(CLE, JSON.stringify(db)); } catch (e) {} };
    const moi = () => { const s = SIP.session.get(); if (!s) throw new Error("SESSION_EXPIREE"); return s.eleve_id; };
    const uid = () => "e-" + Math.random().toString(36).slice(2, 10);

    return {
      mode: "demo",
      async connexion(niveau, nom, pin) {
        const db = load();
        const e = db.eleves.find((x) => x.niveau === niveau && x.nom.toLowerCase() === nom.trim().toLowerCase() && x.actif);
        if (!e || e.pin !== pin) return { ok: false, erreur: "IDENTIFIANTS" };
        return { ok: true, jeton: e.id, eleve_id: e.id, nom: e.nom, niveau: e.niveau };
      },
      async etat() {
        const db = load(); const v = moi(); const auj = SIP.aujourdhui();
        const e = db.eleves.find((x) => x.id === v);
        if (!e) throw new Error("SESSION_EXPIREE");
        const lec = db.lectures.filter((l) => l.eleve_id === v);
        return {
          eleve: { nom: e.nom, niveau: e.niveau },
          aujourdhui: auj,
          fiches: db.fiches_suivi.filter((f) => f.eleve_id === v).map((f) => {
            const lf = lec.filter((l) => l.fiche_id === f.fiche_id).sort((a, b) => b.jour.localeCompare(a.jour));
            return { fiche_id: f.fiche_id, adoptee_le: f.adoptee_le, nb_lectures: lf.length, dernier_su: lf[0] ? lf[0].su : null, lu_aujourdhui: lf.some((l) => l.jour === auj) };
          }),
          jours_lecture: [...new Set(lec.map((l) => l.jour))],
          hebdo_fait: db.entrainements.some((t) => t.eleve_id === v && t.type === "revision_hebdo" && SIP.jourTahiti(t.fait_le) >= SIP.lundi(auj)),
          historique: db.entrainements.filter((t) => t.eleve_id === v).sort((a, b) => b.fait_le.localeCompare(a.fait_le)).slice(0, 200)
        };
      },
      async enregistrer(t) {
        const db = load(); const v = moi(); const e = db.eleves.find((x) => x.id === v);
        db.entrainements.push(Object.assign({ id: db.seq++, eleve_id: v, niveau: e.niveau, fait_le: new Date().toISOString(), recu_le: new Date().toISOString() }, t));
        save(db);
      },
      async adopter(ids) {
        const db = load(); const v = moi();
        ids.forEach((id) => { if (!db.fiches_suivi.some((f) => f.eleve_id === v && f.fiche_id === id)) db.fiches_suivi.push({ eleve_id: v, fiche_id: id, adoptee_le: SIP.aujourdhui() }); });
        save(db);
      },
      async lire(fiche_id, su) {
        const db = load(); const v = moi(); const jour = SIP.aujourdhui();
        db.lectures = db.lectures.filter((l) => !(l.eleve_id === v && l.fiche_id === fiche_id && l.jour === jour));
        db.lectures.push({ eleve_id: v, fiche_id, jour, su, lu_le: new Date().toISOString() });
        save(db);
      },
      async signaler(p) {
        const db = load(); const v = moi(); const e = db.eleves.find((x) => x.id === v);
        db.signalements = db.signalements || [];
        const maintenant = new Date().toISOString();
        db.signalements.push(Object.assign({ id: db.seq++, eleve_id: v, niveau: e ? e.niveau : "", statut: "nouveau", valide_serie: false,
          cree_le: maintenant, traite_le: null }, SIP.nettoyerSignalement(p), { fait_le: p.fait_le || maintenant }));
        save(db);
      },
      async mesSignalements() {
        const db = load(); const v = moi();
        return (db.signalements || []).filter((x) => x.eleve_id === v).sort((a, b) => b.cree_le.localeCompare(a.cree_le)).slice(0, 50)
          .map((x) => ({ id: x.id, source: x.source, notion: x.notion, motif: x.motif, statut: x.statut, valide_serie: x.valide_serie, cree_le: x.cree_le, traite_le: x.traite_le, question: String(x.question || "").slice(0, 140) }));
      },
      // ----- prof -----
      async profConnexion(email, mdp) { if (mdp !== "demo") throw new Error("En mode démo, le mot de passe prof est : demo"); sessionStorage.setItem("sip_prof", "1"); },
      async profSession() { try { return sessionStorage.getItem("sip_prof") === "1"; } catch (e) { return false; } },
      async profDeconnexion() { sessionStorage.removeItem("sip_prof"); },
      async profDonnees() {
        const db = load(); const depuis = SIP.ajouterJours(SIP.aujourdhui(), -70);
        return { eleves: db.eleves.map(({ pin, ...r }) => r), entrainements: db.entrainements, fiches_suivi: db.fiches_suivi, lectures: db.lectures.filter((l) => l.jour >= depuis) };
      },
      async profSignalements() { const db = load(); return (db.signalements || []).slice().sort((a, b) => b.cree_le.localeCompare(a.cree_le)).slice(0, 300); },
      async traiterSignalement(id, statut) {
        const db = load(); const x = (db.signalements || []).find((r) => r.id === id);
        if (x) { x.statut = statut; x.traite_le = statut === "nouveau" ? null : new Date().toISOString(); }
        save(db);
      },
      async validerSignalement(id, note) {
        const db = load(); const x = (db.signalements || []).find((r) => r.id === id);
        if (!x) throw new Error("Signalement introuvable.");
        if (x.source !== "serie" || !/^bac-/.test(x.module || "")) throw new Error("Ce signalement ne vient pas d'une série notée.");
        if (!x.valide_serie) db.entrainements.push({ id: db.seq++, eleve_id: x.eleve_id, niveau: x.niveau, module: x.module, type: "externe",
          titre: "Bac SI · série validée par le professeur (erreur signalée)", score: note, score_max: 20, duree_s: null,
          details: { signalement: x.id }, fait_le: x.fait_le || x.cree_le, recu_le: x.cree_le });
        x.statut = "corrige"; x.valide_serie = true; x.traite_le = new Date().toISOString();
        save(db);
      },
      async creerEleve(niveau, nom, pin) {
        const db = load();
        if (db.eleves.some((x) => x.niveau === niveau && x.nom.toLowerCase() === nom.trim().toLowerCase())) throw new Error("Existe déjà : " + nom);
        db.eleves.push({ id: uid(), niveau, nom: nom.trim(), pin, actif: true, cree_le: new Date().toISOString() }); save(db);
      },
      async changerPin(id, pin) { const db = load(); const e = db.eleves.find((x) => x.id === id); if (e) e.pin = pin; save(db); },
      async basculerActif(id, actif) { const db = load(); const e = db.eleves.find((x) => x.id === id); if (e) e.actif = actif; save(db); },
      async supprimerEleve(id) {
        const db = load();
        ["entrainements", "fiches_suivi", "lectures"].forEach((t) => (db[t] = db[t].filter((r) => r.eleve_id !== id)));
        db.eleves = db.eleves.filter((e) => e.id !== id); save(db);
      }
    };
  }

  // =====================================================================
  //  Backend SUPABASE
  // =====================================================================
  function BackendSupabase() {
    const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, storageKey: "sip_prof_auth" } });
    const jeton = () => { const s = SIP.session.get(); if (!s) throw new Error("SESSION_EXPIREE"); return s.jeton; };
    const rpc = async (f, args) => {
      const { data, error } = await sb.rpc(f, args);
      if (error) {
        if (/SESSION_EXPIREE/.test(error.message)) throw new Error("SESSION_EXPIREE");
        const e = new Error(error.message); e.reseau = !error.code; throw e;
      }
      return data;
    };
    const tout = async (table, filtre) => { // pagination (limite Supabase de 1000 lignes)
      let res = [], de = 0;
      for (;;) {
        let q = sb.from(table).select("*").range(de, de + 999);
        if (filtre) q = filtre(q);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        res = res.concat(data); if (data.length < 1000) return res; de += 1000;
      }
    };
    return {
      mode: "supabase",
      connexion: (niveau, nom, pin) => rpc("connexion", { p_niveau: niveau, p_nom: nom, p_pin: pin }),
      etat: () => rpc("mon_etat", { p_jeton: jeton() }),
      enregistrer: (t) => rpc("enregistrer_entrainement", {
        p_jeton: jeton(), p_module: t.module, p_titre: t.titre || null, p_type: t.type || "entrainement",
        p_score: t.score, p_score_max: t.score_max, p_duree_s: t.duree_s || null, p_details: t.details || null, p_fait_le: t.fait_le || null
      }),
      adopter: (ids) => rpc("adopter_fiches", { p_jeton: jeton(), p_fiches: ids }),
      lire: (fiche_id, su) => rpc("lire_fiche", { p_jeton: jeton(), p_fiche: fiche_id, p_su: su }),
      signaler: (p) => { const x = SIP.nettoyerSignalement(p); return rpc("signaler_erreur", {
        p_jeton: jeton(), p_source: x.source, p_notion: x.notion, p_module: x.module, p_ref: x.ref, p_question: x.question, p_figure: x.figure,
        p_reponse: x.reponse, p_attendu: x.attendu, p_correction: x.correction, p_motif: x.motif, p_commentaire: x.commentaire, p_fait_le: p.fait_le || null }); },
      mesSignalements: () => rpc("mes_signalements", { p_jeton: jeton() }),
      // ----- prof -----
      async profConnexion(email, mdp) {
        const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
        if (error) throw new Error("Connexion refusée : " + error.message);
        const { data } = await sb.rpc("is_prof");
        if (!data) { await sb.auth.signOut(); throw new Error("Ce compte n'est pas inscrit comme prof (table « profs »)."); }
      },
      async profSession() { const { data } = await sb.auth.getSession(); if (!data.session) return false; const r = await sb.rpc("is_prof"); return !!r.data; },
      async profDeconnexion() { await sb.auth.signOut(); },
      async profDonnees() {
        const depuis = SIP.ajouterJours(SIP.aujourdhui(), -70);
        const [eleves, entrainements, fiches_suivi, lectures] = await Promise.all([
          tout("eleves", (q) => q.order("nom")), tout("entrainements", (q) => q.order("fait_le", { ascending: false })),
          tout("fiches_suivi"), tout("lectures", (q) => q.gte("jour", depuis))
        ]);
        eleves.forEach((e) => delete e.pin_hash);
        return { eleves, entrainements, fiches_suivi, lectures };
      },
      async profSignalements() {
        const { data, error } = await sb.from("signalements").select("*").order("cree_le", { ascending: false }).limit(300);
        if (error) throw new Error(error.message);
        return data;
      },
      async traiterSignalement(id, statut) {
        const { error } = await sb.from("signalements").update({ statut, traite_le: statut === "nouveau" ? null : new Date().toISOString() }).eq("id", id);
        if (error) throw new Error(error.message);
      },
      validerSignalement: (id, note) => rpc("valider_signalement", { p_id: id, p_note: note }),
      creerEleve: (niveau, nom, pin) => rpc("creer_eleve", { p_niveau: niveau, p_nom: nom, p_pin: pin }),
      changerPin: (id, pin) => rpc("changer_pin", { p_eleve: id, p_pin: pin }),
      async basculerActif(id, actif) { const { error } = await sb.from("eleves").update({ actif }).eq("id", id); if (error) throw new Error(error.message); },
      async supprimerEleve(id) { const { error } = await sb.from("eleves").delete().eq("id", id); if (error) throw new Error(error.message); }
    };
  }

  // =====================================================================
  //  Backend HORS LIGNE : le site est configuré mais la bibliothèque Supabase n'a pas pu se charger
  //  (appli ouverte sans réseau, réseau filtré). Surtout pas la démo : la session de l'élève est gardée,
  //  ses résultats et signalements vont dans la file d'attente et partiront au retour du réseau.
  // =====================================================================
  function BackendHorsLigne() {
    const ko = async () => { const e = new Error("Pas de réseau (HORS_LIGNE)"); e.reseau = true; throw e; };
    const api = { mode: "hors-ligne" };
    ["connexion", "etat", "enregistrer", "adopter", "lire", "signaler", "mesSignalements", "profConnexion", "profDonnees", "profSignalements",
      "traiterSignalement", "validerSignalement", "creerEleve", "changerPin", "basculerActif", "supprimerEleve", "profDeconnexion"].forEach((f) => (api[f] = ko));
    api.profSession = async () => false;
    return api;
  }

  // un signalement d'erreur : champs bornés (la base les borne aussi)
  const MOTIFS_SIG = ["juste", "correction", "enonce", "figure", "autre"], SOURCES_SIG = ["serie", "parcours", "blanc", "observe", "verif", "autre"];
  const coupe = (v, n) => (v == null || v === "" ? null : String(v).slice(0, n));
  SIP.nettoyerSignalement = (p) => ({
    source: SOURCES_SIG.includes(p.source) ? p.source : "autre", notion: coupe(p.notion, 80), module: coupe(p.module, 80), ref: coupe(p.ref, 80),
    question: coupe(p.question, 4000) || "(question non transmise)", figure: /^\s*<svg[\s>]/i.test(p.figure || "") ? coupe(p.figure, 60000) : null,
    reponse: coupe(p.reponse, 300), attendu: coupe(p.attendu, 300), correction: coupe(p.correction, 4000),
    motif: MOTIFS_SIG.includes(p.motif) ? p.motif : "autre", commentaire: coupe(p.commentaire, 600)
  });
  SIP.estReseau = (e) => !!e && (e.reseau === true || /failed to fetch|networkerror|load failed|network request failed|hors_ligne/i.test(e.message || ""));

  const configure = CFG.supabaseUrl && CFG.supabaseAnonKey;
  SIP.api = !configure ? BackendDemo() : window.supabase ? BackendSupabase() : BackendHorsLigne();
  if (configure && !window.supabase) console.warn("Supabase configuré mais la bibliothèque n'a pas chargé (pas de réseau ?) : mode hors ligne, résultats en file d'attente.");

  // ---------- Écritures élève avec file d'attente hors-ligne ----------
  async function envoyer(op) {
    if (op.f === "enregistrer") return SIP.api.enregistrer(op.a);
    if (op.f === "lire") return SIP.api.lire(op.a.fiche_id, op.a.su);
    if (op.f === "adopter") return SIP.api.adopter(op.a);
    if (op.f === "signaler") return SIP.api.signaler(op.a);
  }
  SIP.ecrire = async (f, a) => {
    const op = { f, a };
    if ((f === "enregistrer" || f === "signaler") && !a.fait_le) a.fait_le = new Date().toISOString();
    try { await envoyer(op); return true; }
    catch (e) {
      if (e.message === "SESSION_EXPIREE") throw e;
      if (f === "signaler" && !SIP.estReseau(e)) throw e;     // refus de la base (ex. trop de signalements) : on le dit tout de suite
      const q = lireFile(); q.push(op); ecrireFile(q); return false;
    }
  };
  SIP.viderFile = async () => {
    const q = lireFile(); if (!q.length) return 0;
    const reste = [];
    for (const op of q) {
      try { await envoyer(op); }
      catch (e) { if (op.f !== "signaler" || SIP.estReseau(e)) reste.push(op); }   // un signalement refusé par la base n'est pas renvoyé sans fin
    }
    ecrireFile(reste); return q.length - reste.length;
  };
})(window.SIP);
