/* =====================================================================
   Atelier schémas — l'ÉDITEUR (la page) : dessiner, simuler, exemples, défis
   S'appuie sur SchemasModele (catalogue, liaisons), SchemasSymboles (dessins),
   SchemasMoteur (simulation) et SchemasExemples (exemples, défis).
   Tout reste dans ce navigateur : schéma en cours, copies et réussite des défis (localStorage).
   ===================================================================== */
(function () {
  "use strict";
  const M = window.SchemasModele, SY = window.SchemasSymboles, MO = window.SchemasMoteur, X = window.SchemasExemples;
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
  const CLE = { libre: "schemas:libre", defi: (id) => "schemas:defi:" + QUI + ":" + id, progres: "schemas:progres:" + QUI, copies: "schemas:copies", dernier: "schemas:dernier", aide: "schemas:aide-vue" };

  const DOIGT = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);   // écran tactile sans souris
  const svg = $("sc-svg"), monde = $("sc-monde"), fond = $("sc-fond"), grilleR = $("sc-grille"), pn = $("sc-panneau"), vueEl = $("sc-vue");

  /* ---------- état ---------- */
  let schema = M.nouveau();
  let doc = { type: "libre" };
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
      for (const l of net.libres) if (!estReseau(s, l.piece)) P.push(`<circle class="libre" cx="${l.x * G}" cy="${l.y * G}" r="2.9"/>`);
      for (const q of net.bouts) P.push(`<circle class="bout" cx="${q[0] * G}" cy="${q[1] * G}" r="2.9"/>`);
    }
    return P.join("");
  }
  const estReseau = (s, id) => { const pc = s.pieces.find((q) => q.id === id); return !!pc && pc.type === "reseau"; };
  let demande = false;
  function rendre() { if (!demande) { demande = true; requestAnimationFrame(() => { demande = false; dessiner(); }); } }
  function dessiner() {
    const net = sim ? sim.netlist : (netEdit || (netEdit = M.netlist(schema)));
    let h = svgSchema(schema, net, sim ? simE : null, { sel, libres: !sim });
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
    } else if (survolPiece && actionnable(survolPiece)) {
      const b = M.boiteAbs(survolPiece);
      h += `<g class="survol"><rect class="act-sim" x="${b[0] * G - 5}" y="${b[1] * G - 5}" width="${(b[2] - b[0]) * G + 10}" height="${(b[3] - b[1]) * G + 10}" rx="5"/></g>`;
    }
    monde.innerHTML = h;
    majVide();
  }
  function majRotors() {
    for (const el of monde.querySelectorAll("[data-rotor]")) { const a = angles[el.getAttribute("data-rotor")] || 0; el.setAttribute("transform", `rotate(${Math.round(a % 360)} 0 6)`); }
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
    schema = s; sel.clear(); brouillon = null; geste = null; netEdit = null; resultatDefi = null; indiceVu = false;
    histo = [JSON.stringify(schema)]; hpos = 0;
    if (!garderVue) ajusterVue();
    sauverBientot(); rendre(); majPanneau(); majBoutons();
  }
  function annuler() { if (sim || hpos <= 0) return; hpos--; schema = JSON.parse(histo[hpos]); sel.clear(); brouillon = null; netEdit = null; sauverBientot(); rendre(); majPanneau(); majBoutons(); }
  function refaire() { if (sim || hpos >= histo.length - 1) return; hpos++; schema = JSON.parse(histo[hpos]); sel.clear(); netEdit = null; sauverBientot(); rendre(); majPanneau(); majBoutons(); }
  let tSauve = 0;
  function sauverBientot() { clearTimeout(tSauve); tSauve = setTimeout(sauver, 250); }
  function sauver() { clearTimeout(tSauve); garder(doc.type === "defi" ? CLE.defi(doc.defi) : CLE.libre, schema); garder(CLE.dernier, doc); }

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
    }
    return pc;
  }
  function placer(item, g, encore) {
    const pc = nouvellePiece(item, g, false);
    schema.pieces.push(pc); retenir(pc);
    sel = new Set([pc.id]);
    if (!encore) choisirOutil("fleche");
    commit();
    bulle(M.TYPES[pc.type].lien ? `${pc.ref} posé. Son repère dit à quel appareil il appartient : change-le dans le panneau si besoin.` : `${pc.ref || M.TYPES[pc.type].court} posé. Glisse d'une borne à une autre pour tirer les fils.`, 3500);
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
    if (outil === "placer" && aPlacer) { aPlacer.rot = (((aPlacer.rot != null ? aPlacer.rot : nouvellePiece(aPlacer, [0, 0], true).rot) | 0) + 1) % 4; rendre(); return; }
    const L = [...sel].map(pieceParId).filter(Boolean);
    if (!L.length) { bulle("Choisis d'abord un symbole à tourner.", 2500); return; }
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
  const ACTIONNABLES = new Set(["bp_no", "bp_nf", "arret_urgence", "selecteur", "interrupteur", "fdc_no", "fdc_nf", "capteur", "thermique", "contact_th_nf", "contact_th_no", "sectionneur", "disjoncteur", "disj_moteur", "fusible"]);
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
      if (sim) { const pc = pieceA(w, tac ? 7 : 2), act = actionnable(pc) ? pc : null; if (act !== survolPiece) { survolPiece = act; rendre(); } svg.style.cursor = act ? "pointer" : "grab"; return; }
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
  svg.addEventListener("dblclick", (e) => {
    if (sim) return;
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
    if (sim && o !== "main" && o !== "fleche") return;
    if (brouillon && !(o === "fil" && outil === "fil")) brouillon = null;
    outil = o; aPlacer = o === "placer" ? item : null;
    document.querySelectorAll("#sc-barre [data-o]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.o === o)));
    document.querySelectorAll(".pal-i").forEach((b) => b.setAttribute("aria-pressed", String(o === "placer" && item && b.dataset.k === item.k)));
    if (o === "placer") bulle(DOIGT ? `Touche la feuille pour poser : ${esc(M.TYPES[item.type].nom.toLowerCase())}. « Choisir » pour arrêter.` : `Clique sur la feuille pour poser : ${esc(M.TYPES[item.type].nom.toLowerCase())}. <span class="kbd">R</span> pour le tourner, <span class="kbd">Maj</span> + clic pour en poser plusieurs, <span class="kbd">Échap</span> pour arrêter.`, 0);
    else if (o === "fil") bulle("Glisse d'une borne à une autre, ou clique borne par borne. Les coins se font tout seuls.", 3500);
    else bulle("");
    svg.style.cursor = o === "main" ? "grab" : o === "fleche" ? "" : "crosshair";
    majBoutons(); rendre();
  }

  /* =====================================================================
     SIMULATION
     ===================================================================== */
  function basculerSim() { if (sim) arreterSim(); else demarrerSim(); }
  function demarrerSim() {
    brouillon = null; if (outil === "placer" || outil === "fil") choisirOutil("fleche");
    sel.clear(); geste = null; survolPiece = null;
    sim = MO.simulation(M.cloner(schema)); simE = sim.etat(); simSig = ""; angles = {}; tPrec = 0;
    document.body.classList.add("simu");
    const b = $("sc-simuler"); b.querySelector("span").textContent = "Arrêter"; b.querySelector("svg").innerHTML = '<rect x="6" y="6" width="12" height="12" rx="1.5"/>';
    fermerPalette();
    majBoutons(); construirePanneauSim(); dessiner();
    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(boucle);
    if (!schema.pieces.some((pc) => actionnable(pc))) bulle("Rien à actionner dans ce schéma : ajoute des boutons ou des interrupteurs.", 4000);
    else bulle("Clique sur les boutons du schéma (ou dans la liste « Commandes »). Double-clic : le bouton reste appuyé.", 4500);
  }
  function arreterSim() {
    sim = null; simE = null; cancelAnimationFrame(rafId); appuis.clear(); survolPiece = null;
    document.body.classList.remove("simu");
    const b = $("sc-simuler"); b.querySelector("span").textContent = "Simuler"; b.querySelector("svg").innerHTML = '<path d="M7 4.5v15l12-7.5z"/>';
    bulle(""); majBoutons(); dessiner(); majPanneau();
  }
  function signature(E) {
    const P = {};
    for (const [id, o] of Object.entries(E.pieces)) { const c = Object.assign({}, o); if (c.w != null) c.w = Math.round(c.w * 8) / 8; if (c.prog != null) c.prog = Math.round(c.prog * 40) / 40; if (c.chauffe != null) c.chauffe = Math.round(c.chauffe * 4) / 4; P[id] = c; }
    return JSON.stringify([E.noeuds, E.court, P, E.messages.map((m) => m.texte), E.journal.length, E.defaut]);
  }
  function boucle(ts) {
    rafId = requestAnimationFrame(boucle);
    if (!sim) return;
    const dt = tPrec ? Math.min(250, ts - tPrec) : 16; tPrec = ts;
    const bouge = sim.enMarche() || sim.prochainEvenement() < Infinity || Object.values(simE.pieces).some((o) => o.w);
    if (!bouge && simSig) { $("sc-horloge").textContent = "t = " + nf(sim.temps() / 1000) + " s"; sim.avancer(dt); return; }
    sim.avancer(dt);
    simE = sim.etat();
    for (const pc of schema.pieces) if (pc.type === "moteur" || pc.type === "moteur6") { const o = simE.pieces[pc.id]; if (o) angles[pc.id] = (angles[pc.id] || 0) + (o.w || 0) * dt * 0.32; }
    majSim(false);
  }
  function majSim(force) {
    if (!sim) return;
    if (force) simE = sim.etat();
    $("sc-horloge").textContent = "t = " + nf(sim.temps() / 1000) + " s";
    const sig = signature(simE);
    if (sig !== simSig) { simSig = sig; dessiner(); majPanneauSim(); } else majRotors();
  }
  function actionSim(pc, e) {
    const ref = pc.ref, A = simE.appareils[ref]; if (!A) return;
    const t = pc.type;
    if (t === "bp_no" || t === "bp_nf") {
      if (e.button === 2) { sim.action(ref, "maintenir"); majSim(true); return; }
      if (A.maintenu) { sim.action(ref, "maintenir", false); majSim(true); return; }
      const now = performance.now();
      if (dernierTap.ref === ref && now - dernierTap.t < 380) { dernierTap = {}; sim.action(ref, "maintenir", true); majSim(true); return; }
      dernierTap = { ref, t: now };
      appuis.set(e.pointerId, ref); sim.appuyer(ref); majSim(true); return;
    }
    if (/^(arret_urgence|selecteur|interrupteur|fdc_no|fdc_nf|capteur)$/.test(t)) sim.basculer(ref);
    else if (t === "thermique" || t === "contact_th_nf" || t === "contact_th_no") sim.action(ref, A.declenche ? "rearmer" : "surcharge");
    else if (t === "sectionneur") sim.action(ref, A.fondus && A.fondus.some(Boolean) ? "rearmer" : "basculer");
    else if (t === "disjoncteur" || t === "disj_moteur") sim.action(ref, A.declenche ? "rearmer" : "basculer");
    else if (t === "fusible") { if (A.fondu) sim.rearmer(ref); else bulle("Un fusible ne s'ouvre pas à la main : il fond quand il y a un court-circuit.", 3000); }
    geste = { type: "rien" };
    majSim(true);
  }

  /* ---------- panneau de simulation : les commandes ---------- */
  const DESCR_CMD = { bp_no: "bouton à fermeture", bp_nf: "bouton à ouverture", arret_urgence: "arrêt d'urgence", selecteur: "sélecteur", interrupteur: "interrupteur", fdc_no: "fin de course", fdc_nf: "fin de course", capteur: "capteur", thermique: "relais thermique", sectionneur: "sectionneur", disjoncteur: "disjoncteur", disj_moteur: "disjoncteur-moteur", fusible: "fusible" };
  function commandesSim() {
    const L = [], vus = new Set();
    for (const pc of schema.pieces) {
      if (!actionnable(pc) || vus.has(pc.ref)) continue;
      const A = simE.appareils[pc.ref]; if (!A) continue;
      if (/^contact_th/.test(pc.type) && schema.pieces.some((q) => q.ref === pc.ref && (q.type === "thermique" || q.type === "disj_moteur"))) continue;
      vus.add(pc.ref); L.push({ pc, ref: pc.ref, sorte: A.sorte });
    }
    return L.sort((a, b) => a.ref.localeCompare(b.ref, "fr", { numeric: true }));
  }
  function construirePanneauSim() {
    let h = poignee();
    if (doc.type === "defi") h += carteDefi();
    h += `<h2>Simulation</h2><p class="discret">Les fils sous tension sont en couleur, les bobines alimentées en jaune. Clique sur les organes de commande du schéma, ou ici :</p>
      <div class="rang"><button class="btn sec" type="button" id="sm-raz">Tout remettre à zéro</button><button class="btn" type="button" id="sm-courant" hidden>Remettre le courant</button></div>
      <h3>Commandes</h3><div class="cmd-l" id="sm-cmd">${commandesSim().map((c) => `<div class="cmd" data-ref="${esc(c.ref)}"><div><b>${esc(c.ref)}</b><small>${esc(DESCR_CMD[c.pc.type] || "")}</small><span class="etat"></span></div><div class="bt">${boutonsCmd(c)}</div></div>`).join("") || `<p class="discret">Aucun bouton, interrupteur ni protection à actionner.</p>`}</div>
      <h3>Ce qui se passe</h3><ul class="msgs" id="sm-msgs"></ul>
      <h3>Journal</h3><ul class="msgs" id="sm-journal"></ul>`;
    pn.innerHTML = h;
    brancherPoignee(); brancherDefi();
    $("sm-raz").onclick = () => { sim.reinitialiser(); angles = {}; majSim(true); };
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
      }
      et.textContent = txt; et.className = "etat " + (ok ? "ok" : "ko");
    }
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
    for (const [ref, A] of Object.entries(simE.appareils)) if (A.sorte === "moteur" && (A.etatM === "marche" || A.etatM === "surtension")) L.push(`${ref} tourne dans le sens ${A.sens === 1 ? 1 : 2}${A.couplage ? " (" + (A.couplage === "etoile" ? "étoile" : "triangle") + ")" : ""}.`);
    return L.join(" ");
  }

  /* =====================================================================
     PANNEAU DE DROITE (dessin)
     ===================================================================== */
  const DESCR = {
    reseau: "Le réseau triphasé 400 V : trois phases L1, L2, L3, le neutre N et la terre PE.",
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
    moteur6: "Six bornes. Étoile : U2, V2, W2 reliées. Triangle : U1 avec W2, V1 avec U2, W1 avec V2."
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
    const pc = pieceChoisieSeule(), f = filChoisiSeul();
    if (pc) h += panneauPiece(pc);
    else if (f) h += `<h2>Un fil</h2><p>Glisse le fil pour le décaler. Glisse un de ses bouts (carré) pour le rebrancher ailleurs.</p><p class="discret">Deux fils qui se croisent sans point ne sont pas reliés. Un point noir = une jonction.</p><div class="rang"><button class="btn sec" type="button" data-pa="supprimer">Supprimer le fil</button></div>`;
    else if (sel.size > 1) h += `<h2>${sel.size} éléments choisis</h2><p>Glisse-les ensemble, ou :</p><div class="rang"><button class="btn sec" type="button" data-pa="tourner">Tourner</button><button class="btn sec" type="button" data-pa="dupliquer">Dupliquer</button><button class="btn sec" type="button" data-pa="supprimer">Supprimer</button></div>`;
    else h += panneauSchema();
    pn.innerHTML = h;
    brancherPoignee(); brancherDefi();
    for (const b of pn.querySelectorAll("[data-pa]")) b.onclick = () => ({ supprimer, tourner, dupliquer, simuler: basculerSim, exemples: ouvrirExemples, defis: ouvrirDefis, aide: ouvrirAide })[b.dataset.pa]();
    brancherChamps();
  }
  function panneauSchema() {
    const net = netEdit || (netEdit = M.netlist(schema));
    const nL = net.libres.filter((l) => !estReseau(schema, l.piece)).length + net.bouts.length;
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
    if (pc.type === "disjoncteur") h += `<label class="ch" for="pc-poles">Nombre de pôles</label><select id="pc-poles" data-ch="poles">${[1, 2, 3].map((n) => option(n, n + (n > 1 ? " pôles" : " pôle"), P.poles)).join("")}</select>`;
    if (P.cal !== undefined) h += `<label class="ch" for="pc-cal">${pc.type === "thermique" || pc.type === "disj_moteur" ? "Réglage du thermique Ir (A)" : "Calibre (A)"}</label><input type="number" id="pc-cal" data-ch="cal" value="${esc(P.cal)}" min="0.1" max="1000" step="0.5" inputmode="decimal">`;
    if (pc.type === "alim") h += `<label class="ch" for="pc-pot">Potentiel</label><select id="pc-pot" data-ch="pot">${M.POTENTIELS.map((p) => option(p.id, `${p.nom} · ${p.aide}`, P.pot)).join("")}</select>`;
    if (pc.type === "transfo") h += `<label class="ch" for="pc-prim">Primaire</label><select id="pc-prim" data-ch="prim">${[400, 230].map((v) => option(v, v + " V", P.prim)).join("")}</select><label class="ch" for="pc-sec">Secondaire</label><select id="pc-sec" data-ch="sec">${[24, 48, 230].map((v) => option(v, v + " V", P.sec)).join("")}</select>`;
    if (pc.type === "moteur6") h += `<label class="ch" for="pc-plaque">Plaque signalétique</label><select id="pc-plaque" data-ch="plaque">${option("400/690", "400 V / 690 V (étoile-triangle sur 400 V)", P.plaque)}${option("230/400", "230 V / 400 V (étoile sur 400 V)", P.plaque)}</select>`;
    h += `<div class="rang"><button class="btn sec" type="button" data-pa="tourner">Tourner</button><button class="btn sec" type="button" data-pa="dupliquer">Dupliquer</button><button class="btn sec" type="button" data-pa="supprimer">Supprimer</button></div>`;
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
    } else if (k === "poles" || k === "prim" || k === "sec") pc.p[k] = Number(v);
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
  const defiParId = (id) => X.DEFIS.find((d) => d.id === id) || null;
  const progres = () => lire(CLE.progres) || {};
  function carteDefi() {
    const D = defiParId(doc.defi); if (!D) return "";
    const k = X.DEFIS.indexOf(D), fait = !!progres()[D.id];
    let res = "";
    if (resultatDefi) {
      res = `<ul class="res">${resultatDefi.etapes.map((e) => `<li class="${e.ok ? "" : "ko"}"><span>${esc(e.texte)}</span>${e.ok ? "" : `${e.constat ? `<span class="constat">Ce que je vois : ${esc(e.constat.replace(/[.!\s]+$/, ""))}.</span>` : ""}<span class="pourquoi">${esc(e.detail)}</span>`}</li>`).join("")}</ul>`;
      if (resultatDefi.ok) res += `<div class="bravo">Bravo, défi réussi !</div>${k + 1 < X.DEFIS.length ? `<div class="rang"><button class="btn" type="button" id="df-suivant">Défi suivant →</button></div>` : ""}`;
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
    $("df-indice").onclick = () => { indiceVu = !indiceVu; $("df-indice-z").hidden = !indiceVu; };
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
    if (r.ok) { const P = progres(); P[D.id] = { ok: true, t: Date.now() }; garder(CLE.progres, P); }
    if (sim) construirePanneauSim(); else majPanneau();
    ouvrirPanneau(true);
    const z = pn.querySelector(".res"); if (z) z.scrollIntoView({ block: "nearest" });
    return r;
  }
  function ouvrirDefi(id, silencieux) {
    const D = defiParId(id); if (!D) return;
    if (sim) arreterSim();
    sauver();
    doc = { type: "defi", defi: id };
    let s = null; const sv = lire(CLE.defi(id));
    if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    chargerSchema(s || D.depart());
    sauver(); fermerDialogues();
    if (history.replaceState) history.replaceState(null, "", "#defi=" + id);
    if (!silencieux) ouvrirPanneau(true);
    majPanneau();
  }
  function quitterDefi() {
    if (sim) arreterSim();
    sauver(); doc = { type: "libre" };
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
    if (doc.type === "defi") { sauver(); doc = { type: "libre" }; } else copieAuto();
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
    for (const b of $("d-defis-c").querySelectorAll("[data-df]")) b.onclick = () => ouvrirDefi(b.dataset.df);
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
      </div>
      <h3 style="margin-top:16px">Mes schémas <span class="discret">(dans ce navigateur)</span></h3>
      <div class="rang" style="display:flex;gap:6px"><input type="text" id="f-nom" placeholder="Nom de la copie" value="${esc(schema.titre)}" maxlength="80" style="flex:1;font:inherit;padding:8px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink)"><button class="btn" type="button" data-f="copie">Enregistrer une copie</button></div>
      <ul class="copies">${L.map((c, i) => `<li><span><b>${esc(c.nom)}</b><small>${new Date(c.t).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · ${c.schema.pieces.length} symboles</small></span><button class="btn sec" type="button" data-o="${i}">Ouvrir</button><button class="btn sec" type="button" data-x="${i}" aria-label="Supprimer la copie">×</button></li>`).join("") || `<li class="discret">Aucune copie pour l'instant.</li>`}</ul>`;
    const C = $("d-fichier-c");
    for (const b of C.querySelectorAll("[data-f]")) b.onclick = () => actionFichier(b.dataset.f);
    for (const b of C.querySelectorAll("[data-o]")) b.onclick = () => { const c = (lire(CLE.copies) || [])[+b.dataset.o]; if (!c) return; if (sim) arreterSim(); if (doc.type === "defi") { sauver(); doc = { type: "libre" }; } else copieAuto(); try { chargerSchema(M.valider(c.schema)); } catch (e) { toast(e.message); } fermerDialogues(); };
    for (const b of C.querySelectorAll("[data-x]")) b.onclick = () => { const L2 = lire(CLE.copies) || []; L2.splice(+b.dataset.x, 1); garder(CLE.copies, L2); ouvrirFichier(); };
    ouvrirDialogue("d-fichier");
  }
  function telecharger(blob, nom) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  const nomFichier = () => (schema.titre || "schema").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 50) || "schema";
  async function actionFichier(f) {
    if (f === "nouveau") { if (sim) arreterSim(); if (doc.type === "defi") { sauver(); doc = { type: "libre" }; } else copieAuto(); chargerSchema(M.nouveau()); fermerDialogues(); if (history.replaceState) history.replaceState(null, "", location.pathname); return; }
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
        const s = M.valider(JSON.parse(String(r.result)));
        if (sim) arreterSim();
        if (doc.type === "defi") { sauver(); doc = { type: "libre" }; } else copieAuto();
        chargerSchema(s); fermerDialogues(); toast(`« ${s.titre} » ouvert.`);
      } catch (x) { toast(x && x.message ? x.message : "Ce fichier n'a pas pu être lu."); }
      e.target.value = "";
    };
    r.readAsText(fi);
  });

  /* ---------- export : SVG autonome (couleurs claires) avec cartouche ---------- */
  const CSS_EXPORT = `:root{--p-l1:#e03131;--p-l2:#e8590c;--p-l3:#9c36b5;--p-n:#1c7ed6;--p-pe:#2f9e44;--p-plus:#e03131}
.sy{stroke:#15202b;color:#15202b;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.sy .lien{stroke-dasharray:3.2 2.6;stroke-width:1.05}.sy .fin{stroke-width:.8;stroke:#77838f}
.sy .act.plein,.sy .plein{fill:#15202b}.sy .act.boite{stroke-width:1.2}
.sy .corps-b,.sy .corps-v,.sy .corps-f,.sy .corps-m,.sy .corps-tr,.sy .corps-t,.sy .pot-boite{fill:#fff}.sy .corps-b.plein{fill:#15202b}
.sy-t{font-family:Consolas,"DejaVu Sans Mono",monospace;font-size:8.5px;fill:#44525f;stroke:#fff;stroke-width:3px;paint-order:stroke;stroke-linejoin:round}
.sy-t.ref{font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:11.5px;fill:#15202b}.sy-t.info{fill:#77838f}
.sy-t.pot{font-weight:700;font-size:10.5px;fill:#15202b}.sy-t.gros{font-family:Arial,sans-serif;font-weight:700;font-size:17px;fill:#15202b}
.sy-t.moyen{font-family:Arial,sans-serif;font-size:10.5px;fill:#15202b}.sy-t.petit{font-family:Arial,sans-serif;font-size:7.5px;font-weight:700;fill:#15202b;stroke:none}
.fil{stroke:#15202b;stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}.jonction{fill:#15202b}
.ca{font-family:Arial,Helvetica,sans-serif;fill:#15202b}.ca-l{stroke:#15202b;stroke-width:1;fill:none}`;
  let logoURI = null;
  async function logo() {
    if (logoURI !== null) return logoURI;
    try { const t = await (await fetch("../assets/logo-papara.svg")).text(); logoURI = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(t))); } catch (e) { logoURI = ""; }
    return logoURI;
  }
  async function svgExport() {
    const s = schema, net = M.netlist(s), b = M.bornesDe(s);
    const x0 = b[0] * G - 60, y0 = b[1] * G - 34, w = Math.max(560, (b[2] - b[0]) * G + 110), h = (b[3] - b[1]) * G + 70;
    const L = await logo(), ch = 46, yc = y0 + h + 8;
    const date = new Date().toLocaleDateString("fr-FR");
    const qui = QUI !== "local" ? QUI : "";
    const cart = `<rect class="ca-l" x="${x0}" y="${yc}" width="${w}" height="${ch}"/>${L ? `<image href="${L}" x="${x0 + 6}" y="${yc + 5}" width="45" height="36"/>` : ""}
      <text class="ca" x="${x0 + 58}" y="${yc + 18}" font-size="10">Lycée Tuianu Le Gayic · Papara · Atelier schémas</text>
      <text class="ca" x="${x0 + 58}" y="${yc + 35}" font-size="14" font-weight="700">${esc(s.titre || "Schéma")}</text>
      <text class="ca" x="${x0 + w - 8}" y="${yc + 18}" font-size="10" text-anchor="end">${esc(qui)}</text>
      <text class="ca" x="${x0 + w - 8}" y="${yc + 35}" font-size="10" text-anchor="end">${esc(date)}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - 10} ${y0 - 10} ${w + 20} ${h + ch + 28}" width="${w + 20}" height="${h + ch + 28}"><style>${CSS_EXPORT}</style><rect x="${x0 - 10}" y="${y0 - 10}" width="${w + 20}" height="${h + ch + 28}" fill="#fff"/>${svgSchema(s, net, null, {})}${cart}</svg>`;
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
      <h3 style="margin-top:14px">Les repères</h3>
      <p class="discret">Une bobine et ses contacts portent le <b>même repère</b> (KM1) : c'est comme ça que la simulation sait quels contacts bougent quand KM1 est alimenté. Les numéros des bornes suivent les règles : 13-14 et 43-44 pour les contacts à fermeture, 21-22 et 31-32 pour les contacts à ouverture, 95-96 et 97-98 pour le relais thermique, 55-56 et 67-68 pour les contacts temporisés, A1-A2 pour les bobines.</p>`;
    ouvrirDialogue("d-aide");
    garder(CLE.aide, 1);
  }

  /* =====================================================================
     PALETTE, BARRE D'OUTILS, BULLES
     ===================================================================== */
  const PALETTE = [
    { cat: "alim", items: [{ type: "reseau", nom: "Réseau 3~" }, { type: "alim", p: { pot: "L" }, nom: "Phase L" }, { type: "alim", p: { pot: "N" }, nom: "Neutre N" }, { type: "alim", p: { pot: "+24" }, nom: "+24 V" }, { type: "alim", p: { pot: "0V" }, nom: "0 V" }, { type: "alim", p: { pot: "PE" }, nom: "Terre PE" }, { type: "transfo", nom: "Transfo" }] },
    { cat: "prot", items: [{ type: "fusible", nom: "Fusible" }, { type: "sectionneur", nom: "Sectionneur" }, { type: "disjoncteur", p: { poles: 2 }, nom: "Disjoncteur 2P" }, { type: "disjoncteur", p: { poles: 3 }, nom: "Disjoncteur 3P" }, { type: "disj_moteur", nom: "Disj. moteur" }, { type: "thermique", nom: "Relais thermique" }] },
    { cat: "cmd", items: [{ type: "bp_no", nom: "BP marche" }, { type: "bp_nf", nom: "BP arrêt" }, { type: "arret_urgence", nom: "Arrêt d'urgence" }, { type: "selecteur", nom: "Sélecteur" }, { type: "interrupteur", nom: "Interrupteur" }, { type: "fdc_no", nom: "Fin de course NO" }, { type: "fdc_nf", nom: "Fin de course NF" }, { type: "capteur", nom: "Capteur" }] },
    { cat: "rel", items: [{ type: "bobine", nom: "Bobine KM" }, { type: "poles", nom: "Pôles KM" }, { type: "contact_no", nom: "Contact NO" }, { type: "contact_nf", nom: "Contact NF" }, { type: "relais", nom: "Relais KA" }, { type: "tempo_travail", nom: "Tempo. travail" }, { type: "tempo_repos", nom: "Tempo. repos" }, { type: "contact_tno", nom: "Contact tempo. NO" }, { type: "contact_tnf", nom: "Contact tempo. NF" }, { type: "contact_th_nf", nom: "Thermique 95-96" }, { type: "contact_th_no", nom: "Thermique 97-98" }] },
    { cat: "rec", items: [{ type: "voyant", p: { couleur: "vert" }, nom: "Voyant" }, { type: "moteur", nom: "Moteur 3~" }, { type: "moteur6", nom: "Moteur 6 bornes" }] }
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
    tourner, supprimer, annuler, refaire, moins: () => zoomCentre(1 / 1.25), plus: () => zoomCentre(1.25), ajuster: () => ajusterVue(), simuler: basculerSim };
  for (const b of document.querySelectorAll("#sc-barre [data-a]")) b.addEventListener("click", () => ACTIONS[b.dataset.a]());
  for (const b of document.querySelectorAll("#sc-barre [data-o]")) b.addEventListener("click", () => choisirOutil(b.dataset.o));
  function majBoutons() {
    const q = (a) => document.querySelector(`#sc-barre [data-a="${a}"]`);
    q("annuler").disabled = !!sim || hpos <= 0; q("refaire").disabled = !!sim || hpos >= histo.length - 1;
    q("tourner").disabled = !!sim || (!sel.size && outil !== "placer"); q("supprimer").disabled = !!sim || (!sel.size && !brouillon);
    for (const o of ["fil"]) document.querySelector(`#sc-barre [data-o="${o}"]`).disabled = !!sim;
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
  garder("schemas:nbdefis", X.DEFIS.length);   // lu par le tableau de bord du site (assets/app.js) : « n / 6 défis réussis »
  construirePalette();
  if (session && session.nom) $("sc-qui").textContent = session.nom;
  new ResizeObserver(() => appliquerVue()).observe(vueEl);
  function depart() {
    const h = location.hash.replace(/^#/, ""), m = /^(defi|exemple)=([\w-]+)$/.exec(h);
    if (m && m[1] === "defi" && defiParId(m[2])) { ouvrirDefi(m[2], true); return; }
    if (m && m[1] === "exemple" && X.EXEMPLES.some((e) => e.id === m[2])) { doc = { type: "libre" }; chargerSchema(X.EXEMPLES.find((e) => e.id === m[2]).construire()); return; }
    const d = lire(CLE.dernier);
    if (d && d.type === "defi" && defiParId(d.defi)) { ouvrirDefi(d.defi, true); return; }
    let s = null; const sv = lire(CLE.libre); if (sv) { try { s = M.valider(sv); } catch (e) { s = null; } }
    doc = { type: "libre" }; chargerSchema(s || M.nouveau());
  }
  window.addEventListener("hashchange", () => { const m = /^#(defi|exemple)=([\w-]+)$/.exec(location.hash); if (m) { if (m[1] === "defi") ouvrirDefi(m[2]); else ouvrirExemple(m[2]); } });
  window.addEventListener("beforeunload", () => { if (!sim) sauver(); });
  depart();
  requestAnimationFrame(() => { appliquerVue(); if (!schema.pieces.length) ajusterVue(); else ajusterVue(); });

  /* pour les essais automatiques et, plus tard, un automate branché sur la simulation */
  window.SchemasAtelier = {
    schema: () => schema, simulation: () => sim, etat: () => simE, vue: () => Object.assign({}, vue), choix: () => [...sel], outil: () => outil, doc: () => Object.assign({}, doc),
    versEcran: (gx, gy) => { const r = svg.getBoundingClientRect(); return [r.left + vue.x + gx * G * vue.z, r.top + vue.y + gy * G * vue.z]; },
    charger: (s) => chargerSchema(M.valider(s)), ouvrirExemple, ouvrirDefi, verifierDefi, simuler: basculerSim, dessiner, svgExport
  };
})();
