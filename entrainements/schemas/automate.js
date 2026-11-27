/* =====================================================================
   Atelier schémas — l'AUTOMATE PROGRAMMABLE (API) : variables, Ladder, GRAFCET
   (aucun accès à la page : marche aussi dans Node)
   - adresses à la manière d'un M221 : %I0.0…%I0.7 (entrées), %Q0.0…%Q0.7 (sorties à relais),
     %QW0 (sortie analogique 0-10 V, borne AQ0), %M0…%M63 (bits internes), %TM0…%TM15 (temporisations),
     %C0…%C15 (compteurs), %X0…%X99 (étapes du GRAFCET) ;
   - les mnémoniques (S1, dcy, KM1…) remplacent les adresses dans le programme ;
   - Ladder : des réseaux de 5 colonnes de contacts et une colonne de sorties, lus de gauche à droite ;
     une liaison verticale réunit deux lignes (OU). Une ligne qui a une sortie est reliée à sa sortie
     après son dernier élément ;
   - GRAFCET (IEC 60848) : étapes, transitions, réceptivités (· + / ↑ ↓ t/X2/3s), actions continues,
     conditionnelles, mémorisées à l'activation (S, R), comptage, consigne analogique ;
   - un cycle : lire les entrées, exécuter le programme, écrire les sorties. scan() recommence tant que
     quelque chose change (des cycles très rapides, au même instant).
   ===================================================================== */
