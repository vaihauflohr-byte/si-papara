/* =====================================================================
   Atelier schémas — l'ÉDITEUR (la page) : dessiner, simuler, exemples, défis
   S'appuie sur SchemasModele (catalogue, liaisons), SchemasSymboles (dessins),
   SchemasMoteur (simulation) et SchemasExemples (exemples, défis).
   Tout reste dans ce navigateur : schéma en cours, copies et réussite des défis (localStorage).
   ===================================================================== */
(function () {
  "use strict";
  const CH = window.SchemasChrono || { demarrer() {}, echantillon() {}, tic() {}, arreter() {}, basculer() {}, ouvert: () => false };
  const M = window.SchemasModele, SY = window.SchemasSymboles, MO = window.SchemasMoteur, X = window.SchemasExemples, SA = window.SchemasAutomate, PR = window.SchemasProgramme;
  const G = M.G;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lire = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const garder = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const copie = (pts) => pts.map((q) => q.slice());
  const kk = (q) => q[0] + "," + q[1];
  const nf = (x, d) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 1 : d });
  const session = lire("sip_session");
  const QUI = session && session.nom ? String(session.nom) : "local";
  const FO = window.SchemasFolio || null;   // repérage du folio et nomenclature (folio.js)
  const CLE = { folio: "schemas:folio", lec: (id) => "schemas:lecture:" + QUI + ":" + id, lecProgres: "schemas:lectures:" + QUI, libre: "schemas:libre", defi: (id) => "schemas:defi:" + QUI + ":" + id, progres: "schemas:progres:" + QUI, dep: (id) => "schemas:dep:" + QUI + ":" + id, depProgres: "schemas:depannage:" + QUI, prep: "schemas:prep:" + QUI, prepC: "schemas:prepc:" + QUI, cplt: "schemas:cplt:" + QUI, cpltCode: (id) => "schemas:cpltcode:" + id, defiStats: "schemas:defistats:" + QUI, envois: "schemas:envois:" + QUI, copies: "schemas:copies", dernier: "schemas:dernier", aide: "schemas:aide-vue",
    dimEx: (id) => "schemas:dimex:" + QUI + ":" + id, dimProgres: "schemas:dims:" + QUI };

  const DOIGT = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);   // écran tactile sans souris
  const svg = $("sc-svg"), monde = $("sc-monde"), fond = $("sc-fond"), grilleR = $("sc-grille"), pn = $("sc-panneau"), vueEl = $("sc-vue");

  /* ---------- état ---------- */
  let schema = M.nouveau();
  let doc = { type: "libre" };
  // voltmètre (pointes rouge et noire posées sur des bornes) ; dépannage (la panne cachée, les mesures) ; marques sur le dessin
  let sondes = { a: null, b: null, prochaine: "a" }, depEtat = null, marques = [], lecEtat = null;
  // ohmmètre (ses pointes) ; consignation : le cadenas, la VAT faite, les fautes de sécurité de la simulation en cours
  let sondesO = { a: null, b: null, prochaine: "a" }, consig = { cadenas: false, vat: false, fautes: 0 };
  // dépannage préparé par le professeur : prep (pendant qu'il le prépare), depProf (chez l'élève qui l'a reçu)
  let prep = null, depProf = null;
  // schéma à compléter préparé par le professeur : prepC (pendant qu'il le prépare), cpltProf (chez l'élève qui l'a reçu)
  let prepC = null, cpltProf = null, essaiC = null;
  let compteId = null;   // le schéma ouvert vient du compte de l'élève : « Garder » le remet au même endroit
  const BAREME = { libres: 10, parMesure: 0.5, parErreur: 3, parFaute: 4 };
  let sel = new Set(), outil = "fleche", aPlacer = null;
  const vue = { x: 40, y: 40, z: 1.3 };
  let sim = null, simE = null, simSig = "", rafId = 0, tPrec = 0, angles = {}, dernierTap = {};
  let histo = [], hpos = -1;
  let brouillon = null, curseur = null, survolBorne = null, survolPiece = null;
  let geste = null, espace = false;
  const pointeurs = new Map(), appuis = new Map();
  let netEdit = null, resultatDefi = null, indiceVu = false;
  const dernierRef = {};

  /* =====================================================================
     DESSIN DE LA FEUILLE
     ===================================================================== */
  function couleurPot(p) {
    if (!p) return null;
    if (p === "!") return "var(--p-court)";
    if (p === "L1" || p === "+24") return "var(--p-l1)";
    if (p === "L2") return "var(--p-l2)";
    if (p === "L3") return "var(--p-l3)";
    if (p === "N" || p === "0V") return "var(--p-n)";
    if (p === "PE") return "var(--p-pe)";
    if (/\+$/.test(p)) return "var(--p-plus)";
    if (/-$/.test(p)) return "var(--p-n)";
    return null;
  }
  const sorteTempo = (ref, s) => ((s || schema).pieces.some((q) => q.ref === ref && q.type === "tempo_repos") ? "repos" : "travail");
  function texteSvg(t, r) {
    if (t.t == null || t.t === "") return "";
    const [x, y] = M.rotP(t.x, t.y, r);
    let a = t.a, base = "central", dy = 0;
    if (r % 2 === 1 && a !== "middle") { a = "middle"; base = y < 0 ? "auto" : "hanging"; dy = y < 0 ? -2 : 2; }
    else if (r === 2 && a !== "middle") a = a === "end" ? "start" : "end";
    return `<text x="${Math.round(x * 10) / 10}" y="${Math.round((y + dy) * 10) / 10}" class="sy-t ${t.cls}" text-anchor="${a}" dominant-baseline="${base}"${t.col ? ` style="fill:${t.col}"` : ""}>${esc(t.t)}</text>`;
  }
  function etatPiece(pc, net, E) {
    const e = Object.assign({}, (E.pieces || {})[pc.id] || {});
    e.c = {};
    for (const b of M.bornesLocales(pc)) { const n = net.borne[pc.id + ":" + b.id]; e.c[b.id] = n == null ? null : couleurPot(E.noeuds[n]); }
    return e;
  }
  function svgPiece(pc, net, E, s, cls) {
    const d = SY.dessiner(pc, E ? etatPiece(pc, net, E) : null, { sorteTempo: sorteTempo(pc.ref, s) });
    const r = pc.rot | 0;
    let h = `<g class="pc${cls ? " " + cls : ""}" transform="translate(${pc.x * G} ${pc.y * G})"><g class="sy" transform="rotate(${r * 90})">${d.corps}</g>`;
    if (E && pc.type.indexOf("moteur") === 0 && angles[pc.id]) h = h.replace(`data-rotor="${pc.id}"`, `data-rotor="${pc.id}" transform="rotate(${Math.round(angles[pc.id] % 360)} 0 6)"`);
    for (const t of d.textes) h += texteSvg(t, r);
    return h + `</g>`;
  }
  function svgFil(f, net, E, choisi) {
    const d = "M" + f.pts.map((q) => q[0] * G + " " + q[1] * G).join("L");
    let cls = "fil", st = "";
    if (E) {
      const n = net.fil[f.id], p = E.noeuds[n];
      const c = couleurPot(p);
      if (c) { cls += " vif"; st = ` style="stroke:${c}"`; }
      if (E.court && E.court.indexOf(n) >= 0) cls += " court";
    }
    if (choisi) cls += " sel";
    return `<path class="${cls}" d="${d}"${st}/>`;
  }
  /* tout le schéma (aussi pour les aperçus et l'export) */
  function svgSchema(s, net, E, o) {
    o = o || {};
    const P = [];
    for (const f of s.fils) P.push(svgFil(f, net, E, o.sel && o.sel.has(f.id)));
    for (const pc of s.pieces) P.push(svgPiece(pc, net, E, s));
    for (const q of net.points) {
      const c = E ? couleurPot(E.noeuds[q[2]]) : null;
      P.push(`<circle class="jonction" cx="${q[0] * G}" cy="${q[1] * G}" r="2.8"${c ? ` style="fill:${c}"` : ""}/>`);
    }
    if (o.libres) {
      for (const l of net.libres) if (!estReseau(s, l.piece) && !libreOkL(s, l)) P.push(`<circle class="libre" cx="${l.x * G}" cy="${l.y * G}" r="2.9"/>`);
      for (const q of net.bouts) P.push(`<circle class="bout" cx="${q[0] * G}" cy="${q[1] * G}" r="2.9"/>`);
    }
    return P.join("");
  }
  const estReseau = (s, id) => { const pc = s.pieces.find((q) => q.id === id); return !!pc && pc.type === "reseau"; };
  const libreOkL = (s, l) => { const pc = s.pieces.find((q) => q.id === l.piece); return !!pc && M.libreOk(pc, l.borne); };
  let demande = false;
  function rendre() { if (!demande) { demande = true; requestAnimationFrame(() => { demande = false; dessiner(); }); } }
  /* repérage du folio : colonnes, numéros de fils, renvois (calculés une fois par netlist) */
  let folio = !!lire(CLE.folio), folioCache = null;
  const analyseFolio = (net) => { if (!folioCache || folioCache.net !== net || folioCache.s !== schema) folioCache = { net, s: schema, A: FO.analyser(schema, net) }; return folioCache.A; };
  function basculerFolio(v) {
    folio = v == null ? !folio : !!v; garder(CLE.folio, folio);
    const b = document.querySelector('#sc-barre [data-a="folio"]'); if (b) b.setAttribute("aria-pressed", String(folio));
    rendre();
  }
  function dessiner() {
    const net = sim ? sim.netlist : (netEdit || (netEdit = M.netlist(schema)));
    let h = svgSchema(schema, net, sim ? simE : null, { sel, libres: !sim });
    if (folio && FO) h += FO.svg(schema, analyseFolio(net), G);
    if (!sim) {
      for (const id of sel) {
        const pc = pieceParId(id); if (!pc) continue;
        const b = M.boiteAbs(pc);
        h += `<rect class="cadre-sel" x="${b[0] * G - 4}" y="${b[1] * G - 4}" width="${(b[2] - b[0]) * G + 8}" height="${(b[3] - b[1]) * G + 8}" rx="4"/>`;
      }
      const f = filChoisiSeul();
      if (f) for (const q of [f.pts[0], f.pts[f.pts.length - 1]]) h += `<rect class="poignee" x="${q[0] * G - 4}" y="${q[1] * G - 4}" width="8" height="8" rx="1.5"/>`;
      if (brouillon) {
        const pts = brouillon.pts.concat(curseur ? routeVers(curseur, survolBorne ? survolBorne.d : null) : []);
        h += `<polyline class="brouillon" points="${pts.map((q) => q[0] * G + "," + q[1] * G).join(" ")}"/>`;
      }
      if (survolBorne && (outil === "fil" || brouillon || (geste && geste.type === "tirer"))) h += `<circle class="cible" cx="${survolBorne.x * G}" cy="${survolBorne.y * G}" r="6"/>`;
      else if (survolBorne && outil === "fleche" && !geste) h += `<circle class="cible" cx="${survolBorne.x * G}" cy="${survolBorne.y * G}" r="4.5"/>`;
      if (outil === "placer" && aPlacer && curseur) {
        const pc = Object.assign({ id: "fantome", x: curseur[0], y: curseur[1], ref: "" }, nouvellePiece(aPlacer, curseur, true));
        h += `<g class="fantome">${svgPiece(pc, { borne: {}, fil: {}, points: [] }, null, schema)}</g>`;
      }
      if (geste && geste.type === "rect") {
        const x0 = Math.min(geste.a[0], geste.b[0]), y0 = Math.min(geste.a[1], geste.b[1]);
        h += `<rect class="rect-sel" x="${x0}" y="${y0}" width="${Math.abs(geste.b[0] - geste.a[0])}" height="${Math.abs(geste.b[1] - geste.a[1])}"/>`;
      }
    } else if (survolPiece && actionnable(survolPiece) && outil !== "designer") {
      const b = M.boiteAbs(survolPiece);
      h += `<g class="survol"><rect class="act-sim" x="${b[0] * G - 5}" y="${b[1] * G - 5}" width="${(b[2] - b[0]) * G + 10}" height="${(b[3] - b[1]) * G + 10}" rx="5"/></g>`;
    }
    if (sim) h += surcouches();
    else if (prep && prep.panne) h += marqueDe(Object.assign({}, prep.panne, { cls: "panne" }));
    monde.innerHTML = h;
    majVide();
  }
  function majRotors() {
    for (const el of monde.querySelectorAll("[data-rotor]")) { const a = angles[el.getAttribute("data-rotor")] || 0; el.setAttribute("transform", `rotate(${Math.round(a % 360)} 0 6)`); }
  }
  /* parties opératives : le chariot roule, l'eau monte ou descend (sans redessiner toute la feuille) */
  function majSystemes() {
    if (!simE) return;
    const o = (el, k) => simE.pieces[el.getAttribute(k)];
    for (const el of monde.querySelectorAll("[data-po]")) {
      const e = o(el, "data-po"); if (!e) continue;
      const g = SY.geoChariot(e.pos);
      el.setAttribute("transform", `translate(${g.xc} 0)`);
      for (const r of el.querySelectorAll("[data-roue]")) r.setAttribute("transform", `rotate(${g.a} ${r.getAttribute("data-roue")} 19)`);
    }
    for (const el of monde.querySelectorAll("[data-eau]")) { const e = o(el, "data-eau"); if (!e) continue; const g = SY.geoCuve(e.niv); el.setAttribute("y", g.y); el.setAttribute("height", g.h); }
    for (const el of monde.querySelectorAll("[data-nivt]")) { const e = o(el, "data-nivt"); if (e) el.textContent = Math.round(e.niv * 100) + " %"; }
    for (const el of monde.querySelectorAll("[data-tapis]")) {
      const e = o(el, "data-tapis"); if (!e) continue;
      const g = SY.geoTapis(e.pos, el.getAttribute("data-ecart"), el.getAttribute("data-nb"));
      el.querySelectorAll("[data-caisse]").forEach((r, j) => { const x = g.cx[j]; if (x == null) r.style.display = "none"; else { r.style.display = ""; r.setAttribute("x", Math.round((x - 19.2) * 10) / 10); } });
      const pc = el.closest(".pc"), b = pc && pc.querySelector("[data-bande]"), rl = pc && pc.querySelector("[data-roul]");
      if (b) b.style.strokeDashoffset = g.off;
      if (rl) rl.setAttribute("transform", `rotate(${g.a} -120 0)`);
    }
    for (const el of monde.querySelectorAll("[data-tige]")) { const e = o(el, "data-tige"); if (e) el.setAttribute("transform", SY.geoTri(e.r).tige); }
    for (const el of monde.querySelectorAll("[data-lisse]")) { const e = o(el, "data-lisse"); if (e) el.setAttribute("d", `M0 -22V${SY.geoBarriere(e.pos).y}`); }
    for (const el of monde.querySelectorAll("[data-voies]")) {
      const e = o(el, "data-voies"); if (!e) continue;
      el.querySelectorAll("[data-voiture]").forEach((g, j) => { const x = (e.voitures || [])[j]; if (x == null) g.style.display = "none"; else { g.style.display = ""; g.setAttribute("transform", SY.geoVoiture(x)); } });
    }
    for (const el of monde.querySelectorAll("[data-cabine]")) { const e = o(el, "data-cabine"); if (e) el.setAttribute("transform", SY.geoCabine(e.pos).t); }
    for (const el of monde.querySelectorAll("[data-cable]")) { const e = o(el, "data-cable"); if (e) el.setAttribute("d", SY.geoCabine(e.pos).cable); }
    for (const el of monde.querySelectorAll("[data-volet]")) { const e = o(el, "data-volet"); if (e) el.setAttribute("transform", SY.geoTri(e.r).volet); }
    majCartesPO();
  }

  /* ---------- vue : zoom et déplacement ---------- */
  function appliquerVue() {
    const t = `translate(${Math.round(vue.x * 10) / 10} ${Math.round(vue.y * 10) / 10}) scale(${Math.round(vue.z * 1000) / 1000})`;
    monde.setAttribute("transform", t); fond.setAttribute("transform", t);
    const r = svg.getBoundingClientRect();
    const x0 = Math.floor(-vue.x / vue.z / G) * G - G, y0 = Math.floor(-vue.y / vue.z / G) * G - G;
    grilleR.setAttribute("x", x0); grilleR.setAttribute("y", y0);
    grilleR.setAttribute("width", Math.ceil(r.width / vue.z) + 3 * G); grilleR.setAttribute("height", Math.ceil(r.height / vue.z) + 3 * G);
    grilleR.style.display = vue.z < 0.45 ? "none" : "";
    $("sc-zoom").textContent = Math.round(vue.z * 100) + " %";
  }
  function zoomer(f, sx, sy) {
    const z2 = clamp(vue.z * f, 0.25, 5);
    const wx = (sx - vue.x) / vue.z, wy = (sy - vue.y) / vue.z;
    vue.x = sx - wx * z2; vue.y = sy - wy * z2; vue.z = z2; appliquerVue();
  }
  function zoomCentre(f) { const r = svg.getBoundingClientRect(); zoomer(f, r.width / 2, r.height / 2); }
  function ajusterVue(s) {
    s = s || schema;
    const r = svg.getBoundingClientRect(); if (!r.width || !r.height) return;
    const vide = !s.pieces.length && !s.fils.length;
    const b = vide ? [0, 0, 40, 26] : M.bornesDe(s);
    const bas = window.innerWidth <= 980 ? 50 : 0;
    const x0 = b[0] * G - 60, y0 = b[1] * G - 40, w = (b[2] - b[0]) * G + 110, h = (b[3] - b[1]) * G + 80;
    const z = vide ? (r.width < 600 ? 1 : 1.3) : clamp(Math.min(r.width / w, (r.height - bas) / h), 0.3, 2);
    vue.z = z; vue.x = (r.width - w * z) / 2 - x0 * z; vue.y = Math.max(4, (r.height - bas - h * z) / 2) - y0 * z;
    appliquerVue();
  }

  /* =====================================================================
     LE SCHÉMA : pièces, fils, historique, sauvegarde
     ===================================================================== */
  const pieceParId = (id) => schema.pieces.find((p) => p.id === id) || null;
  const filParId = (id) => schema.fils.find((f) => f.id === id) || null;
  function filChoisiSeul() { if (sel.size !== 1) return null; return filParId([...sel][0]); }
  function pieceChoisieSeule() { if (sel.size !== 1) return null; return pieceParId([...sel][0]); }

  function commit() {
    netEdit = null;
    const j = JSON.stringify(schema);
    if (histo[hpos] !== j) { histo.splice(hpos + 1); histo.push(j); if (histo.length > 150) histo.shift(); hpos = histo.length - 1; }
    sauverBientot(); rendre(); majPanneau(); majBoutons();
  }
  function chargerSchema(s, garderVue) {
    prep = null; compteId = null; if (outil === "panne") outil = "fleche";
    schema = s; sel.clear(); brouillon = null; geste = null; netEdit = null; resultatDefi = null; indiceVu = false;
    if (doc.type !== "depannage" && doc.type !== "lecture") marques = [];
    histo = [JSON.stringify(schema)]; hpos = 0;
    if (!garderVue) ajusterVue();
    sauverBientot(); rendre(); majPanneau(); majBoutons();
  }
  function annuler() { if (sim || hpos <= 0) return; const dm = schema.dim; hpos--; schema = JSON.parse(histo[hpos]); if (dm) schema.dim = dm; else delete schema.dim; sel.clear(); brouillon = null; netEdit = null; sauverBientot(); rendre(); majPanneau(); majBoutons(); }
  function refaire() { if (sim || hpos >= histo.length - 1) return; const dm = schema.dim; hpos++; schema = JSON.parse(histo[hpos]); if (dm) schema.dim = dm; else delete schema.dim; sel.clear(); netEdit = null; sauverBientot(); rendre(); majPanneau(); majBoutons(); }
  let tSauve = 0;
  function sauverBientot() { clearTimeout(tSauve); tSauve = setTimeout(sauver, 250); }
  function sauver() { clearTimeout(tSauve); if (doc.type !== "depannage" && doc.type !== "lecture") garder(doc.type === "defi" ? CLE.defi(doc.defi) : CLE.libre, schema); garder(CLE.dernier, doc); directMarquer(); }
  function quitterDoc() {   // avant d'ouvrir un autre schéma
    if (doc.type === "defi") { sauver(); doc = { type: "libre" }; cpltProf = null; }
    else if (doc.type === "depannage") { depEtat = null; marques = []; depProf = null; doc = { type: "libre" }; }
    else if (doc.type === "lecture") { lecEtat = null; marques = []; doc = { type: "libre" }; }
    else copieAuto();
  }

  /* ---------- nouvelle pièce : repère, numéros, tension par défaut ---------- */
  function tensionParDefaut() {
    const P = schema.pieces;
    if (P.some((q) => q.type === "transfo")) return (M.parametres(P.find((q) => q.type === "transfo")).sec || 24) + "~";
    if (P.some((q) => q.type === "alim" && q.p && q.p.pot === "+24") && !P.some((q) => q.type === "alim" && q.p && /^(L|N)$/.test(q.p.pot))) return "24=";
    const c = P.find((q) => (M.BOBINES.indexOf(q.type) >= 0 || q.type === "voyant") && q.p && q.p.tension);
    return c ? c.p.tension : "230~";
  }
  function famille(type) {
    if (type === "poles") return "bobine";
    if (type === "contact_tno" || type === "contact_tnf") return "tempo";
    if (type === "contact_th_nf" || type === "contact_th_no") return "thermique";
    if (type === "contact_no" || type === "contact_nf") return "bobine";
    return null;
  }
  function familleDe(pc) {
    if (pc.type === "bobine" || pc.type === "relais") return "bobine";
    if (M.TEMPOS.indexOf(pc.type) >= 0) return "tempo";
    if (pc.type === "thermique" || pc.type === "disj_moteur") return "thermique";
    return null;
  }
  function retenir(pc) { const f = familleDe(pc); if (f && pc.ref) { dernierRef[f] = pc.ref; if (f === "tempo") dernierRef.bobine = pc.ref; } }
  function refPourLien(type) {
    const fam = famille(type), L0 = M.appareilsPour(schema, type);
    const bob = (r) => schema.pieces.some((q) => q.ref === r && M.BOBINES.indexOf(q.type) >= 0);
    const L = L0.filter(bob).concat(L0.filter((r) => !bob(r)));
    if (dernierRef[fam] && L.indexOf(dernierRef[fam]) >= 0) return dernierRef[fam];
    if (L.length) return L.filter(bob).length ? L.filter(bob)[L.filter(bob).length - 1] : L[0];
    return type === "contact_th_nf" || type === "contact_th_no" ? "F1" : type === "contact_tno" || type === "contact_tnf" ? "KA1" : "KM1";
  }
  function nouvellePiece(item, g, fantome) {
    const T = M.TYPES[item.type], p = Object.assign({}, item.p || {});
    const rot = item.rot != null ? item.rot : (T.rotDefaut ? T.rotDefaut(Object.assign({}, T.p, p)) : 0);
    const pc = { id: fantome ? "fantome" : M.nouvelId(schema, "p"), type: item.type, x: g[0], y: g[1], rot, ref: "", p };
    if (T.lien) pc.ref = refPourLien(item.type); else if (T.pref) pc.ref = fantome ? T.pref + "?" : M.prochainRef(schema, T.pref);
    if (!fantome) {
      if (M.AVEC_NUM.indexOf(item.type) >= 0) { const n = M.numeroContact(schema, pc); if (n) pc.p.num = n; }
      if (T.p.tension !== undefined && !p.tension) pc.p.tension = tensionParDefaut();
      if (item.type === "automate") pc.prog = SA.progDefaut();
      if (T.cat === "po" && pc.type !== "station") { const mo = schema.pieces.find((q) => /^moteur/.test(q.type) && q.ref); if (mo && !p.moteur) pc.p.moteur = mo.ref; }
    }
    return pc;
  }
  function placer(item, g, encore) {
    const pc = nouvellePiece(item, g, false);
    schema.pieces.push(pc); retenir(pc);
    sel = new Set([pc.id]);
    if (!encore) choisirOutil("fleche");
    commit();
    bulle(M.TYPES[pc.type].lien ? `${pc.ref} posé. Son repère dit à quel appareil il appartient : change-le dans le panneau si besoin.`
      : pc.type === "automate" ? `${pc.ref} posé. Câble son alimentation (+24V, 0V), ses entrées et ses sorties, puis « Programmer » dans le panneau.`
      : pc.type === "variateur" ? `${pc.ref} posé. Réseau sur L1, L2, L3, moteur sur U, V, W ; LI1 (avant) et LI2 (arrière) reçoivent son +24V.`
      : `${pc.ref || M.TYPES[pc.type].court} posé. Glisse d'une borne à une autre pour tirer les fils.`, 4000);
  }

  /* ---------- fils ---------- */
  function ajusterBout(orig, end, dx, dy) {
    let P = copie(orig);
    const i = end === 0 ? 0 : P.length - 1, j = end === 0 ? 1 : P.length - 2;
    const A = P[i], B = P[j], vert = A[0] === B[0], horiz = A[1] === B[1];
    const N = [A[0] + dx, A[1] + dy];
    P[i] = N;
    if (P.length >= 3) {
      if (vert && !horiz) P[j] = [B[0] + dx, B[1]];
      else if (horiz && !vert) P[j] = [B[0], B[1] + dy];
    } else if (N[0] !== B[0] && N[1] !== B[1]) {
      let coins;
      if (vert || (!horiz && Math.abs(N[1] - B[1]) >= Math.abs(N[0] - B[0]))) { const ym = Math.round((N[1] + B[1]) / 2); coins = [[N[0], ym], [B[0], ym]]; }
      else { const xm = Math.round((N[0] + B[0]) / 2); coins = [[xm, N[1]], [xm, B[1]]]; }
      P = end === 0 ? [N].concat(coins, [B]) : [B].concat(coins.reverse(), [N]);
    }
    return P;
  }
  function routeVers(c, dArr) {
    const pts = brouillon.pts, last = pts[pts.length - 1];
    if (c[0] === last[0] && c[1] === last[1]) return [];
    if (pts.length === 1) return M.router(last, brouillon.dir, c, dArr || null, schema).slice(1);
    const prev = pts[pts.length - 2], dernierVertical = prev[0] === last[0];
    if (c[0] === last[0] || c[1] === last[1]) return [c];
    return dernierVertical ? [[c[0], last[1]], c] : [[last[0], c[1]], c];
  }
  function cibleFil(w, r, sauf) {
    const bo = borneA(w, r);
    if (bo && !(sauf && bo.b.x === sauf[0] && bo.b.y === sauf[1])) return { pt: [bo.b.x, bo.b.y], d: bo.b.d, borne: true };
    const fh = filA(w, r);
    if (fh) {
      const a = fh.f.pts[fh.i], b = fh.f.pts[fh.i + 1], g = grilleDe(w);
      const pt = a[0] === b[0] ? [a[0], clamp(g[1], Math.min(a[1], b[1]), Math.max(a[1], b[1]))] : [clamp(g[0], Math.min(a[0], b[0]), Math.max(a[0], b[0])), a[1]];
      if (!(sauf && pt[0] === sauf[0] && pt[1] === sauf[1])) return { pt, d: null, borne: false };
    }
    return null;
  }
  function finirFil(c) {
    const pts = M.nettoyer(brouillon.pts.concat(routeVers(c.pt, c.d)));
    brouillon = null; curseur = null;
    if (pts.length >= 2) { schema.fils.push({ id: M.nouvelId(schema, "f"), pts }); commit(); bulle(""); }
    else rendre();
  }

  /* ---------- actions d'édition ---------- */
  function supprimer() {
    if (sim) return;
    if (brouillon) { brouillon = null; rendre(); return; }
    if (!sel.size) { bulle("Choisis d'abord ce qu'il faut supprimer (clique dessus).", 2500); return; }
    schema.pieces = schema.pieces.filter((pc) => !sel.has(pc.id)); schema.fils = schema.fils.filter((f) => !sel.has(f.id));
    sel.clear(); commit();
  }
  function tourner() {
    if (sim) return;
    const fixe = (type) => !!(M.TYPES[type] && M.TYPES[type].sansRot);   // une partie opérative se dessine toujours à l'endroit
    if (outil === "placer" && aPlacer) { if (fixe(aPlacer.type)) return; aPlacer.rot = (((aPlacer.rot != null ? aPlacer.rot : nouvellePiece(aPlacer, [0, 0], true).rot) | 0) + 1) % 4; rendre(); return; }
    const L = [...sel].map(pieceParId).filter((pc) => pc && !fixe(pc.type));
    if (!L.length) { bulle(sel.size ? "Une partie opérative ne se tourne pas." : "Choisis d'abord un symbole à tourner.", 2500); return; }
    for (const pc of L) {
      const avant = M.bornesAbs(pc); pc.rot = ((pc.rot | 0) + 1) % 4; const apres = M.bornesAbs(pc);
      const dejaBouges = new Set();
      avant.forEach((a, i) => {
        const b = apres[i], dx = b.x - a.x, dy = b.y - a.y; if (!dx && !dy) return;
        for (const f of schema.fils) {
          if (sel.has(f.id)) continue;
          const n = f.pts.length - 1;
          if (!dejaBouges.has(f.id + ":0") && f.pts[0][0] === a.x && f.pts[0][1] === a.y) { f.pts = M.nettoyer(ajusterBout(f.pts, 0, dx, dy)); dejaBouges.add(f.id + ":0"); }
          else if (!dejaBouges.has(f.id + ":1") && f.pts[n][0] === a.x && f.pts[n][1] === a.y) { f.pts = M.nettoyer(ajusterBout(f.pts, 1, dx, dy)); dejaBouges.add(f.id + ":1"); }
        }
      });
    }
    commit();
  }
  let pressePapier = null;
  function copier() {
    const pieces = schema.pieces.filter((pc) => sel.has(pc.id)); if (!pieces.length && !sel.size) return false;
    const pts = new Set(); for (const pc of pieces) for (const b of M.bornesAbs(pc)) pts.add(b.x + "," + b.y);
    const fils = schema.fils.filter((f) => sel.has(f.id) || (pts.has(kk(f.pts[0])) && pts.has(kk(f.pts[f.pts.length - 1]))));
    pressePapier = M.cloner({ pieces, fils }); return true;
  }
  function coller(dx, dy) {
    if (!pressePapier || sim) return;
    dx = dx == null ? 3 : dx; dy = dy == null ? 3 : dy;
    const nouv = new Set(), carte = {};
    const ordre = pressePapier.pieces.slice().sort((a, b) => (M.TYPES[a.type].lien ? 1 : 0) - (M.TYPES[b.type].lien ? 1 : 0));
    for (const q0 of ordre) {
      const q = M.cloner(q0), T = M.TYPES[q.type];
      q.id = M.nouvelId(schema, "p"); q.x += dx; q.y += dy;
      if (!T.lien && T.pref) { const anc = q.ref; q.ref = carte[anc] || (carte[anc] = M.prochainRef(schema, T.pref)); }
      else if (T.lien && carte[q.ref]) q.ref = carte[q.ref];
      schema.pieces.push(q);
      if (M.AVEC_NUM.indexOf(q.type) >= 0) { const n = M.numeroContact(schema, q); if (n) q.p.num = n; }
      nouv.add(q.id);
    }
    for (const f0 of pressePapier.fils) { const f = { id: M.nouvelId(schema, "f"), pts: f0.pts.map((q) => [q[0] + dx, q[1] + dy]) }; schema.fils.push(f); nouv.add(f.id); }
    sel = nouv; commit();
  }
  function dupliquer() { if (copier()) coller(3, 3); }
  function toutChoisir() { sel = new Set(schema.pieces.map((p) => p.id).concat(schema.fils.map((f) => f.id))); rendre(); majPanneau(); majBoutons(); }
  function deplacerSel(dx, dy) {
    const L = [...sel].map(pieceParId).filter(Boolean); if (!L.length) return;
    initDeplacer(null, [0, 0]);
    appliquerDeplacement(dx, dy); finirDeplacement();
  }

  /* =====================================================================
     POINTEUR : souris, doigt, stylet
     ===================================================================== */
  const tactile = (e) => e.pointerType === "touch" || e.pointerType === "pen";
  function pointMonde(e) { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left - vue.x) / vue.z, (e.clientY - r.top - vue.y) / vue.z]; }
  const grilleDe = (w) => [Math.round(w[0] / G), Math.round(w[1] / G)];
  const rayon = (px) => Math.min(px / vue.z, G * 1.45);
  function borneA(w, r) {
    let best = null, bd = r;
    for (const pc of schema.pieces) for (const b of M.bornesAbs(pc)) { const d = Math.hypot(b.x * G - w[0], b.y * G - w[1]); if (d <= bd) { bd = d; best = { pc, b }; } }
    return best;
  }
  function pieceA(w, marge) {
    for (let i = schema.pieces.length - 1; i >= 0; i--) {
      const pc = schema.pieces[i], b = M.boiteAbs(pc);
      if (w[0] >= b[0] * G - marge && w[0] <= b[2] * G + marge && w[1] >= b[1] * G - marge && w[1] <= b[3] * G + marge) return pc;
    }
    return null;
  }
  function distSeg(p, a, b) {
    const vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy;
    let u = L ? ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L : 0; u = clamp(u, 0, 1);
    return Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy);
  }
  function filA(w, r) {
    let best = null, bd = r;
    for (let k = schema.fils.length - 1; k >= 0; k--) {
      const f = schema.fils[k];
      for (let i = 0; i + 1 < f.pts.length; i++) { const d = distSeg(w, [f.pts[i][0] * G, f.pts[i][1] * G], [f.pts[i + 1][0] * G, f.pts[i + 1][1] * G]); if (d <= bd) { bd = d; best = { f, i }; } }
    }
    return best;
  }
  const ACTIONNABLES = new Set(["differentiel", "bp_no", "bp_nf", "arret_urgence", "selecteur", "interrupteur", "fdc_no", "fdc_nf", "capteur", "thermique", "contact_th_nf", "contact_th_no", "sectionneur", "disjoncteur", "disj_moteur", "fusible", "automate", "variateur", "potentiometre", "capteur3", "chariot", "cuve", "tapis", "tri"]);
  const ELEC = /^(automate|variateur|potentiometre)$/, PO = /^(chariot|cuve|tapis|tri|barriere|montecharge|station)$/;
  const actionnable = (pc) => !!pc && ACTIONNABLES.has(pc.type) && !!pc.ref;

  function commencerPan(e) { geste = { type: "pan", sx: e.clientX, sy: e.clientY, vx: vue.x, vy: vue.y, bouge: false, pid: e.pointerId }; svg.style.cursor = "grabbing"; }
  function commencerPinch() {
    const L = [...pointeurs.entries()].filter(([id]) => !appuis.has(id)).map(([, p]) => p);
    if (L.length < 2) return;
    if (geste && geste.type === "deplacer" && geste.bouge) annulerDeplacement();
    if (geste && geste.appuiLong) clearTimeout(geste.appuiLong);
    const [a, b] = L, r = svg.getBoundingClientRect();
    geste = { type: "pinch", d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2 - r.left, cy: (a.y + b.y) / 2 - r.top, vx: vue.x, vy: vue.y, z0: vue.z };
  }
  function initDeplacer(e, w) {
    const pieces = [...sel].map(pieceParId).filter(Boolean), fils = [...sel].map(filParId).filter(Boolean);
    const pts = new Set(); for (const pc of pieces) for (const b of M.bornesAbs(pc)) pts.add(b.x + "," + b.y);
    const attaches = [];
    for (const f of schema.fils) {
      if (sel.has(f.id)) continue;
      const a = pts.has(kk(f.pts[0])), b = pts.has(kk(f.pts[f.pts.length - 1]));
      if (a && b) attaches.push({ f, tout: true, orig: copie(f.pts) }); else if (a) attaches.push({ f, end: 0, orig: copie(f.pts) }); else if (b) attaches.push({ f, end: 1, orig: copie(f.pts) });
    }
    geste = { type: "deplacer", depart: grilleDe(w), origP: pieces.map((pc) => [pc, pc.x, pc.y]), origF: fils.map((f) => [f, copie(f.pts)]), attaches, sx: e ? e.clientX : 0, sy: e ? e.clientY : 0, bouge: false };
  }
  function appliquerDeplacement(dx, dy) {
    for (const [pc, x, y] of geste.origP) { pc.x = x + dx; pc.y = y + dy; }
    for (const [f, o] of geste.origF) f.pts = o.map((q) => [q[0] + dx, q[1] + dy]);
    for (const a of geste.attaches) a.f.pts = a.tout ? a.orig.map((q) => [q[0] + dx, q[1] + dy]) : ajusterBout(a.orig, a.end, dx, dy);
    geste.dx = dx; geste.dy = dy; netEdit = null;
  }
  function annulerDeplacement() { if (!geste || geste.type !== "deplacer") return; appliquerDeplacement(0, 0); geste = null; rendre(); }
  function finirDeplacement() {
    for (const a of geste.attaches) a.f.pts = M.nettoyer(a.f.pts);
    for (const [f] of geste.origF) f.pts = M.nettoyer(f.pts);
    schema.fils = schema.fils.filter((f) => f.pts.length >= 2);
    geste = null; commit();
  }

  function down(e) {
    if (e.pointerType === "mouse" && e.button > 2) return;
    svg.focus({ preventScroll: true });
    try { svg.setPointerCapture(e.pointerId); } catch (x) { /* rien */ }
    pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY, t: e.pointerType });
    const w = pointMonde(e), gp = grilleDe(w), tac = tactile(e);
    if (!sim && e.button !== 1 && outil === "panne" && prep) {
      const c = cibleDesignation(w, tac);
      if (c) { e.preventDefault(); choisirPannePrep(c); geste = { type: "rien" }; return; }
    }
    if (sim && e.button !== 1 && doc.type === "lecture") {   // lecture de schéma : le clic sur un appareil est la réponse
      const pc = pieceA(w, tac ? 7 : 2);
      if (pc) { e.preventDefault(); repondreLecture(pc); geste = { type: "rien" }; return; }
    }
    if (sim && e.button !== 1 && outil === "pince") {
      const pc = pieceA(w, tac ? 7 : 2);
      if (pc && PINCE_APP.test(pc.type)) { e.preventDefault(); pince = { piece: pc.id }; majPince(true); dessiner(); geste = { type: "rien" }; return; }
      const fh = filA(w, rayon(tac ? 14 : 7));
      if (fh) {   // le point du fil le plus proche du clic, sur la grille
        e.preventDefault();
        const a = fh.f.pts[fh.i], b = fh.f.pts[fh.i + 1], gx = w[0] / G, gy = w[1] / G;
        const x = a[0] === b[0] ? a[0] : Math.round(Math.max(Math.min(a[0], b[0]), Math.min(Math.max(a[0], b[0]), gx)));
        const y = a[1] === b[1] ? a[1] : Math.round(Math.max(Math.min(a[1], b[1]), Math.min(Math.max(a[1], b[1]), gy)));
        pince = { fil: fh.f.id, x, y }; majPince(true); dessiner(); geste = { type: "rien" }; return;
      }
    }
    if (sim && e.button !== 1 && (outil === "volt" || outil === "ohm")) {
      const bo = borneA(w, rayon(tac ? 22 : 10));
      if (bo) { e.preventDefault(); (outil === "ohm" ? poserSondeO : poserSonde)(bo.pc, bo.b); geste = { type: "rien" }; return; }
    }
    if (sim && e.button !== 1 && outil === "designer") {
      const c = cibleDesignation(w, tac);
      if (c) { e.preventDefault(); designer(c); geste = { type: "rien" }; return; }
    }
    if (sim && e.button !== 1) {
      const pc = pieceA(w, tac ? 7 : 2);
      if (pc && actionnable(pc)) { e.preventDefault(); actionSim(pc, e); return; }
    }
    if (pointeurs.size - appuis.size >= 2) { commencerPinch(); return; }
    if (pointeurs.size - appuis.size > 2) return;
    if (e.button === 1 || e.button === 2 || espace || outil === "main" || sim) { if (e.button === 2 && !sim && brouillon) { brouillon = null; rendre(); return; } commencerPan(e); return; }
    if (outil === "placer") { if (aPlacer) placer(aPlacer, gp, e.shiftKey); geste = { type: "rien" }; return; }
    const r = rayon(tac ? 20 : 9);
    if (brouillon) { clicFil(w, gp, r); geste = { type: "rien" }; return; }
    if (outil === "fil") {
      const c = cibleFil(w, r);
      geste = { type: "tirer", depart: c ? { x: c.pt[0], y: c.pt[1], d: c.d } : { x: gp[0], y: gp[1], d: null }, sx: e.clientX, sy: e.clientY, bouge: false, clic: true };
      return;
    }
    // outil « Choisir »
    const fs = filChoisiSeul();
    if (fs) for (const end of [0, 1]) {
      const q = end ? fs.pts[fs.pts.length - 1] : fs.pts[0];
      if (Math.hypot(q[0] * G - w[0], q[1] * G - w[1]) <= r) { geste = { type: "bout", f: fs, end, orig: copie(fs.pts), depart: q.slice(), sx: e.clientX, sy: e.clientY, bouge: false }; return; }
    }
    const bo = borneA(w, r);
    if (bo) { geste = { type: "tirer", depart: { x: bo.b.x, y: bo.b.y, d: bo.b.d }, pc: bo.pc, w, tac, sx: e.clientX, sy: e.clientY, bouge: false, clic: false }; return; }
    const pc = pieceA(w, tac ? 4 : 1);
    const ajout = e.shiftKey || e.ctrlKey || e.metaKey;
    if (pc) {
      let basculer = false;
      if (!sel.has(pc.id)) { if (!ajout) sel.clear(); sel.add(pc.id); retenir(pc); } else basculer = true;
      initDeplacer(e, w); geste.basculer = basculer; geste.ajout = ajout; geste.pc = pc;
      rendre(); majPanneau(); majBoutons(); return;
    }
    const fh = filA(w, rayon(tac ? 14 : 6));
    if (fh) {
      if (!sel.has(fh.f.id)) { if (!ajout) sel.clear(); sel.add(fh.f.id); }
      geste = { type: "segment", f: fh.f, i: fh.i, orig: copie(fh.f.pts), depart: gp, sx: e.clientX, sy: e.clientY, bouge: false };
      rendre(); majPanneau(); majBoutons(); return;
    }
    if (!ajout && sel.size) { sel.clear(); majPanneau(); majBoutons(); }
    if (tac) {
      commencerPan(e);
      const g0 = geste;
      geste.appuiLong = setTimeout(() => { if (geste === g0 && !g0.bouge) { geste = { type: "rect", a: w, b: w }; if (navigator.vibrate) navigator.vibrate(15); rendre(); } }, 520);
    } else geste = { type: "rect", a: w, b: w };
    rendre();
  }
  function clicFil(w, gp, r) {
    const c = cibleFil(w, r, brouillon.pts[brouillon.pts.length - 1]);
    if (c) { finirFil(c); return; }
    brouillon.pts = M.nettoyer(brouillon.pts.concat(routeVers(gp, null)));
    rendre();
  }
  function move(e) {
    const p = pointeurs.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY; }
    const w = pointMonde(e), gp = grilleDe(w), tac = tactile(e);
    if (appuis.has(e.pointerId)) return;
    if (geste && geste.type === "pinch") {
      const L = [...pointeurs.entries()].filter(([id]) => !appuis.has(id)).map(([, q]) => q); if (L.length < 2) return;
      const [a, b] = L, r = svg.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
      const z = clamp(geste.z0 * d / geste.d0, 0.25, 5), wx = (geste.cx - geste.vx) / geste.z0, wy = (geste.cy - geste.vy) / geste.z0;
      vue.z = z; vue.x = cx - wx * z; vue.y = cy - wy * z; appliquerVue(); return;
    }
    if (!geste) {
      if (sim) {
        if (outil === "volt" || outil === "ohm") {
          const bo = borneA(w, rayon(tac ? 22 : 10)), sb = bo ? { x: bo.b.x, y: bo.b.y } : null;
          if (JSON.stringify(sb) !== JSON.stringify(survolBorne)) { survolBorne = sb; rendre(); }
          if (bo) { svg.style.cursor = "crosshair"; return; }
        } else if (survolBorne) { survolBorne = null; rendre(); }
        if (outil === "designer") { svg.style.cursor = cibleDesignation(w, tac) ? "help" : "grab"; return; }
        if (doc.type === "lecture") { svg.style.cursor = pieceA(w, tac ? 7 : 2) ? "help" : "grab"; return; }
        const pc = pieceA(w, tac ? 7 : 2), act = actionnable(pc) ? pc : null; if (act !== survolPiece) { survolPiece = act; rendre(); } svg.style.cursor = act ? "pointer" : "grab"; return;
      }
      const r = rayon(tac ? 20 : 9);
      let sb = null;
      if (outil === "fil" || brouillon || outil === "fleche") { const c = cibleFil(w, r, brouillon ? brouillon.pts[brouillon.pts.length - 1] : null); if (c && (c.borne || outil === "fil" || brouillon)) sb = { x: c.pt[0], y: c.pt[1], d: c.d }; }
      const suit = brouillon || outil === "placer" || outil === "fil";
      const avant = JSON.stringify(suit ? [survolBorne, curseur] : survolBorne);
      survolBorne = sb; curseur = sb ? [sb.x, sb.y] : gp;
      if (outil === "fleche" && !brouillon) svg.style.cursor = sb ? "crosshair" : pieceA(w, 1) ? "move" : filA(w, rayon(6)) ? "pointer" : "default";
      else svg.style.cursor = outil === "main" ? "grab" : "crosshair";
      if (JSON.stringify(suit ? [survolBorne, curseur] : survolBorne) !== avant) rendre();
      return;
    }
    const loin = Math.hypot(e.clientX - (geste.sx || 0), e.clientY - (geste.sy || 0)) >= (tac ? 8 : 4);
    switch (geste.type) {
      case "pan":
        if (!geste.bouge && !loin) return;
        if (geste.appuiLong) { clearTimeout(geste.appuiLong); geste.appuiLong = 0; }
        geste.bouge = true; vue.x = geste.vx + e.clientX - geste.sx; vue.y = geste.vy + e.clientY - geste.sy; appliquerVue(); return;
      case "rect": geste.b = w; rendre(); return;
      case "deplacer": {
        if (!geste.bouge && !loin) return;
        geste.bouge = true;
        const dx = gp[0] - geste.depart[0], dy = gp[1] - geste.depart[1];
        if (dx !== geste.dx || dy !== geste.dy) { appliquerDeplacement(dx, dy); rendre(); }
        return;
      }
      case "tirer": {
        if (!geste.bouge && !loin) return;
        if (!geste.bouge) { geste.bouge = true; brouillon = { pts: [[geste.depart.x, geste.depart.y]], dir: geste.depart.d }; }
        const c = cibleFil(w, rayon(tac ? 22 : 10), brouillon.pts[0]);
        survolBorne = c ? { x: c.pt[0], y: c.pt[1], d: c.d } : null; curseur = c ? c.pt : gp;
        rendre(); return;
      }
      case "segment": {
        if (!geste.bouge && !loin) return;
        if (!geste.bouge) {
          const P = copie(geste.orig); let i = geste.i;
          if (i === 0) { P.unshift(P[0].slice()); i++; }
          if (i + 1 === P.length - 1) P.push(P[P.length - 1].slice());
          geste.P0 = P; geste.k = i; geste.horiz = P[i][1] === P[i + 1][1]; geste.bouge = true;
        }
        const d = geste.horiz ? gp[1] - geste.depart[1] : gp[0] - geste.depart[0];
        const P = copie(geste.P0), k = geste.k;
        if (geste.horiz) { P[k][1] += d; P[k + 1][1] += d; } else { P[k][0] += d; P[k + 1][0] += d; }
        geste.f.pts = P; netEdit = null; rendre(); return;
      }
      case "bout": {
        if (!geste.bouge && !loin) return;
        geste.bouge = true;
        const c = cibleFil(w, rayon(tac ? 20 : 9)), cible = c ? c.pt : gp;
        geste.f.pts = ajusterBout(geste.orig, geste.end, cible[0] - geste.depart[0], cible[1] - geste.depart[1]);
        netEdit = null; rendre(); return;
      }
    }
  }
  function up(e) {
    pointeurs.delete(e.pointerId);
    if (appuis.has(e.pointerId)) { const ref = appuis.get(e.pointerId); appuis.delete(e.pointerId); if (sim && ![...appuis.values()].includes(ref)) { sim.relacher(ref); majSim(true); } return; }
    if (!geste) return;
    const g0 = geste, w = pointMonde(e), tac = tactile(e);
    if (g0.appuiLong) clearTimeout(g0.appuiLong);
    if (g0.type === "pinch") { if (pointeurs.size - appuis.size < 2) geste = null; return; }
    geste = null;
    svg.style.cursor = "";
    switch (g0.type) {
      case "rect": {
        const x0 = Math.min(g0.a[0], g0.b[0]) / G, x1 = Math.max(g0.a[0], g0.b[0]) / G, y0 = Math.min(g0.a[1], g0.b[1]) / G, y1 = Math.max(g0.a[1], g0.b[1]) / G;
        if (x1 - x0 > 0.3 || y1 - y0 > 0.3) {
          for (const pc of schema.pieces) { const b = M.boiteAbs(pc); if (b[0] >= x0 && b[2] <= x1 && b[1] >= y0 && b[3] <= y1) sel.add(pc.id); }
          for (const f of schema.fils) if (f.pts.every((q) => q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1)) sel.add(f.id);
        }
        rendre(); majPanneau(); majBoutons(); return;
      }
      case "deplacer":
        if (g0.bouge) { geste = g0; finirDeplacement(); return; }
        if (g0.basculer) { if (g0.ajout) sel.delete(g0.pc.id); else { sel = new Set([g0.pc.id]); } }
        rendre(); majPanneau(); majBoutons(); return;
      case "tirer": {
        if (!g0.bouge) {
          if (g0.clic) { brouillon = { pts: [[g0.depart.x, g0.depart.y]], dir: g0.depart.d }; curseur = null; bulle("Clique pour faire un coin, puis sur une borne pour finir le fil. Échap pour annuler.", 4000); rendre(); }
          else if (g0.pc) {
            // un clic tout près d'une borne, mais sur un fil (fil très court entre deux bornes) : on choisit le fil
            const fh = filA(g0.w, rayon(g0.tac ? 10 : 5)), dB = Math.hypot(g0.depart.x * G - g0.w[0], g0.depart.y * G - g0.w[1]);
            if (fh && dB > rayon(g0.tac ? 7 : 3)) sel = new Set([fh.f.id]); else { sel = new Set([g0.pc.id]); retenir(g0.pc); }
            rendre(); majPanneau(); majBoutons();
          }
          return;
        }
        const c = cibleFil(w, rayon(tac ? 22 : 10), brouillon.pts[0]);
        if (c) finirFil(c);
        else { brouillon.pts = M.nettoyer(brouillon.pts.concat(routeVers(grilleDe(w), null))); curseur = null; bulle("Fil commencé : clique sur une borne pour le finir, ou ailleurs pour faire un coin. Échap pour annuler.", 4500); rendre(); }
        return;
      }
      case "segment": case "bout":
        if (g0.bouge) { g0.f.pts = M.nettoyer(g0.f.pts); if (g0.f.pts.length < 2) schema.fils = schema.fils.filter((f) => f !== g0.f); commit(); }
        return;
      case "pan": if (!g0.bouge && sim) { /* rien */ } return;
    }
  }
  function annulerPointeur(e) {
    pointeurs.delete(e.pointerId);
    if (appuis.has(e.pointerId)) { const ref = appuis.get(e.pointerId); appuis.delete(e.pointerId); if (sim) { sim.relacher(ref); majSim(true); } return; }
    if (geste && geste.type === "deplacer") annulerDeplacement();
    if (geste && geste.appuiLong) clearTimeout(geste.appuiLong);
    if (geste && geste.type === "tirer" && brouillon && brouillon.pts.length === 1) brouillon = null;
    geste = null; rendre();
  }
  function roulette(e) {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    if (e.shiftKey && !e.ctrlKey) { vue.x -= e.deltaY || e.deltaX; appliquerVue(); return; }
    const k = e.ctrlKey ? 0.012 : (e.deltaMode === 1 ? 0.05 : 0.0016);
    zoomer(Math.exp(-e.deltaY * k), e.clientX - r.left, e.clientY - r.top);
  }
  svg.addEventListener("pointerdown", down);
  svg.addEventListener("pointermove", move);
  svg.addEventListener("pointerup", up);
  svg.addEventListener("pointercancel", annulerPointeur);
  svg.addEventListener("lostpointercapture", (e) => { if (pointeurs.has(e.pointerId)) up(e); });
  svg.addEventListener("wheel", roulette, { passive: false });
  svg.addEventListener("contextmenu", (e) => e.preventDefault());
  svg.addEventListener("pointerleave", () => { if (!geste && (survolBorne || survolPiece || outil === "placer")) { survolBorne = null; survolPiece = null; if (outil === "placer") curseur = null; rendre(); } });
  // un double-clic ne compte que si ses deux clics sont sur la feuille (au doigt : choisir un symbole dans la palette
  // puis toucher la feuille au même endroit ne doit pas ouvrir les réglages)
  let clicPrec = null, clicDernier = null;
  document.addEventListener("click", (e) => { clicPrec = clicDernier; clicDernier = { f: svg.contains(e.target), t: performance.now() }; }, true);
  svg.addEventListener("dblclick", (e) => {
    if (sim || !clicPrec || !clicPrec.f || performance.now() - clicPrec.t > 900) return;
    if (brouillon && brouillon.pts.length >= 2) { const pts = M.nettoyer(brouillon.pts); brouillon = null; if (pts.length >= 2) { schema.fils.push({ id: M.nouvelId(schema, "f"), pts }); commit(); } return; }
    const pc = pieceA(pointMonde(e), 1);
    if (pc && window.innerWidth <= 980) ouvrirPanneau(true);
  });

  /* ---------- clavier ---------- */
  document.addEventListener("keydown", (e) => {
    const cible = e.target, champ = cible && /^(INPUT|SELECT|TEXTAREA)$/.test(cible.tagName);
    if (document.querySelector("dialog[open]")) return;
    if (champ) { if (e.key === "Escape") cible.blur(); return; }
    const k = e.key, mod = e.ctrlKey || e.metaKey;
    if (k === " ") { espace = true; if (cible === svg || cible === document.body) e.preventDefault(); return; }
    if (sim) { if (k === "Escape") { /* rien */ } return; }
    if (mod && (k === "z" || k === "Z")) { e.preventDefault(); if (e.shiftKey) refaire(); else annuler(); }
    else if (mod && (k === "y" || k === "Y")) { e.preventDefault(); refaire(); }
    else if (mod && (k === "d" || k === "D")) { e.preventDefault(); dupliquer(); }
    else if (mod && (k === "a" || k === "A")) { e.preventDefault(); toutChoisir(); }
    else if (mod && (k === "c" || k === "C")) { copier(); }
    else if (mod && (k === "v" || k === "V")) { e.preventDefault(); coller(); }
    else if (mod) return;
    else if (k === "Delete" || k === "Backspace") { e.preventDefault(); supprimer(); }
    else if (k === "r" || k === "R") tourner();
    else if (k === "Escape") annulerEnCours();
    else if (k === "f" || k === "F" || k === "w" || k === "W") choisirOutil("fil");
    else if (k === "v" || k === "V") choisirOutil("fleche");
    else if (k === "h" || k === "H") choisirOutil("main");
    else if (k === "+" || k === "=") zoomCentre(1.2);
    else if (k === "-" || k === "_") zoomCentre(1 / 1.2);
    else if (k === "0") ajusterVue();
    else if (/^Arrow/.test(k) && sel.size) { e.preventDefault(); deplacerSel(k === "ArrowLeft" ? -1 : k === "ArrowRight" ? 1 : 0, k === "ArrowUp" ? -1 : k === "ArrowDown" ? 1 : 0); }
  });
  document.addEventListener("keyup", (e) => { if (e.key === " ") espace = false; });
  function annulerEnCours() {
    if (brouillon) { brouillon = null; bulle(""); rendre(); return; }
    if (outil !== "fleche") { choisirOutil("fleche"); return; }
    if (sel.size) { sel.clear(); rendre(); majPanneau(); majBoutons(); }
  }
  function choisirOutil(o, item) {
    if (sim && !/^(main|fleche|volt|designer|pince|ohm)$/.test(o)) return;
    if (!sim && (o === "volt" || o === "designer" || o === "pince" || o === "ohm")) return;
    if (o === "ohm" && outil !== "ohm") sondes = { a: null, b: null, prochaine: "a" };   // un seul multimètre : on passe de V à Ω
    if (o === "volt" && outil !== "volt") sondesO = { a: null, b: null, prochaine: "a" };
    if (o === "panne" && (sim || !prep)) return;
    if (brouillon && !(o === "fil" && outil === "fil")) brouillon = null;
    outil = o; aPlacer = o === "placer" ? item : null;
    document.querySelectorAll("#sc-barre [data-o]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.o === o)));
    document.querySelectorAll(".pal-i").forEach((b) => b.setAttribute("aria-pressed", String(o === "placer" && item && b.dataset.k === item.k)));
    if (o === "placer") bulle(DOIGT ? `Touche la feuille pour poser : ${esc(M.TYPES[item.type].nom.toLowerCase())}. « Choisir » pour arrêter.` : `Clique sur la feuille pour poser : ${esc(M.TYPES[item.type].nom.toLowerCase())}. <span class="kbd">R</span> pour le tourner, <span class="kbd">Maj</span> + clic pour en poser plusieurs, <span class="kbd">Échap</span> pour arrêter.`, 0);
    else if (o === "fil") bulle("Glisse d'une borne à une autre, ou clique borne par borne. Les coins se font tout seuls.", 3500);
    else if (o === "volt") bulle(`Voltmètre : ${DOIGT ? "touche" : "clique sur"} une borne pour la pointe <b style="color:var(--p-l1)">rouge</b>, puis une autre pour la pointe <b>noire</b> (COM). Les boutons du schéma marchent toujours.`, 5000);
    else if (o === "ohm") bulle(consigne() ? `Ohmmètre : ${DOIGT ? "touche" : "clique sur"} une borne pour la pointe <b style="color:var(--p-l1)">rouge</b>, puis une autre pour la pointe <b>noire</b>.`
      : `<b>Ohmmètre : seulement hors tension.</b> Consigne d'abord (carte « Consignation », à droite) : couper, cadenas, vérifier l'absence de tension.`, 6000);
    else if (o === "pince") { bulle(`Pince : ${DOIGT ? "touche" : "clique sur"} un fil pour lire son courant, ou un appareil (moteur, bobine…) pour le courant de chacune de ses bornes.`, 5500); majPince(); }
    else if (o === "designer") bulle(`${DOIGT ? "Touche" : "Clique sur"} l'élément que tu crois en panne : un fil, un contact, une bobine, un fusible…`, 6000);
    else if (o === "panne") bulle(`${DOIGT ? "Touche" : "Clique sur"} l'élément à mettre en panne : un fil, un contact, un fusible, une bobine, un voyant…`, 5000);
    else bulle("");
    svg.style.cursor = o === "main" ? "grab" : o === "fleche" ? "" : o === "designer" || o === "panne" ? "help" : "crosshair";
    const bp = $("pp-choisir"); if (bp) bp.setAttribute("aria-pressed", String(o === "panne"));
    majBoutons(); rendre(); majVoltmetre(); majOhmmetre();
    const bv = $("dp-volt"); if (bv) bv.setAttribute("aria-pressed", String(o === "volt"));
    const bo = $("dp-ohm"); if (bo) bo.setAttribute("aria-pressed", String(o === "ohm"));
    const bd = $("dp-designer"); if (bd) bd.setAttribute("aria-pressed", String(o === "designer"));
  }

  /* =====================================================================
     VOLTMÈTRE ET DÉPANNAGE
     ===================================================================== */
  function nomBorne(pc, b) {
    const P = M.parametres(pc);
    if (pc.type === "alim") return (M.POTENTIELS.find((x) => x.id === P.pot) || {}).nom || P.pot;
    if (pc.type === "reseau") return b.id;
    return `${pc.ref || M.TYPES[pc.type].court} ${b.n || b.id}`.trim();
  }
  function poserSonde(pc, b) {
    const k = sondes.prochaine, autre = k === "a" ? sondes.b : sondes.a;
    if (autre && autre.piece === pc.id && autre.borne === b.id) return;   // la même borne
    sondes[k] = { piece: pc.id, borne: b.id, x: b.x, y: b.y, nom: nomBorne(pc, b) };
    sondes.prochaine = k === "a" ? "b" : "a";
    if (sondes.a && sondes.b && sim) {
      const r = sim.mesurer(sondes.a, sondes.b);
      let vat = false;   // vérification d'absence de tension : 0 V là où, avant la coupure, il y avait une tension
      if (simE && simE.coupe && !consig.vat && r.v === 0) {
        const av = sim.mesurerAvant(sondes.a, sondes.b);
        if (av && av.v) {
          vat = consig.vat = true; majConsig();
          bulle(`<b>VAT faite</b> : 0 V ici, alors qu'il y avait ${esc(av.texte)} avant la coupure. ${consig.cadenas ? "L'installation est consignée : tu peux prendre l'ohmmètre." : "Pose aussi le cadenas."}`, 6000);
        }
      }
      const der = depEtat && depEtat.mesures[depEtat.mesures.length - 1];
      if (!vat && doc.type === "depannage" && depEtat && !(der && der.a === sondes.a.nom && der.b === sondes.b.nom && der.t === r.texte)) { depEtat.mesures.push({ a: sondes.a.nom, b: sondes.b.nom, t: r.texte }); garderDep(); majCarteDep(); }
    }
    majVoltmetre(); rendre();
  }
  /* ---------- ohmmètre et consignation ----------
     L'ohmmètre se branche hors tension seulement : on consigne d'abord (séparer : couper l'alimentation générale ;
     condamner : le cadenas ; VAT : au voltmètre, 0 V là où il y avait une tension). Une mesure à l'ohmmètre sans
     consignation est une faute de sécurité (comptée, et notée dans le dépannage). */
  const consigne = () => !!(sim && simE && simE.coupe) && consig.cadenas && consig.vat;
  const ohmVide = () => ({ a: null, b: null, prochaine: "a" });
  function faute(txt) {
    consig.fautes++;
    if (doc.type === "depannage" && depEtat && !depEtat.trouve) { depEtat.fautes = (depEtat.fautes || 0) + 1; (depEtat.securite = depEtat.securite || []).push(txt); garderDep(); majCarteDep(); }
    bulle(`<b class="bulle-ko">⚠ Faute de sécurité.</b> ${esc(txt)}`, 8000); majConsig();
  }
  function poserSondeO(pc, b) {
    const k = sondesO.prochaine, autre = k === "a" ? sondesO.b : sondesO.a;
    if (autre && autre.piece === pc.id && autre.borne === b.id) return;
    sondesO[k] = { piece: pc.id, borne: b.id, x: b.x, y: b.y, nom: nomBorne(pc, b) };
    sondesO.prochaine = k === "a" ? "b" : "a";
    if (sondesO.a && sondesO.b && sim) {
      const r = sim.resistance(sondesO.a, sondesO.b), texte = r.sousTension ? "⚠ sous tension" : r.texte;
      if (r.sousTension) faute(`${r.v ? `Ohmmètre sous tension (${r.texteV} entre ses pointes)` : "Ohmmètre sur un circuit sous tension"} : on ne mesure une résistance que hors tension. Consigne d'abord : couper, cadenas, VAT.`);
      else if (!consigne()) faute(!simE.coupe ? "Mesure à l'ohmmètre sans consigner : ici il n'y a pas de tension, mais l'installation est sous tension et quelqu'un peut la remettre en marche."
        : !consig.cadenas ? "Mesure à l'ohmmètre sans cadenas : quelqu'un peut remettre le courant pendant que tu mesures."
        : "Mesure à l'ohmmètre sans avoir vérifié l'absence de tension (VAT) au voltmètre.");
      const der = depEtat && depEtat.mesures[depEtat.mesures.length - 1];
      if (doc.type === "depannage" && depEtat && !(der && der.a === sondesO.a.nom && der.b === sondesO.b.nom && der.t === texte)) { depEtat.mesures.push({ a: sondesO.a.nom, b: sondesO.b.nom, t: texte }); garderDep(); majCarteDep(); }
    }
    majOhmmetre(); rendre();
  }
  function majOhmmetre() {
    const z = $("sc-ohm"); if (!z) return;
    const voir = !!sim && (outil === "ohm" || !!sondesO.a || !!sondesO.b);
    z.hidden = !voir; document.body.classList.toggle("ohm", voir); if (!voir) return;
    const r = sondesO.a && sondesO.b ? sim.resistance(sondesO.a, sondesO.b) : null;
    const ecran = !r ? "— Ω" : r.sousTension ? "⚠ DANGER" : r.texte;
    const etat = !r ? (consigne() ? "hors tension : consigné ✓" : "seulement hors tension (consigne d'abord)")
      : r.sousTension ? "circuit sous tension !" : consigne() ? "hors tension : consigné ✓" : "pas consigné !";
    const h = `<div class="sv-ecran">${esc(ecran)}</div><div class="sv-p"><i class="r"></i>${sondesO.a ? esc(sondesO.a.nom) : "pointe rouge : touche une borne"}</div><div class="sv-p"><i class="n"></i>${sondesO.b ? esc(sondesO.b.nom) : "pointe noire (COM)"}</div><div class="sv-p so-etat${!r || consigne() ? "" : " ko"}">${esc(etat)}</div>`;
    z.classList.toggle("danger", !!(r && r.sousTension));
    if (z.dataset.h !== h) { z.dataset.h = h; z.innerHTML = h; }
  }
  const contacteursSim = () => (simE ? Object.entries(simE.appareils).filter(([r, a]) => (a.sorte === "contacteur" || a.sorte === "relais") && r && r[0] !== "?").map(([r]) => r).sort((a, b) => a.localeCompare(b, "fr", { numeric: true })) : []);
  function carteConsig() {
    const coupe = !!(simE && simE.coupe), cad = consig.cadenas, vat = consig.vat;
    const etape = (fait, titre, txt, bouton) => `<li class="${fait ? "cg-fait" : ""}"><span><b>${titre}</b> ${txt}</span>${fait ? `<em aria-label="fait">✓</em>` : bouton}</li>`;
    let h = !coupe ? `<p class="cg-etat on">⚡ Sous tension</p>` : cad && vat ? `<p class="cg-etat ok">🔒 Consigné : tu peux mesurer à l'ohmmètre</p>` : `<p class="cg-etat">Courant coupé${cad ? ", cadenas posé" : ""} : pas encore consigné</p>`;
    h += `<ol class="cg-etapes">${etape(coupe, "Séparer :", "couper l'alimentation générale.", `<button class="btn sec" type="button" data-k="separer">Couper</button>`)}`
      + etape(cad, "Condamner :", "le cadenas, pour que personne ne remette le courant.", `<button class="btn sec" type="button" data-k="cadenas"${coupe ? "" : " disabled"}>Cadenas</button>`)
      + etape(vat, "Vérifier l'absence de tension (VAT) :", "au voltmètre, 0 V là où il y avait une tension.", `<button class="btn sec" type="button" data-k="volt"${coupe ? "" : " disabled"}>Voltmètre</button>`) + `</ol>`;
    if (coupe) {
      const L = contacteursSim();
      if (L.length) h += `<p class="discret cg-txt">Hors tension, on peut enfoncer un contacteur à la main pour mesurer ses contacts :</p><div class="rang cg-main">${L.map((r) => `<button class="btn sec" type="button" data-k="main" data-ref="${esc(r)}" aria-pressed="${!!(simE.appareils[r] || {}).main}">✋ ${esc(r)}</button>`).join("")}</div>`;
      h += `<div class="rang"><button class="btn sec" type="button" data-k="remettre">${cad ? "Retirer le cadenas et remettre le courant" : "Remettre le courant"}</button></div>`;
    }
    if (consig.fautes) h += `<p class="cg-fautes">⚠ ${consig.fautes} faute${consig.fautes > 1 ? "s" : ""} de sécurité</p>`;
    return h;
  }
  function majConsig() {
    const z = $("sm-consig"); if (!z || !sim) return;
    const h = carteConsig(); if (z.dataset.h !== h) { z.dataset.h = h; z.innerHTML = h; }
    majOhmmetre();
  }
  function actionConsig(k, ref) {
    if (!sim) return;
    if (k === "separer") { sim.couper(true); consig.vat = false; bulle("Courant coupé. Pose le <b>cadenas</b>, puis vérifie l'absence de tension au <b>voltmètre</b> (VAT).", 5500); }
    else if (k === "cadenas") { if (!simE.coupe) return; consig.cadenas = true; bulle(consig.vat ? "Cadenas posé : l'installation est consignée. Tu peux prendre l'<b>ohmmètre</b>." : "Cadenas posé. Vérifie maintenant l'absence de tension au <b>voltmètre</b> (VAT) : 0 V là où il y avait une tension.", 5500); }
    else if (k === "volt") { choisirOutil("volt"); return; }
    else if (k === "main") { if (!simE.coupe) return; sim.pousser(ref); }
    else if (k === "remettre") {
      const branche = !!(sondesO.a && sondesO.b);
      consig.cadenas = false; consig.vat = false; sim.couper(false);
      if (branche) { sondesO = ohmVide(); faute("Tu as remis le courant avec l'ohmmètre branché : retire toujours l'appareil de mesure avant."); }
      else bulle("Courant remis.", 2500);
    }
    majSim(true); majConsig(); rendre();
  }
  /* ---------- défaut d'isolement : une phase touche la carcasse d'un moteur (selon le schéma de liaison à la terre du réseau) ---------- */
  const TXT_SLT = { TT: "TT : le différentiel en amont doit couper ; sinon la carcasse reste à une tension dangereuse.", "TN-S": "TN-S : le défaut est un court-circuit phase-PE : le fusible ou le disjoncteur coupe.", IT: "IT : le premier défaut ne coupe rien (le contrôleur d'isolement le signale) ; le deuxième, sur une autre phase, est un court-circuit." };
  function carteIso() {
    const L = schema.pieces.filter((q) => (q.type === "moteur" || q.type === "moteur6") && q.ref); if (!L.length) return "";
    return `<h3>Défaut d'isolement</h3><div class="iso" id="sm-iso"></div>`;
  }
  function majIso() {
    const z = $("sm-iso"); if (!z || !sim || !simE) return;
    const L = schema.pieces.filter((q) => (q.type === "moteur" || q.type === "moteur6") && q.ref);
    const h = `<p class="discret">Une phase touche la carcasse (choisis la borne). Schéma ${esc(TXT_SLT[simE.slt] || TXT_SLT.TT)}</p>`
      + L.map((q) => { const D = ((simE.appareils[q.ref] || {}).defauts) || [], B = q.type === "moteur6" ? ["U1", "V1", "W1"] : ["U", "V", "W"];
        return `<div class="iso-l"><b>${esc(q.ref)}</b>${B.map((b) => `<button class="btn sec" type="button" data-iso="${esc(q.ref)}" data-b="${b}" aria-pressed="${D.indexOf(b) >= 0}">⚡ ${b}</button>`).join("")}</div>`; }).join("");
    if (z.dataset.h !== h) { z.dataset.h = h; z.innerHTML = h; }
  }
  function cadenasSvg(x, y) { return `<g class="cadenas" transform="translate(${x} ${y})"><path d="M3.5 8V5.6a3.5 3.5 0 017 0V8"/><rect x="1" y="8" width="12" height="9" rx="2"/></g>`; }
  /* ---------- pince ampèremétrique : un fil (son courant), ou un appareil (le courant de chaque borne, et tous ensemble) ---------- */
  const PINCE_APP = /^(moteur|moteur6|bobine|relais|tempo_travail|tempo_repos|voyant|electrovanne|transfo|automate|variateur|capteur3)$/;
  let pince = null, pinceC = null, pinceT = 0;   // pince : { fil, x, y } (pas de la grille) ou { piece } ; pinceC : les courants
  function courantsSim(force) {
    if (!sim) return null;
    const t = performance.now();
    if (force || !pinceC || t - pinceT > 120) { pinceC = sim.courants(); pinceT = t; }
    return pinceC;
  }
  const nfA = (I) => (I < 1e-4 ? "0 A" : I < 0.0995 ? nf(I * 1000, I < 0.00995 ? 1 : 0) + " mA" : I < 9.95 ? nf(I, 2) + " A" : nf(I, 1) + " A");
  function lirePince(force) {   // { I, texte, lignes : [[nom, I]], ensemble }
    const C = pince && courantsSim(force); if (!C) return null;
    if (pince.fil) {
      const L = C.segments.filter((g) => g.fil === pince.fil);
      const g = L.find((q) => Math.min(q.x1, q.x2) <= pince.x && pince.x <= Math.max(q.x1, q.x2) && Math.min(q.y1, q.y2) <= pince.y && pince.y <= Math.max(q.y1, q.y2)) || L[0];
      const I = g ? g.I : 0, ac = g ? g.ac : true;
      return { I, texte: nfA(I) + (I < 1e-4 ? "" : ac ? " ~" : " ="), ac };
    }
    const pc = pieceParId(pince.piece); if (!pc) return null;
    const B = C.bornes[pc.id] || {}, L = M.bornesAbs(pc).filter((b) => b.id !== "PE" && b.id !== "PE2");
    const lignes = L.filter((b) => B[b.id]).map((b) => [b.n || b.id, Math.hypot(B[b.id].re, B[b.id].im)]);
    const somme = L.reduce((a, b) => (B[b.id] ? { re: a.re + B[b.id].re, im: a.im + B[b.id].im } : a), { re: 0, im: 0 });
    const I = lignes.length ? Math.max(...lignes.map((x) => x[1])) : 0;
    return { I, texte: nfA(I), lignes, ensemble: Math.hypot(somme.re, somme.im), In: C.In[pc.id] };
  }
  function majPince(force) {
    const z = $("sc-pince"); if (!z) return;
    const voir = !!sim && (outil === "pince" || !!pince);
    z.hidden = !voir; document.body.classList.toggle("pince", voir); if (!voir) return;
    const r = pince ? lirePince(force) : null;
    let h;
    if (!r) h = `<div class="sv-ecran">— A</div><div class="sv-p">${DOIGT ? "touche" : "clique sur"} un fil, ou un appareil</div>`;
    else if (pince.fil) h = `<div class="sv-ecran">${esc(r.texte)}</div><div class="sv-p">${r.I < 1e-4 ? "aucun courant dans ce fil" : "courant dans le fil, sous la pince"}</div>`;
    else {
      const pc = pieceParId(pince.piece);
      h = `<div class="sv-ecran">${esc(r.texte)}</div><div class="sv-p"><b>${esc(pc.ref || "")}</b>&nbsp;${r.lignes.length ? r.lignes.map(([n, I]) => `${esc(n)} ${esc(nfA(I))}`).join(" · ") : "aucun courant"}</div>`
        + (r.lignes.length > 1 ? `<div class="sv-p">tous ses fils ensemble : ${esc(nfA(r.ensemble))}</div>` : "")
        + (r.In ? `<div class="sv-p">In ≈ ${esc(nfA(r.In))} (${esc(nf(Number(M.parametres(pc).puissance) || 2.2))} kW)</div>` : "");
    }
    if (z.dataset.h !== h) { z.dataset.h = h; z.innerHTML = h; }
    const t = monde.querySelector("[data-pince-t]"); if (t && r && pince.fil && t.textContent !== r.texte) t.textContent = r.texte;
  }
  function majVoltmetre() {
    const z = $("sc-volt"); if (!z) return;
    const voir = !!sim && (outil === "volt" || !!sondes.a || !!sondes.b);
    z.hidden = !voir; document.body.classList.toggle("volt", voir); if (!voir) return;
    const r = sondes.a && sondes.b ? sim.mesurer(sondes.a, sondes.b) : null;
    const v = r ? r.texte : "—";
    if (z.dataset.v === v + (sondes.a ? sondes.a.nom : "") + (sondes.b ? sondes.b.nom : "") + sondes.prochaine) return;
    z.dataset.v = v + (sondes.a ? sondes.a.nom : "") + (sondes.b ? sondes.b.nom : "") + sondes.prochaine;
    z.innerHTML = `<div class="sv-ecran">${esc(v)}</div><div class="sv-p"><i class="r"></i>${sondes.a ? esc(sondes.a.nom) : "pointe rouge : touche une borne"}</div><div class="sv-p"><i class="n"></i>${sondes.b ? esc(sondes.b.nom) : "pointe noire (COM)"}</div>`;
  }
  function marqueDe(m) {
    if (m.fil) { const f = filParId(m.fil); return f ? `<path class="marque-${m.cls}" d="M${f.pts.map((q) => q[0] * G + " " + q[1] * G).join("L")}"/>` : ""; }
    const pc = pieceParId(m.piece); if (!pc) return "";
    const b = M.boiteAbs(pc);
    return `<rect class="marque-${m.cls}" x="${b[0] * G - 6}" y="${b[1] * G - 6}" width="${(b[2] - b[0]) * G + 12}" height="${(b[3] - b[1]) * G + 12}" rx="6"/>`;
  }
  function surcouches() {
    let h = "";
    for (const m of marques) h += marqueDe(m);
    if ((outil === "volt" || outil === "ohm") && survolBorne) h += `<circle class="sonde-vise" cx="${survolBorne.x * G}" cy="${survolBorne.y * G}" r="7"/>`;
    if (sim && consig.cadenas && simE && simE.coupe) for (const pc of schema.pieces) if (pc.type === "reseau" || (pc.type === "alim" && /^(L|L1|L2|L3|\+24)$/.test(M.parametres(pc).pot))) { const b = M.boiteAbs(pc); h += cadenasSvg(b[0] * G - 18, b[1] * G - 2); }
    if (pince && pince.fil) {
      const f = filParId(pince.fil), x = pince.x * G, y = pince.y * G, r = lirePince();
      if (f) h += `<g class="pince-g"><path class="pince-m" d="M${x - 7} ${y - 5}A8.6 8.6 0 1 1 ${x - 7} ${y + 5}"/><text class="pince-t" x="${x + 11}" y="${y - 10}" data-pince-t="1">${esc(r ? r.texte : "")}</text></g>`;
    } else if (pince && pince.piece) {
      const pc = pieceParId(pince.piece);
      if (pc) { const b = M.boiteAbs(pc); h += `<rect class="pince-c" x="${b[0] * G - 7}" y="${b[1] * G - 7}" width="${(b[2] - b[0]) * G + 14}" height="${(b[3] - b[1]) * G + 14}" rx="6"/>`; }
    }
    for (const [P, lab] of [[sondes, "+"], [sondesO, "Ω"]]) for (const [k, c] of [["a", "r"], ["b", "n"]]) {
      const q = P[k]; if (!q) continue;
      const sx = k === "a" ? 1 : -1;   // la pointe rouge penche à droite, la noire à gauche
      h += `<g class="sonde ${c}"><line x1="${q.x * G}" y1="${q.y * G}" x2="${q.x * G + 9 * sx}" y2="${q.y * G - 16}"/><circle cx="${q.x * G}" cy="${q.y * G}" r="4.2"/><text x="${q.x * G + 11 * sx}" y="${q.y * G - 19}">${k === "a" ? lab : "COM"}</text></g>`;
    }
    return h;
  }
  const depParId = (id) => (depProf && depProf.id === id ? depProf.D : X.DEPANNAGES.find((d) => d.id === id) || null);
  function garderDep() {
    if (doc.type !== "depannage" || !depEtat) return;
    garder(CLE.dep(doc.dep), Object.assign({ p: btoa(JSON.stringify(depEtat.panne)), mesures: depEtat.mesures.slice(-40), erreurs: depEtat.erreurs, trouve: depEtat.trouve, repare: depEtat.repare,
      debut: depEtat.debut, fin: depEtat.fin, abandon: depEtat.abandon, designations: depEtat.designations, envoi: depEtat.envoi, fautes: depEtat.fautes || 0, securite: (depEtat.securite || []).slice(-20) }, depProf && depProf.id === doc.dep ? { code: depProf.code } : {}));
  }
  function nouvellePanne(D, sauf) {   // au hasard, parmi les pannes que l'essai montre
    const s = D.base(), L = MO.pannesPossibles(s);
    for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
    const cle = (p) => JSON.stringify(p);
    for (const p of L) if ((!sauf || cle(p) !== cle(sauf)) && MO.panneVisible(s, p, D.essai)) return p;
    return L[0] || null;
  }
  function ouvrirDepannage(id, silencieux, neuve) {
    const D = depParId(id); if (!D) return;
    if (!D.prof) depProf = null;
    if (sim) arreterSim();
    if (doc.type === "defi") sauver(); else if (doc.type === "libre") { sauver(); copieAuto(); }
    doc = { type: "depannage", dep: id };
    let e = null;
    if (!neuve) { const r = lire(CLE.dep(id)) || (D.prof ? reprendreLocal(id) : null); if (r && r.p) { try { e = { panne: JSON.parse(atob(r.p)), mesures: r.mesures || [], erreurs: r.erreurs || 0, trouve: !!r.trouve, repare: !!r.repare, debut: r.debut || Date.now(), fin: r.fin || null, abandon: !!r.abandon, designations: r.designations || [], envoi: r.envoi || "", fautes: r.fautes || 0, securite: r.securite || [] }; } catch (x) { e = null; } } }
    if (e && !MO.pannesPossibles(D.base()).some((q) => JSON.stringify(q) === JSON.stringify(e.panne))) e = null;   // une panne qui n'existe plus : on en tire une autre
    if (e && D.prof && JSON.stringify(e.panne) !== JSON.stringify(D.panne)) e = null;
    depEtat = e || { panne: D.prof ? D.panne : nouvellePanne(D, neuve), mesures: [], erreurs: 0, trouve: false, repare: false, debut: Date.now(), fin: null, abandon: false, designations: [], envoi: "", fautes: 0, securite: [] };
    marques = depEtat.trouve ? [Object.assign(depEtat.panne.fil ? { fil: depEtat.panne.fil } : { piece: depEtat.panne.piece }, { cls: "panne" })] : [];
    garderDep();
    chargerSchema(D.base());
    garder(CLE.dernier, doc);
    fermerDialogues();
    if (history.replaceState) history.replaceState(null, "", D.prof ? "#panne=" + depProf.code : "#depannage=" + id);
    demarrerSim();
    if (!silencieux) ouvrirPanneau(true);
    if (D.prof && depEtat.trouve && depEtat.envoi !== "envoye" && depEtat.envoi !== "file") envoyerDep();   // pas encore parti : on réessaie
  }
  // un élève qui a commencé sans être connecté, puis s'est connecté : il reprend où il en était (une seule fois, et
  // seulement si c'est récent : sur un ordinateur partagé, on ne reprend pas le travail de quelqu'un d'autre)
  function reprendreLocal(id) {
    if (QUI === "local") return null;
    const k = "schemas:dep:local:" + id, r = lire(k);
    if (!r || !r.p || !(Date.now() - (r.debut || 0) < 4 * 3600e3)) return null;
    try { localStorage.removeItem(k); } catch (e) { /* rien */ }
    return r;
  }
  function quitterDepannage() {
    if (sim) arreterSim();
    depEtat = null; marques = []; depProf = null; doc = { type: "libre" };
    let s = null; const sv = lire(CLE.libre); if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    chargerSchema(s || M.nouveau());
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    sauver();
  }
  function relancerSim() { if (sim) { cancelAnimationFrame(rafId); appuis.clear(); PR.live.fermer(); sim = null; } demarrerSim(); }
  function nomPiece(pc) {
    const r = pc.ref || M.TYPES[pc.type].court, t = pc.type, P = M.parametres(pc);
    if (t === "poles") return `les pôles de ${r}`;
    if (t === "sectionneur") return `le sectionneur ${r}`;
    if (t === "thermique") return `le relais thermique ${r}`;
    if (t === "fusible") return `le fusible ${r}`;
    if (t === "differentiel") return `le différentiel ${r}`;
    if (t === "cpi") return `le contrôleur d'isolement ${r}`;
    if (M.BOBINES.indexOf(t) >= 0) return `la bobine de ${r}`;
    if (t === "voyant") return `le voyant ${r}`;
    if (t === "electrovanne") return `la bobine de l'électrovanne ${r}`;
    if (t === "moteur" || t === "moteur6") return `le moteur ${r}`;
    if (t === "alim" || t === "reseau") return "l'alimentation";
    if (t === "automate") return `l'automate ${r}`;
    if (/^bp_|arret_urgence/.test(t)) return `le bouton ${r}${P.num ? " (" + P.num + ")" : ""}`;
    return `le contact ${r}${P.num ? " " + P.num : ""}`;
  }
  function decrirePanne(p, present) {
    if (!p) return "";
    const etait = present ? "est" : "était", cond = present ? "ne conduit plus" : "ne conduisait plus", ferm = present ? "ne se ferme plus" : "ne se fermait plus";
    if (p.fil) {
      const f = filParId(p.fil); if (!f) return `un fil ${etait} coupé`;
      const bout = (q) => { for (const pc of schema.pieces) for (const b of M.bornesAbs(pc)) if (b.x === q[0] && b.y === q[1]) return nomBorne(pc, b); return null; };
      const a = bout(f.pts[0]), b = bout(f.pts[f.pts.length - 1]);
      return a && b ? `le fil entre ${a} et ${b} ${etait} coupé` : a || b ? `le fil qui part de ${a || b} ${etait} coupé` : `un fil ${etait} coupé`;
    }
    const pc = pieceParId(p.piece); if (!pc) return "";
    const r = pc.ref || "", t = pc.type, pole = p.i != null ? `${2 * p.i + 1}-${2 * p.i + 2}` : "";
    if (p.sorte === "soude") return `${t === "poles" ? `le pôle ${pole} de ${r}` : nomPiece(pc)} ${etait} soudé (${present ? "il reste" : "il restait"} fermé)`;
    if (p.sorte === "court") return `${t === "electrovanne" ? `la bobine de l'électrovanne ${r}` : `la bobine de ${r}`} ${etait} en court-circuit`;
    if (p.sorte === "reglage") return `le relais thermique ${r} ${etait} réglé trop bas (il déclenche alors que le moteur tire son courant normal)`;
    if (p.sorte === "phases") return `deux phases ${present ? "sont" : "étaient"} inversées au bornier du moteur ${r}`;
    if (t === "poles" || t === "disjoncteur" || t === "disj_moteur" || t === "differentiel") return `le pôle ${pole} de ${r} ${cond}`;
    if (t === "sectionneur") return `le fusible ${pole} du sectionneur ${r} ${etait} fondu (sans que ça se voie)`;
    if (t === "thermique") return `l'élément ${pole} du relais thermique ${r} ${etait} coupé`;
    if (t === "fusible") return `le fusible ${r} ${etait} fondu (sans que ça se voie)`;
    if (M.BOBINES.indexOf(t) >= 0) return `la bobine de ${r} ${etait} coupée`;
    if (t === "voyant") return `le voyant ${r} ${etait} grillé`;
    if (t === "electrovanne") return `la bobine de l'électrovanne ${r} ${etait} coupée`;
    return `${nomPiece(pc)} ${M.nature(pc) === "nf" ? cond : ferm}`;
  }
  function memePanneFil(a, b) {   // deux fils sont la même panne si les couper sépare les mêmes bornes
    if (a === b) return true;
    const part = (id) => {
      const n = M.netlist(Object.assign({}, schema, { fils: schema.fils.filter((f) => f.id !== id) })), m = new Map();
      return Object.keys(n.borne).sort().map((k) => { const v = n.borne[k]; if (!m.has(v)) m.set(v, m.size); return k + "=" + m.get(v); }).join("|");
    };
    return part(a) === part(b);
  }
  function cibleDesignation(w, tac) {
    const pc = pieceA(w, 0); if (pc) return { piece: pc };
    const fh = filA(w, rayon(tac ? 14 : 7)); if (fh) return { fil: fh.f };
    const pc2 = pieceA(w, tac ? 6 : 2); if (pc2) return { piece: pc2 };
    return null;
  }
  function designer(c) {
    if (doc.type !== "depannage" || !depEtat || depEtat.trouve || !depEtat.panne) return;
    const p = depEtat.panne;
    const ok = c.fil ? !!p.fil && memePanneFil(p.fil, c.fil.id) : !!p.piece && p.piece === c.piece.id;
    (depEtat.designations = depEtat.designations || []).push((ok ? "✓ " : "✗ ") + (c.fil ? "un fil" + (() => { const d = decrirePanne({ fil: c.fil.id }, true); const m = /entre (.*) et (.*) est/.exec(d); return m ? ` (${m[1]} – ${m[2]})` : ""; })() : nomPiece(c.piece)));
    if (ok) {
      depEtat.trouve = true; depEtat.fin = Date.now(); garderDep();
      marques = [Object.assign(p.fil ? { fil: p.fil } : { piece: p.piece }, { cls: "panne" })];
      if (!depProf) {
        const P = lire(CLE.depProgres) || {}, n = depEtat.mesures.length, av = P[doc.dep];
        P[doc.dep] = { ok: true, t: Date.now(), mesures: av && av.mesures != null ? Math.min(av.mesures, n) : n, fois: ((av && av.fois) || 0) + 1 };
        garder(CLE.depProgres, P);
      }
      choisirOutil("fleche");
      bulle(`Bravo, trouvé : ${esc(decrirePanne(p))}. Note : ${nf(noteDep())} / 20.`, 6000);
      if (depProf) envoyerDep(); else envoyerDepEntrainement();
    } else {
      depEtat.erreurs++; garderDep();
      const m = Object.assign(c.fil ? { fil: c.fil.id } : { piece: c.piece.id }, { cls: "bon" });
      marques = marques.filter((x) => x.cls !== "bon").concat([m]);
      setTimeout(() => { marques = marques.filter((x) => x !== m); rendre(); }, 2200);
      choisirOutil("volt");
      const A = c.piece && simE && simE.appareils[c.piece.ref];
      if (A && (A.fondu || (A.fondus && A.fondus.some(Boolean)))) bulle(`Non : ${esc(c.piece.ref)} a fondu, mais il n'est pas en panne : c'est une conséquence. Remplace-le, et cherche pourquoi il fond (à l'ohmmètre, hors tension).`, 7000);
      else if (A && A.declenche && c.piece.type !== "thermique") bulle(`Non : ${esc(c.piece.ref)} a déclenché, mais il n'est pas en panne. Réarme-le, et cherche ce qui le fait déclencher.`, 6500);
      else bulle(`Non : ${c.fil ? "ce fil" : esc(nomPiece(c.piece))} est en bon état. Mesure encore : au voltmètre (sous tension), ou à l'ohmmètre (hors tension).`, 5500);
    }
    majCarteDep(); rendre();
  }
  function carteDepannage() {
    const D = depParId(doc.dep); if (!D || !depEtat) return "";
    const k = X.DEPANNAGES.indexOf(D), fait = !D.prof && !!(lire(CLE.depProgres) || {})[D.id];
    return `<div class="pn-carte pn-defi pn-dep"><div class="eyebrow">${D.prof ? "Dépannage du professeur · même panne pour toute la classe" : `Dépannage ${k + 1} sur ${X.DEPANNAGES.length} · ${"●".repeat(D.niveau)}${"○".repeat(3 - D.niveau)}${fait ? " · déjà réussi ✓" : ""}`}</div>
      <h2>${esc(D.titre)}</h2>
      ${D.prof ? (session && session.nom ? `<p class="dp-qui ok">Connecté(e) : <b>${esc(session.nom)}</b>. Ta note partira au professeur dès que tu auras trouvé.</p>`
        : `<p class="dp-qui ko">Tu n'es pas connecté(e) au site : ta note ne partira pas au professeur. <a href="../index.html">Connecte-toi d'abord</a>, puis rouvre ce lien.</p>`) : ""}
      <p>Le schéma est juste, mais une <b>panne</b> y est cachée : un fil coupé, un contact qui ne conduit plus ou qui reste collé (soudé), une bobine coupée ou en court-circuit, un voyant ou un fusible, un relais thermique mal réglé, deux phases inversées… Ici, les fils ne montrent pas la tension : il faut <b>mesurer</b>.</p>
      <details class="dp-ok" open><summary>Ce qui doit se passer</summary>${D.fonctionnement}</details>
      <ol class="dp-etapes"><li>Essaie le schéma : qu'est-ce qui ne marche pas ?</li><li>Sous tension, prends le <b>voltmètre</b> : pointe rouge sur une borne, pointe noire sur une autre (par exemple N ou 0 V). Cherche où la tension s'arrête.</li><li>Hors tension seulement, l'<b>ohmmètre</b> : <button class="lien" type="button" id="dp-consig">consigne</button> d'abord (couper, cadenas, VAT), puis mesure une bobine, un contact, un enroulement.</li><li>Désigne l'élément en panne.</li></ol>
      <div class="rang"><button class="btn" type="button" id="dp-volt" aria-pressed="${outil === "volt"}">Voltmètre</button><button class="btn sec" type="button" id="dp-ohm" aria-pressed="${outil === "ohm"}">Ohmmètre</button><button class="btn sec" type="button" id="dp-designer" aria-pressed="${outil === "designer"}"${depEtat.trouve || depEtat.repare ? " disabled" : ""}>Désigner la panne</button></div>
      <div id="dp-suivi">${suiviDep()}</div>
      <p class="discret dp-bareme">Note sur 20 : −${nf((D.bareme || BAREME).parMesure)} par mesure au-delà de ${(D.bareme || BAREME).libres}, −${nf((D.bareme || BAREME).parErreur)} par mauvaise désignation, −${nf(baremeDe(D).parFaute)} par faute de sécurité (ohmmètre sans consigner).</p>
      <div class="rang">${D.prof ? `<button class="btn sec" type="button" id="dp-abandon"${depEtat.trouve ? " hidden" : ""}>Abandonner (note 0)</button>` : `<button class="btn sec" type="button" id="dp-nouvelle">Nouvelle panne</button>`}<button class="btn sec" type="button" id="dp-quitter">Quitter le dépannage</button></div></div>`;
  }
  function suiviDep() {
    const n = depEtat.mesures.length, e = depEtat.erreurs;
    const f = depEtat.fautes || 0;
    let h = `<p class="dp-cpt">${n} mesure${n > 1 ? "s" : ""}${e ? ` · ${e} erreur${e > 1 ? "s" : ""}` : ""}${f ? ` · <span class="dp-faute">${f} faute${f > 1 ? "s" : ""} de sécurité</span>` : ""}</p>`;
    if (n) h += `<ul class="dp-mesures">${depEtat.mesures.slice(-6).reverse().map((m) => `<li><span><i class="r"></i>${esc(m.a)} <i class="n"></i>${esc(m.b)}</span><b>${esc(m.t)}</b></li>`).join("")}</ul>`;
    if (depEtat.trouve) {
      h += depEtat.abandon ? `<div class="bravo ko">Abandon : ${esc(decrirePanne(depEtat.panne))}. Note : 0 / 20.</div>`
        : `<div class="bravo">Trouvé : ${esc(decrirePanne(depEtat.panne))}. ${n} mesure${n > 1 ? "s" : ""}, ${e ? `${e} erreur${e > 1 ? "s" : ""}` : "aucune erreur"}${f ? `, ${f} faute${f > 1 ? "s" : ""} de sécurité` : ""}. <b>Note : ${nf(noteDep())} / 20</b>.</div>`;
      if (depProf) {
        const E = depEtat.envoi, nom = session && session.nom ? esc(session.nom) : "";
        h += E === "envoye" ? `<p class="dp-envoi ok">Résultat envoyé au professeur ✓${nom ? ` (${nom})` : ""}</p>`
          : E === "file" ? `<p class="dp-envoi ok">Résultat gardé : il partira dès que le site sera joignable ✓</p>`
          : E === "en cours" ? `<p class="dp-envoi">Envoi au professeur…</p>`
          : `<p class="dp-envoi ko">${E === "deconnecte" ? "Tu n'es pas connecté(e) au site : ton résultat n'est pas parti. Connecte-toi sur la page d'accueil, puis reviens ici." : E === "expire" ? "Ta connexion au site a expiré : reconnecte-toi sur la page d'accueil, puis reviens ici." : "Le résultat n'a pas pu partir."} Sinon, montre cet écran au professeur.</p><div class="rang"><button class="btn sec" type="button" id="dp-renvoyer">Envoyer mon résultat</button></div>`;
      } else if (/^(envoye|file)$/.test(depEtat.envoi || "")) h += `<p class="discret">Ton professeur le voit dans son suivi ✓</p>`;
      h += depEtat.repare ? `<p class="discret">Réparé : essaie le schéma, il marche de nouveau.</p>` : `<div class="rang"><button class="btn" type="button" id="dp-reparer">Réparer et essayer</button></div>`;
    }
    return h;
  }
  function majCarteDep() { const z = $("dp-suivi"); if (!z || !depEtat) return; z.innerHTML = suiviDep(); brancherSuivi(); const bd = $("dp-designer"); if (bd) bd.disabled = depEtat.trouve || depEtat.repare; const ab = $("dp-abandon"); if (ab) ab.hidden = depEtat.trouve; }
  const baremeDe = (D) => Object.assign({}, BAREME, (D && D.bareme) || {});
  function noteDep() {
    const D = depParId(doc.dep), b = baremeDe(D);
    if (!depEtat || depEtat.abandon) return 0;
    const pen = Math.max(0, depEtat.mesures.length - b.libres) * b.parMesure + depEtat.erreurs * b.parErreur + (depEtat.fautes || 0) * b.parFaute;
    return Math.max(0, Math.round((20 - pen) * 4) / 4);
  }

  /* ---------- le dépannage préparé par le professeur ---------- */
  const b64 = (u) => { let t = ""; for (let i = 0; i < u.length; i += 0x8000) t += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const deb64 = (t) => { const x = atob(t.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((t.length + 3) % 4)), u = new Uint8Array(x.length); for (let i = 0; i < x.length; i++) u[i] = x.charCodeAt(i); return u; };
  async function encoderCode(o, compresser) {   // « z… » : compressé (le lien) ; « j… » : tel quel (le fichier, lisible partout)
    const u = new TextEncoder().encode(JSON.stringify(o));
    if (compresser && window.CompressionStream) { try { const f = new Blob([u]).stream().pipeThrough(new CompressionStream("deflate-raw")); return "z" + b64(new Uint8Array(await new Response(f).arrayBuffer())); } catch (e) { /* tel quel */ } }
    return "j" + b64(u);
  }
  async function decoderCode(code) {
    const t = String(code || "").trim(), u = deb64(t.slice(1));
    if (t[0] === "z") { const f = new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw")); return JSON.parse(await new Response(f).text()); }
    if (t[0] === "j") return JSON.parse(new TextDecoder().decode(u));
    throw new Error("code");
  }
  const hacher = (t) => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); };
  const lireBareme = (b) => { const n = (v, d, a, z) => (v != null && v !== "" && Number.isFinite(+v) ? Math.min(z, Math.max(a, +v)) : d); b = b || {}; return { libres: Math.round(n(b.libres, BAREME.libres, 0, 99)), parMesure: n(b.parMesure, BAREME.parMesure, 0, 5), parErreur: n(b.parErreur, BAREME.parErreur, 0, 20), parFaute: n(b.parFaute, BAREME.parFaute, 0, 20) }; };
  const enHtml = (t) => String(t || "").split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  async function ouvrirCodeProf(code, silencieux) {
    let o, s;
    try { o = await decoderCode(code); s = M.valider(o.s); }
    catch (e) { toast(String(code)[0] === "z" && !window.DecompressionStream ? "Ce navigateur ne sait pas lire ce lien : demande le fichier au professeur." : "Ce dépannage n'a pas pu être lu (lien abîmé ?)."); return false; }
    if (!o.p || !MO.pannesPossibles(s).some((q) => JSON.stringify(q) === JSON.stringify(o.p))) { toast("La panne de ce dépannage n'existe pas dans son schéma."); return false; }
    const id = "prof-" + hacher(JSON.stringify(o)), titre = String(o.t || s.titre || "Dépannage").slice(0, 80), bareme = lireBareme(o.b);
    depProf = { id, code, D: { id, prof: true, titre, niveau: 0, resume: "", panne: o.p, bareme, base: () => M.cloner(s), fonctionnement: o.c ? enHtml(String(o.c).slice(0, 1500)) : "<p class=\"discret\">Le professeur n'a pas écrit de consigne : essaie le schéma pour voir ce qu'il fait.</p>" } };
    ouvrirDepannage(id, silencieux);
    return true;
  }
  let siteP = null;
  function chargerSite() {   // le site (configuration, Supabase, données de l'élève) : seulement pour envoyer un résultat
    if (window.SIP && SIP.ecrire && SIP.session) return Promise.resolve(window.SIP);
    if (siteP) return siteP;
    const script = (src) => new Promise((ok) => { const e = document.createElement("script"); e.src = src; e.onload = () => ok(true); e.onerror = () => ok(false); document.head.appendChild(e); });
    siteP = (async () => {
      await script("../config.js");
      const C = window.SIP_CONFIG || {};
      if (C.supabaseUrl && C.supabaseAnonKey && !window.supabase) await script("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
      await script("../assets/backend.js");
      return window.SIP && SIP.ecrire && SIP.session ? window.SIP : null;
    })();
    return siteP;
  }
  // envoyer un résultat au suivi de l'élève (le site est chargé à ce moment-là) : "envoye", "file" (hors ligne : il partira
  // plus tard), "deconnecte", "expire" ou "erreur"
  /* ---------- en direct : l'élève connecté montre son travail au professeur (supabase/direct.sql) ----------
     le schéma part quand il change (au plus toutes les 10 s), avec ce que fait l'élève (schéma libre, défi, dépannage,
     lecture, simulation) ; un signe de vie toutes les 30 s tant que la page est visible. Le professeur le voit dans la
     page « En direct » de son espace. Rien ne part sans connexion au site ; en aperçu, rien ne quitte ce navigateur. */
  const DIRECT = { dernier: "", enVol: false, encore: false, t: 0, minut: 0, arret: !(session && session.jeton) };
  function quoiDirect() {
    let q;
    if (doc.type === "defi") {
      if (cpltProf && cpltProf.id === doc.defi) q = "Schéma à compléter : " + ((cpltProf.D && cpltProf.D.titre) || "");
      else { const k = X.DEFIS.findIndex((d) => d.id === doc.defi); q = k >= 0 ? `Défi ${k + 1} : ${X.DEFIS[k].titre}` : "Défi"; }
    } else if (doc.type === "depannage") { const D = depParId(doc.dep); q = (depProf && depProf.id === doc.dep ? "Dépannage du professeur : " : "Dépannage : ") + (D ? D.titre : ""); }
    else if (doc.type === "lecture") { const L = lectureParId(doc.lecture); q = "Lecture de schéma : " + (L ? L.titre : ""); }
    else q = "Schéma libre : " + (schema.titre || "Mon schéma");
    if (dimEtat && $("d-dim") && $("d-dim").open) q += " · Calcul des câbles" + (dimEtat.exo ? " : " + dimEtat.exo.titre : "");
    return q.slice(0, 160);
  }
  const infoDirect = () => ({ quoi: quoiDirect(), sim: !!sim, n: schema.pieces.length, f: schema.fils.length, doc: doc.type });
  function directMarquer() { if (!DIRECT.arret) planifierDirect(); }
  function planifierDirect(vite) { if (DIRECT.arret || DIRECT.minut) return; DIRECT.minut = setTimeout(pousserDirect, vite ? 300 : Math.max(1500, 10000 - (Date.now() - DIRECT.t))); }
  async function pousserDirect() {
    clearTimeout(DIRECT.minut); DIRECT.minut = 0;
    if (DIRECT.arret) return;
    if (DIRECT.enVol) { DIRECT.encore = true; return; }
    DIRECT.enVol = true; DIRECT.t = Date.now();
    const j = JSON.stringify(schema), avec = j !== DIRECT.dernier;
    try {
      const S = await chargerSite();
      if (!S || !S.api || !S.api.directPousser || !(S.session && S.session.get())) { DIRECT.arret = true; return; }
      await S.api.directPousser("schemas", avec ? JSON.parse(j) : null, infoDirect());
      if (avec) DIRECT.dernier = j;
    } catch (e) {   // pas connecté, ou base pas encore à jour : on s'arrête ; le réseau : on réessaie au prochain signe de vie
      if (/SESSION_EXPIREE|direct_pousser|does not exist|schema cache|DIRECT_/i.test(String((e && e.message) || e || ""))) DIRECT.arret = true;
    } finally { DIRECT.enVol = false; if (DIRECT.encore) { DIRECT.encore = false; planifierDirect(); } }
  }
  if (!DIRECT.arret) {
    setInterval(() => { if (document.visibilityState === "visible") pousserDirect(); }, 30000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") planifierDirect(true); });
  }
  async function envoyerAuSite(resultat) {
    let S = null; try { S = await chargerSite(); } catch (e) { S = null; }
    const se = S && S.session && S.session.get();
    if (!se) return "deconnecte";
    try { return (await S.ecrire("enregistrer", resultat)) ? "envoye" : "file"; }
    catch (e) { return e && e.message === "SESSION_EXPIREE" ? "expire" : "erreur"; }
  }
  function detailsDep(bareme) {
    const n = depEtat.mesures.length, note = noteDep();
    return [
      { q: "Panne cachée", rep: (depEtat.abandon ? "abandon" : `trouvée après ${n} mesure${n > 1 ? "s" : ""} et ${depEtat.erreurs} mauvaise${depEtat.erreurs > 1 ? "s" : ""} désignation${depEtat.erreurs > 1 ? "s" : ""}` + (depEtat.designations && depEtat.designations.length ? " : " + depEtat.designations.join(" ; ") : ""))
          + (depEtat.fautes ? `. Fautes de sécurité (${depEtat.fautes}) : ${(depEtat.securite || []).map((x) => x.split(" : ")[0].split(" (")[0]).join(" ; ")}` : ""),
        attendu: decrirePanne(depEtat.panne, true), bareme: 20, pts: note, erreurs: depEtat.erreurs + (depEtat.abandon ? 1 : 0),
        mesures: n, mauvaises: depEtat.erreurs, abandon: !!depEtat.abandon, designations: (depEtat.designations || []).slice(0, 30), fautes: depEtat.fautes || 0, securite: (depEtat.securite || []).slice(0, 20) },
      { q: `Mesures (${n})`, rep: depEtat.mesures.map((m) => `${m.a} → ${m.b} : ${m.t}`).join(" ; ").slice(0, 2000) || "aucune", attendu: `${bareme.libres} sans pénalité`, erreurs: 0 }];
  }
  const dureeDep = () => Math.round(((depEtat.fin || Date.now()) - (depEtat.debut || Date.now())) / 1000);
  async function envoyerDep() {
    if (!depEtat || !depProf || !depEtat.trouve || depEtat.envoi === "en cours") return;
    const D = depProf.D, E = depEtat;
    E.envoi = "en cours"; majCarteDep();
    const r = await envoyerAuSite({ module: "schemas-" + depProf.id, titre: "Dépannage · " + D.titre, type: "externe", score: noteDep(), score_max: 20, duree_s: dureeDep(), details: detailsDep(D.bareme) });
    E.envoi = r; if (E === depEtat) { garderDep(); majCarteDep(); }
  }
  // un dépannage d'entraînement trouvé (ou abandonné) part dans le suivi, s'il est connecté ; chaque panne compte une fois
  async function envoyerDepEntrainement() {
    if (!session || !depEtat || depProf || !depEtat.trouve || /^(envoye|file|en cours)$/.test(depEtat.envoi || "")) return;
    const D = depParId(doc.dep), E = depEtat; if (!D) return;
    E.envoi = "en cours";
    const r = await envoyerAuSite({ module: "schemas-dep-" + D.id, titre: "Atelier schémas · Dépannage : " + D.titre, type: "externe", score: noteDep(), score_max: 20, duree_s: dureeDep(), details: detailsDep(D.bareme || BAREME) });
    E.envoi = r; if (E === depEtat) { garderDep(); majCarteDep(); }   // l'élève a pu passer à une autre panne pendant l'envoi
  }
  /* ---------- les défis réussis, dans le suivi du professeur ---------- */
  // essais ratés et indice regardé, défi par défi, jusqu'à la première réussite ; la note (sur 20) : 20, −2 par essai raté
  // (5 au plus), −3 si l'indice a été ouvert, jamais moins de 10. Elle ne compte pas dans la moyenne du suivi.
  const statsDefis = () => lire(CLE.defiStats) || {};
  function statsDefi(id) { const S = statsDefis(); return S[id] || { rates: 0, indice: false, debut: Date.now() }; }
  function garderStatsDefi(id, o) { const S = statsDefis(); S[id] = o; garder(CLE.defiStats, S); }
  const noteDefi = (st) => Math.max(10, 20 - 2 * Math.min(5, st.rates || 0) - (st.indice ? 3 : 0));
  let envoiDefis = false;
  async function envoyerDefis() {   // tous les défis réussis qui ne sont pas encore partis (réussis avant de se connecter, hors ligne…)
    if (envoiDefis || !session) return;
    const P = progres(), E = lire(CLE.envois) || {};
    const L = X.DEFIS.filter((D) => P[D.id] && P[D.id].ok && !E["defi:" + D.id]);
    if (!L.length) return;
    envoiDefis = true;
    try {
      for (const D of L) {
        const k = X.DEFIS.indexOf(D), p = P[D.id], ancien = p.rates == null, st = { rates: p.rates || 0, indice: !!p.indice }, note = noteDefi(st);   // ancien : réussi avant le suivi, essais pas comptés
        const r = await envoyerAuSite({ module: "schemas-defi-" + D.id, titre: `Atelier schémas · Défi ${k + 1} : ${D.titre}`, type: "externe", score: note, score_max: 20,
          duree_s: p.debut && p.t ? Math.min(3 * 3600, Math.max(0, Math.round((p.t - p.debut) / 1000))) : 0,
          details: [{ q: `Défi ${k + 1} : ${D.titre}`, rep: ancien ? "réussi (essais pas comptés : réussi avant l'arrivée du suivi)" : `réussi ${st.rates ? `après ${st.rates} essai${st.rates > 1 ? "s" : ""} raté${st.rates > 1 ? "s" : ""}` : "du premier coup"}${st.indice ? ", avec l'indice" : ", sans indice"}`,
            attendu: "réussi du premier coup, sans indice", pts: note, bareme: 20, erreurs: st.rates, essais: st.rates + 1, indice: st.indice, ancien, niveau: D.niveau, defi: k + 1 }] });
        if (r === "envoye" || r === "file") { E["defi:" + D.id] = Date.now(); garder(CLE.envois, E); } else break;
      }
    } finally { envoiDefis = false; }
  }
  /* ---------- lecture de schéma : une question, un clic sur l'appareil ; 1 point du premier coup, ½ au deuxième ---------- */
  const lectureParId = (id) => (X.LECTURES || []).find((L) => L.id === id) || null;
  const garderLec = () => { if (lecEtat && doc.type === "lecture") garder(CLE.lec(doc.lecture), lecEtat); };
  const noteLecture = () => (lecEtat ? Math.round((200 * lecEtat.points) / lecEtat.n) / 10 : 0);
  function ouvrirLecture(id, silencieux) {
    const L = lectureParId(id); if (!L) return;
    if (sim) arreterSim();
    if (doc.type === "defi") sauver(); else if (doc.type === "libre") { sauver(); copieAuto(); } else if (doc.type === "depannage") { depEtat = null; depProf = null; }
    doc = { type: "lecture", lecture: id };
    const r = lire(CLE.lec(id));
    lecEtat = r && !r.fini && r.n === L.questions.length ? r : { n: L.questions.length, k: 0, essais: 0, points: 0, reponses: [], clics: [], attente: null, fini: false, debut: Date.now(), fin: null, envoi: "" };
    marques = [];
    chargerSchema(L.base());
    garder(CLE.dernier, doc); garderLec();
    fermerDialogues();
    if (history.replaceState) history.replaceState(null, "", "#lecture=" + id);
    demarrerSim();
    if (!silencieux) ouvrirPanneau(true);
  }
  function quitterLecture() {
    if (sim) arreterSim();
    lecEtat = null; marques = []; doc = { type: "libre" };
    let s = null; const sv = lire(CLE.libre); if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    chargerSchema(s || M.nouveau());
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    garder(CLE.dernier, doc);
  }
  const estBon = (Q, pc) => Q.bon.some(([r, t]) => pc.ref === r && (!t || pc.type === t));
  function repondreLecture(pc) {
    const L = lectureParId(doc.lecture), E = lecEtat; if (!L || !E || E.fini || E.attente) return;
    const Q = L.questions[E.k];
    E.clics = (E.clics || []).concat(pc.ref || M.TYPES[pc.type].court);
    if (estBon(Q, pc)) {
      const pts = E.essais ? 0.5 : 1;
      E.points += pts; E.reponses.push({ ok: true, essais: E.essais + 1, pts, clics: E.clics });
      marques = [{ piece: pc.id, cls: "bon" }]; E.attente = "bon";
    } else {
      E.essais++;
      marques = [{ piece: pc.id, cls: "panne" }];
      if (E.essais >= 2) {   // deux erreurs : la bonne réponse en vert, on passe
        marques = marques.concat(schema.pieces.filter((q) => estBon(Q, q)).map((q) => ({ piece: q.id, cls: "bon" })));
        E.reponses.push({ ok: false, essais: 2, pts: 0, clics: E.clics }); E.attente = "montre";
      }
    }
    garderLec(); majCarteLecture(); dessiner();
  }
  function questionSuivante() {
    const E = lecEtat; if (!E || !E.attente) return;
    E.k++; E.essais = 0; E.clics = []; E.attente = null; marques = [];
    if (E.k >= E.n) {
      E.fini = true; E.fin = Date.now();
      const L = lectureParId(doc.lecture), P = lire(CLE.lecProgres) || {}, note = noteLecture();
      if (!P[L.id] || note > P[L.id].note) { P[L.id] = { note, t: Date.now() }; garder(CLE.lecProgres, P); }
      envoyerLecture();
    }
    garderLec(); majCarteLecture(); dessiner();
  }
  async function envoyerLecture() {   // chaque lecture terminée part dans le suivi (s'il est connecté)
    const L = lectureParId(doc.lecture), E = lecEtat; if (!session || !L || !E || !E.fini || E.envoi) return;
    E.envoi = "en cours"; majCarteLecture();
    const r = await envoyerAuSite({ module: "schemas-lecture-" + L.id, titre: "Atelier schémas · Lecture : " + L.titre, type: "externe", score: noteLecture(), score_max: 20,
      duree_s: Math.round(((E.fin || Date.now()) - (E.debut || Date.now())) / 1000),
      details: L.questions.map((Q, i) => { const R = E.reponses[i] || { ok: false, essais: 0, pts: 0, clics: [] }; return { q: Q.q, rep: (R.clics || []).join(", ") || "—", attendu: [...new Set(Q.bon.map((b) => b[0]))].join(" ou "), pts: R.pts, bareme: 1, erreurs: R.ok ? R.essais - 1 : 2, essais: R.essais }; }) });
    E.envoi = r; if (E === lecEtat) { garderLec(); majCarteLecture(); }
  }
  function carteLecture() {
    const L = lectureParId(doc.lecture), E = lecEtat; if (!L || !E) return "";
    const k = X.LECTURES.indexOf(L);
    let h = `<div class="pn-carte pn-lecture"><div class="eyebrow">Lecture de schéma ${k + 1} sur ${X.LECTURES.length} · ${"●".repeat(L.niveau)}${"○".repeat(3 - L.niveau)}</div><h2>${esc(L.titre)}</h2>
      <div class="lc-points" aria-hidden="true">${L.questions.map((_, i) => { const R = E.reponses[i]; return `<i class="${R ? (R.ok ? (R.essais === 1 ? "ok" : "moyen") : "ko") : i === E.k && !E.fini ? "cur" : ""}"></i>`; }).join("")}</div>`;
    if (!E.fini) {
      const Q = L.questions[E.k];
      h += `<p class="lc-q"><b>Question ${E.k + 1} sur ${E.n}.</b> ${esc(Q.q)}</p>`;
      if (E.attente === "bon") h += `<div class="bravo">${E.essais ? "Oui, au deuxième essai." : "Oui !"} ${esc(Q.expl)}</div>`;
      else if (E.attente === "montre") h += `<div class="bravo ko">Non : c'était l'appareil entouré en vert. ${esc(Q.expl)}</div>`;
      else if (E.essais) h += `<p class="dp-envoi ko">Non, pas celui-là (en rouge). Encore un essai.</p>`;
      else h += `<p class="discret">${DOIGT ? "Touche" : "Clique sur"} l'appareil, sur le schéma.</p>`;
      if (E.attente) h += `<div class="rang"><button class="btn" type="button" id="lc-suivant">${E.k + 1 < E.n ? "Question suivante →" : "Voir ma note"}</button></div>`;
    } else {
      const net = E.reponses.filter((r) => r.ok && r.essais === 1).length;
      h += `<div class="bravo">Terminé : <b>${nf(noteLecture())} / 20</b>. ${net} sur ${E.n} du premier coup.</div>`
        + `<p class="discret">${!session ? "Connecte-toi au site (Mon espace) : ton professeur verra ta note." : E.envoi === "envoye" || E.envoi === "file" ? "Ton professeur le voit dans son suivi ✓" : E.envoi === "en cours" ? "Envoi au professeur…" : E.envoi ? "Ta note n'est pas partie : reconnecte-toi sur la page d'accueil, puis recommence." : ""}</p>`
        + `<div class="rang"><button class="btn" type="button" id="lc-encore">Recommencer</button></div>`;
    }
    return h + `<div class="rang"><button class="btn sec" type="button" id="lc-quitter">Quitter la lecture</button></div></div>`;
  }
  function brancherLecture() {
    const s = $("lc-suivant"); if (s) s.onclick = questionSuivante;
    const e = $("lc-encore"); if (e) e.onclick = () => { try { localStorage.removeItem(CLE.lec(doc.lecture)); } catch (x) { /* rien */ } ouvrirLecture(doc.lecture); };
    const q = $("lc-quitter"); if (q) q.onclick = quitterLecture;
  }
  function majCarteLecture() { const z = $("lc-carte"); if (z) { z.innerHTML = carteLecture(); brancherLecture(); } }
  /* ---------- préparer un schéma à compléter (professeur) ----------
     1. le corrigé (le schéma juste) : l'essai est fait dessus (MO.essaiAuto) ; 2. le départ (le corrigé, moins ce que
     l'élève doit faire) : il ne doit pas passer l'essai ; 3. titre, consigne, indice ; puis le lien ou le fichier. */
  const valideOuNul = (o) => { try { return o ? M.valider(o) : null; } catch (e) { return null; } };
  function garderPrepC() { if (prepC) garder(CLE.prepC, prepC); }
  function essaiPrepC() {
    if (!prepC || !prepC.corrige) return null;
    const k = JSON.stringify(prepC.corrige);
    if (!essaiC || essaiC.k !== k) {
      const E = MO.essaiAuto(M.cloner(prepC.corrige));
      essaiC = Object.assign({ k, okC: MO.scenario(M.cloner(prepC.corrige), E.etapes, { exige: E.exige }).ok }, E);
    }
    if (prepC.depart) { const kd = JSON.stringify(prepC.depart); if (essaiC.kd !== kd) { essaiC.kd = kd; essaiC.okD = MO.scenario(M.cloner(prepC.depart), essaiC.etapes, { exige: essaiC.exige }).ok; } }
    return essaiC;
  }
  function ouvrirPrepC() {
    if (doc.type !== "libre") { toast("Quitte d'abord le défi, la lecture ou le dépannage, puis ouvre le schéma juste."); return; }
    if (sim) arreterSim();
    prep = null;
    const sv = lire(CLE.prepC);
    prepC = sv && typeof sv === "object" ? { corrige: valideOuNul(sv.corrige), depart: valideOuNul(sv.depart), titre: String(sv.titre || ""), consigne: String(sv.consigne || ""), indice: String(sv.indice || "") }
      : { corrige: null, depart: null, titre: "", consigne: "", indice: "" };
    fermerDialogues(); sel.clear(); choisirOutil("fleche"); majPanneau(); ouvrirPanneau(true);
  }
  function cartePrepC() {
    const P = prepC, c = P.corrige, d = P.depart, E = essaiPrepC();
    const nb = (x) => `${x.pieces.length} symbole${x.pieces.length > 1 ? "s" : ""}, ${x.fils.length} fil${x.fils.length > 1 ? "s" : ""}`;
    const pret = !!(c && d && E && E.okC && !E.okD && E.commandes.length);
    return `<div class="pn-carte pn-defi pn-prep pn-prepc"><div class="eyebrow">Préparer un schéma à compléter · professeur</div><h2>Un schéma à compléter</h2>
      <p>Les élèves reçoivent un schéma incomplet. « Vérifier » rejoue un essai fait sur ton corrigé (chaque bouton appuyé puis relâché, chaque interrupteur basculé, deux fois de suite) et compare : les bobines, les moteurs, les voyants de l'élève doivent faire comme les tiens. Leur note sur 20 t'arrive dans l'espace professeur, page « Dépannages et schémas ».</p>
      <ol class="pc-etapes">
        <li><b>Le corrigé</b> : le schéma juste, ouvert sur la feuille. ${c ? `<span class="ok">✓ ${nb(c)}.</span> L'essai : ${E.etapes.length} étapes (commandes : ${esc(E.commandes.join(", ") || "aucune")}) ; on regarde ${esc(E.observes.join(", ") || "rien")}.${!E.commandes.length ? ` <span class="ko">Il n'y a rien à actionner : ajoute des boutons ou des interrupteurs.</span>` : ""}${!E.okC ? ` <span class="ko">Le corrigé ne passe pas son propre essai (un court-circuit ?) : corrige-le.</span>` : ""}` : ""}
          <div class="rang"><button class="btn${c ? " sec" : ""}" type="button" id="pc-corrige">${c ? "Remplacer par le schéma ouvert" : "Le schéma ouvert est le corrigé"}</button>${c ? `<button class="btn sec" type="button" id="pc-voir-c">Revoir le corrigé</button>` : ""}</div></li>
        <li><b>Le départ</b> : enlève ce que l'élève doit faire (des fils, des symboles…), puis : ${d ? (E && E.okD ? `<span class="ko">Le départ passe déjà l'essai : enlève davantage.</span>` : `<span class="ok">✓ ${nb(d)} (l'essai ne passe pas : il y a bien quelque chose à faire).</span>`) : ""}
          <div class="rang"><button class="btn${c && !d ? "" : " sec"}" type="button" id="pc-depart"${c ? "" : " disabled"}>${d ? "Remplacer par le schéma ouvert" : "Le schéma ouvert est le départ"}</button>${d ? `<button class="btn sec" type="button" id="pc-voir-d">Revoir le départ</button>` : ""}</div></li>
      </ol>
      <label class="ch" for="pc-titre">Titre</label><input type="text" id="pc-titre" maxlength="80" value="${esc(P.titre)}" placeholder="${esc((c && c.titre) || "Schéma à compléter")}">
      <label class="ch" for="pc-consigne">La consigne (l'élève la lit)</label><textarea id="pc-consigne" rows="4" maxlength="1500" placeholder="Par exemple : câble l'auto-maintien de KM1, puis vérifie.">${esc(P.consigne)}</textarea>
      <label class="ch" for="pc-indice">Un indice (facultatif ; −3 points s'il l'ouvre)</label><textarea id="pc-indice" rows="2" maxlength="600">${esc(P.indice)}</textarea>
      <div class="rang"><button class="btn" type="button" id="pc-lien"${pret ? "" : " disabled"}>Copier le lien</button><button class="btn sec" type="button" id="pc-fichier"${pret ? "" : " disabled"}>Fichier pour les élèves</button></div>
      <div class="rang"><button class="btn sec" type="button" id="pc-essayer"${pret ? "" : " disabled"}>Essayer comme un élève</button><button class="btn sec" type="button" id="pc-vider">Tout recommencer</button><button class="btn sec" type="button" id="pc-fermer">Fermer</button></div>
      <div id="pc-sortie"></div>
      <p class="discret">Le lien contient le départ et l'essai, pas ton corrigé. Si tu changes l'un ou l'autre, redonne un nouveau lien.</p></div>`;
  }
  const chargePrepC = () => { const E = essaiPrepC(); return { v: 1, t: (prepC.titre || (prepC.corrige && prepC.corrige.titre) || "Schéma à compléter").slice(0, 80), c: prepC.consigne, i: prepC.indice, s: M.cloner(prepC.depart), e: E.etapes, x: E.exige, k: E.commandes }; };
  async function lienPrepC() { return location.origin + location.pathname + "#complet=" + (await encoderCode(chargePrepC(), true)); }
  function brancherPrepC() {
    $("pc-corrige").onclick = () => {
      if (!schema.pieces.length) { toast("Le schéma ouvert est vide."); return; }
      prepC.corrige = M.cloner(schema); prepC.depart = null;
      if (!prepC.titre) prepC.titre = schema.titre || "";
      if (!prepC.consigne) { const ex = X.EXEMPLES.find((e) => e.titre === schema.titre || e.construire().titre === schema.titre); if (ex) prepC.consigne = ex.resume; }
      garderPrepC(); majPanneau(); bulle("Corrigé gardé. Enlève maintenant ce que l'élève doit faire, puis « Le schéma ouvert est le départ ».", 6000);
    };
    $("pc-depart").onclick = () => { prepC.depart = M.cloner(schema); garderPrepC(); majPanneau(); };
    const vc = $("pc-voir-c"); if (vc) vc.onclick = () => { chargerSchema(M.cloner(prepC.corrige)); sauver(); majPanneau(); bulle("Le corrigé est sur la feuille.", 2500); };
    const vd = $("pc-voir-d"); if (vd) vd.onclick = () => { chargerSchema(M.cloner(prepC.depart)); sauver(); majPanneau(); bulle("Le départ est sur la feuille.", 2500); };
    $("pc-titre").oninput = (e) => { prepC.titre = e.target.value.slice(0, 80); garderPrepC(); };
    $("pc-consigne").oninput = (e) => { prepC.consigne = e.target.value.slice(0, 1500); garderPrepC(); };
    $("pc-indice").oninput = (e) => { prepC.indice = e.target.value.slice(0, 600); garderPrepC(); };
    $("pc-lien").onclick = async () => {
      const l = await lienPrepC();
      let copie = false; try { await navigator.clipboard.writeText(l); copie = true; } catch (e) { copie = false; }
      $("pc-sortie").innerHTML = `<label class="ch" for="pc-l">${copie ? "Lien copié ✓ : colle-le dans Pronote, l'ENT ou un message" : "Copie ce lien"}</label><input type="text" id="pc-l" readonly value="${esc(l)}"><p class="discret">${l.length} caractères.</p>`;
      const i = $("pc-l"); i.onclick = () => i.select(); if (!copie) i.select();
      toast(copie ? "Lien copié." : "Copie le lien affiché.");
    };
    $("pc-fichier").onclick = async () => {
      const code = await encoderCode(chargePrepC(), false), t = chargePrepC().t;
      telecharger(new Blob([JSON.stringify({ type: "complet-prof", v: 1, titre: t, code })], { type: "application/json" }), "a-completer-" + t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 40) + ".json");
      toast("Fichier prêt : les élèves l'ouvrent avec Fichier → Ouvrir un fichier.");
    };
    $("pc-essayer").onclick = () => {
      const w = window.open("about:blank", "_blank");
      lienPrepC().then((l) => { if (w && !w.closed) w.location.href = l; else $("pc-sortie").innerHTML = `<p class="discret">L'onglet a été bloqué : <a href="${esc(l)}" target="_blank">ouvre-le ici</a>.</p>`; });
    };
    const vi = $("pc-vider");
    vi.onclick = () => {
      if (!vi.dataset.sur) { vi.dataset.sur = "1"; vi.textContent = "Sûr ? Tout effacer"; vi.classList.add("ko"); setTimeout(() => { if (vi.isConnected) { delete vi.dataset.sur; vi.textContent = "Tout recommencer"; vi.classList.remove("ko"); } }, 3500); return; }
      prepC = { corrige: null, depart: null, titre: "", consigne: "", indice: "" }; essaiC = null; garderPrepC(); majPanneau();
    };
    $("pc-fermer").onclick = () => { prepC = null; majPanneau(); };
  }

  /* ---------- préparer un dépannage (professeur) ---------- */
  const sansBalises = (h) => String(h || "").replace(/<br\s*\/?>/g, "\n").replace(/<\/p>\s*<p[^>]*>/g, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
  function garderPrep() { if (prep) garder(CLE.prep, Object.assign({ h: hacher(JSON.stringify(schema.pieces) + JSON.stringify(schema.fils)), ts: schema.titre || "" }, prep)); }
  function ouvrirPreparation() {
    prepC = null;
    if (doc.type === "depannage") { toast("Quitte d'abord le dépannage, puis ouvre le schéma où cacher la panne."); return; }
    if (sim) arreterSim();
    if (!schema.pieces.length) { toast("Dessine d'abord un schéma, ou ouvre un exemple."); return; }
    const h = hacher(JSON.stringify(schema.pieces) + JSON.stringify(schema.fils)), sv = lire(CLE.prep);
    const dp = X.DEPANNAGES.find((d) => d.base().titre === schema.titre), ex = X.EXEMPLES.find((e) => e.titre === schema.titre);
    prep = sv && (sv.h === h || (sv.ts && sv.ts === schema.titre)) ? { panne: sv.panne || null, titre: sv.titre || schema.titre, consigne: sv.consigne || "", bareme: lireBareme(sv.bareme) }
      : { panne: null, titre: schema.titre || "Dépannage", consigne: dp ? sansBalises(dp.fonctionnement) : ex ? ex.resume : "", bareme: Object.assign({}, BAREME) };
    fermerDialogues(); sel.clear(); majPanneau(); ouvrirPanneau(true);
    choisirOutil(prep.panne ? "fleche" : "panne"); rendre();
  }
  function nomSorte(x, pc) {   // le nom d'une sorte de panne, pour le professeur
    const t = pc ? pc.type : "";
    if (x === "soude") return "Soudé (reste fermé)";
    if (x === "court") return "En court-circuit";
    if (x === "reglage") return "Réglé trop bas";
    if (x === "phases") return "Phases inversées";
    return t === "fusible" ? "Fondu" : t === "voyant" ? "Grillé" : M.BOBINES.indexOf(t) >= 0 || t === "electrovanne" ? "Coupée" : t === "thermique" ? "Élément coupé" : t === "sectionneur" ? "Fusible fondu" : "Ne conduit plus";
  }
  function choisirPannePrep(c) {
    if (c.fil) prep.panne = { fil: c.fil.id };
    else {
      const L = MO.pannesPossibles({ pieces: [c.piece], fils: [] });
      if (!L.length) { bulle(`On ne peut pas cacher de panne dans ${esc(nomPiece(c.piece))} : choisis un fil, un contact, un fusible, une bobine, un voyant, un moteur…`, 5000); return; }
      prep.panne = L[0];
    }
    garderPrep(); choisirOutil("fleche"); majPanneau(); rendre();
    bulle(`Panne choisie : ${esc(decrirePanne(prep.panne, true))}.`, 4000);
  }
  function cartePrep() {
    if (prep.panne && !MO.pannesPossibles(schema).some((q) => JSON.stringify(q) === JSON.stringify(prep.panne))) prep.panne = null;   // l'élément n'existe plus
    const p = prep.panne, V = p && p.piece ? MO.pannesPossibles({ pieces: [pieceParId(p.piece)], fils: [] }) : [], b = prep.bareme;
    const so = (q) => q.sorte || "", sortes = [...new Set(V.map(so))], poles = V.filter((q) => p && so(q) === so(p) && q.i != null);
    return `<div class="pn-carte pn-defi pn-prep"><div class="eyebrow">Préparer un dépannage · professeur</div><h2>Cache une panne</h2>
      <p>Choisis l'élément en panne, écris ce qui doit se passer, puis donne le <b>lien</b> (ou le fichier) aux élèves. Ils auront tous la même panne ; ceux qui sont connectés au site t'envoient leur note sur 20, que tu retrouves dans ton espace professeur : l'espace de la classe, puis la page « Dépannages ».</p>
      <div class="rang"><button class="btn${p ? " sec" : ""}" type="button" id="pp-choisir" aria-pressed="${outil === "panne"}">${p ? "Changer l'élément en panne" : "Choisir l'élément en panne"}</button></div>
      <p class="pp-panne">${p ? `Panne : <b>${esc(decrirePanne(p, true))}</b>` : `Pas encore de panne : ${DOIGT ? "touche" : "clique sur"} un fil, un contact, une bobine…`}</p>
      ${sortes.length > 1 ? `<div class="rang pp-sortes">${sortes.map((x) => `<button class="btn sec" type="button" data-sorte="${x}" aria-pressed="${x === so(p)}">${esc(nomSorte(x, pieceParId(p.piece)))}</button>`).join("")}</div>` : ""}
      ${poles.length > 1 ? `<div class="rang pp-poles">${poles.map((q) => `<button class="btn sec" type="button" data-pole="${q.i}" aria-pressed="${q.i === p.i}">Pôle ${2 * q.i + 1}-${2 * q.i + 2}</button>`).join("")}</div>` : ""}
      <label class="ch" for="pp-titre">Titre</label><input type="text" id="pp-titre" maxlength="80" value="${esc(prep.titre)}">
      <label class="ch" for="pp-consigne">Ce qui doit se passer (l'élève le lit)</label><textarea id="pp-consigne" rows="5" maxlength="1500" placeholder="Par exemple : S2 met le moteur en marche, S1 l'arrête…">${esc(prep.consigne)}</textarea>
      <p class="ch">Note sur 20</p>
      <div class="pp-bareme"><label>Mesures sans pénalité<input type="number" id="pp-libres" min="0" max="99" step="1" value="${b.libres}"></label><label>Points en moins par mesure de plus<input type="number" id="pp-parmesure" min="0" max="5" step="0.25" value="${b.parMesure}"></label><label>Points en moins par faute de sécurité<input type="number" id="pp-parfaute" min="0" max="20" step="0.5" value="${b.parFaute}"></label><label>Points en moins par mauvaise désignation<input type="number" id="pp-parerreur" min="0" max="20" step="0.5" value="${b.parErreur}"></label></div>
      <div class="rang"><button class="btn" type="button" id="pp-lien"${p ? "" : " disabled"}>Copier le lien</button><button class="btn sec" type="button" id="pp-fichier"${p ? "" : " disabled"}>Fichier pour les élèves</button></div>
      <div class="rang"><button class="btn sec" type="button" id="pp-essayer"${p ? "" : " disabled"}>Essayer comme un élève</button><button class="btn sec" type="button" id="pp-fermer">Fermer</button></div>
      <div id="pp-sortie"></div>
      <p class="discret">Le lien contient le schéma et la panne : si tu changes l'un ou l'autre, redonne un nouveau lien.</p></div>`;
  }
  const chargePrep = () => ({ v: 1, t: prep.titre, c: prep.consigne, s: M.cloner(schema), p: prep.panne, b: prep.bareme });
  async function lienPrep() { return location.origin + location.pathname + "#panne=" + (await encoderCode(chargePrep(), true)); }
  function brancherPrep() {
    $("pp-choisir").onclick = () => choisirOutil(outil === "panne" ? "fleche" : "panne");
    for (const x of pn.querySelectorAll("[data-pole]")) x.onclick = () => { prep.panne = Object.assign({}, prep.panne, { i: +x.dataset.pole }); garderPrep(); majPanneau(); rendre(); };
    $("pp-titre").oninput = (e) => { prep.titre = e.target.value.slice(0, 80); garderPrep(); };
    $("pp-consigne").oninput = (e) => { prep.consigne = e.target.value.slice(0, 1500); garderPrep(); };
    for (const x of pn.querySelectorAll("[data-sorte]")) x.onclick = () => {
      const V = MO.pannesPossibles({ pieces: [pieceParId(prep.panne.piece)], fils: [] }), s2 = x.dataset.sorte;
      prep.panne = V.find((q) => (q.sorte || "") === s2 && (q.i == null || q.i === prep.panne.i)) || V.find((q) => (q.sorte || "") === s2) || prep.panne;
      garderPrep(); majPanneau(); rendre();
    };
    for (const [id, k] of [["pp-libres", "libres"], ["pp-parmesure", "parMesure"], ["pp-parerreur", "parErreur"], ["pp-parfaute", "parFaute"]]) $(id).onchange = (e) => { const b = Object.assign({}, prep.bareme); b[k] = e.target.value; prep.bareme = lireBareme(b); e.target.value = prep.bareme[k]; garderPrep(); };
    $("pp-lien").onclick = async () => {
      const l = await lienPrep();
      let copie = false; try { await navigator.clipboard.writeText(l); copie = true; } catch (e) { copie = false; }
      $("pp-sortie").innerHTML = `<label class="ch" for="pp-l">${copie ? "Lien copié ✓ : colle-le dans Pronote, l'ENT ou un message" : "Copie ce lien"}</label><input type="text" id="pp-l" readonly value="${esc(l)}"><p class="discret">${l.length} caractères.</p>`;
      const i = $("pp-l"); i.onclick = () => i.select(); if (!copie) i.select();
      toast(copie ? "Lien copié." : "Copie le lien affiché.");
    };
    $("pp-fichier").onclick = async () => {
      const code = await encoderCode(chargePrep(), false);
      telecharger(new Blob([JSON.stringify({ type: "depannage-prof", v: 1, titre: prep.titre, code })], { type: "application/json" }), "depannage-" + (prep.titre || "schema").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 40) + ".json");
      toast("Fichier prêt : les élèves l'ouvrent avec Fichier → Ouvrir un fichier.");
    };
    $("pp-essayer").onclick = () => {   // l'onglet s'ouvre tout de suite (sinon Safari le bloque), le lien suit
      const w = window.open("about:blank", "_blank");
      lienPrep().then((l) => { if (w && !w.closed) w.location.href = l; else { $("pp-sortie").innerHTML = `<p class="discret">L'onglet a été bloqué : <a href="${esc(l)}" target="_blank">ouvre le dépannage ici</a>.</p>`; } });
    };
    $("pp-fermer").onclick = () => { prep = null; choisirOutil("fleche"); majPanneau(); rendre(); };
  }
  function brancherSuivi() {
    const r = $("dp-reparer"); if (r) r.onclick = () => { depEtat.repare = true; garderDep(); relancerSim(); };
    const e = $("dp-renvoyer"); if (e) e.onclick = () => envoyerDep();
  }
  function brancherDep() {
    const v = $("dp-volt"); if (!v) return;
    v.onclick = () => choisirOutil(outil === "volt" ? "fleche" : "volt");
    $("dp-ohm").onclick = () => choisirOutil(outil === "ohm" ? "fleche" : "ohm");
    $("dp-consig").onclick = () => { const c = $("sm-consig"); if (c) { c.scrollIntoView({ block: "nearest", behavior: "smooth" }); c.classList.add("flash"); setTimeout(() => c.classList.remove("flash"), 900); } };
    $("dp-designer").onclick = () => choisirOutil(outil === "designer" ? "volt" : "designer");
    $("dp-quitter").onclick = quitterDepannage;
    const ab = $("dp-abandon");
    if (ab) ab.onclick = () => {   // en deux temps
      if (!ab.dataset.sur) { ab.dataset.sur = "1"; ab.textContent = "Sûr ? La note sera 0"; ab.classList.add("ko"); setTimeout(() => { if (ab.isConnected) { delete ab.dataset.sur; ab.textContent = "Abandonner (note 0)"; ab.classList.remove("ko"); } }, 3500); return; }
      depEtat.trouve = true; depEtat.abandon = true; depEtat.fin = Date.now(); garderDep();
      marques = [Object.assign(depEtat.panne.fil ? { fil: depEtat.panne.fil } : { piece: depEtat.panne.piece }, { cls: "panne" })];
      choisirOutil("fleche"); construirePanneauSim(); rendre(); envoyerDep();
    };
    const nv = $("dp-nouvelle");
    if (nv) nv.onclick = () => {   // en deux temps si la panne n'est pas encore trouvée
      if (!depEtat.trouve && !nv.dataset.sur) { nv.dataset.sur = "1"; nv.textContent = "Sûr ? Abandonner celle-ci"; nv.classList.add("ko"); setTimeout(() => { if (nv.isConnected) { delete nv.dataset.sur; nv.textContent = "Nouvelle panne"; nv.classList.remove("ko"); } }, 3500); return; }
      const avant = depEtat.panne;
      ouvrirDepannage(doc.dep, true, avant || true);
      bulle("Une nouvelle panne est cachée. Essaie le schéma, puis mesure.", 4000);
    };
    brancherSuivi();
  }

  /* =====================================================================
     SIMULATION
     ===================================================================== */
  function basculerSim() { if (sim) { if (doc.type === "depannage") quitterDepannage(); else if (doc.type === "lecture") quitterLecture(); else arreterSim(); } else demarrerSim(); }
  const avecPanne = () => doc.type === "depannage" && depEtat && depEtat.panne && !depEtat.repare;
  function masquer(E) { if (doc.type === "depannage") { E.noeuds = E.noeuds.map(() => null); E.court = []; } return E; }   // en dépannage, on mesure (pas de tension ni de chemin du court-circuit sur les fils)
  function demarrerSim() {
    brouillon = null; if (outil === "placer" || outil === "fil") choisirOutil("fleche");
    sel.clear(); geste = null; survolPiece = null;
    sim = MO.simulation(M.cloner(schema), avecPanne() ? { panne: depEtat.panne } : {}); simE = masquer(sim.etat()); simSig = ""; angles = {}; tPrec = 0;
    sondesO = ohmVide(); consig = { cadenas: false, vat: false, fautes: 0 };
    CH.demarrer(schema, simE);
    document.body.classList.add("simu"); document.body.classList.toggle("depannage", doc.type === "depannage");
    const b = $("sc-simuler"); b.querySelector("span").textContent = doc.type === "depannage" || doc.type === "lecture" ? "Quitter" : "Arrêter"; b.querySelector("svg").innerHTML = '<rect x="6" y="6" width="12" height="12" rx="1.5"/>';
    fermerPalette();
    majBoutons(); construirePanneauSim(); dessiner();
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(boucle);
    const api = schema.pieces.find((pc) => pc.type === "automate" && pc.ref);
    majVoltmetre();
    if (doc.type === "lecture") bulle("Lis la question à droite, puis clique sur l'appareil sur le schéma.", 4500);
    else if (doc.type === "depannage") bulle(depEtat && depEtat.repare ? "Réparé : essaie le schéma, il marche de nouveau." : "Essaie le schéma : qu'est-ce qui ne marche pas ? Puis prends le <b>Voltmètre</b> pour trouver la panne.", 5500);
    else if (!schema.pieces.some((pc) => actionnable(pc))) bulle("Rien à actionner dans ce schéma : ajoute des boutons ou des interrupteurs.", 4000);
    else if (api) bulle(`Clique sur les boutons du schéma. Clique sur <b>${esc(api.ref)}</b> pour voir son programme en direct.`, 5000);
    else bulle("Clique sur les boutons du schéma (ou dans la liste « Commandes »). Double-clic : le bouton reste appuyé.", 4500);
    directMarquer();
  }
  function arreterSim() {
    sim = null; simE = null; cancelAnimationFrame(rafId); appuis.clear(); survolPiece = null; PR.live.fermer(); CH.arreter();
    sondes = { a: null, b: null, prochaine: "a" }; sondesO = ohmVide(); consig = { cadenas: false, vat: false, fautes: 0 }; survolBorne = null; pince = null; pinceC = null; majPince(); majOhmmetre();
    if (outil === "volt" || outil === "designer" || outil === "pince" || outil === "ohm") { outil = "fleche"; document.querySelectorAll("#sc-barre [data-o]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.o === "fleche"))); }
    document.body.classList.remove("simu", "depannage"); majVoltmetre();
    const b = $("sc-simuler"); b.querySelector("span").textContent = "Simuler"; b.querySelector("svg").innerHTML = '<path d="M7 4.5v15l12-7.5z"/>';
    bulle(""); majBoutons(); dessiner(); majPanneau(); directMarquer();
  }
  function signature(E) {
    const P = {};
    for (const [id, o] of Object.entries(E.pieces)) { const c = Object.assign({}, o); if (c.w != null) c.w = Math.round(c.w * 8) / 8; if (c.prog != null) c.prog = Math.round(c.prog * 40) / 40; if (c.chauffe != null) c.chauffe = Math.round(c.chauffe * 4) / 4; if (c.f != null) c.f = Math.round(c.f); if (c.po) { c.mv = Math.abs(c.vit || 0) * 1000 > 0.02 ? Math.sign(c.vit) : 0; delete c.pos; delete c.niv; delete c.vit; delete c.r; delete c.voitures; } P[id] = c; }
    return JSON.stringify([E.noeuds, E.court, P, E.messages.map((m) => m.texte), E.journal.length, E.defaut]);
  }
  function boucle(ts) {
    rafId = requestAnimationFrame(boucle);
    if (!sim) return;
    const dt = tPrec ? Math.min(250, ts - tPrec) : 16; tPrec = ts;
    const bouge = sim.enMarche() || sim.prochainEvenement() < Infinity || Object.values(simE.pieces).some((o) => o.w);
    if (!bouge && simSig) { $("sc-horloge").textContent = "t = " + nf(sim.temps() / 1000) + " s"; sim.avancer(dt); CH.tic(sim.temps()); return; }
    sim.avancer(dt);
    simE = masquer(sim.etat());
    if (pince) { const r = lirePince(); simE.pinceI = r ? r.I : null; }
    CH.echantillon(simE);
    for (const pc of schema.pieces) if (pc.type === "moteur" || pc.type === "moteur6") { const o = simE.pieces[pc.id]; if (o) angles[pc.id] = (angles[pc.id] || 0) + (o.w || 0) * dt * 0.32; }
    majSim(false);
  }
  function majSim(force) {
    if (!sim) return;
    if (force) { simE = masquer(sim.etat()); if (pince) { const r = lirePince(true); simE.pinceI = r ? r.I : null; } CH.echantillon(simE); }
    $("sc-horloge").textContent = "t = " + nf(sim.temps() / 1000) + " s";
    majVoltmetre(); majPince(force);
    const sig = signature(simE);
    if (force || sig !== simSig) majOhmmetre();
    if (sig !== simSig) { simSig = sig; dessiner(); majPanneauSim(); PR.live.maj(simE); } else { majRotors(); majSystemes(); }
  }
  function actionSim(pc, e) {
    const ref = pc.ref, A = simE.appareils[ref]; if (!A) return;
    const t = pc.type;
    if (t === "automate") { if (PR.live.ref() === ref) PR.live.fermer(); else PR.live.ouvrir(pc, simE); geste = { type: "rien" }; return; }
    if (A.piloteRef && /^(fdc_no|fdc_nf|capteur|capteur3)$/.test(t)) {
      const so = (simE.appareils[A.piloteRef] || {}).sorte;
      bulle(so === "cuve" ? `${esc(ref)} est un capteur de niveau de la cuve ${esc(A.piloteRef)} : c'est l'eau qui le fait basculer, pas toi.`
        : so === "tapis" ? `${esc(ref)} voit passer les caisses du tapis ${esc(A.piloteRef)} : ce sont elles qui l'actionnent, pas toi.`
        : so === "station" ? `${esc(ref)} est une électrode de niveau de la station ${esc(A.piloteRef)} : c'est l'eau qui la touche (ou non), pas toi.`
        : so === "barriere" ? (schema.pieces.some((q) => q.type === "barriere" && q.ref === A.piloteRef && (M.parametres(q).amont === ref || M.parametres(q).aval === ref))
          ? `${esc(ref)} est une boucle de détection de la barrière ${esc(A.piloteRef)} : ce sont les voitures qui l'actionnent. Envoie une voiture (carte de la barrière, à droite).`
          : `${esc(ref)} est un fin de course de la barrière ${esc(A.piloteRef)} : c'est la lisse qui l'actionne, pas toi.`)
        : so === "montecharge" ? (schema.pieces.some((q) => q.type === "montecharge" && q.ref === A.piloteRef && M.parametres(q).porte === ref)
          ? `${esc(ref)} est le contact de porte du monte-charge ${esc(A.piloteRef)} : ouvre ou ferme la porte avec la carte du monte-charge, à droite.`
          : `${esc(ref)} est un capteur du monte-charge ${esc(A.piloteRef)} : c'est la cabine qui l'actionne, pas toi.`)
        : so === "tri" ? (schema.pieces.some((q) => q.type === "tri" && q.ref === A.piloteRef && (M.parametres(q).rentre === ref || M.parametres(q).sorti === ref))
          ? `${esc(ref)} est actionné par la tige du vérin du tapis ${esc(A.piloteRef)} : c'est elle qui le pousse, pas toi.`
          : `${esc(ref)} voit tomber les caisses au bout du tapis ${esc(A.piloteRef)} : ce sont elles qui l'actionnent, pas toi.`)
        : `${esc(ref)} est actionné par le chariot ${esc(A.piloteRef)} : c'est lui qui le pousse en roulant, pas toi.`, 3500);
      geste = { type: "rien" }; return;
    }
    if (t === "variateur" || t === "potentiometre" || PO.test(t)) { ouvrirPanneau(true); const c = pn.querySelector(`#sm-elec [data-ref="${CSS.escape(ref)}"]`); if (c) { c.scrollIntoView({ block: "nearest", behavior: "smooth" }); c.classList.add("flash"); setTimeout(() => c.classList.remove("flash"), 900); } geste = { type: "rien" }; return; }
    if (t === "bp_no" || t === "bp_nf") {
      if (e.button === 2) { sim.action(ref, "maintenir"); majSim(true); return; }
      if (A.maintenu) { sim.action(ref, "maintenir", false); majSim(true); return; }
      const now = performance.now();
      if (dernierTap.ref === ref && now - dernierTap.t < 380) { dernierTap = {}; sim.action(ref, "maintenir", true); majSim(true); return; }
      dernierTap = { ref, t: now };
      appuis.set(e.pointerId, ref); sim.appuyer(ref); majSim(true); return;
    }
    if (/^(arret_urgence|selecteur|interrupteur|fdc_no|fdc_nf|capteur|capteur3)$/.test(t)) sim.basculer(ref);
    else if (t === "thermique" || t === "contact_th_nf" || t === "contact_th_no") sim.action(ref, A.declenche ? "rearmer" : "surcharge");
    else if (t === "sectionneur") sim.action(ref, A.fondus && A.fondus.some(Boolean) ? "rearmer" : "basculer");
    else if (t === "disjoncteur" || t === "disj_moteur" || t === "differentiel") sim.action(ref, A.declenche ? "rearmer" : "basculer");
    else if (t === "fusible") { if (A.fondu) sim.rearmer(ref); else bulle("Un fusible ne s'ouvre pas à la main : il fond quand il y a un court-circuit.", 3000); }
    geste = { type: "rien" };
    majSim(true);
  }

  /* ---------- panneau de simulation : les commandes ---------- */
  const DESCR_CMD = { differentiel: "interrupteur différentiel", bp_no: "bouton à fermeture", bp_nf: "bouton à ouverture", arret_urgence: "arrêt d'urgence", selecteur: "sélecteur", interrupteur: "interrupteur", capteur3: "capteur 3 fils", fdc_no: "fin de course", fdc_nf: "fin de course", capteur: "capteur", thermique: "relais thermique", sectionneur: "sectionneur", disjoncteur: "disjoncteur", disj_moteur: "disjoncteur-moteur", fusible: "fusible" };
  function commandesSim() {
    const L = [], vus = new Set();
    for (const pc of schema.pieces) {
      if (!actionnable(pc) || vus.has(pc.ref) || ELEC.test(pc.type) || PO.test(pc.type)) continue;
      const A = simE.appareils[pc.ref]; if (!A || A.piloteRef) continue;
      if (/^contact_th/.test(pc.type) && schema.pieces.some((q) => q.ref === pc.ref && (q.type === "thermique" || q.type === "disj_moteur"))) continue;
      vus.add(pc.ref); L.push({ pc, ref: pc.ref, sorte: A.sorte });
    }
    return L.sort((a, b) => a.ref.localeCompare(b.ref, "fr", { numeric: true }));
  }
  function construirePanneauSim() {
    let h = poignee();
    if (doc.type === "lecture") { pn.innerHTML = h + `<div id="lc-carte">${carteLecture()}</div>`; brancherPoignee(); brancherLecture(); return; }
    if (doc.type === "defi") h += carteDefi();
    if (doc.type === "depannage") h += carteDepannage();
    h += `<h2>Simulation</h2><p class="discret">${doc.type === "depannage" ? "Les fils ne montrent pas la tension : mesure-la avec le voltmètre. Les bobines collées sont en jaune." : "Les fils sous tension sont en couleur, les bobines alimentées en jaune."} Clique sur les organes de commande du schéma, ou ici :</p>
      <div class="rang"><button class="btn sec" type="button" id="sm-raz">Tout remettre à zéro</button><button class="btn" type="button" id="sm-courant" hidden>Remettre le courant</button></div>
      <h3>Commandes</h3><div class="cmd-l" id="sm-cmd">${commandesSim().map((c) => `<div class="cmd" data-ref="${esc(c.ref)}"><div><b>${esc(c.ref)}</b><small>${esc(DESCR_CMD[c.pc.type] || "")}</small><span class="etat"></span></div><div class="bt">${boutonsCmd(c)}</div></div>`).join("") || `<p class="discret">Aucun bouton, interrupteur ni protection à actionner.</p>`}</div>
      ${cartesSim()}
      <h3>Consignation</h3><div class="consig" id="sm-consig"></div>
      ${carteIso()}
      <h3>Ce qui se passe</h3><ul class="msgs" id="sm-msgs"></ul>
      <h3>Journal</h3><ul class="msgs" id="sm-journal"></ul>`;
    pn.innerHTML = h;
    brancherPoignee(); brancherDefi(); brancherDep(); brancherCartes();
    $("sm-raz").onclick = () => { sim.reinitialiser(); angles = {}; pinceC = null; consig.cadenas = false; consig.vat = false; sondesO = ohmVide(); majSim(true); majConsig(); rendre(); };
    $("sm-consig").onclick = (e) => { const b = e.target.closest("button[data-k]"); if (b && !b.disabled) actionConsig(b.dataset.k, b.dataset.ref); };
    { const z = $("sm-iso"); if (z) z.onclick = (e) => { const b = e.target.closest("button[data-iso]"); if (!b || !sim) return; sim.action(b.dataset.iso, "isolement", b.dataset.b); majSim(true); }; }
    $("sm-courant").onclick = () => { sim.rearmerAlimentation(); majSim(true); };
    for (const b of pn.querySelectorAll("#sm-cmd button[data-c]")) {
      const ref = b.closest(".cmd").dataset.ref, c = b.dataset.c;
      if (c === "appui") {
        b.addEventListener("pointerdown", (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } const A = simE.appareils[ref]; if (A && A.maintenu) { sim.action(ref, "maintenir", false); } else { sim.appuyer(ref); b.dataset.tenu = "1"; } majSim(true); });
        const lache = () => { if (b.dataset.tenu) { delete b.dataset.tenu; if (sim) { sim.relacher(ref); majSim(true); } } };
        b.addEventListener("pointerup", lache); b.addEventListener("pointercancel", lache);
        b.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); sim.appuyer(ref); majSim(true); } });
        b.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") { sim.relacher(ref); majSim(true); } });
      } else b.addEventListener("click", () => {
        const A = simE.appareils[ref];
        if (c === "maintenir") sim.action(ref, "maintenir");
        else if (c === "basculer") sim.basculer(ref);
        else if (c === "surcharge") sim.surcharge(ref);
        else if (c === "rearmer") sim.rearmer(ref);
        else if (c === "ouvrir") sim.action(ref, A && A.ferme ? "ouvrir" : "fermer");
        else if (c === "tester") sim.action(ref, "tester");
        majSim(true);
      });
    }
    majPanneauSim();
  }
  function boutonsCmd(c) {
    switch (c.sorte) {
      case "bouton": return `<button type="button" data-c="appui" title="Appuie et garde le doigt dessus">Appuyer</button><button type="button" data-c="maintenir" title="Le bouton reste appuyé">📌</button>`;
      case "au": return `<button type="button" data-c="basculer" class="rouge">Coup de poing</button>`;
      case "selecteur": case "interrupteur": case "fdc": case "capteur": return `<button type="button" data-c="basculer">${c.sorte === "selecteur" ? "Tourner" : c.sorte === "interrupteur" ? "Basculer" : c.sorte === "capteur" ? "Détecter" : "Actionner"}</button>`;
      case "thermique": return `<button type="button" data-c="surcharge" class="rouge">Surcharge</button><button type="button" data-c="rearmer">Réarmer</button>`;
      case "disj_moteur": return `<button type="button" data-c="ouvrir">Ouvrir</button><button type="button" data-c="surcharge" class="rouge">Surcharge</button><button type="button" data-c="rearmer">Réarmer</button>`;
      case "sectionneur": return `<button type="button" data-c="ouvrir">Ouvrir</button><button type="button" data-c="rearmer" title="Remplacer les fusibles fondus">Fusibles neufs</button>`;
      case "disjoncteur": return `<button type="button" data-c="ouvrir">Ouvrir</button><button type="button" data-c="rearmer">Réarmer</button>`;
      case "differentiel": return `<button type="button" data-c="ouvrir">Ouvrir</button><button type="button" data-c="tester" title="Le bouton test fait passer une petite fuite : sous tension, il doit déclencher">Test</button><button type="button" data-c="rearmer">Réarmer</button>`;
      case "fusible": return `<button type="button" data-c="rearmer">Remplacer</button>`;
    }
    return "";
  }
  function majPanneauSim() {
    if (!sim || !$("sm-cmd")) return;
    for (const row of pn.querySelectorAll("#sm-cmd .cmd")) {
      const A = simE.appareils[row.dataset.ref]; if (!A) continue;
      const et = row.querySelector(".etat");
      let txt = "", ok = true;
      const on = (c, v) => { const b = row.querySelector(`[data-c="${c}"]`); if (b) b.classList.toggle("on", !!v); return b; };
      switch (A.sorte) {
        case "bouton": on("appui", A.appuye || A.maintenu); on("maintenir", A.maintenu); txt = A.maintenu ? "maintenu appuyé" : A.appuye ? "appuyé" : "relâché"; break;
        case "au": on("basculer", A.actionne); txt = A.actionne ? "enfoncé : clique pour déverrouiller" : "relâché"; ok = !A.actionne; break;
        case "selecteur": case "interrupteur": case "fdc": case "capteur": on("basculer", A.actionne); txt = A.actionne ? (A.sorte === "selecteur" ? "position 1" : A.sorte === "capteur" ? "objet détecté" : A.sorte === "interrupteur" ? "fermé" : "actionné") : (A.sorte === "selecteur" ? "position 0" : A.sorte === "interrupteur" ? "ouvert" : "au repos"); break;
        case "thermique": { const r = row.querySelector('[data-c="rearmer"]'); if (r) r.disabled = !A.declenche; const s = row.querySelector('[data-c="surcharge"]'); if (s) s.disabled = !!A.declenche; txt = A.declenche ? "déclenché" : "normal"; ok = !A.declenche; break; }
        case "sectionneur": { const b = row.querySelector('[data-c="ouvrir"]'); if (b) b.textContent = A.ferme ? "Ouvrir" : "Fermer"; const r = row.querySelector('[data-c="rearmer"]'); if (r) r.disabled = !(A.fondus || []).some(Boolean); const nf2 = (A.fondus || []).filter(Boolean).length; txt = (A.ferme ? "fermé" : "ouvert") + (nf2 ? ` · ${nf2} fusible${nf2 > 1 ? "s" : ""} fondu${nf2 > 1 ? "s" : ""}` : ""); ok = A.ferme && !nf2; break; }
        case "disjoncteur": case "disj_moteur": { const b = row.querySelector('[data-c="ouvrir"]'); if (b) { b.textContent = A.ferme ? "Ouvrir" : "Fermer"; b.disabled = !!A.declenche; } const r = row.querySelector('[data-c="rearmer"]'); if (r) r.disabled = !A.declenche; const s = row.querySelector('[data-c="surcharge"]'); if (s) s.disabled = !A.ferme; txt = A.declenche ? "déclenché" : A.ferme ? "fermé" : "ouvert"; ok = A.ferme; break; }
        case "fusible": { const r = row.querySelector('[data-c="rearmer"]'); if (r) r.disabled = !A.fondu; txt = A.fondu ? "fondu" : "bon"; ok = !A.fondu; break; }
        case "differentiel": { const b = row.querySelector('[data-c="ouvrir"]'); if (b) { b.textContent = A.ferme ? "Ouvrir" : "Fermer"; b.disabled = !!A.declenche; } const r = row.querySelector('[data-c="rearmer"]'); if (r) r.disabled = !A.declenche; const t2 = row.querySelector('[data-c="tester"]'); if (t2) t2.disabled = !A.ferme; txt = A.declenche ? "déclenché" : A.ferme ? "fermé" : "ouvert"; ok = !A.declenche; break; }
      }
      et.textContent = txt; et.className = "etat " + (ok ? "ok" : "ko");
    }
    majCartes(); majConsig(); majIso();
    const ms = simE.messages;
    $("sm-msgs").innerHTML = ms.length ? ms.map((m) => `<li class="${m.niveau}">${esc(m.texte)}</li>`).join("") : `<li class="info">Tout va bien. ${moteursTxt()}</li>`;
    const J = simE.journal.slice(-8).reverse();
    $("sm-journal").innerHTML = J.length ? J.map((j) => `<li class="${j.niveau}"><small>t = ${nf(j.t / 1000)} s</small>${esc(j.texte)}</li>`).join("") : `<li class="info">Rien pour l'instant.</li>`;
    $("sm-courant").hidden = !simE.defaut;
    const nb = ms.filter((m) => m.niveau !== "info").length;
    const pg = $("pn-poignee"); if (pg) pg.querySelector("span").textContent = "Simulation" + (nb ? ` · ${nb} message${nb > 1 ? "s" : ""}` : "");
  }
  function moteursTxt() {
    const L = [];
    for (const [ref, A] of Object.entries(simE.appareils)) if (A.sorte === "moteur" && (A.etatM === "marche" || A.etatM === "surtension")) {
      const V = A.variateur && simE.appareils[A.variateur];
      L.push(`${ref} tourne dans le sens ${A.sens === 1 ? 1 : 2}${A.couplage ? " (" + (A.couplage === "etoile" ? "étoile" : "triangle") + ")" : ""}${V ? ` à ${nf(Math.abs(V.fs || 0))} Hz (variateur ${A.variateur})` : ""}.`);
    }
    return L.join(" ");
  }

  /* ---------- panneau de simulation : automates, variateurs, potentiomètres ---------- */
  function leds(pc, k) {
    const P = SA.validerProg(pc.prog);
    let h = "";
    for (let i = 0; i < 8; i++) { const a = (k === "e" ? "%I0." : "%Q0.") + i, n = P.noms[a]; h += `<i class="ledh" data-k="${i}" title="${a}${n ? " · " + esc(n) : ""}">${i}${n ? `<small>${esc(n.slice(0, 6))}</small>` : ""}</i>`; }
    return h;
  }
  function cartesSim() {
    const ordre = { automate: 0, variateur: 1, potentiometre: 2 };
    const L = schema.pieces.filter((pc) => ELEC.test(pc.type) && pc.ref).sort((a, b) => ordre[a.type] - ordre[b.type] || a.ref.localeCompare(b.ref, "fr", { numeric: true }));
    if (!L.length) return cartesPO();
    let h = `<h3>Automates et variateurs</h3><div class="cmd-l" id="sm-elec">`;
    const vus = new Set();
    for (const pc of L) {
      if (vus.has(pc.ref)) continue; vus.add(pc.ref);
      const r = esc(pc.ref);
      if (pc.type === "automate") h += `<div class="cmd crt" data-ref="${r}" data-type="automate"><div><b>${r}</b><small>automate · ${SA.validerProg(pc.prog).lang === "grafcet" ? "GRAFCET" : "Ladder"}</small><span class="etat"></span></div><div class="bt"><button type="button" data-e="run">STOP</button><button type="button" data-e="voir">Programme</button></div><div class="io"><div class="io-l"><span>Entrées</span>${leds(pc, "e")}</div><div class="io-l s"><span>Sorties</span>${leds(pc, "s")}</div><p class="io-x"></p></div></div>`;
      else if (pc.type === "variateur") h += `<div class="cmd crt" data-ref="${r}" data-type="variateur"><div><b>${r}</b><small>variateur</small><span class="etat"></span></div><div class="bt"><span class="ecran-v">rdY</span></div><p class="io-x"></p>${M.parametres(pc).ref === "molette" ? `<label class="curseur">Molette du variateur <input type="range" min="0" max="100" step="1" data-e="molette"><output></output></label>` : ""}</div>`;
      else h += `<div class="cmd crt" data-ref="${r}" data-type="potentiometre"><div><b>${r}</b><small>potentiomètre</small><span class="etat"></span></div><label class="curseur">Position du curseur <input type="range" min="0" max="100" step="1" data-e="pos"><output></output></label></div>`;
    }
    return h + `</div>` + cartesPO();
  }
  /* parties opératives : où est le chariot, combien d'eau dans la cuve ; la consommation d'eau se règle ici */
  function cartesPO() {
    const L = schema.pieces.filter((pc) => PO.test(pc.type) && pc.ref);
    if (!L.length) return "";
    let h = `<h3>Parties opératives</h3><div class="cmd-l" id="sm-po">`;
    const vus = new Set();
    for (const pc of L) {
      if (vus.has(pc.ref)) continue; vus.add(pc.ref);
      const r = esc(pc.ref), P = M.parametres(pc), ch = pc.type === "chariot", ta = pc.type === "tapis" || pc.type === "tri";
      const ba = pc.type === "barriere", mc = pc.type === "montecharge", st = pc.type === "station", eau = pc.type === "cuve" || st;
      const sous = st ? "station · pompes " + ([P.pompe1, P.pompe2, P.pompe3].filter(Boolean).join(", ") || "?")
        : (ch ? "chariot · moteur " : pc.type === "tri" ? "tri · moteur " : ta ? "tapis · moteur " : ba ? "barrière · moteur " : mc ? "monte-charge · moteur " : "cuve · pompe ") + (P.moteur || "?") + (pc.type === "tri" ? " · vérin " + (P.verin || "?") : "");
      h += `<div class="cmd crt" data-ref="${r}" data-type="${pc.type}"><div><b>${r}</b><small>${esc(sous)}</small><span class="etat"></span></div>`
        + (pc.type === "tri" ? `<div class="bt"><button type="button" data-e="coincer" title="Simuler une panne : la tige du vérin reste où elle est">Bloquer la tige</button></div>` : "")
        + (ba ? `<div class="bt"><button type="button" data-e="voiture" title="Une voiture arrive sur la voie, devant la barrière">Une voiture arrive</button></div>` : "")
        + (mc ? `<div class="bt"><button type="button" data-e="porte" title="Ouvrir ou fermer la porte de la cabine">Ouvrir la porte</button></div>` : "")
        + (ta ? "" : `<div class="po-jauge${ch || mc ? " ch" : ""}"><i></i></div>`) + `<p class="io-x"></p>`
        + (eau ? `<label class="curseur">Eau consommée (sortie) <input type="range" min="0" max="100" step="5" data-e="conso"><output></output></label>` : "") + `</div>`;
    }
    return h + `</div>`;
  }
  function majCartesPO() {
    const z = $("sm-po"); if (!z || !simE) return;
    for (const row of z.querySelectorAll(".cmd")) {
      const A = simE.appareils[row.dataset.ref]; if (!A) continue;
      const et = row.querySelector(".etat"), j = row.querySelector(".po-jauge i"), x = row.querySelector(".io-x");
      const capt = (r, on, nom) => (r ? `${r} (${nom}) : ${on ? (A.sorte === "cuve" ? "dans l'eau" : "actionné") : (A.sorte === "cuve" ? "hors de l'eau" : "repos")}` : "");
      if (A.sorte === "tri") {
        const pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "tri"), P = M.parametres(pc), e = simE.pieces[pc.id] || {};
        const roule = Math.abs(A.vit || 0) * 1000 > 0.02, r = A.r || 0;
        et.textContent = (roule ? "le tapis avance" : "arrêté") + (A.coince ? " · tige bloquée !" : "") + (A.cote ? ` · ${A.cote} à côté !` : ""); et.className = "etat " + (A.cote || A.coince ? "ko" : "ok");
        const bc = row.querySelector('[data-e="coincer"]'); if (bc) { bc.textContent = A.coince ? "Débloquer la tige" : "Bloquer la tige"; bc.classList.toggle("rouge", !A.coince); }
        x.textContent = [`volet ${r <= 0.02 ? "vers le bac 1" : r >= 0.98 ? "vers le bac 2" : A.coince ? "coincé entre les deux" : "en mouvement"}`, `bac 1 : ${A.bac1 || 0}`, `bac 2 : ${A.bac2 || 0}`,
          P.capteur ? `${P.capteur} : ${e.cc ? "une caisse devant" : "rien devant"}` : "", capt(P.rentre, e.cr, "vérin rentré"), capt(P.sorti, e.cs, "vérin sorti"), e.reste >= 0 ? `${e.reste} dans le magasin` : ""].filter(Boolean).join(" · ");
        continue;
      }
      if (A.sorte === "tapis") {
        const pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "tapis"), P = M.parametres(pc), e = simE.pieces[pc.id] || {};
        const roule = Math.abs(A.vit || 0) * 1000 > 0.02, n = A.vues || 0;
        et.textContent = roule ? "le tapis avance" : "arrêté"; et.className = "etat ok";
        x.textContent = [P.capteur ? `${P.capteur} : ${e.cc ? "une caisse devant" : "rien devant"}` : "", `${n} caisse${n > 1 ? "s" : ""} passée${n > 1 ? "s" : ""} devant le capteur`, `${A.bac || 0} dans le bac`, e.reste >= 0 ? `${e.reste} dans le magasin` : ""].filter(Boolean).join(" · ");
        continue;
      }
      if (A.sorte === "barriere") {
        const pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "barriere"), P = M.parametres(pc), e = simE.pieces[pc.id] || {}, p = A.pos || 0, n = A.passees || 0, nv = A.voitures || 0;
        et.textContent = A.surVoiture ? "la lisse touche une voiture !" : A.butee ? `en butée ${A.butee > 0 ? "en haut" : "en bas"} !` : p >= 0.95 ? "levée" : p <= 0.05 ? "baissée" : `lisse à ${Math.round(p * 100)} %`;
        et.className = "etat " + (A.surVoiture || A.butee ? "ko" : "ok");
        if (j) j.style.width = (p * 100).toFixed(1) + "%";
        const bv = row.querySelector('[data-e="voiture"]'); if (bv) bv.disabled = nv >= 5;
        x.textContent = [capt(P.haut, e.ch, "levée"), capt(P.bas, e.cb, "baissée"), P.amont ? `${P.amont} (boucle amont) : ${e.ca ? "une voiture" : "libre"}` : "", P.aval ? `${P.aval} (boucle aval) : ${e.cv ? "une voiture" : "libre"}` : "",
          `${n} voiture${n > 1 ? "s" : ""} passée${n > 1 ? "s" : ""}`, nv ? `${nv} sur la voie` : "", A.chocs ? `choc${A.chocs > 1 ? "s" : ""} : ${A.chocs}` : ""].filter(Boolean).join(" · ");
        continue;
      }
      if (A.sorte === "montecharge") {
        const pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "montecharge"), P = M.parametres(pc), e = simE.pieces[pc.id] || {}, p = A.pos || 0;
        const mot = simE.appareils[P.moteur], va = mot && mot.variateur ? simE.appareils[mot.variateur] : null;
        et.textContent = A.danger ? "bouge porte ouverte !" : A.butee ? `en butée ${A.butee > 0 ? "en haut" : "en bas"} !` : p >= 0.95 ? "en haut (niveau 1)" : p <= 0.05 ? "en bas (niveau 0)" : `entre les deux (${Math.round(p * 100)} %)`;
        et.className = "etat " + (A.danger || A.butee ? "ko" : "ok");
        if (j) j.style.left = (p * 100).toFixed(1) + "%";
        const bp = row.querySelector('[data-e="porte"]'); if (bp) { bp.textContent = A.porte ? "Ouvrir la porte" : "Fermer la porte"; bp.classList.toggle("rouge", !A.porte); }
        x.textContent = [A.porte ? "porte fermée" : "porte ouverte", capt(P.porte, e.cp, "porte fermée"), capt(P.bas, e.cb, "en bas"), capt(P.ralbas, e.crb, "ralentir en bas"), capt(P.ralhaut, e.crh, "ralentir en haut"), capt(P.haut, e.ch, "en haut"),
          va && Math.abs(va.fs || 0) > 0.05 ? `${nf(Math.round(Math.abs(va.fs) * 10) / 10)} Hz` : "", A.brusques ? `arrivées trop vite : ${A.brusques}` : ""].filter(Boolean).join(" · ");
        continue;
      }
      if (A.sorte === "station") {
        const pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "station"), P = M.parametres(pc), e = simE.pieces[pc.id] || {}, n = A.niv || 0, cn = e.cn || [];
        et.textContent = `niveau ${Math.round(n * 100)} %` + (A.deborde ? " · déborde !" : A.vide ? " · vide" : "");
        et.className = "etat " + (A.deborde || A.vide ? "ko" : "ok");
        if (j) j.style.width = (n * 100).toFixed(1) + "%";
        const en = (A.pompes || []).map((v, k) => (v ? "P" + (k + 1) : "")).filter(Boolean);
        const el = (r, k, nom) => (r ? `${r} (${nom}) : ${cn[k] ? "dans l'eau" : "hors de l'eau"}` : "");
        x.textContent = [en.length ? (en.length > 1 ? en.join(" + ") + " pompent" : en[0] + " pompe") : "aucune pompe ne pompe", el(P.tbas, 0, "très bas"), el(P.bas, 1, "bas"), el(P.haut, 2, "haut"), el(P.thaut, 3, "très haut")].filter(Boolean).join(" · ");
        const i = row.querySelector('input[data-e="conso"]'); if (i && document.activeElement !== i) { i.value = Math.round((A.conso || 0) * 100); i.parentElement.querySelector("output").textContent = i.value + " %"; }
        continue;
      }
      if (A.sorte === "chariot") {
        const p = A.pos || 0, P = M.parametres(schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "chariot") || { type: "chariot", p: {} });
        et.textContent = A.butee ? `en butée ${A.butee < 0 ? "à gauche" : "à droite"} !` : p <= 0.05 ? "à gauche" : p >= 0.95 ? "à droite" : `en route (${Math.round(p * 100)} %)`;
        et.className = "etat " + (A.butee ? "ko" : "ok");
        if (j) j.style.left = (p * 100).toFixed(1) + "%";
        const e = simE.pieces[schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "chariot").id] || {};
        x.textContent = [capt(P.gauche, e.cg, "gauche"), capt(P.droite, e.cd, "droite")].filter(Boolean).join(" · ");
      } else {
        const n = A.niv || 0, pc = schema.pieces.find((q) => q.ref === row.dataset.ref && q.type === "cuve"), P = M.parametres(pc), e = simE.pieces[pc.id] || {};
        et.textContent = `niveau ${Math.round(n * 100)} %` + (A.deborde ? " · déborde !" : A.vide ? " · vide" : "");
        et.className = "etat " + (A.deborde || A.vide ? "ko" : "ok");
        if (j) j.style.width = (n * 100).toFixed(1) + "%";
        x.textContent = [e.pompe ? "la pompe remplit" : "pompe à l'arrêt", capt(P.bas, e.cb, "niveau bas"), capt(P.haut, e.ch, "niveau haut")].filter(Boolean).join(" · ");
        const i = row.querySelector('input[data-e="conso"]'); if (i && document.activeElement !== i) { i.value = Math.round((A.conso || 0) * 100); i.parentElement.querySelector("output").textContent = i.value + " %"; }
      }
    }
  }
  function brancherCartes() {
    for (const z of [$("sm-elec"), $("sm-po")]) if (z) brancherZone(z);
  }
  function brancherZone(z) {
    z.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-e]"); if (!b || !sim) return;
      const ref = b.closest(".cmd").dataset.ref;
      if (b.dataset.e === "run") { sim.action(ref, "basculer"); majSim(true); }
      else if (b.dataset.e === "coincer") { const A = simE.appareils[ref]; sim.action(ref, "coincer", !(A && A.coince)); majSim(true); }
      else if (b.dataset.e === "voiture") { if (!sim.action(ref, "voiture")) bulle("Il y a déjà 5 voitures sur la voie.", 2500); majSim(true); }
      else if (b.dataset.e === "porte") { sim.action(ref, "porte"); majSim(true); }
      else if (b.dataset.e === "voir") { const pc = schema.pieces.find((q) => q.ref === ref && q.type === "automate"); if (pc) { if (PR.live.ref() === ref) PR.live.fermer(); else PR.live.ouvrir(pc, simE); } }
    });
    z.addEventListener("input", (e) => {
      const i = e.target; if (!i.matches("input[type=range]") || !sim) return;
      const ref = i.closest(".cmd").dataset.ref;
      sim.action(ref, "regler", Number(i.value) / 100);
      const o = i.parentElement.querySelector("output"); if (o) o.textContent = i.value + " %";
      majSim(true);
    });
  }
  function majCartes() {
    majCartesPO();
    const z = $("sm-elec"); if (!z) return;
    for (const row of z.querySelectorAll(".cmd")) {
      const A = simE.appareils[row.dataset.ref]; if (!A) continue;
      const et = row.querySelector(".etat"), x = row.querySelector(".io-x");
      if (row.dataset.type === "automate") {
        et.textContent = A.grille ? "détruit" : !A.alim ? "pas alimenté" : A.run ? "en marche (RUN)" : "arrêté (STOP)"; et.className = "etat " + (A.actif ? "ok" : "ko");
        const b = row.querySelector('[data-e="run"]'); b.textContent = A.run ? "STOP" : "RUN"; b.title = A.run ? "Passer l'automate en STOP" : "Passer l'automate en RUN";
        const v = row.querySelector('[data-e="voir"]'); v.classList.toggle("on", PR.live.ref() === row.dataset.ref);
        row.querySelectorAll(".io-l:not(.s) .ledh").forEach((l, k) => l.classList.toggle("on", !!(A.alim && A.entrees && A.entrees[k])));
        row.querySelectorAll(".io-l.s .ledh").forEach((l, k) => l.classList.toggle("on", !!(A.actif && A.sorties && A.sorties[k])));
        const api = A.api || {}, T = [];
        if (A.actif && api.lang === "grafcet") T.push(`Étapes actives : ${(api.X || []).map((n) => "X" + n).join(", ") || "aucune"}`);
        if (A.actif && api.TM) api.TM.forEach((tm, k) => { if (tm.p > 0 && (tm.in || tm.q)) T.push(`%TM${k} : ${nf(tm.et / 1000)} / ${nf(tm.p / 1000)} s`); });
        if (A.actif && A.aq > 0) T.push(`AQ0 = ${nf(A.aq)} V`);
        if (A.erreurs) T.push(`${A.erreurs} erreur${A.erreurs > 1 ? "s" : ""} dans le programme`);
        x.textContent = T.join(" · ");
      } else if (row.dataset.type === "variateur") {
        const f = A.fs || 0, af = Math.abs(f);
        const scr = A.grille ? "----" : A.defaut ? A.defaut : !A.alim ? "" : af >= 0.05 ? af.toFixed(1) : "rdY";
        row.querySelector(".ecran-v").textContent = scr || "·";
        et.textContent = A.grille ? "détruit" : A.defaut ? "défaut " + A.defaut : !A.alim ? "pas alimenté" : af >= 0.05 ? `${nf(af)} Hz ${f > 0 ? "avant" : "arrière"}` : "prêt, à l'arrêt";
        et.className = "etat " + (A.alim && !A.defaut && !A.grille ? "ok" : "ko");
        const LI = A.LI || [], ord = A.deux ? "avant et arrière ensemble" : LI[0] ? "avant (LI1)" : LI[1] ? "arrière (LI2)" : "aucun";
        const cons = A.origine === "AI1" ? `AI1 = ${nf(A.ai1 || 0)} V` : A.origine === "molette" ? "molette" : `vitesse présélectionnée ${A.origine}`;
        x.textContent = A.alim ? `Ordre : ${ord} · consigne : ${cons} → ${nf(A.fRef || 0)} Hz` : "";
        const i = row.querySelector('input[data-e="molette"]'); if (i && document.activeElement !== i) { i.value = Math.round((A.molette || 0) * 100); i.parentElement.querySelector("output").textContent = i.value + " %"; }
      } else {
        et.textContent = Math.round((A.pos || 0) * 100) + " %"; et.className = "etat ok";
        const i = row.querySelector('input[data-e="pos"]'); if (i && document.activeElement !== i) { i.value = Math.round((A.pos || 0) * 100); i.parentElement.querySelector("output").textContent = i.value + " %"; }
      }
    }
  }

  /* =====================================================================
     PANNEAU DE DROITE (dessin)
     ===================================================================== */
  const DESCR = {
    reseau: "Le réseau triphasé 400 V : trois phases L1, L2, L3, le neutre N et la terre PE. Son schéma de liaison à la terre (TT, TN-S, IT) décide de ce qui se passe quand une phase touche une carcasse (défaut d'isolement).",
    differentiel: "Il compare le courant qui part par les phases et celui qui revient : s'il en manque (une fuite à la terre, un défaut d'isolement), il coupe. 30 mA : protège les personnes ; 300 mA : les installations. Il ne protège pas contre les courts-circuits. En simulation : Ouvrir, Test, Réarmer.",
    cpi: "Le contrôleur permanent d'isolement surveille un réseau en schéma IT (neutre isolé) : au premier défaut d'isolement, il le signale sans rien couper. Relie L au réseau (le neutre), PE à la terre ; son contact d'alarme est un contact lié, repère CPI1.",
    alim: "Un repère de potentiel : tous les repères qui portent le même nom sont reliés entre eux, sans fil.",
    transfo: "Abaisse la tension pour la commande (par exemple 400 V → 24 V). Son secondaire n'a de tension que si le primaire est alimenté.",
    fusible: "Il fond en cas de court-circuit et ouvre le circuit. On le remplace quand le défaut est réparé.",
    sectionneur: "Il isole l'installation du réseau. Ses fusibles protègent contre les courts-circuits. En simulation, clique dessus pour l'ouvrir ou le fermer.",
    disjoncteur: "Il protège contre les courts-circuits et les surcharges, et se réarme.",
    disj_moteur: "Il protège le moteur : contre les courts-circuits (magnétique) et les surcharges (thermique).",
    thermique: "Il surveille le courant du moteur. En surcharge, il déclenche : son contact 95-96 s'ouvre, son contact 97-98 se ferme.",
    bp_no: "Bouton « marche » : il ferme le circuit tant qu'on appuie.",
    bp_nf: "Bouton « arrêt » : il ouvre le circuit tant qu'on appuie.",
    arret_urgence: "Coup de poing : il reste enfoncé. On le déverrouille à la main (en simulation : un deuxième clic).",
    selecteur: "Il reste dans la position choisie.",
    interrupteur: "Il reste ouvert ou fermé.",
    fdc_no: "Actionné par la partie mobile de la machine. En simulation, clique pour l'actionner.",
    fdc_nf: "Actionné par la partie mobile de la machine. En simulation, clique pour l'actionner.",
    capteur: "Il détecte un objet sans le toucher. En simulation, clique pour simuler une détection.",
    capteur3: "Un détecteur de proximité à 3 fils (symbole EN 60617 : boîte, losange de détection, contact de sortie, bobine si inductif ou condensateur si capacitif). BN (marron) au +24 V, BU (bleu) au 0 V, BK (noir) : sa sortie. PNP : la sortie donne du +24 V quand il détecte (vers une entrée d'automate). NPN : elle donne du 0 V.",
    chariot: "La partie opérative : un chariot sur un rail, entraîné par le moteur choisi. En simulation, il roule et actionne tout seul ses deux fins de course. S'il dépasse un fin de course, il force contre la butée : le moteur se bloque et chauffe.",
    tapis: "La partie opérative : un tapis roulant entraîné par le moteur choisi (tambour moteur M). Des caisses arrivent du magasin à intervalles réguliers ; le capteur choisi les voit passer, au-dessus de la bande ; au bout, elles tombent dans le bac. Pour compter les caisses, il faut un compteur dans l'automate.",
    tri: "La partie opérative : un tapis roulant (moteur choisi) qui amène les caisses jusqu'à une cellule placée au bout de la bande. Quand la caisse quitte la cellule, elle tombe sur un volet : volet en bas, elle va dans le bac 1 ; volet basculé, dans le bac 2. Le volet est manœuvré par un vérin double effet piloté par un distributeur 4/2 (dessinés selon l'ISO 1219) : quand l'électrovanne choisie (YV) est alimentée, la tige sort et bascule le volet ; un ressort ramène le distributeur, et la tige rentre. Deux fins de course disent si la tige est rentrée ou sortie. Si une caisse tombe pendant que le volet bouge, elle tombe à côté.",
    electrovanne: "La bobine de l'électrovanne d'un distributeur pneumatique : quand elle est alimentée, le distributeur bascule et fait sortir la tige du vérin. Sans courant, un ressort le ramène et la tige rentre. Elle se branche comme une bobine de contacteur (repère YV), sur une sortie de l'automate.",
    cuve: "La partie opérative, dessinée comme un schéma de procédé : une cuve remplie par une pompe (entraînée par le moteur choisi, sens 1) et deux interrupteurs de niveau, LSL (niveau bas, 20 %) et LSH (niveau haut, 80 %). L'eau sort en continu par la vanne du bas ; si la pompe ne s'arrête pas, la cuve déborde.",
    bobine: "Quand elle est alimentée, tous les contacts qui portent le même repère changent d'état.",
    relais: "Comme un contacteur, mais pour les petits courants de la commande.",
    tempo_travail: "Ses contacts temporisés changent d'état après le retard, quand la bobine est alimentée. Ils reviennent tout de suite quand on la coupe.",
    tempo_repos: "Ses contacts temporisés changent d'état dès que la bobine est alimentée, et reviennent après le retard, quand on la coupe.",
    poles: "Les trois pôles de puissance d'un contacteur : ils se ferment quand la bobine du même repère est alimentée.",
    contact_no: "Ouvert au repos, il se ferme quand son appareil (même repère) est actionné.",
    contact_nf: "Fermé au repos, il s'ouvre quand son appareil (même repère) est actionné.",
    contact_tno: "Contact temporisé d'un relais temporisé (même repère) : ouvert au repos.",
    contact_tnf: "Contact temporisé d'un relais temporisé (même repère) : fermé au repos.",
    contact_th_nf: "Il s'ouvre quand le relais thermique déclenche : on le met en série dans la commande.",
    contact_th_no: "Il se ferme quand le relais thermique déclenche : il allume un voyant de défaut.",
    voyant: "Il s'allume quand il reçoit sa tension.",
    moteur: "Il tourne quand U, V, W reçoivent les trois phases. Croiser deux phases inverse le sens.",
    moteur6: "Six bornes. Étoile : U2, V2, W2 reliées. Triangle : U1 avec W2, V1 avec U2, W1 avec V2.",
    automate: "Il s'alimente en 24 V continu (+24V, 0V). Une entrée vaut 1 quand elle reçoit 24 V par rapport à COM. Une sortie à relais ferme le contact entre son commun (C0 ou C1) et %Q0.x. Son programme (Ladder ou GRAFCET) décide des sorties.",
    variateur: "Il reçoit le réseau sur L1, L2, L3 et alimente le moteur sur U, V, W, à la fréquence qu'il faut (rampes ACC, DEC). LI1 : marche avant, LI2 : marche arrière, quand elles reçoivent son +24V. La vitesse vient de AI1 (0-10 V), de sa molette, ou des vitesses présélectionnées (LI3, LI4).",
    potentiometre: "Un diviseur de tension : le curseur (2) donne une tension entre celle de la borne 1 et celle de la borne 3. Sur un variateur : 1 au +10V, 2 à AI1, 3 au COM."
  };
  let pnOuvert = false;
  function ouvrirPanneau(v) { pnOuvert = v == null ? !pnOuvert : v; document.body.classList.toggle("pn-ouvert", pnOuvert); const pg = $("pn-poignee"); if (pg) pg.querySelector("i").textContent = pnOuvert ? "▼" : "▲"; }
  function poignee() { return `<button class="pn-poignee" type="button" id="pn-poignee"><span>${esc(titrePanneau())}</span><i>${pnOuvert ? "▼" : "▲"}</i></button>`; }
  function brancherPoignee() { const p = $("pn-poignee"); if (p) p.onclick = () => ouvrirPanneau(); }
  function titrePanneau() {
    if (sim) return "Simulation";
    const pc = pieceChoisieSeule(); if (pc) return (pc.ref ? pc.ref + " · " : "") + M.TYPES[pc.type].nom;
    if (filChoisiSeul()) return "Un fil";
    if (sel.size > 1) return `${sel.size} éléments choisis`;
    if (doc.type === "defi") { const D = defiParId(doc.defi); return D ? `Défi · ${D.titre}` : "Défi"; }
    return "Mon schéma · réglages";
  }
  function majPanneau() {
    if (sim) { construirePanneauSim(); return; }
    let h = poignee();
    if (doc.type === "defi") h += carteDefi();
    if (prep) { h += cartePrep(); pn.innerHTML = h; brancherPoignee(); brancherPrep(); return; }
    if (prepC && doc.type === "libre") { h += cartePrepC(); pn.innerHTML = h; brancherPoignee(); brancherPrepC(); return; }
    const pc = pieceChoisieSeule(), f = filChoisiSeul();
    if (pc) h += panneauPiece(pc);
    else if (f) h += `<h2>Un fil</h2><p>Glisse le fil pour le décaler. Glisse un de ses bouts (carré) pour le rebrancher ailleurs.</p><p class="discret">Deux fils qui se croisent sans point ne sont pas reliés. Un point noir = une jonction.</p><div class="rang"><button class="btn sec" type="button" data-pa="supprimer">Supprimer le fil</button></div>`;
    else if (sel.size > 1) h += `<h2>${sel.size} éléments choisis</h2><p>Glisse-les ensemble, ou :</p><div class="rang"><button class="btn sec" type="button" data-pa="tourner">Tourner</button><button class="btn sec" type="button" data-pa="dupliquer">Dupliquer</button><button class="btn sec" type="button" data-pa="supprimer">Supprimer</button></div>`;
    else h += panneauSchema();
    pn.innerHTML = h;
    brancherPoignee(); brancherDefi();
    for (const b of pn.querySelectorAll("[data-pa]")) b.onclick = () => ({ supprimer, tourner, dupliquer, simuler: basculerSim, exemples: ouvrirExemples, defis: ouvrirDefis, aide: ouvrirAide, programmer: () => ouvrirProgramme(pieceChoisieSeule()) })[b.dataset.pa]();
    brancherChamps();
  }
  function panneauSchema() {
    const net = netEdit || (netEdit = M.netlist(schema));
    const nL = net.libres.filter((l) => !estReseau(schema, l.piece) && !libreOkL(schema, l)).length + net.bouts.length;
    return `<h2>${doc.type === "defi" ? "Ton schéma" : "Mon schéma"}</h2>
      ${doc.type === "defi" ? "" : `<label class="ch" for="pn-titre">Titre</label><input type="text" id="pn-titre" value="${esc(schema.titre)}" maxlength="80">`}
      <p class="discret">${schema.pieces.length} symbole${schema.pieces.length > 1 ? "s" : ""} · ${schema.fils.length} fil${schema.fils.length > 1 ? "s" : ""}${nL ? ` · <b style="color:var(--sc-libre)">${nL} borne${nL > 1 ? "s" : ""} ou bout${nL > 1 ? "s" : ""} de fil libre${nL > 1 ? "s" : ""}</b> (ronds orange ou rouges)` : ""}</p>
      <h3>Pour dessiner</h3>
      <p>1 · Choisis un symbole dans la liste, puis clique sur la feuille.</p>
      <p>2 · Glisse d'une borne à une autre : le fil se trace à angles droits.</p>
      <p>3 · Clique sur un symbole pour régler son repère (KM1, S2…).</p>
      <p>4 · Appuie sur <b>Simuler</b> pour l'essayer.</p>
      <div class="rang"><button class="btn sec" type="button" data-pa="exemples">Exemples</button><button class="btn sec" type="button" data-pa="defis">Défis</button><button class="btn sec" type="button" data-pa="aide">Aide</button></div>`;
  }
  function ouvrirProgramme(pc) {
    if (!pc || pc.type !== "automate") return;
    if (sim) arreterSim();
    fermerDialogues();
    PR.ouvrir(pc, { commit, schema: () => schema, bulle });
  }
  function option(v, lib, cur) { return `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(lib)}</option>`; }
  function panneauPiece(pc) {
    const T = M.TYPES[pc.type], P = M.parametres(pc);
    let h = `<h2>${esc(T.nom)}</h2><p class="discret">${esc(DESCR[pc.type] || "")}</p>`;
    if (T.lien) {
      const L = M.appareilsPour(schema, pc.type);
      h += `<label class="ch" for="pc-ref">Appartient à (repère de l'appareil)</label><input type="text" id="pc-ref" data-ch="ref" value="${esc(pc.ref)}" list="pc-refs" autocomplete="off" maxlength="12" spellcheck="false"><datalist id="pc-refs">${L.map((r) => `<option value="${esc(r)}">`).join("")}</datalist>`;
      if (pc.ref && !schema.pieces.some((q) => q.ref === pc.ref && !M.TYPES[q.type].lien) && !/^contact_th/.test(pc.type)) h += `<p style="color:var(--warn);font-size:.85rem">Il n'y a pas encore d'appareil ${esc(pc.ref)} sur la feuille${L.length ? ` (appareils possibles : ${L.map(esc).join(", ")})` : ""}.</p>`;
    } else if (T.pref) h += `<label class="ch" for="pc-ref">Repère</label><input type="text" id="pc-ref" data-ch="ref" value="${esc(pc.ref)}" autocomplete="off" maxlength="12" spellcheck="false">`;
    if (M.AVEC_NUM.indexOf(pc.type) >= 0 && !/^contact_th/.test(pc.type)) h += `<label class="ch" for="pc-num">Numéros des bornes</label><input type="text" id="pc-num" data-ch="num" value="${esc(P.num)}" maxlength="9" autocomplete="off" placeholder="13-14">`;
    if (pc.type === "selecteur") h += `<label class="ch" for="pc-contact">Contact</label><select id="pc-contact" data-ch="contact">${option("no", "à fermeture (fermé en position 1)", P.contact)}${option("nf", "à ouverture (ouvert en position 1)", P.contact)}</select>`;
    if (P.tension !== undefined) h += `<label class="ch" for="pc-tension">Tension ${pc.type === "voyant" ? "du voyant" : "de la bobine"}</label><select id="pc-tension" data-ch="tension">${M.TENSIONS.map((t) => option(t.id, t.nom, P.tension)).join("")}</select>`;
    if (P.delai !== undefined) h += `<label class="ch" for="pc-delai">Retard (en secondes)</label><input type="number" id="pc-delai" data-ch="delai" value="${esc(P.delai)}" min="0.1" max="600" step="0.5" inputmode="decimal">`;
    if (P.couleur !== undefined) h += `<label class="ch" for="pc-couleur">Couleur</label><select id="pc-couleur" data-ch="couleur">${M.COULEURS.map((c) => option(c.id, `${c.nom} (${c.code})`, P.couleur)).join("")}</select>`;
    if (pc.type === "reseau") h += `<label class="ch" for="pc-slt">Schéma de liaison à la terre</label><select id="pc-slt" data-ch="slt">${option("TT", "TT : neutre à la terre, masses à leur propre terre (différentiel obligatoire)", P.slt)}${option("TN-S", "TN-S : masses reliées au neutre par le PE (un défaut = un court-circuit)", P.slt)}${option("IT", "IT : neutre isolé (premier défaut sans coupure, contrôleur d'isolement)", P.slt)}</select>`
      + (P.slt === "TT" ? `<div class="deux"><div><label class="ch" for="pc-ra">Terre des masses Ra (Ω)</label><input type="number" id="pc-ra" data-ch="ra" value="${esc(P.ra)}" min="0.1" max="1000" step="1" inputmode="decimal"></div><div><label class="ch" for="pc-rn">Terre du neutre Rn (Ω)</label><input type="number" id="pc-rn" data-ch="rn" value="${esc(P.rn)}" min="0.1" max="1000" step="1" inputmode="decimal"></div></div><p class="discret">Défaut d'isolement : Id = 230 / (Ra + Rn) = ${nf(230 / ((+P.ra || 20) + (+P.rn || 10)), 1)} A ; la carcasse monte à Ra × Id = ${nf((230 * (+P.ra || 20)) / ((+P.ra || 20) + (+P.rn || 10)), 0)} V.</p>` : "");
    if (pc.type === "differentiel") h += `<label class="ch" for="pc-poles">Nombre de pôles</label><select id="pc-poles" data-ch="poles">${option(2, "2 pôles (phase et neutre)", P.poles)}${option(3, "3 pôles (trois phases)", P.poles)}${option(4, "4 pôles (trois phases et neutre)", P.poles)}</select>
      <label class="ch" for="pc-idn">Sensibilité IΔn</label><select id="pc-idn" data-ch="idn">${[30, 100, 300, 500, 1000].map((v) => option(v, v + " mA" + (v === 30 ? " (protège les personnes)" : v === 300 ? " (protège l'installation)" : ""), P.idn)).join("")}</select>`;
    if (pc.type === "disjoncteur") h += `<label class="ch" for="pc-poles">Nombre de pôles</label><select id="pc-poles" data-ch="poles">${[1, 2, 3].map((n) => option(n, n + (n > 1 ? " pôles" : " pôle"), P.poles)).join("")}</select>`;
    if (P.cal !== undefined) h += `<label class="ch" for="pc-cal">${pc.type === "thermique" || pc.type === "disj_moteur" ? "Réglage du thermique Ir (A)" : "Calibre (A)"}</label><input type="number" id="pc-cal" data-ch="cal" value="${esc(P.cal)}" min="0.1" max="1000" step="0.5" inputmode="decimal">`;
    if (pc.type === "alim") h += `<label class="ch" for="pc-pot">Potentiel</label><select id="pc-pot" data-ch="pot">${M.POTENTIELS.map((p) => option(p.id, `${p.nom} · ${p.aide}`, P.pot)).join("")}</select>`;
    if (pc.type === "transfo") h += `<label class="ch" for="pc-prim">Primaire</label><select id="pc-prim" data-ch="prim">${[400, 230].map((v) => option(v, v + " V", P.prim)).join("")}</select><label class="ch" for="pc-sec">Secondaire</label><select id="pc-sec" data-ch="sec">${[24, 48, 230].map((v) => option(v, v + " V", P.sec)).join("")}</select>`;
    if (pc.type === "moteur" || pc.type === "moteur6") h += `<label class="ch" for="pc-puissance">Puissance utile (kW)</label><input type="number" id="pc-puissance" data-ch="puissance" value="${esc(P.puissance)}" min="0.06" max="400" step="0.01" inputmode="decimal"><p class="discret">Pour la pince ampèremétrique : In ≈ ${nf(((Number(P.puissance) || 2.2) * 1000) / (Math.sqrt(3) * 400 * 0.8 * 0.82), 2)} A sous 400 V.</p>`;
    if (pc.type === "moteur6") h += `<label class="ch" for="pc-plaque">Plaque signalétique</label><select id="pc-plaque" data-ch="plaque">${option("400/690", "400 V / 690 V (étoile-triangle sur 400 V)", P.plaque)}${option("230/400", "230 V / 400 V (étoile sur 400 V)", P.plaque)}</select>`;
    if (pc.type === "automate") {
      const r = PR.resume(pc.prog);
      h += `<div class="pn-carte"><div class="eyebrow">Programme</div><p><b>${esc(r.texte)}</b>${r.vide ? " · vide" : ""}</p>${r.erreurs ? `<p style="color:var(--bad);font-size:.85rem">${r.erreurs} erreur${r.erreurs > 1 ? "s" : ""} à corriger.</p>` : r.alertes ? `<p style="color:var(--warn);font-size:.85rem">${r.alertes} remarque${r.alertes > 1 ? "s" : ""}.</p>` : ""}<div class="rang"><button class="btn" type="button" data-pa="programmer">Programmer ${esc(pc.ref || "l'automate")}</button></div></div>
        <p class="discret">+24V et 0V : alimentation. COM : commun des entrées (au 0 V). C0 : commun des sorties %Q0.0 à %Q0.3 ; C1 : de %Q0.4 à %Q0.7. AQ0 : sortie 0-10 V (%QW0).</p>`;
    }
    if (pc.type === "variateur") {
      const nb = (k, lib, min, max, pas, aide) => `<label class="ch" for="pc-${k}">${lib}</label><input type="number" id="pc-${k}" data-ch="${k}" value="${esc(P[k])}" min="${min}" max="${max}" step="${pas}" inputmode="decimal"${aide ? ` title="${esc(aide)}"` : ""}>`;
      h += `<label class="ch" for="pc-vref">Consigne de vitesse</label><select id="pc-vref" data-ch="ref">${option("AI1", "entrée AI1 (0-10 V : potentiomètre ou automate)", P.ref)}${option("molette", "molette du variateur (réglée pendant la simulation)", P.ref)}</select>
        <div class="deux">${nb("hsp", "Grande vitesse HSP (Hz)", 1, 100, 1)}${nb("lsp", "Petite vitesse LSP (Hz)", 0, 100, 1)}</div>
        <div class="deux">${nb("acc", "Accélération ACC (s)", 0.1, 600, 0.1, "temps pour aller de 0 à 50 Hz")}${nb("dec", "Décélération DEC (s)", 0.1, 600, 0.1, "temps pour aller de 50 Hz à 0")}</div>
        <details class="pn-plus"><summary>Vitesses présélectionnées</summary><div class="deux">${nb("sp2", "SP2 : LI3 (Hz)", 0, 100, 1)}${nb("sp3", "SP3 : LI4 (Hz)", 0, 100, 1)}</div>${nb("sp4", "SP4 : LI3 et LI4 (Hz)", 0, 100, 1)}<p class="discret">Une vitesse présélectionnée remplace la consigne AI1 (ou la molette).</p></details>
        <p class="discret">R1A-R1C : contact fermé quand le variateur est prêt (sous tension, sans défaut). Le +24V et le COM du variateur alimentent ses entrées LI.</p>`;
    }
    if (pc.type === "capteur3") h += `<label class="ch" for="pc-ctype">Type de sortie</label><select id="pc-ctype" data-ch="type">${option("PNP", "PNP : sortie au +24 V quand il détecte", P.type)}${option("NPN", "NPN : sortie au 0 V quand il détecte", P.type)}</select>
      <label class="ch" for="pc-cdet">Principe de détection</label><select id="pc-cdet" data-ch="detection">${option("inductif", "inductif : détecte les métaux", P.detection)}${option("capacitif", "capacitif : détecte aussi l'eau, le bois, le plastique…", P.detection)}${option("optique", "optique (cellule) : détecte tout objet qui coupe ou renvoie la lumière", P.detection)}</select>
      <label class="ch" for="pc-csortie">Fonction de sortie</label><select id="pc-csortie" data-ch="sortie">${option("NO", "NO : sortie active quand il détecte", P.sortie)}${option("NC", "NC : sortie active quand il ne détecte rien", P.sortie)}</select>
      <p class="discret">PNP : relie BK à une entrée de l'automate. NPN : la charge va du +24 V à BK.</p>`;
    if (T.cat === "po") {
      const refs = (f) => [...new Set(schema.pieces.filter(f).map((q) => q.ref).filter(Boolean))];
      const champRef = (k, lib, L) => `<label class="ch" for="pc-${k}">${lib}</label><input type="text" id="pc-${k}" data-ch="${k}" value="${esc(P[k])}" list="pc-l-${k}" autocomplete="off" maxlength="12" spellcheck="false"><datalist id="pc-l-${k}">${L.map((r) => `<option value="${esc(r)}">`).join("")}</datalist>`
        + (P[k] && !schema.pieces.some((q) => q.ref === P[k]) ? `<p style="color:var(--warn);font-size:.85rem;margin:2px 0 0">Il n'y a pas encore de ${esc(P[k])} sur la feuille.</p>` : "");
      const motL = refs((q) => /^moteur/.test(q.type)), capL = refs((q) => /^(fdc_no|fdc_nf|capteur|capteur3)$/.test(q.type));
      const nb = (k, lib, min, max, pas) => `<label class="ch" for="pc-${k}">${lib}</label><input type="number" id="pc-${k}" data-ch="${k}" value="${esc(P[k])}" min="${min}" max="${max}" step="${pas}" inputmode="decimal">`;
      if (pc.type === "chariot") h += champRef("moteur", "Moteur qui l'entraîne", motL) + `<label class="ch" for="pc-sens">Quand le moteur tourne dans le sens 1, le chariot va</label><select id="pc-sens" data-ch="sens">${option("1", "à droite", P.sens)}${option("2", "à gauche", P.sens)}</select>`
        + champRef("gauche", "Fin de course de gauche", capL) + champRef("droite", "Fin de course de droite", capL)
        + nb("duree", "Durée d'une course complète (s)", 0.5, 120, 0.5) + `<label class="ch" for="pc-depart">Au départ, le chariot est</label><select id="pc-depart" data-ch="depart">${option("gauche", "à gauche", P.depart)}${option("milieu", "au milieu", P.depart)}${option("droite", "à droite", P.depart)}</select>`;
      else if (pc.type === "tapis") h += champRef("moteur", "Moteur du tapis", motL) + `<label class="ch" for="pc-sens">Quand le moteur tourne dans le sens 1, les caisses vont</label><select id="pc-sens" data-ch="sens">${option("1", "vers la droite (vers le bac)", P.sens)}${option("2", "vers la gauche", P.sens)}</select>`
        + champRef("capteur", "Capteur qui voit passer les caisses", capL) + nb("duree", "Durée pour qu'une caisse fasse tout le tapis (s)", 1, 120, 0.5)
        + nb("ecart", "Écart entre deux caisses (% de la longueur du tapis)", 12, 100, 1) + nb("caisses", "Caisses dans le magasin (0 : sans fin)", 0, 999, 1);
      else if (pc.type === "tri") h += champRef("moteur", "Moteur du tapis", motL) + `<label class="ch" for="pc-sens">Quand le moteur tourne dans le sens 1, les caisses vont</label><select id="pc-sens" data-ch="sens">${option("1", "vers la droite (vers l'aiguillage)", P.sens)}${option("2", "vers la gauche", P.sens)}</select>`
        + champRef("capteur", "Cellule au bout du tapis (voit la caisse avant qu'elle tombe)", capL) + champRef("verin", "Électrovanne qui fait sortir le vérin", refs((q) => q.type === "electrovanne"))
        + champRef("rentre", "Fin de course : tige rentrée", capL) + champRef("sorti", "Fin de course : tige sortie", capL)
        + nb("course", "Durée d'une course du vérin (s)", 0.1, 10, 0.1) + nb("duree", "Durée pour qu'une caisse fasse tout le tapis (s)", 1, 120, 0.5)
        + nb("ecart", "Écart entre deux caisses (% de la longueur du tapis)", 12, 100, 1) + nb("caisses", "Caisses dans le magasin (0 : sans fin)", 0, 999, 1);
      else if (pc.type === "barriere") h += champRef("moteur", "Moteur de la lisse", motL) + `<label class="ch" for="pc-sens">Quand le moteur tourne dans le sens 1, la lisse</label><select id="pc-sens" data-ch="sens">${option("1", "se lève", P.sens)}${option("2", "se baisse", P.sens)}</select>`
        + champRef("haut", "Fin de course : barrière levée", capL) + champRef("bas", "Fin de course : barrière baissée", capL)
        + champRef("amont", "Boucle amont (la voiture arrive devant la lisse)", capL) + champRef("aval", "Boucle aval (la voiture est passée)", capL)
        + nb("duree", "Durée pour lever la lisse (s)", 0.5, 60, 0.5);
      else if (pc.type === "montecharge") h += champRef("moteur", "Moteur du treuil", motL) + `<label class="ch" for="pc-sens">Quand le moteur tourne dans le sens 1, la cabine</label><select id="pc-sens" data-ch="sens">${option("1", "monte", P.sens)}${option("2", "descend", P.sens)}</select>`
        + champRef("bas", "Capteur : cabine en bas (niveau 0)", capL) + champRef("haut", "Capteur : cabine en haut (niveau 1)", capL)
        + champRef("ralbas", "Capteur de ralentissement, en bas", capL) + champRef("ralhaut", "Capteur de ralentissement, en haut", capL) + champRef("porte", "Contact de porte (actionné porte fermée)", capL)
        + nb("duree", "Durée d'une montée à 50 Hz (s)", 1, 120, 0.5) + `<label class="ch" for="pc-depart">Au départ, la cabine est</label><select id="pc-depart" data-ch="depart">${option("bas", "en bas", P.depart)}${option("haut", "en haut", P.depart)}</select>`;
      else if (pc.type === "station") h += champRef("pompe1", "Moteur de la pompe P1 (0,75 kW, débit double)", motL) + champRef("pompe2", "Moteur de la pompe P2 (0,37 kW)", motL) + champRef("pompe3", "Moteur de la pompe P3 (0,37 kW)", motL)
        + champRef("tbas", "Électrode très bas (10 %)", capL) + champRef("bas", "Électrode bas (30 %)", capL) + champRef("haut", "Électrode haut (70 %)", capL) + champRef("thaut", "Électrode très haut (90 %)", capL)
        + nb("duree", "Durée pour remplir la bâche vide avec P2 seule (s)", 1, 600, 1) + nb("conso", "Eau consommée au départ (% du débit des trois pompes)", 0, 100, 5) + nb("niveau", "Niveau d'eau au départ (%)", 0, 100, 5);
      else h += champRef("moteur", "Moteur de la pompe", motL) + champRef("bas", "Flotteur du niveau bas (20 %)", capL) + champRef("haut", "Flotteur du niveau haut (80 %)", capL)
        + nb("duree", "Durée pour remplir la cuve vide, sans sortie (s)", 1, 600, 1) + nb("conso", "Eau consommée au départ (% du débit de la pompe)", 0, 100, 5) + nb("niveau", "Niveau d'eau au départ (%)", 0, 100, 5);
      h += `<p class="discret">Les capteurs se relient par leur repère : ce sont eux que ${pc.type === "chariot" ? "le chariot actionne" : pc.type === "tapis" ? "les caisses actionnent" : pc.type === "tri" ? "les caisses et la tige du vérin actionnent" : pc.type === "barriere" ? "la lisse et les voitures actionnent" : pc.type === "montecharge" ? "la cabine et sa porte actionnent" : "l'eau fait basculer"} pendant la simulation.</p>`;
    }
    if (pc.type === "potentiometre") h += `<label class="ch" for="pc-pos">Position du curseur au départ (%)</label><input type="number" id="pc-pos" data-ch="pos" value="${esc(P.pos)}" min="0" max="100" step="5" inputmode="numeric">`;
    h += `<div class="rang">${T.sansRot ? "" : `<button class="btn sec" type="button" data-pa="tourner">Tourner</button>`}<button class="btn sec" type="button" data-pa="dupliquer">Dupliquer</button><button class="btn sec" type="button" data-pa="supprimer">Supprimer</button></div>`;
    return h;
  }
  function brancherChamps() {
    const t = $("pn-titre"); if (t) t.onchange = () => { schema.titre = t.value.trim().slice(0, 80) || "Mon schéma"; commit(); };
    const pc = pieceChoisieSeule(); if (!pc) return;
    for (const el of pn.querySelectorAll("[data-ch]")) el.onchange = () => changerChamp(pc, el.dataset.ch, el.value);
  }
  function changerChamp(pc, k, v) {
    const T = M.TYPES[pc.type];
    if (k === "ref") {
      const nv = String(v).trim().toUpperCase().replace(/[^A-Z0-9_.\-]/g, "").slice(0, 12), anc = pc.ref;
      if (!nv) { majPanneau(); return; }
      pc.ref = nv;
      if (!T.lien && anc && anc !== nv && !schema.pieces.some((q) => q !== pc && q.ref === anc && !M.TYPES[q.type].lien)) {
        let n = 0; for (const q of schema.pieces) if (q !== pc && q.ref === anc && M.TYPES[q.type].lien) { q.ref = nv; n++; }
        if (n) bulle(`Les ${n} contact${n > 1 ? "s" : ""} de ${esc(anc)} s'appellent maintenant ${esc(nv)}.`, 3500);
      }
      if (T.lien && M.AVEC_NUM.indexOf(pc.type) >= 0) { const n = M.numeroContact(schema, pc); if (n) pc.p.num = n; }
      retenir(pc);
    } else if (k === "num") {
      const m = /^\s*([0-9A-Za-z]{1,4})\s*-\s*([0-9A-Za-z]{1,4})\s*$/.exec(v);
      if (!m) { bulle("Écris les deux numéros séparés par un tiret, par exemple 13-14.", 3500); majPanneau(); return; }
      pc.p.num = m[1] + "-" + m[2];
    } else if (k === "delai" || k === "cal") {
      const x = Number(String(v).replace(",", "."));
      if (!Number.isFinite(x) || x <= 0) { majPanneau(); return; }
      pc.p[k] = k === "delai" ? clamp(Math.round(x * 10) / 10, 0.1, 600) : clamp(x, 0.1, 1000);
    } else if (k === "poles" || k === "prim" || k === "sec" || k === "idn") pc.p[k] = Number(v);
    else if (k === "ra" || k === "rn") { const x = Number(String(v).replace(",", ".")); if (!Number.isFinite(x) || x <= 0) { majPanneau(); return; } pc.p[k] = clamp(Math.round(x * 10) / 10, 0.1, 1000); }
    else if (k === "puissance") { const x = Number(String(v).replace(",", ".")); if (!Number.isFinite(x) || x <= 0) { majPanneau(); return; } pc.p.puissance = clamp(Math.round(x * 100) / 100, 0.06, 400); }
    else if (T.cat === "po" && /^(moteur|gauche|droite|bas|haut|capteur|verin|rentre|sorti|amont|aval|ralbas|ralhaut|porte|pompe1|pompe2|pompe3|tbas|thaut)$/.test(k)) pc.p[k] = String(v).trim().toUpperCase().replace(/[^A-Z0-9_.\-]/g, "").slice(0, 12);
    else if (T.cat === "po" && /^(duree|conso|niveau|ecart|caisses|course)$/.test(k)) {
      const x = Number(String(v).replace(",", "."));
      if (!Number.isFinite(x)) { majPanneau(); return; }
      const [a, b] = k === "duree" ? (pc.type === "cuve" || pc.type === "station" ? [1, 600] : pc.type === "tapis" || pc.type === "tri" || pc.type === "montecharge" ? [1, 120] : pc.type === "barriere" ? [0.5, 60] : [0.5, 120]) : k === "ecart" ? [12, 100] : k === "caisses" ? [0, 999] : k === "course" ? [0.1, 10] : [0, 100];
      pc.p[k] = clamp(k === "caisses" ? Math.round(x) : Math.round(x * 10) / 10, a, b);
    }
    else if (/^(hsp|lsp|acc|dec|sp2|sp3|sp4|pos)$/.test(k)) {
      const x = Number(String(v).replace(",", "."));
      if (!Number.isFinite(x)) { majPanneau(); return; }
      const [a, b] = { hsp: [1, 100], lsp: [0, 100], acc: [0.1, 600], dec: [0.1, 600], sp2: [0, 100], sp3: [0, 100], sp4: [0, 100], pos: [0, 100] }[k];
      pc.p[k] = clamp(Math.round(x * 10) / 10, a, b);
    }
    else {
      pc.p[k] = v;
      if (k === "contact" && M.AVEC_NUM.indexOf(pc.type) >= 0) { const n = M.numeroContact(schema, pc); if (n) pc.p.num = n; }
      if (k === "pot") { const rd = T.rotDefaut ? T.rotDefaut(M.parametres(pc)) : 0; if ((pc.rot | 0) !== rd && (pc.rot | 0) % 2 === rd % 2) pc.rot = rd; }
    }
    commit();
  }

  /* =====================================================================
     DÉFIS
     ===================================================================== */
  const defiParId = (id) => (cpltProf && cpltProf.id === id ? cpltProf.D : X.DEFIS.find((d) => d.id === id) || null);
  // schéma à compléter du professeur : essais ratés, indice, réussite, envoi (à part des défis : le compteur « n / 24 » ne les compte pas)
  const cpltEtats = () => lire(CLE.cplt) || {};
  const cpltEtat = (id) => Object.assign({ rates: 0, indice: false, debut: Date.now(), ok: false, envoi: "" }, cpltEtats()[id] || {});
  function garderCplt(id, o) { const S = cpltEtats(); S[id] = o; garder(CLE.cplt, S); }
  function carteCplt(D) {
    const E = cpltEtat(D.id), r = resultatDefi, nom = session && session.nom ? esc(session.nom) : "";
    let res = "";
    if (r) res = `<ul class="res">${r.etapes.map((e) => `<li class="${e.ok ? "" : "ko"}"><span>${esc(e.texte)}</span>${e.ok ? "" : `${e.constat ? `<span class="constat">Ce que je vois : ${esc(e.constat.replace(/[.!\s]+$/, ""))}.</span>` : ""}<span class="pourquoi">${esc(e.detail)}</span>`}</li>`).join("")}</ul>`;
    if (E.ok) {
      res += `<div class="bravo">Ton schéma fait comme celui du professeur. Note : ${nf(noteDefi(E))} / 20${E.rates ? ` (${E.rates} vérification${E.rates > 1 ? "s" : ""} ratée${E.rates > 1 ? "s" : ""})` : ""}.</div>`;
      const V = E.envoi;
      res += V === "envoye" ? `<p class="dp-envoi ok">Résultat envoyé au professeur ✓${nom ? ` (${nom})` : ""}</p>` : V === "file" ? `<p class="dp-envoi ok">Résultat gardé : il partira dès que le site sera joignable ✓</p>`
        : V === "en cours" ? `<p class="dp-envoi">Envoi au professeur…</p>` : `<p class="dp-envoi ko">${V === "deconnecte" || !V ? "Tu n'es pas connecté(e) au site : ton résultat n'est pas parti. Connecte-toi sur la page d'accueil, puis reviens ici." : V === "expire" ? "Ta connexion au site a expiré : reconnecte-toi sur la page d'accueil, puis reviens ici." : "Le résultat n'a pas pu partir."}</p><div class="rang"><button class="btn" type="button" id="cp-renvoyer">Envoyer mon résultat</button></div>`;
    }
    return `<div class="pn-carte pn-defi pn-cplt"><div class="eyebrow">Schéma à compléter · du professeur${E.ok ? " · réussi ✓" : ""}</div>
      <h2>${esc(D.titre)}</h2>
      ${session && session.nom ? `<p class="dp-qui ok">Connecté(e) : <b>${esc(session.nom)}</b>. Ta note partira au professeur dès que ton schéma sera juste.</p>` : `<p class="dp-qui ko">Tu n'es pas connecté(e) au site : ta note ne partira pas au professeur. <a href="../index.html">Connecte-toi d'abord</a>, puis rouvre ce lien.</p>`}
      ${D.consigne}
      <p class="discret">« Vérifier » rejoue l'essai du professeur (${D.etapes.length} étapes${D.commandes.length ? " : " + esc(D.commandes.join(", ")) : ""}) et compare ton schéma au sien. Note sur 20 : −2 par vérification ratée${D.indice ? ", −3 si tu ouvres l'indice" : ""}, jamais moins de 10.</p>
      <div class="rang"><button class="btn" type="button" id="df-verif">Vérifier</button>${D.indice ? `<button class="btn sec" type="button" id="df-indice">Un indice</button>` : ""}</div>
      ${D.indice ? `<div id="df-indice-z"${indiceVu ? "" : " hidden"}><p>${esc(D.indice)}</p></div>` : ""}
      ${res}
      <div class="rang"><button class="btn sec" type="button" id="df-raz">Recommencer</button><button class="btn sec" type="button" id="df-quitter">Quitter</button></div></div>`;
  }
  async function envoyerCplt() {
    const D = cpltProf && cpltProf.D; if (!D) return;
    const E = cpltEtat(D.id); if (!E.ok || /^(envoye|file|en cours)$/.test(E.envoi || "")) return;
    E.envoi = "en cours"; garderCplt(D.id, E); majCarteCplt();
    const n = noteDefi(E), rates = E.rates || 0;
    const r = await envoyerAuSite({ module: "schemas-" + D.id, titre: "Schéma à compléter · " + D.titre, type: "externe", score: n, score_max: 20, duree_s: Math.max(0, Math.round(((E.t || Date.now()) - (E.debut || Date.now())) / 1000)),
      details: [{ q: "Schéma à compléter", rep: `juste après ${rates} vérification${rates > 1 ? "s" : ""} ratée${rates > 1 ? "s" : ""}${E.indice ? ", indice ouvert" : ""}`, attendu: `l'essai du professeur (${D.etapes.length} étapes)`, bareme: 20, pts: n, erreurs: rates, rates, indice: !!E.indice }] });
    const E2 = cpltEtat(D.id); E2.envoi = r; garderCplt(D.id, E2); majCarteCplt();
  }
  function majCarteCplt() { if (doc.type === "defi" && cpltProf && doc.defi === cpltProf.id) { if (sim) construirePanneauSim(); else majPanneau(); } }
  async function ouvrirCodeCplt(code, silencieux) {
    let o, s;
    try { o = await decoderCode(code); s = M.valider(o.s); }
    catch (e) { toast(String(code)[0] === "z" && !window.DecompressionStream ? "Ce navigateur ne sait pas lire ce lien : demande le fichier au professeur." : "Ce schéma à compléter n'a pas pu être lu (lien abîmé ?)."); return false; }
    const E = Array.isArray(o.e) ? o.e.slice(0, 600).filter((e) => e && typeof e === "object") : [];
    if (!E.length) { toast("Ce schéma à compléter n'a pas d'essai."); return false; }
    const id = "cplt-" + hacher(JSON.stringify(o)), titre = String(o.t || s.titre || "Schéma à compléter").slice(0, 80);
    cpltProf = { id, code, D: { id, prof: true, titre, niveau: 0, resume: "", consigne: o.c ? enHtml(String(o.c).slice(0, 1500)) : "<p class=\"discret\">Complète le schéma, puis « Vérifier ».</p>",
      indice: o.i ? String(o.i).slice(0, 600) : "", depart: () => M.cloner(s), exige: o.x && typeof o.x === "object" ? o.x : {}, etapes: E, commandes: Array.isArray(o.k) ? o.k.slice(0, 40).map(String) : [] } };
    ouvrirDefi(id, silencieux);
    return true;
  }
  const progres = () => lire(CLE.progres) || {};
  function carteDefi() {
    const D = defiParId(doc.defi); if (!D) return "";
    if (D.prof) return carteCplt(D);
    const k = X.DEFIS.indexOf(D), fait = !!progres()[D.id];
    let res = "";
    if (resultatDefi) {
      res = `<ul class="res">${resultatDefi.etapes.map((e) => `<li class="${e.ok ? "" : "ko"}"><span>${esc(e.texte)}</span>${e.ok ? "" : `${e.constat ? `<span class="constat">Ce que je vois : ${esc(e.constat.replace(/[.!\s]+$/, ""))}.</span>` : ""}<span class="pourquoi">${esc(e.detail)}</span>`}</li>`).join("")}</ul>`;
      if (resultatDefi.ok) res += `<div class="bravo">Bravo, défi réussi !</div><p class="discret">${session ? "Ton professeur le voit dans son suivi." : "Connecte-toi au site (Mon espace) : ton professeur verra tes défis réussis."}</p>${k + 1 < X.DEFIS.length ? `<div class="rang"><button class="btn" type="button" id="df-suivant">Défi suivant →</button></div>` : ""}`;
    }
    return `<div class="pn-carte pn-defi"><div class="eyebrow">Défi ${k + 1} sur ${X.DEFIS.length} · ${"●".repeat(D.niveau)}${"○".repeat(3 - D.niveau)}${fait ? " · réussi ✓" : ""}</div>
      <h2>${esc(D.titre)}</h2>${D.consigne}
      <div class="rang"><button class="btn" type="button" id="df-verif">Vérifier</button><button class="btn sec" type="button" id="df-indice">Un indice</button></div>
      <div id="df-indice-z"${indiceVu ? "" : " hidden"}><p>${esc(D.indice)}</p>${D.aide ? `<div style="background:var(--sc-feuille);border:1px solid var(--rule);border-radius:8px;padding:4px">${apercu(D.aide(), 150)}</div>` : ""}</div>
      ${res}
      <div class="rang"><button class="btn sec" type="button" id="df-raz">Recommencer</button><button class="btn sec" type="button" id="df-quitter">Quitter le défi</button></div></div>`;
  }
  function brancherDefi() {
    const v = $("df-verif"); if (!v) return;
    v.onclick = verifierDefi;
    const bi = $("df-indice");
    if (bi) bi.onclick = () => {
      indiceVu = !indiceVu; $("df-indice-z").hidden = !indiceVu;
      const D = defiParId(doc.defi);
      if (indiceVu && D && D.prof) { const E = cpltEtat(D.id); if (!E.ok && !E.indice) { E.indice = true; garderCplt(D.id, E); } }
      else if (indiceVu && D && !progres()[D.id]) { const st = statsDefi(D.id); if (!st.indice) { st.indice = true; garderStatsDefi(D.id, st); } }
    };
    const rv = $("cp-renvoyer"); if (rv) rv.onclick = () => { const D = defiParId(doc.defi); if (!D) return; const E = cpltEtat(D.id); E.envoi = ""; garderCplt(D.id, E); envoyerCplt(); };
    const raz = $("df-raz");
    raz.onclick = () => {   // en deux temps : un clic de travers n'efface pas le travail
      const D = defiParId(doc.defi); if (!D) return;
      if (!raz.dataset.sur) { raz.dataset.sur = "1"; raz.textContent = "Sûr ? Tout effacer"; raz.classList.add("ko"); setTimeout(() => { if (raz.isConnected) { delete raz.dataset.sur; raz.textContent = "Recommencer"; raz.classList.remove("ko"); } }, 3500); return; }
      if (sim) arreterSim(); chargerSchema(D.depart()); bulle("Le défi est revenu à son départ.", 2500);
    };
    $("df-quitter").onclick = quitterDefi;
    const s = $("df-suivant"); if (s) s.onclick = () => { const k = X.DEFIS.findIndex((d) => d.id === doc.defi); if (k >= 0 && k + 1 < X.DEFIS.length) ouvrirDefi(X.DEFIS[k + 1].id); };
  }
  function verifierDefi() {
    const D = defiParId(doc.defi); if (!D) return null;
    const r = MO.scenario(M.cloner(schema), D.etapes, { exige: D.exige });
    resultatDefi = r;
    if (D.prof) {
      const E = cpltEtat(D.id);
      if (!E.ok) { if (r.ok) { E.ok = true; E.t = Date.now(); } else E.rates = (E.rates || 0) + 1; garderCplt(D.id, E); }
      if (E.ok) envoyerCplt();
      if (sim) construirePanneauSim(); else majPanneau();
      ouvrirPanneau(true);
      const z = pn.querySelector(".res"); if (z) z.scrollIntoView({ block: "nearest" });
      return r;
    }
    const P = progres(), deja = P[D.id], st = statsDefi(D.id);
    if (!r.ok && !deja) { st.rates = (st.rates || 0) + 1; garderStatsDefi(D.id, st); }
    if (r.ok) {
      P[D.id] = Object.assign({ rates: st.rates || 0, indice: !!st.indice, debut: st.debut || null }, deja || {}, { ok: true, t: (deja && deja.t) || Date.now() });
      garder(CLE.progres, P);
      envoyerDefis();
    }
    if (sim) construirePanneauSim(); else majPanneau();
    ouvrirPanneau(true);
    const z = pn.querySelector(".res"); if (z) z.scrollIntoView({ block: "nearest" });
    return r;
  }
  function ouvrirDefi(id, silencieux) {
    const D = defiParId(id); if (!D) return;
    if (sim) arreterSim();
    sauver();
    doc = { type: "defi", defi: id }; prepC = null;
    let s = null; const sv = lire(CLE.defi(id));
    if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    if (D.prof) { if (!cpltEtats()[id]) garderCplt(id, cpltEtat(id)); garder(CLE.cpltCode(id), cpltProf.code); }
    else if (!statsDefis()[id] && !progres()[id]) garderStatsDefi(id, { rates: 0, indice: false, debut: Date.now() });
    chargerSchema(s || D.depart());
    sauver(); fermerDialogues();
    if (history.replaceState) history.replaceState(null, "", D.prof ? "#complet=" + cpltProf.code : "#defi=" + id);
    if (!silencieux) ouvrirPanneau(true);
    majPanneau();
  }
  function quitterDefi() {
    if (sim) arreterSim();
    sauver(); doc = { type: "libre" }; cpltProf = null;
    let s = null; const sv = lire(CLE.libre); if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    chargerSchema(s || M.nouveau());
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    sauver();
  }

  /* =====================================================================
     FENÊTRES : fichier, exemples, défis, aide
     ===================================================================== */
  function ouvrirDialogue(id) { fermerDialogues(); const d = $(id); if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function fermerDialogues() { for (const d of document.querySelectorAll("dialog[open]")) { if (d.close) d.close(); else d.removeAttribute("open"); } }
  for (const d of document.querySelectorAll("dialog.sc-d")) {
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-fermer]")) fermerDialogues(); });
  }
  function apercu(s, h) {
    const net = M.netlist(s), b = M.bornesDe(s);
    const x0 = b[0] * G - 46, y0 = b[1] * G - 26, w = (b[2] - b[0]) * G + 80, hh = (b[3] - b[1]) * G + 52;
    return `<svg viewBox="${x0} ${y0} ${w} ${hh}" style="width:100%;height:${h ? h + "px" : "100%"}" aria-hidden="true">${svgSchema(s, net, null, {})}</svg>`;
  }
  function copieAuto() {
    if (doc.type !== "libre" || !schema.pieces.length) return;
    const L = lire(CLE.copies) || [], j = JSON.stringify(schema);
    if (L.some((c) => JSON.stringify(c.schema) === j)) return;
    L.unshift({ id: Date.now(), nom: (schema.titre || "Mon schéma") + " (copie automatique)", t: Date.now(), schema: M.cloner(schema) });
    garder(CLE.copies, L.slice(0, 30));
  }
  function ouvrirExemple(id) {
    const E = X.EXEMPLES.find((e) => e.id === id); if (!E) return;
    if (sim) arreterSim();
    quitterDoc();
    chargerSchema(E.construire()); fermerDialogues();
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    bulle(`Exemple « ${esc(E.titre)} » ouvert. Appuie sur <b>Simuler</b> pour l'essayer.`, 4500);
  }
  function ouvrirExemples() {
    $("d-exemples-c").innerHTML = `<p class="discret">Des schémas justes, à simuler ou à modifier. Ton schéma actuel est gardé dans « Fichier › Mes schémas ».</p><div class="cartes">${X.EXEMPLES.map((e) => `<button class="carte-x" type="button" data-ex="${e.id}"><div class="ap">${apercu(e.construire())}</div><span class="etq">${esc(e.niveau)}</span><b>${esc(e.titre)}</b><span>${esc(e.resume)}</span></button>`).join("")}</div>`;
    for (const b of $("d-exemples-c").querySelectorAll("[data-ex]")) b.onclick = () => ouvrirExemple(b.dataset.ex);
    ouvrirDialogue("d-exemples");
  }
  function ouvrirDefis() {
    const P = progres(), n = X.DEFIS.filter((d) => P[d.id]).length;
    $("d-defis-c").innerHTML = `<p class="discret">Chaque défi part d'un schéma à compléter. « Vérifier » rejoue des essais sur ton schéma (appuyer sur S2, surcharge…) et te dit ce qui ne va pas. ${n ? `<b>${n} défi${n > 1 ? "s" : ""} réussi${n > 1 ? "s" : ""} sur ${X.DEFIS.length}.</b>` : ""} Ta progression reste dans ce navigateur${QUI !== "local" ? ` (${esc(QUI)})` : ""}.</p>
      <div class="cartes">${X.DEFIS.map((d, k) => `<button class="carte-x" type="button" data-df="${d.id}"><div class="ap">${apercu(d.depart())}</div><span class="etq${P[d.id] ? " fait" : ""}">${P[d.id] ? "Réussi ✓" : "Défi " + (k + 1)} · ${"●".repeat(d.niveau)}${"○".repeat(3 - d.niveau)}</span><b>${esc(d.titre)}</b><span>${esc(d.resume)}</span></button>`).join("")}</div>`;
    const PD = lire(CLE.depProgres) || {};
    $("d-defis-c").insertAdjacentHTML("beforeend", `<h3 style="margin-top:18px">Dépannage : trouve la panne</h3><p class="discret">Un schéma juste, avec une panne cachée au hasard (fil coupé, contact, bobine, fusible…). Les fils ne montrent pas la tension : on cherche avec le <b>voltmètre</b>, comme en vrai.</p>
      <div class="cartes">${X.DEPANNAGES.map((d, k) => `<button class="carte-x" type="button" data-dp="${d.id}"><div class="ap">${apercu(d.base())}</div><span class="etq${PD[d.id] ? " fait" : ""}">${PD[d.id] ? "Trouvé ✓" : "Dépannage " + (k + 1)} · ${"●".repeat(d.niveau)}${"○".repeat(3 - d.niveau)}</span><b>${esc(d.titre)}</b><small>${esc(d.resume)}</small></button>`).join("")}</div>`);
    const PL = lire(CLE.lecProgres) || {};
    $("d-defis-c").insertAdjacentHTML("beforeend", `<h3 style="margin-top:18px">Lecture de schéma : clique pour répondre</h3><p class="discret">Des questions sur un schéma du cours (« Clique sur le contact d'auto-maintien »…) : tu réponds en cliquant sur l'appareil. Deux essais par question.</p>
      <div class="cartes">${X.LECTURES.map((L, k) => `<button class="carte-x" type="button" data-lc="${L.id}"><div class="ap">${apercu(L.base())}</div><span class="etq${PL[L.id] ? " fait" : ""}">${PL[L.id] ? `Meilleure note : ${nf(PL[L.id].note)}/20` : "Lecture " + (k + 1)} · ${"●".repeat(L.niveau)}${"○".repeat(3 - L.niveau)}</span><b>${esc(L.titre)}</b><small>${L.questions.length} questions</small></button>`).join("")}</div>`);
    if (DI) {
      const PC = lire(CLE.dimProgres) || {};
      $("d-defis-c").insertAdjacentHTML("beforeend", `<h3 style="margin-top:18px">Calcul des câbles : trouve les sections</h3><p class="discret">Un tableau électrique et ses départs : le courant d'emploi, la protection, le coefficient K, la section du câble et la chute de tension. Les tableaux de la norme sont dans l'exercice.</p>
      <div class="cartes">${DI.EXERCICES.map((x, k) => { const d = DI.valider(x.dim); return `<button class="carte-x" type="button" data-cb="${x.id}"><div class="ap">${DI.unifilaire(d, DI.calculer(d), () => false)}</div><span class="etq${PC[x.id] ? " fait" : ""}">${PC[x.id] ? `Note : ${nf(PC[x.id].note)}/20` : "Exercice " + (k + 1)} · ${"●".repeat(x.niveau)}${"○".repeat(3 - x.niveau)}</span><b>${esc(x.titre)}</b><small>${esc(x.resume)}</small></button>`; }).join("")}</div>`);
      for (const b of $("d-defis-c").querySelectorAll("[data-cb]")) b.onclick = () => ouvrirDim(exoDim(b.dataset.cb));
    }
    for (const b of $("d-defis-c").querySelectorAll("[data-lc]")) b.onclick = () => ouvrirLecture(b.dataset.lc);
    for (const b of $("d-defis-c").querySelectorAll("[data-df]")) b.onclick = () => ouvrirDefi(b.dataset.df);
    for (const b of $("d-defis-c").querySelectorAll("[data-dp]")) b.onclick = () => ouvrirDepannage(b.dataset.dp);
    ouvrirDialogue("d-defis");
  }
  function ouvrirFichier() {
    const L = lire(CLE.copies) || [];
    $("d-fichier-c").innerHTML = `<div class="menu-l">
        <button type="button" data-f="nouveau"><span><b>Nouveau schéma</b><small>Une feuille vide (ton schéma actuel est gardé dans « Mes schémas »)</small></span></button>
        <button type="button" data-f="json"><span><b>Exporter le fichier (.json)</b><small>Pour le garder, l'envoyer au professeur ou le rouvrir sur un autre appareil</small></span></button>
        <label class="bt" for="sc-import"><span><b>Ouvrir un fichier (.json)</b><small>Un schéma exporté depuis cet atelier</small></span></label>
        <button type="button" data-f="png"><span><b>Image PNG</b><small>Le schéma avec son cartouche, pour un compte rendu</small></span></button>
        <button type="button" data-f="svg"><span><b>Image SVG</b><small>Dessin vectoriel (net à toutes les tailles)</small></span></button>
        <button type="button" data-f="imprimer"><span><b>Imprimer</b><small>Feuille A4 paysage</small></span></button>
        <button type="button" data-f="nomenclature"><span><b>Nomenclature et bornier</b><small>La liste des appareils (repère, désignation, caractéristiques, colonnes) et le bornier X1 des appareils du terrain</small></span></button>
        <button type="button" data-f="cables"><span><b>Calcul des câbles</b><small>Pour chaque départ du tableau : la protection, la section du câble et la chute de tension, pas à pas, et le schéma unifilaire</small></span></button>
        <button type="button" data-f="completer"><span><b>Préparer un schéma à compléter (professeur)</b><small>Le schéma juste, puis ce que l'élève doit faire : la vérification rejoue un essai sur ton corrigé, et leur note t'arrive</small></span></button>
        <button type="button" data-f="preparer"><span><b>Préparer un dépannage (professeur)</b><small>Cache une panne dans ce schéma, puis donne le lien aux élèves : tous la même panne, et leur note t'arrive</small></span></button>
      </div>
      ${sectionCompte()}
      <h3 style="margin-top:16px">Mes schémas <span class="discret">(dans ce navigateur)</span></h3>
      <div class="rang" style="display:flex;gap:6px"><input type="text" id="f-nom" placeholder="Nom de la copie" value="${esc(schema.titre)}" maxlength="80" style="flex:1;font:inherit;padding:8px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink)"><button class="btn" type="button" data-f="copie">Enregistrer une copie</button></div>
      <ul class="copies">${L.map((c, i) => `<li><span><b>${esc(c.nom)}</b><small>${new Date(c.t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · ${c.schema.pieces.length} symboles</small></span><button class="btn sec" type="button" data-o="${i}">Ouvrir</button><button class="btn sec" type="button" data-x="${i}" aria-label="Supprimer la copie">×</button></li>`).join("") || `<li class="discret">Aucune copie pour l'instant.</li>`}</ul>`;
    const C = $("d-fichier-c");
    for (const b of C.querySelectorAll("[data-f]")) b.onclick = () => actionFichier(b.dataset.f);
    for (const b of C.querySelectorAll("[data-o]")) b.onclick = () => { const c = (lire(CLE.copies) || [])[+b.dataset.o]; if (!c) return; if (sim) arreterSim(); quitterDoc(); try { chargerSchema(M.valider(c.schema)); } catch (e) { toast(e.message); } fermerDialogues(); };
    for (const b of C.querySelectorAll("[data-x]")) b.onclick = () => { const L2 = lire(CLE.copies) || []; L2.splice(+b.dataset.x, 1); garder(CLE.copies, L2); ouvrirFichier(); };
    if (session && $("cp-garder")) {
      $("cp-garder").onclick = () => garderSurCompte(false);
      $("cp-envoi-o").onclick = () => { const z = $("cp-envoi"); z.hidden = !z.hidden; if (!z.hidden) $("cp-msg").focus(); };
      $("cp-envoyer").onclick = () => garderSurCompte(true);
      majCompte();
    }
    ouvrirDialogue("d-fichier");
  }
  /* ---------- sur le compte de l'élève connecté : ses schémas (sur tous ses appareils), et l'envoi au professeur ----------
     40 schémas au plus, 200 ko chacun (supabase/schemas.sql) ; le professeur les voit dans sa page « Atelier schémas ». */
  const ERR_COMPTE = { SCHEMA_NOMBRE: "Ton compte garde 40 schémas au plus : supprimes-en un.", SCHEMA_TROP_GROS: "Ce schéma est trop gros pour être gardé sur le compte.",
    SCHEMA_NOM: "Donne un titre au schéma.", SESSION_EXPIREE: "Ta connexion au site a expiré : reconnecte-toi sur la page d'accueil.", SCHEMA_INCONNU: "Ce schéma n'est plus sur ton compte." };
  function msgCompte(e) {
    const m = String((e && e.message) || e || "");
    for (const k of Object.keys(ERR_COMPTE)) if (m.indexOf(k) >= 0) return ERR_COMPTE[k];
    return /schema|function|does not exist|PGRST/i.test(m) ? "Pas encore possible : le professeur doit mettre à jour la base du site." : "Le site ne répond pas : réessaie plus tard.";
  }
  async function apiCompte() { const S = await chargerSite().catch(() => null); if (!S || !S.api || !S.api.schemaGarder || !S.session.get()) throw new Error("SESSION_EXPIREE"); return S.api; }
  const dateCourte = (t) => (t ? new Date(t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "");
  function sectionCompte() {
    if (!session) return `<h3 style="margin-top:16px">Sur mon compte</h3><p class="discret">Connecte-toi au site (<a href="../index.html">Mon espace</a>) pour garder tes schémas sur ton compte, sur tous tes appareils, et les envoyer au professeur.</p>`;
    return `<h3 style="margin-top:16px">Sur mon compte <span class="discret">(${esc(session.nom || "")} · tous tes appareils)</span></h3>
      <div class="rang"><button class="btn" type="button" id="cp-garder">Garder ce schéma sur mon compte</button><button class="btn sec" type="button" id="cp-envoi-o">Envoyer au professeur…</button></div>
      <div id="cp-envoi" hidden><label class="ch" for="cp-msg">Un mot pour le professeur (facultatif)</label><textarea id="cp-msg" rows="2" maxlength="500" placeholder="Par exemple : je n'arrive pas à faire marcher S3."></textarea>
        <div class="rang"><button class="btn" type="button" id="cp-envoyer">Envoyer « ${esc(schema.titre || "Mon schéma")} »</button></div></div>
      <p class="discret" id="cp-etat" aria-live="polite"></p>
      <p class="discret">Tant que tu es connecté, ton professeur voit ton schéma en direct (page « En direct » de son espace).</p>
      <ul class="copies" id="cp-liste"><li class="discret">Chargement…</li></ul>`;
  }
  async function majCompte() {
    if (!$("cp-liste")) return;
    try {
      const L = await (await apiCompte()).schemasListe(), z = $("cp-liste"); if (!z) return;
      z.innerHTML = L.length ? L.map((c) => `<li><span><b>${esc(c.nom)}</b><small>${esc(dateCourte(c.maj_le))} · ${c.symboles} symbole${c.symboles > 1 ? "s" : ""}${c.envoye_le ? ` · envoyé au professeur le ${esc(dateCourte(c.envoye_le))}${c.vu_le ? " · vu ✓" : ""}` : ""}</small></span><button class="btn sec" type="button" data-co="${esc(c.id)}">Ouvrir</button><button class="btn sec" type="button" data-cx="${esc(c.id)}">Supprimer</button></li>`).join("")
        : `<li class="discret">Aucun schéma sur ton compte pour l'instant.</li>`;
      for (const b of z.querySelectorAll("[data-co]")) b.onclick = () => ouvrirDuCompte(b.dataset.co);
      for (const b of z.querySelectorAll("[data-cx]")) b.onclick = () => supprimerDuCompte(b);
    } catch (e) { const z = $("cp-liste"); if (z) z.innerHTML = `<li class="discret">${esc(msgCompte(e))}</li>`; }
  }
  async function garderSurCompte(envoyer) {
    const etat = $("cp-etat"); if (etat) etat.textContent = envoyer ? "Envoi…" : "Enregistrement…";
    try {
      const r = await (await apiCompte()).schemaGarder({ id: compteId, nom: schema.titre || "Mon schéma", schema: M.cloner(schema), envoyer, message: envoyer && $("cp-msg") ? $("cp-msg").value : "" });
      compteId = r.id;
      if ($("cp-etat")) $("cp-etat").textContent = envoyer ? `Envoyé au professeur ✓ (${dateCourte(r.envoye_le)})` : "Gardé sur ton compte ✓";
      toast(envoyer ? "Schéma envoyé au professeur." : "Schéma gardé sur ton compte.");
      if (envoyer && $("cp-envoi")) $("cp-envoi").hidden = true;
      majCompte();
    } catch (e) { if ($("cp-etat")) $("cp-etat").textContent = msgCompte(e); }
  }
  async function ouvrirDuCompte(id) {
    try {
      const r = await (await apiCompte()).schemaLire(id);
      if (sim) arreterSim();
      quitterDoc(); chargerSchema(M.valider(r.schema)); compteId = r.id; sauver(); fermerDialogues(); toast(`« ${r.nom} » ouvert.`);
    } catch (e) { toast(msgCompte(e)); }
  }
  async function supprimerDuCompte(b) {   // en deux temps
    if (!b.dataset.sur) { b.dataset.sur = "1"; b.textContent = "Sûr ?"; b.classList.add("ko"); setTimeout(() => { if (b.isConnected) { delete b.dataset.sur; b.textContent = "Supprimer"; b.classList.remove("ko"); } }, 3500); return; }
    try { await (await apiCompte()).schemaSupprimer(b.dataset.cx); if (compteId === b.dataset.cx) compteId = null; majCompte(); } catch (e) { toast(msgCompte(e)); }
  }
  // le professeur ouvre le schéma qu'un élève lui a envoyé (page « Atelier schémas » de son espace) : il arrive par le navigateur
  function ouvrirRecu() {
    const o = lire("schemas:a-ouvrir"); try { localStorage.removeItem("schemas:a-ouvrir"); } catch (e) { /* rien */ }
    if (!o || !o.schema || !(Date.now() - (o.t || 0) < 600000)) return false;
    let s = null; try { s = M.valider(o.schema); } catch (e) { s = null; }
    if (!s) return false;
    const sv = lire(CLE.libre);   // le schéma en cours du professeur reste dans « Mes schémas »
    if (sv && Array.isArray(sv.pieces) && sv.pieces.length) { const L = lire(CLE.copies) || []; if (!L.some((c) => JSON.stringify(c.schema) === JSON.stringify(sv))) { L.unshift({ id: Date.now(), nom: (sv.titre || "Mon schéma") + " (gardé)", t: Date.now(), schema: sv }); garder(CLE.copies, L.slice(0, 30)); } }
    doc = { type: "libre" }; chargerSchema(s);
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => bulle(`Schéma envoyé par <b>${esc(o.de || "un élève")}</b> : « ${esc(o.nom || s.titre || "")} ». Ton schéma d'avant est dans Fichier → Mes schémas.`, 7000), 300);
    return true;
  }
  function ouvrirNomenclature() {
    if (!FO) return;
    const A = FO.analyser(schema, M.netlist(schema));
    const tN = A.nomenclature.length ? `<div class="nomen-defil"><table class="nomen"><thead><tr><th>Repère</th><th>Désignation</th><th>Caractéristiques</th><th>Colonnes</th></tr></thead><tbody>${A.nomenclature.map((r) =>
      `<tr><td>${esc(r.ref)}</td><td>${esc(r.designation)}</td><td>${esc(r.caracteristiques)}</td><td class="n">${r.colonnes.join(", ")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Aucun appareil repéré sur la feuille.</p>`;
    const tB = A.bornier.length ? `<div class="nomen-defil"><table class="nomen"><thead><tr><th>Borne</th><th>Fil</th><th>Côté armoire</th><th>Côté terrain</th></tr></thead><tbody>${A.bornier.map((r) =>
      `<tr><td>X1:${r.borne}</td><td class="n">${esc(r.fil)}</td><td class="n">${esc(r.armoire)}</td><td class="n">${esc(r.terrain)}</td></tr>`).join("")}</tbody></table></div>` : `<p class="discret">Aucun appareil du terrain (moteur, capteur, fin de course, électrovanne) relié à l'armoire.</p>`;
    $("d-nomen-c").innerHTML = `<p class="discret">${esc(schema.titre || "Schéma")} · ${A.n} colonne${A.n > 1 ? "s" : ""} de ${A.W} pas. Les numéros de fils et les colonnes sont ceux du <b>Repérage</b> (barre d'outils).</p>
      <h3>Nomenclature</h3>${tN}<h3>Bornier X1 <span class="discret">(appareils du terrain)</span></h3>${tB}
      <div class="rang"><button class="btn" type="button" id="nm-copier">Copier</button><button class="btn sec" type="button" id="nm-csv">Télécharger (CSV)</button><button class="btn sec" type="button" id="nm-imprimer">Imprimer</button></div>
      <p class="discret">« Copier » : à coller dans un tableur ou un traitement de texte. Le CSV s'ouvre dans Excel ou LibreOffice.</p>`;
    $("nm-copier").onclick = async () => { try { await navigator.clipboard.writeText(FO.tableaux(A, "\t")); toast("Nomenclature copiée."); } catch (e) { toast("La copie n'a pas marché : télécharge le CSV."); } };
    $("nm-csv").onclick = () => telecharger(new Blob(["\ufeff" + FO.tableaux(A, ";")], { type: "text/csv;charset=utf-8" }), "nomenclature-" + nomFichier() + ".csv");
    $("nm-imprimer").onclick = () => {
      $("sc-impression").innerHTML = `<h1>${esc(schema.titre || "Schéma")} : nomenclature</h1>${$("d-nomen-c").querySelectorAll(".nomen-defil")[0] ? $("d-nomen-c").querySelectorAll(".nomen-defil")[0].innerHTML : ""}${A.bornier.length ? `<h2>Bornier X1</h2>${$("d-nomen-c").querySelectorAll(".nomen-defil")[1].innerHTML}` : ""}`;
      fermerDialogues(); setTimeout(() => window.print(), 80);
    };
    ouvrirDialogue("d-nomen");
  }
  /* ---------- calcul des câbles (dimensionnement.js) : Ib, In, K, I'z, section, chute de tension, schéma unifilaire ----------
     page libre (Fichier → Calcul des câbles) : le calcul est gardé avec le schéma (schema.dim) ;
     exercice (Défis, ou lien du professeur #cables=…) : les données sont fixées, l'élève calcule et « Vérifier » ; chaque
     résultat compte à sa première réponse (« Voir le calcul » : ce qui n'est pas encore trouvé ne compte plus) ; à la fin,
     la note part dans le suivi (module schemas-dim-<id>), une fois. */
  const DI = window.SchemasDim || null;
  let dimEtat = null;
  const exoDim = (id) => { const x = DI && DI.EXERCICES.find((e) => e.id === id); return x ? { id: x.id, titre: x.titre, dim: x.dim } : null; };
  const NOMS_REC = { moteur: "Moteur", chauffage: "Chauffage", eclairage: "Éclairage", autre: "Départ" };
  function circuitsDim(E) {
    const R = E.res, L = [];
    if (E.dim.arrivee) L.push({ cle: "a", nom: "Câble d'arrivée", c: Object.assign({ recepteur: "autre", phases: 3 }, E.dim.arrivee), r: R.arrivee, arrivee: true, i: -1 });
    E.dim.departs.forEach((d, i) => L.push({ cle: d.id, nom: d.nom, c: d, r: R.departs[i], arrivee: false, i }));
    return L;
  }
  const justeDim = (k) => DI.CHAMPS.every((ch) => dimEtat.verif[k] && dimEtat.verif[k][ch.k] && dimEtat.verif[k][ch.k].ok);
  const finiDim = (k) => !!dimEtat.vu[k] || justeDim(k);
  function ouvrirDim(exo) {
    if (!DI) { toast("Le calcul des câbles n'a pas pu être chargé."); return; }
    if (exo) {
      const P = lire(CLE.dimEx(exo.id)) || {};
      dimEtat = { exo, dim: DI.valider(exo.dim), rep: P.rep || {}, premier: P.premier || {}, vu: P.vu || {}, verif: {}, debut: P.debut || Date.now(), fin: P.fin || 0, envoi: P.envoi || "", note: P.note, pts: P.pts, tot: P.tot };
    } else dimEtat = { exo: null, dim: DI.valider(schema.dim) || DI.nouveau(), rep: {}, premier: {}, vu: {}, verif: {}, ouverts: {} };
    dimEtat.res = DI.calculer(dimEtat.dim);
    if (exo) verifierDim(true);
    $("d-dim-t").textContent = exo ? "Câbles : " + exo.titre : "Calcul des câbles";
    rendreDim(); ouvrirDialogue("d-dim");
    $("d-dim-c").scrollTop = 0; directMarquer();
  }
  async function ouvrirDimLien(code) {
    if (!DI) return;
    if (!code) { ouvrirDim(); return; }
    const x = exoDim(code); if (x) { ouvrirDim(x); return; }
    try {
      const o = await decoderCode(code), d = DI.valider(o && o.d);
      if (!d || !d.departs.length) throw new Error("vide");
      const titre = String((o && o.t) || "Calcul des câbles").slice(0, 80);
      ouvrirDim({ id: "p" + hacher(JSON.stringify({ t: titre, d })), titre, dim: d, prof: true });
    } catch (e) { toast(String(code)[0] === "z" && !window.DecompressionStream ? "Ce navigateur ne sait pas lire ce lien : demande le fichier au professeur." : "Cet exercice n'a pas pu être lu (lien abîmé ?)."); }
  }
  function garderDimEx() {
    const E = dimEtat; if (!E || !E.exo) return;
    garder(CLE.dimEx(E.exo.id), { rep: E.rep, premier: E.premier, vu: E.vu, debut: E.debut, fin: E.fin, envoi: E.envoi, note: E.note, pts: E.pts, tot: E.tot });
  }
  function garderDimLibre() { if (!dimEtat || dimEtat.exo) return; if (dimEtat.dim.departs.length || dimEtat.dim.arrivee) schema.dim = M.cloner(dimEtat.dim); else delete schema.dim; sauverBientot(); }
  // l'élève : chaque champ rempli est vérifié ; la première réponse de chaque champ est gardée (elle fait la note)
  function verifierDim(silencieux) {
    const E = dimEtat; E.res = DI.calculer(E.dim);
    for (const x of circuitsDim(E)) {
      if (!x.r) continue;
      const rep = E.rep[x.cle] || {}, V = (E.verif[x.cle] = {});
      for (const ch of DI.CHAMPS) {
        const v = (V[ch.k] = DI.verifierChamp(x.r, ch.k, rep[ch.k], x.arrivee));
        if (!silencieux && v.ok !== null && !E.vu[x.cle] && !E.fin) {
          const p = (E.premier[x.cle] = E.premier[x.cle] || {});
          if (!p[ch.k]) p[ch.k] = { ok: v.ok, v: String(rep[ch.k]).slice(0, 20) };
        }
      }
    }
  }
  function finirDim() {
    const E = dimEtat; if (!E.exo || E.fin) return;
    const L = circuitsDim(E); if (!L.every((x) => finiDim(x.cle))) return;
    E.tot = L.length * DI.CHAMPS.length;
    E.pts = L.reduce((a, x) => a + DI.CHAMPS.filter((ch) => E.premier[x.cle] && E.premier[x.cle][ch.k] && E.premier[x.cle][ch.k].ok).length, 0);
    E.note = Math.round((40 * E.pts) / E.tot) / 2; E.fin = Date.now();
    const P = lire(CLE.dimProgres) || {}; if (!P[E.exo.id]) { P[E.exo.id] = { note: E.note, t: E.fin }; garder(CLE.dimProgres, P); }
    garderDimEx(); envoyerDim();
  }
  const valeursDim = (r) => (r && r.S != null ? `Ib ${nf(r.Ib, 1)} A · In ${nf(r.In)} A · K ${nf(r.K, 2)} · I'z ${nf(r.Izp, 1)} A · S ${nf(r.S)} mm² · ΔU ${nf(r.dUp, 2)} %` : "");
  function detailsDim() {
    const E = dimEtat;
    return circuitsDim(E).map((x) => {
      const p = E.premier[x.cle] || {}, n = DI.CHAMPS.filter((ch) => p[ch.k] && p[ch.k].ok).length;
      return { q: x.nom, rep: DI.CHAMPS.map((ch) => `${ch.nom} ${p[ch.k] ? p[ch.k].v + (p[ch.k].ok ? " ✓" : " ✗") : "—"}`).join(" · ") + (E.vu[x.cle] ? " (calcul vu)" : ""),
        attendu: valeursDim(x.r), bareme: DI.CHAMPS.length, pts: n, erreurs: DI.CHAMPS.length - n };
    });
  }
  async function envoyerDim() {
    const E = dimEtat; if (!E || !E.exo || !E.fin || E.envoi === "envoye" || E.envoi === "en cours") return;
    E.envoi = "en cours"; majScoreDim();
    const r = await envoyerAuSite({ module: "schemas-dim-" + E.exo.id, titre: "Atelier schémas · Câbles : " + E.exo.titre, type: "externe", score: E.note, score_max: 20,
      duree_s: Math.max(0, Math.round((E.fin - (E.debut || E.fin)) / 1000)), details: detailsDim() });
    E.envoi = r; if (E === dimEtat) { garderDimEx(); majScoreDim(); }
  }
  function majScoreDim() {
    const E = dimEtat, z = $("dim-score"); if (!z || !E.exo) return;
    const L = circuitsDim(E), justes = L.reduce((a, x) => a + DI.CHAMPS.filter((ch) => E.verif[x.cle] && E.verif[x.cle][ch.k] && E.verif[x.cle][ch.k].ok).length, 0);
    if (!E.fin) { const nf2 = L.filter((x) => finiDim(x.cle)).length; z.innerHTML = `${justes} résultat${justes > 1 ? "s" : ""} juste${justes > 1 ? "s" : ""} sur ${L.length * DI.CHAMPS.length} · ${nf2} circuit${nf2 > 1 ? "s" : ""} fini${nf2 > 1 ? "s" : ""} sur ${L.length}`; return; }
    const ENV = { envoye: "Ta note est partie chez le professeur ✓", file: "Ta note partira chez le professeur dès que le site répondra.", deconnecte: `Connecte-toi au site (<a href="../index.html">Mon espace</a>) pour que ta note arrive au professeur.`,
      expire: "Ta connexion au site a expiré : reconnecte-toi pour que ta note parte.", erreur: "Le site ne répond pas : ta note n'est pas partie.", "en cours": "Envoi de ta note…" };
    z.innerHTML = `<b>Terminé : ${nf(E.note)}/20</b> (${E.pts} résultat${E.pts > 1 ? "s" : ""} juste${E.pts > 1 ? "s" : ""} du premier coup sur ${E.tot}). ${ENV[E.envoi] || ""}`;
  }
  function voirDim(i, k) { const E = dimEtat; if (!E.exo || E.fin) return true; const c = i < 0 ? "a" : E.dim.departs[i] && E.dim.departs[i].id; return !!(E.vu[c] || (E.verif[c] && E.verif[c][k] && E.verif[c][k].ok)); }
  function recapDim() {
    const L = circuitsDim(dimEtat).filter((x) => x.r && x.r.S != null);
    if (!L.length) return "";
    return `<div class="nomen-defil"><table class="nomen"><thead><tr><th>Circuit</th><th>Ib</th><th>Protection</th><th>K</th><th>Câble (cuivre)</th><th>Iz</th><th>ΔU</th></tr></thead><tbody>${L.map((x) => { const r = x.r;
      return `<tr><td>${esc(x.nom)}</td><td class="n">${nf(r.Ib, 1)} A</td><td class="n">${nf(r.In)} A${r.prot === "fus" ? " gG" : ""}</td><td class="n">${nf(r.K, 2)}</td><td class="n">${esc(DI.conducteurs(x.c, r))} mm² · ${nf(x.c.L, 0)} m</td><td class="n">${nf(r.Iz, 1)} A</td><td class="n">${nf(r.dUp, 2)} %${r.amont ? ` (${nf(r.total, 2)} % en tout)` : ""}</td></tr>`; }).join("")}</tbody></table></div>`;
  }
  function etapesDim(x, ouvert) {
    const L = x.r ? DI.etapes(x.c, x.r, x.arrivee ? dimEtat.res.bilan : null) : [];
    return L.length ? `<details class="dim-pas" data-pas="${esc(x.cle)}"${ouvert ? " open" : ""}><summary>Le calcul pas à pas</summary><ol class="dim-et">${L.map((s) => `<li${s.ok === true ? ' class="ok"' : s.ok === false ? ' class="ko"' : ""}><b>${esc(s.t)}</b>${esc(s.f)}</li>`).join("")}</ol></details>` : "";
  }
  function resultatDim(x, ouvert) {
    const r = x.r;
    if (!r) return `<p class="discret">Ajoute des départs : le câble d'arrivée se calcule avec le bilan de leurs puissances.</p>`;
    if (r.S == null) return `<p class="dim-err">${esc(r.erreurs[0] || "Calcul impossible.")}</p>${etapesDim(x, ouvert)}`;
    return `<p class="dim-res"><b>Ib</b> ${nf(r.Ib, 1)} A · <b>In</b> ${nf(r.In)} A${r.prot === "fus" ? " gG" : ""} · <b>K</b> ${nf(r.K, 2)} · <b>I'z</b> ${nf(r.Izp, 1)} A · <b>S</b> ${nf(r.S)} mm² <span class="discret">(${esc(DI.conducteurs(x.c, r))})</span> · <b>ΔU</b> ${nf(r.dUp, 2)} %${r.amont ? ` <span class="discret">(${nf(r.total, 2)} % avec l'arrivée)</span>` : ""} <span class="ok">✓ ≤ ${nf(r.lim)} %</span></p>${etapesDim(x, ouvert)}`;
  }
  function rendreDim() {
    const E = dimEtat, exo = !!E.exo, C = $("d-dim-c"); E.res = DI.calculer(E.dim);
    const opt = (o, v) => Object.keys(o).map((k) => `<option value="${esc(k)}"${String(k) === String(v) ? " selected" : ""}>${esc(o[k])}</option>`).join("");
    const optL = (L, v, f) => L.map((x) => `<option value="${x}"${String(x) === String(v) ? " selected" : ""}>${esc(f ? f(x) : x)}</option>`).join("");
    const poses = {}; for (const p of DI.POSES) poses[p.id] = p.texte;
    const champs = (c, arr) => `<div class="dim-g">
        ${arr ? `<label>Simultanéité ks<input type="number" inputmode="decimal" data-k="ks" min="0.1" max="1" step="0.05" value="${c.ks}"></label>` : `<label>Récepteur<select data-k="recepteur">${opt(DI.RECEPTEURS, c.recepteur)}</select></label>
        <label>Alimentation<select data-k="phases">${opt({ 3: "Triphasé 400 V", 1: "Monophasé 230 V" }, c.phases)}</select></label>
        <label>Puissance (kW)<input type="number" inputmode="decimal" data-k="P" min="0" step="0.1" value="${c.P}"></label>
        ${c.recepteur === "chauffage" ? "" : `<label>cos φ<input type="number" inputmode="decimal" data-k="cos" min="0.1" max="1" step="0.01" value="${c.cos}"></label>`}
        ${c.recepteur === "moteur" ? `<label>Rendement η<input type="number" inputmode="decimal" data-k="eta" min="0.1" max="1" step="0.01" value="${c.eta}"></label>` : ""}`}
        <label>Protection<select data-k="prot">${opt(DI.PROTS, c.prot)}</select></label>
        <label>Longueur du câble (m)<input type="number" inputmode="decimal" data-k="L" min="0" step="1" value="${c.L}"></label>
        <label class="dim-pose">Façon de poser<span class="dim-pose-l"><select data-k="pose">${opt(poses, c.pose)}</select><span class="dim-ico">${DI.iconePose(c.pose)}</span></span></label>
        <label>Isolant<select data-k="isolant">${opt({ PR: "PR", PVC: "PVC" }, c.isolant)}</select></label>
        <label>Câbles côte à côte<select data-k="voisins">${optL(DI.VOISINS, c.voisins)}</select></label>
        <label>Température de l'air<select data-k="temp">${optL(DI.TEMPS, c.temp, (t) => t + " °C")}</select></label></div>`;
    const donnees = (c, arr) => `<p class="dim-donnees"><span class="dim-ico">${DI.iconePose(c.pose)}</span>${arr ? `Tous les départs ci-dessous (bilan de Boucherot), simultanéité ks = ${nf(c.ks, 2)}`
        : `${NOMS_REC[c.recepteur]} ${c.phases === 3 ? "triphasé 400\u00a0V" : "monophasé 230\u00a0V"} · ${nf(c.P, 2)}\u00a0kW${c.recepteur === "moteur" ? ` (puissance utile) · η = ${nf(c.eta, 2)}` : ""}${c.recepteur === "chauffage" ? "" : ` · cos φ = ${nf(c.cos, 2)}`}`}
        · ${c.prot === "fus" ? "fusibles gG" : "disjoncteur"} · câble de ${nf(c.L, 0)}\u00a0m · ${esc(DI.POSE[c.pose].texte.toLowerCase())} · isolant ${c.isolant} · ${c.voisins} câble${c.voisins > 1 ? "s" : ""} côte à côte · ${c.temp}\u00a0°C</p>`;
    const reponses = (k) => {
      const rep = E.rep[k] || {}, V = E.verif[k] || {}, fige = !!(E.vu[k] || E.fin);
      return `<div class="dim-rep">${DI.CHAMPS.map((ch) => { const v = V[ch.k], ok = v && v.ok;
        return `<label>${esc(ch.nom)}${ch.unite ? ` (${ch.unite})` : ""}<input inputmode="decimal" autocomplete="off" data-r="${ch.k}" value="${esc(rep[ch.k] || "")}"${v && v.ok !== null ? ` class="${ok ? "ok" : "ko"}"` : ""}${fige || ok ? " readonly" : ""}></label>`; }).join("")}</div>
        <ul class="dim-aides">${DI.CHAMPS.filter((ch) => !fige && V[ch.k] && V[ch.k].ok === false && V[ch.k].aide).map((ch) => `<li><b>${esc(ch.nom)}</b> : ${esc(V[ch.k].aide)}</li>`).join("")}</ul>`;
    };
    const carte = (x) => {
      const k = x.cle, fait = exo && finiDim(k);
      const tete = exo || x.arrivee ? `<b>${esc(x.nom)}</b>${exo ? `<span class="dim-etat">${fait ? (justeDim(k) ? "Juste ✓" : "Corrigé") : ""}</span>` : ""}`
        : `<input class="dim-nom" data-k="nom" maxlength="40" value="${esc(x.c.nom)}" aria-label="Nom du départ"><button class="btn sec dim-x" type="button" data-x="${esc(k)}" aria-label="Supprimer ce départ">×</button>`;
      const bas = !exo ? `<div class="dim-r" id="dim-r-${esc(k)}">${resultatDim(x, E.ouverts[k])}</div>`
        : reponses(k) + (E.vu[k] || E.fin || justeDim(k) ? `<div class="dim-r">${resultatDim(x, !justeDim(k))}</div>` : `<div class="dim-voir"><button class="btn-lien" type="button" data-voir="${esc(k)}">Voir le calcul</button></div>`);
      return `<section class="dim-c${fait ? " juste" : ""}" data-c="${esc(k)}"><div class="dim-t">${tete}</div>${exo ? donnees(x.c, x.arrivee) : champs(x.c, x.arrivee)}${bas}</section>`;
    };
    const nbM = exo ? 0 : DI.departsDuSchema(schema).length;
    C.innerHTML = `${exo ? `<p class="discret">Les données sont fixées. Pour chaque circuit, calcule <b>Ib</b>, le calibre <b>In</b>, le coefficient <b>K</b>, le courant <b>I'z</b>, la section <b>S</b> et la chute de tension <b>ΔU</b> (en %), puis appuie sur <b>Vérifier</b>. Chaque résultat compte à ta <b>première réponse</b>. « Voir le calcul » montre la méthode, mais ce que tu n'as pas encore trouvé ne compte plus.</p>`
        : `<p class="discret">Pour chaque départ du tableau : le courant d'emploi, la protection, la section du câble et la chute de tension (méthode de la NF C 15-100, câbles en cuivre). Ce calcul est gardé avec ton schéma.</p>`}
      <div class="dim-regle"><span><b>Ib</b>le courant que demande le récepteur</span><i>≤</i><span><b>In</b>le calibre de la protection</span><i>≤</i><span><b>Iz</b>le courant que le câble supporte sans trop chauffer</span></div>
      <details class="dim-tables"><summary>Les tableaux de la norme : poses, K1, K2, K3, sections, calibres, chute de tension</summary>${DI.tableaux()}</details>
      ${exo ? `<p class="dim-donnees"><b>Alimentation</b> : ${esc(DI.ORIGINES[E.dim.origine])} ; 400 V entre phases, 230 V entre phase et neutre.</p>`
        : `<label class="dim-or">Alimentation du tableau<select id="dim-origine">${opt(DI.ORIGINES, E.dim.origine)}</select></label>
      <label class="dim-case"><input type="checkbox" id="dim-arr"${E.dim.arrivee ? " checked" : ""}> Câble d'arrivée (du compteur ou du transformateur jusqu'au tableau)</label>`}
      ${circuitsDim(E).map(carte).join("")}
      ${exo ? `<div class="dim-barre"><button class="btn" type="button" id="dim-verifier"${E.fin ? " hidden" : ""}>Vérifier</button><span id="dim-score" aria-live="polite"></span><button class="btn sec" type="button" id="dim-recommencer">Recommencer</button></div>`
        : `<div class="rang dim-actions"><button class="btn" type="button" id="dim-ajout">Ajouter un départ</button>${nbM ? `<button class="btn sec" type="button" id="dim-moteurs">Prendre les moteurs du schéma (${nbM})</button>` : ""}${E.dim.departs.length || E.dim.arrivee ? `<button class="btn sec" type="button" id="dim-vider">Tout effacer</button>` : `<button class="btn sec" type="button" id="dim-exemple">Charger un exemple</button>`}</div>`}
      <h3>Schéma unifilaire</h3><div class="dim-uni" id="dim-uni"></div>
      <div class="rang"><button class="btn sec" type="button" id="dim-imprimer">Imprimer</button><button class="btn sec" type="button" id="dim-svg">Image SVG</button></div>
      <div id="dim-recap"></div>
      ${exo ? "" : `<details class="dim-prof"><summary>Professeur : donner ce calcul en exercice</summary>
        <p class="discret">Les élèves reçoivent les données de ces départs, pas les résultats : ils calculent, l'atelier vérifie, et leur note t'arrive dans le suivi (page « Atelier schémas » de ton espace).</p>
        <label for="dim-pt">Titre de l'exercice</label><input id="dim-pt" maxlength="80" value="${esc(schema.titre && schema.titre !== "Mon schéma" ? schema.titre : "")}" placeholder="Par exemple : le tableau de l'atelier">
        <div class="rang" style="margin-top:8px"><button class="btn" type="button" id="dim-lien">Créer le lien pour les élèves</button></div>
        <div id="dim-lien-z" hidden><input id="dim-lien-v" readonly aria-label="Lien de l'exercice"><div class="rang" style="margin-top:6px"><button class="btn sec" type="button" id="dim-copier">Copier le lien</button><a class="btn sec" id="dim-essayer" target="_blank" rel="noopener">L'essayer comme un élève</a></div></div></details>`}
      <p class="discret dim-limites">Pas dans cet outil (à vérifier à part) : le pouvoir de coupure et la longueur maximale protégée (courts-circuits), les câbles enterrés, l'aluminium, un neutre chargé par des harmoniques.</p>`;
    majUniDim(); majScoreDim();
    brancherDim();
  }
  function majUniDim() {
    const E = dimEtat, u = $("dim-uni"); if (!u) return;
    u.innerHTML = DI.unifilaire(E.dim, E.res, voirDim);
    const z = $("dim-recap"); if (z) z.innerHTML = !E.exo || E.fin ? (recapDim() ? `<h3>Récapitulatif</h3>${recapDim()}` : "") : "";
  }
  function majDim() {   // page libre : un nombre a changé → les résultats, le schéma unifilaire
    const E = dimEtat; E.res = DI.calculer(E.dim);
    for (const x of circuitsDim(E)) { const z = $("dim-r-" + x.cle); if (z) z.innerHTML = resultatDim(x, E.ouverts[x.cle]); }
    majUniDim();
  }
  function changerDim(k, t, fin) {
    const E = dimEtat; if (!E || E.exo || !t.dataset || !t.dataset.k) return;
    const f = t.dataset.k, estA = k === "a", cible = estA ? E.dim.arrivee : E.dim.departs.find((d) => d.id === k); if (!cible) return;
    let v = t.value;
    if (t.type === "number") { const n = DI.lireNombre(v); if (n == null || Number.isNaN(n)) { if (fin) t.value = cible[f]; return; } v = n; }
    const nv = estA ? DI.arrivee(Object.assign({}, cible, { [f]: v })) : DI.depart(Object.assign({}, cible, { [f]: v }));
    if (fin && t.type === "number" && Number(t.value) !== nv[f]) t.value = nv[f];
    if (JSON.stringify(nv) === JSON.stringify(cible)) return;   // la fin d'une saisie déjà prise en compte : rien à refaire (un clic en cours n'est pas perdu)
    if (estA) E.dim.arrivee = nv; else E.dim.departs[E.dim.departs.indexOf(cible)] = nv;
    garderDimLibre();
    if (f === "recepteur" || f === "phases") { const y = $("d-dim-c").scrollTop; rendreDim(); $("d-dim-c").scrollTop = y; return; }
    if (f === "pose") { const ic = t.parentNode.querySelector(".dim-ico"); if (ic) ic.innerHTML = DI.iconePose(nv.pose); }
    majDim();
  }
  function deuxTemps(b, texte, faire) {   // un bouton qui demande « Sûr ? » avant d'agir
    if (!b.dataset.sur) { const t0 = b.textContent; b.dataset.sur = "1"; b.textContent = texte; setTimeout(() => { if (b.isConnected && b.dataset.sur) { delete b.dataset.sur; b.textContent = t0; } }, 4000); return; }
    faire();
  }
  function rerendreDim() { const C = $("d-dim-c"), y = C.scrollTop; rendreDim(); C.scrollTop = y; }
  function brancherDim() {
    const E = dimEtat, C = $("d-dim-c"), on = (id, f) => { const b = $(id); if (b) b.onclick = f; };
    if (!C.dataset.branche) {
      C.dataset.branche = "1";
      C.addEventListener("input", (ev) => { const s = ev.target.closest("[data-c]"); if (!dimEtat || !s) return;
        if (dimEtat.exo && ev.target.dataset.r) { const k = s.dataset.c; (dimEtat.rep[k] = dimEtat.rep[k] || {})[ev.target.dataset.r] = ev.target.value.slice(0, 20); garderDimEx(); return; }
        if (ev.target.type === "number" || ev.target.dataset.k === "nom") changerDim(s.dataset.c, ev.target, false); });
      C.addEventListener("change", (ev) => { const s = ev.target.closest("[data-c]"); if (dimEtat && s && !dimEtat.exo) changerDim(s.dataset.c, ev.target, true); });
      C.addEventListener("toggle", (ev) => { const d = ev.target; if (dimEtat && d.dataset && d.dataset.pas) dimEtat.ouverts[d.dataset.pas] = d.open; }, true);
      C.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && ev.target.dataset && ev.target.dataset.r && $("dim-verifier") && !$("dim-verifier").hidden) { ev.preventDefault(); $("dim-verifier").click(); } });
    }
    if (!E.ouverts) E.ouverts = {};
    on("dim-imprimer", () => {
      $("sc-impression").innerHTML = `<h1>${esc(E.exo ? "Calcul des câbles : " + E.exo.titre : (schema.titre || "Schéma") + " : calcul des câbles")}</h1>${DI.unifilaire(E.dim, E.res, voirDim)}${!E.exo || E.fin ? recapDim() : ""}`;
      fermerDialogues(); setTimeout(() => { window.print(); }, 80);
    });
    on("dim-svg", () => telecharger(new Blob([DI.unifilaire(E.dim, E.res, voirDim)], { type: "image/svg+xml" }), (E.exo ? "cables-" + E.exo.id : nomFichier() + "-unifilaire") + ".svg"));
    if (E.exo) {
      on("dim-verifier", () => {
        verifierDim(false); garderDimEx(); finirDim(); rerendreDim();
        if (E.fin) toast(`Terminé : ${nf(E.note)}/20.`);
        else { const ko = C.querySelector(".dim-rep input.ko"); if (ko) ko.focus(); }
      });
      on("dim-recommencer", function () { deuxTemps(this, "Sûr ? Tout s'efface", () => {
        Object.assign(E, { rep: {}, premier: {}, vu: {}, verif: {}, fin: 0, note: undefined, pts: undefined, tot: undefined, debut: Date.now() }); garderDimEx(); rendreDim(); C.scrollTop = 0; }); });
      for (const b of C.querySelectorAll("[data-voir]")) b.onclick = () => deuxTemps(b, "Sûr ? Ce que tu n'as pas encore trouvé ne comptera plus", () => {
        E.vu[b.dataset.voir] = true; verifierDim(true); garderDimEx(); finirDim(); rerendreDim(); });
      return;
    }
    const so = $("dim-origine"); if (so) so.onchange = () => { E.dim.origine = so.value === "prive" ? "prive" : "public"; garderDimLibre(); majDim(); };
    const ca = $("dim-arr"); if (ca) ca.onchange = () => { E.dim.arrivee = ca.checked ? DI.arrivee({ L: 30, pose: "perfore", ks: 1 }) : null; garderDimLibre(); rerendreDim(); };
    on("dim-ajout", () => { let n = 1; while (E.dim.departs.some((d) => d.id === "d" + n)) n++; E.dim.departs.push(DI.depart({ id: "d" + n, nom: "Départ " + (E.dim.departs.length + 1) })); garderDimLibre(); rerendreDim(); const L = C.querySelectorAll(".dim-nom"); if (L.length) { L[L.length - 1].focus(); L[L.length - 1].select(); } });
    on("dim-moteurs", () => {
      const L = DI.departsDuSchema(schema).filter((d) => !E.dim.departs.some((x) => x.ref && x.ref === d.ref));
      if (!L.length) { toast("Les moteurs du schéma sont déjà dans la liste."); return; }
      for (const d of L) { let n = 1; while (E.dim.departs.some((x) => x.id === "d" + n)) n++; d.id = "d" + n; E.dim.departs.push(d); }
      garderDimLibre(); rerendreDim(); toast(`${L.length} moteur${L.length > 1 ? "s" : ""} ajouté${L.length > 1 ? "s" : ""} : règle leur câble.`);
    });
    on("dim-exemple", () => { E.dim = DI.valider(DI.EXEMPLE); garderDimLibre(); rerendreDim(); });
    on("dim-vider", function () { deuxTemps(this, "Sûr ? Tout s'efface", () => { E.dim = DI.nouveau(); garderDimLibre(); rendreDim(); }); });
    for (const b of C.querySelectorAll("[data-x]")) b.onclick = () => deuxTemps(b, "Sûr ?", () => { E.dim.departs = E.dim.departs.filter((d) => d.id !== b.dataset.x); garderDimLibre(); rerendreDim(); });
    on("dim-lien", async () => {
      if (!E.dim.departs.length) { toast("Ajoute d'abord des départs."); return; }
      if (circuitsDim(E).some((x) => !x.r || x.r.S == null)) { toast("Un circuit n'a pas de solution : corrige-le avant de le donner."); return; }
      const titre = ($("dim-pt").value || "").trim().slice(0, 80) || "Calcul des câbles";
      const url = location.origin + location.pathname + "#cables=" + (await encoderCode({ t: titre, d: E.dim }, true));
      $("dim-lien-v").value = url; $("dim-essayer").href = url; $("dim-lien-z").hidden = false; $("dim-lien-v").select();
    });
    on("dim-copier", async () => { try { await navigator.clipboard.writeText($("dim-lien-v").value); toast("Lien copié : colle-le dans Pronote, l'ENT ou un message."); } catch (e) { $("dim-lien-v").select(); toast("Copie le lien sélectionné."); } });
  }
  function telecharger(blob, nom) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const nomFichier = () => (schema.titre || "schema").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 50) || "schema";
  async function actionFichier(f) {
    if (f === "preparer") { prepC = null; ouvrirPreparation(); return; }
    if (f === "completer") { ouvrirPrepC(); return; }
    if (f === "nomenclature") { ouvrirNomenclature(); return; }
    if (f === "cables") { ouvrirDim(); return; }
    if (f === "nouveau") { if (sim) arreterSim(); quitterDoc(); chargerSchema(M.nouveau()); fermerDialogues(); if (history.replaceState) history.replaceState(null, "", location.pathname); return; }
    if (f === "json") { telecharger(new Blob([JSON.stringify(schema, null, 1)], { type: "application/json" }), nomFichier() + ".json"); toast("Fichier exporté."); return; }
    if (f === "copie") { const nom = ($("f-nom").value || schema.titre || "Mon schéma").trim().slice(0, 80); const L = lire(CLE.copies) || []; L.unshift({ id: Date.now(), nom, t: Date.now(), schema: M.cloner(schema) }); garder(CLE.copies, L.slice(0, 30)); toast("Copie enregistrée."); ouvrirFichier(); return; }
    if (f === "svg") { const t = await svgExport(); telecharger(new Blob([t], { type: "image/svg+xml" }), nomFichier() + ".svg"); return; }
    if (f === "png") { try { const b = await pngExport(); telecharger(b, nomFichier() + ".png"); } catch (e) { toast("L'image n'a pas pu être faite."); } return; }
    if (f === "imprimer") { $("sc-impression").innerHTML = await svgExport(); fermerDialogues(); setTimeout(() => { window.print(); }, 80); }
  }
  $("sc-import").addEventListener("change", (e) => {
    const fi = e.target.files && e.target.files[0]; if (!fi) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(String(r.result));
        if (o && o.type === "depannage-prof" && o.code) { fermerDialogues(); ouvrirCodeProf(String(o.code)); e.target.value = ""; return; }
        if (o && o.type === "complet-prof" && o.code) { fermerDialogues(); ouvrirCodeCplt(String(o.code)); e.target.value = ""; return; }
        const s = M.valider(o);
        if (sim) arreterSim();
        quitterDoc();
        chargerSchema(s); fermerDialogues(); toast(`« ${s.titre} » ouvert.`);
      } catch (x) { toast(x && x.message ? x.message : "Ce fichier n'a pas pu être lu."); }
      e.target.value = "";
    };
    r.readAsText(fi);
  });

  /* ---------- export : SVG autonome (couleurs claires) avec cartouche ---------- */
  const CSS_EXPORT = SY.CSS_FEUILLE;   // les styles de la feuille (symboles.js), aussi pour la page « En direct » du professeur
  let logoURI = null;
  async function logo() {
    if (logoURI !== null) return logoURI;
    try { const t = await (await fetch("../assets/logo-papara.svg")).text(); logoURI = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(t))); } catch (e) { logoURI = ""; }
    return logoURI;
  }
  async function svgExport() {
    const s = schema, net = M.netlist(s), b = M.bornesDe(s);
    const fo = folio && FO ? 26 : 0;   // le repérage ajoute la bande des colonnes en haut
    const x0 = b[0] * G - 60, y0 = b[1] * G - 34 - fo, w = Math.max(560, (b[2] - b[0]) * G + 110), h = (b[3] - b[1]) * G + 70 + fo;
    const L = await logo(), ch = 46, yc = y0 + h + 8;
    const date = new Date().toLocaleDateString("fr-FR");
    const qui = QUI !== "local" ? QUI : "";
    const cart = `<rect class="ca-l" x="${x0}" y="${yc}" width="${w}" height="${ch}"/>${L ? `<image href="${L}" x="${x0 + 6}" y="${yc + 5}" width="45" height="36"/>` : ""}
      <text class="ca" x="${x0 + 58}" y="${yc + 18}" font-size="10">Lycée Tuianu Le Gayic · Papara · Atelier schémas</text>
      <text class="ca" x="${x0 + 58}" y="${yc + 35}" font-size="14" font-weight="700">${esc(s.titre || "Schéma")}</text>
      <text class="ca" x="${x0 + w - 8}" y="${yc + 18}" font-size="10" text-anchor="end">${esc(qui)}</text>
      <text class="ca" x="${x0 + w - 8}" y="${yc + 35}" font-size="10" text-anchor="end">${esc(date)}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - 10} ${y0 - 10} ${w + 20} ${h + ch + 28}" width="${w + 20}" height="${h + ch + 28}"><style>${CSS_EXPORT}${fo ? FO.CSS : ""}</style><rect x="${x0 - 10}" y="${y0 - 10}" width="${w + 20}" height="${h + ch + 28}" fill="#fff"/>${svgSchema(s, net, null, {})}${fo ? FO.svg(s, FO.analyser(s, net), G) : ""}${cart}</svg>`;
  }
  async function pngExport() {
    const t = await svgExport();
    const m = /width="([\d.]+)" height="([\d.]+)"/.exec(t), W = +m[1], H = +m[2], k = 2;
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(t);
    await img.decode();
    const c = document.createElement("canvas"); c.width = Math.round(W * k); c.height = Math.round(H * k);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((ok, ko) => c.toBlob((bl) => (bl ? ok(bl) : ko(new Error("png"))), "image/png"));
  }

  /* ---------- aide ---------- */
  // les symboles expliqués dans l'aide : [type, paramètres, nom, référence NF EN 60617, options de dessin]
  const SYMBOLES_AIDE = [
    ["contact_no", {}, "Contact à fermeture (NO)", "07-02-01"], ["contact_nf", {}, "Contact à ouverture (NF)", "07-02-03"],
    ["bp_no", {}, "Bouton poussoir (retour automatique)", "07-07-02"],
    ["arret_urgence", {}, "Arrêt d'urgence : coup de poing, accrochage, ouverture positive", "07-07-06"],
    ["selecteur", {}, "Sélecteur (commande rotative)", "02-13-04"], ["interrupteur", {}, "Interrupteur (commande manuelle)", "07-07-01"],
    ["fdc_no", {}, "Fin de course (interrupteur de position)", "07-08-01, 07-08-02"],
    ["capteur", {}, "Détecteur de proximité 2 fils", "07-20-02 · losange 02-13-06"],
    ["capteur3", { type: "PNP" }, "Détecteur 3 fils (inductif : bobine ; capacitif : condensateur)", "07-19-02"],
    ["contact_tno", {}, "Contact temporisé travail : retardé quand la bobine est alimentée", "07-05-01, 07-05-03", { sorteTempo: "travail" }],
    ["contact_tno", {}, "Contact temporisé repos : retardé quand on la coupe", "07-05-02, 07-05-04", { sorteTempo: "repos" }],
    ["contact_th_nf", {}, "Contact du relais thermique", "02-13-25"],
    ["bobine", {}, "Bobine de contacteur ou de relais", "07-15-01"], ["tempo_travail", {}, "Bobine de relais temporisé travail", "07-15-08"],
    ["tempo_repos", {}, "Bobine de relais temporisé repos", "07-15-07"], ["poles", {}, "Contacts principaux d'un contacteur", "07-13-02"],
    ["sectionneur", {}, "Sectionneur porte-fusibles", "07-21-08, 07-13-06"], ["disj_moteur", {}, "Disjoncteur moteur (magnétique et thermique)", "07-13-05"],
    ["thermique", {}, "Relais thermique", "07-15-21"], ["fusible", {}, "Fusible", "07-21-01"], ["voyant", {}, "Voyant", "08-10-01"],
    ["electrovanne", {}, "Bobine d'électrovanne (distributeur)", "07-15-01"], ["moteur", {}, "Moteur triphasé", "06-04-01"], ["transfo", {}, "Transformateur", "06-09-01"], ["potentiometre", {}, "Potentiomètre", "04-01-07"]
  ];
  function ouvrirAide() {
    const mini = (s) => apercu(s, 130);
    const b1 = X.plan("aide"); b1.p("bp_no", 2, 3, "S1"); b1.p("voyant", 10, 4, "H1"); b1.f([2, 6], [2, 8], [10, 8], [10, 7]);
    const b2 = X.plan("aide"); b2.f([0, 4], [16, 4]); b2.f([8, 0], [8, 10]); b2.f([0, 14], [16, 14]); b2.f([8, 14], [8, 20]);
    $("d-aide-c").innerHTML = `<div class="aide-g">
        <figure>${mini(b1.s)}<figcaption><b>Tirer un fil.</b> Pose le doigt (ou la souris) sur une borne et glisse jusqu'à une autre borne. Le fil se trace à angles droits. Les ronds orange sont les bornes encore libres.</figcaption></figure>
        <figure>${mini(b2.s)}<figcaption><b>Croiser ou relier ?</b> En haut, deux fils qui se croisent : <b>pas reliés</b>. En bas, un fil qui arrive sur un autre : <b>reliés</b>, avec un point.</figcaption></figure>
        <figure><div style="font-size:.9rem;line-height:1.55"><span style="color:var(--p-l1)">━━</span> L1, L ou +24 V &nbsp; <span style="color:var(--p-l2)">━━</span> L2 &nbsp; <span style="color:var(--p-l3)">━━</span> L3<br><span style="color:var(--p-n)">━━</span> neutre N ou 0 V &nbsp; <span style="color:var(--p-pe)">━━</span> terre PE<br><span>━━</span> pas de tension<br><span style="display:inline-block;width:22px;height:12px;background:var(--sc-bobine);border:1.5px solid var(--ink);vertical-align:-2px"></span> bobine alimentée</div><figcaption><b>Simuler.</b> Appuie sur <b>Simuler</b>, puis sur les boutons du schéma : un bouton poussoir reste enfoncé tant que tu appuies. Double-clic (ou 📌 dans la liste) : il reste appuyé.</figcaption></figure>
      </div>
      <h3 style="margin-top:14px">Les outils</h3>
      <table class="raccourcis">
        <tr><td><b>Choisir</b> <span class="kbd">V</span></td><td>Clique sur un symbole pour le régler ; glisse-le pour le déplacer (ses fils suivent). Glisse dans le vide pour en choisir plusieurs (au doigt : appui long, puis glisse).</td></tr>
        <tr><td><b>Fil</b> <span class="kbd">F</span></td><td>Clique ou glisse de borne en borne. Un clic dans le vide fait un coin, un double-clic finit le fil là.</td></tr>
        <tr><td><b>Feuille</b> <span class="kbd">H</span></td><td>Déplace la feuille. Aussi : bouton droit, ou <span class="kbd">Espace</span> + glisser. Au doigt : glisser dans le vide ; deux doigts pour zoomer.</td></tr>
        <tr><td><span class="kbd">R</span></td><td>Tourner d'un quart de tour (aussi avant de poser un symbole).</td></tr>
        <tr><td><span class="kbd">Maj</span> + clic</td><td>Poser plusieurs fois le même symbole ; ajouter à ce qui est déjà choisi.</td></tr>
        <tr><td><span class="kbd">Suppr</span></td><td>Supprimer ce qui est choisi.</td></tr>
        <tr><td><span class="kbd">Ctrl</span> + <span class="kbd">Z</span> / <span class="kbd">Y</span></td><td>Annuler / rétablir.</td></tr>
        <tr><td><span class="kbd">Ctrl</span> + <span class="kbd">D</span></td><td>Dupliquer (copier-coller : <span class="kbd">Ctrl</span> + <span class="kbd">C</span> / <span class="kbd">V</span>).</td></tr>
        <tr><td><span class="kbd">Flèches</span></td><td>Déplacer ce qui est choisi d'un carreau.</td></tr>
        <tr><td>Molette, <span class="kbd">+</span> <span class="kbd">−</span> <span class="kbd">0</span></td><td>Zoomer, dézoomer, tout voir.</td></tr>
        <tr><td><span class="kbd">Échap</span></td><td>Arrêter le fil en cours ou l'outil, ne plus rien choisir.</td></tr>
      </table>
      <h3 style="margin-top:14px">L'automate et le variateur</h3>
      <p class="discret"><b>L'automate (API)</b> s'alimente en 24 V continu. Une entrée (%I0.0…) vaut 1 quand elle reçoit le +24 V (le COM des entrées va au 0 V). Ses sorties à relais (%Q0.0…) ferment un contact entre leur commun (C0, C1) et la sortie : on y branche les bobines, les voyants, ou les entrées d'un variateur. Clique sur l'automate, puis <b>Programmer</b> : en <b>Ladder</b> (des contacts et des bobines) ou en <b>GRAFCET</b> (des étapes et des transitions). En simulation, clique sur l'automate pour voir son programme en direct. Le bit système <b>%S6</b> est une horloge (1 pendant une demi-seconde, 0 pendant la suivante) : « H2 si %S6 » fait clignoter un voyant.</p>
      <p class="discret"><b>Le variateur</b> reçoit le réseau sur L1, L2, L3 et fait tourner le moteur branché sur U, V, W. LI1 (marche avant) et LI2 (marche arrière) s'activent avec son +24V ; la vitesse vient de AI1 (0-10 V : potentiomètre ou sortie AQ0 d'un automate), de sa molette, ou des vitesses présélectionnées (LI3, LI4). Il accélère et ralentit suivant ses rampes (ACC, DEC).</p>
      <h3 style="margin-top:14px">La partie opérative et les capteurs 3 fils</h3>
      <p class="discret"><b>Le chariot</b>, <b>la cuve</b> et <b>le tapis</b> (catégorie « Partie opérative ») montrent la machine elle-même. On choisit le moteur qui l'entraîne et les repères de ses capteurs : en simulation, le chariot roule et actionne tout seul ses fins de course ; l'eau monte, descend et fait basculer les interrupteurs de niveau (LSL : niveau bas, LSH : niveau haut) ; les caisses du tapis passent devant la cellule, qui les voit une par une : pour les compter, il faut un compteur dans l'automate. <b>Le tapis de tri</b> a en plus un aiguillage : un volet manœuvré par un vérin (dessiné selon l'ISO 1219, avec son distributeur 4/2). Quand la bobine de l'électrovanne (YV) est alimentée, la tige sort et le volet envoie la caisse dans le bac 2 ; sinon, elle tombe dans le bac 1. Pendant la simulation, « Bloquer la tige » (carte du tapis) simule une panne du vérin. Si rien n'arrête le moteur, le chariot force contre la butée (le moteur chauffe) ou la cuve déborde.</p>
      <p class="discret"><b>Les systèmes du labo</b> (même catégorie) : <b>la barrière levante</b> (vue de dessus) a deux fins de course (levée, baissée) et deux boucles de détection : amont, devant la lisse, et aval, après elle ; « Une voiture arrive » (panneau de simulation) en envoie une, qui attend que la lisse soit levée. La lisse ne doit jamais descendre sur une voiture. <b>Le monte-charge</b> a un capteur à chaque niveau, un capteur de ralentissement avant chaque niveau et un contact de porte (actionné porte fermée) ; avec un variateur, la cabine doit arriver en petite vitesse, et jamais bouger porte ouverte. <b>La station de pompage</b> a trois pompes (P1 débite deux fois plus que P2 ou P3) et quatre électrodes de niveau (10, 30, 70 et 90 %) : l'eau qui touche le bout d'une électrode ferme son contact.</p>
      <p class="discret"><b>Le capteur 3 fils</b> se branche comme dans les machines : BN (marron) au +24 V, BU (bleu) au 0 V, et BK (noir), sa sortie, sur une entrée de l'automate. Un capteur PNP donne du +24 V sur BK quand il détecte ; un NPN donne du 0 V (la charge va alors du +24 V à BK).</p>
      <h3 style="margin-top:14px">Le voltmètre et le dépannage</h3>
      <p class="discret"><b>Chronogramme</b> (pendant la simulation) : une ligne par élément, au fil du temps — boutons et capteurs (1 = actionné), bobines (1 = alimentée), contacts temporisés (1 = fermé), voyants, vitesse et couplage des moteurs, étapes du GRAFCET, fréquence du variateur, position du chariot, niveau de la cuve. ${DOIGT ? "Touche" : "Clique sur"} le tracé pour poser un repère : l'écart de temps avec le curseur s'affiche (pratique pour une temporisation). « Lignes » choisit ce qui est tracé, « Image » l'enregistre pour un compte rendu.</p>
      <p class="discret">Pendant la simulation, le bouton <b>Voltmètre</b> remplace « Fil » dans la barre d'outils. ${DOIGT ? "Touche" : "Clique sur"} une borne pour la pointe <b style="color:#e03131">rouge</b>, puis une autre pour la pointe <b>noire</b> (COM) : l'écran donne la tension entre les deux, et la suit quand le schéma change (appuie sur S2 en gardant les pointes). En continu, le signe dit dans quel sens tu mesures (−24 V : pointes inversées). Comme un vrai voltmètre, il « voit à travers » une bobine ou un voyant : derrière un contact ouvert, on retrouve le neutre.</p>
      <p class="discret"><b>Défaut d'isolement et schémas de liaison à la terre</b> : en simulation, la carte « Défaut d'isolement » fait toucher une phase à la carcasse d'un moteur (⚡ U, V ou W). Ce qui se passe dépend du réseau (réglage « Schéma de liaison à la terre ») : en <b>TT</b>, le courant de défaut (environ 8 A) ne fait pas couper les fusibles : il faut un <b>différentiel</b> en amont, sinon la carcasse reste à 153 V ; en <b>TN-S</b>, c'est un court-circuit, la protection coupe ; en <b>IT</b>, le premier défaut ne coupe rien et n'est pas dangereux, le <b>contrôleur d'isolement</b> le signale, le deuxième (sur une autre phase) est un court-circuit. Une carcasse qui n'est pas reliée au PE est toujours dangereuse.</p>
      <p class="discret"><b>Ohmmètre et consignation</b> : l'ohmmètre mesure une résistance (une bobine : quelques centaines d'ohms ; un contact fermé : 0 Ω ; un contact ouvert ou un fil coupé : OL, l'infini), <b>seulement hors tension</b>. Avant, on consigne (carte « Consignation » du panneau) : <b>séparer</b> (couper l'alimentation), <b>condamner</b> (le cadenas), <b>vérifier l'absence de tension</b> au voltmètre (0 V là où il y avait une tension). Une mesure à l'ohmmètre sans consigner est une <b>faute de sécurité</b>. Hors tension, on peut enfoncer un contacteur à la main (✋) pour mesurer ses pôles. Mesurée en place, une bobine se lit en parallèle avec ce qui la touche.</p>
      <p class="discret"><b>Pince</b> (pendant la simulation, à côté du Voltmètre) : ${DOIGT ? "touche" : "clique sur"} un fil pour lire le courant qui le traverse, ou un appareil (moteur, bobine…) pour le courant de chacune de ses bornes. Les trois phases d'un moteur prises ensemble donnent 0 A : il faut pincer <b>un seul</b> fil. Au démarrage direct, le moteur tire près de 6 fois son courant nominal (In) ; en marche, un peu moins que In. La ligne « Pince » du chronogramme trace la mesure.</p>
      <p class="discret"><b>Lecture de schéma</b> (fenêtre « Défis », en bas) : une question sur le schéma (« Clique sur le contact d'auto-maintien »…), tu réponds en cliquant sur l'appareil. Deux essais par question ; après deux erreurs, la bonne réponse est entourée en vert. Ta note sur 20 part dans ton suivi si tu es connecté(e).</p>
      <p class="discret"><b>Dépannage</b> (fenêtre « Défis ») : un schéma juste, avec une panne cachée au hasard (un fil coupé, un contact qui ne conduit plus, une bobine, un voyant ou un fusible coupé). Les fils ne sont plus en couleur : on essaie, on mesure pour trouver où la tension s'arrête, puis « Désigner la panne ». La méthode : pointe noire sur le neutre (ou le 0 V), pointe rouge de borne en borne en partant de la phase ; ou bien les deux pointes aux bornes d'un même élément (un contact fermé qui conduit donne 0 V).</p>
      <p class="discret"><b>Dépannage du professeur</b> : ton professeur peut te donner un lien (ou un fichier, à ouvrir avec Fichier → Ouvrir un fichier). Toute la classe a la même panne, et ta note sur 20 lui est envoyée : connecte-toi au site <b>avant</b> de commencer. Chaque mesure au-delà de celles qui sont gratuites et chaque mauvaise désignation enlèvent des points ; reposer une pointe là où elle est déjà ne compte pas.</p>
      <p class="discret"><b>Ton suivi</b> : si tu es connecté(e) au site (Mon espace), chaque défi réussi et chaque panne trouvée partent dans ton suivi : ton professeur les voit. Un défi réussi du premier coup, sans indice, vaut 20 ; chaque essai raté enlève 2 points, l'indice 3 (jamais moins de 10). Ces notes ne comptent pas dans ta moyenne.</p>
      <p class="discret"><b>Professeur</b> : Fichier → <b>Préparer un dépannage</b> sur le schéma ouvert. Tu choisis l'élément en panne, la consigne et le barème, puis tu copies le lien ; les notes arrivent dans l'espace professeur (l'espace de la classe, page « Dépannages »).</p>
      <h3 style="margin-top:14px">Lire les symboles</h3>
      <p class="discret">Les symboles suivent la norme <b>NF EN 60617</b> (le numéro de chaque symbole est noté dessous). Ce qui compte, c'est le petit signe à gauche du contact : il dit <b>qui l'actionne</b>.</p>
      <div class="sym-g">${SYMBOLES_AIDE.map(([t, p, nom, ref, o]) => `<figure>${SY.icone(t, p, o)}<figcaption>${esc(nom)}<small>${esc(ref)}</small></figcaption></figure>`).join("")}</div>
      <h3 style="margin-top:14px">Les repères</h3>
      <p class="discret"><b>Repérage</b> (barre d'outils) : comme sur un vrai folio, des colonnes numérotées en haut de la feuille, un numéro sur chaque fil (les fils reliés entre eux ont le même numéro ; L, N, +24, 0V, PE et L1, L2, L3 gardent leur nom) et, sous chaque bobine, ses contacts avec la colonne où ils sont (« 13-14 NO /4 » : le contact 13-14 est dans la colonne 4). Près de chaque contact, « /2 » : sa bobine est dans la colonne 2. <b>Fichier → Nomenclature et bornier</b> : la liste des appareils et le bornier X1, à copier, télécharger ou imprimer.</p>
      <p class="discret"><b>Fichier → Calcul des câbles</b> : pour chaque départ du tableau (les moteurs du schéma, du chauffage, de l'éclairage…), le courant d'emploi Ib, le calibre de la protection, le coefficient K, la section du câble et la chute de tension, pas à pas, avec les tableaux de la norme et le schéma unifilaire. Trois exercices sont dans <b>Défis</b> ; le professeur peut donner son propre calcul en exercice (un lien).</p>
      <p class="discret">Une bobine et ses contacts portent le <b>même repère</b> (KM1) : c'est comme ça que la simulation sait quels contacts bougent quand KM1 est alimenté. Les numéros des bornes suivent les règles : 13-14 et 43-44 pour les contacts à fermeture, 21-22 et 31-32 pour les contacts à ouverture, 95-96 et 97-98 pour le relais thermique, 55-56 et 67-68 pour les contacts temporisés, A1-A2 pour les bobines.</p>`;
    ouvrirDialogue("d-aide");
    garder(CLE.aide, 1);
  }

  /* =====================================================================
     PALETTE, BARRE D'OUTILS, BULLES
     ===================================================================== */
  const PALETTE = [
    { cat: "alim", items: [{ type: "reseau", nom: "Réseau 3~" }, { type: "alim", p: { pot: "L" }, nom: "Phase L" }, { type: "alim", p: { pot: "N" }, nom: "Neutre N" }, { type: "alim", p: { pot: "+24" }, nom: "+24 V" }, { type: "alim", p: { pot: "0V" }, nom: "0 V" }, { type: "alim", p: { pot: "PE" }, nom: "Terre PE" }, { type: "transfo", nom: "Transfo" }] },
    { cat: "prot", items: [{ type: "fusible", nom: "Fusible" }, { type: "sectionneur", nom: "Sectionneur" }, { type: "disjoncteur", p: { poles: 2 }, nom: "Disjoncteur 2P" }, { type: "disjoncteur", p: { poles: 3 }, nom: "Disjoncteur 3P" }, { type: "disj_moteur", nom: "Disj. moteur" }, { type: "thermique", nom: "Relais thermique" }, { type: "differentiel", p: { poles: 4 }, nom: "Différentiel" }, { type: "cpi", nom: "Contrôleur d'isolement" }] },
    { cat: "cmd", items: [{ type: "bp_no", nom: "BP marche" }, { type: "bp_nf", nom: "BP arrêt" }, { type: "arret_urgence", nom: "Arrêt d'urgence" }, { type: "selecteur", nom: "Sélecteur" }, { type: "interrupteur", nom: "Interrupteur" }, { type: "fdc_no", nom: "Fin de course NO" }, { type: "fdc_nf", nom: "Fin de course NF" }, { type: "capteur", nom: "Capteur" }, { type: "capteur3", p: { type: "PNP" }, nom: "Capteur 3 fils PNP" }, { type: "capteur3", p: { type: "NPN" }, nom: "Capteur 3 fils NPN" }] },
    { cat: "rel", items: [{ type: "bobine", nom: "Bobine KM" }, { type: "poles", nom: "Pôles KM" }, { type: "contact_no", nom: "Contact NO" }, { type: "contact_nf", nom: "Contact NF" }, { type: "relais", nom: "Relais KA" }, { type: "tempo_travail", nom: "Tempo. travail" }, { type: "tempo_repos", nom: "Tempo. repos" }, { type: "contact_tno", nom: "Contact tempo. NO" }, { type: "contact_tnf", nom: "Contact tempo. NF" }, { type: "contact_th_nf", nom: "Thermique 95-96" }, { type: "contact_th_no", nom: "Thermique 97-98" }] },
    { cat: "rec", items: [{ type: "voyant", p: { couleur: "vert" }, nom: "Voyant" }, { type: "electrovanne", nom: "Électrovanne" }, { type: "moteur", nom: "Moteur 3~" }, { type: "moteur6", nom: "Moteur 6 bornes" }] },
    { cat: "api", items: [{ type: "automate", nom: "Automate (API)" }, { type: "variateur", nom: "Variateur" }, { type: "potentiometre", nom: "Potentiomètre" }] },
    { cat: "po", items: [{ type: "chariot", nom: "Chariot sur rail" }, { type: "cuve", nom: "Cuve et pompe" }, { type: "tapis", nom: "Tapis et caisses" }, { type: "tri", nom: "Tapis de tri (vérin)" },
      { type: "barriere", nom: "Barrière levante" }, { type: "montecharge", nom: "Monte-charge" }, { type: "station", nom: "Station de pompage" }] }
  ];
  const ITEMS = {};
  function construirePalette() {
    let h = `<p class="pal-astuce">${DOIGT ? "Touche un symbole, puis touche la feuille à l'endroit où le poser." : "Choisis un symbole, puis clique sur la feuille. Tu peux aussi le glisser."}</p>`;
    PALETTE.forEach((c, ci) => {
      const cat = M.CATS.find((x) => x.id === c.cat);
      h += `<div class="pal-cat"><h3>${esc(cat.nom)}</h3><div class="pal-g">${c.items.map((it, i) => { const k = ci + "-" + i; ITEMS[k] = Object.assign({ k }, it); return `<button class="pal-i" type="button" data-k="${k}" title="${esc(M.TYPES[it.type].nom)}" aria-pressed="false">${SY.icone(it.type, it.p)}<span>${esc(it.nom)}</span></button>`; }).join("")}</div></div>`;
    });
    $("sc-palette").innerHTML = h;
    for (const b of document.querySelectorAll(".pal-i")) {
      b.addEventListener("pointerdown", (e) => {
        if (sim) return;
        const it = Object.assign({}, ITEMS[b.dataset.k]); delete it.rot;
        if (e.pointerType !== "mouse") return;    // au doigt : un simple toucher choisit le symbole
        const sx = e.clientX, sy = e.clientY;
        let glisse = false;
        const bougeP = (ev) => {
          if (!glisse && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) { glisse = true; choisirOutil("placer", it); }
          if (glisse) { const r = svg.getBoundingClientRect(); if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) { curseur = grilleDe(pointMonde(ev)); rendre(); } }
        };
        const fin = (ev) => {
          document.removeEventListener("pointermove", bougeP); document.removeEventListener("pointerup", fin);
          if (!glisse) return;
          const r = svg.getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) placer(it, grilleDe(pointMonde(ev)));
          b.dataset.glisse = "1"; setTimeout(() => delete b.dataset.glisse, 50);
        };
        document.addEventListener("pointermove", bougeP); document.addEventListener("pointerup", fin);
      });
      b.addEventListener("click", () => {
        if (sim || b.dataset.glisse) return;
        const it = Object.assign({}, ITEMS[b.dataset.k]);
        if (outil === "placer" && aPlacer && aPlacer.k === it.k) { choisirOutil("fleche"); return; }
        choisirOutil("placer", it); fermerPalette();
      });
    }
  }
  function fermerPalette() { document.body.classList.remove("pal-ouverte"); }
  $("sc-voile").addEventListener("click", fermerPalette);
  const ACTIONS = { palette: () => document.body.classList.toggle("pal-ouverte"), fichier: ouvrirFichier, exemples: ouvrirExemples, defis: ouvrirDefis, aide: ouvrirAide,
    tourner, supprimer, annuler, refaire, moins: () => zoomCentre(1 / 1.25), plus: () => zoomCentre(1.25), ajuster: () => ajusterVue(), simuler: basculerSim,
    chrono: () => { if (sim) CH.basculer(); }, folio: () => { if (FO) basculerFolio(); } };
  { const b = document.querySelector('#sc-barre [data-a="folio"]'); if (b) { b.setAttribute("aria-pressed", String(folio)); if (!FO) b.hidden = true; } }
  for (const b of document.querySelectorAll("#sc-barre [data-a]")) b.addEventListener("click", () => ACTIONS[b.dataset.a]());
  for (const b of document.querySelectorAll("#sc-barre [data-o]")) b.addEventListener("click", () => choisirOutil(b.dataset.o));
  function majBoutons() {
    const q = (a) => document.querySelector(`#sc-barre [data-a="${a}"]`);
    q("annuler").disabled = !!sim || hpos <= 0; q("refaire").disabled = !!sim || hpos >= histo.length - 1;
    q("tourner").disabled = !!sim || (!sel.size && outil !== "placer"); q("supprimer").disabled = !!sim || (!sel.size && !brouillon);
    for (const o of ["fil"]) document.querySelector(`#sc-barre [data-o="${o}"]`).disabled = !!sim;
    document.querySelector('#sc-barre [data-o="volt"]').disabled = !sim;
    { const p = document.querySelector('#sc-barre [data-o="pince"]'); if (p) p.disabled = !sim; }
    { const p = document.querySelector('#sc-barre [data-o="ohm"]'); if (p) p.disabled = !sim; }
  }
  let tBulle = 0;
  function bulle(html, ms) {
    const z = $("sc-bulle"); clearTimeout(tBulle);
    if (!html) { z.innerHTML = ""; return; }
    z.innerHTML = `<div class="sc-bulle">${html}</div>`;
    if (ms) tBulle = setTimeout(() => { z.innerHTML = ""; }, ms);
  }
  function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
  function majVide() {
    const v = $("sc-vide"), vide = !schema.pieces.length && !schema.fils.length && !sim && outil !== "placer";
    if (vide && !v.innerHTML) {
      v.innerHTML = `<div><p><b>La feuille est vide.</b></p><p>Choisis un symbole dans la liste ${window.innerWidth <= 980 ? "(bouton <b>Symboles</b>)" : "à gauche"}, puis clique sur la feuille. Ou pars d'un schéma tout fait :</p><div class="rang" style="justify-content:center"><button class="btn" type="button" data-v="exemples">Exemples</button><button class="btn" type="button" data-v="defis">Défis</button><button class="btn sec" type="button" data-v="aide">Comment ça marche</button></div></div>`;
      for (const b of v.querySelectorAll("[data-v]")) b.onclick = () => ACTIONS[b.dataset.v]();
    }
    v.hidden = !vide;
  }

  /* ---------- démarrage ---------- */
  garder("schemas:nbdefis", X.DEFIS.length);   // lu par le tableau de bord du site (assets/app.js) : « n / 15 défis réussis »
  construirePalette();
  if (session && session.nom) $("sc-qui").textContent = session.nom;
  new ResizeObserver(() => appliquerVue()).observe(vueEl);
  function depart() {
    const h = location.hash.replace(/^#/, ""), m = /^(defi|exemple|depannage|lecture)=([\w-]+)$/.exec(h), mp = /^panne=([\w-]+)$/.exec(h), mc = /^complet=([\w-]+)$/.exec(h);
    const mk = /^cables(?:=([\w-]+))?$/.exec(h);
    if (mk) { departSans(); setTimeout(() => ouvrirDimLien(mk[1]), 60); return; }
    if (mp) { ouvrirCodeProf(mp[1], true).then((ok) => { if (!ok) departSans(); }); return; }
    if (mc) { ouvrirCodeCplt(mc[1], true).then((ok) => { if (!ok) departSans(); }); return; }
    if (h === "ouvrir" && ouvrirRecu()) return;
    if (m && m[1] === "defi" && defiParId(m[2])) { ouvrirDefi(m[2], true); return; }
    if (m && m[1] === "depannage" && depParId(m[2])) { ouvrirDepannage(m[2], true); return; }
    if (m && m[1] === "lecture" && lectureParId(m[2])) { ouvrirLecture(m[2], true); return; }
    if (m && m[1] === "exemple" && X.EXEMPLES.some((e) => e.id === m[2])) { doc = { type: "libre" }; chargerSchema(X.EXEMPLES.find((e) => e.id === m[2]).construire()); return; }
    const d = lire(CLE.dernier);
    if (d && d.type === "defi" && defiParId(d.defi)) { ouvrirDefi(d.defi, true); return; }
    if (d && d.type === "depannage" && depParId(d.dep)) { ouvrirDepannage(d.dep, true); return; }
    if (d && d.type === "lecture" && lectureParId(d.lecture)) { ouvrirLecture(d.lecture, true); return; }
    if (d && d.type === "defi" && /^cplt-/.test(d.defi)) { const c = lire(CLE.cpltCode(d.defi)); if (c) { ouvrirCodeCplt(c, true).then((ok) => { if (!ok) departSans(); }); return; } }
    if (d && d.type === "depannage" && /^prof-/.test(d.dep)) { const r = lire(CLE.dep(d.dep)) || lire("schemas:dep:local:" + d.dep); if (r && r.code) { ouvrirCodeProf(r.code, true).then((ok) => { if (!ok) departSans(); }); return; } }
    departSans();
  }
  function departSans() {
    let s = null; const sv = lire(CLE.libre); if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    doc = { type: "libre" }; chargerSchema(s || M.nouveau());
  }
  window.addEventListener("hashchange", () => { const mk = /^#cables(?:=([\w-]+))?$/.exec(location.hash); if (mk) { ouvrirDimLien(mk[1]); return; } const mp = /^#panne=([\w-]+)$/.exec(location.hash); if (mp) { if (!depProf || depProf.code !== mp[1]) ouvrirCodeProf(mp[1]); return; } const mc = /^#complet=([\w-]+)$/.exec(location.hash); if (mc) { if (!cpltProf || cpltProf.code !== mc[1]) ouvrirCodeCplt(mc[1]); return; } const m = /^#(defi|exemple|depannage|lecture)=([\w-]+)$/.exec(location.hash); if (m) { if (m[1] === "defi") ouvrirDefi(m[2]); else if (m[1] === "depannage") ouvrirDepannage(m[2]); else if (m[1] === "lecture") { if (doc.type !== "lecture" || doc.lecture !== m[2]) ouvrirLecture(m[2]); } else ouvrirExemple(m[2]); } });
  window.addEventListener("beforeunload", () => { if (!sim) sauver(); });
  if (session) setTimeout(envoyerDefis, 2500);   // défis réussis avant de se connecter, ou hors ligne : ils partent maintenant
  depart();
  if (!DIRECT.arret) { setTimeout(() => planifierDirect(true), 1500); const dd = $("d-dim"); if (dd) dd.addEventListener("close", directMarquer); }
  requestAnimationFrame(() => { appliquerVue(); if (!schema.pieces.length) ajusterVue(); else ajusterVue(); });

  /* pour les essais automatiques et, plus tard, un automate branché sur la simulation */
  window.SchemasAtelier = {
    schema: () => schema, simulation: () => sim, etat: () => simE, vue: () => Object.assign({}, vue), choix: () => [...sel], outil: () => outil, doc: () => Object.assign({}, doc),
    versEcran: (gx, gy) => { const r = svg.getBoundingClientRect(); return [r.left + vue.x + gx * G * vue.z, r.top + vue.y + gy * G * vue.z]; },
    charger: (s) => chargerSchema(M.valider(s)), ouvrirExemple, ouvrirDefi, verifierDefi, simuler: basculerSim, dessiner, svgExport,
    ouvrirDepannage, ouvrirCodeProf, ouvrirLecture, lecture: () => (lecEtat ? JSON.parse(JSON.stringify(lecEtat)) : null), preparation: () => (prep ? JSON.parse(JSON.stringify(prep)) : null), lienPreparation: () => (prep && prep.panne ? lienPrep() : null),
    preparationC: () => (prepC ? { corrige: !!prepC.corrige, depart: !!prepC.depart, titre: prepC.titre, essai: essaiPrepC() && { etapes: essaiC.etapes.length, commandes: essaiC.commandes, observes: essaiC.observes, okC: essaiC.okC, okD: essaiC.okD } } : null),
    lienCompleter: () => (prepC && prepC.corrige && prepC.depart ? lienPrepC() : null), ouvrirCodeCplt, complet: () => (cpltProf ? cpltEtat(cpltProf.id) : null), depannage: () => (depEtat ? JSON.parse(JSON.stringify(depEtat)) : null), sondes: () => JSON.parse(JSON.stringify(sondes)), outilV: choisirOutil,
    ouvrirCables: (id) => ouvrirDim(id ? exoDim(id) : null), ouvrirCablesLien: ouvrirDimLien,
    directMaintenant: () => pousserDirect(), direct: () => ({ arret: DIRECT.arret, envoye: !!DIRECT.dernier, t: DIRECT.t, info: infoDirect() }),
    cables: () => (dimEtat ? JSON.parse(JSON.stringify({ exo: dimEtat.exo && dimEtat.exo.id, dim: dimEtat.dim, rep: dimEtat.rep, premier: dimEtat.premier, vu: dimEtat.vu, fin: dimEtat.fin, note: dimEtat.note, pts: dimEtat.pts, tot: dimEtat.tot, envoi: dimEtat.envoi })) : null),
    programmer: (ref) => ouvrirProgramme(schema.pieces.find((q) => q.type === "automate" && (!ref || q.ref === ref)))
  };
})();
