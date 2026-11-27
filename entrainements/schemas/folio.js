/* =====================================================================
   Atelier schémas — le REPÉRAGE DU FOLIO et la NOMENCLATURE (aucun accès à la page : marche aussi dans Node)
   analyser(schéma) → { colonnes, numéros de fils, renvois, nomenclature, bornier } ; svg(schéma, analyse) → le dessin
   - colonnes de 10 pas, numérotées en haut de la feuille, de gauche à droite ;
   - numéros de fils : une équipotentielle reliée à un repère de potentiel (L, N, +24 V, 0 V, PE) ou à une borne du
     réseau (L1, L2, L3, N, PE) porte son nom ; les autres sont numérotées 1, 2, 3… colonne par colonne, de haut en bas ;
   - renvois : sous chaque bobine (et chaque relais thermique), ses contacts et la colonne où ils sont ; près de chaque
     contact, la colonne de sa bobine ;
   - nomenclature : un appareil par repère (désignation, caractéristiques, colonnes) ;
   - bornier X1 : les bornes des appareils du terrain (moteurs, capteurs, fins de course, électrovannes), reliées à
     l'armoire par un fil numéroté.
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;
  const W = 10;   // largeur d'une colonne, en pas
  const BOB = new Set(["bobine", "relais", "tempo_travail", "tempo_repos"]);
  const LIES = { contact_no: "no", contact_nf: "nf", contact_tno: "no", contact_tnf: "nf", contact_th_nf: "nf", contact_th_no: "no", poles: "poles" };
  const TERRAIN = new Set(["moteur", "moteur6", "fdc_no", "fdc_nf", "capteur", "capteur3", "electrovanne"]);
  const PO = new Set(["chariot", "cuve", "tapis", "tri", "barriere", "montecharge", "station"]);
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nb = (x) => String(x).replace(".", ",");
  const tens = (id) => { const t = (M.TENSIONS || []).find((q) => q.id === id); return t ? t.nom : id || ""; };
  const naturel = (a, b) => String(a).localeCompare(String(b), "fr", { numeric: true, sensitivity: "base" });

  // ce que chaque capteur ou moteur fait pour une partie opérative (pour la nomenclature)
  const ROLES = {
    chariot: { moteur: "moteur du chariot", gauche: "fin de course gauche", droite: "fin de course droite" },
    cuve: { moteur: "moteur de la pompe", bas: "niveau bas de la cuve", haut: "niveau haut de la cuve" },
    tapis: { moteur: "moteur du tapis", capteur: "cellule : voit passer les caisses" },
    tri: { moteur: "moteur du tapis", capteur: "cellule au bout du tapis", verin: "électrovanne du vérin", rentre: "vérin rentré", sorti: "vérin sorti" },
    barriere: { moteur: "moteur de la lisse", haut: "barrière levée", bas: "barrière baissée", amont: "boucle de détection amont", aval: "boucle de détection aval" },
    montecharge: { moteur: "moteur du treuil", bas: "cabine au niveau 0", haut: "cabine au niveau 1", ralbas: "ralentissement avant le niveau 0", ralhaut: "ralentissement avant le niveau 1", porte: "porte fermée" },
    station: { pompe1: "pompe P1 (0,75 kW)", pompe2: "pompe P2 (0,37 kW)", pompe3: "pompe P3 (0,37 kW)", tbas: "électrode très bas (10 %)", bas: "électrode bas (30 %)", haut: "électrode haut (70 %)", thaut: "électrode très haut (90 %)" }
  };

  function analyser(s, net) {
    net = net || M.netlist(s);
    const b = M.bornesDe(s), vide = !b.every(Number.isFinite);   // feuille vide : pas de colonnes
    const x0 = vide ? 0 : Math.floor(b[0]) - 2, n = vide ? 0 : Math.max(1, Math.ceil((b[2] + 2 - x0) / W));
    const col = (x) => Math.min(n, Math.max(1, Math.floor((x - x0) / W) + 1));
    const parId = new Map(s.pieces.map((pc) => [pc.id, pc]));

    // ---------- les équipotentielles : leur nom, et qui y est relié
    const nom = new Map(), sur = new Map();
    for (const [k, i] of Object.entries(net.borne)) { const c = k.indexOf(":"), pc = parId.get(k.slice(0, c)); if (pc) (sur.get(i) || sur.set(i, []).get(i)).push([pc, k.slice(c + 1)]); }
    for (const pc of s.pieces) {
      if (pc.type === "alim") { const k = net.borne[pc.id + ":a"]; if (k != null && !nom.has(k)) nom.set(k, String(M.parametres(pc).pot || "")); }
      if (pc.type === "reseau") for (const id of ["L1", "L2", "L3", "N", "PE"]) { const k = net.borne[pc.id + ":" + id]; if (k != null && !nom.has(k)) nom.set(k, id); }
    }
    // les autres : 1, 2, 3… colonne par colonne, de haut en bas (le point de leurs fils le plus à gauche, puis le plus haut)
    const premier = new Map();
    for (const f of s.fils) {
      const k = net.fil[f.id]; if (k == null) continue;
      for (const p of f.pts) { const c = [col(p[0]), p[1], p[0]], a = premier.get(k); if (!a || c[0] < a[0] || (c[0] === a[0] && (c[1] < a[1] || (c[1] === a[1] && c[2] < a[2])))) premier.set(k, c); }
    }
    [...premier.keys()].filter((k) => !nom.has(k)).sort((a, z) => { const A = premier.get(a), Z = premier.get(z); return A[0] - Z[0] || A[1] - Z[1] || A[2] - Z[2]; })
      .forEach((k, i) => nom.set(k, String(i + 1)));

    // ---------- une étiquette par fil d'au moins 2 pas (sur son plus long segment) ; une équipotentielle sans fil assez long : son plus long fil
    const fils = [];
    for (const f of s.fils) {
      const k = net.fil[f.id]; if (k == null || !nom.has(k)) continue;
      let m = null;
      for (let i = 1; i < f.pts.length; i++) { const a = f.pts[i - 1], c = f.pts[i], L = Math.abs(c[0] - a[0]) + Math.abs(c[1] - a[1]); if (!m || L > m.L) m = { a, c, L }; }
      if (m) fils.push({ fil: f.id, k, nom: nom.get(k), L: m.L, x: (m.a[0] + m.c[0]) / 2, y: (m.a[1] + m.c[1]) / 2, h: m.a[1] === m.c[1] });
    }
    const etiquettes = fils.filter((e) => e.L >= 2);
    for (const k of new Set(fils.map((e) => e.k))) if (!etiquettes.some((e) => e.k === k)) etiquettes.push(fils.filter((e) => e.k === k).sort((a, z) => z.L - a.L)[0]);

    // ---------- renvois : la tête (bobine, ou relais thermique) et ses contacts
    const parRef = new Map();
    for (const pc of s.pieces) if (pc.ref && !PO.has(pc.type)) (parRef.get(pc.ref) || parRef.set(pc.ref, []).get(pc.ref)).push(pc);
    const renvois = {}, retours = {};
    for (const [, L] of parRef) {
      const bob = L.find((pc) => BOB.has(pc.type)), th = L.find((pc) => pc.type === "thermique");
      for (const tete of [bob, th]) {
        if (!tete) continue;
        const lignes = [];
        for (const pc of L) {
          const nat = LIES[pc.type]; if (!nat || /^contact_th/.test(pc.type) !== (tete === th)) continue;
          lignes.push({ nat, num: nat === "poles" ? "1-2 3-4 5-6" : M.parametres(pc).num || "", col: col(pc.x), id: pc.id });
          retours[pc.id] = col(tete.x);
        }
        const ordre = { poles: 0, no: 1, nf: 2 };
        lignes.sort((a, z) => ordre[a.nat] - ordre[z.nat] || naturel(a.num, z.num));
        if (lignes.length) renvois[tete.id] = lignes;
      }
    }

    // ---------- nomenclature
    const roles = {};
    for (const pc of s.pieces) if (ROLES[pc.type]) { const P = M.parametres(pc); for (const [k, t] of Object.entries(ROLES[pc.type])) { const r = String(P[k] || "").trim(); if (r) (roles[r] = roles[r] || []).push(t + " de " + pc.ref); } }
    const nomenclature = [];
    for (const [ref, L] of [...parRef].sort((a, z) => naturel(a[0], z[0]))) {
      const tete = L.find((pc) => BOB.has(pc.type)) || L.find((pc) => !LIES[pc.type]) || L[0];
      const P = M.parametres(tete), num = (pc) => M.parametres(pc).num || "";
      const contacts = L.filter((pc) => LIES[pc.type] && LIES[pc.type] !== "poles").map((pc) => `${num(pc)} (${LIES[pc.type] === "no" ? "NO" : "NF"})`);
      const poles = L.some((pc) => pc.type === "poles");
      let d = M.TYPES[tete.type] ? M.TYPES[tete.type].nom : tete.type, c = [];
      switch (tete.type) {
        case "bobine": d = "Contacteur"; c = [`bobine ${tens(P.tension)}`, poles ? "3 pôles de puissance" : ""]; break;
        case "relais": d = "Relais auxiliaire"; c = [`bobine ${tens(P.tension)}`]; break;
        case "tempo_travail": case "tempo_repos": d = `Relais temporisé ${tete.type === "tempo_travail" ? "travail" : "repos"}`; c = [`${nb(P.delai)} s`, `bobine ${tens(P.tension)}`]; break;
        case "thermique": d = "Relais thermique"; c = [`Ir ${nb(P.cal)} A`]; break;
        case "sectionneur": d = "Sectionneur porte-fusibles"; c = [`fusibles ${nb(P.cal)} A`]; break;
        case "disjoncteur": d = "Disjoncteur"; c = [`${P.poles} pôles`, `${nb(P.cal)} A`]; break;
        case "disj_moteur": d = "Disjoncteur-moteur"; c = [`Ir ${nb(P.cal)} A`]; break;
        case "fusible": d = "Fusible"; c = [`${nb(P.cal)} A`]; break;
        case "transfo": d = "Transformateur de commande"; c = [`${P.prim} V / ${P.sec} V`]; break;
        case "voyant": d = "Voyant"; c = [P.couleur, tens(P.tension)]; break;
        case "electrovanne": d = "Électrovanne (bobine de distributeur)"; c = [tens(P.tension)]; break;
        case "moteur": d = "Moteur asynchrone triphasé"; break;
        case "moteur6": d = "Moteur asynchrone triphasé (6 bornes)"; c = [`plaque ${P.plaque} V`]; break;
        case "capteur": d = "Détecteur (contact)"; break;
        case "capteur3": d = `Détecteur ${P.detection} 3 fils`; c = [`${P.type}, sortie ${P.sortie}`]; break;
        case "automate": d = "Automate programmable"; c = ["8 entrées 24 V", "8 sorties à relais", tete.prog && tete.prog.lang === "grafcet" ? "GRAFCET" : tete.prog && tete.prog.lang === "ladder" ? "Ladder" : ""]; break;
        case "variateur": d = "Variateur de vitesse"; c = [`HSP ${nb(P.hsp)} Hz`, `ACC ${nb(P.acc)} s`, `DEC ${nb(P.dec)} s`]; break;
        case "potentiometre": d = "Potentiomètre de consigne"; break;
        default:
      }
      if (/^(bp_no|bp_nf|arret_urgence|selecteur|interrupteur|fdc_no|fdc_nf|capteur)$/.test(tete.type)) contacts.unshift(`${num(tete)} (${M.nature(tete) === "nf" ? "NF" : "NO"})`);
      if (contacts.length) c.push("contacts " + contacts.join(", "));
      if (roles[ref]) c.push(roles[ref].join(", "));
      nomenclature.push({ ref, designation: d, caracteristiques: c.filter(Boolean).join(" · "), colonnes: [...new Set(L.map((pc) => col(pc.x)))].sort((a, z) => a - z) });
    }

    // ---------- bornier X1 : les bornes du terrain reliées à l'armoire
    const bornier = [];
    const terrain = s.pieces.filter((pc) => TERRAIN.has(pc.type) && pc.ref).sort((a, z) => col(a.x) - col(z.x) || a.y - z.y || a.x - z.x);
    for (const pc of terrain) for (const bo of M.bornesAbs(pc)) {
      const k = net.borne[pc.id + ":" + bo.id]; if (k == null) continue;
      const autres = (sur.get(k) || []).filter(([q]) => q !== pc && !TERRAIN.has(q.type) && q.type !== "alim" && q.type !== "reseau");
      const pot = (sur.get(k) || []).some(([q]) => q.type === "alim" || q.type === "reseau");
      if (!autres.length && !pot) continue;   // borne libre, ou reliée seulement au terrain
      const a = autres[0], bn = (q, id) => { const x = M.bornesAbs(q).find((z) => z.id === id); return x && x.n ? x.n : id; };
      bornier.push({ borne: bornier.length + 1, fil: nom.get(k) || "?", armoire: a ? `${a[0].ref || M.TYPES[a[0].type].court}:${bn(a[0], a[1])}` : nom.get(k), terrain: `${pc.ref}:${bo.n || bo.id}` });
    }
    return { x0, n, W, y0: vide ? 0 : b[1], col, nom, etiquettes, renvois, retours, nomenclature, bornier };
  }

  /* ---------- le dessin, par-dessus le schéma (pixels : G par pas) ---------- */
  function svg(s, A, G) {
    G = G || M.G;
    if (!A.n) return "";
    const yb = (Math.floor(A.y0) - 4) * G, h = [];
    // la bande des colonnes, en haut
    h.push(`<g class="fo">`);
    for (let i = 0; i < A.n; i++) {
      const x = (A.x0 + i * A.W) * G;
      h.push(`<rect class="fo-c" x="${x}" y="${yb}" width="${A.W * G}" height="${1.8 * G}"/><text class="fo-n" x="${x + (A.W * G) / 2}" y="${yb + 0.9 * G}">${i + 1}</text>`);
    }
    // les numéros de fils
    for (const e of A.etiquettes) {
      const x = e.x * G, y = e.y * G;
      // au-dessus d'un fil horizontal ; à gauche d'un fil vertical (les numéros de bornes sont à droite)
      h.push(e.h ? `<text class="fo-f" x="${x}" y="${y - 4}" text-anchor="middle">${esc(e.nom)}</text>` : `<text class="fo-f" x="${x - 3}" y="${y + 3}" text-anchor="end">${esc(e.nom)}</text>`);
    }
    // les renvois : sous une bobine (à droite du fil qui en descend), à droite d'un relais thermique (ses fils de puissance
    // passent dessous) ; près de chaque contact, en haut à gauche, la colonne de sa bobine
    for (const pc of s.pieces) {
      const L = A.renvois[pc.id], bx = M.boiteAbs(pc);
      if (L) {
        const th = pc.type === "thermique", x = th ? bx[2] * G + 4 : pc.x * G + 5, y = th ? ((bx[1] + bx[3]) / 2) * G - (L.length - 1) * 4.5 + 3 : bx[3] * G + 9;
        L.forEach((l, i) => h.push(`<text class="fo-r" x="${x}" y="${y + i * 9}">${esc(l.num)}${l.nat === "poles" ? "" : " " + (l.nat === "no" ? "NO" : "NF")} /${l.col}</text>`));
      }
      if (A.retours[pc.id] != null) h.push(`<text class="fo-k" x="${bx[0] * G - 2}" y="${(bx[1] + 0.9) * G}" text-anchor="end">/${A.retours[pc.id]}</text>`);
    }
    h.push(`</g>`);
    return h.join("");
  }
  // le CSS du repérage (feuille et images exportées)
  const CSS = `.fo-c{fill:none;stroke:#868e96;stroke-width:.8}.fo-n{font:600 10px var(--f-mono,monospace);fill:#495057;text-anchor:middle;dominant-baseline:central}
.fo-f{font:600 8.5px var(--f-mono,monospace);fill:#0b7285;stroke:var(--sc-feuille,#fff);stroke-width:3px;paint-order:stroke;stroke-linejoin:round}
.fo-r,.fo-k{font:500 7.5px var(--f-mono,monospace);fill:#5f3dc4;stroke:var(--sc-feuille,#fff);stroke-width:2.6px;paint-order:stroke;stroke-linejoin:round}`;

  /* ---------- tableaux (texte) : nomenclature et bornier, séparés par des tabulations ou des points-virgules ---------- */
  function tableaux(A, sep) {
    sep = sep || "\t";
    const q = (x) => (sep === ";" && /[;"\n]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : String(x));
    const L = [["Repère", "Désignation", "Caractéristiques", "Colonnes"].join(sep)];
    for (const r of A.nomenclature) L.push([r.ref, r.designation, r.caracteristiques, r.colonnes.join(", ")].map(q).join(sep));
    L.push("", ["Bornier X1", "Fil", "Côté armoire", "Côté terrain"].join(sep));
    for (const r of A.bornier) L.push([`X1:${r.borne}`, r.fil, r.armoire, r.terrain].map(q).join(sep));
    return L.join("\n");
  }

  const API = { analyser, svg, tableaux, CSS, W };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasFolio = API;
})(typeof window !== "undefined" ? window : globalThis);
