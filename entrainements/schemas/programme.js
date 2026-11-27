/* =====================================================================
   Atelier schémas — l'ÉDITEUR DE PROGRAMME de l'automate et la VUE EN DIRECT
   - Ladder : une grille par réseau (5 cases de contacts, 1 case de sortie), des liaisons verticales ;
     toucher une case pour y mettre un contact, un fil ou une sortie ;
   - GRAFCET : des étapes (actions) et des transitions (réceptivités), dessinés automatiquement ;
   - mnémoniques : un nom pour chaque adresse, proposé d'après le câblage du schéma ;
   - vue en direct (simulation) : réseaux sous tension en vert, étapes actives marquées d'un jeton.
   S'appuie sur SchemasModele (netlist) et SchemasAutomate (programme, compilation).
   ===================================================================== */
(function () {
  "use strict";
  const M = window.SchemasModele, SA = window.SchemasAutomate;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = (x, d) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 1 : d });
  const court = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  const COLS = SA.COLS;

  /* ---------- géométrie du Ladder (unités du dessin) ---------- */
  const W = 64, H = 58, RL = 10, XS = RL + COLS * W, WS = 112, XR = XS + WS, LARG = XR + 10;
  const yc = (l) => 4 + l * H + 39;
  const xb = (b) => RL + b * W;
  const touche = (R, l, b) => (l > 0 && (R.v[l - 1] || []).indexOf(b) >= 0) || ((R.v[l] || []).indexOf(b) >= 0);
  function depuisDe(R) {   // une ligne qui a une sortie est reliée à sa sortie après son dernier élément
    return R.l.map((li, l) => {
      if (!li.s) return COLS;
      let d = 0;
      li.c.forEach((cs, c) => { if (cs) d = Math.max(d, c + 1); });
      for (let b = 1; b <= COLS; b++) if (touche(R, l, b)) d = Math.max(d, b);
      return d;
    });
  }
  function libelle(P, inv, v) {
    if (!v) return { nom: "", adr: "?", ok: false };
    const a = SA.resoudre(v, inv);
    if (!a) return { nom: court(v, 10), adr: "?", ok: false };
    return { nom: P.noms[a] || "", adr: a, ok: true };
  }
  function etiquette(x, y0, e, err) {
    const cls = err || !e.ok ? " err" : "";
    if (!e.nom) return `<text class="ld-adr gros${cls}" x="${x}" y="${y0 + 16}">${esc(e.adr)}</text>`;
    return `<text class="ld-nom${cls}" x="${x}" y="${y0 + 12}">${esc(court(e.nom, 10))}</text><text class="ld-adr${cls}" x="${x}" y="${y0 + 23}">${esc(e.adr)}</text>`;
  }
  const TXT_SORTIE = (s) => (s.t === "ana" ? "→ " + nf(s.x) + " V" : s.t === "ctu" ? "CTU  " + s.p : s.t.toUpperCase() + "  " + nf(s.p) + " s");
  /* un réseau : F = son flux en simulation (puissance à chaque limite, état des contacts), o.edit pour l'éditeur */
  function svgReseau(P, R, ri, F, o) {
    o = o || {};
    const L = R.l.length, hT = L * H + 8, dep = depuisDe(R), inv = SA.tableInverse(P.noms), api = o.api;
    const B = F ? F.B : null, OK = F ? F.ok : null, on = (v) => (v ? " on" : "");
    const err = (l, c) => !!(o.errs && o.errs.has(ri + ":" + l + ":" + c));
    let h = `<svg class="ld${F ? " live" : ""}" viewBox="0 0 ${LARG} ${hT}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="Réseau ${ri + 1}">`;
    h += `<line class="ld-rail" x1="${RL}" y1="2" x2="${RL}" y2="${hT - 2}"/><line class="ld-rail" x1="${XR}" y1="2" x2="${XR}" y2="${hT - 2}"/>`;
    for (let l = 0; l < L; l++) {
      const y = yc(l), y0 = 4 + l * H;
      for (let c = 0; c < COLS; c++) {
        const x = xb(c), cs0 = R.l[l].c[c], cs = cs0 || (c >= dep[l] ? { t: "f" } : null);
        const pin = B ? B[c][l] : false, ok = OK ? OK[c][l] : null, pout = pin && !!ok;
        if (!cs) { if (o.edit) h += `<line class="ld-vide" x1="${x + 8}" y1="${y}" x2="${x + W - 8}" y2="${y}"/>`; continue; }
        if (cs.t === "f") { h += `<line class="ld-fil${on(pin)}" x1="${x}" y1="${y}" x2="${x + W}" y2="${y}"/>`; continue; }
        const m = x + W / 2;
        h += `<line class="ld-fil${on(pin)}" x1="${x}" y1="${y}" x2="${m - 9}" y2="${y}"/><line class="ld-fil${on(pout)}" x1="${m + 9}" y1="${y}" x2="${x + W}" y2="${y}"/>`;
        if (F && ok) h += `<rect class="ld-ferme" x="${m - 9}" y="${y - 11}" width="18" height="22"/>`;
        h += `<line class="ld-c" x1="${m - 9}" y1="${y - 12}" x2="${m - 9}" y2="${y + 12}"/><line class="ld-c" x1="${m + 9}" y1="${y - 12}" x2="${m + 9}" y2="${y + 12}"/>`;
        if (cs.t === "nf") h += `<line class="ld-c" x1="${m - 9}" y1="${y + 12}" x2="${m + 9}" y2="${y - 12}"/>`;
        if (cs.t === "p" || cs.t === "n") h += `<text class="ld-pn" x="${m}" y="${y + 0.5}">${cs.t.toUpperCase()}</text>`;
        h += etiquette(m, y0, libelle(P, inv, cs.v), err(l, c));
      }
      const s = R.l[l].s, xc = XS + WS / 2;
      if (s) {
        const pw = F ? !!F.s[l] : false, bloc = !/^(bob|s|r)$/.test(s.t), dx = bloc ? 40 : 12;
        h += `<line class="ld-fil${on(pw)}" x1="${XS}" y1="${y}" x2="${xc - dx}" y2="${y}"/><line class="ld-fil${on(pw)}" x1="${xc + dx}" y1="${y}" x2="${XR}" y2="${y}"/>`;
        if (!bloc) {
          h += `<path class="ld-c${on(pw)}" d="M${xc - 5} ${y - 12}A14 14 0 0 0 ${xc - 5} ${y + 12}M${xc + 5} ${y - 12}A14 14 0 0 1 ${xc + 5} ${y + 12}"/>`;
          if (s.t !== "bob") h += `<text class="ld-pn" x="${xc}" y="${y + 0.5}">${s.t.toUpperCase()}</text>`;
        } else {
          h += `<rect class="ld-bloc${on(pw)}" x="${xc - 40}" y="${y - 13}" width="80" height="26" rx="3"/>`;
          const n = SA.numAdr(SA.resoudre(s.v, inv) || "");
          if (api && (s.t === "ton" || s.t === "tof") && api.TM[n] && api.TM[n].p > 0 && api.TM[n].et > 0) h += `<rect class="ld-prog" x="${xc - 38}" y="${y + 8}" width="${Math.round(76 * Math.min(1, api.TM[n].et / api.TM[n].p))}" height="3"/>`;
          const t2 = api && s.t === "ctu" && api.C[n] ? `CTU  ${api.C[n].v}/${s.p}` : TXT_SORTIE(s);
          h += `<text class="ld-bt" x="${xc}" y="${y + 0.5}">${esc(t2)}</text>`;
        }
        h += etiquette(xc, y0, s.t === "ana" ? { nom: P.noms["%QW0"] || "AQ0", adr: "%QW0", ok: true } : libelle(P, inv, s.v), err(l, COLS));
      } else if (o.edit) h += `<line class="ld-vide" x1="${XS + 8}" y1="${y}" x2="${XR - 8}" y2="${y}"/>`;
    }
    for (let l = 0; l + 1 < L; l++) for (const b of R.v[l] || []) h += `<line class="ld-fil v${on(B && B[b][l])}" x1="${xb(b)}" y1="${yc(l)}" x2="${xb(b)}" y2="${yc(l + 1)}"/>`;
    if (o.edit) {
      for (let l = 0; l < L; l++) for (let c = 0; c <= COLS; c++) {
        const x = c < COLS ? xb(c) : XS, w = c < COLS ? W : WS, choisi = o.sel && o.sel.l === l && o.sel.c === c;
        h += `<rect class="ld-hit${choisi ? " sel" : ""}" data-cell="${l},${c}" x="${x + 2}" y="${4 + l * H + 2}" width="${w - 4}" height="${H - 4}" rx="5"/>`;
      }
      for (let l = 0; l + 1 < L; l++) for (let b = 1; b <= COLS; b++) {
        const a = (R.v[l] || []).indexOf(b) >= 0;
        h += `<g class="ld-lien${a ? " on" : ""}" data-lien="${l},${b}"><circle cx="${xb(b)}" cy="${(yc(l) + yc(l + 1)) / 2}" r="8"/><text x="${xb(b)}" y="${(yc(l) + yc(l + 1)) / 2 + 0.5}">${a ? "−" : "+"}</text><title>${a ? "Enlever" : "Ajouter"} une liaison verticale</title></g>`;
      }
    }
    return h + "</svg>";
  }

  /* ---------- le dessin du GRAFCET (renvois pour les cas compliqués) ---------- */
  function texteAction(P, inv, ac) {
    const nm = (v) => { const a = SA.resoudre(v, inv); return a ? (P.noms[a] || a) : (v || "?"); };
    switch (ac.t) {
      case "s": return "↑ " + nm(ac.v) + " := 1";
      case "r": return "↑ " + nm(ac.v) + " := 0";
      case "inc": return "↑ " + nm(ac.v) + " := " + nm(ac.v) + " + 1";
      case "ana": return (P.noms["%QW0"] || "AQ0") + " = " + nf(ac.x) + " V" + (ac.si ? " si " + ac.si : "");
      default: return nm(ac.v) + (ac.si ? " si " + ac.si : "");
    }
  }
  /* une réceptivité écrite comme dans les livres : a · b, a + b, barre au-dessus pour NON */
  function receptiviteSvg(txt) {
    const brut = String(txt || "").trim();
    if (!brut) return "?";
    let T; try { T = SA.lexer(brut); } catch (e) { return esc(court(brut, 28)); }
    if (T.length === 1 && T[0].k === "nb") return "= " + esc(String(T[0].v));
    let out = "", n = 0;
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      if (t.k === "non") { const s = T[i + 1]; if (s && s.k === "mot" && !s.barre) { out += `<tspan class="barre">${esc(s.w)}</tspan>`; n += s.w.length; i++; continue; } out += "/"; n++; continue; }
      if (t.k === "mot") { out += t.barre ? `<tspan class="barre">${esc(t.w)}</tspan>` : esc(t.w); n += t.w.length; continue; }
      const x = t.k === "et" ? " · " : t.k === "ou" ? " + " : t.k === "fm" ? "↑" : t.k === "fd" ? "↓" : t.k === "tempo" ? `t/X${t.n}/${nf(t.d / 1000, 2)}s` : t.k === "nb" ? nf(t.v, 3) : t.k === "cmp" ? " " + ({ "<=": "≤", ">=": "≥", "<>": "≠" }[t.op] || t.op) + " " : t.k;
      out += esc(x); n += x.length;
    }
    return n > 30 ? esc(court(brut, 28)) : out;
  }
  function svgGrafcet(P, api, o) {
    o = o || {};
    const G = P.grafcet, E = G.etapes, T = G.transitions, inv = SA.tableInverse(P.noms);
    const X0 = 74, S = 34, ZONE = 66, AX = X0 + S / 2 + 20, AW = 200, BR = 150;
    const idx = new Map(E.map((e, i) => [e.n, i]));
    const actifs = new Set(api ? api.X : []), valides = api ? api.franchissables || [] : [];
    const diag = SA.analyser(P), errT = new Set(diag.erreurs.filter((e) => e.ou && e.ou.t != null).map((e) => e.ou.t));
    const hA = E.map((e) => Math.max(S, e.actions.length * 15 + 7));
    const yS = []; let y = 26;
    E.forEach((e, i) => { yS.push(y); y += hA[i] + ZONE; });
    const sous = E.map(() => []), orphelines = [], entrees = new Map();
    T.forEach((tr, k) => {
      const i = tr.de.length ? idx.get(tr.de[0]) : undefined;
      if (i === undefined) orphelines.push(k); else sous[i].push(k);
      for (const n of tr.vers) { const L = entrees.get(n) || []; L.push(k); entrees.set(n, L); }
    });
    let h = "", larg = AX + AW + 20, nBoucle = 0;
    const dessinees = new Set();   // transitions dessinées par un trait qui arrive sur l'étape
    const bar = (x, yy, k) => `<line class="gf-bar${errT.has(k) ? " err" : ""}${valides[k] ? " val" : ""}" data-gt="${k}" x1="${x - 13}" y1="${yy}" x2="${x + 13}" y2="${yy}"/>`;
    const recept = (x, yy, k) => `<text class="gf-rt${errT.has(k) ? " err" : ""}" x="${x + 19}" y="${yy}">${errT.has(k) ? esc(court(T[k].r || "?", 28)) : receptiviteSvg(T[k].r)}</text><text class="gf-tn" x="${x - 17}" y="${yy}">(${k + 1})</text>`;
    E.forEach((e, i) => {
      const yb = yS[i] + S, yT = yS[i] + hA[i] + ZONE / 2, yN = yS[i] + hA[i] + ZONE;
      const K = sous[i];
      const main = K.find((k) => T[k].de.length === 1 && T[k].vers.length === 1 && i + 1 < E.length && T[k].vers[0] === E[i + 1].n);
      const boucle = main === undefined && K.length === 1 && T[K[0]].de.length === 1 && T[K[0]].vers.length === 1 && idx.has(T[K[0]].vers[0]) && idx.get(T[K[0]].vers[0]) <= i ? K[0] : undefined;
      const autres = K.filter((k) => k !== main && k !== boucle);
      const c0 = main !== undefined || boucle !== undefined ? 1 : 0, nCol = c0 + autres.length;
      if (nCol > 1) { h += `<line class="gf-l" x1="${X0}" y1="${yb + 10}" x2="${X0 + (nCol - 1) * BR}" y2="${yb + 10}"/>`; larg = Math.max(larg, X0 + (nCol - 1) * BR + 190); }
      if (main !== undefined) { h += `<line class="gf-l" x1="${X0}" y1="${yb}" x2="${X0}" y2="${yN}"/>` + bar(X0, yT, main) + recept(X0, yT, main); dessinees.add(main); }
      if (boucle !== undefined) {
        const j = idx.get(T[boucle].vers[0]), xL = X0 - 36 - 10 * nBoucle++, yB = yT + 18, yH = yS[j] - 13;
        h += `<path class="gf-l" d="M${X0} ${yb}V${yB}H${xL}V${yH}H${X0}V${yS[j]}"/>` + bar(X0, yT, boucle) + recept(X0, yT, boucle);
        const ym = (yB + yH) / 2;
        h += `<path class="gf-fl" d="M${xL - 5} ${ym + 5}L${xL} ${ym - 3}L${xL + 5} ${ym + 5}"/>`;
        dessinees.add(boucle);
      }
      autres.forEach((k, a) => {
        const x = X0 + (c0 + a) * BR, ya = nCol > 1 ? yb + 10 : yb, tr = T[k];
        h += `<line class="gf-l" x1="${x}" y1="${ya}" x2="${x}" y2="${yT + 15}"/>` + bar(x, yT, k) + recept(x, yT, k);
        if (tr.de.length > 1) h += `<text class="gf-n2" x="${x + 6}" y="${ya + 13}">avec ${tr.de.slice(1).map((n) => "X" + n).join(", ")}</text>`;
        h += `<path class="gf-fl" d="M${x - 5} ${yT + 12}L${x} ${yT + 20}L${x + 5} ${yT + 12}"/><text class="gf-renvoi" x="${x}" y="${yT + 30}">vers ${tr.vers.map((n) => "X" + n).join(", ") || "?"}</text>`;
      });
      if (i === E.length - 1 && !K.length && E.length > 1) h += `<line class="gf-l" x1="${X0}" y1="${yb}" x2="${X0}" y2="${yb + 10}"/>`;
    });
    // étapes et actions, renvois d'arrivée
    E.forEach((e, i) => {
      const y0 = yS[i], act = actifs.has(e.n);
      const arrivees = (entrees.get(e.n) || []).filter((k) => !dessinees.has(k));
      if (arrivees.length) h += `<line class="gf-l" x1="${X0}" y1="${y0 - 18}" x2="${X0}" y2="${y0}"/><path class="gf-fl" d="M${X0 - 5} ${y0 - 9}L${X0} ${y0 - 1}L${X0 + 5} ${y0 - 9}"/><text class="gf-renvoi g" x="${X0 - 9}" y="${y0 - 15}">de (${arrivees.map((k) => k + 1).join("), (")})</text>`;
      h += `<g class="gf-st${act ? " on" : ""}" data-ge="${i}"><rect x="${X0 - S / 2}" y="${y0}" width="${S}" height="${S}"/>${e.init ? `<rect class="int" x="${X0 - S / 2 + 4}" y="${y0 + 4}" width="${S - 8}" height="${S - 8}"/>` : ""}<text x="${X0}" y="${y0 + S / 2 + 0.5}">${e.n}</text>${act ? `<circle class="jeton" cx="${X0}" cy="${y0 + S - 6}" r="3.4"/>` : ""}${e.com ? `<title>${esc(e.com)}</title>` : ""}</g>`;
      if (e.actions.length) {
        h += `<line class="gf-l" x1="${X0 + S / 2}" y1="${y0 + S / 2}" x2="${AX}" y2="${y0 + S / 2}"/><rect class="gf-act${act ? " on" : ""}" x="${AX}" y="${y0}" width="${AW}" height="${hA[i]}"/>`;
        e.actions.forEach((ac, k) => { h += `<text class="gf-at" x="${AX + 8}" y="${y0 + 12 + 15 * k}">${esc(court(texteAction(P, inv, ac), 30))}</text>`; });
      } else if (e.com) h += `<text class="gf-com" x="${X0 + S / 2 + 10}" y="${y0 + S / 2}">${esc(court(e.com, 32))}</text>`;
    });
    let hT = y + 10;
    if (orphelines.length) { h += `<text class="gf-rt err" x="10" y="${hT}">Transitions sans étape d'avant : ${orphelines.map((k) => "(" + (k + 1) + ")").join(" ")}</text>`; hT += 16; }
    return `<svg class="gf${api ? " live" : ""}" viewBox="0 0 ${larg} ${hT}" width="${larg}" height="${hT}" preserveAspectRatio="xMinYMin meet" role="img" aria-label="GRAFCET">${h}</svg>`;
  }

  /* ---------- ce qui est câblé sur chaque borne de l'automate ---------- */
  function cablage(s, pc) {
    const net = M.netlist(s), R = {};
    const dans = (n, sauf) => { const L = []; for (const q of s.pieces) { if (q.id === sauf) continue; for (const t of M.bornesLocales(q)) if (net.borne[q.id + ":" + t.id] === n) L.push({ q, t }); } return L; };
    const charge = (q) => /^(bobine|relais|tempo_travail|tempo_repos|voyant|variateur)$/.test(q.type);
    for (const b of M.bornesLocales(pc)) {
      const n = net.borne[pc.id + ":" + b.id]; if (n == null) continue;
      let L = dans(n, pc.id).filter((x) => x.q.type !== "alim" && x.q.type !== "reseau");
      if (/^Q\d$/.test(b.id)) {   // une sortie : suivre les contacts en série jusqu'à la charge
        let vus = new Set([pc.id]), front = L;
        for (let pas = 0; pas < 4 && front.length && !front.some((x) => charge(x.q)); pas++) {
          const suite = [];
          for (const x of front) {
            if (vus.has(x.q.id) || !M.nature(x.q)) continue; vus.add(x.q.id);
            const autre = M.bornesLocales(x.q).find((t) => t.id !== x.t.id); if (!autre) continue;
            const n2 = net.borne[x.q.id + ":" + autre.id]; if (n2 != null) suite.push(...dans(n2, x.q.id));
          }
          front = suite.filter((x) => x.q.type !== "alim" && x.q.type !== "reseau");
        }
        if (front.some((x) => charge(x.q))) L = front.filter((x) => charge(x.q));
      }
      R[b.id] = L;
    }
    return R;
  }
  const BORNE_ADR = (id) => (/^I\d$/.test(id) ? "%I0." + id[1] : /^Q\d$/.test(id) ? "%Q0." + id[1] : id === "AQ0" ? "%QW0" : null);
  const NOM_LI = { LI1: "AVANT", LI2: "ARRIERE", LI3: "VITESSE2", LI4: "VITESSE3", AI1: "CONSIGNE" };
  function texteCablage(L) { return L.map((x) => (x.q.type === "variateur" ? `${x.q.ref} ${x.t.n}` : (x.q.ref || M.TYPES[x.q.type].court) + (x.t.n && !/^(a|b)$/.test(x.t.id) ? " " + x.t.n : ""))).filter((v, i, a) => a.indexOf(v) === i).join(", "); }
  function propositions(s, pc, P) {
    const cab = cablage(s, pc), pris = new Set(Object.values(P.noms).map((n) => n.toLowerCase())), R = {};
    for (const [id, L] of Object.entries(cab)) {
      const a = BORNE_ADR(id); if (!a || P.noms[a] || !L.length) continue;
      const x = L[0];
      let n = x.q.type === "variateur" ? NOM_LI[x.t.id] || (x.q.ref + "_" + x.t.id) : x.q.ref;
      n = SA.nomValide(n) || SA.nomValide("_" + n) || ""; if (!n) continue;
      let m = n, k = 2; while (pris.has(m.toLowerCase())) m = (n + "_" + k++).slice(0, 16);
      pris.add(m.toLowerCase()); R[a] = m;
    }
    return R;
  }

  /* =====================================================================
     LA FENÊTRE « Programmer API1 »
     ===================================================================== */
  let ctx = null;            // { id, h: { commit, schema, bulle } }
  let sel = null, nomsOuverts = false, dernierChamp = null, surSuppr = null;
  const pc = () => (ctx ? ctx.h.schema().pieces.find((q) => q.id === ctx.id) : null);
  const prog = () => { const p = pc(); if (!p) return SA.progDefaut(); if (!p.prog || !p.prog.ladder) p.prog = SA.validerProg(p.prog); return p.prog; };
  let tMsg = 0;
  function dire(html, ms) {
    const z = $("pg-msg"); if (!z) return;
    clearTimeout(tMsg); z.innerHTML = html ? `<div>${html}</div>` : ""; z.hidden = !html;
    if (html && ms) tMsg = setTimeout(() => { z.hidden = true; z.innerHTML = ""; }, ms);
  }
  function changer(rendu) { ctx.h.commit(); if (rendu !== false) rendre(); else { majDiag(); if (prog().lang === "grafcet") majDessinG(); } }
  function ouvrir(piece, h) {
    ctx = { id: piece.id, h }; sel = null; surSuppr = null;
    if (!piece.prog || !piece.prog.ladder) piece.prog = SA.validerProg(piece.prog);
    nomsOuverts = !Object.keys(piece.prog.noms).length;
    const d = $("d-prog"); $("d-prog-t").textContent = "Programmer " + (piece.ref || "l'automate");
    rendre();
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function fermer() { const d = $("d-prog"); if (d.open) { if (d.close) d.close(); else d.removeAttribute("open"); } ctx = null; }
  function resume(P0) {
    const P = SA.validerProg(P0), d = SA.analyser(P);
    const quoi = P.lang === "ladder" ? `Ladder · ${P.ladder.length} réseau${P.ladder.length > 1 ? "x" : ""}` : `GRAFCET · ${P.grafcet.etapes.length} étape${P.grafcet.etapes.length > 1 ? "s" : ""}, ${P.grafcet.transitions.length} transition${P.grafcet.transitions.length > 1 ? "s" : ""}`;
    const vide = P.lang === "ladder" ? !P.ladder.some((R) => R.l.some((li) => li.s || li.c.some(Boolean))) : !P.grafcet.transitions.length;
    return { texte: quoi, vide, erreurs: d.erreurs.length, alertes: d.alertes.length };
  }

  function rendre() {
    if (!ctx) return;
    const P = prog(), C = $("d-prog-c"), s = ctx.h.schema(), piece = pc();
    const cab = piece ? cablage(s, piece) : {};
    const sansNom = Object.entries(cab).filter(([id, L]) => BORNE_ADR(id) && L.length && !P.noms[BORNE_ADR(id)]).length;
    const dl = [];
    for (const a of SA.adresses()) dl.push(`<option value="${esc(P.noms[a] || a)}">${esc(P.noms[a] ? a : "")}</option>`);
    for (let k = 0; k < 16; k++) if (!P.noms["%X" + k] && P.lang === "grafcet") dl.push(`<option value="X${k}">étape ${k}</option>`);
    C.innerHTML = `<div class="pg-msg" id="pg-msg" hidden></div><datalist id="pg-dl">${dl.join("")}</datalist>
      <div class="pg-haut">
        <div class="seg" role="group" aria-label="Langage du programme"><button type="button" data-lang="ladder" aria-pressed="${P.lang === "ladder"}">Ladder</button><button type="button" data-lang="grafcet" aria-pressed="${P.lang === "grafcet"}">GRAFCET</button></div>
        <button class="btn sec" type="button" data-pg="noms" aria-expanded="${nomsOuverts}">Mnémoniques${sansNom ? ` <span class="pastille">${sansNom}</span>` : ""}</button>
        <span class="pg-espace"></span>
        <button class="btn sec" type="button" data-pg="aide" aria-expanded="false">Comment ça marche</button>
      </div>
      <div class="pg-aide" id="pg-aide" hidden>${P.lang === "ladder" ? AIDE_LADDER : AIDE_GRAFCET}</div>
      <div class="pg-noms" id="pg-noms"${nomsOuverts ? "" : " hidden"}>${tableNoms(P, cab, sansNom)}</div>
      <div class="pg-diag" id="pg-diag"></div>
      <div class="pg-zone" id="pg-zone">${P.lang === "ladder" ? htmlLadder(P) : htmlGrafcet(P)}</div>`;
    majDiag();
    if (sel && sel.focus) { const i = $("ld-v"); if (i) i.focus(); sel.focus = false; }
  }
  function majDiag() {
    const z = $("pg-diag"); if (!z) return;
    const d = SA.analyser(prog());
    const L = d.erreurs.map((e) => `<li class="erreur">${esc(e.texte)}</li>`).concat(d.alertes.map((e) => `<li class="alerte">${esc(e.texte)}</li>`));
    z.innerHTML = L.length ? `<ul class="msgs">${L.slice(0, 6).join("")}${L.length > 6 ? `<li class="info">… et ${L.length - 6} autre${L.length - 6 > 1 ? "s" : ""}.</li>` : ""}</ul>` : `<p class="pg-ok">Aucune erreur dans le programme.</p>`;
  }

  /* ---------- mnémoniques ---------- */
  const QUOI = (a) => (/^%I/.test(a) ? "entrée" : /^%QW/.test(a) ? "sortie 0-10 V" : /^%Q/.test(a) ? "sortie à relais" : /^%M/.test(a) ? "bit interne" : /^%TM/.test(a) ? "temporisation" : /^%C/.test(a) ? "compteur" : "");
  function tableNoms(P, cab, sansNom) {
    const adrCab = {}; for (const [id, L] of Object.entries(cab)) { const a = BORNE_ADR(id); if (a) adrCab[a] = texteCablage(L); }
    const L = SA.adresses().filter((a) => !/^%(M|TM|C)\d+$/.test(a) || SA.numAdr(a) < 4 || P.noms[a]);
    let h = `<p class="discret">Un mnémonique remplace l'adresse dans le programme : <b>S1</b> au lieu de <b>%I0.0</b>. Lettres, chiffres et _, sans espace (S1, dcy, fc_haut, KM1).</p>`;
    h += `<div class="rang"><button class="btn${sansNom ? "" : " sec"}" type="button" data-pg="proposer">Proposer d'après le câblage${sansNom ? ` (${sansNom})` : ""}</button></div>`;
    h += `<table class="pg-t"><thead><tr><th>Adresse</th><th>Mnémonique</th><th>Câblé à</th></tr></thead><tbody>`;
    for (const a of L) h += `<tr><td><code>${a}</code><small>${QUOI(a)}</small></td><td><input type="text" class="pg-nom" data-a="${a}" value="${esc(P.noms[a] || "")}" maxlength="16" spellcheck="false" autocomplete="off" aria-label="Mnémonique de ${a}"></td><td>${esc(adrCab[a] || "")}</td></tr>`;
    return h + `</tbody></table>`;
  }
  function renommerDansReceptivites(P, ancien, nouveau) {
    if (!ancien) return;
    const re = new RegExp(`(^|[^%A-Za-z0-9_À-ÿ.])${ancien.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_À-ÿ])`, "gi");
    const f = (t) => String(t || "").replace(re, (m0, a) => a + nouveau);
    for (const tr of P.grafcet.transitions) tr.r = f(tr.r);
    for (const e of P.grafcet.etapes) for (const ac of e.actions) if (ac.si) ac.si = f(ac.si);
  }
  function changerNom(a, v) {
    const P = prog(), n = String(v || "").trim(), ancien = P.noms[a] || "";
    if (!n) { delete P.noms[a]; changer(); return; }
    const ok = SA.nomValide(n);
    if (!ok) { dire(SA.canon(n) ? `« ${esc(n)} » ressemble à une adresse : choisis un autre nom.` : `« ${esc(n)} » : lettres, chiffres et _ seulement, sans espace, 16 signes au plus.`, 3500); rendre(); return; }
    const autre = Object.keys(P.noms).find((k) => k !== a && P.noms[k].toLowerCase() === ok.toLowerCase());
    if (autre) { dire(`« ${esc(ok)} » est déjà le nom de ${autre}.`, 3000); rendre(); return; }
    P.noms[a] = ok;
    if (ancien && ancien !== ok) renommerDansReceptivites(P, ancien, ok);
    changer();
  }

  /* ---------- Ladder : la grille ---------- */
  function htmlLadder(P) {
    const d = SA.analyser(P);
    const errs = new Set(d.erreurs.filter((e) => e.ou && e.ou.r != null && e.ou.l != null).map((e) => e.ou.r + ":" + e.ou.l + ":" + e.ou.c));
    let h = "";
    P.ladder.forEach((R, ri) => {
      const sur = surSuppr === ri;
      h += `<section class="ld-res" data-r="${ri}"><div class="ld-tete"><b>Réseau ${ri + 1}</b><input type="text" class="ld-com" data-r="${ri}" value="${esc(R.com)}" maxlength="60" placeholder="À quoi sert ce réseau ? (facultatif)">
        <span class="ld-bts"><button type="button" data-rb="haut" data-r="${ri}" title="Monter le réseau"${ri ? "" : " disabled"}>↑</button><button type="button" data-rb="bas" data-r="${ri}" title="Descendre le réseau"${ri < P.ladder.length - 1 ? "" : " disabled"}>↓</button><button type="button" data-rb="ligne+" data-r="${ri}" title="Ajouter une ligne (une branche en parallèle)"${R.l.length < SA.LIGNES_MAX ? "" : " disabled"}>+ ligne</button><button type="button" data-rb="ligne-" data-r="${ri}" title="Enlever la dernière ligne (ou celle choisie)"${R.l.length > 1 ? "" : " disabled"}>− ligne</button><button type="button" data-rb="suppr" data-r="${ri}" class="${sur ? "ko" : ""}" title="Supprimer le réseau">${sur ? "Sûr ?" : "✕"}</button></span></div>
        <div class="ld-svg">${svgReseau(P, R, ri, null, { edit: true, sel: sel && sel.r === ri ? sel : null, errs })}</div>
        ${sel && sel.r === ri ? panneauCase(P, R) : ""}</section>`;
    });
    return h + `<div class="rang"><button class="btn" type="button" data-pg="reseau+">+ Ajouter un réseau</button></div>`;
  }
  const TYPES_CASE = [["no", "contact à fermeture", "passe quand la variable vaut 1"], ["nf", "contact à ouverture", "passe quand la variable vaut 0"], ["p", "front montant", "passe un seul cycle, quand la variable passe de 0 à 1"], ["n", "front descendant", "passe un seul cycle, quand la variable passe de 1 à 0"], ["f", "fil", "relie à droite et à gauche"]];
  const TYPES_SORTIE = [["bob", "bobine", "la variable vaut 1 tant que la ligne est alimentée"], ["s", "mise à 1 (S)", "la variable passe à 1 et y reste"], ["r", "mise à 0 (R)", "la variable repasse à 0 (remet aussi à zéro une tempo ou un compteur)"], ["ton", "tempo travail (TON)", "%TMx passe à 1 après le retard, tant que la ligne est alimentée"], ["tof", "tempo repos (TOF)", "%TMx reste à 1 pendant le retard après la coupure"], ["ctu", "compteur (CTU)", "compte les fronts montants ; %Cx vaut 1 quand il atteint la valeur"], ["ana", "consigne 0-10 V", "met une tension sur la sortie analogique AQ0 (%QW0)"]];
  function iconeType(t) {
    const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    const fil = L(2, 12, 14, 12) + L(26, 12, 38, 12), bars = L(14, 4, 14, 20) + L(26, 4, 26, 20);
    let s;
    switch (t) {
      case "no": s = fil + bars; break;
      case "nf": s = fil + bars + L(14, 20, 26, 4); break;
      case "p": case "n": s = fil + bars + `<text x="20" y="13">${t.toUpperCase()}</text>`; break;
      case "f": s = L(2, 12, 38, 12); break;
      case "bob": case "s": case "r": s = L(2, 12, 11, 12) + L(29, 12, 38, 12) + `<path d="M16 3A11 11 0 0 0 16 21M24 3A11 11 0 0 1 24 21"/>` + (t !== "bob" ? `<text x="20" y="13">${t.toUpperCase()}</text>` : ""); break;
      default: s = `<rect x="3" y="4" width="34" height="16" rx="2"/><text x="20" y="13">${t === "ana" ? "V" : t.toUpperCase()}</text>`;
    }
    return `<svg viewBox="0 0 40 24" aria-hidden="true">${s}</svg>`;
  }
  function affV(P, v) { const a = SA.resoudre(v, SA.tableInverse(P.noms)); return a && P.noms[a] ? P.noms[a] : v || ""; }
  function puces(P, sorte, cur) {
    const L = [];
    const ok = (a) => { const k = SA.sorteAdr(a); return sorte === "contact" ? /^(I|Q|M|TM|C|X)$/.test(k) : sorte === "bob" || sorte === "s" ? /^(Q|M)$/.test(k) : sorte === "r" ? /^(Q|M|TM|C)$/.test(k) : sorte === "ton" || sorte === "tof" ? k === "TM" : sorte === "ctu" ? k === "C" : false; };
    for (const a of Object.keys(P.noms)) if (ok(a)) L.push([a, P.noms[a]]);
    const plus = sorte === "ton" || sorte === "tof" ? ["%TM0", "%TM1", "%TM2", "%TM3"] : sorte === "ctu" ? ["%C0", "%C1", "%C2", "%C3"] : sorte === "contact" ? ["%M0", "%M1", "%TM0", "%C0"] : ["%M0", "%M1", "%M2"];
    for (const a of plus) if (!L.some((x) => x[0] === a)) L.push([a, ""]);
    const ac = SA.resoudre(cur, SA.tableInverse(P.noms));
    return `<div class="ld-puces">${L.slice(0, 22).map(([a, n]) => `<button type="button" data-puce="${a}" class="${ac === a ? "on" : ""}"><b>${esc(n || a)}</b>${n ? `<small>${a}</small>` : ""}</button>`).join("")}</div>`;
  }
  function panneauCase(P, R) {
    const { l, c } = sel, sortie = c === COLS, cs = sortie ? R.l[l].s : R.l[l].c[c];
    const T = sortie ? TYPES_SORTIE : TYPES_CASE, t = cs && cs.t;
    let h = `<div class="ld-ed"><div class="ld-ed-t">${sortie ? `Sortie de la ligne ${l + 1}` : `Case ${c + 1} de la ligne ${l + 1}`}</div><div class="ld-types">`;
    for (const [k, nom] of T) h += `<button type="button" class="ld-ty${t === k ? " on" : ""}" data-ty="${k}" title="${esc(nom)}">${iconeType(k)}<span>${esc(nom)}</span></button>`;
    h += `<button type="button" class="ld-ty vider" data-ty="" title="Vider la case"><span>vider</span></button></div>`;
    if (cs && cs.t !== "f") {
      if (cs.t !== "ana") h += `<label class="ld-l">Variable <input type="text" id="ld-v" list="pg-dl" value="${esc(affV(P, cs.v))}" autocomplete="off" spellcheck="false" placeholder="${sortie ? "KM1, %Q0.0, %M0…" : "S1, %I0.0, KM1…"}"></label>` + puces(P, sortie ? cs.t : "contact", cs.v);
      if (cs.t === "ton" || cs.t === "tof") h += `<label class="ld-l">Retard (en secondes) <input type="number" id="ld-p" min="0.1" max="3600" step="0.1" value="${cs.p}" inputmode="decimal"></label>`;
      if (cs.t === "ctu") h += `<label class="ld-l">Compter jusqu'à <input type="number" id="ld-p" min="1" max="9999" step="1" value="${cs.p}" inputmode="numeric"></label>`;
      if (cs.t === "ana") h += `<label class="ld-l">Tension sur AQ0 (de 0 à 10 V) <input type="number" id="ld-x" min="0" max="10" step="0.1" value="${cs.x}" inputmode="decimal"></label>`;
    }
    const d = cs ? T.find((x) => x[0] === cs.t) : null;
    h += `<p class="ld-aide">${d ? `<b>${esc(d[1])}</b> : ${esc(d[2])}.` : sortie ? "Choisis ce que la ligne commande quand elle est alimentée." : "Choisis un contact ou un fil. Une case vide coupe la ligne."}</p></div>`;
    return h;
  }
  const auto = () => ({ t: "f", a: 1 });
  function placerCase(R, l, c) {   // relier le nouvel élément à gauche (élément, liaison ou rail) et à droite
    const row = R.l[l].c;
    let from = 0;
    for (let bb = c; bb >= 0; bb--) {
      if (bb === 0) { from = 0; break; }
      if (touche(R, l, bb)) { from = bb; break; }
      const q = row[bb - 1]; if (q && !q.a) { from = bb; break; }
    }
    for (let k = from; k < c; k++) if (!row[k]) row[k] = auto();
    for (let bb = c + 1; bb <= COLS; bb++) {
      if (touche(R, l, bb) || (bb < COLS && row[bb] && !row[bb].a)) { for (let k = c + 1; k < bb; k++) if (!row[k]) row[k] = auto(); break; }
    }
  }
  function apresLien(R, l, b) {   // une nouvelle liaison verticale à la limite b, entre les lignes l et l + 1
    for (const r of [l, l + 1]) {
      const row = R.l[r].c;
      let k = b - 1; while (k >= 0 && (!row[k] || row[k].a)) k--;
      let entre = false; for (let bb = Math.max(1, k + 1); bb < b; bb++) if (touche(R, r, bb)) entre = true;
      if (!entre) {
        if (k < 0) { for (let q = 0; q < b; q++) if (row[q] && row[q].a) row[q] = null; }   // la branche commence à la liaison
        else for (let q = k + 1; q < b; q++) if (!row[q]) row[q] = auto();
      }
      let j = b; while (j < COLS && (!row[j] || row[j].a)) j++;
      entre = false; for (let bb = b + 1; bb <= Math.min(j, COLS); bb++) if (touche(R, r, bb)) entre = true;
      if (j < COLS && !entre) for (let q = b; q < j; q++) if (!row[q]) row[q] = auto();
    }
  }
  function choisirType(t) {
    const P = prog(), R = P.ladder[sel.r];
    if (sel.c === COLS) {
      const old = R.l[sel.l].s;
      if (!t) R.l[sel.l].s = null;
      else {
        const garde = old && old.v && old.t !== "ana" && SA.sorteAdr(SA.resoudre(old.v, SA.tableInverse(P.noms)) || "");
        let v = "";
        if (t === "ton" || t === "tof") v = garde === "TM" ? old.v : libre(P, "%TM");
        else if (t === "ctu") v = garde === "C" ? old.v : libre(P, "%C");
        else if (t === "ana") v = "%QW0";
        else if (old && old.v && garde && (t === "r" ? /^(Q|M|TM|C)$/.test(garde) : /^(Q|M)$/.test(garde))) v = old.v;
        R.l[sel.l].s = { t, v, p: t === "ctu" ? (old && old.t === "ctu" ? old.p : 5) : old && (old.t === "ton" || old.t === "tof") ? old.p : 3, x: old && old.t === "ana" ? old.x : 5 };
        R.l[sel.l].s = SA.validerProg({ ladder: [{ l: [{ c: [], s: R.l[sel.l].s }] }] }).ladder[0].l[0].s;
        if (!v) sel.focus = true;
      }
    } else {
      const old = R.l[sel.l].c[sel.c];
      if (!t) R.l[sel.l].c[sel.c] = null;
      else if (t === "f") { R.l[sel.l].c[sel.c] = { t: "f" }; placerCase(R, sel.l, sel.c); }
      else { R.l[sel.l].c[sel.c] = { t, v: old && old.v ? old.v : "" }; placerCase(R, sel.l, sel.c); if (!(old && old.v)) sel.focus = true; }
    }
    changer();
  }
  function libre(P, pref) {
    const pris = new Set();
    for (const R of P.ladder) for (const li of R.l) if (li.s && li.s.v) { const a = SA.resoudre(li.s.v, SA.tableInverse(P.noms)); if (a) pris.add(a); }
    for (let k = 0; k < 16; k++) if (!pris.has(pref + k)) return pref + k;
    return pref + "0";
  }
  function poserVariable(txt) {
    const P = prog(), R = P.ladder[sel.r], cs = sel.c === COLS ? R.l[sel.l].s : R.l[sel.l].c[sel.c]; if (!cs) return;
    const s = String(txt || "").trim(), a = SA.resoudre(s, SA.tableInverse(P.noms));
    cs.v = a || s.slice(0, 16);
    changer();
  }

  /* ---------- GRAFCET : le dessin et les formulaires ---------- */
  function htmlGrafcet(P) {
    return `<div class="gf-zone"><div class="gf-dessin" id="gf-dessin">${svgGrafcet(P, null, { edit: true })}</div><div class="gf-forms">${formsGrafcet(P)}</div></div>`;
  }
  function majDessinG() { const z = $("gf-dessin"); if (z) z.innerHTML = svgGrafcet(prog(), null, { edit: true }); }
  const TYPES_ACTION = [["n", "action continue"], ["s", "mise à 1 (S) à l'activation"], ["r", "mise à 0 (R) à l'activation"], ["inc", "compter +1 à l'activation"], ["ana", "consigne 0-10 V (AQ0)"]];
  function formsGrafcet(P) {
    const G = P.grafcet, entreesNom = Object.keys(P.noms).filter((a) => /^%I/.test(a)).map((a) => P.noms[a]);
    let h = `<h3>Étapes</h3>`;
    G.etapes.forEach((e, i) => {
      h += `<div class="gf-e" data-e="${i}" id="gf-e-${i}"><div class="gf-l1"><span class="gf-num">Étape</span><input type="number" class="gf-n" data-e="${i}" value="${e.n}" min="0" max="99" inputmode="numeric" aria-label="Numéro de l'étape"><label class="gf-ini"><input type="checkbox" class="gf-init" data-e="${i}"${e.init ? " checked" : ""}> initiale</label><input type="text" class="gf-com" data-e="${i}" value="${esc(e.com)}" maxlength="40" placeholder="ce qu'elle fait (facultatif)"><button class="gf-x" type="button" data-x-e="${i}" title="Supprimer l'étape" aria-label="Supprimer l'étape ${e.n}">✕</button></div>`;
      e.actions.forEach((a, k) => {
        h += `<div class="gf-a"><select class="gf-at" data-e="${i}" data-k="${k}" aria-label="Sorte d'action">${TYPES_ACTION.map(([t, n]) => `<option value="${t}"${a.t === t ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
        h += a.t === "ana" ? `<label class="gf-v">tension <input type="number" class="gf-ax" data-e="${i}" data-k="${k}" min="0" max="10" step="0.1" value="${a.x}" inputmode="decimal"> V</label>` : `<input type="text" class="gf-av" data-e="${i}" data-k="${k}" list="pg-dl" value="${esc(affV(P, a.v))}" placeholder="${a.t === "inc" ? "%C0" : "KM1, %Q0.0"}" spellcheck="false" autocomplete="off" aria-label="Variable de l'action">`;
        if (a.t === "n" || a.t === "ana") h += `<input type="text" class="gf-asi" data-e="${i}" data-k="${k}" value="${esc(a.si || "")}" placeholder="si… (facultatif)" spellcheck="false" aria-label="Condition">`;
        h += `<button class="gf-x" type="button" data-x-a="${i},${k}" title="Supprimer l'action" aria-label="Supprimer l'action">✕</button></div>`;
      });
      h += `<button class="gf-plus" type="button" data-a-e="${i}">+ action</button></div>`;
    });
    h += `<div class="rang"><button class="btn" type="button" data-pg="etape+">+ Étape et sa transition</button></div>`;
    h += `<h3>Transitions</h3><div class="gf-sym" role="toolbar" aria-label="Écrire dans la réceptivité">${[["·", " · ", "ET"], ["+", " + ", "OU"], ["/", "/", "NON (barre)"], ["↑", "↑", "front montant"], ["↓", "↓", "front descendant"], ["( )", "()", "parenthèses"], ["t/X…/…s", "t/X1/2s", "temporisation"], ["1", "1", "toujours vraie"]].concat(entreesNom.map((n) => [n, n, "entrée " + n])).map(([l, v, t]) => `<button type="button" data-ins="${esc(v)}" title="${esc(t)}">${esc(l)}</button>`).join("")}</div>`;
    G.transitions.forEach((t, k) => {
      h += `<div class="gf-t" data-t="${k}" id="gf-t-${k}"><span class="gf-tn">(${k + 1})</span><label>de <input type="text" class="gf-de" data-t="${k}" value="${t.de.join(", ")}" inputmode="numeric" aria-label="Étape d'avant"></label><label>vers <input type="text" class="gf-vers" data-t="${k}" value="${t.vers.join(", ")}" inputmode="numeric" aria-label="Étape d'après"></label><input type="text" class="gf-r" data-t="${k}" value="${esc(t.r)}" placeholder="réceptivité : dcy · a" spellcheck="false" autocomplete="off" aria-label="Réceptivité"><button class="gf-x" type="button" data-x-t="${k}" title="Supprimer la transition" aria-label="Supprimer la transition ${k + 1}">✕</button></div>`;
    });
    h += `<div class="rang"><button class="btn sec" type="button" data-pg="trans+">+ Transition</button></div>`;
    return h;
  }
  function renumeroter(P, ancien, nouveau) {
    for (const t of P.grafcet.transitions) { t.de = t.de.map((n) => (n === ancien ? nouveau : n)); t.vers = t.vers.map((n) => (n === ancien ? nouveau : n)); }
    const re = new RegExp(`(^|[^0-9A-Za-z_])(%?X)${ancien}(?![0-9])`, "g"), re2 = new RegExp(`(t\\s*/\\s*)${ancien}(\\s*/)`, "g");
    const f = (s) => String(s || "").replace(re, (m, a, x) => a + x + nouveau).replace(re2, (m, a, b) => a + nouveau + b);
    for (const t of P.grafcet.transitions) t.r = f(t.r);
    for (const e of P.grafcet.etapes) for (const a of e.actions) if (a.si) a.si = f(a.si);
  }

  /* ---------- les événements de la fenêtre (posés une seule fois) ---------- */
  function brancher() {
    const C = $("d-prog-c"); if (!C) return;
    C.addEventListener("click", (e) => {
      if (!ctx) return;
      const b = e.target.closest("button, [data-cell], [data-lien], [data-ge], [data-gt]"); if (!b || !C.contains(b)) return;
      const P = prog();
      if (b.dataset.lang) { if (P.lang !== b.dataset.lang) { P.lang = b.dataset.lang; sel = null; changer(); } return; }
      if (b.dataset.pg === "noms") { nomsOuverts = !nomsOuverts; $("pg-noms").hidden = !nomsOuverts; b.setAttribute("aria-expanded", nomsOuverts); return; }
      if (b.dataset.pg === "aide") { const z = $("pg-aide"); z.hidden = !z.hidden; b.setAttribute("aria-expanded", !z.hidden); return; }
      if (b.dataset.pg === "proposer") {
        const R = propositions(ctx.h.schema(), pc(), P), n = Object.keys(R).length;
        Object.assign(P.noms, R); changer();
        dire(n ? `${n} mnémonique${n > 1 ? "s" : ""} d'après le câblage. Tu peux les changer.` : "Rien à proposer : les entrées et sorties câblées ont déjà un nom.", 3500);
        return;
      }
      // Ladder
      if (b.dataset.cell) { const [l, c] = b.dataset.cell.split(",").map(Number), r = +b.closest("[data-r]").dataset.r; sel = sel && sel.r === r && sel.l === l && sel.c === c ? null : { r, l, c }; surSuppr = null; rendre(); return; }
      if (b.dataset.lien) { const [l, bb] = b.dataset.lien.split(",").map(Number), r = +b.closest("[data-r]").dataset.r, R = P.ladder[r], A = R.v[l], i = A.indexOf(bb); if (i >= 0) A.splice(i, 1); else { A.push(bb); A.sort((x, y) => x - y); apresLien(R, l, bb); } changer(); return; }
      if (b.dataset.ty !== undefined) { choisirType(b.dataset.ty); return; }
      if (b.dataset.puce) { poserVariable(b.dataset.puce); return; }
      if (b.dataset.rb) {
        const r = +b.dataset.r, R = P.ladder[r];
        switch (b.dataset.rb) {
          case "haut": if (r > 0) { P.ladder.splice(r - 1, 0, P.ladder.splice(r, 1)[0]); sel = null; } break;
          case "bas": if (r < P.ladder.length - 1) { P.ladder.splice(r + 1, 0, P.ladder.splice(r, 1)[0]); sel = null; } break;
          case "ligne+": if (R.l.length < SA.LIGNES_MAX) { R.l.push(SA.ligneVide()); R.v.push([]); } break;
          case "ligne-": if (R.l.length > 1) { const l = sel && sel.r === r ? sel.l : R.l.length - 1; R.l.splice(l, 1); R.v.splice(Math.min(l, R.v.length - 1), 1); sel = null; } break;
          case "suppr": {
            const vide = !R.l.some((li) => li.s || li.c.some(Boolean));
            if (!vide && surSuppr !== r) { surSuppr = r; rendre(); return; }
            P.ladder.splice(r, 1); if (!P.ladder.length) P.ladder.push(SA.reseauVide()); sel = null; surSuppr = null; break;
          }
        }
        changer(); return;
      }
      if (b.dataset.pg === "reseau+") { P.ladder.push(SA.reseauVide()); sel = { r: P.ladder.length - 1, l: 0, c: 0 }; changer(); const z = C.querySelector(`[data-r="${P.ladder.length - 1}"]`); if (z) z.scrollIntoView({ block: "nearest" }); return; }
      // GRAFCET
      const G = P.grafcet;
      if (b.dataset.ge) { const z = $("gf-e-" + b.dataset.ge); if (z) { z.scrollIntoView({ block: "nearest", behavior: "smooth" }); z.classList.add("flash"); setTimeout(() => z.classList.remove("flash"), 900); } return; }
      if (b.dataset.gt) { const z = $("gf-t-" + b.dataset.gt); if (z) { z.scrollIntoView({ block: "nearest", behavior: "smooth" }); const i = z.querySelector(".gf-r"); if (i) i.focus(); } return; }
      if (b.dataset.pg === "etape+") {
        const n = G.etapes.reduce((m, e) => Math.max(m, e.n), -1) + 1, der = G.etapes[G.etapes.length - 1];
        if (n >= 100) return;
        G.etapes.push({ n, init: false, com: "", actions: [] });
        if (der) G.transitions.push({ de: [der.n], vers: [n], r: "" });
        changer();
        const i = C.querySelector(`#gf-t-${G.transitions.length - 1} .gf-r`); if (i) i.focus();
        return;
      }
      if (b.dataset.pg === "trans+") { G.transitions.push({ de: [], vers: [], r: "" }); changer(); const i = C.querySelector(`#gf-t-${G.transitions.length - 1} .gf-de`); if (i) i.focus(); return; }
      if (b.dataset.aE !== undefined) { const e = G.etapes[+b.dataset.aE]; if (e.actions.length < 8) e.actions.push({ t: "n", v: "" }); changer(); const i = C.querySelector(`#gf-e-${b.dataset.aE} .gf-a:last-of-type .gf-av`); if (i) i.focus(); return; }
      if (b.dataset.xE !== undefined) {
        const i = +b.dataset.xE, n = G.etapes[i].n; G.etapes.splice(i, 1);
        for (const t of G.transitions) { t.de = t.de.filter((x) => x !== n); t.vers = t.vers.filter((x) => x !== n); }
        G.transitions = G.transitions.filter((t) => t.de.length && t.vers.length);
        if (!G.etapes.length) G.etapes.push({ n: 0, init: true, com: "", actions: [] });
        changer(); return;
      }
      if (b.dataset.xA) { const [i, k] = b.dataset.xA.split(",").map(Number); G.etapes[i].actions.splice(k, 1); changer(); return; }
      if (b.dataset.xT !== undefined) { G.transitions.splice(+b.dataset.xT, 1); changer(); return; }
      if (b.dataset.ins !== undefined) { inserer(b.dataset.ins); return; }
    });
    C.addEventListener("change", (e) => {
      if (!ctx) return;
      const el = e.target, P = prog(), G = P.grafcet;
      if (el.classList.contains("pg-nom")) { changerNom(el.dataset.a, el.value); return; }
      if (el.classList.contains("ld-com")) { P.ladder[+el.dataset.r].com = el.value.slice(0, 60); changer(false); return; }
      if (el.id === "ld-v") { poserVariable(el.value); return; }
      if (el.id === "ld-p" || el.id === "ld-x") {
        const R = P.ladder[sel.r], s = R.l[sel.l].s; if (!s) return;
        const x = Number(String(el.value).replace(",", "."));
        if (Number.isFinite(x)) { if (el.id === "ld-x") s.x = Math.max(0, Math.min(10, Math.round(x * 100) / 100)); else s.p = s.t === "ctu" ? Math.max(1, Math.min(9999, Math.round(x))) : Math.max(0.1, Math.min(3600, Math.round(x * 10) / 10)); }
        changer(); return;
      }
      const i = +el.dataset.e, k = +el.dataset.k, t = +el.dataset.t;
      if (el.classList.contains("gf-n")) {
        const n = Math.round(Number(el.value)), anc = G.etapes[i].n;
        if (!(n >= 0 && n < 100) || G.etapes.some((x, j) => j !== i && x.n === n)) { dire(G.etapes.some((x, j) => j !== i && x.n === n) ? `Il y a déjà une étape ${n}.` : "Un numéro d'étape va de 0 à 99.", 3000); rendre(); return; }
        G.etapes[i].n = n; renumeroter(P, anc, n); changer(); return;
      }
      if (el.classList.contains("gf-init")) { G.etapes[i].init = el.checked; changer(false); return; }
      if (el.classList.contains("gf-com")) { G.etapes[i].com = el.value.slice(0, 40); changer(false); return; }
      if (el.classList.contains("gf-at")) { const a = G.etapes[i].actions[k]; a.t = el.value; if (a.t === "ana") { a.v = "%QW0"; if (a.x == null) a.x = 5; } else if (a.v === "%QW0") a.v = ""; if (a.t !== "n" && a.t !== "ana") delete a.si; changer(); return; }
      if (el.classList.contains("gf-av")) { const s = el.value.trim(), a2 = SA.resoudre(s, SA.tableInverse(P.noms)); G.etapes[i].actions[k].v = a2 || s.slice(0, 16); changer(false); return; }
      if (el.classList.contains("gf-ax")) { const x = Number(String(el.value).replace(",", ".")); if (Number.isFinite(x)) G.etapes[i].actions[k].x = Math.max(0, Math.min(10, Math.round(x * 100) / 100)); changer(false); return; }
      if (el.classList.contains("gf-asi")) { const v = el.value.trim().slice(0, 60); if (v) G.etapes[i].actions[k].si = v; else delete G.etapes[i].actions[k].si; changer(false); return; }
      if (el.classList.contains("gf-de") || el.classList.contains("gf-vers")) { G.transitions[t][el.classList.contains("gf-de") ? "de" : "vers"] = SA.listeEtapes(el.value); changer(false); return; }
      if (el.classList.contains("gf-r")) { G.transitions[t].r = el.value.slice(0, 80); changer(false); return; }
    });
    C.addEventListener("focusin", (e) => { if (e.target.matches && e.target.matches(".gf-r, .gf-asi")) dernierChamp = e.target; });
    C.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches && e.target.matches("input[type=text], input[type=number]")) { e.preventDefault(); e.target.blur(); } });
  }
  brancher();
  function inserer(v) {
    const el = dernierChamp && dernierChamp.isConnected ? dernierChamp : $("d-prog-c").querySelector("input.gf-r");
    if (!el) return;
    const a = el.selectionStart == null ? el.value.length : el.selectionStart, b = el.selectionEnd == null ? a : el.selectionEnd;
    el.value = el.value.slice(0, a) + v + el.value.slice(b);
    const pos = v === "()" ? a + 1 : a + v.length;
    el.focus(); try { el.setSelectionRange(pos, pos); } catch (x) { /* rien */ }
    el.dispatchEvent(new Event("change", { bubbles: true }));
    setTimeout(() => { const i = el.isConnected ? el : null; if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) { /* rien */ } } }, 0);
  }
  for (const d of [$("d-prog")]) if (d) d.addEventListener("close", () => { ctx = null; });

  const AIDE_LADDER = `<p><b>Un réseau se lit de gauche à droite.</b> Le rail de gauche est sous tension ; la sortie de la ligne (à droite) est commandée quand un chemin de contacts fermés la relie au rail.</p>
    <ul><li>Touche une case pour y mettre un <b>contact</b> : à fermeture —| |— (passe si la variable vaut 1), à ouverture —|/|— (passe si elle vaut 0), front montant P (un seul cycle).</li>
    <li>Des contacts sur la même ligne sont <b>en série</b> (ET). Pour un <b>OU</b>, ajoute une ligne, mets-y un contact, et relie les deux lignes avec les boutons <b>+</b> (liaisons verticales).</li>
    <li>La case de droite reçoit la <b>sortie</b> : bobine, mise à 1 (S) ou à 0 (R), temporisation, compteur, ou une consigne 0-10 V sur AQ0.</li>
    <li>Un bouton d'arrêt à ouverture câblé sur une entrée met cette entrée à 1 au repos : dans le programme, il se met avec un contact <b>à fermeture</b>.</li></ul>`;
  const AIDE_GRAFCET = `<p><b>Le GRAFCET décrit un cycle, étape par étape.</b> Une étape active commande ses actions ; une transition est franchie quand l'étape d'avant est active et que sa réceptivité est vraie.</p>
    <ul><li>Réceptivité : <b>dcy · a</b> (ET), <b>a + b</b> (OU), <b>/a</b> (NON a), <b>↑dcy</b> (front montant), <b>t/X2/3s</b> (3 s après l'activation de l'étape 2), <b>1</b> (toujours vraie).</li>
    <li>Action continue : la sortie vaut 1 tant que l'étape est active (avec une condition « si… » si besoin). S et R : mise à 1 ou à 0 quand l'étape s'active, la valeur reste.</li>
    <li>Pour revenir au début, la dernière transition va <b>vers 0</b> : le dessin trace la boucle à gauche.</li>
    <li>Une étape vers deux étapes (« vers 2, 4 ») : elles s'activent ensemble (ET). Deux transitions sous une même étape : un choix (OU).</li></ul>`;

  /* =====================================================================
     LA VUE EN DIRECT (pendant la simulation), dans un cadre au-dessus de la feuille
     ===================================================================== */
  let livePc = null, liveReduit = false;
  function liveOuvrir(piece, E) { livePc = piece; const z = $("sc-live"); if (!z) return; z.hidden = false; liveMaj(E); }
  function liveFermer() { livePc = null; const z = $("sc-live"); if (z) { z.hidden = true; z.innerHTML = ""; } }
  function liveMaj(E) {
    const z = $("sc-live"); if (!livePc || !z || z.hidden) return;
    const A = E && E.appareils[livePc.ref], api = A && A.api, P = SA.validerProg(livePc.prog);
    const etat = !A ? "" : A.grille ? "détruit" : !A.alim ? "hors tension" : !A.run ? "STOP" : "RUN";
    const actif = !!(A && A.actif);
    let corps;
    if (P.lang === "ladder") corps = P.ladder.map((R, ri) => `<div class="lv-res"><div class="lv-t">Réseau ${ri + 1}${R.com ? ` · ${esc(R.com)}` : ""}</div>${svgReseau(P, R, ri, actif && api && api.flux && api.flux[ri] ? api.flux[ri] : null, { api: actif ? api : null })}</div>`).join("");
    else corps = svgGrafcet(P, actif ? api : null, {}) + (actif && api ? `<p class="lv-x">Étapes actives : ${api.X.map((n) => "X" + n).join(", ") || "aucune"}</p>` : "");
    const ancien = z.querySelector(".lv-corps"), haut = ancien ? ancien.scrollTop : 0;
    z.innerHTML = `<div class="lv-tete"><b>${esc(livePc.ref)}</b><span class="lv-etat ${etat === "RUN" ? "ok" : "ko"}">${etat}</span><span class="lv-l">${P.lang === "ladder" ? "Ladder" : "GRAFCET"} · en direct</span><button class="d-x lv-r" type="button" data-lv="r" aria-label="${liveReduit ? "Agrandir" : "Réduire"} la vue du programme" title="${liveReduit ? "Agrandir" : "Réduire"}">${liveReduit ? "▴" : "▾"}</button><button class="d-x" type="button" data-lv="x" aria-label="Fermer la vue du programme">×</button></div><div class="lv-corps"${liveReduit ? " hidden" : ""}>${corps}</div>`;
    const c = z.querySelector(".lv-corps"); if (c) c.scrollTop = haut;
    z.querySelector('[data-lv="x"]').onclick = liveFermer;
    z.querySelector('[data-lv="r"]').onclick = () => { liveReduit = !liveReduit; liveMaj(E); };
  }

  window.SchemasProgramme = { ouvrir, fermer, resume, cablage, propositions, svgReseau, svgGrafcet,
    live: { ouvrir: liveOuvrir, fermer: liveFermer, maj: liveMaj, ref: () => (livePc ? livePc.ref : null) } };
})();
