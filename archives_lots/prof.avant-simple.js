/* =====================================================================
   SI Papara — tableau de bord professeur
   ===================================================================== */
(function (SIP) {
  const $app = document.getElementById("app");
  const esc = SIP.esc;
  let D = null;            // données brutes
  let onglet = "suivi";
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
  document.getElementById("deco").onclick = async () => { await SIP.api.profDeconnexion(); D = null; vueConnexion(); };

  async function charger() {
    $app.innerHTML = `<p class="discret">Chargement des données…</p>`;
    D = await SIP.api.profDonnees();
    D.parEleve = {};
    D.eleves.forEach((e) => (D.parEleve[e.id] = { e, E: [], F: [], L: [] }));
    D.entrainements.forEach((t) => D.parEleve[t.eleve_id] && D.parEleve[t.eleve_id].E.push(t));
    D.fiches_suivi.forEach((f) => D.parEleve[f.eleve_id] && D.parEleve[f.eleve_id].F.push(f));
    D.lectures.forEach((l) => D.parEleve[l.eleve_id] && D.parEleve[l.eleve_id].L.push(l));
    Object.values(D.parEleve).forEach((x) => x.E.sort((a, b) => b.fait_le.localeCompare(a.fait_le)));
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
      <div class="onglets no-print"><button data-o="suivi" class="${onglet === "suivi" ? "actif" : ""}">Suivi</button><button data-o="competences" class="${onglet === "competences" ? "actif" : ""}">Compétences</button><button data-o="bac" class="${onglet === "bac" ? "actif" : ""}">Bac SI</button><button data-o="eleves" class="${onglet === "eleves" ? "actif" : ""}">Élèves et codes</button></div>
      <div id="corps">${contenu}</div>`;
    document.getElementById("niv").onchange = (e) => { niveau = e.target.value; try { localStorage.setItem("sip_prof_niveau", niveau); } catch (x) {} afficher(); };
    document.getElementById("maj").onclick = async () => { await charger(); afficher(); };
    document.getElementById("csv").onclick = exporterCSV;
    document.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => { onglet = b.dataset.o; afficher(); }));
  }
  const elevesFiltres = () => D.eleves.filter((e) => !niveau || e.niveau === niveau).sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom));

  function afficher() { onglet === "eleves" ? vueEleves() : onglet === "competences" ? vueCompetences() : onglet === "bac" ? vueBac() : vueSuivi(); }

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
      <div class="table-defil"><table><thead><tr><th>Élève</th>${codes.map((c) => `<th class="num" title="${esc(SIP.COMPETENCES[c].dom + " — " + SIP.COMPETENCES[c].txt)}">${c}</th>`).join("")}</tr></thead><tbody>
      ${liste.map((e, i) => `<tr class="cliquable" data-id="${e.id}"><td><b>${esc(e.nom)}</b></td>${codes.map((c) => cell(pcs[i][c])).join("")}</tr>`).join("")}
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
    const liste = elevesFiltres().filter((e) => e.actif !== false && e.niveau === "TSI");
    const lignes = liste.map((e) => {
      const E = D.parEleve[e.id].E;
      const bac = E.filter((t) => t.type === "externe" && /^bac-/.test(t.module) && !/^bac-(parcours|revision|blanc)$/.test(t.module));
      const best = (a) => (a.length ? Math.max(...a.map((t) => note20(t.score, t.score_max))) : null);
      const cells = cols.map((n) => {
        const ts = bac.filter((t) => notionDe(t.module) === n.id), lim = Date.parse(n.echeance);
        const b = best(ts.filter((t) => quand(t) <= lim)), a = best(ts.filter((t) => quand(t) > lim));
        const f = best(E.filter((t) => t.type === "externe" && t.module === "fiche-" + n.id)); // vérification de la fiche (« Ai-je compris ? »)
        return { b, a, n: ts.length, passe: now > lim, ok: b !== null && b >= BAC.seuil, f };
      });
      const echues = cells.filter((c) => c.passe), valides = echues.filter((c) => c.ok).length;
      const rev = E.filter((t) => t.type === "revision_jour");
      const jours7 = new Set(rev.filter((t) => SIP.jourTahiti(t.fait_le) >= il7).map((t) => SIP.jourTahiti(t.fait_le))).size;
      const parcours = E.filter((t) => t.module === "bac-parcours" && SIP.jourTahiti(t.fait_le) >= il7).length;
      const blancs = E.filter((t) => t.module === "bac-blanc").sort((a, b) => quand(b) - quand(a));
      const blanc = blancs.length ? { dernier: note20(blancs[0].score, blancs[0].score_max), le: blancs[0].fait_le, meilleur: Math.max(...blancs.map((t) => note20(t.score, t.score_max))), n: blancs.length } : null;
      return { e, cells, valides, echues: echues.length, note10: echues.length ? (10 * valides) / echues.length : null, jours7, parcours, blanc };
    });
    return { cols, lignes };
  }
  function vueBac() {
    if (niveau && niveau !== "TSI") return cadre(`<div class="carte"><p>L'entraînement bac SI concerne la Terminale SI : choisis « Terminale SI » en haut.</p></div>`);
    const { cols, lignes } = bacGrille();
    if (!lignes.length) return cadre(`<div class="carte"><p>Aucun élève de Terminale SI. Crée-les dans l'onglet « Élèves et codes ».</p></div>`);
    const fiche = (c) => (c.f !== null ? `<div class="discret" title="Meilleure note à la vérification de la fiche">fiche ${c.f >= 16 ? "✓ " : ""}${SIP.nb(c.f, 3)}</div>` : "");
    const cell = (c) => c.b !== null
      ? `<td class="num"><span class="etiquette ${c.ok ? "ok" : "alerte"}">${c.ok ? "✓ " : ""}${SIP.nb(c.b, 3)}</span>${c.a !== null ? `<div class="discret">après : ${SIP.nb(c.a, 3)}</div>` : ""}<div class="discret">${c.n}×</div>${fiche(c)}</td>`
      : c.a !== null ? `<td class="num"><span class="etiquette ko">hors délai</span><div class="discret">${SIP.nb(c.a, 3)}</div>${fiche(c)}</td>`
      : `<td class="num">${c.passe ? `<span class="etiquette ko">—</span>` : `<span class="discret">à faire</span>`}${fiche(c)}</td>`;
    const tete = cols.map((n) => `<th class="num" title="${esc(n.lab)} · ${esc(n.ds || "")} : échéance le ${SIP.fmtDate(n.ds_date)} à 6 h${n.enLigne ? "" : " · série pas encore en ligne"}">${esc(court(n.lab))}<div class="discret">${esc(n.ds || "")} · ${SIP.fmtDate(n.ds_date)}</div></th>`).join("");
    cadre(`<p class="discret">Une notion est <b>validée</b> quand l'élève atteint <b>${BAC.seuil}/20</b> à l'une de ses séries <b>avant l'échéance</b> : le jour de son DS, 6 h (heure de réception par le serveur). Sous la note : le nombre d'essais. « après » : meilleure note obtenue après l'échéance, qui ne compte pas. « fiche » : meilleure note /20 à la vérification « Ai-je compris ? » de la fiche de révision (✓ dès 16).</p>
      <div class="table-defil"><table class="grille-bac"><thead><tr><th>Élève</th>${tete}<th class="num">Validées à temps</th><th class="num">Note /10</th><th class="num">Révision du jour (7&nbsp;j)</th><th class="num">Parcours (7&nbsp;j)</th><th class="num">Sujet blanc</th></tr></thead><tbody>
      ${lignes.map((l) => `<tr class="cliquable" data-id="${l.e.id}"><td><b>${esc(l.e.nom)}</b></td>${l.cells.map(cell).join("")}
        <td class="num">${l.echues ? `${l.valides} / ${l.echues}` : "—"}</td>
        <td class="num">${l.note10 === null ? "—" : `<span class="etiquette ${l.note10 >= 8 ? "ok" : l.note10 >= 5 ? "alerte" : "ko"}">${SIP.nb(l.note10, 3)}</span>`}</td>
        <td class="num"><span class="etiquette ${l.jours7 >= 5 ? "ok" : l.jours7 >= 3 ? "alerte" : "ko"}">${l.jours7} / 7 j</span></td>
        <td class="num">${l.parcours}</td>
        <td class="num">${l.blanc ? `<span class="etiquette ${SIP.appreciation(l.blanc.dernier).cls}">${SIP.nb(l.blanc.dernier, 3)}</span><div class="discret">${SIP.fmtDate(l.blanc.le)}${l.blanc.n > 1 ? ` · meilleur ${SIP.nb(l.blanc.meilleur, 3)} · ${l.blanc.n} sujets` : ""}</div>` : `<span class="discret">—</span>`}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="rang no-print" style="margin-top:12px"><button class="btn sec" id="csv-bac">Exporter cette grille (CSV, pour Pronote)</button>
        <a class="btn" href="entrainements/evaluation.html" title="Sujets papier avec les mêmes questions que le site, autres valeurs, un par élève ; corrigé et comparaison avec les notes en ligne">Évaluation en classe →</a></div>
      <p class="discret no-print">Pour vérifier que les notes en ligne sont bien celles de l'élève (et pas celles d'une IA) : <a href="entrainements/evaluation.html">prépare une évaluation en classe</a> avec les mêmes questions et d'autres valeurs, puis compare.</p>
      <p class="discret">Clique sur un élève pour voir chacune de ses séries, question par question (réponse donnée, réponse attendue, durée).</p>`);
    document.querySelectorAll("tr[data-id]").forEach((tr) => (tr.onclick = () => vueDetail(tr.dataset.id)));
    document.getElementById("csv-bac").onclick = () => {
      const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const out = [["eleve", ...cols.map((n) => `${court(n.lab)} (${n.ds || ""})`), "validees_a_temps", "echeances_passees", "note_sur_10", "revision_jour_7j", "sujet_blanc_dernier", "sujet_blanc_meilleur"].map(q).join(";")];
      lignes.forEach((l) => out.push([l.e.nom, ...l.cells.map((c) => (c.b === null ? "" : SIP.nb(c.b, 3))), l.valides, l.echues, l.note10 === null ? "" : SIP.nb(l.note10, 3), l.jours7, l.blanc ? SIP.nb(l.blanc.dernier, 3) : "", l.blanc ? SIP.nb(l.blanc.meilleur, 3) : ""].map(q).join(";")));
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
      return `<tr class="cliquable" data-id="${e.id}">
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
      ${liste.length ? `<div class="table-defil"><table><thead><tr><th>Élève</th><th class="num">Entraînements</th><th class="num">Moyenne</th><th>Dernière activité</th><th class="num">Fiches en cours</th><th class="num">Lecture fiches (7 j)</th><th>Révision hebdo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
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
      return `<details class="seance"><summary><b>${SIP.fmtDate(t.fait_le, true)}</b> ${esc(t.titre || t.module)} <span class="etiquette">${/^fiche-/.test(t.module) ? "Vérification de fiche" : /^bac-/.test(t.module) ? "Bac SI" : LIB[t.type] || t.type}</span>
        ${tagNote(note20(t.score, t.score_max))} ${det.length ? `<span class="discret">${det.reduce((a, d) => a + nbErreurs(d), 0)} erreur(s)</span>` : ""} ${t.duree_s ? `<span class="discret">${Math.round(t.duree_s / 60)} min</span>` : ""}</summary>
        ${det.length ? `<div class="table-defil"><table><thead><tr><th>#</th><th>Question</th><th>Réponse élève</th><th>Attendu</th><th class="num">Points</th></tr></thead><tbody>${det.map((d, k) =>
          `<tr><td>${k + 1}</td><td>${esc(d.q)}</td><td>${esc(d.rep)}${d.essais > 1 ? ` <span class="discret">(${d.essais} essais)</span>` : ""}</td><td>${esc(d.attendu)}</td><td class="num">${nbErreurs(d) ? `✗ −${SIP.PENALITE * nbErreurs(d)}` : "✓"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Pas de détail.</p>`}
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
