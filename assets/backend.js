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

  // ---------- Espace de dépôt (fichiers des dossiers 1, 2, 3) : mêmes limites que supabase/projets.sql ----------
  const LIMITES_DEPOT = { fichier: 25 * 1048576, eleve: 75 * 1048576, nombre: 300 };
  SIP.LIMITES_DEPOT = LIMITES_DEPOT;
  const EXT_INTERDITES = /\.(exe|msi|bat|cmd|com|scr|ps1|vbs|jar|dll|apk)$/i;
  const nomDepot = (n) => String(n || "").replace(/[\u0000-\u001f/\\]+/g, " ").trim().slice(0, 160);
  const depotPublic = (r) => ({ id: r.id, dossier: r.dossier, doc: r.doc, nom: r.nom, type: r.type, taille: r.taille, depose_le: r.depose_le, vu_le: r.vu_le });
  function controleDepot(niveau, fichier, nom, dossier, doc, deja) {   // mêmes refus que depot_preparer
    if (!/^BTS2/.test(niveau || "")) throw new Error("DEPOT_RESERVE_BTS2");
    if (!["d1", "d2", "d3"].includes(dossier)) throw new Error("DEPOT_DOSSIER");
    if (doc && !/^[a-z0-9][a-z0-9-]{0,39}$/.test(doc)) throw new Error("DEPOT_DOCUMENT");
    if (!nomDepot(nom)) throw new Error("DEPOT_NOM");
    if (!fichier || !fichier.size) throw new Error("DEPOT_VIDE");
    if (fichier.size > LIMITES_DEPOT.fichier) throw new Error("DEPOT_TROP_GROS");
    if (EXT_INTERDITES.test(nomDepot(nom))) throw new Error("DEPOT_TYPE");
    if (deja.length >= LIMITES_DEPOT.nombre) throw new Error("DEPOT_NOMBRE");
    if (deja.reduce((t, x) => t + x.taille, 0) + fichier.size > LIMITES_DEPOT.eleve) throw new Error("DEPOT_QUOTA");
  }
  const lireDataUrl = (f) => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => ko(r.error); r.readAsDataURL(f); });

  // ---------- File d'attente hors-ligne ----------
  const CLE_FILE = "sip_file_attente";
  const lireFile = () => { try { return JSON.parse(localStorage.getItem(CLE_FILE)) || []; } catch (e) { return []; } };
  const ecrireFile = (f) => { try { localStorage.setItem(CLE_FILE, JSON.stringify(f)); } catch (e) {} };
  SIP.enAttente = () => lireFile().length;

  // =====================================================================
  //  Backend DÉMO
  // =====================================================================
  // CLE : clé de stockage (mode démo : "sip_demo_db" ; aperçu professeur : "sip_apercu_db")
  function BackendDemo(CLE = "sip_demo_db", nomFictif = "demo") {
    const load = () => {
      let db;
      try { db = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
      if (!db) db = { eleves: [], entrainements: [], fiches_suivi: [], lectures: [], seq: 1 };
      let ajout = !db.eleves.length;
      SIP.NIVEAUX.forEach((n) => { if (!db.eleves.some((x) => x.id === "demo-" + n.id)) { ajout = true; db.eleves.push({ id: "demo-" + n.id, niveau: n.id, nom: nomFictif, pin: "1234", actif: true, cree_le: new Date().toISOString() }); } });
      if (ajout) { try { localStorage.setItem(CLE, JSON.stringify(db)); } catch (e) {} }
      return db;
    };
    const save = (db) => { try { localStorage.setItem(CLE, JSON.stringify(db)); } catch (e) {} };
    const moi = () => { const s = SIP.session.get(); if (!s) throw new Error("SESSION_EXPIREE"); return s.eleve_id; };
    const uid = () => "e-" + Math.random().toString(36).slice(2, 10);
    // dépôts de la démo : le contenu des fichiers de 1,5 Mo au plus est gardé dans ce navigateur
    const cleFichier = (id) => CLE + ":fichier:" + id;
    const uuid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "f-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    function blobDemo(r) {
      let d = null; try { d = localStorage.getItem(cleFichier(r.id)); } catch (e) {}
      if (!d) throw new Error("DEMO_NON_GARDE");
      const i = d.indexOf(","), bin = atob(d.slice(i + 1)), u8 = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
      return new Blob([u8], { type: r.type || "application/octet-stream" });
    }

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
      // ----- projets BTS 2 (supabase/projets.sql) -----
      async projetEtat() {
        const db = load(); const v = moi(); const r = (db.projets || []).find((x) => x.eleve_id === v);
        return r ? { projet: r.projet || null, etat: r.etat || null, retours: r.retours || null, maj_eleve: r.maj_eleve || null } : { projet: null, etat: null, retours: null, maj_eleve: null };
      },
      async projetEnregistrer(etat) {
        const db = load(); const v = moi(); db.projets = db.projets || [];
        let r = db.projets.find((x) => x.eleve_id === v);
        if (!r) { r = { eleve_id: v, projet: null, etat: {}, retours: {}, evaluation: {}, maj_eleve: null, maj_prof: null }; db.projets.push(r); }
        r.etat = etat; r.maj_eleve = new Date().toISOString(); save(db); return r.maj_eleve;
      },
      // ----- espace de dépôt -----
      async depotListe() {
        const db = load(); const v = moi(); const T = (db.depots || []).filter((x) => x.eleve_id === v && x.depose_le), L = T.filter((x) => !x.retire_le);
        return { fichiers: L.map(depotPublic), utilise: T.reduce((t, x) => t + x.taille, 0), limites: Object.assign({}, LIMITES_DEPOT) };   // retirés compris, comme la base
      },
      async depotEnvoyer(fichier, nom, dossier, doc) {
        const db = load(); const v = moi(); const e = db.eleves.find((x) => x.id === v);
        controleDepot(e && e.niveau, fichier, nom, dossier, doc, (db.depots || []).filter((x) => x.eleve_id === v));
        const id = uuid(); let garde = false;
        if (fichier.size <= 1.5 * 1048576) { try { localStorage.setItem(cleFichier(id), await lireDataUrl(fichier)); garde = true; } catch (x) {} }
        const pr = (db.projets || []).find((x) => x.eleve_id === v);
        const r = { id, eleve_id: v, dossier, doc: doc || null, nom: nomDepot(nom), type: fichier.type || null, taille: fichier.size, chemin: v + "/" + dossier + "/" + id,
          projet: pr ? pr.projet || (pr.etat || {}).projet || null : null, depose_le: new Date().toISOString(), retire_le: null, vu_le: null, garde };
        const db2 = load(); db2.depots = db2.depots || []; db2.depots.push(r); save(db2);   // relu : la lecture du fichier a pu prendre du temps
        return depotPublic(r);
      },
      async depotOuvrir(id) {
        const db = load(); const v = moi(); const r = (db.depots || []).find((x) => x.id === id && x.eleve_id === v && !x.retire_le);
        if (!r) throw new Error("DEPOT_INCONNU");
        return { url: URL.createObjectURL(blobDemo(r)), nom: r.nom, type: r.type };
      },
      async depotRetirer(id) {
        const db = load(); const v = moi(); const r = (db.depots || []).find((x) => x.id === id && x.eleve_id === v && x.depose_le && !x.retire_le);
        if (!r) throw new Error("DEPOT_INCONNU");
        r.retire_le = new Date().toISOString(); save(db);
      },
      async profDepots() { const db = load(); return (db.depots || []).filter((x) => x.depose_le).map((x) => Object.assign({}, x)); },
      async profDepotUrl(r) { return URL.createObjectURL(blobDemo(r)); },
      async profDepotBlob(r) { return blobDemo(r); },
      async profDepotVu(ids) {
        const db = load(); const t = new Date().toISOString();
        (db.depots || []).forEach((x) => { if (ids.includes(x.id)) x.vu_le = t; }); save(db); return t;
      },
      async profDepotSupprimer(rows) {
        const db = load(); const ids = rows.map((x) => x.id);
        ids.forEach((id) => { try { localStorage.removeItem(cleFichier(id)); } catch (x) {} });
        db.depots = (db.depots || []).filter((x) => !ids.includes(x.id)); save(db);
        return { supprimes: ids, restants: [] };
      },
      // ----- prof -----
      async profConnexion(email, mdp) { if (mdp !== "demo") throw new Error("En mode démo, le mot de passe prof est : demo"); sessionStorage.setItem("sip_prof", "1"); },
      async profSession() { try { return sessionStorage.getItem("sip_prof") === "1"; } catch (e) { return false; } },
      async profDeconnexion() { sessionStorage.removeItem("sip_prof"); },
      async profJeton() { try { return sessionStorage.getItem("sip_prof") === "1" ? "demo.prof.jeton" : null; } catch (e) { return null; } },
      async profDonnees() {
        const db = load(); const depuis = SIP.ajouterJours(SIP.aujourdhui(), -70);
        return { eleves: db.eleves.map(({ pin, ...r }) => r), entrainements: db.entrainements, fiches_suivi: db.fiches_suivi, lectures: db.lectures.filter((l) => l.jour >= depuis) };
      },
      async profSignalements() { const db = load(); return (db.signalements || []).slice().sort((a, b) => b.cree_le.localeCompare(a.cree_le)).slice(0, 300); },
      async profProjets() { const db = load(); return (db.projets || []).map((r) => Object.assign({}, r)); },
      async profProjetMaj(eleve_id, champs) {
        const db = load(); db.projets = db.projets || [];
        let r = db.projets.find((x) => x.eleve_id === eleve_id);
        if (!r) { r = { eleve_id, projet: null, etat: {}, retours: {}, evaluation: {}, maj_eleve: null, maj_prof: null }; db.projets.push(r); }
        Object.assign(r, champs, { maj_prof: new Date().toISOString() }); save(db);
      },
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
        (db.depots || []).filter((r) => r.eleve_id === id).forEach((r) => { try { localStorage.removeItem(cleFichier(r.id)); } catch (x) {} });
        db.depots = (db.depots || []).filter((r) => r.eleve_id !== id);
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
      projetEtat: () => rpc("projet_mon_etat", { p_jeton: jeton() }),
      projetEnregistrer: (etat) => rpc("projet_enregistrer", { p_jeton: jeton(), p_etat: etat }),
      // ----- espace de dépôt : ticket (depot_preparer), envoi direct au stockage, confirmation -----
      depotListe: () => rpc("depot_liste", { p_jeton: jeton() }),
      async depotEnvoyer(fichier, nom, dossier, doc) {
        const j = jeton();
        const t = await rpc("depot_preparer", { p_jeton: j, p_dossier: dossier, p_doc: doc || null, p_nom: nom, p_type: fichier.type || null, p_taille: fichier.size });
        const { error } = await sb.storage.from("depots").upload(t.chemin, fichier, { contentType: fichier.type || "application/octet-stream", upsert: false });
        if (error) { try { await rpc("depot_annuler", { p_jeton: j, p_id: t.id }); } catch (x) {} throw erreurStockage(error); }
        let c = null;   // le fichier est arrivé : confirmer (nouvel essai si le réseau coupe à ce moment-là)
        for (let k = 0; ; k++) {
          try { c = await rpc("depot_confirmer", { p_jeton: j, p_id: t.id }); break; }
          catch (e) {
            if (/DEPOT_NON_RECU/.test(e.message || "")) { try { await rpc("depot_annuler", { p_jeton: j, p_id: t.id }); } catch (x) {} throw e; }
            if (!e.reseau || k >= 2) throw e;
            await new Promise((ok) => setTimeout(ok, 800 * (k + 1)));
          }
        }
        return { id: t.id, dossier, doc: doc || null, nom: t.nom, type: fichier.type || null, taille: Number((c && c.taille) || fichier.size), depose_le: (c && c.depose_le) || new Date().toISOString(), vu_le: null };
      },
      async depotOuvrir(id, o) {
        const r = await rpc("depot_lien", { p_jeton: jeton(), p_id: id });
        const { data, error } = await sb.storage.from("depots").createSignedUrl(r.chemin, 120);
        if (error) throw erreurStockage(error);
        return { url: lienNomme(data.signedUrl, o && o.telecharger ? r.nom : null), nom: r.nom, type: r.type };
      },
      depotRetirer: (id) => rpc("depot_retirer", { p_jeton: jeton(), p_id: id }),
      // ----- prof -----
      async profConnexion(email, mdp) {
        const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
        if (error) throw new Error("Connexion refusée : " + error.message);
        const { data } = await sb.rpc("is_prof");
        if (!data) { await sb.auth.signOut(); throw new Error("Ce compte n'est pas inscrit comme prof (table « profs »)."); }
      },
      async profSession() { const { data } = await sb.auth.getSession(); if (!data.session) return false; const r = await sb.rpc("is_prof"); return !!r.data; },
      async profStatut() {
        try {
          const { data } = await sb.auth.getSession(); if (!data || !data.session) return "non";
          const r = await sb.rpc("is_prof"); if (r.error) return "inconnu"; return r.data ? "oui" : "non";
        } catch (e) { return "inconnu"; }
      },
      async profDeconnexion() { await sb.auth.signOut(); },
      async profJeton() { const { data } = await sb.auth.getSession(); return data && data.session ? data.session.access_token : null; },
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
      async profProjets() {
        const { data, error } = await sb.from("projets_eleves").select("*");
        if (error) throw new Error(error.message);
        return data;
      },
      async profProjetMaj(eleve_id, champs) {
        const { error } = await sb.from("projets_eleves").upsert(Object.assign({ eleve_id }, champs, { maj_prof: new Date().toISOString() }), { onConflict: "eleve_id" });
        if (error) throw new Error(error.message);
      },
      async profDepots() { return tout("depots", (q) => q.not("depose_le", "is", null).order("depose_le")); },
      async profDepotUrl(r, o) {
        const { data, error } = await sb.storage.from("depots").createSignedUrl(r.chemin, 300);
        if (error) throw erreurStockage(error);
        return lienNomme(data.signedUrl, o && o.telecharger ? r.nom : null);
      },
      async profDepotBlob(r) { const { data, error } = await sb.storage.from("depots").download(r.chemin); if (error) throw erreurStockage(error); return data; },
      async profDepotVu(ids) {
        const t = new Date().toISOString();
        const { error } = await sb.from("depots").update({ vu_le: t }).in("id", ids);
        if (error) throw new Error(error.message);
        return t;
      },
      // supprimer : d'abord le stockage, puis seulement les lignes dont le fichier est vraiment parti (ou n'existait plus)
      async profDepotSupprimer(rows) {
        if (!rows.length) return { supprimes: [], restants: [] };
        const { data, error: e1 } = await sb.storage.from("depots").remove(rows.map((x) => x.chemin));
        if (e1) throw erreurStockage(e1);
        const partis = new Set((data || []).map((x) => x.name)), restants = [];
        for (const r of rows) if (!partis.has(r.chemin)) {   // pas supprimé : absent du stockage (on peut effacer la ligne) ou refusé (on la garde)
          const { error } = await sb.storage.from("depots").createSignedUrl(r.chemin, 10);
          if (!(error && /not found/i.test(error.message || ""))) restants.push(r);
        }
        const ids = rows.filter((r) => !restants.includes(r)).map((r) => r.id);
        if (ids.length) { const { error } = await sb.from("depots").delete().in("id", ids); if (error) throw new Error(error.message); }
        return { supprimes: ids, restants: restants.map((r) => r.nom) };
      },
      validerSignalement: (id, note) => rpc("valider_signalement", { p_id: id, p_note: note }),
      creerEleve: (niveau, nom, pin) => rpc("creer_eleve", { p_niveau: niveau, p_nom: nom, p_pin: pin }),
      changerPin: (id, pin) => rpc("changer_pin", { p_eleve: id, p_pin: pin }),
      async basculerActif(id, actif) { const { error } = await sb.from("eleves").update({ actif }).eq("id", id); if (error) throw new Error(error.message); },
      async supprimerEleve(id) {
        try {   // ses fichiers déposés d'abord (la table « depots » suit l'élève, pas le stockage)
          const { data } = await sb.from("depots").select("chemin").eq("eleve_id", id);
          if (data && data.length) await sb.storage.from("depots").remove(data.map((x) => x.chemin));
        } catch (x) {}
        const { error } = await sb.from("eleves").delete().eq("id", id); if (error) throw new Error(error.message);
      }
    };
  }
  // lien signé + nom du fichier téléchargé (encodé une seule fois : l'option « download » de supabase-js l'encode deux fois)
  const lienNomme = (u, nom) => (nom ? u + (u.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(nom) : u);
  // erreur du stockage Supabase → code compris par les pages
  function erreurStockage(err) {
    const m = String((err && (err.message || err.error)) || err || "");
    const code = /row-level security|unauthorized|403|not allowed/i.test(m) ? "DEPOT_REFUSE" : /exceed|too large|413|maximum allowed size/i.test(m) ? "DEPOT_TROP_GROS"
      : /bucket not found/i.test(m) ? "DEPOT_ABSENT" : /object not found|not found/i.test(m) ? "DEPOT_INTROUVABLE" : m;
    const e = new Error(code); e.reseau = /failed to fetch|network|load failed/i.test(m); return e;
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
      "traiterSignalement", "validerSignalement", "creerEleve", "changerPin", "basculerActif", "supprimerEleve", "profDeconnexion",
      "projetEtat", "projetEnregistrer", "profProjets", "profProjetMaj", "depotListe", "depotEnvoyer", "depotOuvrir", "depotRetirer",
      "profDepots", "profDepotUrl", "profDepotBlob", "profDepotVu", "profDepotSupprimer"].forEach((f) => (api[f] = ko));
    api.profSession = async () => false;
    api.profJeton = async () => null;
    api.profStatut = async () => "inconnu";
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
  const principal = !configure ? BackendDemo() : window.supabase ? BackendSupabase() : BackendHorsLigne();
  if (configure && !window.supabase) console.warn("Supabase configuré mais la bibliothèque n'a pas chargé (pas de réseau ?) : mode hors ligne, résultats en file d'attente.");

  // =====================================================================
  //  Aperçu professeur : voir le site comme un élève de n'importe quelle
  //  filière, sans compte élève. Réservé au professeur connecté (espace prof,
  //  même navigateur). Tout se passe dans une base locale à ce navigateur
  //  ("sip_apercu_db") : rien n'est écrit dans la vraie base, les grilles et
  //  le suivi des élèves restent propres.
  // =====================================================================
  const CLE_AVANT = "sip_session_avant_apercu", CLE_APERCU = "sip_apercu_db";
  const locale = BackendDemo(CLE_APERCU, "Aperçu");
  SIP.apercu = {
    actif() { const s = SIP.session.get(); return !!(s && s.apercu); },
    demarrer(niveau) {
      if (!SIP.niveau(niveau)) return false;
      const s = SIP.session.get();
      if (s && !s.apercu) { try { localStorage.setItem(CLE_AVANT, JSON.stringify(s)); } catch (e) {} }   // session élève remise à la sortie
      SIP.session.set({ apercu: true, jeton: "apercu", eleve_id: "demo-" + niveau, nom: "Aperçu professeur", niveau });
      return true;
    },
    quitter() {
      let avant = null;
      try { avant = JSON.parse(localStorage.getItem(CLE_AVANT)); localStorage.removeItem(CLE_AVANT); } catch (e) {}
      if (avant) SIP.session.set(avant); else SIP.session.clear();
    },
    effacer() { try { localStorage.removeItem(CLE_APERCU); } catch (e) {} }   // efface les essais faits en aperçu
  };
  // =====================================================================
  //  Vérification des réponses rédigées par l'IA : fonction Supabase « corriger »
  //  (supabase/functions/corriger/index.ts, clé de l'API Claude côté serveur). Rien ne part sans session :
  //  élève connecté (son jeton) ou professeur connecté en aperçu (session de l'espace prof).
  //  On n'envoie que l'énoncé, le corrigé, les éléments du barème et le texte de l'élève.
  //  SIP_CONFIG.ia = false coupe la vérification ; SIP_CONFIG.iaUrl sert aux tests.
  // =====================================================================
  const IA_URL = CFG.iaUrl || (CFG.supabaseUrl ? String(CFG.supabaseUrl).replace(/\/+$/, "") + "/functions/v1/corriger" : "");
  SIP.ia = {
    actif: () => !!IA_URL && CFG.ia !== false,
    async corriger(p) {
      const erreur = (code, reseau) => Object.assign(new Error(code), { code, reseau: !!reseau });
      if (!SIP.ia.actif()) throw erreur("IA_ABSENTE");
      const s = SIP.session.get(); if (!s) throw erreur("NON_CONNECTE");
      const h = { "Content-Type": "application/json" }, corps = Object.assign({}, p);
      if (CFG.supabaseAnonKey) h.apikey = CFG.supabaseAnonKey;
      if (s.apercu) {
        const t = principal.profJeton ? await principal.profJeton().catch(() => null) : null;
        if (!t) throw erreur("PROF_NON_CONNECTE");
        h.Authorization = "Bearer " + t;
      } else corps.jeton = s.jeton;
      const ctl = typeof AbortController === "function" ? new AbortController() : null, minuterie = ctl ? setTimeout(() => ctl.abort(), 40000) : null;   // la fonction s'arrête d'elle-même avant 30 s
      let r;
      try { r = await fetch(IA_URL, { method: "POST", headers: h, body: JSON.stringify(corps), signal: ctl ? ctl.signal : undefined }); }
      catch (e) { throw erreur("IA_RESEAU", true); }
      finally { if (minuterie) clearTimeout(minuterie); }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw erreur(d.erreur || "IA_" + r.status);
      if (!d || !Array.isArray(d.elements)) throw erreur("IA_REPONSE");
      return d;
    }
  };

  // "oui" | "non" | "inconnu" (réseau). En mode démo, tout le monde est « prof ».
  SIP.statutProf = async () => (principal.mode === "demo" ? "oui" : principal.profStatut());

  const vers = (f) => (...a) => (SIP.apercu.actif() ? locale : principal)[f](...a);
  SIP.api = Object.assign({}, principal, { etat: vers("etat"), enregistrer: vers("enregistrer"), adopter: vers("adopter"), lire: vers("lire"),
    signaler: vers("signaler"), mesSignalements: vers("mesSignalements"), projetEtat: vers("projetEtat"), projetEnregistrer: vers("projetEnregistrer"),
    depotListe: vers("depotListe"), depotEnvoyer: vers("depotEnvoyer"), depotOuvrir: vers("depotOuvrir"), depotRetirer: vers("depotRetirer") });

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
    if (SIP.apercu.actif()) { await envoyer(op); return true; }   // aperçu : base locale, jamais de file d'attente
    try { await envoyer(op); return true; }
    catch (e) {
      if (e.message === "SESSION_EXPIREE") throw e;
      if (f === "signaler" && !SIP.estReseau(e)) throw e;     // refus de la base (ex. trop de signalements) : on le dit tout de suite
      const q = lireFile(); q.push(op); ecrireFile(q); return false;
    }
  };
  SIP.viderFile = async () => {
    if (SIP.apercu.actif()) return 0;   // résultats d'un élève en attente : envoyés quand sa session revient
    const q = lireFile(); if (!q.length) return 0;
    const reste = [];
    for (const op of q) {
      try { await envoyer(op); }
      catch (e) { if (op.f !== "signaler" || SIP.estReseau(e)) reste.push(op); }   // un signalement refusé par la base n'est pas renvoyé sans fin
    }
    ecrireFile(reste); return q.length - reste.length;
  };
})(window.SIP);
