/* =====================================================================
   SI Papara — espace prof : onglet « Projets BTS 2 »
   Attribution des 13 projets, avancement des dossiers 1-2-3 de chaque étudiant,
   validation des documents (retours lus par l'étudiant), planning, protocole de
   mise en service et analyse des risques en lecture, positionnement N1–N4 sur les
   grilles U61/U62 (note calculée, jamais montrée à l'étudiant).
   Données : table projets_eleves (supabase/projets.sql) ; contenu/projets-bts2.js et
   contenu/projets-entrainement.js (parcours d'entraînement : cinq cas, une partie par étudiant,
   E1-1, E1-2… ; livrables des étapes ouvertes et positionnement N1–N4 de l'étape, lu par l'étudiant).
   Espace de dépôt : fichiers déposés par chaque étudiant dans ses dossiers 1, 2, 3 (table depots et
   compartiment de stockage privé « depots ») ; ouvrir, tout télécharger en .zip, supprimer.
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

  let LIGNES = null, ERREUR = "", ouvert = null, ctx = null, DEPOTS = null, ERR_DEP = "";
  const ligneDe = (id) => (LIGNES || []).find((r) => r.eleve_id === id) || { eleve_id: id, projet: null, etat: {}, retours: {}, evaluation: {} };
  const projetDe = (e, r) => r.projet || ATTRIB[e.nom] || ATTRIB[String(e.nom).toLowerCase()] || null;     // attribué (base ou réglages)
  const projetVu = (e, r) => projetDe(e, r) || (r.etat || {}).projet || null;                                  // ou, à défaut, choisi par l'étudiant
  async function charger() {
    try { LIGNES = await SIP.api.profProjets(); ERREUR = ""; }
    catch (e) { LIGNES = null; ERREUR = e.message || String(e); }
    try { DEPOTS = SIP.api.profDepots ? await SIP.api.profDepots() : []; ERR_DEP = ""; }
    catch (e) { DEPOTS = []; ERR_DEP = e.message || String(e); }
  }

  // ----------------------------- espace de dépôt -----------------------------
  const depotsAbsents = () => !!ERR_DEP && /depots|does not exist|schema cache|relation|PGRST205|404/i.test(ERR_DEP);
  const depotsDe = (id) => (DEPOTS || []).filter((x) => x.eleve_id === id).sort((a, b) => String(a.depose_le).localeCompare(String(b.depose_le)));
  const TITRES_DOCS = {};
  P.docs_communs.forEach((d) => (TITRES_DOCS[d.id] = d.titre));
  ETAPES.forEach((e) => e.livrables.forEach((l) => (TITRES_DOCS[l.id] = `${l.titre} (étape ${e.n})`)));
  const LIM_ELEVE = (SIP.LIMITES_DEPOT || {}).eleve || 75 * 1048576;
  const fmtTaille = (o) => (!o || o <= 0 ? "0 Mo" : o >= 1048576 ? (o / 1048576).toFixed(o >= 10485760 ? 0 : 1).replace(".", ",") + " Mo" : Math.max(1, Math.round(o / 1024)) + " ko");
  const enLigne = (t) => /^(application\/pdf|image\/(png|jpeg|gif|webp)|text\/plain)$/.test(t || "");
  const msgDepot = (e) => { const m = String((e && e.message) || e || ""); return /DEMO_NON_GARDE/.test(m) ? "en démonstration, seuls les fichiers de 1,5 Mo au plus sont gardés dans le navigateur" : /DEPOT_INTROUVABLE/.test(m) ? "fichier absent du stockage" : m; };
  // groupes d'un dossier : documents attendus (dans l'ordre), autres documents connus, autres pièces ; versions dans l'ordre de dépôt
  function groupesDepot(D, p, dossier) {
    const A = (p ? docsDu(p) : []).filter((d) => d.dossier === dossier).map((d) => d.id);
    const L = D.filter((x) => x.dossier === dossier), cles = [];
    A.forEach((id) => { if (L.some((x) => x.doc === id)) cles.push(id); });
    L.forEach((x) => { if (x.doc && !cles.includes(x.doc)) cles.push(x.doc); });
    if (L.some((x) => !x.doc)) cles.push("");
    return cles.map((k) => ({ doc: k, titre: k ? TITRES_DOCS[k] || k : "Autres pièces", fichiers: L.filter((x) => (x.doc || "") === k) }));
  }
  const versionDe = (g, x) => (g.doc ? "v" + (g.fichiers.indexOf(x) + 1) : "");
  function sectionDepots(e, p) {
    if (depotsAbsents()) return `<h2>Espace de dépôt</h2><div class="carte" style="border-left:4px solid var(--warn)"><p style="margin:0">Pas encore activé : relance <b>une fois</b> le fichier <code>supabase/projets.sql</code> dans Supabase (SQL Editor → New query → Run). Il crée le compartiment de stockage privé « depots ».</p></div>`;
    const D = depotsDe(e.id), actifs = D.filter((x) => !x.retire_le), retires = D.filter((x) => x.retire_le);
    const poids = (L) => L.reduce((t, x) => t + Number(x.taille || 0), 0);
    const ligne = (g, x, i) => `<tr data-dep-ligne="${x.id}" style="${x.retire_le ? "opacity:.6" : ""}">
        <td>${i === 0 ? `<b>${esc(g.titre)}</b>` : ""}</td>
        <td>${g.doc ? `<span class="mono">${versionDe(g, x)}</span> ` : ""}<span style="${x.retire_le ? "text-decoration:line-through" : ""}">${esc(x.nom)}</span>
          ${!x.vu_le && !x.retire_le ? ` <span class="etiquette alerte" data-nouveau="${x.id}">nouveau</span>` : ""}${x.retire_le ? `<br><span class="discret">retiré par l'étudiant le ${SIP.fmtDate(x.retire_le, true)}</span>` : ""}</td>
        <td>${SIP.fmtDate(x.depose_le, true)}</td><td class="num">${fmtTaille(Number(x.taille))}</td>
        <td style="white-space:nowrap"><button class="btn sec" data-fic="${x.id}">${enLigne(x.type) ? "Ouvrir" : "Télécharger"}</button> <button class="btn-lien" data-suppr="${x.id}">supprimer</button></td></tr>`;
    return `<h2>Espace de dépôt <span class="discret">${actifs.length} fichier${actifs.length > 1 ? "s" : ""}${retires.length ? ` (+ ${retires.length} retiré${retires.length > 1 ? "s" : ""})` : ""} · ${fmtTaille(poids(D))} utilisés sur ${fmtTaille(LIM_ELEVE)}</span></h2>
      ${D.length ? `<div class="rang no-print" style="margin-bottom:10px">${actifs.length ? `<button class="btn" data-zip="${e.id}">Tout télécharger (.zip)</button>` : ""}${retires.length ? `<button class="btn sec" data-purge="${e.id}">Supprimer définitivement les fichiers retirés (${retires.length}, ${fmtTaille(poids(retires))})</button>` : ""}<span class="discret" id="dep-etat"></span></div>
      ${P.dossiers.map((d) => { const G = groupesDepot(D, p, d.id); if (!G.length) return "";
        return `<h3 style="margin:16px 0 6px">Dossier ${d.num} — ${esc(d.titre)}</h3><div class="table-defil"><table style="table-layout:fixed;min-width:720px"><colgroup><col style="width:29%"><col style="width:30%"><col style="width:14%"><col style="width:7%"><col style="width:20%"></colgroup><thead><tr><th>Document</th><th>Fichier</th><th>Déposé le</th><th class="num">Taille</th><th></th></tr></thead><tbody>
          ${G.map((g) => g.fichiers.slice().reverse().map((x, i) => ligne(g, x, i)).join("")).join("")}</tbody></table></div>`; }).join("")}`
        : `<p class="discret">Aucun fichier déposé pour l'instant. L'étudiant dépose ses fichiers depuis l'onglet « Mon dépôt » de sa page Projets BTS 2.</p>`}`;
  }
  // dans la ligne d'un document : la dernière version déposée
  function depotDuDoc(eid, d) {
    const F = depotsDe(eid).filter((x) => x.doc === d.id && x.dossier === d.dossier && !x.retire_le); if (!F.length) return "";
    const der = F[F.length - 1], nv = F.filter((x) => !x.vu_le).length;
    return `<br><span class="discret">${F.length} fichier${F.length > 1 ? "s" : ""} déposé${F.length > 1 ? "s" : ""}, dernier le ${SIP.fmtDate(der.depose_le, true)}</span> <button class="btn-lien" data-fic="${der.id}">${enLigne(der.type) ? "ouvrir" : "télécharger"} v${F.length}</button>${nv ? ` <span class="etiquette alerte" data-nouveau-doc="${d.id}">${nv} nouveau${nv > 1 ? "x" : ""}</span>` : ""}`;
  }
  async function marquerVu(rows) {
    const ids = rows.filter((x) => !x.vu_le).map((x) => x.id); if (!ids.length) return;
    try { const t = await SIP.api.profDepotVu(ids); rows.forEach((x) => { if (!x.vu_le) x.vu_le = t; }); ids.forEach((i) => document.querySelectorAll(`[data-nouveau="${i}"]`).forEach((b) => b.remove())); }
    catch (e) { /* le marquage n'est qu'une aide : on n'interrompt pas le professeur */ }
  }
  function telechargerBlob(blob, nom) { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = nom; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500); }
  // archive .zip sans compression (les PDF, images et fichiers Office sont déjà compressés)
  const TABLE_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = TABLE_CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  function zipStocke(fichiers) {
    const enc = new TextEncoder(), parts = [], centre = []; let off = 0;
    fichiers.forEach((f) => {
      const nom = enc.encode(f.nom), d = f.date, crc = crc32(f.data), n = f.data.length;
      const heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), jour = ((Math.max(1980, d.getFullYear()) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
      const l = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, heure, 2], [12, jour, 2], [14, crc, 4], [18, n, 4], [22, n, 4], [26, nom.length, 2], [28, 0, 2]]
        .forEach(([o, v, t]) => (t === 4 ? l.setUint32(o, v, true) : l.setUint16(o, v, true)));
      const c = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, heure, 2], [14, jour, 2], [16, crc, 4], [20, n, 4], [24, n, 4], [28, nom.length, 2],
        [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, t]) => (t === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true)));
      parts.push(l.buffer, nom, f.data); centre.push(c.buffer, nom);
      off += 30 + nom.length + n;
    });
    const tc = centre.reduce((t, x) => t + x.byteLength, 0), fin = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, fichiers.length, 2], [10, fichiers.length, 2], [12, tc, 4], [16, off, 4], [20, 0, 2]]
      .forEach(([o, v, t]) => (t === 4 ? fin.setUint32(o, v, true) : fin.setUint16(o, v, true)));
    return new Blob([...parts, ...centre, fin.buffer], { type: "application/zip" });
  }
  const propre = (t, n) => String(t || "").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/\s+/g, " ").trim().slice(0, n || 80) || "sans titre";
  async function zipper(e, p, btn) {
    const D = depotsDe(e.id).filter((x) => !x.retire_le); if (!D.length) return;
    const etat = document.getElementById("dep-etat"), t0 = btn.textContent; btn.disabled = true;
    const fichiers = [], manquants = [], pris = new Set(); let i = 0;
    for (const d of P.dossiers) for (const g of groupesDepot(D, p, d.id)) for (const x of g.fichiers) {
      btn.textContent = `Préparation… ${++i}/${D.length}`;
      try {
        const blob = await SIP.api.profDepotBlob(x);
        const quand = new Date(x.depose_le), pre = g.doc ? versionDe(g, x) : SIP.fmtDate(x.depose_le, true).replace(/[/:]/g, "-");
        let nom = `${propre(`Dossier ${d.num} - ${d.titre}`)}/${propre(g.titre)}/${propre(`${pre} - ${x.nom}`, 120)}`;
        for (let k = 2; pris.has(nom); k++) nom = nom.replace(/( \(\d+\))?(\.[^./]*)?$/, (m0, a, ext) => ` (${k})${ext || ""}`);
        pris.add(nom); fichiers.push({ nom, data: new Uint8Array(await blob.arrayBuffer()), date: quand });
      } catch (x2) { manquants.push(x.nom); }
    }
    btn.textContent = t0; btn.disabled = false;
    if (!fichiers.length) { alert("Aucun fichier n'a pu être téléchargé : " + manquants.join(", ")); return; }
    const ascii = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7e]/g, "");   // nom d'archive sans accents : accepté partout
    telechargerBlob(zipStocke(fichiers), `Depot - ${ascii(propre(e.nom))} - ${SIP.aujourdhui()}.zip`);
    await marquerVu(D.filter((x) => !manquants.includes(x.nom)));
    if (etat) etat.textContent = manquants.length ? `Archive créée ; fichiers manquants : ${manquants.join(", ")}` : `Archive créée : ${fichiers.length} fichier${fichiers.length > 1 ? "s" : ""} ✓`;
    document.querySelectorAll("[data-nouveau-doc]").forEach((b) => b.remove());
  }
  function brancherDepots(id, e, p) {
    const ligne = (x) => (DEPOTS || []).find((r) => r.id === x);
    const rafraichir = () => { const y = window.scrollY; vueEleve(id); window.scrollTo(0, y); };
    document.querySelectorAll("[data-fic]").forEach((b) => (b.onclick = async () => {
      const x = ligne(b.dataset.fic); if (!x) return;
      const inline = enLigne(x.type), w = inline ? window.open("", "_blank") : null;
      try {
        const u = await SIP.api.profDepotUrl(x, { telecharger: !inline });
        if (w) { w.opener = null; w.location.href = u; } else { const a = document.createElement("a"); a.href = u; a.download = x.nom; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1500); }
        await marquerVu([x]);
      } catch (err) { if (w) w.close(); alert("Ouverture impossible : " + msgDepot(err)); }
    }));
    document.querySelectorAll("[data-suppr]").forEach((b) => (b.onclick = async () => {
      const x = ligne(b.dataset.suppr); if (!x) return;
      if (!confirm(`Supprimer définitivement « ${x.nom} » ? L'étudiant ne le verra plus et le fichier sera effacé du stockage.`)) return;
      try { const res = await SIP.api.profDepotSupprimer([x]); DEPOTS = DEPOTS.filter((r) => !res.supprimes.includes(r.id)); rafraichir(); if (res.restants.length) alert("Pas supprimé (stockage) : " + res.restants.join(", ")); } catch (err) { alert("Suppression impossible : " + msgDepot(err)); }
    }));
    const pu = document.querySelector("[data-purge]");
    if (pu) pu.onclick = async () => {
      const R = depotsDe(id).filter((x) => x.retire_le);
      if (!confirm(`Supprimer définitivement les ${R.length} fichier(s) retiré(s) par l'étudiant ? Ils seront effacés du stockage.`)) return;
      try { const res = await SIP.api.profDepotSupprimer(R); DEPOTS = DEPOTS.filter((r) => !res.supprimes.includes(r.id)); rafraichir(); if (res.restants.length) alert("Pas supprimé (stockage) : " + res.restants.join(", ")); } catch (err) { alert("Suppression impossible : " + msgDepot(err)); }
    };
    const z = document.querySelector("[data-zip]");
    if (z) z.onclick = () => zipper(e, p, z);
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
      const D = depotsDe(e.id).filter((x) => !x.retire_le), nv = D.filter((x) => !x.vu_le).length;
      return `<tr data-id="${e.id}">
        <td><b>${esc(e.nom)}</b><br><span class="discret">${esc(SIP.niveau(e.niveau).court)}</span></td>
        <td><select data-attr="${e.id}" ${tableAbsente() ? "disabled" : ""} style="max-width:260px">${opts(r.projet || "")}</select>
          ${!r.projet && pid ? `<br><span class="discret">${ATTRIB[e.nom] || ATTRIB[String(e.nom).toLowerCase()] ? "attribué dans contenu/projets-reglages.js" : ""}</span>` : ""}
          ${!r.projet && choix ? `<br><span class="discret">choisi par l'étudiant : <b>${esc(choix)}</b></span> ${tableAbsente() ? "" : `<button class="btn-lien" data-valider="${e.id}" data-p="${esc(choix)}">Confirmer</button>`}` : ""}</td>
        ${["d1", "d2", "d3"].map((d) => `<td class="num">${a && a[d].n ? `${a[d].v + a[d].p}/${a[d].n}${a[d].v ? ` <span class="etiquette ok" title="validés">${a[d].v} ✓</span>` : ""}${a[d].r ? ` <span class="etiquette ko" title="à reprendre">${a[d].r} ↺</span>` : ""}` : "—"}</td>`).join("")}
        <td class="num">${aValider ? `<span class="etiquette alerte">${aValider}</span>` : "—"}</td>
        <td class="num">${D.length ? `${D.length}${nv ? ` <span class="etiquette alerte" title="pas encore ouverts">${nv} nouveau${nv > 1 ? "x" : ""}</span>` : ""}` : "—"}</td>
        <td>${r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : "<span class='discret'>jamais</span>"}</td>
        <td class="num">${n1.complet ? `${SIP.nb(n1.v, 3)}/20` : "—"}</td><td class="num">${n2.complet ? `${SIP.nb(n2.v, 3)}/20` : "—"}</td>
        <td><button class="btn sec" data-ouvrir="${e.id}" ${p || D.length ? "" : "disabled"}>Ouvrir</button></td></tr>`;
    }).join("");
    ctx.cadre(`
      ${ERREUR ? (tableAbsente()
        ? `<div class="carte" style="border-left:4px solid var(--warn)"><h2 style="margin-top:0">Suivi des projets : une étape d'installation</h2>
           <p>Pour enregistrer les attributions, le travail des étudiants et tes validations, passe <b>une fois</b> le fichier <code>supabase/projets.sql</code> dans Supabase (<b>SQL Editor → New query</b>, colle le fichier, <b>Run</b>). Rien d'autre n'est modifié dans la base.</p>
           <p class="discret">En attendant, les étudiants travaillent sur leur appareil, et tu peux attribuer les projets dans <code>contenu/projets-reglages.js</code> (ligne <code>attribution</code>), directement sur GitHub.</p></div>`
        : `<p class="erreur">Projets : ${esc(ERREUR)}</p>`) : ""}
      <p class="discret">Un projet par étudiant${ent.length ? " : jusqu'en décembre, une partie d'un cas d'entraînement (E1-1, E1-2…), calée sur son vrai projet ; les étapes du parcours s'ouvrent au rythme de la classe" : ""}. Attribue-le ici (l'étudiant le voit aussitôt sur sa page « Projets BTS 2 »). « Ouvrir » montre ${ent.length ? "pour une partie d'entraînement les livrables de chaque étape ouverte et le positionnement de l'étape (que l'étudiant lit) ; pour un projet complet, " : ""}ses dossiers 1-2-3, son planning, son protocole de mise en service, son analyse des risques et le positionnement sur les grilles U61/U62. Prêts : documents que l'étudiant a déclarés prêts pour la revue, ou que tu as validés.</p>
      ${(() => {   // nouveaux dépôts (pas encore ouverts), tous étudiants
        if (depotsAbsents()) return `<div class="carte" style="border-left:4px solid var(--warn)"><p style="margin:0"><b>Espace de dépôt des fichiers :</b> relance <b>une fois</b> <code>supabase/projets.sql</code> dans Supabase pour l'activer (il crée le compartiment de stockage privé « depots »).</p></div>`;
        const ids = new Set(eleves.map((e) => e.id)), N = (DEPOTS || []).filter((x) => ids.has(x.eleve_id) && !x.vu_le && !x.retire_le).sort((a, b) => String(b.depose_le).localeCompare(String(a.depose_le)));
        if (!N.length) return "";
        const nom = (id) => (eleves.find((e) => e.id === id) || {}).nom || "";
        return `<div class="carte"><h3 style="margin-top:0">Nouveaux dépôts <span class="discret">${N.length} fichier${N.length > 1 ? "s" : ""} pas encore ouvert${N.length > 1 ? "s" : ""}</span></h3>
          <ul style="margin:0">${N.slice(0, 8).map((x) => `<li><b>${esc(nom(x.eleve_id))}</b> · dossier ${x.dossier.slice(1)} · ${esc(x.doc ? TITRES_DOCS[x.doc] || x.doc : "autre pièce")} : ${esc(x.nom)} <span class="discret">(${SIP.fmtDate(x.depose_le, true)})</span> <button class="btn-lien" data-ouvrir="${x.eleve_id}">voir</button></li>`).join("")}</ul>
          ${N.length > 8 ? `<p class="discret" style="margin:6px 0 0">… et ${N.length - 8} autre${N.length - 8 > 1 ? "s" : ""}.</p>` : ""}</div>`;
      })()}
      ${doublons.length ? `<p class="erreur">Projet attribué deux fois : ${doublons.map(([p, v]) => `${p} (${v.map(esc).join(", ")})`).join(" ; ")}</p>` : ""}
      ${eleves.length ? `<div class="table-defil"><table><thead><tr><th>Étudiant</th><th>Projet</th><th class="num">Dossier 1</th><th class="num">Dossier 2</th><th class="num">Dossier 3</th><th class="num">À valider</th><th class="num">Dépôts</th><th>Dernier travail</th><th class="num">U61</th><th class="num">U62</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
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
    if (!p) { if (depotsDe(id).length) return vueEleveDepot(id, e); ouvert = null; return vueListe(); }
    if (estEnt(p)) return vueEleveEnt(id, e, r, p);
    const et = r.etat || {}, rv = Object.assign({ docs: {} }, r.retours || {}), ev = Object.assign({ u61: {}, u62: {} }, r.evaluation || {});
    rv.docs = Object.assign({}, rv.docs);
    const a = avancement(p, r);
    const docLigne = (d) => {
      const s = ((et.docs || {})[d.id] || {}), v = rv.docs[d.id] || {};
      return `<tr data-doc="${d.id}"><td><b>${esc(d.titre)}</b><br><span class="discret">${PHASES[d.phase]} · ${d.crit.join(" ")}</span></td>
        <td>${s.s ? `<span class="etiquette ${s.s === 2 ? "accent" : ""}">${STATUTS[s.s]}</span>` : `<span class="discret">${STATUTS[0]}</span>`}
          ${urlSure(s.lien) ? `<br><a href="${esc(s.lien.trim())}" target="_blank" rel="noopener">Ouvrir le document ↗</a>` : ""}
          ${s.note ? `<br><span class="discret">« ${esc(s.note)} »</span>` : ""}${depotDuDoc(id, d)}</td>
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
      ${sectionDepots(e, p)}
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
    brancherDepots(id, e, p);
    window.scrollTo(0, 0);
  }
  // fiche d'un étudiant sans projet ni partie, qui a déjà déposé des fichiers
  function vueEleveDepot(id, e) {
    ctx.cadre(`<p class="no-print"><button class="btn-lien" id="pj-ret">← Tous les projets</button></p>
      <h1>${esc(e.nom)} <span class="discret">· ${esc(SIP.niveau(e.niveau).nom)}</span></h1>
      <p class="discret">Pas encore de projet ni de partie attribués : seul son espace de dépôt est affiché.</p>
      ${sectionDepots(e, null)}`);
    document.getElementById("pj-ret").onclick = () => { ouvert = null; vueListe(); };
    brancherDepots(id, e, null);
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
          ${s.note ? `<br><span class="discret">« ${esc(s.note)} »</span>` : ""}${depotDuDoc(id, d)}</td>
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
      ${sectionDepots(e, p)}
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
    brancherDepots(id, e, p);
    window.scrollTo(0, 0);
  }
  function semaines(p) {
    const per = p && p.periodes ? p.periodes : (REG.periodes && REG.periodes.length ? REG.periodes : P.periodes);
    const jal = (p && p.jalons ? p.jalons : (REG.jalons && REG.jalons.length ? REG.jalons : P.jalons)).slice().sort((a, b) => a.date.localeCompare(b.date));
    const L = []; for (let d = SIP.lundi(per[0].debut); d <= SIP.lundi(jal[jal.length - 1].date); d = SIP.ajouterJours(d, 7)) L.push(d); return L;
  }
  function exporter(eleves) {
    const sep = ";", q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lignes = [["Étudiant", "Classe", "Projet", "Titre", "Dossier 1 (prêts/total)", "Dossier 2", "Dossier 3", "Note U61 (calculée)", "Note U62 (calculée)", "Fichiers déposés", "Dernier travail"].map(q).join(sep)];
    eleves.forEach((e) => { const r = ligneDe(e.id), pid = projetDe(e, r), p = pid && projet(pid), a = p ? avancement(p, r) : null, n1 = note("u61", r.evaluation), n2 = note("u62", r.evaluation);
      lignes.push([e.nom, SIP.niveau(e.niveau).court, pid || "", p ? (estEnt(p) ? `${p.partie} (entraînement, cas ${p.cas})` : p.titre) : "", ...["d1", "d2", "d3"].map((d) => (a ? `${a[d].v + a[d].p}/${a[d].n}` : "")), n1.complet ? String(n1.v).replace(".", ",") : "", n2.complet ? String(n2.v).replace(".", ",") : "", String(depotsDe(e.id).filter((x) => !x.retire_le).length), r.maj_eleve ? SIP.fmtDate(r.maj_eleve, true) : ""].map(q).join(sep)); });
    const b = new Blob(["﻿" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8" }), u = URL.createObjectURL(b), l = document.createElement("a");
    l.href = u; l.download = "projets-bts2.csv"; document.body.appendChild(l); l.click(); setTimeout(() => { URL.revokeObjectURL(u); l.remove(); }, 500);
  }

  SIP.profProjets = { afficher, recharger: async () => { LIGNES = null; await charger(); }, fermer: () => { ouvert = null; } };
})(window.SIP);
