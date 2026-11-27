/* =====================================================================
   SI Papara — tableau de bord professeur
   ===================================================================== */
(function (SIP) {
  const $app = document.getElementById("app");
  const esc = SIP.esc;
  let D = null;            // données brutes
  let onglet = "bac";   // l'onglet Bac SI s'ouvre en premier : c'est celui qu'on regarde chaque semaine
  let niveau = (() => { try { return localStorage.getItem("sip_prof_niveau") || ""; } catch (e) { return ""; } })();
  const pct = (s, m) => (m ? Math.round((100 * s) / m) : 0);
  const note20 = (sc, m) => (m ? (SIP.NOTE_MAX * sc) / m : 0);
  const tagNote = (n) => { const a = SIP.appreciation(n); return `<span class="etiquette ${a.cls}" title="${a.txt}">${SIP.nb(n, 3)}/20</span>`; };
  const nbErreurs = (d) => (d.erreurs !== undefined ? d.erreurs : d.pts < 1 ? 1 : 0);
  // moyenne /20 par compétence pour une liste d'entraînements
  function parCompetence(E) {
    const r = {};
    E.filter((t) => !HORS_MOYENNE.has(t.type)).forEach((t) => { const m = SIP.module(t.module); if (!m) return; m.competences.forEach((c) => { (r[c] = r[c] || []).push(note20(t.score, t.score_max)); }); });
    Object.keys(r).forEach((c) => { const v = r[c]; r[c] = { moy: v.reduce((a, b) => a + b, 0) / v.length, n: v.length }; });
    return r;
  }
  const tagPct = (p) => `<span class="etiquette ${p >= 75 ? "ok" : p >= 50 ? "alerte" : "ko"}">${p} %</span>`;
  const LIB = { entrainement: "Entraînement", revision_hebdo: "Révision hebdo", externe: "Exercice externe", revision_jour: "Révision du jour (bac)" };
  const HORS_MOYENNE = new Set(["revision_hebdo", "revision_jour"]);

  document.getElementById("banniere").innerHTML = SIP.api.mode === "demo"
    ? `<div class="demo-banniere">Mode démo : mot de passe prof <b>demo</b>. Les données sont celles des élèves de ce navigateur.</div>` : "";

  // ---------------- Connexion ----------------
  function vueConnexion(msg) {
    document.getElementById("deco").classList.add("cache");
    $app.innerHTML = `<div class="carte" style="max-width:420px;margin:40px auto">
      <h1>Espace professeur</h1>
      <form id="f"><label for="em">E-mail</label><input id="em" type="email" autocomplete="username" ${SIP.api.mode === "demo" ? 'value="prof@demo"' : "required"}>
      <label for="mdp">Mot de passe</label><input id="mdp" type="password" autocomplete="current-password" required>
      <div style="margin-top:16px"><button class="btn">Se connecter</button></div><div class="erreur" id="err">${esc(msg || "")}</div></form></div>`;
    document.getElementById("f").onsubmit = async (e) => {
      e.preventDefault(); const err = document.getElementById("err"); err.textContent = "";
      try { await SIP.api.profConnexion(document.getElementById("em").value, document.getElementById("mdp").value); demarrer(); }
      catch (x) { err.textContent = x.message; }
    };
  }
  document.getElementById("deco").onclick = async () => { await SIP.api.profDeconnexion(); if (SIP.apercu && SIP.apercu.actif()) SIP.apercu.quitter(); D = null; vueConnexion(); };

  async function charger() {
    $app.innerHTML = `<p class="discret">Chargement des données…</p>`;
    D = await SIP.api.profDonnees();
    // « devoir_debut » : témoin de départ d'un devoir noté (pas une note) ; rangé à part, hors du suivi et des moyennes
    D.debuts = D.entrainements.filter((t) => t.type === "devoir_debut");
    D.entrainements = D.entrainements.filter((t) => t.type !== "devoir_debut");
    // « Où chercher ? » : −1,5 point par usage dans l'entraînement E4, appliqué aussi aux notes envoyées avant la règle (25 nov. 2026)
    // ou par une page restée ouverte : leurs questions portent « · indice » sans le drapeau indice. assets/backend.js le fait déjà
    // à la lecture (SIP.malusOu) ; ce filet sert si un ancien backend.js est encore en cache. Le drapeau posé évite tout double malus.
    D.entrainements.forEach((t) => {
      if (t.type !== "externe" || !/^e4-/.test(t.module || "") || !Array.isArray(t.details)) return;
      const n = t.details.filter((q) => !q.indice && / · indice$/.test(String(q.rep || ""))).length;
      if (!n) return;
      const m = Number(t.score_max) || 20;
      t.malusOu = n; t.score = Math.max(0, Number(t.score) - 1.5 * n * m / 20);
      const devoir = /^e4-devoir-/.test(t.module);   // devoirs : pts = points perdus (négatifs) ; ailleurs : part de la question réussie (0 à 1)
      t.details = t.details.map((q) => (!q.indice && / · indice$/.test(String(q.rep || "")) ? Object.assign({}, q, { indice: true }, devoir ? { pts: Math.min(0, Number(q.pts) || 0) - 1.5 } : {}) : q));
    });
    D.parEleve = {};
    D.eleves.forEach((e) => (D.parEleve[e.id] = { e, E: [], F: [], L: [] }));
    D.entrainements.forEach((t) => D.parEleve[t.eleve_id] && D.parEleve[t.eleve_id].E.push(t));
    D.fiches_suivi.forEach((f) => D.parEleve[f.eleve_id] && D.parEleve[f.eleve_id].F.push(f));
    D.lectures.forEach((l) => D.parEleve[l.eleve_id] && D.parEleve[l.eleve_id].L.push(l));
    Object.values(D.parEleve).forEach((x) => x.E.sort((a, b) => b.fait_le.localeCompare(a.fait_le)));
    await chargerSignalements();
  }
  // signalements d'erreurs des élèves (supabase/signalements.sql) : chargés à part, pour que le reste marche sans eux
  async function chargerSignalements() {
    D.signalements = null; D.sigErreur = "";
    try { D.signalements = await SIP.api.profSignalements(); } catch (e) { D.sigErreur = e.message || String(e); }
  }

  // Indicateurs d'un élève
  function stats(x) {
    const auj = SIP.aujourdhui(), il7 = SIP.ajouterJours(auj, -6), lundi = SIP.lundi(auj);
    const tr = x.E.filter((t) => !HORS_MOYENNE.has(t.type));
    const jours7 = new Set(x.L.filter((l) => l.jour >= il7).map((l) => l.jour));
    const semaines = new Set(x.E.filter((t) => t.type === "revision_hebdo").map((t) => SIP.lundi(SIP.jourTahiti(t.fait_le))));
    let hebdo4 = 0; for (let k = 0; k < 4; k++) if (semaines.has(SIP.ajouterJours(lundi, -7 * k))) hebdo4++;
    const fiches = x.F.map((f) => ({ ...f, jour: SIP.joursEntre(f.adoptee_le, auj) + 1 }));
    const actives = fiches.filter((f) => f.jour <= SIP.CYCLE);
    const attendu7 = actives.length ? Math.min(7, Math.max(...actives.map((f) => f.jour))) : 0; // jours de lecture attendus sur 7
    const dates = x.E.map((t) => t.fait_le).concat(x.L.map((l) => l.lu_le));
    return {
      nb: tr.length, nb7: tr.filter((t) => SIP.jourTahiti(t.fait_le) >= il7).length,
      moy: tr.length ? tr.reduce((s, t) => s + note20(t.score, t.score_max), 0) / tr.length : null,
      derniere: dates.sort().pop() || null,
      actives: actives.length, ancrees: fiches.length - actives.length,
      lu7: jours7.size, attendu7, luAuj: jours7.has(auj),
      hebdoSem: semaines.has(lundi), hebdo4
    };
  }

  // ---------------- Cadre ----------------
  function cadre(contenu) {
    const opts = `<option value="">Toutes les classes</option>` + SIP.NIVEAUX.map((n) => `<option value="${n.id}" ${n.id === niveau ? "selected" : ""}>${esc(n.nom)}</option>`).join("");
    $app.innerHTML = `<div class="rang no-print" style="justify-content:space-between">
        <div class="rang"><select id="niv" style="width:auto">${opts}</select>
        <button class="btn sec" id="maj">Actualiser</button></div>
        <button class="btn sec" id="csv">Exporter CSV</button></div>
      <div class="onglets no-print"><button data-o="suivi" class="${onglet === "suivi" ? "actif" : ""}">Suivi</button><button data-o="competences" class="${onglet === "competences" ? "actif" : ""}">Compétences</button><button data-o="bac" class="${onglet === "bac" ? "actif" : ""}">Bac SI</button><button data-o="flashs" class="${onglet === "flashs" ? "actif" : ""}">Flashs</button><button data-o="depannages" class="${onglet === "depannages" ? "actif" : ""}">Dépannages</button><button data-o="devoirs" class="${onglet === "devoirs" ? "actif" : ""}">Devoirs BTS 2</button><button data-o="projets" class="${onglet === "projets" ? "actif" : ""}">Projets BTS 2</button><button data-o="eleves" class="${onglet === "eleves" ? "actif" : ""}">Élèves et codes</button><button data-o="signalements" class="${onglet === "signalements" ? "actif" : ""}">Signalements${nbSigNouveaux() ? ` <span class="sig-pastille">${nbSigNouveaux()}</span>` : ""}</button><button data-o="apercu" class="${onglet === "apercu" ? "actif" : ""}">Aperçu élève</button></div>
      <div id="corps">${contenu}</div>`;
    document.getElementById("niv").onchange = (e) => { niveau = e.target.value; try { localStorage.setItem("sip_prof_niveau", niveau); } catch (x) {} afficher(); };
    document.getElementById("maj").onclick = async () => { await charger(); if (SIP.profProjets) await SIP.profProjets.recharger(); afficher(); };
    document.getElementById("csv").onclick = exporterCSV;
    document.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => { onglet = b.dataset.o; if (onglet === "projets" && SIP.profProjets) SIP.profProjets.fermer(); afficher(); }));
  }
  const elevesFiltres = () => D.eleves.filter((e) => !niveau || e.niveau === niveau).sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom));

  function afficher() { onglet === "eleves" ? vueEleves() : onglet === "competences" ? vueCompetences() : onglet === "bac" ? vueBac() : onglet === "flashs" ? vueFlashs() : onglet === "depannages" ? vueDepannages() : onglet === "devoirs" ? vueDevoirs() : onglet === "projets" ? vueProjets() : onglet === "signalements" ? vueSignalements() : onglet === "apercu" ? vueApercu() : vueSuivi(); }

  // ---------------- Flashs : revoir les copies d'un flash, question par question ----------------
  // Le prof change les points d'une question à la main, ou fait recorriger les réponses par l'IA (fonction « corriger »,
  // sa session prof, sans quota) avec le barème d'aujourd'hui (précisions comprises) ; rien ne part dans la base avant
  // « Enregistrer » (prof_flash_noter, supabase/flash.sql) : la note de la copie est recalculée, l'élève la voit.
  const FL = { module: null, modifs: {}, props: {}, enCours: false, modele: "claude-sonnet-5-5", msg: "", ok: true };
  const EST_FLASH = /^flash-(\d{4}-\d{2}-\d{2})(?:-(\d{1,3}))?$/;
  const jourLongFl = (d) => new Date(d + "T12:00:00-10:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Pacific/Tahiti" });
  const nomDe = (t) => (D.parEleve[t.eleve_id] ? D.parEleve[t.eleve_id].e.nom : "?");
  function seancesFlash() {
    const S = {};
    D.entrainements.forEach((t) => {
      const m = EST_FLASH.exec(t.module || ""); if (!m || !Array.isArray(t.details) || !t.details.length) return;
      const x = D.parEleve[t.eleve_id]; if (!x || (niveau && x.e.niveau !== niveau)) return;
      (S[t.module] = S[t.module] || { module: t.module, jour: m[1], passage: m[2] ? +m[2] : 1, copies: [] }).copies.push(t);
    });
    return Object.values(S).sort((a, b) => b.jour.localeCompare(a.jour) || b.passage - a.passage);
  }
  const modifDe = (t, k) => (FL.modifs[t.id] && FL.modifs[t.id][k]) || null;
  const ptsDe = (t, k) => { const m = modifDe(t, k); return m ? m.pts : Number(t.details[k] && t.details[k].pts) || 0; };
  const totalDe = (t) => t.details.reduce((a, d, k) => a + ptsDe(t, k), 0);
  const baremeDe = (t) => t.details.reduce((a, d) => a + (Number(d.bareme) || 0), 0);
  const nbModifs = () => Object.values(FL.modifs).reduce((a, m) => a + Object.keys(m).length, 0);
  const MARQUE = { present: "✓", partiel: "½", absent: "✗" };
  const marques = (els) => (els || []).map((x) => `<span class="fv ${x.verdict || "nv"}" title="${esc((x.t || "") + (x.raison ? " : " + x.raison : ""))}">${MARQUE[x.verdict] || "?"}</span>`).join("");
  const PAR = { ia: "IA", prof: "toi", eleve: "élève", vide: "" };
  function optionsPts(b, v) {
    const L = []; for (let x = 0; x <= b + 1e-9; x += 0.25) L.push(Math.round(x * 100) / 100);
    if (!L.some((x) => Math.abs(x - v) < 1e-9)) L.push(v);
    return L.sort((a, c) => a - c).map((x) => `<option value="${x}"${Math.abs(x - v) < 1e-9 ? " selected" : ""}>${SIP.nb(x, 3)}</option>`).join("");
  }

  // ---------------- Dépannages de l'atelier schémas (entrainements/schemas.html) ----------------
  // Le prof cache une panne dans un schéma (Fichier → Préparer un dépannage) et donne le lien à la classe : même panne pour tous.
  // Chaque élève connecté envoie un résultat externe de module schemas-prof-<empreinte du lien> ; details[0] porte la note et
  // les champs mesures, mauvaises, abandon, designations. Un élève qui a plusieurs essais (autre appareil…) : le premier compte.
  let depVu = null;
  function depannagesProf() {
    const S = {};
    D.entrainements.forEach((t) => {
      if (t.type !== "externe" || !/^schemas-prof-[\w-]+$/.test(t.module || "")) return;
      const x = D.parEleve[t.eleve_id]; if (!x || (niveau && x.e.niveau !== niveau)) return;
      const s = (S[t.module] = S[t.module] || { module: t.module, titre: t.module, premier: t.fait_le, dernier: "", essais: [] });
      s.essais.push(t);
      if (t.fait_le < s.premier) s.premier = t.fait_le;
      if (t.fait_le > s.dernier) { s.dernier = t.fait_le; s.titre = String(t.titre || "").replace(/^Dépannage · /, "") || t.module; }
    });
    return Object.values(S).sort((a, b) => b.dernier.localeCompare(a.dernier));
  }
  function infoDep(t) {
    const d = (Array.isArray(t.details) && t.details[0]) || {}, m = (Array.isArray(t.details) && t.details[1]) || {};
    const abandon = d.abandon != null ? !!d.abandon : d.rep === "abandon";
    return { note: note20(t.score, t.score_max), abandon, panne: d.attendu || "",
      mesures: d.mesures != null ? Number(d.mesures) : Number((/\((\d+)\)/.exec(m.q || "") || [])[1] || 0),
      mauvaises: d.mauvaises != null ? Number(d.mauvaises) : Math.max(0, (Number(d.erreurs) || 0) - (abandon ? 1 : 0)) };
  }
  function vueDepannages() {
    const S = depannagesProf();
    const aide = `<p class="discret">Pour en préparer un : <a href="entrainements/schemas.html">Atelier schémas</a>, ouvre un exemple ou dessine ton schéma, puis <b>Fichier → Préparer un dépannage (professeur)</b>. Choisis l'élément en panne et donne le lien aux élèves : ils ont tous la même panne, et la note de chaque élève connecté arrive ici.</p>`;
    if (!S.length) return cadre(`<div class="carte"><p>Aucun dépannage rendu${niveau ? " dans cette classe" : ""} pour l'instant.</p>${aide}</div>`);
    if (!S.some((x) => x.module === depVu)) depVu = S[0].module;
    const s = S.find((x) => x.module === depVu);
    const parE = {};
    s.essais.slice().sort((a, b) => a.fait_le.localeCompare(b.fait_le)).forEach((t) => (parE[t.eleve_id] = parE[t.eleve_id] || []).push(t));
    const L = Object.keys(parE).map((id) => ({ e: D.parEleve[id].e, essais: parE[id], i: infoDep(parE[id][0]) })).sort((a, b) => a.e.niveau.localeCompare(b.e.niveau) || a.e.nom.localeCompare(b.e.nom));
    const absents = niveau ? elevesFiltres().filter((e) => e.actif !== false && !parE[e.id]) : [];
    const moy = L.reduce((a, l) => a + l.i.note, 0) / (L.length || 1);
    const med = (v) => { const w = v.slice().sort((a, b) => a - b), k = w.length >> 1; return !w.length ? 0 : w.length % 2 ? w[k] : (w[k - 1] + w[k]) / 2; };
    const duree = (t) => (t.duree_s ? (t.duree_s < 60 ? t.duree_s + " s" : Math.round(t.duree_s / 60) + " min") : "—");
    const nbE = (x) => new Set(x.essais.map((t) => t.eleve_id)).size;
    cadre(`<div class="carte"><div class="rang"><select id="dp-vu" style="width:auto" aria-label="Dépannage">${S.map((x) => `<option value="${esc(x.module)}"${x.module === s.module ? " selected" : ""}>${esc(x.titre)} · ${SIP.fmtDate(x.premier)} · ${nbE(x)} élève${nbE(x) > 1 ? "s" : ""}</option>`).join("")}</select></div>
        ${L[0] && L[0].i.panne ? `<p>Panne cachée : <b>${esc(L[0].i.panne)}</b>.</p>` : ""}${aide}</div>
      <div class="stats">
        <div class="carte"><span class="discret">Ont rendu</span><b>${L.length}${niveau ? ` / ${L.length + absents.length}` : ""}</b></div>
        <div class="carte"><span class="discret">Moyenne</span><b>${SIP.nb(moy, 3)} / 20</b></div>
        <div class="carte"><span class="discret">Mesures (médiane)</span><b>${SIP.nb(med(L.map((l) => l.i.mesures)), 3)}</b></div>
        <div class="carte"><span class="discret">Trouvée du premier coup</span><b>${L.filter((l) => !l.i.abandon && !l.i.mauvaises).length}</b></div>
      </div>
      <div class="table-defil"><table><thead><tr><th>Élève</th>${niveau ? "" : "<th>Classe</th>"}<th class="num">Note</th><th class="num">Mesures</th><th class="num">Mauvaises désignations</th><th class="num">Durée</th><th>Rendu le</th></tr></thead><tbody>${L.map((l) =>
        `<tr class="cliquable" data-id="${esc(l.e.id)}"><td><b>${esc(l.e.nom)}</b>${l.essais.length > 1 ? ` <span class="discret" title="Le premier essai compte. Les autres : ${l.essais.slice(1).map((t) => SIP.nb(note20(t.score, t.score_max), 3) + "/20").join(", ")}">+${l.essais.length - 1} essai${l.essais.length > 2 ? "s" : ""}</span>` : ""}</td>${niveau ? "" : `<td>${esc(SIP.niveau(l.e.niveau).court)}</td>`}
        <td class="num">${l.i.abandon ? `<span class="etiquette ko">abandon</span> ` : ""}${tagNote(l.i.note)}</td><td class="num">${l.i.mesures}</td><td class="num">${l.i.mauvaises}</td><td class="num">${duree(l.essais[0])}</td><td>${SIP.fmtDate(l.essais[0].fait_le, true)}</td></tr>`).join("")}${absents.map((e) =>
        `<tr><td>${esc(e.nom)}</td><td class="discret" colspan="5">pas encore rendu</td></tr>`).join("")}</tbody></table></div>
      <p class="discret">Clique sur un élève pour voir ses mesures et ses désignations. La panne est la même pour toute la classe : une très bonne note avec très peu de mesures, en très peu de temps, mérite une question.</p>`);
    document.getElementById("dp-vu").onchange = (e) => { depVu = e.target.value; vueDepannages(); };
    document.querySelectorAll("tr[data-id]").forEach((tr) => (tr.onclick = () => vueDetail(tr.dataset.id)));
  }

  function vueFlashs() {
    const S = seancesFlash();
    if (!S.length) return cadre(`<div class="carte"><p>Aucune copie de flash${niveau ? " dans cette classe" : ""} pour l'instant.</p></div>`);
    if (!S.some((x) => x.module === FL.module)) FL.module = S[0].module;
    const s = S.find((x) => x.module === FL.module);
    const copies = s.copies.slice().sort((a, b) => nomDe(a).localeCompare(nomDe(b)) || a.fait_le.localeCompare(b.fait_le));
    const ref = copies.reduce((m, t) => (t.details.length > m.details.length ? t : m), copies[0]);
    const nQ = ref.details.length, ks = Array.from({ length: nQ }, (_, k) => k);
    const titre = (x) => `Flash du ${jourLongFl(x.jour)}${x.passage > 1 ? ` · ${x.passage}e passage` : ""}`;
    const moy = (f) => copies.reduce((a, t) => a + note20(f(t), baremeDe(t)), 0) / copies.length;
    const n = nbModifs(), iaOk = !!(SIP.ia && SIP.ia.actif && SIP.ia.actif() && SIP.flash && SIP.flash.questionDeCopie);
    const resume = `<div class="table-defil"><table><thead><tr><th>Élève</th>${ks.map((k) => `<th class="num">Q${k + 1}</th>`).join("")}<th class="num">Note /20</th></tr></thead><tbody>${copies.map((t) => {
      const avant = note20(t.details.reduce((a, d) => a + (Number(d.pts) || 0), 0), baremeDe(t)), apres = note20(totalDe(t), baremeDe(t));
      return `<tr><td>${esc(nomDe(t))}</td>${ks.map((k) => { const d = t.details[k]; if (!d) return `<td class="num">—</td>`; const m = modifDe(t, k);
        return `<td class="num">${m ? `<s class="discret">${SIP.nb(Number(d.pts) || 0, 3)}</s> <b class="fl-modif">${SIP.nb(m.pts, 3)}</b>` : SIP.nb(Number(d.pts) || 0, 3)}<span class="discret"> / ${SIP.nb(Number(d.bareme) || 0, 3)}</span>${d.revu_le ? ` <span class="discret" title="revue le ${esc(SIP.fmtDate(d.revu_le, true))} (${PAR[d.par] || ""})">✎</span>` : ""}</td>`; }).join("")}
        <td class="num">${Math.abs(apres - avant) > 1e-9 ? `<s class="discret">${SIP.nb(avant, 3)}</s> ` : ""}${tagNote(apres)}</td></tr>`; }).join("")}</tbody>
      <tfoot><tr><td><b>Moyenne</b></td>${ks.map(() => "<td></td>").join("")}<td class="num"><b>${SIP.nb(moy(totalDe), 3)}</b></td></tr></tfoot></table></div>`;
    const cartes = ks.map((k) => {
      const d0 = ref.details[k], q = SIP.flash && SIP.flash.questionDeCopie ? SIP.flash.questionDeCopie(d0, s.jour, s.passage) : null;
      const [theme, ...reste] = String(d0.q || "").split(" — "), els = q ? q.elements : (d0.elements || []);
      return `<section class="carte fl-revue"><div class="rang" style="justify-content:space-between;align-items:flex-start">
          <div><div class="eyebrow">Question ${k + 1} · ${esc(theme)}</div><p>${esc(reste.join(" — "))}</p></div>
          ${iaOk ? `<button class="btn sec" data-reco="${k}" ${FL.enCours ? "disabled" : ""}>🤖 Recorriger la question ${k + 1}</button>` : ""}</div>
        <details><summary class="discret">Corrigé et barème</summary><p>${esc(d0.attendu || "")}</p><ul>${els.map((e) => `<li>${esc(e.t)} <span class="discret">(${SIP.nb(e.p, 3)} pt)</span></li>`).join("")}</ul></details>
        <div class="table-defil"><table class="fl-table"><thead><tr><th>Élève</th><th>Réponse</th><th>Correction</th><th class="num">Points</th></tr></thead><tbody>${copies.map((t) => {
          const d = t.details[k]; if (!d) return "";
          const pr = FL.props[t.id] && FL.props[t.id][k], m = modifDe(t, k), v = ptsDe(t, k);
          const corr = pr ? `<div>${marques(pr.elements)} <span class="discret">nouvelle correction${Math.abs(pr.pts - (Number(d.pts) || 0)) > 1e-9 ? ` : ${SIP.nb(Number(d.pts) || 0, 3)} → <b>${SIP.nb(pr.pts, 3)}</b>` : " : même note"}</span></div>
              <ul class="fl-raisons">${pr.elements.map((x) => `<li><span class="fv ${x.verdict}">${MARQUE[x.verdict]}</span> ${esc(x.raison || "")}</li>`).join("")}</ul>`
            : `${marques(d.elements)} <span class="discret">${esc(PAR[d.par] || d.par || "")}${d.revu_le ? " · revue" : ""}</span>`;
          return `<tr${m ? ' class="fl-modifiee"' : ""}><td>${esc(nomDe(t))}</td><td class="fl-rep-prof">${d.rep ? esc(d.rep) : '<span class="discret">pas de réponse</span>'}</td><td>${corr}</td>
            <td class="num" style="white-space:nowrap"><select style="width:auto" data-id="${t.id}" data-k="${k}" aria-label="Points de ${esc(nomDe(t))}, question ${k + 1}" ${FL.enCours ? "disabled" : ""}>${optionsPts(Number(d.bareme) || 0, v)}</select><span class="discret"> / ${SIP.nb(Number(d.bareme) || 0, 3)}</span></td></tr>`;
        }).join("")}</tbody></table></div></section>`;
    }).join("");
    cadre(`<div class="carte"><div class="rang" style="justify-content:space-between">
        <div class="rang"><select id="fl-sean" style="width:auto">${S.map((x) => `<option value="${esc(x.module)}"${x.module === s.module ? " selected" : ""}>${esc(titre(x))} · ${x.copies.length} copie${x.copies.length > 1 ? "s" : ""}</option>`).join("")}</select>
          <span class="discret">moyenne ${SIP.nb(moy(totalDe), 3)}/20</span></div>
        <div class="rang">${iaOk ? `<select id="fl-modele" style="width:auto" title="Le modèle qui recorrige"><option value="claude-sonnet-5-5"${FL.modele === "claude-sonnet-5-5" ? " selected" : ""}>Claude Sonnet</option><option value="claude-opus-5-5"${FL.modele === "claude-opus-5-5" ? " selected" : ""}>Claude Opus (plus fin, 2 fois plus cher)</option></select>
          <button class="btn sec" id="fl-reco" ${FL.enCours ? "disabled" : ""}>🤖 Recorriger tout le flash</button>` : ""}
          <button class="btn" id="fl-enr" ${n && !FL.enCours ? "" : "disabled"}>Enregistrer${n ? ` (${n})` : ""}</button>${n ? ` <button class="btn-lien" id="fl-ann" ${FL.enCours ? "disabled" : ""}>Annuler</button>` : ""}</div></div>
      <p class="discret">Change les points d'une question avec sa liste, ou fais recorriger par l'IA avec le barème d'aujourd'hui : rien ne part avant « Enregistrer ». La note de la copie est alors recalculée ; l'élève la voit sur son flash (« note revue par le prof »).</p>
      <p id="fl-prog" class="${FL.ok ? "ok-txt" : "erreur"}" aria-live="polite">${esc(FL.msg)}</p></div>
      ${resume}${cartes}`);
    document.getElementById("fl-sean").onchange = (e) => { FL.module = e.target.value; FL.props = {}; FL.msg = ""; vueFlashs(); };
    const mo = document.getElementById("fl-modele"); if (mo) mo.onchange = (e) => (FL.modele = e.target.value);
    const rc = document.getElementById("fl-reco"); if (rc) rc.onclick = () => recorriger(s, copies, ks);
    document.querySelectorAll("[data-reco]").forEach((b) => (b.onclick = () => recorriger(s, copies, [+b.dataset.reco])));
    const en = document.getElementById("fl-enr"); if (en) en.onclick = enregistrerFlash;
    const an = document.getElementById("fl-ann"); if (an) an.onclick = () => { FL.modifs = {}; FL.msg = "Changements annulés."; FL.ok = true; vueFlashs(); };
    document.querySelectorAll(".fl-table select[data-id]").forEach((sel) => (sel.onchange = () => {
      const t = copies.find((x) => String(x.id) === sel.dataset.id), k = +sel.dataset.k, v = Number(sel.value);
      if (!t) return;
      const ancien = Number(t.details[k].pts) || 0, pr = FL.props[t.id] && FL.props[t.id][k];
      FL.modifs[t.id] = FL.modifs[t.id] || {};
      if (Math.abs(v - ancien) < 1e-9) delete FL.modifs[t.id][k];
      else FL.modifs[t.id][k] = pr && Math.abs(pr.pts - v) < 1e-9 ? { pts: v, par: "ia", elements: pr.elements } : { pts: v, par: "prof" };
      FL.msg = ""; vueFlashs();
    }));
  }

  // recorrection par l'IA : les réponses des copies, questions ks, 3 à la fois ; propositions affichées, pas enregistrées
  async function recorriger(s, copies, ks) {
    if (FL.enCours) return;
    const taches = []; copies.forEach((t) => ks.forEach((k) => { if (t.details[k]) taches.push({ t, k }); }));
    FL.enCours = true; FL.ok = true; let fait = 0, ko = 0, change = 0; const codes = new Set();
    const dire = () => { const z = document.getElementById("fl-prog"); if (z) z.textContent = `Recorrection par l'IA : ${fait} / ${taches.length}${ko ? ` · ${ko} sans réponse` : ""}…`; };
    FL.msg = ""; vueFlashs(); dire();
    const une = async ({ t, k }) => {
      const d = t.details[k], q = SIP.flash.questionDeCopie(d, s.jour, s.passage);
      const elements = q ? q.elements.map((e, i) => ({ i, t: e.t, p: e.p, aide: e.aide || "" })) : (d.elements || []).map((e, i) => ({ i, t: e.t, p: e.p }));
      const rep = String(d.rep || "").replace(/\s*\[auto-évaluée\]$/, "").trim();
      let verdicts;
      if (!rep) verdicts = elements.map((e) => ({ i: e.i, verdict: "absent", raison: "Pas de réponse." }));
      else {
        try {
          const r = await SIP.ia.corrigerProf({ question: q ? q.ia || SIP.flash.brut(q.enonce) : String(d.q || ""), corrige: q ? SIP.flash.brut(q.corrige) : String(d.attendu || ""),
            regles: SIP.flash.REGLES_IA, elements, reponse: rep.slice(0, 2000), modele: FL.modele });
          verdicts = r.elements;
        } catch (e) { ko++; codes.add(e.code || e.message || "IA"); fait++; dire(); return; }
      }
      const parI = {}; (verdicts || []).forEach((v) => (parI[v.i] = v));
      if (!elements.length || !elements.every((e) => parI[e.i])) { ko++; fait++; dire(); return; }
      const pts = elements.reduce((a, e) => a + SIP.flash.POIDS[parI[e.i].verdict] * e.p, 0);
      const els = elements.map((e) => ({ t: e.t, p: e.p, verdict: parI[e.i].verdict, par: "ia", raison: parI[e.i].raison || "" }));
      (FL.props[t.id] = FL.props[t.id] || {})[k] = { pts, elements: els };
      FL.modifs[t.id] = FL.modifs[t.id] || {};
      if (Math.abs(pts - (Number(d.pts) || 0)) > 1e-9) { FL.modifs[t.id][k] = { pts, par: "ia", elements: els }; change++; } else delete FL.modifs[t.id][k];
      fait++; dire();
    };
    let i = 0;
    await Promise.all([0, 1, 2].map(async () => { while (i < taches.length) await une(taches[i++]); }));
    FL.enCours = false; FL.ok = !ko;
    FL.msg = `Recorrection finie : ${fait - ko} réponse(s) relue(s), ${change} note(s) de question changée(s)${ko ? `, ${ko} sans réponse de l'IA (${[...codes].join(", ")}) : garde l'ancienne note ou change-la à la main` : ""}. Vérifie les propositions, puis « Enregistrer ».`;
    vueFlashs();
  }

  async function enregistrerFlash() {
    const ids = Object.keys(FL.modifs).filter((id) => Object.keys(FL.modifs[id]).length);
    if (!ids.length || FL.enCours) return;
    FL.enCours = true; FL.msg = "Enregistrement…"; vueFlashs();
    let ok = 0; const erreurs = [];
    for (const id of ids) {
      const t = D.entrainements.find((x) => String(x.id) === String(id)); if (!t) continue;
      const points = Object.entries(FL.modifs[id]).map(([k, m]) => Object.assign({ k: +k, pts: m.pts, par: m.par },
        m.elements ? { elements: m.elements.map((e) => ({ t: e.t, p: e.p, verdict: e.verdict, par: e.par })) } : {}));
      try {
        const r = await SIP.api.profFlashNoter(t.id, points);
        if (r && Array.isArray(r.details)) t.details = r.details;
        if (r && r.score != null) { t.score = Number(r.score); t.score_max = Number(r.score_max); }
        delete FL.modifs[id]; ok++;
      } catch (e) { erreurs.push(e.message || String(e)); }
    }
    FL.enCours = false; FL.ok = !erreurs.length;
    FL.msg = erreurs.length ? `${ok} copie(s) enregistrée(s), ${erreurs.length} refusée(s) : ${erreurs[0]}${/prof_flash_noter|PGRST202|Could not find|schema cache/i.test(erreurs[0]) ? " (la base n'a pas encore la fonction : supabase/flash.sql à installer)" : ""}`
      : `✓ ${ok} copie(s) enregistrée(s) : les notes sont à jour dans le suivi, l'export CSV et chez les élèves.`;
    vueFlashs();
  }

  // ---------------- Projets BTS 2 (assets/prof-projets.js, contenu/projets-bts2.js) ----------------
  function vueProjets() {
    if (!SIP.profProjets) return cadre(`<div class="carte"><p>Les fichiers des projets (contenu/projets-bts2.js, assets/prof-projets.js) ne sont pas chargés.</p></div>`);
    SIP.profProjets.afficher({ cadre, D, niveau });
  }

  // ---------------- Signalements d'erreurs ----------------
  const sigDuNiveau = () => (D.signalements || []).filter((x) => !niveau || x.niveau === niveau);
  const nbSigNouveaux = () => (D && D.signalements ? sigDuNiveau().filter((x) => x.statut === "nouveau").length : 0);
  const SIG_SOURCE = { serie: "Série notée", parcours: "Parcours", blanc: "Sujet blanc", observe: "Observe et réponds", verif: "Vérifie que tu as compris", autre: "Autre" };
  const SIG_MOTIF = { juste: "Ma réponse est juste, mais elle a été comptée fausse", correction: "La réponse attendue ou la correction est fausse",
    enonce: "L'énoncé n'est pas clair, ou il manque une donnée", figure: "La figure ne correspond pas à l'énoncé", autre: "Autre chose" };
  const SIG_STATUT = { nouveau: ["alerte", "à traiter"], corrige: ["ok", "erreur confirmée"], rejete: ["", "pas d'erreur"] };
  let filtreSig = "nouveau";
  const notionLab = (id) => { const n = id && BAC && BAC.notions.find((x) => x.id === id); return n ? n.lab : id || "—"; };
  // la figure de la question, en image : un SVG dans une balise <img> n'exécute rien (le texte vient d'un élève)
  function apercuFigure(svg) {
    try {
      const doc = new DOMParser().parseFromString(`<!doctype html><body>${svg}</body>`, "text/html");
      const el = doc.querySelector("svg"); if (!el) return "";
      el.querySelectorAll("script,foreignObject,iframe,image,a").forEach((n) => n.remove());
      [el, ...el.querySelectorAll("*")].forEach((n) => [...n.attributes].forEach((a) => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); }));
      const F = SIP.FIG_APERCU || { css: "", defs: "" };
      const st = doc.createElementNS("http://www.w3.org/2000/svg", "style"); st.textContent = F.css; el.insertBefore(st, el.firstChild);
      if (F.defs) {
        const d = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${F.defs}</svg>`, "image/svg+xml").documentElement.firstElementChild;
        if (d) el.insertBefore(doc.importNode(d, true), st.nextSibling);
      }
      if (!el.getAttribute("width")) { const vb = (el.getAttribute("viewBox") || "0 0 400 200").split(/[\s,]+/).map(Number); el.setAttribute("width", vb[2] || 400); el.setAttribute("height", vb[3] || 200); }
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(el));
    } catch (e) { return ""; }
  }
  const texteSignalement = (x, e) => [
    `Signalement n° ${x.id} · ${SIG_SOURCE[x.source] || x.source} · ${notionLab(x.notion)}${x.ref ? ` · réf. ${x.ref}` : ""}${x.module ? ` · ${x.module}` : ""}`,
    `Élève : ${e ? e.nom : "?"} · ${SIP.fmtDate(x.cree_le, true)}`,
    `Motif : ${SIG_MOTIF[x.motif] || x.motif}${x.commentaire ? ` — « ${x.commentaire} »` : ""}`,
    `Question :\n${x.question}`, `Réponse de l'élève : ${x.reponse || "—"}`, `Réponse attendue : ${x.attendu || "—"}`, x.correction ? `Correction affichée : ${x.correction}` : ""
  ].filter(Boolean).join("\n");
  function vueSignalements() {
    if (D.signalements === null) {
      const absente = /signalements|schema cache|does not exist|relation/i.test(D.sigErreur);
      return cadre(`<div class="carte"><h2 style="margin-top:0">Signalements d'erreurs</h2>
        ${absente ? `<p><b>Pas encore activés.</b> Dans Supabase : <b>SQL Editor → New query</b>, colle tout le fichier <code>supabase/signalements.sql</code>, puis <b>Run</b>. Reviens ensuite ici et clique sur « Actualiser ».</p>`
          : `<p>Les signalements n'ont pas pu être chargés.</p>`}<p class="discret">${esc(D.sigErreur)}</p></div>`);
    }
    const L = sigDuNiveau(), compte = (f) => L.filter((x) => (f === "tous" ? true : f === "traite" ? x.statut !== "nouveau" : x.statut === f)).length;
    const liste = L.filter((x) => (filtreSig === "tous" ? true : filtreSig === "traite" ? x.statut !== "nouveau" : x.statut === filtreSig));
    const seuil = (BAC && BAC.seuil) || 16;
    const carte = (x) => {
      const e = D.parEleve[x.eleve_id] && D.parEleve[x.eleve_id].e, [cls, lib] = SIG_STATUT[x.statut] || ["", x.statut];
      const fig = x.figure ? apercuFigure(x.figure) : "", serie = x.source === "serie" && /^bac-/.test(x.module || "");
      return `<article class="carte sig-carte ${x.statut}" data-sig="${x.id}">
        <div class="sig-h"><span class="etiquette ${cls}">${lib}</span> <b>${esc(e ? e.nom : "élève supprimé")}</b>
          <span class="discret">${esc((SIP.niveau(x.niveau) || {}).court || x.niveau)} · ${SIP.fmtDate(x.cree_le, true)}</span></div>
        <div class="sig-quoi">${esc(SIG_SOURCE[x.source] || x.source)} · <b>${esc(notionLab(x.notion))}</b>${x.ref ? ` · <code title="Référence de la question : générateur (clé:niveau:n°) ou numéro de la question">${esc(x.ref)}</code>` : ""}</div>
        <p class="sig-motif">« ${esc(SIG_MOTIF[x.motif] || x.motif)} »${x.commentaire ? `<br><span class="sig-com">${esc(x.commentaire)}</span>` : ""}</p>
        <details${x.statut === "nouveau" ? " open" : ""}><summary>La question, telle que l'élève l'a eue</summary>
          <div class="sig-q">${esc(x.question)}</div>
          ${fig ? `<img class="sig-fig" alt="Figure de la question" src="${fig}">` : ""}
          <dl class="sig-rep"><dt>Réponse de l'élève</dt><dd>${esc(x.reponse || "—")}</dd><dt>Réponse attendue</dt><dd>${esc(x.attendu || "—")}</dd></dl>
          ${x.correction ? `<p class="sig-corr"><b>Correction affichée :</b> ${esc(x.correction)}</p>` : ""}
        </details>
        <div class="rang sig-act no-print">
          ${x.statut !== "corrige" ? `<button class="btn sec" type="button" data-statut="corrige">Erreur confirmée</button>` : ""}
          ${x.statut !== "rejete" ? `<button class="btn sec" type="button" data-statut="rejete">Pas d'erreur</button>` : ""}
          ${x.statut !== "nouveau" ? `<button class="btn-lien" type="button" data-statut="nouveau">Remettre « à traiter »</button>` : ""}
          ${serie ? (x.valide_serie ? `<span class="etiquette ok">série validée (${seuil}/20)</span>`
            : `<button class="btn" type="button" data-valider title="Si l'erreur lui a coûté la validation : la série lui est comptée ${seuil}/20, à la date du signalement">Valider sa série</button>`) : ""}
          <button class="btn-lien" type="button" data-copier>Copier le signalement</button>
        </div></article>`;
    };
    cadre(`<p class="discret">Les élèves signalent ici les questions qu'ils croient fausses, avec la question telle qu'ils l'ont eue (valeurs comprises).
        <b>Erreur confirmée</b> : la question est fausse, elle sera corrigée (« Copier le signalement » le met dans le presse-papiers, prêt à transmettre).
        <b>Pas d'erreur</b> : la question est juste. <b>Valider sa série</b> : si l'erreur a coûté la validation à l'élève, la série lui est comptée ${seuil}/20 à la date du signalement.</p>
      <div class="rang no-print sig-filtres">${[["nouveau", "À traiter"], ["traite", "Traités"], ["tous", "Tous"]].map(([f, t]) =>
        `<button class="btn ${filtreSig === f ? "" : "sec"}" type="button" data-filtre="${f}">${t} (${compte(f)})</button>`).join("")}</div>
      ${liste.length ? `<div class="sig-liste">${liste.map(carte).join("")}</div>`
        : `<div class="carte"><p>${filtreSig === "nouveau" ? "Aucun signalement à traiter." : "Aucun signalement."}</p></div>`}`);
    document.querySelectorAll("[data-filtre]").forEach((b) => (b.onclick = () => { filtreSig = b.dataset.filtre; vueSignalements(); }));
    document.querySelectorAll(".sig-carte").forEach((c) => {
      const id = +c.dataset.sig, x = D.signalements.find((r) => r.id === id);
      const occupe = (on) => c.querySelectorAll("button").forEach((b) => (b.disabled = on));
      c.querySelectorAll("[data-statut]").forEach((b) => (b.onclick = async () => {
        occupe(true);
        try { await SIP.api.traiterSignalement(id, b.dataset.statut); x.statut = b.dataset.statut; x.traite_le = new Date().toISOString(); vueSignalements(); }
        catch (e) { occupe(false); alert("Impossible : " + e.message); }
      }));
      const v = c.querySelector("[data-valider]");
      if (v) v.onclick = async () => {
        occupe(true);
        try { await SIP.api.validerSignalement(id, seuil); await charger(); vueSignalements(); }
        catch (e) { occupe(false); alert("Impossible : " + e.message); }
      };
      const cp = c.querySelector("[data-copier]");
      if (cp) cp.onclick = async () => {
        const t = texteSignalement(x, D.parEleve[x.eleve_id] && D.parEleve[x.eleve_id].e);
        try { await navigator.clipboard.writeText(t); cp.textContent = "Copié ✓"; }
        catch (e) { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); cp.textContent = "Copié ✓"; } catch (x2) { cp.textContent = "Copie impossible"; } ta.remove(); }
        setTimeout(() => (cp.textContent = "Copier le signalement"), 2500);
      };
    });
  }

  // ---------------- DS blancs : le prof les fait lui-même, en aperçu professeur (rien n'est transmis) ----------------
  // Lien entrainements/ds-blanc.html?prof#dsXX : la page vérifie l'accès prof, passe en aperçu Terminale SI,
  // et l'IA vérifie les rédactions avec la session prof de ce navigateur.
  const lienDSB = (b) => `entrainements/ds-blanc.html?prof#${encodeURIComponent(b.id)}`;
  function blocDSBlancs(compact) {
    const L = (SIP.DS_BLANCS || []).slice().reverse();   // le plus récent (le prochain DS) en premier
    if (!L.length) return "";
    if (compact) return `<div class="carte rang no-print" style="align-items:center;gap:10px;flex-wrap:wrap"><b>Faire un DS blanc moi-même</b>
      ${L.map((b, i) => `<a class="btn${i ? " sec" : ""}" href="${lienDSB(b)}" target="_blank" rel="noopener">${esc(b.ds)} blanc ↗</a>`).join("")}
      <span class="discret">aperçu professeur : rien n'est transmis</span></div>`;
    return `<section class="carte"><div class="eyebrow">Terminale SI</div><h2>Faire un DS blanc moi-même</h2>
      <p class="discret">Le DS blanc s'ouvre comme pour un élève de Terminale SI, en aperçu professeur : question par question, en conditions de DS (chrono) ou à ton rythme, avec la correction, le barème et la vérification par l'IA des réponses rédigées. <b>Rien n'est transmis</b> : tes essais restent dans ce navigateur et n'apparaissent pas dans le suivi des élèves.</p>
      <div class="grille">${L.map((b) => `<div class="carte tuile"><div class="discret">${esc(b.ds)} · ${b.duree_min} min</div><h3>${esc(b.titre)}</h3>
        <a class="btn" style="margin-top:auto" href="${lienDSB(b)}" target="_blank" rel="noopener">Faire le DS blanc ↗</a></div>`).join("")}</div></section>`;
  }

  // ---------------- Aperçu élève : le site tel que le voit chaque filière, sans compte élève ----------------
  function vueApercu() {
    const extra = { TSI: "Tableau de bord tourné vers le bac : prochain DS, fiches, séries notées, sujet blanc.", "BTS2-STI": "Avec l'entraînement E4 (sujets d'annales, auto-évaluation N0–N3) et la page « Mon projet » (dossiers 1-2-3).", "BTS2-ADM": "Avec l'entraînement E4 (sujets d'annales, auto-évaluation N0–N3) et la page « Mon projet » (dossiers 1-2-3)." };
    cadre(blocDSBlancs() + `<p class="discret">Ouvre le site élève comme un élève de la filière choisie, sans identifiant. Tout fonctionne (séries, fiches du jour, révision de la semaine, bac SI, E4) mais <b>rien n'est transmis</b> : tes essais restent dans ce navigateur et n'apparaissent ni dans le suivi ni dans les grilles. Dans l'aperçu, un bandeau permet de changer de filière, d'effacer tes essais ou de quitter.</p>
      <div class="grille">${SIP.NIVEAUX.map((n) => `<div class="carte tuile"><div class="discret">${esc(n.groupe)}</div><h3>${esc(n.nom)}</h3>
        ${n.desc ? `<div class="discret">${esc(n.desc)}</div>` : ""}${extra[n.id] ? `<div class="discret">${esc(extra[n.id])}</div>` : ""}<span class="etiquette" style="margin:6px 0 12px">${SIP.modulesDu(n.id).length} modules</span>
        <a class="btn" style="margin-top:auto" href="index.html#/apercu/${n.id}" target="_blank" rel="noopener">Ouvrir l'aperçu ↗</a></div>`).join("")}</div>`);
  }

  // ---------------- Grille de compétences de la classe ----------------
  function vueCompetences() {
    if (!niveau) return cadre(`<div class="carte"><p>Choisis une classe en haut pour afficher sa grille de compétences.</p></div>`);
    const codes = [...new Set(SIP.modulesDu(niveau).flatMap((m) => m.competences))].filter((c) => SIP.COMPETENCES[c]).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
    if (!codes.length) return cadre(`<div class="carte"><p>Les modules de cette classe ne sont pas encore rattachés aux compétences du programme de SI.</p></div>`);
    const liste = elevesFiltres().filter((e) => e.actif !== false);
    const pcs = liste.map((e) => parCompetence(D.parEleve[e.id].E));
    const cell = (v) => v ? `<td class="num">${tagNote(v.moy)}<div class="discret">${v.n}×</div></td>` : `<td class="num discret">—</td>`;
    const classe = codes.map((c) => { const v = pcs.map((p) => p[c]).filter(Boolean); return v.length ? { moy: v.reduce((a, b) => a + b.moy, 0) / v.length, n: v.length } : null; });
    cadre(`<p class="discret">Moyenne des notes /20 de chaque élève dans les entraînements rattachés à chaque compétence (sous la note : nombre d'entraînements). Survole un code pour son intitulé.</p>
      <div class="table-defil figee"><table class="fige"><thead><tr><th>Élève</th>${codes.map((c) => `<th class="num" title="${esc(SIP.COMPETENCES[c].dom + " — " + SIP.COMPETENCES[c].txt)}">${c}</th>`).join("")}</tr></thead><tbody>
      ${liste.map((e, i) => `<tr class="cliquable" data-id="${e.id}" title="${esc(e.nom)}"><td><b>${esc(e.nom)}</b></td>${codes.map((c) => cell(pcs[i][c])).join("")}</tr>`).join("")}
      <tr><td><b>Classe</b></td>${classe.map((v) => v ? `<td class="num">${tagNote(v.moy)}<div class="discret">${v.n} él.</div></td>` : `<td class="num discret">—</td>`).join("")}</tr>
      </tbody></table></div>
      <h2>Légende</h2><div class="carte"><ul>${codes.map((c) => `<li><b>${c}</b> (${esc(SIP.COMPETENCES[c].dom)}, ${esc(SIP.COMPETENCES[c].classe)}) — ${esc(SIP.COMPETENCES[c].txt)}</li>`).join("")}</ul></div>`);
    document.querySelectorAll("tr[data-id]").forEach((tr) => (tr.onclick = () => vueDetail(tr.dataset.id)));
  }


  // ---------------- Bac SI : une série à 16/20 avant le DS de chaque notion ----------------
  const BAC = SIP.BAC || { notions: [], seuil: 16 };
  const notionDe = (m) => m.replace(/^bac-/, "").replace(/-s\d+$/, "");
  const court = (lab) => lab.split(/,| \(|:/)[0];
  const quand = (t) => Date.parse(t.recu_le || t.fait_le);
  function bacGrille() {
    const now = Date.now(), auj = SIP.aujourdhui(), dans7 = SIP.ajouterJours(auj, 7), il7 = SIP.ajouterJours(auj, -6);
    // colonnes : les notions déjà vues ou vues dans la semaine, dans l'ordre de leurs échéances
    const cols = BAC.notions.filter((n) => n.echeance && n.cours && n.cours <= dans7)
      .sort((a, b) => a.echeance.localeCompare(b.echeance) || a.rang - b.rang);
    // les DS de ces notions, avec leurs étapes de préparation (trois si une notion est en ligne ou si contenu/prep-ds.js le décrit)
    const dsList = [];
    const dsbPas = (t) => /\(question par question\)\s*$/.test(t.titre || "");   // DS blanc fait question par question (corrigé après chaque question)
    cols.forEach((n) => { if (!n.ds || dsList.some((d) => d.ds === n.ds)) return;
      const id = n.ds.toLowerCase().replace(/\s+/g, ""), def = (window.SIP_PREP || {})[id], lot = BAC.notions.filter((x) => x.ds === n.ds);
      const trois = lot.some((x) => x.enLigne) || !!(def && def.etapes && def.etapes.length);
      const blanc = (SIP.DS_BLANCS || []).find((b) => b.ds === n.ds) || null;
      if (trois || blanc) dsList.push({ ds: n.ds, id, date: n.ds_date, echeance: n.echeance, etapes: trois ? [1, 2, 3] : [], blanc }); });
    const liste = elevesFiltres().filter((e) => e.actif !== false && e.niveau === "TSI");
    const lignes = liste.map((e) => {
      const E = D.parEleve[e.id].E;
      const bac = E.filter((t) => t.type === "externe" && /^bac-/.test(t.module) && !/^bac-(parcours|revision|blanc)$/.test(t.module));
      const best = (a) => (a.length ? Math.max(...a.map((t) => note20(t.score, t.score_max))) : null);
      // préparation des DS (contenu/prep-ds.js) : par DS, les étapes validées à 16/20 avant l'échéance, et le DS blanc
      const preps = dsList.map((d) => ({ ds: d, etapes: d.etapes.map((k) => {
        const ts = E.filter((t) => t.type === "externe" && t.module === `prep-${d.id}-${k}`), lim = Date.parse(d.echeance);
        const b = best(ts.filter((t) => quand(t) <= lim)), a = best(ts.filter((t) => quand(t) > lim));
        return { k, b, a, n: ts.length, ok: b !== null && b >= BAC.seuil }; }),
        blanc: d.blanc ? (() => { const ts = E.filter((t) => t.type === "externe" && t.module === d.blanc.module), dsT = ts.filter((t) => !dsbPas(t)), qT = ts.filter(dsbPas);
          return { n: dsT.length, b: best(dsT), nq: qT.length, q: best(qT) }; })() : null }));
      const prepOK = (ds) => { const p = preps.find((x) => x.ds.ds === ds); return !!(p && p.etapes.length && p.etapes.every((x) => x.ok)); };
      const cells = cols.map((n) => {
        const ts = bac.filter((t) => notionDe(t.module) === n.id), lim = Date.parse(n.echeance);
        const b = best(ts.filter((t) => quand(t) <= lim)), a = best(ts.filter((t) => quand(t) > lim));
        const f = best(E.filter((t) => t.type === "externe" && t.module === "fiche-" + n.id)); // vérification de la fiche (« Ai-je compris ? »)
        const pv = prepOK(n.ds);   // les trois étapes de la préparation du DS validées à temps : la notion est validée aussi
        return { b, a, n: ts.length, passe: now > lim, ok: (b !== null && b >= BAC.seuil) || pv, pv, f };
      });
      const echues = cells.filter((c) => c.passe), valides = echues.filter((c) => c.ok).length;
      const rev = E.filter((t) => t.type === "revision_jour");
      const jours7 = new Set(rev.filter((t) => SIP.jourTahiti(t.fait_le) >= il7).map((t) => SIP.jourTahiti(t.fait_le))).size;
      const parcours = E.filter((t) => t.module === "bac-parcours" && SIP.jourTahiti(t.fait_le) >= il7).length;
      const blancs = E.filter((t) => t.module === "bac-blanc").sort((a, b) => quand(b) - quand(a));
      const blanc = blancs.length ? { dernier: note20(blancs[0].score, blancs[0].score_max), le: blancs[0].fait_le, meilleur: Math.max(...blancs.map((t) => note20(t.score, t.score_max))), n: blancs.length } : null;
      const dsbs = E.filter((t) => t.type === "externe" && /^dsb-/.test(t.module)).sort((a, b) => quand(b) - quand(a));
      const dsb = dsbs.length ? { dernier: note20(dsbs[0].score, dsbs[0].score_max), le: dsbs[0].fait_le, ds: dsbs[0].module.replace(/^dsb-ds(\d+)$/, "DS $1"), pas: dsbPas(dsbs[0]), meilleur: Math.max(...dsbs.filter((t) => t.module === dsbs[0].module).map((t) => note20(t.score, t.score_max))), n: dsbs.filter((t) => t.module === dsbs[0].module).length } : null;
      // flashs du début de séance (assets/flash.js) : un essai par flash, module flash-AAAA-MM-JJ (flash-AAAA-MM-JJ-<n> : n-ième passage du jour, relancé avec d'autres valeurs)
      const passage = (m) => +(m.slice(17) || 1);
      const fls = E.filter((t) => /^flash-\d{4}-\d{2}-\d{2}(-\d{1,3})?$/.test(t.module)).sort((a, b) => b.module.slice(6, 16).localeCompare(a.module.slice(6, 16)) || passage(b.module) - passage(a.module) || quand(b) - quand(a));
      const flash = fls.length ? { dernier: note20(fls[0].score, fls[0].score_max), le: fls[0].module.slice(6, 16), n: new Set(fls.map((t) => t.module)).size,
        moy: (() => { const m = {}; fls.forEach((t) => { if (!(t.module in m)) m[t.module] = note20(t.score, t.score_max); }); const v = Object.values(m); return v.reduce((a, x) => a + x, 0) / v.length; })() } : null;
      return { e, cells, valides, echues: echues.length, note10: echues.length ? (10 * valides) / echues.length : null, jours7, parcours, blanc, dsb, preps, flash };
    });
    return { cols, lignes, dsList };
  }
  function vueBac() {
    if (niveau && niveau !== "TSI") return cadre(`<div class="carte"><p>L'entraînement bac SI concerne la Terminale SI : choisis « Terminale SI » en haut.</p></div>`);
    const { cols, lignes, dsList } = bacGrille();
    if (!lignes.length) return cadre(`<div class="carte"><p>Aucun élève de Terminale SI. Crée-les dans l'onglet « Élèves et codes ».</p></div>`);
    // préparation d'un DS : une pastille par étape (E1 E2 E3, puis DSb), note avant l'échéance, « après » sinon
    const prep = (p) => `<td class="num prep-cell">${p.etapes.map((x) => x.b !== null ? `<span class="etiquette ${x.ok ? "ok" : "alerte"}" title="Étape ${x.k} : meilleure note avant l'échéance, ${x.n} essai${x.n > 1 ? "s" : ""}">E${x.k} ${x.ok ? "✓" : ""}${SIP.nb(x.b, 3)}</span>`
        : x.a !== null ? `<span class="etiquette ko" title="Étape ${x.k} : faite après l'échéance">E${x.k} après ${SIP.nb(x.a, 3)}</span>` : `<span class="etiquette" title="Étape ${x.k} : pas faite">E${x.k} —</span>`).join(" ")}${p.blanc ? ` <span class="etiquette ${p.blanc.n ? SIP.appreciation(p.blanc.b).cls : ""}" title="DS blanc en conditions de DS ou à son rythme : meilleure note, ${p.blanc.n} essai${p.blanc.n > 1 ? "s" : ""}">DSb ${p.blanc.n ? SIP.nb(p.blanc.b, 3) : "—"}</span>` + (p.blanc.nq ? ` <span class="etiquette ${SIP.appreciation(p.blanc.q).cls}" title="DS blanc question par question (corrigé après chaque question) : meilleure note, ${p.blanc.nq} essai${p.blanc.nq > 1 ? "s" : ""}">q/q ${SIP.nb(p.blanc.q, 3)}</span>` : "") : ""}</td>`;
    const tetePrep = dsList.map((d) => `<th class="num" title="Préparation du ${esc(d.ds)} : trois étapes validées à ${BAC.seuil}/20 avant le ${SIP.fmtDate(d.date)} 6 h, puis le DS blanc">Préparation<div class="discret">${esc(d.ds)} · ${SIP.fmtDate(d.date)}</div></th>`).join("");
    const fiche = (c) => (c.f !== null ? `<div class="discret" title="Meilleure note à la vérification de la fiche">fiche ${c.f >= 16 ? "✓ " : ""}${SIP.nb(c.f, 3)}</div>` : "");
    const cell = (c) => c.b !== null
      ? `<td class="num"><span class="etiquette ${c.ok ? "ok" : "alerte"}">${c.ok ? "✓ " : ""}${SIP.nb(c.b, 3)}</span>${c.a !== null ? `<div class="discret">après : ${SIP.nb(c.a, 3)}</div>` : ""}<div class="discret">${c.n}×</div>${fiche(c)}</td>`
      : c.a !== null ? `<td class="num"><span class="etiquette ko">hors délai</span><div class="discret">${SIP.nb(c.a, 3)}</div>${fiche(c)}</td>`
      : c.pv ? `<td class="num"><span class="etiquette ok" title="Validée par les trois étapes de la préparation du DS">✓ prép.</span>${fiche(c)}</td>`
      : `<td class="num">${c.passe ? `<span class="etiquette ko">—</span>` : `<span class="discret">à faire</span>`}${fiche(c)}</td>`;
    const tete = cols.map((n) => `<th class="num" title="${esc(n.lab)} · ${esc(n.ds || "")} : échéance le ${SIP.fmtDate(n.ds_date)} à 6 h${n.enLigne ? "" : " · série pas encore en ligne"}">${esc(court(n.lab))}<div class="discret">${esc(n.ds || "")} · ${SIP.fmtDate(n.ds_date)}</div></th>`).join("");
    cadre(blocDSBlancs(true) + `<p class="discret">Une notion est <b>validée</b> quand l'élève atteint <b>${BAC.seuil}/20</b> à l'une de ses séries <b>avant l'échéance</b> : le jour de son DS, 6 h (heure de réception par le serveur). Sous la note : le nombre d'essais. « après » : meilleure note obtenue après l'échéance, qui ne compte pas. « fiche » : meilleure note /20 à la vérification « Ai-je compris ? » de la fiche de révision (✓ dès 16).
      <b>Préparation</b> : les trois étapes du DS (E1 les briques, E2 les calculs, E3 les chaînes), chacune validée à ${BAC.seuil}/20 avant l'échéance et ouvrant la suivante, puis le DS blanc (DSb : meilleure note en conditions de DS ou à son rythme ; q/q : meilleure note question par question, avec le corrigé après chaque question). Les trois étapes validées valident aussi les notions du DS (« ✓ prép. »).</p>
      <div class="table-defil figee"><table class="grille-bac fige"><thead><tr><th>Élève</th>${tete}${tetePrep}<th class="num">Validées à temps</th><th class="num">Note /10</th><th class="num">Révision du jour (7&nbsp;j)</th><th class="num">Parcours (7&nbsp;j)</th><th class="num">Sujet blanc</th><th class="num" title="Dernier DS blanc fait (entrainements/ds-blanc.html) : dernière note, meilleure note et nombre d'essais sur ce DS">DS blanc</th><th class="num" title="Flash du début de séance : note du dernier flash rendu, sa date, et la moyenne de tous les flashs rendus">Flash</th></tr></thead><tbody>
      ${lignes.map((l) => `<tr class="cliquable" data-id="${l.e.id}" title="${esc(l.e.nom)}"><td><b>${esc(l.e.nom)}</b></td>${l.cells.map(cell).join("")}${l.preps.map(prep).join("")}
        <td class="num">${l.echues ? `${l.valides} / ${l.echues}` : "—"}</td>
        <td class="num">${l.note10 === null ? "—" : `<span class="etiquette ${l.note10 >= 8 ? "ok" : l.note10 >= 5 ? "alerte" : "ko"}">${SIP.nb(l.note10, 3)}</span>`}</td>
        <td class="num"><span class="etiquette ${l.jours7 >= 5 ? "ok" : l.jours7 >= 3 ? "alerte" : "ko"}">${l.jours7} / 7 j</span></td>
        <td class="num">${l.parcours}</td>
        <td class="num">${l.blanc ? `<span class="etiquette ${SIP.appreciation(l.blanc.dernier).cls}">${SIP.nb(l.blanc.dernier, 3)}</span><div class="discret">${SIP.fmtDate(l.blanc.le)}</div>${l.blanc.n > 1 ? `<div class="discret">meilleur ${SIP.nb(l.blanc.meilleur, 3)} · ${l.blanc.n} sujets</div>` : ""}` : `<span class="discret">—</span>`}</td>
        <td class="num">${l.dsb ? `<span class="etiquette ${SIP.appreciation(l.dsb.dernier).cls}">${SIP.nb(l.dsb.dernier, 3)}</span><div class="discret">${esc(l.dsb.ds)}${l.dsb.pas ? " · q/q" : ""} · ${SIP.fmtDate(l.dsb.le)}</div>${l.dsb.n > 1 ? `<div class="discret">meilleur ${SIP.nb(l.dsb.meilleur, 3)} · ${l.dsb.n} essais</div>` : ""}` : `<span class="discret">—</span>`}</td>
        <td class="num">${l.flash ? `<span class="etiquette ${SIP.appreciation(l.flash.dernier).cls}">${SIP.nb(l.flash.dernier, 3)}</span><div class="discret">${SIP.fmtDate(l.flash.le)}</div>${l.flash.n > 1 ? `<div class="discret">moy. ${SIP.nb(l.flash.moy, 3)} sur ${l.flash.n}</div>` : ""}` : `<span class="discret">—</span>`}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="rang no-print" style="margin-top:12px"><button class="btn sec" id="csv-bac">Exporter cette grille (CSV, pour Pronote)</button>
        <a class="btn sec" href="index.html#/flash/projeter" title="Le flash du jour à projeter : questions, code à taper par les élèves, chrono, correction">⚡ Projeter le flash du jour</a>
        <a class="btn" href="entrainements/evaluation.html" title="Sujets papier avec les mêmes questions que le site, autres valeurs, un par élève ; corrigé et comparaison avec les notes en ligne">Évaluation en classe →</a></div>
      <p class="discret no-print">Pour vérifier que les notes en ligne sont bien celles de l'élève (et pas celles d'une IA) : <a href="entrainements/evaluation.html">prépare une évaluation en classe</a> avec les mêmes questions et d'autres valeurs, puis compare.</p>
      <p class="discret">Clique sur un élève pour voir chacune de ses séries, question par question (réponse donnée, réponse attendue, durée).</p>`);
    document.querySelectorAll("tr[data-id]").forEach((tr) => (tr.onclick = () => vueDetail(tr.dataset.id)));
    document.getElementById("csv-bac").onclick = () => {
      const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const out = [["eleve", ...cols.map((n) => `${court(n.lab)} (${n.ds || ""})`), ...dsList.map((d) => `preparation_${d.id}`), "validees_a_temps", "echeances_passees", "note_sur_10", "revision_jour_7j", "sujet_blanc_dernier", "sujet_blanc_meilleur", "ds_blanc", "ds_blanc_dernier", "ds_blanc_meilleur", "flash_dernier", "flash_date", "flash_moyenne", "flashs_rendus"].map(q).join(";")];
      lignes.forEach((l) => out.push([l.e.nom, ...l.cells.map((c) => (c.b === null ? "" : SIP.nb(c.b, 3))), ...l.preps.map((p) => p.etapes.map((x) => `E${x.k} ${x.b === null ? "-" : SIP.nb(x.b, 3)}`).concat(p.blanc ? [`DSb ${p.blanc.n ? SIP.nb(p.blanc.b, 3) : "-"}`].concat(p.blanc.nq ? [`q/q ${SIP.nb(p.blanc.q, 3)}`] : []) : []).join(" / ")), l.valides, l.echues, l.note10 === null ? "" : SIP.nb(l.note10, 3), l.jours7, l.blanc ? SIP.nb(l.blanc.dernier, 3) : "", l.blanc ? SIP.nb(l.blanc.meilleur, 3) : "", l.dsb ? l.dsb.ds : "", l.dsb ? SIP.nb(l.dsb.dernier, 3) : "", l.dsb ? SIP.nb(l.dsb.meilleur, 3) : "", l.flash ? SIP.nb(l.flash.dernier, 3) : "", l.flash ? SIP.fmtDate(l.flash.le) : "", l.flash ? SIP.nb(l.flash.moy, 3) : "", l.flash ? l.flash.n : 0].map(q).join(";")));
      const blob = new Blob(["﻿" + out.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `bac-si_TSI_${SIP.aujourdhui()}.csv`; a.click();
    };
  }

  // ---------------- Suivi ----------------
  function vueSuivi() {
    const liste = elevesFiltres().filter((e) => e.actif !== false);
    const rows = liste.map((e) => {
      const s = stats(D.parEleve[e.id]);
      const tx7 = s.attendu7 ? s.lu7 / s.attendu7 : 1;
      const alerte = (s.actives && tx7 < 0.6) || (!s.hebdoSem && s.actives + s.ancrees > 0);
      return `<tr class="cliquable" data-id="${e.id}" title="${esc(e.nom)}">
        <td><b>${esc(e.nom)}</b>${niveau ? "" : `<br><span class="discret">${esc(SIP.niveau(e.niveau).court)}</span>`}</td>
        <td class="num">${s.nb}${s.nb7 ? ` <span class="etiquette accent">+${s.nb7} sur 7 j</span>` : ""}</td>
        <td class="num">${s.moy === null ? "—" : tagNote(s.moy)}</td>
        <td>${s.derniere ? SIP.fmtDate(s.derniere, true) : "<span class='discret'>jamais</span>"}</td>
        <td class="num">${s.actives} <span class="discret">/ ${s.ancrees} ancrées</span></td>
        <td class="num">${s.actives ? `<span class="etiquette ${tx7 >= 0.85 ? "ok" : tx7 >= 0.6 ? "alerte" : "ko"}">${s.lu7} / ${s.attendu7} j</span>${s.luAuj ? " ✓" : ""}` : "—"}</td>
        <td>${s.hebdoSem ? '<span class="etiquette ok">faite</span>' : '<span class="etiquette ko">à faire</span>'} <span class="discret">${s.hebdo4}/4 sem.</span></td>
        <td>${alerte ? "⚠︎" : ""}</td></tr>`;
    }).join("");
    const tot = liste.map((e) => stats(D.parEleve[e.id]));
    const n = tot.length || 1;
    cadre(`<div class="stats">
        <div class="carte"><span class="discret">Élèves</span><b>${liste.length}</b></div>
        <div class="carte"><span class="discret">Entraînements (7 j)</span><b>${tot.reduce((s, x) => s + x.nb7, 0)}</b></div>
        <div class="carte"><span class="discret">Ont lu leurs fiches aujourd'hui</span><b>${tot.filter((x) => x.luAuj).length} / ${tot.filter((x) => x.actives).length}</b></div>
        <div class="carte"><span class="discret">Révision hebdo faite</span><b>${Math.round((100 * tot.filter((x) => x.hebdoSem).length) / n)} %</b></div>
      </div>
      ${liste.length ? `<div class="table-defil figee"><table class="fige"><thead><tr><th>Élève</th><th class="num">Entraînements</th><th class="num">Moyenne</th><th>Dernière activité</th><th class="num">Fiches en cours</th><th class="num">Lecture fiches (7 j)</th><th>Révision hebdo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="discret">Clique sur un élève pour voir <b>tous</b> ses entraînements, question par question. ⚠︎ = lecture des fiches irrégulière (moins de 60 % des jours sur les 7 derniers) ou révision de la semaine non faite.</p>`
        : `<div class="carte"><p>Aucun élève. Crée-les dans l'onglet « Élèves et codes ».</p></div>`}`);
    document.querySelectorAll("tr[data-id]").forEach((tr) => (tr.onclick = () => vueDetail(tr.dataset.id)));
  }

  // ---------------- Détail élève ----------------
  function vueDetail(id) {
    const x = D.parEleve[id]; const e = x.e; const s = stats(x); const auj = SIP.aujourdhui();
    const jours = new Set(x.L.map((l) => l.jour));
    const cal = Array.from({ length: 60 }, (_, k) => { const d = SIP.ajouterJours(auj, k - 59); return `<i class="${jours.has(d) ? "lu" : ""} ${k === 59 ? "auj" : ""}" title="${d}"></i>`; }).join("");
    const fiches = x.F.map((f) => {
      const c = SIP.FICHES[f.fiche_id] || { titre: f.fiche_id, moduleTitre: "" };
      const jour = SIP.joursEntre(f.adoptee_le, auj) + 1; const L = x.L.filter((l) => l.fiche_id === f.fiche_id).sort((a, b) => b.jour.localeCompare(a.jour));
      const attendu = Math.min(jour, SIP.CYCLE, 70); const taux = Math.round((100 * Math.min(L.length, attendu)) / attendu);
      return `<tr><td><b>${esc(c.titre)}</b><br><span class="discret">${esc(c.moduleTitre)}</span></td><td>${SIP.fmtDate(f.adoptee_le)}</td>
        <td>${jour > SIP.CYCLE ? '<span class="etiquette ok">ancrée</span>' : `jour ${jour} / ${SIP.CYCLE}`}</td>
        <td class="num">${L.length} ${tagPct(taux)}</td><td>${L[0] ? (L[0].su ? "✓ savait" : "✗ à revoir") + ` <span class="discret">${SIP.fmtDate(L[0].jour)}</span>` : "—"}</td></tr>`;
    }).join("");
    const seances = x.E.map((t) => {
      const det = Array.isArray(t.details) ? t.details : [];
      return `<details class="seance"><summary><b>${SIP.fmtDate(t.fait_le, true)}</b> ${esc(t.titre || t.module)} <span class="etiquette">${/^fiche-/.test(t.module) ? "Vérification de fiche" : /^flash-/.test(t.module) ? "Flash" : /^schemas-prof-/.test(t.module) ? "Dépannage (atelier schémas)" : /^dsb-/.test(t.module) ? "DS blanc" : /^prep-/.test(t.module) ? "Préparation du DS" : /^bac-/.test(t.module) ? "Bac SI" : LIB[t.type] || t.type}</span>
        ${tagNote(note20(t.score, t.score_max))} ${det.length ? `<span class="discret">${det.reduce((a, d) => a + nbErreurs(d), 0)} erreur(s)</span>` : ""} ${t.duree_s ? `<span class="discret">${Math.round(t.duree_s / 60)} min</span>` : ""}</summary>
        ${det.length ? `<div class="table-defil"><table><thead><tr><th>#</th><th>Question</th><th>Réponse élève</th><th>Attendu</th><th class="num">Points</th></tr></thead><tbody>${det.map((d, k) =>
          `<tr><td>${k + 1}</td><td>${esc(d.q)}</td><td>${esc(d.rep)}${d.essais > 1 ? ` <span class="discret">(${d.essais} essais)</span>` : ""}</td><td>${esc(d.attendu)}</td><td class="num">${d.bareme != null ? `${nbErreurs(d) ? "" : "✓ "}${SIP.nb(d.pts, 3)} / ${SIP.nb(d.bareme, 3)}` : nbErreurs(d) ? `✗ −${SIP.PENALITE * nbErreurs(d)}` : "✓"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Pas de détail.</p>`}
      </details>`;
    }).join("");
    // Erreurs récurrentes : questions ratées, regroupées par fiche
    const rates = {};
    x.E.forEach((t) => (Array.isArray(t.details) ? t.details : []).forEach((d) => { if (nbErreurs(d) && d.fiche) rates[d.fiche] = (rates[d.fiche] || 0) + nbErreurs(d); }));
    const top = Object.entries(rates).sort((a, b) => b[1] - a[1]).slice(0, 5);

    $app.innerHTML = `<p class="no-print"><button class="btn-lien" id="ret">← Retour au suivi</button></p>
      <h1>${esc(e.nom)} <span class="discret">· ${esc(SIP.niveau(e.niveau).nom)}</span></h1>
      <div class="stats">
        <div class="carte"><span class="discret">Entraînements</span><b>${s.nb}</b></div>
        <div class="carte"><span class="discret">Moyenne</span><b>${s.moy === null ? "—" : SIP.nb(s.moy, 3) + " / 20"}</b></div>
        <div class="carte"><span class="discret">Fiches en cours / ancrées</span><b>${s.actives} / ${s.ancrees}</b></div>
        <div class="carte"><span class="discret">Révisions hebdo (4 sem.)</span><b>${s.hebdo4} / 4</b></div>
      </div>
      <div class="grille" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
        <div class="carte"><h3>Lecture des fiches — 60 derniers jours</h3><div class="cal">${cal}</div></div>
        <div class="carte"><h3>Points faibles (erreurs par fiche)</h3>${top.length ? `<ul>${top.map(([f, n]) => `<li>${esc((SIP.FICHES[f] || { titre: f }).titre)} — <b>${n}</b> erreur${n > 1 ? "s" : ""}</li>`).join("")}</ul>` : `<p class="discret">Rien de notable.</p>`}</div>
      </div>
      ${(() => { const pc = parCompetence(x.E); const cs = Object.keys(pc).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
        return cs.length ? `<h2>Compétences</h2><div class="table-defil"><table><thead><tr><th>Compétence</th><th class="num">Entraînements</th><th class="num">Moyenne</th></tr></thead><tbody>${cs.map((c) =>
          `<tr><td><b>${c}</b> ${esc((SIP.COMPETENCES[c] || {}).txt || "")}</td><td class="num">${pc[c].n}</td><td class="num">${tagNote(pc[c].moy)}</td></tr>`).join("")}</tbody></table></div>` : ""; })()}
      <h2>Fiches (${x.F.length})</h2>
      ${x.F.length ? `<div class="table-defil"><table><thead><tr><th>Fiche</th><th>Adoptée le</th><th>Cycle</th><th class="num">Lectures / assiduité</th><th>Dernière lecture</th></tr></thead><tbody>${fiches}</tbody></table></div>` : `<p class="discret">Aucune fiche adoptée.</p>`}
      <h2>Tous les entraînements (${x.E.length})</h2>
      <div class="carte">${seances || `<p class="discret">Aucun entraînement.</p>`}</div>`;
    document.getElementById("ret").onclick = afficher;
    window.scrollTo(0, 0);
  }

  // ---------------- Élèves et codes ----------------
  const genPin = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  function vueEleves() {
    const liste = elevesFiltres();
    cadre(`<div class="grille" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
      <div class="carte no-print"><h3>Ajouter des élèves</h3>
        <label for="nv">Classe</label><select id="nv">${SIP.NIVEAUX.map((n) => `<option value="${n.id}" ${n.id === niveau ? "selected" : ""}>${esc(n.nom)}</option>`).join("")}</select>
        <label for="noms">Identifiants — un par ligne</label>
        <textarea id="noms" rows="6" placeholder="teva.m&#10;hinano.t&#10;maui.r"></textarea>
        <p class="discret">Conseil : prénom + initiale du nom, sans accent ni espace (pas de nom complet : le site est public).</p>
        <button class="btn" id="creer">Créer et générer les codes</button><div class="erreur" id="err"></div></div>
      <div class="carte" id="coupons-zone"><h3>Codes à distribuer</h3><p class="discret">Les codes n'apparaissent qu'au moment de leur création (ils sont ensuite chiffrés). Imprime-les et découpe.</p></div>
    </div>
    <h2>Élèves (${liste.length})</h2>
    ${liste.length ? `<div class="table-defil"><table><thead><tr><th>Identifiant</th><th>Classe</th><th>Créé le</th><th>Statut</th><th class="no-print">Actions</th></tr></thead><tbody>${liste.map((e) =>
      `<tr><td><b>${esc(e.nom)}</b></td><td>${esc(SIP.niveau(e.niveau).court)}</td><td>${SIP.fmtDate(e.cree_le)}</td><td>${e.actif === false ? '<span class="etiquette">désactivé</span>' : '<span class="etiquette ok">actif</span>'}</td>
      <td class="no-print"><div class="rang"><button class="btn-lien" data-pin="${e.id}">Nouveau code</button> · <button class="btn-lien" data-act="${e.id}">${e.actif === false ? "Réactiver" : "Désactiver"}</button> · <button class="btn-lien" data-sup="${e.id}" style="color:var(--ko)">Supprimer</button></div></td></tr>`).join("")}</tbody></table></div>` : ""}`);

    const coupons = (paires) => {
      document.getElementById("coupons-zone").innerHTML = `<div class="rang no-print" style="justify-content:space-between"><h3>Codes à distribuer</h3><button class="btn sec" onclick="print()">Imprimer</button></div>
        <div class="coupons">${paires.map((p) => `<div class="coupon"><div class="discret">${esc(SIP.CFG.etablissement || "")} — ${esc(SIP.niveau(p.niveau).nom)}</div>
        <div>Site : <b>${esc(location.origin + location.pathname.replace(/prof\.html$/, ""))}</b></div>
        <div>Identifiant : <code>${esc(p.nom)}</code></div><div>Code : <code>${p.pin}</code></div></div>`).join("")}</div>`;
    };
    document.getElementById("creer").onclick = async () => {
      const nv = document.getElementById("nv").value, err = document.getElementById("err"); err.textContent = "";
      const noms = document.getElementById("noms").value.split(/\n/).map((s) => s.trim()).filter(Boolean);
      if (!noms.length) return;
      const faits = [], ratés = [];
      for (const nom of noms) { const pin = genPin(); try { await SIP.api.creerEleve(nv, nom, pin); faits.push({ nom, pin, niveau: nv }); } catch (x) { ratés.push(nom + " (" + x.message + ")"); } }
      await charger(); vueEleves(); if (faits.length) coupons(faits);
      if (ratés.length) document.getElementById("err").textContent = "Non créés : " + ratés.join(", ");
    };
    document.querySelectorAll("[data-pin]").forEach((b) => (b.onclick = async () => {
      const e = D.eleves.find((x) => x.id === b.dataset.pin); const pin = genPin();
      if (!confirm(`Générer un nouveau code pour ${e.nom} ? L'ancien ne marchera plus.`)) return;
      await SIP.api.changerPin(e.id, pin); coupons([{ nom: e.nom, pin, niveau: e.niveau }]);
    }));
    document.querySelectorAll("[data-act]").forEach((b) => (b.onclick = async () => {
      const e = D.eleves.find((x) => x.id === b.dataset.act); await SIP.api.basculerActif(e.id, e.actif === false); await charger(); vueEleves();
    }));
    document.querySelectorAll("[data-sup]").forEach((b) => (b.onclick = async () => {
      const e = D.eleves.find((x) => x.id === b.dataset.sup);
      if (!confirm(`Supprimer ${e.nom} ET tout son historique ? (Irréversible — préfère « Désactiver » en fin d'année.)`)) return;
      await SIP.api.supprimerEleve(e.id); await charger(); vueEleves();
    }));
  }

  // ---------------- Devoirs notés BTS 2 (entrainements/bts-e4.html#/devoirs ; listes SIP.DEVOIRS_E4 et SIP.SERIES_E4, contenu/bts2.js) ----------------
  // Les devoirs sont groupés en études de quatre niveaux. Vue d'ensemble (devoirVu = "tout") : une ligne par élève, une colonne par étude.
  // Notation : on part de 20, chaque erreur retire 2 points ; un calcul a deux essais (détail : erreurs = 0, 1 ou 2).
  // Essais d'un niveau : le devoir noté (module e4-devoir-<id>), puis chaque devoir refait, avec d'autres valeurs (module e4-devoir-<id>-entr).
  // NOTE RETENUE = CELLE DU DERNIER ESSAI (choix du professeur, 25 nov. 2026) ; les notes précédentes restent affichées.
  // Dans un devoir refait, chaque « Où chercher ? » retire 1,5 point (détail : indice, pts). D.debuts (lignes « devoir_debut ») :
  // départs du devoir noté (plus d'un = recommencé sur un autre appareil) et des devoirs refaits (module …-entr).
  let devoirVu = "tout";
  const PEN_OU_TXT = "1,5 point";
  const n20 = (t) => note20(t.score, t.score_max);
  const nbOu = (t) => (Array.isArray(t.details) ? t.details.filter((q) => q.indice || / · indice$/.test(String(q.rep || ""))).length : 0);
  /* tous les essais d'un élève pour un niveau, du plus ancien au plus récent ; le dernier est la note retenue */
  function essaisDe(e, mod) {
    const E = D.parEleve[e.id].E.filter((t) => t.type === "externe" && (t.module === mod || t.module === mod + "-entr"))
      .slice().sort((a, b) => String(a.fait_le).localeCompare(String(b.fait_le)));
    const ess = E.map((t) => ({ t, refait: t.module !== mod, note: n20(t) })), premier = ess.find((x) => !x.refait) || null;
    const debutsR = (D.debuts || []).filter((t) => t.eleve_id === e.id && t.module === mod + "-entr").length, nR = ess.filter((x) => x.refait).length;
    return { ess, premier, retenu: ess.length ? ess[ess.length - 1] : null, nonFinis: Math.max(0, debutsR - nR), ou: E.reduce((a, t) => a + nbOu(t), 0) };
  }
  const historique = (ess, max) => { const N = ess.map((x) => SIP.nb(x.note, 3)); return max && N.length > max ? "… " + N.slice(-max).join(" → ") : N.join(" → "); };
  const titreEssais = (ess) => ess.map((x, i) => `Essai ${i + 1} (${x.refait ? "refait" : "devoir noté"}) : ${SIP.nb(x.note, 3)}/20 le ${SIP.fmtDate(x.t.fait_le, true)}${nbOu(x.t) ? `, « Où chercher ? » × ${nbOu(x.t)}` : ""}`).join(" ; ");
  /* points perdus sur une question (détail d'une copie) : erreurs × 2, plus 1,5 par « Où chercher ? » dans un devoir refait */
  const perdus = (q) => (q.pts != null && q.pts < 0 ? -q.pts : SIP.PENALITE * nbErreurs(q));
  const tableCopie = (det) => `<div class="table-defil"><table><thead><tr><th>Question</th><th>Énoncé (avec les valeurs de l'élève, lues sur ses documents)</th><th>Réponse de l'élève</th><th>Attendu</th><th class="num"></th></tr></thead><tbody>${det.map((q, k) =>
    `<tr><td>${esc(q.ref || k + 1)}</td><td>${esc(q.q)}</td><td>${esc(q.rep)}</td><td>${esc(q.attendu)}</td><td class="num" style="white-space:nowrap">${perdus(q) ? (nbErreurs(q) ? "✗ " : "💡 ") + "−" + SIP.nb(perdus(q), 2) : "✓"}</td></tr>`).join("")}</tbody></table></div>`;
  function copiesDevoir(d) {
    const mod = "e4-devoir-" + d.id;
    return D.eleves.filter((e) => /^BTS2/.test(e.niveau) && (!niveau || e.niveau === niveau) && e.actif !== false)
      .sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom)).map((e) => {
        const X = essaisDe(e, mod), t = X.retenu ? X.retenu.t : null;
        const debuts = (D.debuts || []).filter((u) => u.eleve_id === e.id && u.module === mod).sort((a, b) => a.fait_le.localeCompare(b.fait_le));
        const det = t && Array.isArray(t.details) ? t.details : [], parties = {};
        det.forEach((x) => { const l = String(x.ref || "").charAt(0); if (l) parties[l] = (parties[l] || 0) + perdus(x); });   // points perdus par partie (essai retenu)
        return Object.assign({ e, copie: t, det, parties, debuts }, X);
      });
  }
  const etudesDevoirs = (LD) => (SIP.SERIES_E4 || []).filter((s) => LD.some((d) => d.serie === s.id));
  const niveauxEtude = (LD, sid) => LD.filter((d) => d.serie === sid).sort((a, b) => a.niveau - b.niveau);
  function choixDevoir(LD) {
    return `<div class="rang no-print"><select id="dv-choix" style="width:auto"><option value="tout" ${devoirVu === "tout" ? "selected" : ""}>Vue d'ensemble · toutes les études</option>${etudesDevoirs(LD).map((s) =>
      `<optgroup label="${esc(s.titre)}">${niveauxEtude(LD, s.id).map((x) => `<option value="${x.id}" ${x.id === devoirVu ? "selected" : ""}>${esc(s.titre)} · niveau ${x.niveau} « ${esc(x.nomNiveau || "")} »</option>`).join("")}</optgroup>`).join("")}</select></div>`;
  }
  const REGLE_ESSAIS = `Après le devoir noté, l'élève peut <b>le refaire</b>, avec de nouvelles valeurs : <b>la note retenue est celle du dernier essai</b>, même plus basse ; les notes précédentes restent affichées (survol : dates). Dans un devoir refait, le bouton « Où chercher ? » existe et <b>chaque usage retire ${PEN_OU_TXT}</b> (💡 : nombre d'usages).`;
  function vueDevoirs() {
    const LD = SIP.DEVOIRS_E4 || [];
    if (!LD.length) return cadre(`<div class="carte"><p>Aucun devoir noté pour l'instant.</p></div>`);
    if (devoirVu !== "tout" && !LD.some((d) => d.id === devoirVu)) devoirVu = "tout";
    if (devoirVu === "tout") return vueDevoirsTout(LD);
    const d = LD.find((x) => x.id === devoirVu), C = copiesDevoir(d), R = C.filter((x) => x.copie), P = d.parties || [];
    const etude = etudesDevoirs(LD).find((s) => s.id === d.serie), titreE = etude ? etude.titre : d.titre;
    const notes = R.map((x) => x.retenu.note), moy = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null;
    const enCours = C.filter((x) => !x.copie && x.debuts.length).length, nRefaits = R.filter((x) => x.ess.length > 1).length;
    // réussite par question, sur l'essai retenu (les copies ont les mêmes questions, avec d'autres valeurs)
    const nq = Math.max(0, ...R.map((x) => x.det.length)), parQ = [];
    for (let k = 0; k < nq; k++) { const L = R.filter((x) => x.det[k]); if (L.length) parQ.push({ k, ref: L[0].det[k].ref || "Q" + (k + 1), q: String(L[0].det[k].q || ""), taux: L.filter((x) => !nbErreurs(x.det[k])).length / L.length }); }
    const faibles = parQ.slice().sort((a, b) => a.taux - b.taux).filter((x) => x.taux < 0.75).slice(0, 6);
    const cellEssais = (x) => `<td style="white-space:nowrap" title="${esc(titreEssais(x.ess))}">${x.ess.length > 1 ? `<b>${historique(x.ess, 6)}</b>` : `<span class="discret">1 essai</span>`}${x.ou ? ` <span class="discret">💡 ${x.ou}</span>` : ""}${x.nonFinis ? ` <span class="etiquette alerte" title="Devoir refait commencé, pas rendu (en cours ou abandonné)">+${x.nonFinis} non fini${x.nonFinis > 1 ? "s" : ""}</span>` : ""}</td>`;
    const ligne = (x) => {
      const t = x.copie;
      if (!t) return `<tr><td><b>${esc(x.e.nom)}</b></td><td>${esc((SIP.niveau(x.e.niveau) || {}).court || x.e.niveau)}</td><td class="num">—</td><td></td>${P.map(() => `<td class="num">—</td>`).join("")}<td colspan="2">${x.debuts.length ? `<span class="etiquette alerte">en cours</span> <span class="discret">commencé le ${SIP.fmtDate(x.debuts[0].fait_le, true)}</span>` : `<span class="discret">pas commencé</span>`}</td><td class="num">${x.debuts.length || ""}</td></tr>`;
      return `<tr><td><b>${esc(x.e.nom)}</b></td><td>${esc((SIP.niveau(x.e.niveau) || {}).court || x.e.niveau)}</td><td class="num">${tagNote(x.retenu.note)}</td>${cellEssais(x)}
        ${P.map((p) => `<td class="num">${x.parties[p[0]] == null ? "—" : x.parties[p[0]] ? "−" + SIP.nb(x.parties[p[0]], 3) : "✓"}</td>`).join("")}
        <td>${SIP.fmtDate(t.fait_le, true)}${x.retenu.refait ? ` <span class="discret">(refait)</span>` : ""}</td><td class="num">${t.duree_s ? Math.round(t.duree_s / 60) + " min" : "—"}</td>
        <td class="num">${x.debuts.length > 1 ? `<span class="etiquette alerte" title="Devoir noté démarré ${x.debuts.length} fois : recommencé sur un autre appareil ou après effacement des données du navigateur">${x.debuts.length}</span>` : x.debuts.length || ""}</td></tr>`;
    };
    const essai = (y, i, n) => { const det = Array.isArray(y.t.details) ? y.t.details : [], o = nbOu(y.t);
      return `<details class="seance" style="margin-left:18px"${i === n - 1 && n > 1 ? " open" : ""}><summary>Essai ${i + 1} · ${y.refait ? "refait" : "devoir noté"} ${tagNote(y.note)}${i === n - 1 ? ` <b>note retenue</b>` : ""} <span class="discret">${det.reduce((a, q) => a + nbErreurs(q), 0)} erreur(s)${o ? ` · « Où chercher ? » × ${o} (−${SIP.nb(1.5 * o, 2)})` : ""} · le ${SIP.fmtDate(y.t.fait_le, true)}${y.t.duree_s ? ` · ${Math.round(y.t.duree_s / 60)} min` : ""}</span></summary>${det.length ? tableCopie(det) : `<p class="discret">Pas de détail.</p>`}</details>`; };
    const copie = (x) => `<details class="seance"><summary><b>${esc(x.e.nom)}</b> ${tagNote(x.retenu.note)} <span class="discret">${x.ess.length > 1 ? `${x.ess.length} essais : ${historique(x.ess)} · dernier le ${SIP.fmtDate(x.copie.fait_le, true)}` : `${x.det.reduce((a, q) => a + nbErreurs(q), 0)} erreur(s) · rendu le ${SIP.fmtDate(x.copie.fait_le, true)}`}</span></summary>
        ${x.ess.length > 1 ? x.ess.map((y, i) => essai(y, i, x.ess.length)).join("") : x.det.length ? tableCopie(x.det) : `<p class="discret">Pas de détail.</p>`}</details>`;
    cadre(`
      ${choixDevoir(LD)}
      <h2 style="margin-top:8px">${esc(titreE)} · niveau ${d.niveau} « ${esc(d.nomNiveau || "")} »</h2>
      <p class="discret" style="max-width:900px">Étude de cas notée sur 20 (${P.reduce((a, p) => a + p[2], 0)} questions), dans la forme de l'épreuve E4 ; l'étude a quatre niveaux, du plus guidé à celui de l'épreuve puis au-delà, chacun s'ouvrant quand l'élève a rendu le précédent. Comme pour les Terminales, l'élève part de 20 et <b>chaque erreur retire 2 points</b> ; pour un calcul il a deux essais et peut se corriger (« 12 puis 15 » dans sa copie). <b>Chaque élève a ses propres valeurs</b>, tirées à partir de son nom : installation, documents, résultats et conclusions changent d'une copie à l'autre. ${REGLE_ESSAIS} Colonnes « Partie » : points perdus sur l'essai retenu. Le détail de chaque essai est sous la copie.</p>
      <div class="rang no-print"><a class="btn sec" href="entrainements/bts-e4.html#/devoirs/${esc(d.serie || "")}" target="_blank" rel="noopener">Ouvrir la page de l'étude</a><button class="btn sec" id="dv-csv">Notes du devoir (CSV)</button>
        <span class="discret">Pour l'essayer : onglet « Aperçu élève », classe BTS 2, puis la tuile du devoir (autres valeurs à chaque essai, rien n'est transmis).</span></div>
      <div class="carte" style="margin-top:12px"><b>${R.length}</b> devoir${R.length > 1 ? "s" : ""} rendu${R.length > 1 ? "s" : ""} sur ${C.length} élève${C.length > 1 ? "s" : ""}${nRefaits ? ` (dont <b>${nRefaits}</b> refait${nRefaits > 1 ? "s" : ""})` : ""}${enCours ? ` · <b>${enCours}</b> en cours` : ""}${moy != null ? ` · moyenne des notes retenues <b>${SIP.nb(moy, 3)} / 20</b> · de ${SIP.nb(Math.min(...notes), 3)} à ${SIP.nb(Math.max(...notes), 3)}` : ""}</div>
      ${C.length ? `<div class="table-defil" style="margin-top:12px"><table><thead><tr><th>Élève</th><th>Classe</th><th class="num" title="Note du dernier essai">Note retenue</th><th title="Notes de tous les essais, dans l'ordre : le devoir noté, puis chaque devoir refait">Essais</th>${P.map((p) => `<th class="num" title="Points perdus dans la partie ${esc(p[0])} (${p[2]} questions), essai retenu">Partie ${esc(p[0])}<br><span class="discret">${esc(p[1])} · ${p[2]} q.</span></th>`).join("")}<th>Dernier essai le</th><th class="num">Temps passé</th><th class="num" title="Nombre de fois où le devoir noté a été démarré">Départs</th></tr></thead><tbody>${C.map(ligne).join("")}</tbody></table></div>`
        : `<div class="carte" style="margin-top:12px"><p>Aucun élève de BTS 2${niveau ? " dans cette classe" : ""}. Choisis « Toutes les classes » ou une classe de BTS 2.</p></div>`}
      ${faibles.length ? `<h3 style="margin-top:22px">Questions les moins réussies</h3><div class="table-defil"><table><thead><tr><th>Question</th><th>Énoncé (exemple d'une copie)</th><th class="num" title="Part des copies (essai retenu) sans erreur sur cette question">Juste du premier coup</th></tr></thead><tbody>${faibles.map((f) => `<tr><td>${esc(f.ref)}</td><td>${esc(f.q.length > 220 ? f.q.slice(0, 220) + "…" : f.q)}</td><td class="num">${tagPct(Math.round(100 * f.taux))}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${R.length ? `<h3 style="margin-top:22px">Les copies</h3>${R.map(copie).join("")}` : ""}`);
    const ch = document.getElementById("dv-choix"); if (ch) ch.onchange = () => { devoirVu = ch.value; afficher(); };
    document.getElementById("dv-csv").onclick = () => {
      const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const lignes = [["eleve", "classe", "note_retenue_sur_20", "nombre_essais", "notes_des_essais", "ou_chercher", ...P.map((p) => "points_perdus_partie_" + p[0]), "dernier_essai_le", "temps_min", "departs"].join(";")];
      C.forEach((x) => lignes.push([x.e.nom, x.e.niveau, x.copie ? SIP.nb(x.retenu.note, 3) : "", x.ess.length || "", x.ess.map((y) => SIP.nb(y.note, 3)).join(" | "), x.ou || "", ...P.map((p) => (x.copie && x.parties[p[0]] != null ? SIP.nb(x.parties[p[0]], 3) : "")),
        x.copie ? SIP.fmtDate(x.copie.fait_le, true) : "", x.copie && x.copie.duree_s ? Math.round(x.copie.duree_s / 60) : "", x.debuts.length].map(q).join(";")));
      const blob = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `si-papara_${d.id}_notes_${SIP.aujourdhui()}.csv`; a.click();
    };
  }

  // vue d'ensemble : une ligne par élève, une colonne par étude (note retenue de chaque niveau = dernier essai ; « … » commencé, pas rendu)
  function vueDevoirsTout(LD) {
    const SE = etudesDevoirs(LD), E = D.eleves.filter((e) => /^BTS2/.test(e.niveau) && (!niveau || e.niveau === niveau) && e.actif !== false)
      .sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom));
    const etat = (e, d) => { const mod = "e4-devoir-" + d.id, X = essaisDe(e, mod);
      return X.retenu ? { note: X.retenu.note, X } : (D.debuts || []).some((t) => t.eleve_id === e.id && t.module === mod) ? { enCours: true } : {}; };
    const M = E.map((e) => ({ e, X: SE.map((s) => niveauxEtude(LD, s.id).map((d) => etat(e, d))) }));
    const badge = (x, k) => (x.note != null ? `<span class="etiquette ${SIP.appreciation(x.note).cls}" title="${esc(`Niveau ${k + 1} · note retenue ${SIP.nb(x.note, 3)} / 20 · ${titreEssais(x.X.ess)}`)}">${SIP.nb(x.note, 3)}</span>${x.X.ess.length > 1 ? `<span class="discret" style="font-size:.8em;margin-left:3px" title="${esc(titreEssais(x.X.ess))}">(avant ${x.X.ess.slice(-4, -1).map((y) => SIP.nb(y.note, 3)).join(" · ")})</span>` : ""}`
      : x.enCours ? `<span class="etiquette alerte" title="Niveau ${k + 1} commencé, pas rendu">…</span>` : `<span class="etiquette off" title="Niveau ${k + 1} pas commencé">–</span>`);
    const bilan = SE.map((s, j) => { const N = niveauxEtude(LD, s.id);
      return N.map((d, k) => { const notes = M.map((m) => m.X[j][k].note).filter((n) => n != null); return notes.length ? `N${d.niveau} : ${notes.length} copie${notes.length > 1 ? "s" : ""}, moy. ${SIP.nb(notes.reduce((a, b) => a + b, 0) / notes.length, 3)}` : `N${d.niveau} : —`; }).join(" · "); });
    cadre(`
      ${choixDevoir(LD)}
      <h2 style="margin-top:8px">Devoirs notés · vue d'ensemble</h2>
      <p class="discret" style="max-width:900px">${SE.length} étude${SE.length > 1 ? "s" : ""} de cas, chacune en quatre niveaux (du plus guidé à l'épreuve, puis au-delà) ; dans une étude, un niveau s'ouvre quand l'élève a rendu le précédent. On part de 20, −2 points par erreur. ${REGLE_ESSAIS} « (avant …) » : notes des essais précédents. « … » : commencé, pas encore rendu. Pour le détail d'un niveau (parties, questions les moins réussies, copies), choisis-le dans la liste.</p>
      <div class="rang no-print"><a class="btn sec" href="entrainements/bts-e4.html#/devoirs" target="_blank" rel="noopener">Ouvrir la page des devoirs</a><button class="btn sec" id="dv-csv">Toutes les notes (CSV)</button></div>
      ${E.length ? `<div class="table-defil" style="margin-top:12px"><table><thead><tr><th>Élève</th><th>Classe</th>${SE.map((s, j) => `<th title="${esc(bilan[j])}">${esc(s.titre)}<br><span class="discret">${niveauxEtude(LD, s.id).map((d) => "N" + d.niveau).join(" · ")}</span></th>`).join("")}</tr></thead><tbody>${M.map((m) =>
        `<tr><td><b>${esc(m.e.nom)}</b></td><td>${esc((SIP.niveau(m.e.niveau) || {}).court || m.e.niveau)}</td>${m.X.map((L) => `<td style="white-space:nowrap">${L.map(badge).join(" ")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
        : `<div class="carte" style="margin-top:12px"><p>Aucun élève de BTS 2${niveau ? " dans cette classe" : ""}. Choisis « Toutes les classes » ou une classe de BTS 2.</p></div>`}
      <div class="carte" style="margin-top:12px">${SE.map((s, j) => `<p style="margin:2px 0"><b>${esc(s.titre)}</b> · <span class="discret">${esc(bilan[j])} (notes retenues)</span></p>`).join("")}</div>`);
    const ch = document.getElementById("dv-choix"); if (ch) ch.onchange = () => { devoirVu = ch.value; afficher(); };
    document.getElementById("dv-csv").onclick = () => {
      const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const cols = SE.flatMap((s) => niveauxEtude(LD, s.id).flatMap((d) => [s.id + "_n" + d.niveau, s.id + "_n" + d.niveau + "_essais"]));
      const lignes = [["eleve", "classe", ...cols].join(";")];
      M.forEach((m) => lignes.push([m.e.nom, m.e.niveau, ...m.X.flatMap((L) => L.flatMap((x) => [x.note != null ? SIP.nb(x.note, 3) : x.enCours ? "en cours" : "", x.X && x.X.ess.length > 1 ? x.X.ess.map((y) => SIP.nb(y.note, 3)).join(" | ") : ""]))].map(q).join(";")));
      const blob = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `si-papara_devoirs_e4_notes_${SIP.aujourdhui()}.csv`; a.click();
    };
  }

  // ---------------- Export ----------------
  function exporterCSV() {
    const ids = new Set(elevesFiltres().map((e) => e.id));
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lignes = [["date", "classe", "eleve", "type", "module", "titre", "note_sur_20", "erreurs", "duree_s"].join(";")];
    D.entrainements.filter((t) => ids.has(t.eleve_id)).forEach((t) => {
      const e = D.parEleve[t.eleve_id].e;
      lignes.push([SIP.fmtDate(t.fait_le, true), e.niveau, e.nom, t.type, t.module, t.titre, SIP.nb(note20(t.score, t.score_max), 3), Array.isArray(t.details) ? t.details.reduce((a, d) => a + nbErreurs(d), 0) : "", t.duree_s || ""].map(q).join(";"));
    });
    const blob = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `si-papara_${niveau || "toutes-classes"}_${SIP.aujourdhui()}.csv`; a.click();
  }

  // ---------------- Démarrage ----------------
  async function demarrer() {
    try {
      if (!(await SIP.api.profSession())) return vueConnexion();
      document.getElementById("deco").classList.remove("cache");
      await charger(); afficher();
    } catch (e) { vueConnexion("Erreur : " + e.message); }
  }
  demarrer();
})(window.SIP);