(function (g) {
  "use strict";
  const NE = 8, NS = 8, NM = 64, NTM = 16, NCP = 16, NX = 100, COLS = 5, LIGNES_MAX = 8, EPS = 1e-6;

  /* ---------- les adresses ---------- */
  function canon(s) {
    const t = String(s == null ? "" : s).trim().replace(/\s+/g, "").toUpperCase();
    let m;
    if ((m = /^%?I0\.([0-7])$/.exec(t))) return "%I0." + m[1];
    if ((m = /^%?Q0\.([0-7])$/.exec(t))) return "%Q0." + m[1];
    if ((m = /^%?M(\d{1,2})$/.exec(t)) && +m[1] < NM) return "%M" + +m[1];
    if ((m = /^%?X(\d{1,2})$/.exec(t))) return "%X" + +m[1];
    if ((m = /^%?TM(\d{1,2})(\.Q)?$/.exec(t)) && +m[1] < NTM) return "%TM" + +m[1];
    if ((m = /^%?C(\d{1,2})(\.D)?$/.exec(t)) && +m[1] < NCP) return "%C" + +m[1];
    if ((m = /^%?C(\d{1,2})\.V$/.exec(t)) && +m[1] < NCP) return "%C" + +m[1] + ".V";
    if (/^(%?QW0(\.0)?|AQ0)$/.test(t)) return "%QW0";
    if (t === "%S6") return "%S6";   // bit système : horloge 1 s (toujours écrit avec %, « S6 » reste un nom de bouton)
    return null;
  }
  const sorteAdr = (a) => (!a ? "" : /^%I/.test(a) ? "I" : /^%QW/.test(a) ? "QW" : /^%Q/.test(a) ? "Q" : /^%M/.test(a) ? "M" : /^%X/.test(a) ? "X" : /^%TM/.test(a) ? "TM" : /^%S/.test(a) ? "S" : /\.V$/.test(a) ? "CV" : /^%C/.test(a) ? "C" : "");
  const numAdr = (a) => { const m = /(\d+)(?:\.V)?$/.exec(a || ""); return m ? +m[1] : -1; };
  const RE_NOM = /^[A-Za-z_À-ÿ][A-Za-z0-9_À-ÿ]{0,15}$/;
  const MOTS = new Set(["et", "ou", "non", "and", "or", "not", "t"]);
  /* un mnémonique : lettres et chiffres, sans espace, qui ne ressemble pas à une adresse */
  function nomValide(n) { const s = String(n == null ? "" : n).trim(); return RE_NOM.test(s) && !MOTS.has(s.toLowerCase()) && !canon(s) ? s : ""; }
  function tableInverse(noms) { const m = new Map(); for (const a of Object.keys(noms || {})) m.set(String(noms[a]).toLowerCase(), a); return m; }
  function resoudre(txt, inv) {
    const s = String(txt == null ? "" : txt).trim(); if (!s) return null;
    if (s[0] === "%") return canon(s);
    const a = inv && inv.get(s.toLowerCase()); if (a) return a;
    return canon(s);
  }
  /* toutes les adresses, dans l'ordre de la table des mnémoniques */
  function adresses() {
    const L = [];
    for (let k = 0; k < NE; k++) L.push("%I0." + k);
    for (let k = 0; k < NS; k++) L.push("%Q0." + k);
    L.push("%QW0");
    for (let k = 0; k < 16; k++) L.push("%M" + k);
    for (let k = 0; k < 8; k++) L.push("%TM" + k);
    for (let k = 0; k < 8; k++) L.push("%C" + k);
    return L;
  }

  /* ---------- le programme : forme par défaut et lecture sûre ---------- */
  const txt = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").slice(0, max);
  const texteExpr = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, "").slice(0, max);   // les réceptivités gardent < et > (comparaisons)
  const nombre = (v, a, b, d) => { const x = Number(String(v == null ? "" : v).replace(",", ".")); return Number.isFinite(x) && String(v).trim() !== "" ? Math.max(a, Math.min(b, x)) : d; };
  const T_CASE = new Set(["f", "no", "nf", "p", "n"]);
  const T_SORTIE = new Set(["bob", "s", "r", "ton", "tof", "ctu", "ana"]);
  const T_ACTION = new Set(["n", "s", "r", "ana", "inc"]);
  const ligneVide = () => ({ c: [null, null, null, null, null], s: null });
  function reseauVide(n) { const l = []; for (let i = 0; i < (n || 1); i++) l.push(ligneVide()); return { com: "", l, v: l.slice(1).map(() => []) }; }
  function progDefaut() { return { lang: "ladder", noms: {}, ladder: [reseauVide()], grafcet: { etapes: [{ n: 0, init: true, com: "", actions: [] }], transitions: [] } }; }
  function validerCase(c) {
    if (!c || typeof c !== "object" || !T_CASE.has(c.t)) return null;
    if (c.t === "f") return c.a ? { t: "f", a: 1 } : { t: "f" };
    return { t: c.t, v: txt(c.v, 16) };
  }
  function validerSortie(s) {
    if (!s || typeof s !== "object" || !T_SORTIE.has(s.t)) return null;
    const o = { t: s.t, v: txt(s.v, 16) };
    if (s.t === "ton" || s.t === "tof") o.p = Math.round(nombre(s.p, 0.1, 3600, 3) * 10) / 10;
    if (s.t === "ctu") o.p = Math.round(nombre(s.p, 1, 9999, 3));
    if (s.t === "ana") { o.x = Math.round(nombre(s.x, 0, 10, 5) * 100) / 100; if (!o.v) o.v = "%QW0"; }
    return o;
  }
  function listeEtapes(x) {
    const src = Array.isArray(x) ? x : String(x == null ? "" : x).split(/[\s,;]+/);
    const L = [];
    for (const v of src) { const s = String(v).trim().replace(/^%?X/i, ""); if (s === "") continue; const n = Math.round(Number(s)); if (n >= 0 && n < NX && L.indexOf(n) < 0) L.push(n); }
    return L.slice(0, 12);
  }
  function validerAction(a) {
    if (!a || typeof a !== "object") return null;
    const t = T_ACTION.has(a.t) ? a.t : "n";
    const o = { t, v: txt(a.v, 16) };
    if (t === "ana") { o.x = Math.round(nombre(a.x, 0, 10, 5) * 100) / 100; if (!o.v) o.v = "%QW0"; }
    if (a.si) o.si = texteExpr(a.si, 60);
    return o;
  }
  function validerProg(o) {
    const P = progDefaut();
    if (!o || typeof o !== "object") return P;
    P.lang = o.lang === "grafcet" ? "grafcet" : "ladder";
    if (o.noms && typeof o.noms === "object") {
      const pris = new Set();
      for (const k of Object.keys(o.noms).slice(0, 200)) {
        const a = canon(k), n = nomValide(o.noms[k]);
        if (a && n && !pris.has(n.toLowerCase())) { P.noms[a] = n; pris.add(n.toLowerCase()); }
      }
    }
    if (Array.isArray(o.ladder)) {
      const L = [];
      for (const R of o.ladder.slice(0, 40)) {
        if (!R || !Array.isArray(R.l) || !R.l.length) continue;
        const l = R.l.slice(0, LIGNES_MAX).map((li) => ({ c: [0, 1, 2, 3, 4].map((i) => validerCase(li && Array.isArray(li.c) ? li.c[i] : null)), s: validerSortie(li && li.s) }));
        const v = [];
        for (let i = 0; i + 1 < l.length; i++) {
          const src = Array.isArray(R.v) && Array.isArray(R.v[i]) ? R.v[i] : [];
          v.push([...new Set(src.map((b) => Math.round(Number(b))).filter((b) => b >= 1 && b <= COLS))].sort((a, b) => a - b));
        }
        L.push({ com: txt(R.com, 60), l, v });
      }
      if (L.length) P.ladder = L;
    }
    if (o.grafcet && typeof o.grafcet === "object") {
      const E = [], vus = new Set();
      for (const e of (Array.isArray(o.grafcet.etapes) ? o.grafcet.etapes : []).slice(0, 60)) {
        if (!e) continue;
        const n = Math.round(Number(e.n)); if (!(n >= 0 && n < NX) || vus.has(n)) continue; vus.add(n);
        E.push({ n, init: !!e.init, com: txt(e.com, 40), actions: (Array.isArray(e.actions) ? e.actions : []).slice(0, 8).map(validerAction).filter(Boolean) });
      }
      const T = [];
      for (const t of (Array.isArray(o.grafcet.transitions) ? o.grafcet.transitions : []).slice(0, 80)) if (t) T.push({ de: listeEtapes(t.de), vers: listeEtapes(t.vers), r: texteExpr(t.r, 80) });
      if (E.length) P.grafcet = { etapes: E, transitions: T };
    }
    return P;
  }

  /* ---------- les réceptivités (et les conditions d'actions) ----------
     a · b (ou a.b, a*b, a et b) ; a + b (ou a ou b) ; /a (ou !a, non a, a̅) ; ↑a (ou ^a) ; ↓a ;
     t/X2/3s ou 3s/X2 ; X2 ; %C0.V >= 3 ; 1 (toujours vraie) ; parenthèses. */
  function duree(v, u) { const x = Number(String(v).replace(",", ".")); const k = !u ? 1000 : /^ms$/i.test(u) ? 1 : /^min$/i.test(u) ? 60000 : 1000; return Math.round(x * k); }
  function erreur(t) { const e = new Error(t); e.recept = true; return e; }
  function lexer(src) {
    const s = String(src == null ? "" : src), T = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const r = s.slice(i);
      let m;
      if ((m = /^t\s*\/\s*%?X?(\d{1,2})\s*\/\s*(\d+(?:[.,]\d+)?)\s*(ms|s|min)?(?![A-Za-z0-9_])/i.exec(r))) { T.push({ k: "tempo", n: +m[1], d: duree(m[2], m[3]) }); i += m[0].length; continue; }
      if ((m = /^(\d+(?:[.,]\d+)?)\s*(ms|s|min)\s*\/\s*%?X(\d{1,2})(?![0-9])/i.exec(r))) { T.push({ k: "tempo", n: +m[3], d: duree(m[1], m[2]) }); i += m[0].length; continue; }
      if ((m = /^(<=|>=|<>|!=|=|<|>|≤|≥|≠)/.exec(r))) {
        if (!T.length && m[0] === "=") { i++; continue; }   // « = 1 » : la notation de la réceptivité toujours vraie
        T.push({ k: "cmp", op: { "≤": "<=", "≥": ">=", "≠": "<>", "!=": "<>" }[m[0]] || m[0] }); i += m[0].length; continue;
      }
      if (c === "(" || c === ")") { T.push({ k: c }); i++; continue; }
      if (".·*&∙⋅".indexOf(c) >= 0) { T.push({ k: "et" }); i++; continue; }
      if ("+|".indexOf(c) >= 0) { T.push({ k: "ou" }); i++; continue; }
      if ("/!¬~".indexOf(c) >= 0) { T.push({ k: "non" }); i++; continue; }
      if ("↑^".indexOf(c) >= 0) { T.push({ k: "fm" }); i++; continue; }
      if (c === "↓") { T.push({ k: "fd" }); i++; continue; }
      if ((m = /^\d+(?:[.,]\d+)?/.exec(r)) && !/^[A-Za-z_]/.test(r.slice(m[0].length))) { T.push({ k: "nb", v: Number(m[0].replace(",", ".")) }); i += m[0].length; continue; }
      if ((m = /^%?[A-Za-z_À-ÿ][A-Za-z0-9_À-ÿ]*/.exec(r))) {
        let w = m[0], j = i + w.length;
        const suite = s.slice(j);
        let m2;
        if (/^%?[IQ]0$/i.test(w) && (m2 = /^\.[0-7](?![0-9])/.exec(suite))) { w += m2[0]; j += m2[0].length; }
        else if (/^%?(TM|C)\d+$/i.test(w) && (m2 = /^\.[QDV](?![A-Za-z0-9_])/i.exec(suite))) { w += m2[0]; j += m2[0].length; }
        else if (/^%?QW0$/i.test(w) && (m2 = /^\.0(?![0-9])/.exec(suite))) { w += m2[0]; j += m2[0].length; }
        let barre = false;
        while (s[j] === "̅" || s[j] === "̄") { barre = !barre; j++; }
        const lw = w.toLowerCase();
        if (lw === "et" || lw === "and") T.push({ k: "et" });
        else if (lw === "ou" || lw === "or") T.push({ k: "ou" });
        else if (lw === "non" || lw === "not") T.push({ k: "non" });
        else T.push({ k: "mot", w, barre });
        i = j; continue;
      }
      throw erreur(`je ne comprends pas le signe « ${c} »`);
    }
    return T;
  }
  const NOM_TOK = { et: "·", ou: "+", non: "/", fm: "↑", fd: "↓", "(": "(", ")": ")", cmp: "comparaison" };
  function parser(src, inv) {
    const T = lexer(src);
    if (!T.length) throw erreur("elle est vide (écris 1 si elle est toujours vraie)");
    let p = 0;
    const voir = () => T[p], prendre = () => T[p++];
    const debut = (t) => t && (t.k === "mot" || t.k === "nb" || t.k === "tempo" || t.k === "non" || t.k === "fm" || t.k === "fd" || t.k === "(");
    function expr() { const L = [terme()]; while (voir() && voir().k === "ou") { prendre(); L.push(terme()); } return L.length > 1 ? { k: "ou", l: L } : L[0]; }
    function terme() {
      const L = [facteur()];
      for (;;) {
        const t = voir();
        if (t && t.k === "et") { prendre(); L.push(facteur()); continue; }
        if (debut(t)) throw erreur("il manque un signe · (ET) ou + (OU) entre deux variables");
        break;
      }
      return L.length > 1 ? { k: "et", l: L } : L[0];
    }
    function facteur() {
      const t = voir();
      if (!t) throw erreur("elle finit trop tôt");
      if (t.k === "non") { prendre(); return { k: "non", e: facteur() }; }
      if (t.k === "fm" || t.k === "fd") {
        prendre(); const a = atome();
        if (a.k !== "var") throw erreur(`${t.k === "fm" ? "↑" : "↓"} (front) se met devant une variable : ↑a`);
        return { k: t.k, a: a.a };
      }
      if (t.k === "(") { prendre(); const e = expr(); if (!voir() || voir().k !== ")") throw erreur("une parenthèse n'est pas fermée"); prendre(); return e; }
      return atome();
    }
    function atome() {
      const t = prendre();
      if (!t) throw erreur("elle finit trop tôt");
      if (t.k === "tempo") return { k: "tempo", n: t.n, d: t.d };
      if (t.k === "nb") { if (t.v === 0 || t.v === 1) return { k: "cst", v: t.v === 1 }; throw erreur(`le nombre ${t.v} n'est pas une condition (écris 1 ou 0, ou compare un compteur : %C0.V >= ${t.v})`); }
      if (t.k === "mot") {
        let a = resoudre(t.w, inv);
        if (!a) throw erreur(`« ${t.w} » n'est ni une adresse (%I0.0, X2…) ni un mnémonique de la table`);
        if (voir() && voir().k === "cmp") {
          if (sorteAdr(a) === "C") a = a + ".V";
          if (sorteAdr(a) !== "CV") throw erreur(`on ne compare que la valeur d'un compteur (%C0.V)`);
          const op = prendre().op, n = prendre();
          if (!n || n.k !== "nb") throw erreur("il faut un nombre après la comparaison");
          return { k: "cmp", a, op, v: n.v };
        }
        const s = sorteAdr(a);
        if (s === "CV" || s === "QW") throw erreur(`${a} est un nombre : compare-le (%C0.V >= 3)`);
        const v = { k: "var", a };
        return t.barre ? { k: "non", e: v } : v;
      }
      throw erreur(`« ${NOM_TOK[t.k] || t.k} » n'est pas à sa place`);
    }
    const e = expr();
    if (p < T.length) throw erreur(`« ${NOM_TOK[T[p].k] || T[p].w || ""} » n'est pas à sa place`);
    return e;
  }
  function parcourir(n, f) { if (!n) return; f(n); if (n.e) parcourir(n.e, f); if (n.l) for (const x of n.l) parcourir(x, f); }

  /* ---------- compiler : relier les noms aux adresses, repérer les erreurs ---------- */
  const NOM_CASE = { no: "contact", nf: "contact", p: "front montant", n: "front descendant" };
  function compiler(P0) {
    const P = validerProg(P0), inv = tableInverse(P.noms);
    const erreurs = [], alertes = [], fronts = new Set();
    const C = { P, inv, erreurs, alertes, fronts, ladder: [], grafcet: null, tm: [], cp: [] };
    const res = (v) => resoudre(v, inv);
    const nomR = (a) => (P.noms[a] ? `${P.noms[a]} (${a})` : a);
    if (P.lang === "ladder") {
      const ecrit = new Map();
      P.ladder.forEach((R, ri) => {
        const NL = R.l.length;
        const lignes = R.l.map((li, l) => ({
          c: li.c.map((cs, c) => {
            if (!cs) return null;
            if (cs.t === "f") return { t: "f" };
            const a = res(cs.v), ou = { r: ri, l, c };
            if (!cs.v) { erreurs.push({ ou, texte: `Réseau ${ri + 1} : un ${NOM_CASE[cs.t]} n'a pas de variable.` }); return { t: cs.t, a: null }; }
            if (!a) { erreurs.push({ ou, texte: `Réseau ${ri + 1} : « ${cs.v} » n'est ni une adresse (%I0.0…) ni un mnémonique de la table.` }); return { t: cs.t, a: null }; }
            const s = sorteAdr(a);
            if (!/^(I|Q|M|X|TM|C|S)$/.test(s)) { erreurs.push({ ou, texte: `Réseau ${ri + 1} : ${a} est un nombre, il ne se lit pas avec un contact.` }); return { t: cs.t, a: null }; }
            if (s === "X") alertes.push({ ou, texte: `Réseau ${ri + 1} : ${a} est une étape de GRAFCET, mais le programme est en Ladder (elle reste à 0).` });
            return { t: cs.t, a };
          }),
          s: (() => {
            const s = li.s; if (!s) return null;
            const ou = { r: ri, l, c: COLS };
            const a = s.t === "ana" ? "%QW0" : res(s.v);
            const k = sorteAdr(a);
            const ko = (t) => { erreurs.push({ ou, texte: `Réseau ${ri + 1} : ${t}` }); return Object.assign({}, s, { a: null }); };
            if (!a) return ko(s.v ? `« ${s.v} » n'est ni une adresse ni un mnémonique de la table.` : "une sortie n'a pas de variable.");
            if (s.t === "bob" || s.t === "s") { if (k !== "Q" && k !== "M") return ko(`une bobine commande une sortie %Q0.x ou un bit %Mx, pas ${a}.`); }
            else if (s.t === "r") { if (!/^(Q|M|TM|C)$/.test(k)) return ko(`R remet à 0 une sortie, un bit, une tempo ou un compteur, pas ${a}.`); }
            else if (s.t === "ton" || s.t === "tof") { if (k !== "TM") return ko(`une temporisation s'appelle %TM0, %TM1…, pas ${a}.`); }
            else if (s.t === "ctu") { if (k !== "C") return ko(`un compteur s'appelle %C0, %C1…, pas ${a}.`); }
            if (s.t === "bob") { const L = ecrit.get(a) || []; L.push(ri + 1); ecrit.set(a, L); }
            if (s.t === "ton" || s.t === "tof") { const n = numAdr(a); if (C.tm[n] && C.tm[n].r !== ri) alertes.push({ ou, texte: `Réseau ${ri + 1} : la temporisation ${a} est déjà utilisée au réseau ${C.tm[n].r + 1}.` }); C.tm[n] = { r: ri, t: s.t, p: s.p }; }
            if (s.t === "ctu") { const n = numAdr(a); C.cp[n] = { r: ri, p: s.p }; }
            return Object.assign({}, s, { a });
          })()
        }));
        // une ligne qui a une sortie est reliée à sa sortie après son dernier élément
        const touche = (l) => [].concat(l > 0 ? R.v[l - 1] || [] : [], R.v[l] || []);
        const depuis = lignes.map((li, l) => {
          if (!li.s) return COLS;
          let d = 0;
          li.c.forEach((cs, c) => { if (cs) d = Math.max(d, c + 1); });
          for (const b of touche(l)) d = Math.max(d, b);
          return d;
        });
        C.ladder.push({ lignes, liens: R.v, depuis, NL });
        for (const li of lignes) for (const cs of li.c) if (cs && cs.a === "%S6") C.horloge = true;
      });
      for (const [a, L] of ecrit) if (L.length > 1) alertes.push({ ou: { r: L[L.length - 1] - 1 }, texte: `${nomR(a)} a une bobine dans plusieurs réseaux (${L.join(", ")}) : seule la dernière compte. Réunis les conditions dans un seul réseau, ou utilise S et R.` });
    } else {
      const G = P.grafcet, nums = new Set(G.etapes.map((e) => e.n));
      if (!G.etapes.some((e) => e.init)) erreurs.push({ ou: { e: -1 }, texte: "Aucune étape initiale : coche « initiale » pour l'étape de départ (souvent l'étape 0)." });
      const etapes = G.etapes.map((e, ei) => ({
        n: e.n, init: e.init,
        actions: e.actions.map((ac, ai) => {
          const ou = { e: ei, a: ai };
          const a = ac.t === "ana" ? "%QW0" : resoudre(ac.v, inv), k = sorteAdr(a);
          const ko = (t) => { erreurs.push({ ou, texte: `Étape ${e.n} : ${t}` }); return { t: ac.t, ok: false }; };
          if (!a) return ko(ac.v ? `« ${ac.v} » n'est ni une adresse ni un mnémonique de la table.` : "une action n'a pas de variable.");
          if ((ac.t === "n" || ac.t === "s") && k !== "Q" && k !== "M") return ko(`l'action commande une sortie %Q0.x (ou un bit %Mx), pas ${a}.`);
          if (ac.t === "r" && !/^(Q|M|C)$/.test(k)) return ko(`R remet à 0 une sortie, un bit ou un compteur, pas ${a}.`);
          if (ac.t === "inc" && k !== "C") return ko(`on compte avec un compteur (%C0…), pas ${a}.`);
          let si = null;
          if (ac.si && ac.si.trim()) { try { si = parser(ac.si, inv); } catch (x) { return ko(`la condition « ${ac.si} » : ${x.message}.`); } }
          if (si) parcourir(si, (n) => { if (n.k === "fm" || n.k === "fd") fronts.add(n.a); });
          return { t: ac.t, a, x: ac.x, si, ok: true };
        })
      }));
      const trans = G.transitions.map((t, ti) => {
        const ou = { t: ti }, nom = `Transition ${ti + 1}${t.de.length && t.vers.length ? ` (${t.de.join(", ")} → ${t.vers.join(", ")})` : ""}`;
        let err = null, ast = null;
        if (!t.de.length) err = "écris l'étape d'avant (« de »).";
        else if (!t.vers.length) err = "écris l'étape d'après (« vers »).";
        else { const m = t.de.concat(t.vers).find((n) => !nums.has(n)); if (m != null) err = `l'étape ${m} n'existe pas.`; }
        if (!err) { try { ast = parser(t.r, inv); } catch (x) { err = `la réceptivité « ${t.r} » : ${x.message}.`; } }
        if (err) erreurs.push({ ou, texte: `${nom} : ${err}` });
        const tempos = [];
        if (ast) parcourir(ast, (n) => { if (n.k === "fm" || n.k === "fd") fronts.add(n.a); if (n.k === "tempo") { tempos.push(n); if (!nums.has(n.n)) erreurs.push({ ou, texte: `${nom} : la temporisation parle de l'étape ${n.n}, qui n'existe pas.` }); } });
        return { de: t.de, vers: t.vers, ast, ok: !err, tempos };
      });
      for (const tr of trans) if (tr.ast) parcourir(tr.ast, (n) => { if (n.a === "%S6") C.horloge = true; });
      for (const e of etapes) for (const ac of e.actions) if (ac.si) parcourir(ac.si, (n) => { if (n.a === "%S6") C.horloge = true; });
      for (const e of etapes) if (!trans.some((t) => t.de.indexOf(e.n) >= 0) && G.etapes.length > 1) alertes.push({ ou: { e: G.etapes.findIndex((x) => x.n === e.n) }, texte: `L'étape ${e.n} n'a pas de transition après elle : une fois active, elle le reste.` });
      C.grafcet = { etapes, trans };
    }
    return C;
  }

  /* ---------- l'automate en marche ---------- */
  const FIL = { t: "f" };
  function creerAutomate(prog) {
    const C = compiler(prog);
    let t = 0, aq = 0, instable = false, fugaces = false;
    const I = new Array(NE).fill(false), Q = new Array(NS).fill(false), M = new Array(NM).fill(false);
    const memoQ = new Array(NS).fill(false), memoM = new Array(NM).fill(false);
    const TM = [], CP = [];
    for (let k = 0; k < NTM; k++) TM.push({ in: false, t0: 0, q: false, p: 0, sorte: "ton" });
    for (let k = 0; k < NCP; k++) CP.push({ v: 0, p: 0, cu: false });
    const X = new Set(), depuis = new Map(), memC = new Map(), memF = new Map();
    let flux = [];

    function lire(a) {
      const n = numAdr(a);
      switch (sorteAdr(a)) {
        case "I": return I[n]; case "Q": return Q[n]; case "M": return M[n]; case "X": return X.has(n);
        case "TM": return TM[n].q; case "C": return CP[n].p > 0 && CP[n].v >= CP[n].p;
        case "CV": return CP[n].v; case "QW": return aq;
        case "S": return ((t + EPS) % 1000) < 500;   // %S6 : 1 pendant la première demi-seconde de chaque seconde
      }
      return false;
    }
    function ecrire(a, v) { const n = numAdr(a), k = sorteAdr(a); if (k === "Q") Q[n] = !!v; else if (k === "M") M[n] = !!v; }
    function evalAst(nd, it) {
      switch (nd.k) {
        case "cst": return nd.v;
        case "var": return !!lire(nd.a);
        case "non": return !evalAst(nd.e, it);
        case "et": return nd.l.every((x) => evalAst(x, it));
        case "ou": return nd.l.some((x) => evalAst(x, it));
        case "fm": case "fd": {
          if (it > 0) return false;   // un front ne franchit qu'une transition à la fois
          const cur = !!lire(nd.a), prev = memF.has(nd.a) ? memF.get(nd.a) : cur;
          return nd.k === "fm" ? cur && !prev : !cur && prev;
        }
        case "tempo": return X.has(nd.n) && t - (depuis.has(nd.n) ? depuis.get(nd.n) : t) >= nd.d - EPS;
        case "cmp": {
          const v = Number(lire(nd.a)), w = nd.v;
          switch (nd.op) { case "=": return v === w; case "<>": return v !== w; case "<": return v < w; case ">": return v > w; case "<=": return v <= w; case ">=": return v >= w; }
        }
      }
      return false;
    }

    /* Ladder */
    function contact(cs, cle) {
      const cur = cs.a ? !!lire(cs.a) : false;
      if (cs.t === "no") return cur;
      if (cs.t === "nf") return !cur;
      const prev = memC.has(cle) ? memC.get(cle) : cur;
      memC.set(cle, cur);
      return cs.t === "p" ? cur && !prev : !cur && prev;
    }
    function fusion(o, liens, b) {
      const r = o.slice();
      for (let i = 0; i < o.length;) {
        let j = i; while (j + 1 < o.length && liens[j] && liens[j].indexOf(b) >= 0) j++;
        if (j > i) { let v = false; for (let k = i; k <= j; k++) v = v || o[k]; for (let k = i; k <= j; k++) r[k] = v; }
        i = j + 1;
      }
      return r;
    }
    function tempo(st, pin, sorte, P) {
      if (sorte === "ton") { if (pin && !st.in) st.t0 = t; st.in = pin; st.q = pin && t - st.t0 >= P - EPS; }
      else { if (!pin && st.in) st.t0 = t; st.in = pin; st.q = pin || (st.q && t - st.t0 < P - EPS); }
      st.p = P; st.sorte = sorte;
    }
    function sortie(s, pw) {
      if (!s.a) return;
      const n = numAdr(s.a), k = sorteAdr(s.a);
      switch (s.t) {
        case "bob": ecrire(s.a, pw); break;
        case "s": if (pw) ecrire(s.a, true); break;
        case "r":
          if (!pw) break;
          if (k === "TM") { const st = TM[n]; st.t0 = t; st.q = false; }
          else if (k === "C") CP[n].v = 0;
          else ecrire(s.a, false);
          break;
        case "ton": case "tof": tempo(TM[n], pw, s.t, s.p * 1000); break;
        case "ctu": { const c = CP[n]; c.p = s.p; if (pw && !c.cu) c.v = Math.min(9999, c.v + 1); c.cu = pw; break; }
        case "ana": if (pw) aq = s.x; break;
      }
    }
    function cycleLadder() {
      flux = C.ladder.map((R, ri) => {
        const L = R.NL;
        let p = new Array(L).fill(true);
        const B = [p.slice()], ok = [];
        for (let c = 0; c < COLS; c++) {
          const o = new Array(L), okc = new Array(L);
          for (let l = 0; l < L; l++) {
            let cs = R.lignes[l].c[c];
            if (!cs && c >= R.depuis[l]) cs = FIL;
            if (!cs) { o[l] = false; okc[l] = null; }
            else if (cs.t === "f") { o[l] = p[l]; okc[l] = true; }
            else { const v = contact(cs, ri + ":" + l + ":" + c); okc[l] = v; o[l] = p[l] && v; }
          }
          p = fusion(o, R.liens, c + 1);
          B.push(p.slice()); ok.push(okc);
        }
        for (let l = 0; l < L; l++) if (R.lignes[l].s) sortie(R.lignes[l].s, p[l]);
        return { B, ok, s: p.slice() };
      });
    }

    /* GRAFCET */
    function activer(n) {
      const e = C.grafcet.etapes.find((x) => x.n === n); if (!e) return;
      for (const ac of e.actions) {
        if (!ac.ok) continue;
        const k = sorteAdr(ac.a), i = numAdr(ac.a);
        if (ac.si && !evalAst(ac.si, 1)) continue;
        if (ac.t === "s") { if (k === "Q") memoQ[i] = true; else memoM[i] = true; }
        else if (ac.t === "r") { if (k === "Q") memoQ[i] = false; else if (k === "M") memoM[i] = false; else if (k === "C") CP[i].v = 0; }
        else if (ac.t === "inc") CP[i].v = Math.min(9999, CP[i].v + 1);
      }
    }
    function cycleGrafcet() {
      const G = C.grafcet;
      let it = 0;
      for (; it < 50; it++) {
        const fr = G.trans.filter((tr) => tr.ok && tr.de.every((n) => X.has(n)) && evalAst(tr.ast, it));
        if (!fr.length) break;
        const des = new Set(), act = new Set();
        for (const tr of fr) { for (const n of tr.de) des.add(n); for (const n of tr.vers) act.add(n); }
        for (const n of des) if (!act.has(n)) X.delete(n);
        for (const n of act) if (!X.has(n)) { X.add(n); depuis.set(n, t); activer(n); }
      }
      fugaces = it >= 50;
      for (const a of C.fronts) memF.set(a, !!lire(a));
      const q = new Array(NS).fill(false), m = new Array(NM).fill(false);
      let v = null;
      for (const e of G.etapes) {
        if (!X.has(e.n)) continue;
        for (const ac of e.actions) {
          if (!ac.ok || (ac.t !== "n" && ac.t !== "ana")) continue;
          if (ac.si && !evalAst(ac.si, 1)) continue;
          if (ac.t === "ana") { if (v === null) v = ac.x; continue; }
          const k = sorteAdr(ac.a), i = numAdr(ac.a);
          if (k === "Q") q[i] = true; else if (k === "M") m[i] = true;
        }
      }
      for (let k = 0; k < NS; k++) Q[k] = q[k] || memoQ[k];
      for (let k = 0; k < NM; k++) M[k] = m[k] || memoM[k];
      aq = v === null ? 0 : v;
    }

    function texteEtat() {
      let s = "";
      for (const b of Q) s += b ? "1" : "0";
      s += "|"; for (const b of M) s += b ? "1" : "0";
      s += "|" + [...X].sort((a, b) => a - b).join(",") + "|" + aq + "|";
      for (const x of TM) s += (x.q ? "1" : "0") + (x.in ? "1" : "0");
      s += "|"; for (const x of CP) s += x.v + ",";
      s += "|"; for (const [k, v] of memC) s += k + (v ? "1" : "0");
      s += "|"; for (const [k, v] of memF) s += k + (v ? "1" : "0");
      return s;
    }
    function demarrer(tt) {
      t = tt || 0; aq = 0; instable = false; fugaces = false;
      Q.fill(false); M.fill(false); memoQ.fill(false); memoM.fill(false); I.fill(false);
      for (const x of TM) Object.assign(x, { in: false, t0: t, q: false });
      for (const x of CP) Object.assign(x, { v: 0, cu: false });
      for (const [n, c] of C.tm.entries()) if (c) { TM[n].p = c.p * 1000; TM[n].sorte = c.t; }
      for (const [n, c] of C.cp.entries()) if (c) CP[n].p = c.p;
      X.clear(); depuis.clear(); memC.clear(); memF.clear(); flux = [];
      if (C.grafcet) for (const e of C.grafcet.etapes) if (e.init) { X.add(e.n); depuis.set(e.n, t); }
      if (C.grafcet) for (const e of C.grafcet.etapes) if (e.init) activer(e.n);
    }
    function scan(entrees, tt) {
      t = tt == null ? t : tt;
      for (let k = 0; k < NE; k++) I[k] = !!(entrees && entrees[k]);
      let avant = texteEtat(), n = 0;
      for (; n < 60; n++) {
        if (C.P.lang === "ladder") cycleLadder(); else cycleGrafcet();
        const apres = texteEtat();
        if (apres === avant) break;
        avant = apres;
      }
      instable = n >= 60;
      return { Q: Q.slice(), aq };
    }
    function prochain() {
      let e = Infinity;
      if (C.horloge) e = (Math.floor((t + EPS) / 500) + 1) * 500;   // %S6 change toutes les 0,5 s
      for (const st of TM) {
        if (!(st.p > 0)) continue;
        if (st.sorte === "ton" && st.in && !st.q) e = Math.min(e, st.t0 + st.p);
        if (st.sorte === "tof" && !st.in && st.q) e = Math.min(e, st.t0 + st.p);
      }
      if (C.grafcet) {
        const voir = (tp) => { if (X.has(tp.n)) { const f = (depuis.has(tp.n) ? depuis.get(tp.n) : t) + tp.d; if (f > t + EPS) e = Math.min(e, f); } };
        for (const tr of C.grafcet.trans) if (tr.ok && tr.de.every((n) => X.has(n))) for (const tp of tr.tempos) voir(tp);
        for (const et of C.grafcet.etapes) if (X.has(et.n)) for (const ac of et.actions) if (ac.si) parcourir(ac.si, (nd) => { if (nd.k === "tempo") voir(nd); });
      }
      return e;
    }
    function etat() {
      return {
        lang: C.P.lang, t, I: I.slice(), Q: Q.slice(), M: M.slice(0, 16), aq,
        X: [...X].sort((a, b) => a - b), depuis: Object.fromEntries([...depuis].map(([k, v]) => [k, t - v])),
        TM: TM.slice(0, 8).map((x) => ({ q: x.q, in: x.in, p: x.p, sorte: x.sorte, et: x.sorte === "ton" ? (x.in ? Math.min(x.p, t - x.t0) : 0) : (!x.in && x.q ? t - x.t0 : 0) })),
        C: CP.slice(0, 8).map((x) => ({ v: x.v, p: x.p })),
        flux, instable, fugaces,
        franchissables: C.grafcet ? C.grafcet.trans.map((tr) => tr.ok && tr.de.every((n) => X.has(n))) : []
      };
    }
    demarrer(0);
    return { demarrer, scan, prochain, etat, lire, erreurs: C.erreurs, alertes: C.alertes, compile: C };
  }

  function analyser(prog) { const C = compiler(prog); return { erreurs: C.erreurs, alertes: C.alertes }; }
  const nomOu = (a, noms) => (noms && noms[a] ? noms[a] : a);

  const API = { NE, NS, COLS, LIGNES_MAX, canon, sorteAdr, numAdr, nomValide, tableInverse, resoudre, adresses,
    progDefaut, reseauVide, ligneVide, validerProg, listeEtapes, parser, lexer, compiler, analyser, creerAutomate, nomOu };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasAutomate = API;
})(typeof window !== "undefined" ? window : globalThis);
