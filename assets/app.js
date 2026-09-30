/* =====================================================================
   SI Papara — application élève
   ===================================================================== */
(function (SIP) {
  const $app = document.getElementById("app");
  const esc = SIP.esc;
  let ETAT = null;          // état renvoyé par le serveur
  let serieEnCours = false;

  // ---------------- Outils ----------------
  const pct = (s, m) => (m ? Math.round((100 * s) / m) : 0);
  const etiquettePct = (p) => `<span class="etiquette ${p >= 75 ? "ok" : p >= 50 ? "alerte" : "ko"}">${p} %</span>`;
  const pluriel = (n, s, p) => `${n} ${n > 1 ? p || s + "s" : s}`;
  const sur20 = (s, m) => (m ? (SIP.NOTE_MAX * s) / m : 0);
  const etiquetteNote = (s, m) => { const n = sur20(s, m), a = SIP.appreciation(n); return `<span class="etiquette ${a.cls}" title="${a.txt}">${SIP.nb(n, 3)}/20</span>`; };

  function banniere() {
    const b = document.getElementById("banniere");
    const att = SIP.enAttente();
    b.innerHTML = (SIP.api.mode === "demo" ? `<div class="demo-banniere">Mode démo : les données restent dans ce navigateur. Identifiant <b>demo</b>, code <b>1234</b>.</div>` : "") +
      (att ? `<div class="demo-banniere">${pluriel(att, "résultat")} en attente d'envoi (pas de réseau). Envoi automatique au retour de la connexion.</div>` : "");
  }
  function entete() {
    const s = SIP.session.get(); const q = document.getElementById("qui");
    q.innerHTML = s ? `<b>${esc(s.nom)}</b><br>${esc(SIP.niveau(s.niveau).nom)}` : esc(SIP.CFG.etablissement || "");
  }

  // État des fiches adoptées, enrichi du contenu
  function fichesSuivies() {
    const auj = ETAT.aujourdhui || SIP.aujourdhui();
    return (ETAT.fiches || []).map((f) => {
      const c = SIP.FICHES[f.fiche_id]; if (!c) return null;
      const jour = SIP.joursEntre(f.adoptee_le, auj) + 1;
      return Object.assign({}, f, { contenu: c, jour, active: jour <= SIP.CYCLE, ancree: jour > SIP.CYCLE });
    }).filter(Boolean);
  }
  function serie() { // jours consécutifs de lecture
    const jours = new Set(ETAT.jours_lecture || []); let d = SIP.aujourdhui(), n = 0;
    if (!jours.has(d)) d = SIP.ajouterJours(d, -1);
    while (jours.has(d)) { n++; d = SIP.ajouterJours(d, -1); }
    return n;
  }
  async function chargerEtat() {
    try { ETAT = await SIP.api.etat(); }
    catch (e) {
      if (e.message === "SESSION_EXPIREE") { SIP.session.clear(); location.hash = "#/"; throw e; }
      if (!ETAT) ETAT = { fiches: [], historique: [], jours_lecture: [], hebdo_fait: false, aujourdhui: SIP.aujourdhui(), horsLigne: true };
    }
    return ETAT;
  }
  async function ecrire(f, a) {
    try { const ok = await SIP.ecrire(f, a); banniere(); return ok; }
    catch (e) { if (e.message === "SESSION_EXPIREE") { alert("Ta session a expiré : reconnecte-toi."); SIP.session.clear(); location.hash = "#/"; } throw e; }
  }

  // ---------------- Vues ----------------
  function vueAccueil() {
    const groupes = {};
    SIP.NIVEAUX.forEach((n) => (groupes[n.groupe] = groupes[n.groupe] || []).push(n));
    $app.innerHTML = `<h1>S'entraîner, mémoriser, réviser</h1>
      <p class="discret">Choisis ta classe pour te connecter.</p>
      ${Object.entries(groupes).map(([g, ns]) => `<h2>${esc(g)}</h2><div class="grille">${ns.map((n) =>
        `<a class="carte tuile" href="#/connexion/${n.id}"><h3>${esc(n.nom)}</h3>${n.desc ? `<div class="discret">${esc(n.desc)}</div>` : ""}<span class="etiquette" style="margin-top:6px">${SIP.modulesDu(n.id).length} modules</span></a>`).join("")}</div>`).join("")}
      <p class="pied"><a href="prof.html">Espace professeur</a></p>`;
  }

  function vueConnexion(niveau) {
    const n = SIP.niveau(niveau); if (!n) return (location.hash = "#/");
    $app.innerHTML = `<p><a href="#/">← Changer de classe</a></p>
      <div class="carte" style="max-width:420px">
        <h1>${esc(n.nom)}</h1>
        <form id="f-cx" autocomplete="off">
          <label for="nom">Identifiant</label>
          <input id="nom" required autocapitalize="off" spellcheck="false" placeholder="donné par ton professeur">
          <label for="pin">Code secret</label>
          <input id="pin" required inputmode="numeric" pattern="[0-9]{4,6}" maxlength="6" type="password" placeholder="4 chiffres">
          <div style="margin-top:16px"><button class="btn">Se connecter</button></div>
          <div class="erreur" id="err"></div>
        </form>
      </div>`;
    document.getElementById("nom").focus();
    document.getElementById("f-cx").onsubmit = async (ev) => {
      ev.preventDefault();
      const err = document.getElementById("err"); err.textContent = "";
      const btn = ev.target.querySelector("button"); btn.disabled = true;
      try {
        const r = await SIP.api.connexion(niveau, document.getElementById("nom").value, document.getElementById("pin").value);
        if (!r.ok) { err.textContent = r.erreur === "BLOQUE" ? "Trop d'essais. Réessaie dans 10 minutes." : "Identifiant ou code incorrect."; return; }
        SIP.session.set({ jeton: r.jeton, eleve_id: r.eleve_id, nom: r.nom, niveau: r.niveau });
        ETAT = null; location.hash = "#/tableau";
      } catch (e) { err.textContent = "Connexion impossible (réseau ?). " + e.message; }
      finally { btn.disabled = false; }
    };
  }

  async function vueTableau() {
    const s = SIP.session.get();
    $app.innerHTML = `<p class="discret">Chargement…</p>`;
    await chargerEtat();
    const fs = fichesSuivies();
    const aLire = fs.filter((f) => f.active && !f.lu_aujourdhui).length;
    const actives = fs.filter((f) => f.active).length, ancrees = fs.filter((f) => f.ancree).length;
    const sr = serie();
    const hist = ETAT.historique || [];
    const modules = SIP.modulesDu(s.niveau);

    $app.innerHTML = `<h1>Bonjour ${esc(s.nom)}</h1>
      ${ETAT.horsLigne ? `<p class="erreur">Hors ligne : affichage partiel.</p>` : ""}
      ${s.niveau === "TSI" ? tuileBac(hist) : ""}
      <div class="grille">
        <a class="carte tuile ${aLire ? "a-faire" : actives ? "fait" : ""}" href="#/fiches">
          <div class="discret">Fiches du jour</div>
          <div class="grand">${actives ? (aLire ? pluriel(aLire, "à lire", "à lire") : "✓ Lues") : "—"}</div>
          <div class="discret">${actives ? `Série : ${pluriel(sr, "jour")} d'affilée` : "Termine un entraînement pour recevoir tes premières fiches."}</div>
        </a>
        <a class="carte tuile ${ETAT.hebdo_fait ? "fait" : fs.length ? "a-faire" : ""}" href="#/hebdo">
          <div class="discret">Révision de la semaine</div>
          <div class="grand">${ETAT.hebdo_fait ? "✓ Faite" : "À faire"}</div>
          <div class="discret">${ETAT.hebdo_fait ? "Prochaine lundi." : "Une fois par semaine, sur toutes tes fiches."}</div>
        </a>
        <a class="carte tuile" href="#/mes-fiches">
          <div class="discret">Mes fiches</div>
          <div class="grand">${actives + ancrees}</div>
          <div class="discret">${actives} en cours · ${ancrees} ancrées</div>
        </a>
        ${modules.some((m) => m.competences.length) ? `<a class="carte tuile" href="#/competences">
          <div class="discret">Mes compétences</div>
          <div class="grand">${moyenneGenerale(hist)}</div>
          <div class="discret">Ma moyenne sur 20 et mon niveau par compétence du programme.</div>
        </a>` : ""}
      </div>

      ${blocsModules(modules, hist)}

      <h2>Mes derniers entraînements</h2>
      ${tableHistorique(hist.slice(0, 5))}
      ${hist.length > 5 ? `<p><a href="#/historique">Voir tout (${hist.length})</a></p>` : ""}
      <p class="pied"><button class="btn-lien" id="deco">Se déconnecter</button></p>`;
    document.getElementById("deco").onclick = () => { SIP.session.clear(); ETAT = null; location.hash = "#/"; };
  }

  // Terminale SI : les séries du bac à valider (16/20) avant le prochain DS
  function tuileBac(hist) {
    const B = SIP.BAC; if (!B) return "";
    const now = Date.now(), prochaines = B.notions.filter((n) => n.echeance && Date.parse(n.echeance) > now).sort((a, b) => a.echeance.localeCompare(b.echeance));
    const lot = prochaines.length ? prochaines.filter((n) => n.ds_date === prochaines[0].ds_date) : [];
    const valide = (n) => hist.some((h) => h.type === "externe" && (h.module === "bac-" + n.id || h.module.startsWith("bac-" + n.id + "-s"))
      && Date.parse(h.recu_le || h.fait_le) <= Date.parse(n.echeance) && sur20(h.score, h.score_max) >= B.seuil);
    const faites = lot.filter(valide).length;
    const jour = (d) => new Date(d + "T12:00:00-10:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Pacific/Tahiti" });
    if (!lot.length) return `<a class="carte bac-hero" href="entrainements/bac-si.html">
        <div><div class="eyebrow">Terminale SI · épreuve de spécialité</div><div class="bac-titre">Bac SI <span>par notions</span></div>
        <p class="discret" style="margin:0">Séries, parcours et révision du jour.</p></div>
        <div class="bac-d"><span class="btn">S'entraîner →</span></div></a>`;
    return `<a class="carte bac-hero ${faites === lot.length ? "fait" : "a-faire"}" href="entrainements/bac-si.html">
        <div>
          <div class="eyebrow">Bac SI · séries notées</div>
          <div class="bac-titre">${esc(lot[0].ds || "DS")} <span>· ${esc(jour(lot[0].ds_date))}</span></div>
          <ul class="bac-lot">${lot.map((n) => `<li class="${valide(n) ? "ok" : ""}">${esc(n.lab)}</li>`).join("")}</ul>
          <p class="bac-regle">Chaque notion est validée à ${B.seuil}/20 sur une de ses séries, avant 6 h le jour du DS. Essais illimités.</p>
        </div>
        <div class="bac-d"><div><div class="grand">${faites}<small> / ${lot.length}</small></div><div class="discret">validée${faites > 1 ? "s" : ""}</div></div>
          <span class="btn">S'entraîner →</span></div>
      </a>`;
  }
  function moyenneGenerale(hist) {
    const t = hist.filter((h) => h.type === "entrainement");
    return t.length ? SIP.nb(t.reduce((a, h) => a + sur20(h.score, h.score_max), 0) / t.length, 3) + "/20" : "—";
  }
  function ligneModule(m, hist) {
    const essais = hist.filter((h) => h.module === m.id);
    const best = essais.reduce((b, h) => Math.max(b, sur20(h.score, h.score_max)), -1);
    return `<div class="module-ligne">
      <div class="module-txt"><b>${esc(m.titre)}</b><div class="discret">${esc(m.description || "")}</div>
      <div class="discret">${essais.length ? `${pluriel(essais.length, "essai")} · meilleure note ${etiquetteNote(best, SIP.NOTE_MAX)}` : "Pas encore fait"}</div></div>
      <a class="btn" href="#/module/${m.id}">S'entraîner</a></div>`;
  }
  function blocsModules(modules, hist) {
    if (!modules.length) return `<h2>Entraînements</h2><p class="discret">Aucun module pour l'instant.</p>`;
    const seqs = [];
    modules.forEach((m) => { const k = m.sequence || "Entraînements"; let g = seqs.find((x) => x.nom === k); if (!g) seqs.push((g = { nom: k, ms: [] })); g.ms.push(m); });
    const rang = (nom) => { if (/^projet/i.test(nom)) return -1; const m = /^S(\d+)/.exec(nom); return m ? +m[1] : 1000; };
    seqs.sort((a, b) => rang(a.nom) - rang(b.nom));
    let ouvert = false;
    return `<h2>Entraînements <span class="discret" style="font-weight:400">· 10 questions, tu pars de 20 points, −${SIP.PENALITE} par erreur</span></h2>` + seqs.map((g) => {
      const h = hist.filter((x) => g.ms.some((m) => m.id === x.module));
      const moy = h.length ? h.reduce((a, x) => a + sur20(x.score, x.score_max), 0) / h.length : null;
      const open = seqs.length <= 2 || (!ouvert && h.length ? (ouvert = true) : false);
      return `<details class="sequence" ${open ? "open" : ""}><summary><span>${esc(g.nom)}</span>
        <span class="discret">${pluriel(g.ms.length, "module")}${moy !== null ? " · moyenne " + etiquetteNote(moy, SIP.NOTE_MAX) : ""}</span></summary>
        ${g.ms.map((m) => ligneModule(m, hist)).join("")}</details>`;
    }).join("");
  }

  function tableHistorique(h) {
    if (!h.length) return `<p class="discret">Aucun entraînement pour l'instant.</p>`;
    const lib = { entrainement: "Entraînement", revision_hebdo: "Révision hebdo", externe: "Exercice", revision_jour: "Révision du jour" };
    return `<div class="table-defil"><table><thead><tr><th>Date</th><th>Activité</th><th class="num">Note</th></tr></thead><tbody>${h.map((x) =>
      `<tr><td>${SIP.fmtDate(x.fait_le, true)}</td><td>${esc(x.titre || (SIP.module(x.module) || {}).titre || x.module)}<br><span class="discret">${lib[x.type] || x.type}</span></td>
      <td class="num">${etiquetteNote(x.score, x.score_max)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  async function vueHistorique() {
    await chargerEtat();
    $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Tous mes entraînements</h1>${tableHistorique(ETAT.historique || [])}`;
  }

  // ---------- Entraînement ----------
  function vueModule(id) {
    const m = SIP.module(id); const s = SIP.session.get();
    if (!m || !m.niveaux.includes(s.niveau)) return (location.hash = "#/tableau");
    serieEnCours = true;
    SIP.lancerSerie($app, {
      titre: m.titre,
      questions: SIP.tirerQuestions(m.questions, m.nbQuestions || 10),
      surQuitter: () => { serieEnCours = false; location.hash = "#/tableau"; },
      surFin: async (res) => {
        serieEnCours = false;
        const envoye = await ecrire("enregistrer", { module: m.id, titre: m.titre, type: "entrainement", score: res.score, score_max: res.score_max, duree_s: res.duree_s, details: res.details });
        await chargerEtat();
        vueResultat(m.titre, res, envoye, m.fiches.map((f) => f.id), false, () => vueModule(id), m.competences);
      }
    });
  }

  function vueResultat(titre, res, envoye, proposees, hebdo, refaire, competences) {
    const note = sur20(res.score, res.score_max), app = SIP.appreciation(note);
    const erreurs = res.details.filter((d) => (d.erreurs !== undefined ? d.erreurs > 0 : d.pts < 1));
    const nbErr = res.erreurs !== undefined ? res.erreurs : erreurs.length;
    const fichesErreur = new Set(erreurs.map((d) => d.fiche).filter(Boolean));
    const dejaAdoptees = new Set((ETAT.fiches || []).map((f) => f.fiche_id));
    const aProposer = proposees.map((id) => SIP.FICHES[id]).filter(Boolean);
    const nouvelles = aProposer.filter((f) => !dejaAdoptees.has(f.id));

    $app.innerHTML = `<h1>${esc(titre)}</h1>
      <div class="carte">
        <div class="rang" style="justify-content:space-between;align-items:flex-start">
          <div><div class="note-finale">${SIP.nb(note, 3)}<small> / 20</small></div>
          <div class="discret">${nbErr ? `${pluriel(nbErr, "erreur")} × −${SIP.PENALITE} = −${nbErr * SIP.PENALITE} points` : "Aucune erreur !"} · ${Math.floor(res.duree_s / 60)} min ${res.duree_s % 60} s</div></div>
          <span class="etiquette ${app.cls}" style="font-size:.9rem">${app.txt}</span>
        </div>
        ${competences && competences.length ? `<div class="comp-chips">${competences.map((c) => SIP.COMPETENCES[c] ? `<span class="etiquette" title="${esc(SIP.COMPETENCES[c].txt)}">${c} · ${esc(SIP.COMPETENCES[c].txt)}</span>` : "").join("")}</div>` : ""}
        <p class="discret">${envoye ? "Résultat enregistré ✓ — ton professeur le voit." : "Pas de réseau : résultat gardé sur cet appareil, envoi automatique plus tard."}</p>
      </div>

      ${erreurs.length ? `<h2>À corriger</h2><div class="corrections">${erreurs.map((d) =>
        `<div class="correction"><div>${esc(d.q)}</div><div class="rang" style="gap:6px 16px"><span class="discret">Ta réponse : <s>${esc(d.rep)}</s></span><span>Attendu : <b>${esc(d.attendu)}</b></span>${d.erreurs ? `<span class="etiquette ko">−${SIP.PENALITE * d.erreurs}</span>` : ""}</div></div>`).join("")}</div>` : ""}

      ${hebdo ? blocRelireHebdo(fichesErreur) : blocFiches(aProposer, nouvelles, dejaAdoptees, fichesErreur)}

      <div class="rang" style="margin-top:24px">
        ${refaire ? `<button class="btn sec" id="refaire">Refaire un entraînement</button>` : ""}
        <a class="btn sec" href="#/tableau">Retour à l'accueil</a>
      </div>`;
    const rf = document.getElementById("refaire"); if (rf && refaire) rf.onclick = refaire;
    const ad = document.getElementById("adopter");
    if (ad) ad.onclick = async () => {
      const ids = [...document.querySelectorAll(".choix-fiche input:checked")].map((i) => i.value);
      if (!ids.length) return;
      ad.disabled = true;
      await ecrire("adopter", ids); await chargerEtat();
      document.getElementById("bloc-fiches").innerHTML = `<div class="carte fait"><h3>${pluriel(ids.length, "fiche ajoutée", "fiches ajoutées")} à ton programme ✓</h3>
        <p>Lis-les <b>chaque jour pendant ${SIP.CYCLE} jours</b> (2 minutes suffisent). Première lecture : maintenant !</p>
        <a class="btn" href="#/fiches">Lire mes fiches du jour</a></div>`;
    };
  }

  function blocFiches(toutes, nouvelles, deja, erreurFiches) {
    if (!toutes.length) return "";
    const lignes = toutes.map((f) => {
      const d = deja.has(f.id);
      return `<label class="choix-fiche ${erreurFiches.has(f.id) ? "signale" : ""}">
        <input type="checkbox" value="${f.id}" ${d ? "disabled checked" : erreurFiches.has(f.id) ? "checked" : ""}>
        <span><b>${esc(f.titre)}</b> ${d ? `<span class="etiquette ok">déjà dans ton programme</span>` : ""} ${erreurFiches.has(f.id) ? `<span class="etiquette ko">erreur sur ce point</span>` : ""}
        <br><span class="discret">${esc(f.recto)}</span></span></label>`;
    }).join("");
    return `<h2>Mini-fiches à mémoriser</h2>
      <div id="bloc-fiches">
      <p class="discret">Les fiches des notions où tu t'es trompé(e) sont cochées ; coche aussi celles que tu veux consolider. Tu les reliras <b>chaque jour pendant ${SIP.CYCLE} jours</b>, puis elles seront ancrées. Chaque semaine, une révision les reprend toutes.</p>
      ${(ETAT.fiches || []).length >= 25 ? `<p class="astuce">Tu as déjà ${(ETAT.fiches || []).length} fiches en programme : n'ajoute que celles qui correspondent à tes erreurs pour garder une lecture quotidienne raisonnable.</p>` : ""}
      <div class="choix-fiches">${lignes}</div>
      ${nouvelles.length ? `<p><button class="btn" id="adopter">Ajouter à mon programme</button></p>` : `<p class="discret">Toutes ces fiches sont déjà dans ton programme.</p>`}
      </div>`;
  }
  function blocRelireHebdo(fichesErreur) {
    if (!fichesErreur.size) return `<div class="carte fait" style="margin-top:16px"><h3>Aucune erreur : tes fiches tiennent bon.</h3></div>`;
    return `<h2>Fiches à relire en priorité</h2>${[...fichesErreur].map((id) => SIP.FICHES[id]).filter(Boolean).map((f) => carteFiche(f, true)).join("")}`;
  }

  // ---------- Fiches ----------
  function carteFiche(f, ouverte, suivi) {
    return `<div class="fiche" style="margin-bottom:12px">
      <div class="fiche-tete"><span class="fiche-titre">${esc(f.titre)}</span><span class="discret">${esc(f.moduleTitre)}</span></div>
      ${ouverte ? f.verso : `<div class="fiche-recto">${esc(f.recto)}</div>`}
      ${suivi ? `<div class="cycle"><span style="width:${Math.min(100, (100 * suivi.jour) / SIP.CYCLE)}%"></span></div>
        <div class="discret">${suivi.ancree ? "Ancrée ✓" : `Jour ${suivi.jour} / ${SIP.CYCLE}`} · lue ${pluriel(suivi.nb_lectures, "fois", "fois")}</div>` : ""}
    </div>`;
  }

  async function vueFichesDuJour() {
    $app.innerHTML = `<p class="discret">Chargement…</p>`;
    await chargerEtat();
    const file = fichesSuivies().filter((f) => f.active && !f.lu_aujourdhui);
    const total = file.length; let i = 0;
    if (!fichesSuivies().some((f) => f.active)) {
      $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Fiches du jour</h1><div class="carte"><p>Tu n'as pas encore de fiche en cours. Termine un entraînement : des mini-fiches te seront proposées à la fin.</p><a class="btn" href="#/tableau">Choisir un entraînement</a></div>`;
      return;
    }
    const suivante = () => {
      if (i >= total) {
        $app.innerHTML = `<h1>Fiches du jour ✓</h1><div class="carte fait"><h3>C'est fait pour aujourd'hui.</h3>
          <p>Série : <b>${pluriel(serie() || 1, "jour")}</b> d'affilée. Reviens demain : c'est la répétition quotidienne qui ancre les fiches.</p>
          <div class="rang"><a class="btn" href="#/tableau">Accueil</a><a class="btn sec" href="#/mes-fiches">Relire toutes mes fiches</a></div></div>`;
        return;
      }
      const f = file[i];
      $app.innerHTML = `<div class="serie-tete"><a href="#/tableau">← Accueil</a><div class="serie-titre">Fiches du jour</div><div class="serie-score">${i + 1} / ${total}</div></div>
        <div class="barre"><span style="width:${(i / total) * 100}%"></span></div>
        <div id="zf">${carteFiche(f.contenu, false, f)}</div>
        <p class="discret">Essaie de répondre de tête <b>avant</b> de retourner la fiche.</p>
        <div class="rang" id="actions"><button class="btn" id="retourner">Retourner la fiche</button></div>`;
      document.getElementById("retourner").onclick = () => {
        document.getElementById("zf").innerHTML = `<div class="fiche-recto" style="padding:0 0 8px">${esc(f.contenu.recto)}</div>` + carteFiche(f.contenu, true, f);
        document.getElementById("actions").innerHTML = `<button class="btn ok" data-su="1">Je savais ✓</button><button class="btn ko" data-su="0">À revoir ✗</button>`;
        document.querySelectorAll("[data-su]").forEach((b) => (b.onclick = async () => {
          document.querySelectorAll("[data-su]").forEach((x) => (x.disabled = true));
          await ecrire("lire", { fiche_id: f.fiche_id, su: b.dataset.su === "1" });
          i++; suivante();
        }));
      };
    };
    if (!total) {
      $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Fiches du jour ✓</h1><div class="carte fait"><p>Toutes tes fiches ont été lues aujourd'hui. Série : <b>${pluriel(serie(), "jour")}</b>.</p><a class="btn sec" href="#/mes-fiches">Relire quand même</a></div>`;
      return;
    }
    suivante();
  }

  async function vueMesFiches() {
    await chargerEtat();
    const fs = fichesSuivies().sort((a, b) => a.jour - b.jour);
    const jours = new Set(ETAT.jours_lecture || []);
    const cal = Array.from({ length: 60 }, (_, k) => { const d = SIP.ajouterJours(SIP.aujourdhui(), k - 59); return `<i class="${jours.has(d) ? "lu" : ""} ${k === 59 ? "auj" : ""}" title="${d}"></i>`; }).join("");
    $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Mes fiches</h1>
      <div class="carte"><h3>Mes 60 derniers jours de lecture</h3><div class="cal">${cal}</div><p class="discret">Série actuelle : ${pluriel(serie(), "jour")}.</p></div>
      <h2>En cours (${fs.filter((f) => f.active).length})</h2>
      ${fs.filter((f) => f.active).map((f) => carteFiche(f.contenu, true, f)).join("") || `<p class="discret">Aucune.</p>`}
      <h2>Ancrées (${fs.filter((f) => f.ancree).length})</h2>
      ${fs.filter((f) => f.ancree).map((f) => carteFiche(f.contenu, true, f)).join("") || `<p class="discret">Pas encore : il faut ${SIP.CYCLE} jours.</p>`}`;
  }

  // ---------- Mes compétences (auto-évaluation) ----------
  async function vueCompetences() {
    await chargerEtat();
    const s = SIP.session.get(); const hist = (ETAT.historique || []).filter((h) => h.type === "entrainement");
    const parC = {};
    hist.forEach((h) => { const m = SIP.module(h.module); if (!m) return; m.competences.forEach((c) => { (parC[c] = parC[c] || []).push(sur20(h.score, h.score_max)); }); });
    const codes = [...new Set(SIP.modulesDu(s.niveau).flatMap((m) => m.competences))].filter((c) => SIP.COMPETENCES[c]);
    const doms = {}; codes.forEach((c) => (doms[SIP.COMPETENCES[c].dom] = doms[SIP.COMPETENCES[c].dom] || []).push(c));
    $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Mes compétences</h1>
      <p class="discret">Moyenne de tes notes /20 dans les entraînements qui travaillent chaque compétence du programme de SI.
      <span class="etiquette ok">Maîtrisé ≥ 16</span> <span class="etiquette accent">En cours 12–16</span> <span class="etiquette alerte">Fragile 8–12</span> <span class="etiquette ko">À retravailler &lt; 8</span></p>
      ${Object.entries(doms).map(([d, cs]) => `<h2>${esc(d)}</h2><div class="carte">${cs.map((c) => {
        const v = parC[c]; const moy = v ? v.reduce((a, b) => a + b, 0) / v.length : null; const a = moy !== null ? SIP.appreciation(moy) : null;
        return `<div class="comp-ligne"><div><b>${c}</b> ${esc(SIP.COMPETENCES[c].txt)}<div class="discret">${v ? pluriel(v.length, "entraînement") : "pas encore travaillée"}</div></div>
          <div class="comp-jauge"><span class="${a ? a.cls : ""}" style="width:${moy !== null ? (100 * moy) / 20 : 0}%"></span></div>
          <div class="num">${moy !== null ? `<span class="etiquette ${a.cls}">${SIP.nb(moy, 3)}/20</span>` : "—"}</div></div>`;
      }).join("")}</div>`).join("")}`;
  }

  // ---------- Révision hebdomadaire ----------
  async function vueHebdo() {
    $app.innerHTML = `<p class="discret">Chargement…</p>`;
    await chargerEtat();
    const fs = fichesSuivies();
    if (!fs.length) {
      $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Révision de la semaine</h1><div class="carte"><p>La révision porte sur tes fiches. Ajoute d'abord des fiches à la fin d'un entraînement.</p></div>`;
      return;
    }
    const lancer = () => {
      // Priorité : fiches « à revoir », puis les plus récentes, puis les ancrées
      const ordre = SIP.R.melange(fs).sort((a, b) => (a.dernier_su === false ? -1 : 0) - (b.dernier_su === false ? -1 : 0));
      const qs = []; const n = SIP.CFG.questionsRevisionHebdo || 10; let tour = 0;
      while (qs.length < n && tour < 5) {
        ordre.forEach((f) => { const q = (f.contenu.quiz || [])[tour]; if (q && qs.length < n) qs.push({ type: "qcm", enonce: `<span class="etiquette accent">${esc(f.contenu.titre)}</span><br>${q.enonce}`, choix: q.choix, bonne: q.bonne, fiche: f.fiche_id, explication: `Relis la fiche « ${esc(f.contenu.titre)} ».` }); });
        tour++;
      }
      const questions = SIP.R.melange(qs).map((q) => { const o = SIP.R.melange(q.choix.map((_, k) => k)); return Object.assign({}, q, { choix: o.map((k) => q.choix[k]), bonne: o.indexOf(q.bonne) }); });
      serieEnCours = true;
      SIP.lancerSerie($app, {
        titre: "Révision de la semaine", questions,
        surQuitter: () => { serieEnCours = false; location.hash = "#/tableau"; },
        surFin: async (res) => {
          serieEnCours = false;
          const envoye = await ecrire("enregistrer", { module: "revision-hebdo", titre: "Révision de la semaine", type: "revision_hebdo", score: res.score, score_max: res.score_max, duree_s: res.duree_s, details: res.details });
          await chargerEtat();
          vueResultat("Révision de la semaine", res, envoye, [], true);
        }
      });
    };
    $app.innerHTML = `<p><a href="#/tableau">← Retour</a></p><h1>Révision de la semaine</h1>
      <div class="carte ${ETAT.hebdo_fait ? "fait" : "a-faire"}">
        <p>${ETAT.hebdo_fait ? "Tu as déjà fait ta révision cette semaine. Tu peux la refaire (elle sera aussi enregistrée)." : `${SIP.CFG.questionsRevisionHebdo || 10} questions tirées de tes ${pluriel(fs.length, "fiche")}, en priorité celles marquées « à revoir ».`}</p>
        <button class="btn" id="go">${ETAT.hebdo_fait ? "Refaire" : "Commencer"}</button></div>`;
    document.getElementById("go").onclick = lancer;
  }

  // ---------------- Routeur ----------------
  async function router() {
    entete(); banniere();
    const h = location.hash.replace(/^#\/?/, "").split("/");
    const s = SIP.session.get();
    window.scrollTo(0, 0);
    try {
      if (!s) { if (h[0] === "connexion") return vueConnexion(h[1]); return vueAccueil(); }
      switch (h[0]) {
        case "module": return vueModule(h[1]);
        case "fiches": return await vueFichesDuJour();
        case "mes-fiches": return await vueMesFiches();
        case "hebdo": return await vueHebdo();
        case "historique": return await vueHistorique();
        case "competences": return await vueCompetences();
        case "tableau": return await vueTableau();
        default: location.hash = "#/tableau";
      }
    } catch (e) {
      if (e.message !== "SESSION_EXPIREE") { console.error(e); $app.innerHTML = `<p class="erreur">Erreur : ${esc(e.message)}</p><p><a href="#/tableau">Recharger</a></p>`; }
    }
  }
  window.addEventListener("hashchange", router);
  window.addEventListener("beforeunload", (e) => { if (serieEnCours) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("online", () => SIP.viderFile().then(banniere));
  SIP.viderFile().catch(() => {}).then(banniere);
  router();
})(window.SIP);
