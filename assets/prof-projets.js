/* =====================================================================
   SI Papara — espace prof : onglet « Projets BTS 2 »
   Attribution des 13 projets, avancement des dossiers 1-2-3 de chaque étudiant,
   validation des documents (retours lus par l'étudiant), planning, protocole de
   mise en service et analyse des risques en lecture, positionnement N1–N4 sur les
   grilles U61/U62 (note calculée, jamais montrée à l'étudiant).
   Données : table projets_eleves (supabase/projets.sql) ; contenu/projets-bts2.js et
   contenu/projets-entrainement.js (parcours d'entraînement : cinq cas, une partie par étudiant,
   E1-1, E1-2… ; livrables des étapes ouvertes et positionnement N1–N4 de l'étape, lu par l'étudiant).
   ===================================================================== */
(function (SIP) {
  const esc = SIP.esc;
  const P = window.SIP_PROJETS;
  if (!P) return;
  const REG = window.SIP_PROJETS_REGLAGES || {};
  const ATTRIB = Object.assign({}, P.attribution || {}, REG.attribution || {});
  const projet = (id) => P.projets.find((p) => p.id === id);
  const CRIT = {};
  ["u61", "u62"].forEach((u) => P.grilles[u].competences.forEach((c) => c.criteres.forEach((k) => (CRIT[k.id] = k.txt))));
  const PHASES = { conception: "Conception (U61)", anticipation: "Réalisation par anticipation", realisation: "Réalisation (U62)" };
  const STATUTS = ["à faire", "en cours", "prêt pour la revue"];
  const NIV = P.grilles.niveaux;
  const urlSure = (u) => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim());
  const estEnt = (p) => !!(p && p.type === "entrainement");
  const CAS = P.cas || [];
  const ETAPES = P.parcours ? P.parcours.etapes : [];
  const ouvertes = () => ETAPES.filter((e) => e.ouverte);
  const docsDu = (p) => estEnt(p) ? ouvertes().flatMap((e) => e.livrables.map((l) => Object.assign({ contenu: [] }, l, { etape: e.id }))) : P.docs_communs.filter((d) => !p.docs || p.docs.includes(d.id)).map((d) => {
    let contenu = d.spec ? (p.spec[d.spec] || []).slice() : (d.contenu || []).slice();
    if (d.plus && p.plus && p.plus[d.plus]) contenu = contenu.concat(p.plus[d.plus]);
    return Object.assign({}, d, { contenu });
  });

  let LIGNES = null, ERREUR = "", ouvert = null, ctx = null;
  const ligneDe = (id) => (LIGNES || []).find((r) => r.eleve_id === id) || { eleve_id: id, projet: null, etat: {}, retours: {}, evaluation: {} };
  const projetDe = (e, r) => r.projet || ATTRIB[e.nom] || ATTRIB[String(e.nom).toLowerCase()] || null;     // attribué (base ou réglages)
  const projetVu = (e, r) => projetDe(e, r) || (r.etat || {}).projet || null;                                  // ou, à défaut, choisi par l'étudiant
  async function charger() {
    try { LIGNES = await SIP.api.profProjets(); ERREUR = ""; }
    catch (e) { LIGNES = null; ERREUR = e.message || String(e); }
  }
  const tableAbsente = () => /projets_eleves|does not exist|schema cache|relation|PGRST205|404/i.test(ERREUR);

  // note d'une unité d'après la grille : somme (poids × % du niveau), sur 20
  function note(u, ev) {
    const G = P.grilles[u], pos = (ev && ev[u]) || {};
    let tot = 0, complet = true;
    G.competences.forEach((c) => { const n = NIV.find((x) => x.n === Number(pos[c.id])); if (!n) complet = false; else tot += (c.poids * n.pct) / 100; });
    return { v: Math.round((20 * tot) / 100 * 10) / 10, complet };
  }
  function avancement(p, r) {
    const o = {}; const rv = (r.retours || {}).docs || {}, dc = (r.etat || {}).docs || {};
    P.dossiers.forEach((d) => (o[d.id] = { n: 0, p: 0, v: 0, r: 0, c: 0 }));
    docsDu(p).forEach((d) => { const x = o[d.dossier]; const v = (rv[d.id] || {}).v, s = (dc[d.id] || {}).s || 0;
      if (d.option && !s && !v) return;   // livrable facultatif : compté seulement s'il est commencé
      x.n++;
      if (v === "ok") x.v++; else if (v === "reprendre") x.r++; else if (s === 2) x.p++; else if (s === 1) x.c++; });
    return o;
  }

  async function afficher(c) {
    ctx = c;
    if (LIGNES === null) await charger();
    if (ouvert) return vueEleve(ouvert);
    vueListe();
  }

  function vueListe() {
    const eleves = ctx.D.eleves.filter((e) => /^BTS2/.test(e.niveau) && e.actif !== false && (!ctx.niveau || e.niveau === ctx.niveau))
      .sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom));
    const pris = {}; eleves.forEach((e) => { const p = projetDe(e, ligneDe(e.id)); if (p) (pris[p] = pris[p] || []).push(e.nom); });
    const ent = P.projets.filter(estEnt), banque = P.projets.filter((p) => !estEnt(p));
    const libres = (ent.length ? ent : banque).filter((p) => !pris[p.id]);
    const doublons = Object.entries(pris).filter(([, v]) => v.length > 1);
    const opt = (val) => (p) => `<option value="${p.id}" ${val === p.id ? "selected" : ""}>${p.id} · ${esc(estEnt(p) ? p.partie : p.court)}</option>`;
    const opts = (val) => `<option value="">—</option>` + (ent.length
      ? CAS.map((c) => `<optgroup label="Entraînement ${c.id} · ${esc(c.domaine)}">${ent.filter((p) => p.cas === c.id).map(opt(val)).join("")}</optgroup>`).join("")
        + `<optgroup label="Banque de projets complets">${banque.map(opt(val)).join("")}</optgroup>`
      : banque.map(opt(val)).join(""));
    const rows = eleves.map((e) => {
      const r = ligneDe(e.id), pid = projetVu(e, r), p = pid && projet(pid), choix = (r.etat || {}).projet;
      const a = p ? avancement(p, r) : null;
      const aValider = p ? docsDu(p).filter((d) => (((r.etat || {}).docs || {})[d.id] || {}).s === 2 && !(((r.retours || {}).docs || {})[d.id] || {}).v).length : 0;
      const n1 = note("u61", r.evaluation), n2 = note("u62", r.evaluation);
      return `<tr data-id="${e.id}">
        <td><b>${esc(e.nom)}</b><br><span class="discret">${esc(SIP.niveau(e.niveau).court)}</span></td>
        <td><select data-attr="${e.id}" ${tableAbsente() ? "disabled" : ""} style="max-width:260px">${opts(r.projet || "")}</select>
          ${!r.projet && pid ? `<br><span class="discret">${ATTRIB[e.nom] || ATTRIB[String(e.nom).toLowerCase()] ? "attribué dans contenu/projets-reglages.js" : ""}</span>` : ""}
          ${!r.projet && choix ? `<br><span class="discret">choisi par l'étudiant : <b>${esc(choix)}</b></span> ${tableAbsente() ? "" : `<button class="btn-lien" data-valider="${e.id}" data-p="${esc(choix)}">Confirmer</button>`}` : ""}</td>
        ${["d1", "d2", "d3"].map((d) => `<td class="num">${a && a[d].n ? `${a[d].v + a[d].p}/${a[d].n}${a[d].v ? ` <span class="etiquette ok" title="validés">${a[d].v} ✓</span>` : ""}${a[d].r ? ` <span class="etiquette ko" title="à reprendre">${a[d].r} ↺</span>` : ""}` : "—"}</td>`).join("")}
        <td class="num">${aValider ? `<span class="etiquette alerte">${aValider}</span>` : "—"}</td>
        <td>${r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : "<span class='discret'>jamais</span>"}</td>
        <td class="num">${n1.complet ? `${SIP.nb(n1.v, 3)}/20` : "—"}</td><td class="num">${n2.complet ? `${SIP.nb(n2.v, 3)}/20` : "—"}</td>
        <td><button class="btn sec" data-ouvrir="${e.id}" ${p ? "" : "disabled"}>Ouvrir</button></td></tr>`;
    }).join("");
    ctx.cadre(`
      ${ERREUR ? (tableAbsente()
        ? `<div class="carte" style="border-left:4px solid var(--warn)"><h2 style="margin-top:0">Suivi des projets : une étape d'installation</h2>
           <p>Pour enregistrer les attributions, le travail des étudiants et tes validations, passe <b>une fois</b> le fichier <code>supabase/projets.sql</code> dans Supabase (<b>SQL Editor → New query</b>, colle le fichier, <b>Run</b>). Rien d'autre n'est modifié dans la base.</p>
           <p class="discret">En attendant, les étudiants travaillent sur leur appareil, et tu peux attribuer les projets dans <code>contenu/projets-reglages.js</code> (ligne <code>attribution</code>), directement sur GitHub.</p></div>`
        : `<p class="erreur">Projets : ${esc(ERREUR)}</p>`) : ""}
      <p class="discret">Un projet par étudiant${ent.length ? " : jusqu'en décembre, une partie d'un cas d'entraînement (E1-1, E1-2…), calée sur son vrai projet ; les étapes du parcours s'ouvrent au rythme de la classe" : ""}. Attribue-le ici (l'étudiant le voit aussitôt sur sa page « Projets BTS 2 »). « Ouvrir » montre ${ent.length ? "pour une partie d'entraînement les livrables de chaque étape ouverte et le positionnement de l'étape (que l'étudiant lit) ; pour un projet complet, " : ""}ses dossiers 1-2-3, son planning, son protocole de mise en service, son analyse des risques et le positionnement sur les grilles U61/U62. Prêts : documents que l'étudiant a déclarés prêts pour la revue, ou que tu as validés.</p>
      ${doublons.length ? `<p class="erreur">Projet attribué deux fois : ${doublons.map(([p, v]) => `${p} (${v.map(esc).join(", ")})`).join(" ; ")}</p>` : ""}
      ${eleves.length ? `<div class="table-defil"><table><thead><tr><th>Étudiant</th><th>Projet</th><th class="num">Dossier 1</th><th class="num">Dossier 2</th><th class="num">Dossier 3</th><th class="num">À valider</th><th>Dernier travail</th><th class="num">U61</th><th class="num">U62</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="carte"><p>Aucun étudiant de BTS 2. Crée leurs comptes (classe BTS 2 STI ou BTS 2 ADM) dans l'onglet « Élèves et codes ».</p></div>`}
      <p class="discret">${ent.length ? "Parties d'entraînement non attribuées" : "Projets non attribués"} (${libres.length}) : ${libres.map((p) => `<b>${p.id}</b> ${esc(estEnt(p) ? p.partie : p.court)}`).join(" · ") || "aucune"}.</p>
      <div class="rang"><button class="btn sec" id="pj-maj">Actualiser les projets</button><button class="btn sec" id="pj-csv">Exporter (CSV)</button><a class="btn sec" href="entrainements/bts-projets.html" target="_blank" rel="noopener">Page des étudiants ↗</a></div>`);
    document.querySelectorAll("[data-attr]").forEach((s) => (s.onchange = () => attribuer(s.dataset.attr, s.value || null)));
    document.querySelectorAll("[data-valider]").forEach((b) => (b.onclick = () => attribuer(b.dataset.valider, b.dataset.p)));
    document.querySelectorAll("[data-ouvrir]").forEach((b) => (b.onclick = () => { ouvert = b.dataset.ouvrir; vueEleve(ouvert); }));
    document.getElementById("pj-maj").onclick = async () => { await charger(); vueListe(); };
    document.getElementById("pj-csv").onclick = () => exporter(eleves);
  }

  async function maj(eleve_id, champs, quiet) {
    try {
      await SIP.api.profProjetMaj(eleve_id, champs);
      const r = (LIGNES || []).find((x) => x.eleve_id === eleve_id);
      if (r) Object.assign(r, champs, { maj_prof: new Date().toISOString() }); else (LIGNES = LIGNES || []).push(Object.assign({ eleve_id, projet: null, etat: {}, retours: {}, evaluation: {} }, champs));
      return true;
    } catch (e) { if (!quiet) alert("Enregistrement impossible : " + e.message); return false; }
  }
  async function attribuer(id, pid) {
    const r = ligneDe(id), e = ctx.D.eleves.find((x) => x.id === id);
    const ancien = r.projet;
    if (ancien && pid !== ancien && Object.keys(((r.etat || {}).docs) || {}).length && !confirm(`${e ? e.nom : "Cet étudiant"} a commencé à travailler sur ${ancien}. Changer son projet ? (Son travail sur ${ancien} reste dans la base mais ne correspondra plus à son projet.)`)) return vueListe();
    if (await maj(id, { projet: pid })) vueListe();
  }

  // ----------------------------- fiche d'un étudiant -----------------------------
  function vueEleve(id) {
    const e = ctx.D.eleves.find((x) => x.id === id); if (!e) { ouvert = null; return vueListe(); }
    const r = ligneDe(id), pid = projetVu(e, r), p = pid && projet(pid);
    if (!p) { ouvert = null; return vueListe(); }
    if (estEnt(p)) return vueEleveEnt(id, e, r, p);
    const et = r.etat || {}, rv = Object.assign({ docs: {} }, r.retours || {}), ev = Object.assign({ u61: {}, u62: {} }, r.evaluation || {});
    rv.docs = Object.assign({}, rv.docs);
    const a = avancement(p, r);
    const docLigne = (d) => {
      const s = ((et.docs || {})[d.id] || {}), v = rv.docs[d.id] || {};
      return `<tr data-doc="${d.id}"><td><b>${esc(d.titre)}</b><br><span class="discret">${PHASES[d.phase]} · ${d.crit.join(" ")}</span></td>
        <td>${s.s ? `<span class="etiquette ${s.s === 2 ? "accent" : ""}">${STATUTS[s.s]}</span>` : `<span class="discret">${STATUTS[0]}</span>`}
          ${urlSure(s.lien) ? `<br><a href="${esc(s.lien.trim())}" target="_blank" rel="noopener">Ouvrir le document ↗</a>` : ""}
          ${s.note ? `<br><span class="discret">« ${esc(s.note)} »</span>` : ""}</td>
        <td><div class="rang" style="gap:6px"><button class="btn ${v.v === "ok" ? "ok" : "sec"}" data-v="ok" title="Valider">✓ Validé</button><button class="btn ${v.v === "reprendre" ? "ko" : "sec"}" data-v="reprendre" title="À reprendre">↺ À reprendre</button>${v.v ? `<button class="btn-lien" data-v="">effacer</button>` : ""}</div>
          <input type="text" data-com placeholder="Commentaire pour l'étudiant" value="${esc(v.c || "")}" style="margin-top:6px"></td></tr>`;
    };
    const W = (et.planning && et.planning.lignes) || [];
    const sem = semaines(p);
    const plan = W.length ? `<div class="table-defil"><table><thead><tr><th>Tâche</th><th class="num">Heures</th><th>Début</th><th class="num">Durée</th></tr></thead><tbody>${W.map((l) => `<tr><td>${l.t ? `<span class="discret">${esc(l.t)}</span> ` : ""}${esc(l.txt)}</td><td class="num">${l.h ? l.h + " h" : ""}</td><td>${l.d != null && sem[l.d] ? "semaine du " + SIP.fmtDate(sem[l.d]) : "<span class='discret'>non placé</span>"}</td><td class="num">${l.n ? l.n + " sem." : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Pas encore commencé.</p>`;
    const mes = et.mes && et.mes.lignes ? `${et.mes.conditions ? `<p><b>Conditions :</b> ${esc(et.mes.conditions)}</p>` : ""}<div class="table-defil"><table><thead><tr><th>Phase</th><th>Opération</th><th>Moyen</th><th>Critère</th><th>Résultat</th><th>Conforme</th></tr></thead><tbody>${et.mes.lignes.map((l) => `<tr><td>${esc(l.phase)}</td><td>${esc(l.op)}</td><td>${esc(l.moyen)}</td><td>${esc(l.critere)} <span class="discret">${esc(l.ex || "")}</span></td><td>${esc(l.res)}</td><td>${l.ok === "oui" ? '<span class="etiquette ok">oui</span>' : l.ok === "non" ? '<span class="etiquette ko">non</span>' : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Pas encore commencé.</p>`;
    const ris = et.risques && et.risques.lignes ? `<div class="table-defil"><table><thead><tr><th>Tâche</th><th>Danger</th><th>Risque</th><th class="num">G×P</th><th>Prévention</th><th>Habilitation</th></tr></thead><tbody>${et.risques.lignes.map((l) => `<tr><td>${esc(l.tache)}</td><td>${esc(l.danger)}</td><td>${esc(l.risque)}</td><td class="num">${Number(l.g) && Number(l.p) ? Number(l.g) * Number(l.p) : "—"}</td><td>${esc(l.prevention)}</td><td>${esc(l.habil)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Pas encore commencé.</p>`;
    const grille = (u) => { const G = P.grilles[u], n = note(u, ev);
      return `<div class="carte" style="margin-bottom:12px"><h3>${G.unite} — ${esc(G.titre)} <span class="discret">coefficient ${G.coef}</span></h3>
        <div class="table-defil"><table><thead><tr><th>Compétence</th><th class="num">Poids</th>${NIV.map((x) => `<th class="num" title="${esc(x.lib)}">${x.code}<br><span class="discret">${x.pct} %</span></th>`).join("")}<th class="num">Points</th></tr></thead><tbody>
        ${G.competences.map((c) => { const pos = Number(ev[u][c.id]) || 0, niv = NIV.find((x) => x.n === pos);
          return `<tr><td><b>${c.id}</b> ${esc(c.lib)}<details><summary class="discret">Critères (${c.criteres.length}) · ${esc(c.evalue)}</summary><ul>${c.criteres.map((k) => `<li>${esc(k.txt)}${k.par ? ` <span class="discret">(${esc(k.par)})</span>` : ""}</li>`).join("")}</ul></details></td>
            <td class="num">${c.poids} %</td>${NIV.map((x) => `<td class="num"><input type="radio" name="${u}-${c.id}" data-u="${u}" data-c="${c.id}" value="${x.n}" ${pos === x.n ? "checked" : ""} aria-label="${c.id} ${x.code}" style="width:18px;height:18px;margin:0;padding:0;accent-color:var(--accent)"></td>`).join("")}
            <td class="num">${niv ? SIP.nb((20 * c.poids * niv.pct) / 10000, 3) : "—"} / ${SIP.nb((20 * c.poids) / 100, 3)}</td></tr>`; }).join("")}
        </tbody></table></div>
        <p><b>Note calculée : ${n.complet ? `${SIP.nb(n.v, 3)} / 20` : "positionne chaque compétence"}</b></p>
        <label class="discret" for="com-${u}">Commentaires destinés à éclairer le jury</label><textarea id="com-${u}" data-comu="${u}" rows="2" style="width:100%">${esc((ev[u] || {}).com || "")}</textarea></div>`; };
    ctx.cadre(`<p class="no-print"><button class="btn-lien" id="pj-ret">← Tous les projets</button></p>
      <h1>${esc(e.nom)} <span class="discret">· ${esc(SIP.niveau(e.niveau).nom)}</span></h1>
      <p><b>${p.id} — ${esc(p.titre)}</b>${projetDe(e, r) ? "" : ` <span class="etiquette alerte">choisi par l'étudiant, pas encore attribué</span>`}<br><span class="discret">${esc(p.client)} · ${esc(p.lieu)} · ${esc(P.supports[p.support].nom)}</span></p>
      <div class="stats">${P.dossiers.map((d) => `<div class="carte"><span class="discret">Dossier ${d.num} — validés</span><b>${a[d.id].v} / ${a[d.id].n}</b><span class="discret">${a[d.id].p} prêt${a[d.id].p > 1 ? "s" : ""} pour la revue${a[d.id].r ? ` · ${a[d.id].r} à reprendre` : ""}</span></div>`).join("")}
        <div class="carte"><span class="discret">Dernier travail</span><b style="font-size:1.1rem">${r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : "—"}</b></div></div>
      <div class="carte no-print" style="margin:12px 0"><label for="pj-msg"><b>Message pour l'étudiant</b> <span class="discret">(affiché en haut de sa page)</span></label>
        <textarea id="pj-msg" rows="2" style="width:100%">${esc(rv.message || "")}</textarea><div class="rang" style="margin-top:6px"><button class="btn" id="pj-msg-ok">Enregistrer le message</button><span class="discret" id="pj-etat"></span></div></div>
      ${P.dossiers.map((d) => `<h2>Dossier ${d.num} — ${esc(d.titre)}</h2>
        <div class="table-defil"><table><thead><tr><th>Document</th><th>Étudiant</th><th style="min-width:250px">Ta validation</th></tr></thead><tbody>${docsDu(p).filter((x) => x.dossier === d.id).map(docLigne).join("")}</tbody></table></div>`).join("")}
      <h2>Planning (réalisation par anticipation)</h2>${plan}
      <h2>Protocole et rapport de mise en service</h2>${mes}
      <h2>Analyse des risques</h2>${ris}
      <h2>Positionnement sur les grilles</h2>
      <p class="discret">Pour ton suivi : la note calculée suit les poids des grilles CCF (N1 0 %, N2 40 %, N3 75 %, N4 100 %). L'étudiant ne voit pas cette partie. La grille officielle reste à remplir pour le centre d'examen.</p>
      ${grille("u61")}${grille("u62")}
      <div class="rang no-print"><button class="btn sec" onclick="print()">Imprimer cette fiche</button></div>`);
    document.getElementById("pj-ret").onclick = () => { ouvert = null; vueListe(); };
    const etatTxt = (t) => { const el = document.getElementById("pj-etat"); if (el) el.textContent = t; };
    document.getElementById("pj-msg-ok").onclick = async () => { rv.message = document.getElementById("pj-msg").value.slice(0, 2000); rv.le = new Date().toISOString(); if (await maj(id, { retours: rv })) etatTxt("Message enregistré ✓"); };
    document.querySelectorAll("tr[data-doc]").forEach((tr) => {
      const did = tr.dataset.doc;
      tr.querySelectorAll("[data-v]").forEach((b) => (b.onclick = async () => {
        const com = tr.querySelector("[data-com]").value.slice(0, 1000);
        if (b.dataset.v) rv.docs[did] = { v: b.dataset.v, c: com, le: new Date().toISOString() }; else delete rv.docs[did];
        if (await maj(id, { retours: rv })) vueEleve(id);
      }));
      const ci = tr.querySelector("[data-com]");
      ci.onchange = async () => { const v = rv.docs[did] || { v: "", le: new Date().toISOString() }; v.c = ci.value.slice(0, 1000); rv.docs[did] = v; if (!v.v && !v.c) delete rv.docs[did]; if (await maj(id, { retours: rv }, true)) etatTxt("Commentaire enregistré ✓"); };
    });
    document.querySelectorAll("input[type=radio][data-u]").forEach((x) => (x.onchange = async () => { ev[x.dataset.u][x.dataset.c] = Number(x.value); if (await maj(id, { evaluation: ev })) vueEleve(id); }));
    document.querySelectorAll("[data-comu]").forEach((t) => (t.onchange = async () => { ev[t.dataset.comu].com = t.value.slice(0, 2000); if (await maj(id, { evaluation: ev }, true)) etatTxt("Commentaire de grille enregistré ✓"); }));
    window.scrollTo(0, 0);
  }
  // ----------------------------- fiche d'un étudiant en parcours d'entraînement -----------------------------
  function vueEleveEnt(id, e, r, p) {
    const et = r.etat || {}, rv = Object.assign({ docs: {}, etapes: {} }, r.retours || {});
    rv.docs = Object.assign({}, rv.docs); rv.etapes = Object.assign({}, rv.etapes);
    const c = CAS.find((x) => x.id === p.cas) || { domaine: "" };
    const auto = et.auto || {};
    const docLigne = (d) => {
      const s = ((et.docs || {})[d.id] || {}), v = rv.docs[d.id] || {};
      return `<tr data-doc="${d.id}"><td><b>${esc(d.titre)}</b>${d.option ? ` <span class="etiquette">facultatif</span>` : ""}<br><span class="discret">dossier ${d.dossier.slice(1)} · ${d.crit.join(" ")}</span></td>
        <td>${s.s ? `<span class="etiquette ${s.s === 2 ? "accent" : ""}">${STATUTS[s.s]}</span>` : `<span class="discret">${STATUTS[0]}</span>`}
          ${urlSure(s.lien) ? `<br><a href="${esc(s.lien.trim())}" target="_blank" rel="noopener">Ouvrir le document ↗</a>` : ""}
          ${s.note ? `<br><span class="discret">« ${esc(s.note)} »</span>` : ""}</td>
        <td><div class="rang" style="gap:6px"><button class="btn ${v.v === "ok" ? "ok" : "sec"}" data-v="ok" title="Valider">✓ Validé</button><button class="btn ${v.v === "reprendre" ? "ko" : "sec"}" data-v="reprendre" title="À reprendre">↺ À reprendre</button>${v.v ? `<button class="btn-lien" data-v="">effacer</button>` : ""}</div>
          <input type="text" data-com placeholder="Commentaire pour l'étudiant" value="${esc(v.c || "")}" style="margin-top:6px"></td></tr>`;
    };
    const desc = (P.parcours && P.parcours.etape1 && P.parcours.etape1.descripteurs) || {};
    const etape = (x) => {
      const pr = (rv.etapes[x.id] || {}).pos || {}, au = auto[x.id] || {};
      return `<h2>Étape ${x.n} — ${esc(x.titre)} <span class="discret">${esc(x.quand)}</span></h2>
        <div class="table-defil"><table><thead><tr><th>Livrable</th><th>Étudiant</th><th style="min-width:250px">Ta validation</th></tr></thead><tbody>${docsDu(p).filter((d) => d.etape === x.id).map(docLigne).join("")}</tbody></table></div>
        <h3>Positionnement de l'étape <span class="discret">formatif, lu par l'étudiant</span></h3>
        <div class="table-defil"><table><thead><tr><th>Critère</th><th class="num">Étudiant</th>${NIV.map((n) => `<th class="num" title="${esc(n.lib)}">${n.code}</th>`).join("")}</tr></thead><tbody>
          ${x.crit.map((k) => `<tr><td><b>${k}</b> ${esc(CRIT[k] || "")}</td><td class="num">${au[k] ? `N${au[k]}` : "—"}</td>${NIV.map((n) => `<td class="num" title="${esc(((desc[k] || [])[n.n - 1]) || n.lib)}"><input type="radio" name="pos-${x.id}-${k.replace(".", "_")}" data-et="${x.id}" data-k="${k}" value="${n.n}" ${Number(pr[k]) === n.n ? "checked" : ""} aria-label="${k} ${n.code}" style="width:18px;height:18px;margin:0;padding:0;accent-color:var(--accent)"></td>`).join("")}</tr>`).join("")}
        </tbody></table></div>
        <label class="discret" for="etc-${x.id}">Retour sur l'étape (lu par l'étudiant)</label><textarea id="etc-${x.id}" data-etc="${x.id}" rows="2" style="width:100%">${esc((rv.etapes[x.id] || {}).c || "")}</textarea>`;
    };
    const avenir = ETAPES.filter((x) => !x.ouverte);
    ctx.cadre(`<p class="no-print"><button class="btn-lien" id="pj-ret">← Tous les projets</button></p>
      <h1>${esc(e.nom)} <span class="discret">· ${esc(SIP.niveau(e.niveau).nom)}</span></h1>
      <p><b>${p.id} — ${esc(p.partie)}</b> <span class="etiquette accent">entraînement · cas ${esc(p.cas)} : ${esc(c.domaine)}</span>${projetDe(e, r) ? "" : ` <span class="etiquette alerte">choisie par l'étudiant, pas encore attribuée</span>`}<br><span class="discret">${esc(p.court)} — ${esc(p.client)} · prépare : ${esc(p.prepare)}</span></p>
      <div class="carte no-print" style="margin:12px 0"><label for="pj-msg"><b>Message pour l'étudiant</b> <span class="discret">(affiché en haut de sa page)</span></label>
        <textarea id="pj-msg" rows="2" style="width:100%">${esc(rv.message || "")}</textarea><div class="rang" style="margin-top:6px"><button class="btn" id="pj-msg-ok">Enregistrer le message</button><span class="discret" id="pj-etat"></span><span class="discret">Dernier travail : ${r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : "jamais"}</span></div></div>
      ${ouvertes().map(etape).join("")}
      ${avenir.length ? `<h2>Étapes à venir</h2><p class="discret">${avenir.map((x) => `${x.n} · ${esc(x.titre)} (${esc(x.quand)})`).join(" ; ")}.</p>` : ""}
      <p class="discret">Le positionnement sur les grilles U61 et U62 du CCF se fera sur le vrai projet, à partir de janvier.</p>
      <div class="rang no-print"><button class="btn sec" onclick="print()">Imprimer cette fiche</button></div>`);
    document.getElementById("pj-ret").onclick = () => { ouvert = null; vueListe(); };
    const etatTxt = (t) => { const el = document.getElementById("pj-etat"); if (el) el.textContent = t; };
    document.getElementById("pj-msg-ok").onclick = async () => { rv.message = document.getElementById("pj-msg").value.slice(0, 2000); rv.le = new Date().toISOString(); if (await maj(id, { retours: rv })) etatTxt("Message enregistré ✓"); };
    document.querySelectorAll("tr[data-doc]").forEach((tr) => {
      const did = tr.dataset.doc;
      tr.querySelectorAll("[data-v]").forEach((b) => (b.onclick = async () => {
        const com = tr.querySelector("[data-com]").value.slice(0, 1000);
        if (b.dataset.v) rv.docs[did] = { v: b.dataset.v, c: com, le: new Date().toISOString() }; else delete rv.docs[did];
        if (await maj(id, { retours: rv })) vueEleve(id);
      }));
      const ci = tr.querySelector("[data-com]");
      ci.onchange = async () => { const v = rv.docs[did] || { v: "", le: new Date().toISOString() }; v.c = ci.value.slice(0, 1000); rv.docs[did] = v; if (!v.v && !v.c) delete rv.docs[did]; if (await maj(id, { retours: rv }, true)) etatTxt("Commentaire enregistré ✓"); };
    });
    document.querySelectorAll("input[type=radio][data-et]").forEach((x) => (x.onchange = async () => {
      const ex = rv.etapes[x.dataset.et] || {};
      rv.etapes[x.dataset.et] = Object.assign({}, ex, { pos: Object.assign({}, ex.pos, { [x.dataset.k]: Number(x.value) }), le: new Date().toISOString() });
      if (await maj(id, { retours: rv }, true)) etatTxt(`Positionnement ${x.dataset.k} enregistré ✓`);
    }));
    document.querySelectorAll("[data-etc]").forEach((t) => (t.onchange = async () => {
      const ex = rv.etapes[t.dataset.etc] || {};
      rv.etapes[t.dataset.etc] = Object.assign({}, ex, { c: t.value.slice(0, 2000), le: new Date().toISOString() });
      if (await maj(id, { retours: rv }, true)) etatTxt("Retour sur l'étape enregistré ✓");
    }));
    window.scrollTo(0, 0);
  }
  function semaines(p) {
    const per = p && p.periodes ? p.periodes : (REG.periodes && REG.periodes.length ? REG.periodes : P.periodes);
    const jal = (p && p.jalons ? p.jalons : (REG.jalons && REG.jalons.length ? REG.jalons : P.jalons)).slice().sort((a, b) => a.date.localeCompare(b.date));
    const L = []; for (let d = SIP.lundi(per[0].debut); d <= SIP.lundi(jal[jal.length - 1].date); d = SIP.ajouterJours(d, 7)) L.push(d); return L;
  }
  function exporter(eleves) {
    const sep = ";", q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lignes = [["Étudiant", "Classe", "Projet", "Titre", "Dossier 1 (prêts/total)", "Dossier 2", "Dossier 3", "Note U61 (calculée)", "Note U62 (calculée)", "Dernier travail"].map(q).join(sep)];
    eleves.forEach((e) => { const r = ligneDe(e.id), pid = projetDe(e, r), p = pid && projet(pid), a = p ? avancement(p, r) : null, n1 = note("u61", r.evaluation), n2 = note("u62", r.evaluation);
      lignes.push([e.nom, SIP.niveau(e.niveau).court, pid || "", p ? (estEnt(p) ? `${p.partie} (entraînement, cas ${p.cas})` : p.titre) : "", ...["d1", "d2", "d3"].map((d) => (a ? `${a[d].v + a[d].p}/${a[d].n}` : "")), n1.complet ? String(n1.v).replace(".", ",") : "", n2.complet ? String(n2.v).replace(".", ",") : "", r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : ""].map(q).join(sep)); });
    const b = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" }), u = URL.createObjectURL(b), l = document.createElement("a");
    l.href = u; l.download = "projets-bts2.csv"; document.body.appendChild(l); l.click(); setTimeout(() => { URL.revokeObjectURL(u); l.remove(); }, 500);
  }

  SIP.profProjets = { afficher, recharger: async () => { LIGNES = null; await charger(); }, fermer: () => { ouvert = null; } };
})(window.SIP);
