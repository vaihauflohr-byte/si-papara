/* =====================================================================
   Atelier schémas — les EXEMPLES tout faits et les DÉFIS (vérifiés par le moteur)
   Chaque schéma est construit ici, sur la grille : puissance à gauche, commande à droite.
   Défi : { id, titre, niveau, resume, consigne, indice, aide (petit schéma d'aide), depart(), exige, etapes }
   Les étapes sont rejouées par SchemasMoteur.scenario() sur le schéma de l'élève.
   ===================================================================== */
(function (g) {
  "use strict";
  const M = (typeof module === "object" && module.exports) ? require("./modele.js") : g.SchemasModele;
  const SA = (typeof module === "object" && module.exports) ? require("./automate.js") : g.SchemasAutomate;

  function plan(titre) {
    const s = M.nouveau(titre);
    const o = {
      s,
      p(type, x, y, ref, p, rot) {
        const T = M.TYPES[type], P = Object.assign({}, p || {});
        const pc = { id: "p" + (s.pieces.length + 1), type, x, y, rot: rot != null ? rot : (T.rotDefaut ? T.rotDefaut(Object.assign({}, T.p, P)) : 0), ref: ref || "", p: P };
        s.pieces.push(pc); return pc;
      },
      f(...pts) { const P = M.nettoyer(pts); if (P.length >= 2) s.fils.push({ id: "f" + (s.fils.length + 1), pts: P }); return o; },
      sans(...ids) { s.pieces = s.pieces.filter((pc) => ids.indexOf(pc.ref + ":" + pc.p.num) < 0 && ids.indexOf(pc.id) < 0); return o; }
    };
    return o;
  }

  /* ---------- briques communes ---------- */
  // puissance, démarrage direct : réseau, Q1, KM1, F1, M1 (x = 2, 4, 6)
  function puissanceDirecte(b, cablee) {
    b.p("reseau", 2, 0);
    b.p("sectionneur", 4, 7, "Q1", { cal: 10 });
    b.p("poles", 4, 15, "KM1");
    b.p("thermique", 4, 23, "F1", { cal: 6 });
    b.p("moteur", 4, 32, "M1");
    if (cablee === false) return;
    for (const x of [2, 4, 6]) b.f([x, 2], [x, 4]).f([x, 10], [x, 12]).f([x, 18], [x, 20]).f([x, 26], [x, 28]);
    b.f([10, 2], [10, 27], [8, 27], [8, 28]);
  }
  // commande marche-arrêt : L → F2 → F1 95-96 → S1 → S2 // KM1 13-14 → KM1 → N (x = 22)
  function commandeMA(b, o) {
    o = o || {};
    b.p("alim", 22, 1, "", { pot: "L" });
    b.p("fusible", 22, 7, "F2", { cal: 2 });
    if (!o.sansThermique) b.p("contact_th_nf", 22, 14, "F1", { num: "95-96" });
    b.p("bp_nf", 22, 21, "S1", { num: "11-12" });
    b.p("bp_no", 22, 28, "S2", { num: "13-14" });
    if (!o.sansMaintien) b.p("contact_no", 28, 28, "KM1", { num: "13-14" });
    b.p("bobine", 22, 35, "KM1", { tension: "230~" });
    b.p("alim", 22, 41, "", { pot: "N" });
    b.f([22, 3], [22, 4]);
    if (o.sansThermique) b.f([22, 10], [22, 18]); else b.f([22, 10], [22, 11]).f([22, 17], [22, 18]);
    b.f([22, 24], [22, 25]).f([22, 31], [22, 32]).f([22, 38], [22, 39]);
    if (!o.sansMaintien) b.f([22, 25], [28, 25]).f([28, 31], [22, 31]);
  }

  /* ---------- automate et variateur ---------- */
  const N = null;
  const ct = (t, v) => ({ t, v });
  // les programmes (adresses dans le programme ; l'éditeur affiche les mnémoniques)
  function progMA() {
    return { lang: "ladder", noms: { "%I0.0": "S1", "%I0.1": "S2", "%I0.2": "F1", "%Q0.0": "KM1", "%Q0.1": "H1" }, ladder: [
      { com: "Marche S2, arrêt S1, auto-maintien, thermique F1", l: [
        { c: [ct("no", "%I0.1"), ct("no", "%I0.0"), ct("no", "%I0.2"), N, N], s: { t: "bob", v: "%Q0.0" } },
        { c: [ct("no", "%Q0.0"), N, N, N, N], s: null }], v: [[1]] },
      { com: "Voyant de marche", l: [{ c: [ct("no", "%Q0.0"), N, N, N, N], s: { t: "bob", v: "%Q0.1" } }], v: [] }] };
  }
  const NOMS_CHARIOT = { "%I0.0": "dcy", "%I0.1": "a", "%I0.2": "b", "%Q0.0": "KM1", "%Q0.1": "KM2" };
  function progChariot() {
    return { lang: "grafcet", noms: Object.assign({}, NOMS_CHARIOT), grafcet: {
      etapes: [{ n: 0, init: true, com: "attente", actions: [] }, { n: 1, com: "aller à droite", actions: [{ t: "n", v: "%Q0.0" }] },
        { n: 2, com: "pause", actions: [] }, { n: 3, com: "retour à gauche", actions: [{ t: "n", v: "%Q0.1" }] }],
      transitions: [{ de: [0], vers: [1], r: "dcy" }, { de: [1], vers: [2], r: "b" }, { de: [2], vers: [3], r: "t/X2/3s" }, { de: [3], vers: [0], r: "a" }] } };
  }
  function progVariateur() {
    return { lang: "ladder", noms: { "%I0.0": "S1", "%I0.1": "S2", "%I0.2": "S3", "%I0.3": "S4", "%Q0.0": "AVANT", "%Q0.1": "ARRIERE", "%QW0": "VITESSE" }, ladder: [
      { com: "Marche avant S2, auto-maintien, arrêt S1", l: [
        { c: [ct("no", "%I0.1"), ct("no", "%I0.0"), ct("nf", "%Q0.1"), N, N], s: { t: "bob", v: "%Q0.0" } },
        { c: [ct("no", "%Q0.0"), N, N, N, N], s: null }], v: [[1]] },
      { com: "Marche arrière (S3)", l: [
        { c: [ct("no", "%I0.2"), ct("no", "%I0.0"), ct("nf", "%Q0.0"), N, N], s: { t: "bob", v: "%Q0.1" } },
        { c: [ct("no", "%Q0.1"), N, N, N, N], s: null }], v: [[1]] },
      { com: "S4 tourné : grande vitesse (10 V → 50 Hz)", l: [{ c: [ct("no", "%I0.3"), N, N, N, N], s: { t: "ana", x: 10 } }], v: [] },
      { com: "S4 au repos : petite vitesse (5 V → 25 Hz)", l: [{ c: [ct("nf", "%I0.3"), N, N, N, N], s: { t: "ana", x: 5 } }], v: [] }] };
  }
  // l'automate et son alimentation 24 V : API à (ax, 24) ; entrées en haut (y = 18), sorties en bas (y = 30)
  function automate24(b, ax, prog) {
    const pc = b.p("automate", ax, 24, "API1"); pc.prog = SA.validerProg(prog);
    b.p("alim", ax - 8, 14, "", { pot: "0V" }, 0);                       // sur le fil 0V – COM
    b.f([ax - 9, 18], [ax - 9, 16], [ax - 7, 16], [ax - 7, 18]);
    return pc;
  }
  // les boutons et capteurs des entrées : le premier droit au-dessus de %I0.0, les autres en escalier (tous les 6 pas)
  function entrees(b, ax, L) {
    const x0 = ax - 5, xs = L.map((_, k) => x0 + 6 * k);
    b.p("alim", ax - 8, 1, "", { pot: "+24" }, 0);
    b.f([ax - 11, 18], [ax - 11, 4], [xs[xs.length - 1], 4], [xs[xs.length - 1], 6]).f([ax - 8, 3], [ax - 8, 4]);
    L.forEach(([type, ref, p], k) => {
      const x = xs[k]; b.p(type, x, 9, ref, p);
      if (k < L.length - 1) b.f([x, 4], [x, 6]);
      if (k === 0) b.f([x, 12], [x, 18]); else b.f([x, 12], [x, 14 + k], [x0 + 2 * k, 14 + k], [x0 + 2 * k, 18]);
    });
  }
  function exempleApiLadder(sansProg) {
    const b = plan(sansProg ? "Défi · Programme l'automate" : "Marche-arrêt par automate (Ladder)");
    puissanceDirecte(b);
    const ap = automate24(b, 36, progMA());
    if (sansProg) ap.prog = SA.validerProg({ lang: "ladder", noms: progMA().noms });
    entrees(b, 36, [["bp_nf", "S1", { num: "11-12" }], ["bp_no", "S2", { num: "13-14" }], ["contact_th_nf", "F1", { num: "95-96" }]]);
    // sorties : L → F2 → C0 ; %Q0.0 → KM1 ; %Q0.1 → H1
    b.p("alim", 19, 19, "", { pot: "L" }, 0); b.p("fusible", 19, 27, "F2", { cal: 2 });
    b.f([19, 21], [19, 24]).f([19, 30], [25, 30]);
    b.p("bobine", 33, 36, "KM1", { tension: "230~" }); b.p("voyant", 39, 36, "H1", { couleur: "vert", tension: "230~" });
    b.f([27, 30], [27, 32], [33, 32], [33, 33]).f([29, 30], [29, 31], [39, 31], [39, 33]);
    b.p("alim", 36, 45, "", { pot: "N" });
    b.f([33, 39], [33, 41], [39, 41], [39, 39]).f([36, 43], [36, 41]);
    return b.s;
  }
  function puissanceInversion(b) {
    b.p("reseau", 2, 0);
    b.p("sectionneur", 4, 6, "Q1", { cal: 10 });
    b.p("poles", 4, 16, "KM1");
    b.p("poles", 14, 16, "KM2");
    b.p("thermique", 4, 26, "F1", { cal: 6 });
    b.p("moteur", 4, 36, "M1");
    for (const x of [2, 4, 6]) b.f([x, 2], [x, 3]).f([x, 9], [x, 13]).f([x, 19], [x, 23]).f([x, 29], [x, 32]);
    b.f([2, 10], [12, 10], [12, 13]).f([4, 11], [14, 11], [14, 13]).f([6, 12], [16, 12], [16, 13]);
    b.f([12, 19], [12, 20], [6, 20]).f([14, 19], [14, 21], [4, 21]).f([16, 19], [16, 22], [2, 22]);
    b.f([10, 2], [10, 8], [19, 8], [19, 31], [8, 31], [8, 32]);
  }
  function exempleApiGrafcet(prog, titre, avecChariot) {
    const b = plan(titre || "Aller-retour d'un chariot (GRAFCET)");
    if (avecChariot) b.p("chariot", 34, 61, "PO1", { moteur: "M1", sens: "1", gauche: "S3", droite: "S4", duree: 4, depart: "gauche" });
    puissanceInversion(b);
    automate24(b, 40, prog || progChariot());
    entrees(b, 40, [["bp_no", "S2", { num: "13-14" }], ["fdc_no", "S3", { num: "13-14" }], ["fdc_no", "S4", { num: "13-14" }]]);
    // sorties : L → F2 → F1 95-96 → C0 ; verrouillage électrique câblé en plus du programme
    b.p("alim", 23, 13, "", { pot: "L" }, 0); b.p("fusible", 23, 19, "F2", { cal: 2 }); b.p("contact_th_nf", 23, 26, "F1", { num: "95-96" });
    b.f([23, 15], [23, 16]).f([23, 22], [23, 23]).f([23, 29], [23, 30], [29, 30]);
    b.p("contact_nf", 37, 36, "KM2", { num: "21-22" }); b.p("bobine", 37, 43, "KM1", { tension: "230~" });
    b.p("contact_nf", 43, 36, "KM1", { num: "21-22" }); b.p("bobine", 43, 43, "KM2", { tension: "230~" });
    b.f([31, 30], [31, 32], [37, 32], [37, 33]).f([33, 30], [33, 31], [43, 31], [43, 33]);
    b.f([37, 39], [37, 40]).f([43, 39], [43, 40]);
    b.p("alim", 40, 52, "", { pot: "N" });
    b.f([37, 46], [37, 48], [43, 48], [43, 46]).f([40, 50], [40, 48]);
    return b.s;
  }
  // puissance avec variateur : réseau, Q1, U1, M1 (bornier de commande de U1 à x = 12, y = 28 à 46)
  function puissanceVariateur(b, p) {
    b.p("reseau", 2, 14);
    b.p("disj_moteur", 4, 21, "Q1", { cal: 6 });
    b.p("variateur", 4, 31, "U1", Object.assign({ acc: 2, dec: 2, ref: "AI1" }, p || {}));
    b.p("moteur", 4, 56, "M1");
    for (const x of [2, 4, 6]) b.f([x, 16], [x, 18]).f([x, 24], [x, 26]).f([x, 48], [x, 52]);
    b.f([10, 16], [10, 25], [8, 25], [8, 26]).f([8, 48], [8, 52]);
  }
  function exempleVariateurApi(sansFils) {
    const b = plan(sansFils ? "Défi · Relie l'automate au variateur" : "Automate et variateur : deux sens, deux vitesses");
    puissanceVariateur(b);
    automate24(b, 36, progVariateur());
    entrees(b, 36, [["bp_nf", "S1", { num: "11-12" }], ["bp_no", "S2", { num: "13-14" }], ["bp_no", "S3", { num: "13-14" }], ["selecteur", "S4", { num: "13-14", contact: "no" }]]);
    b.p("alim", 16, 48, "", { pot: "0V" });
    if (!sansFils) {
      b.f([25, 30], [25, 32], [12, 32]);     // C0 ← +24V du variateur
      b.f([27, 30], [27, 34], [12, 34]);     // %Q0.0 → LI1 (avant)
      b.f([29, 30], [29, 36], [12, 36]);     // %Q0.1 → LI2 (arrière)
      b.f([45, 30], [45, 44], [12, 44]);     // AQ0 → AI1 (consigne 0-10 V)
      b.f([12, 46], [16, 46]);               // COM du variateur au 0 V commun
    }
    return b.s;
  }
  // cuve : pompe M1 par KM1, niveaux B1 (bas) et B2 (haut) en détecteurs capacitifs 3 fils PNP, automate en Ladder (S et R)
  function progCuve() {
    return { lang: "ladder", noms: { "%I0.0": "S1", "%I0.1": "S2", "%I0.2": "B1", "%I0.3": "B2", "%Q0.0": "KM1", "%Q0.1": "H1", "%M0": "AUTO" }, ladder: [
      { com: "S2 : mise en service", l: [{ c: [ct("no", "%I0.1"), N, N, N, N], s: { t: "s", v: "%M0" } }], v: [] },
      { com: "S1 : mise hors service (bouton à ouverture)", l: [{ c: [ct("nf", "%I0.0"), N, N, N, N], s: { t: "r", v: "%M0" } }], v: [] },
      { com: "Sous le niveau bas : la pompe démarre", l: [{ c: [ct("no", "%M0"), ct("nf", "%I0.2"), N, N, N], s: { t: "s", v: "%Q0.0" } }], v: [] },
      { com: "Niveau haut, ou hors service : elle s'arrête", l: [{ c: [ct("no", "%I0.3"), N, N, N, N], s: { t: "r", v: "%Q0.0" } }, { c: [ct("nf", "%M0"), N, N, N, N], s: null }], v: [[1]] },
      { com: "Voyant : pompe en marche", l: [{ c: [ct("no", "%Q0.0"), N, N, N, N], s: { t: "bob", v: "%Q0.1" } }], v: [] }] };
  }
  function exempleCuve(sansProg) {
    const b = plan(sansProg ? "Défi · Remplis la cuve" : "Remplissage d'une cuve (automate, capteurs PNP)");
    puissanceDirecte(b);
    const ap = automate24(b, 36, progCuve());
    if (sansProg) ap.prog = SA.validerProg({ lang: "ladder", noms: progCuve().noms });
    // +24 V en haut (y = 2), 0 V des capteurs juste dessous (y = 4)
    b.p("alim", 22, -1, "", { pot: "+24" }, 0);
    b.f([22, 1], [22, 2], [50, 2]).f([25, 18], [25, 2]);
    b.p("alim", 55, 1, "", { pot: "0V" }, 0);
    b.f([55, 3], [55, 4], [45, 4]);
    b.p("bp_nf", 31, 9, "S1", { num: "11-12" }); b.p("bp_no", 37, 9, "S2", { num: "13-14" });
    b.p("capteur3", 44, 9, "B1", { type: "PNP", sortie: "NO", detection: "capacitif" }); b.p("capteur3", 51, 9, "B2", { type: "PNP", sortie: "NO", detection: "capacitif" });
    b.f([31, 6], [31, 2]).f([37, 6], [37, 2]).f([43, 6], [43, 2]).f([50, 6], [50, 2]).f([45, 6], [45, 4]).f([52, 6], [52, 4]);
    b.f([31, 12], [31, 18]).f([37, 12], [37, 15], [33, 15], [33, 18]).f([44, 12], [44, 16], [35, 16], [35, 18]).f([51, 12], [51, 17], [37, 17], [37, 18]);
    // sorties : L → F2 → F1 95-96 → C0 ; %Q0.0 → KM1 (pompe), %Q0.1 → H1
    b.p("alim", 19, 13, "", { pot: "L" }, 0); b.p("fusible", 19, 19, "F2", { cal: 2 }); b.p("contact_th_nf", 19, 26, "F1", { num: "95-96" });
    b.f([19, 15], [19, 16]).f([19, 22], [19, 23]).f([19, 29], [19, 30], [25, 30]);
    b.p("bobine", 33, 36, "KM1", { tension: "230~" }); b.p("voyant", 39, 36, "H1", { couleur: "vert", tension: "230~" });
    b.f([27, 30], [27, 32], [33, 32], [33, 33]).f([29, 30], [29, 31], [39, 31], [39, 33]);
    b.p("alim", 36, 45, "", { pot: "N" });
    b.f([33, 39], [33, 41], [39, 41], [39, 39]).f([36, 43], [36, 41]);
    b.p("cuve", 58, 34, "PO1", { moteur: "M1", bas: "B1", haut: "B2", duree: 10, conso: 40, niveau: 50 });
    return b.s;
  }
  // tapis : S1 (arrêt, à ouverture), S2 (marche), S3 (acquittement), B1 (cellule optique PNP) ; KM1 le tapis, H1 lot complet
  const NOMS_TAPIS = { "%I0.0": "S1", "%I0.1": "S2", "%I0.2": "S3", "%I0.3": "B1", "%Q0.0": "KM1", "%Q0.1": "H1", "%C0": "LOT" };
  function progTapisGrafcet() {
    return { lang: "grafcet", noms: Object.assign({}, NOMS_TAPIS), grafcet: {
      etapes: [
        { n: 0, init: true, com: "attente, compteur à 0", actions: [{ t: "r", v: "%C0" }] },
        { n: 1, com: "le tapis avance", actions: [{ t: "n", v: "%Q0.0" }] },
        { n: 2, com: "une caisse de plus", actions: [{ t: "n", v: "%Q0.0" }, { t: "inc", v: "%C0" }] },
        { n: 3, com: "lot complet", actions: [{ t: "n", v: "%Q0.1" }] }],
      transitions: [{ de: [0], vers: [1], r: "S2" }, { de: [1], vers: [2], r: "↑B1" }, { de: [1], vers: [0], r: "/S1" },
        { de: [2], vers: [1], r: "C0.V < 5" }, { de: [2], vers: [3], r: "C0.V >= 5" }, { de: [3], vers: [0], r: "S3" }] } };
  }
  function progTapisLadder() {
    return { lang: "ladder", noms: Object.assign({}, NOMS_TAPIS), ladder: [
      { com: "Chaque caisse devant B1 compte 1 ; à 5, le lot est complet", l: [{ c: [ct("no", "%I0.3"), N, N, N, N], s: { t: "ctu", v: "%C0", p: 5 } }], v: [] },
      { com: "S2 : le tapis démarre, si le lot n'est pas complet", l: [{ c: [ct("no", "%I0.1"), ct("nf", "%C0"), N, N, N], s: { t: "s", v: "%Q0.0" } }], v: [] },
      { com: "S1, ou lot complet : le tapis s'arrête", l: [{ c: [ct("nf", "%I0.0"), N, N, N, N], s: { t: "r", v: "%Q0.0" } }, { c: [ct("no", "%C0"), N, N, N, N], s: null }], v: [[1]] },
      { com: "H1 : lot complet", l: [{ c: [ct("no", "%C0"), N, N, N, N], s: { t: "bob", v: "%Q0.1" } }], v: [] },
      { com: "S3 : acquittement, le compteur repart de 0", l: [{ c: [ct("no", "%I0.2"), N, N, N, N], s: { t: "r", v: "%C0" } }], v: [] }] };
  }
  function exempleTapis(defi) {
    const b = plan(defi ? "Défi · Compte les caisses" : "Tapis : un lot de 5 caisses (GRAFCET)");
    puissanceDirecte(b);
    automate24(b, 36, defi ? { lang: "ladder", noms: Object.assign({}, NOMS_TAPIS) } : progTapisGrafcet());
    // entrées : +24 V en haut (y = 2), 0 V des capteurs juste dessous (y = 4)
    b.p("alim", 22, -1, "", { pot: "+24" }, 0);
    b.f([22, 1], [22, 2], [49, 2]).f([25, 18], [25, 2]);
    b.p("alim", 55, 1, "", { pot: "0V" }, 0);
    b.f([55, 3], [55, 4], [51, 4]);
    b.p("bp_nf", 31, 9, "S1", { num: "11-12" }); b.p("bp_no", 37, 9, "S2", { num: "13-14" }); b.p("bp_no", 43, 9, "S3", { num: "13-14" });
    b.p("capteur3", 50, 9, "B1", { type: "PNP", sortie: "NO", detection: "optique" });
    b.f([31, 6], [31, 2]).f([37, 6], [37, 2]).f([43, 6], [43, 2]).f([49, 6], [49, 2]).f([51, 6], [51, 4]);
    b.f([31, 12], [31, 18]).f([37, 12], [37, 15], [33, 15], [33, 18]).f([43, 12], [43, 16], [35, 16], [35, 18]).f([50, 12], [50, 17], [37, 17], [37, 18]);
    // sorties : L → F2 → F1 95-96 → C0 ; %Q0.0 → KM1 (tapis), %Q0.1 → H1 (lot complet)
    b.p("alim", 19, 13, "", { pot: "L" }, 0); b.p("fusible", 19, 19, "F2", { cal: 2 }); b.p("contact_th_nf", 19, 26, "F1", { num: "95-96" });
    b.f([19, 15], [19, 16]).f([19, 22], [19, 23]).f([19, 29], [19, 30], [25, 30]);
    b.p("bobine", 33, 36, "KM1", { tension: "230~" }); b.p("voyant", 39, 36, "H1", { couleur: "orange", tension: "230~" });
    b.f([27, 30], [27, 32], [33, 32], [33, 33]).f([29, 30], [29, 31], [39, 31], [39, 33]);
    b.p("alim", 36, 45, "", { pot: "N" });
    b.f([33, 39], [33, 41], [39, 41], [39, 39]).f([36, 43], [36, 41]);
    b.p("tapis", 48, 57, "PO1", { moteur: "M1", sens: "1", capteur: "B1", duree: 6, ecart: 30, caisses: 0 });
    return b.s;
  }
  // tapis de tri : S2 (départ), S3 (acquittement), S4 et S5 (vérin rentré, sorti), B1 (cellule en bout de tapis) ;
  // KM1 le tapis, YV1 l'électrovanne du vérin (le volet envoie les caisses dans le bac 2), H1 lot complet
  const NOMS_TRI = { "%I0.0": "S2", "%I0.1": "S3", "%I0.2": "S4", "%I0.3": "S5", "%I0.4": "B1", "%Q0.0": "KM1", "%Q0.1": "YV1", "%Q0.2": "H1", "%C0": "LOT" };
  function progTri() {
    return { lang: "grafcet", noms: Object.assign({}, NOMS_TRI), grafcet: {
      etapes: [
        { n: 0, init: true, com: "attente, compteur à 0", actions: [{ t: "r", v: "%C0" }] },
        { n: 10, com: "le tapis avance", actions: [{ t: "n", v: "%Q0.0" }] },
        { n: 11, com: "tapis arrêté", actions: [] },
        { n: 20, com: "volet vers le bac 1", actions: [] },
        { n: 21, com: "+1, volet vers le bac 2", actions: [{ t: "inc", v: "%C0" }, { t: "n", v: "%Q0.1" }] },
        { n: 22, com: "+1, volet vers le bac 1", actions: [{ t: "inc", v: "%C0" }] },
        { n: 23, com: "lot trié", actions: [] },
        { n: 30, com: "lot complet", actions: [{ t: "n", v: "%Q0.2" }] }],
      transitions: [
        { de: [0], vers: [10, 20], r: "S2 · S4" }, { de: [10], vers: [11], r: "C0.V >= 6" },
        { de: [20], vers: [21], r: "↓B1" }, { de: [21], vers: [22], r: "↓B1" }, { de: [22], vers: [20], r: "C0.V < 6" }, { de: [22], vers: [23], r: "C0.V >= 6" },
        { de: [11, 23], vers: [30], r: "S4" }, { de: [30], vers: [0], r: "S3" }] } };
  }
  function exempleTri(defi) {
    const b = plan(defi ? "Défi · Deux choses en même temps" : "Tapis de tri : un bac sur deux (GRAFCET en ET)");
    puissanceDirecte(b);
    const pr = progTri();
    if (defi) pr.grafcet.transitions = pr.grafcet.transitions.filter((tr) => tr.de.length === 1 && tr.vers.length === 1);
    automate24(b, 36, pr);
    // entrées : +24 V en haut (y = 2), 0 V de la cellule juste dessous (y = 4)
    b.p("alim", 22, -1, "", { pot: "+24" }, 0);
    b.f([22, 1], [22, 2], [55, 2]).f([25, 18], [25, 2]);
    b.p("alim", 61, 1, "", { pot: "0V" }, 0);
    b.f([61, 3], [61, 4], [57, 4], [57, 6]);
    b.p("bp_no", 31, 9, "S2", { num: "13-14" }); b.p("bp_no", 37, 9, "S3", { num: "13-14" });
    b.p("fdc_no", 43, 9, "S4", { num: "13-14" }); b.p("fdc_no", 49, 9, "S5", { num: "13-14" });
    b.p("capteur3", 56, 9, "B1", { type: "PNP", sortie: "NO", detection: "optique" });
    b.f([31, 6], [31, 2]).f([37, 6], [37, 2]).f([43, 6], [43, 2]).f([49, 6], [49, 2]).f([55, 6], [55, 2]);
    b.f([31, 12], [31, 18]).f([37, 12], [37, 13], [33, 13], [33, 18]).f([43, 12], [43, 14], [35, 14], [35, 18]).f([49, 12], [49, 15], [37, 15], [37, 18]).f([56, 12], [56, 16], [39, 16], [39, 18]);
    // sorties : L → F2 → F1 95-96 → C0 ; %Q0.0 → KM1 (tapis), %Q0.1 → YV1 (vérin), %Q0.2 → H1 (lot complet)
    b.p("alim", 19, 13, "", { pot: "L" }, 0); b.p("fusible", 19, 19, "F2", { cal: 2 }); b.p("contact_th_nf", 19, 26, "F1", { num: "95-96" });
    b.f([19, 15], [19, 16]).f([19, 22], [19, 23]).f([19, 29], [19, 30], [25, 30]);
    b.p("bobine", 33, 36, "KM1", { tension: "230~" }); b.p("electrovanne", 39, 36, "YV1", { tension: "230~" }); b.p("voyant", 47, 36, "H1", { couleur: "orange", tension: "230~" });
    b.f([27, 30], [27, 33], [33, 33]).f([29, 30], [29, 32], [39, 32], [39, 33]).f([31, 30], [31, 31], [47, 31], [47, 33]);
    b.p("alim", 39, 45, "", { pot: "N" });
    b.f([33, 39], [33, 41], [47, 41], [47, 39]).f([39, 39], [39, 41]).f([39, 43], [39, 41]);
    b.p("tri", 46, 60, "PO1", { moteur: "M1", sens: "1", capteur: "B1", verin: "YV1", rentre: "S4", sorti: "S5", duree: 6, ecart: 30, caisses: 0, course: 0.5 });
    return b.s;
  }
  // tapis de tri surveillé : un deuxième GRAFCET (étapes 50, 51) surveille le vérin. S'il n'est pas sorti (S5) 1 s après
  // l'ordre (étape 21), ou pas rentré (S4) 1 s après (étape 20) : défaut, le tapis s'arrête (KM1 si /X51) et H2 clignote (%S6)
  function progTriSurveille() {
    const P = progTri(), G = P.grafcet;
    P.noms["%Q0.3"] = "H2";
    G.etapes.find((e) => e.n === 10).actions = [{ t: "n", v: "%Q0.0", si: "/X51" }];
    G.etapes.push({ n: 50, init: true, com: "surveillance du vérin", actions: [] }, { n: 51, com: "défaut vérin", actions: [{ t: "n", v: "%Q0.3", si: "%S6" }] });
    G.transitions.push({ de: [50], vers: [51], r: "t/X21/1s · /S5 + t/X20/1s · /S4" }, { de: [51], vers: [50], r: "↑S3" });
    return P;
  }
  function exempleTriSurveille(defi) {
    const b = plan(defi ? "Défi · Le vérin se bloque" : "Tapis de tri surveillé : défaut du vérin");
    puissanceDirecte(b);
    const pr = progTriSurveille();
    if (defi) {
      pr.grafcet.transitions = pr.grafcet.transitions.filter((tr) => tr.de[0] !== 50 && tr.de[0] !== 51);
      pr.grafcet.etapes.find((e) => e.n === 10).actions = [{ t: "n", v: "%Q0.0" }];
    }
    automate24(b, 36, pr);
    // entrées : comme le tapis de tri
    b.p("alim", 22, -1, "", { pot: "+24" }, 0);
    b.f([22, 1], [22, 2], [55, 2]).f([25, 18], [25, 2]);
    b.p("alim", 61, 1, "", { pot: "0V" }, 0);
    b.f([61, 3], [61, 4], [57, 4], [57, 6]);
    b.p("bp_no", 31, 9, "S2", { num: "13-14" }); b.p("bp_no", 37, 9, "S3", { num: "13-14" });
    b.p("fdc_no", 43, 9, "S4", { num: "13-14" }); b.p("fdc_no", 49, 9, "S5", { num: "13-14" });
    b.p("capteur3", 56, 9, "B1", { type: "PNP", sortie: "NO", detection: "optique" });
    b.f([31, 6], [31, 2]).f([37, 6], [37, 2]).f([43, 6], [43, 2]).f([49, 6], [49, 2]).f([55, 6], [55, 2]);
    b.f([31, 12], [31, 18]).f([37, 12], [37, 13], [33, 13], [33, 18]).f([43, 12], [43, 14], [35, 14], [35, 18]).f([49, 12], [49, 15], [37, 15], [37, 18]).f([56, 12], [56, 16], [39, 16], [39, 18]);
    // sorties en escalier : %Q0.0 → KM1, %Q0.1 → YV1, %Q0.2 → H1 (lot complet), %Q0.3 → H2 (défaut, rouge)
    b.p("alim", 19, 13, "", { pot: "L" }, 0); b.p("fusible", 19, 19, "F2", { cal: 2 }); b.p("contact_th_nf", 19, 26, "F1", { num: "95-96" });
    b.f([19, 15], [19, 16]).f([19, 22], [19, 23]).f([19, 29], [19, 30], [25, 30]);
    b.p("bobine", 33, 38, "KM1", { tension: "230~" }); b.p("electrovanne", 39, 38, "YV1", { tension: "230~" });
    b.p("voyant", 47, 38, "H1", { couleur: "orange", tension: "230~" }); b.p("voyant", 53, 38, "H2", { couleur: "rouge", tension: "230~" });
    b.f([27, 30], [27, 34], [33, 34], [33, 35]).f([29, 30], [29, 33], [39, 33], [39, 35]).f([31, 30], [31, 32], [47, 32], [47, 35]).f([33, 30], [33, 31], [53, 31], [53, 35]);
    b.p("alim", 39, 47, "", { pot: "N" });
    b.f([33, 41], [33, 43], [53, 43], [53, 41]).f([39, 41], [39, 43]).f([47, 41], [47, 43]).f([39, 45], [39, 43]);
    b.p("tri", 46, 62, "PO1", { moteur: "M1", sens: "1", capteur: "B1", verin: "YV1", rentre: "S4", sorti: "S5", duree: 6, ecart: 30, caisses: 0, course: 0.5 });
    return b.s;
  }
  // va-et-vient en logique câblée : S2 lance le chariot à droite, S4 le renvoie à gauche, S3 l'arrête
  function exempleVaEtVient(defi) {
    const b = plan(defi ? "Défi · Le chariot revient tout seul" : "Va-et-vient d'un chariot (logique câblée)");
    puissanceInversion(b);
    b.p("alim", 28, 1, "", { pot: "L" });
    b.p("fusible", 28, 7, "F2", { cal: 2 });
    b.p("contact_th_nf", 28, 14, "F1", { num: "95-96" });
    b.p("bp_nf", 28, 21, "S1", { num: "11-12" });
    b.p("bp_no", 28, 28, "S2", { num: "13-14" });
    b.p("contact_no", 34, 28, "KM1", { num: "13-14" });
    if (!defi) b.p("fdc_nf", 28, 35, "S4", { num: "11-12" });
    b.p("contact_nf", 28, 42, "KM2", { num: "21-22" });
    b.p("bobine", 28, 49, "KM1", { tension: "230~" });
    if (!defi) b.p("fdc_no", 42, 28, "S4", { num: "13-14" });
    b.p("contact_no", 48, 28, "KM2", { num: "13-14" });
    b.p("fdc_nf", 42, 35, "S3", { num: "11-12" });
    b.p("contact_nf", 42, 42, "KM1", { num: "21-22" });
    b.p("bobine", 42, 49, "KM2", { tension: "230~" });
    b.p("alim", 28, 55, "", { pot: "N" });
    b.f([28, 3], [28, 4]).f([28, 10], [28, 11]).f([28, 17], [28, 18]).f([28, 24], [28, 25]);
    b.f([28, 25], [34, 25]).f([34, 31], [28, 31]).f([28, 24], [42, 24], [42, 25]).f([42, 25], [48, 25]).f([48, 31], [42, 31]);
    b.f([28, 31], [28, 32]).f([28, 38], [28, 39]).f([28, 45], [28, 46]);
    b.f([42, 31], [42, 32]).f([42, 38], [42, 39]).f([42, 45], [42, 46]);
    b.f([28, 52], [28, 53]).f([42, 52], [42, 53], [28, 53]);
    b.p("chariot", 30, 63, "PO1", { moteur: "M1", sens: "1", gauche: "S3", droite: "S4", duree: 4, depart: "gauche" });
    return b.s;
  }
  function exempleVariateurPot(sansPot) {
    const b = plan(sansPot ? "Défi · Le potentiomètre de vitesse" : "Variateur : marche avant/arrière et potentiomètre");
    puissanceVariateur(b);
    b.p("interrupteur", 20, 30, "S2", { num: "13-14" });
    b.p("interrupteur", 26, 30, "S3", { num: "13-14" });
    b.f([12, 32], [16, 32], [16, 25], [26, 25], [26, 27]).f([20, 25], [20, 27]);
    b.f([20, 33], [20, 34], [12, 34]).f([26, 33], [26, 36], [12, 36]);
    b.p("potentiometre", 16, 44, "R1", { pos: 50 });
    if (!sansPot) b.f([12, 42], [14, 42]).f([12, 44], [14, 44]).f([12, 46], [14, 46]);
    return b.s;
  }

  /* ---------- les exemples ---------- */
  const EXEMPLES = [
    { id: "lampe", titre: "Une lampe et un bouton poussoir", niveau: "Pour commencer",
      resume: "H1 s'allume tant qu'on appuie sur S1. H2 reste allumé : S2 est un interrupteur.",
      construire() {
        const b = plan("Lampe et bouton poussoir");
        b.p("alim", 4, 1, "", { pot: "L" });
        b.p("fusible", 4, 7, "F1", { cal: 2 });
        b.p("bp_no", 4, 15, "S1", { num: "13-14" });
        b.p("interrupteur", 14, 15, "S2", { num: "13-14" });
        b.p("voyant", 4, 22, "H1", { couleur: "vert", tension: "230~" });
        b.p("voyant", 14, 22, "H2", { couleur: "orange", tension: "230~" });
        b.p("alim", 4, 29, "", { pot: "N" });
        b.f([4, 3], [4, 4]).f([4, 10], [4, 12]).f([4, 11], [14, 11], [14, 12]).f([4, 18], [4, 19]).f([14, 18], [14, 19]).f([4, 25], [4, 27]).f([14, 25], [14, 26], [4, 26]);
        return b.s;
      } },
    { id: "marche-arret", titre: "Marche-arrêt avec auto-maintien", niveau: "Démarrage direct",
      resume: "Puissance : Q1, KM1, F1, M1. Commande : S1 arrête, S2 met en marche, KM1 13-14 garde le contacteur collé.",
      construire() { const b = plan("Marche-arrêt, démarrage direct"); puissanceDirecte(b); commandeMA(b); return b.s; } },
    { id: "signalisation", titre: "Signalisation : marche et défaut thermique", niveau: "Démarrage direct",
      resume: "H1 (vert) s'allume quand le moteur tourne, H2 (orange) quand le relais thermique F1 a déclenché.",
      construire() {
        const b = plan("Signalisation marche et défaut");
        puissanceDirecte(b); commandeMA(b);
        b.p("contact_th_no", 34, 14, "F1", { num: "97-98" });
        b.p("contact_no", 40, 14, "KM1", { num: "43-44" });
        b.p("voyant", 34, 35, "H2", { couleur: "orange", tension: "230~" });
        b.p("voyant", 40, 35, "H1", { couleur: "vert", tension: "230~" });
        b.f([22, 10], [40, 10], [40, 11]).f([34, 10], [34, 11]).f([34, 17], [34, 32]).f([40, 17], [40, 32])
          .f([22, 39], [40, 39], [40, 38]).f([34, 38], [34, 39]);
        return b.s;
      } },
    { id: "inversion", titre: "Inversion du sens de marche", niveau: "Deux sens de rotation",
      resume: "KM1 : sens 1, KM2 : sens 2 (deux phases croisées). Le verrouillage électrique empêche KM1 et KM2 d'être fermés ensemble.",
      construire() { return inversion(true); } },
    { id: "etoile-triangle", titre: "Démarrage étoile-triangle", niveau: "Démarrage à courant réduit",
      resume: "S2 : KM1 et KM2 (étoile). Après 3 s, KA1 fait passer en triangle (KM3). Commande en 24 V par le transformateur T1.",
      construire() {
        const b = plan("Démarrage étoile-triangle");
        b.p("reseau", 2, 0);
        b.p("sectionneur", 4, 6, "Q1", { cal: 16 });
        b.p("poles", 4, 14, "KM1");
        b.p("thermique", 4, 25, "F1", { cal: 6 });
        b.p("moteur6", 4, 35, "M1", { plaque: "400/690" });
        b.p("poles", 22, 25, "KM3");
        b.p("poles", 32, 35, "KM2");
        for (const x of [2, 4, 6]) b.f([x, 2], [x, 3]).f([x, 9], [x, 11]).f([x, 17], [x, 22]).f([x, 28], [x, 31]);
        b.f([2, 18], [20, 18], [20, 22]).f([4, 19], [22, 19], [22, 22]).f([6, 20], [24, 20], [24, 22]);
        b.f([20, 28], [20, 42], [6, 42], [6, 40]).f([22, 28], [22, 43], [2, 43], [2, 40]).f([24, 28], [24, 44], [4, 44], [4, 40]);
        b.f([20, 29], [30, 29], [30, 32]).f([22, 30], [32, 30], [32, 32]).f([24, 31], [34, 31], [34, 32]);
        b.f([30, 38], [30, 39], [34, 39], [34, 38]).f([32, 38], [32, 39]);
        b.f([10, 2], [10, 30], [8, 30], [8, 31]);
        // commande en 24 V
        b.p("alim", 44, 0, "", { pot: "L1" }, 0);
        b.p("alim", 52, 0, "", { pot: "L2" }, 0);
        b.p("transfo", 48, 8, "T1", { prim: 400, sec: 24 });
        b.p("fusible", 49, 16, "F2", { cal: 2 });
        b.p("contact_th_nf", 49, 23, "F1", { num: "95-96" });
        b.p("bp_nf", 49, 30, "S1", { num: "11-12" });
        b.p("bp_no", 49, 37, "S2", { num: "13-14" });
        b.p("contact_no", 55, 37, "KM1", { num: "13-14" });
        b.p("bobine", 49, 59, "KM1", { tension: "24~" });
        b.p("tempo_travail", 57, 59, "KA1", { tension: "24~", delai: 3 });
        b.p("contact_tnf", 65, 45, "KA1", { num: "55-56" });
        b.p("contact_nf", 65, 52, "KM3", { num: "21-22" });
        b.p("bobine", 65, 59, "KM2", { tension: "24~" });
        b.p("contact_tno", 73, 45, "KA1", { num: "67-68" });
        b.p("contact_nf", 73, 52, "KM2", { num: "21-22" });
        b.p("bobine", 73, 59, "KM3", { tension: "24~" });
        b.f([44, 2], [44, 3], [47, 3], [47, 4]).f([52, 2], [52, 3], [49, 3], [49, 4]);
        b.f([49, 12], [49, 13]).f([49, 19], [49, 20]).f([49, 26], [49, 27]).f([49, 33], [49, 34]);
        b.f([49, 34], [55, 34]).f([55, 40], [49, 40]);
        b.f([49, 40], [49, 56]).f([49, 41], [73, 41], [73, 42]).f([57, 41], [57, 56]).f([65, 41], [65, 42]);
        b.f([65, 48], [65, 49]).f([65, 55], [65, 56]).f([73, 48], [73, 49]).f([73, 55], [73, 56]);
        b.f([47, 12], [47, 13], [41, 13], [41, 63], [73, 63], [73, 62]).f([49, 62], [49, 63]).f([57, 62], [57, 63]).f([65, 62], [65, 63]);
        return b.s;
      } },
    { id: "api-ladder", titre: "Marche-arrêt par automate (Ladder)", niveau: "Automate",
      resume: "S1, S2 et F1 sur les entrées de API1, KM1 et H1 sur ses sorties. Le programme en Ladder fait l'auto-maintien.",
      construire() { return exempleApiLadder(); } },
    { id: "api-grafcet", titre: "Aller-retour d'un chariot (GRAFCET)", niveau: "Automate",
      resume: "dcy (S2) : le chariot va à droite (KM1) jusqu'à b (S4), attend 3 s, revient (KM2) jusqu'à a (S3). Il actionne lui-même ses fins de course.",
      construire() { return exempleApiGrafcet(null, null, true); } },
    { id: "va-et-vient", titre: "Va-et-vient d'un chariot (logique câblée)", niveau: "Partie opérative",
      resume: "S2 : le chariot part à droite (KM1). Arrivé sur S4, KM1 retombe et KM2 le ramène ; il s'arrête sur S3. Les fins de course sont actionnés par le chariot.",
      construire() { return exempleVaEtVient(); } },
    { id: "cuve", titre: "Remplissage d'une cuve (automate, capteurs PNP)", niveau: "Partie opérative",
      resume: "S2 met en service : la pompe M1 démarre sous le niveau bas (B1) et s'arrête au niveau haut (B2). Programme en Ladder avec S et R ; niveaux détectés par des capteurs capacitifs 3 fils PNP.",
      construire() { return exempleCuve(); } },
    { id: "tapis", titre: "Tapis : un lot de 5 caisses (GRAFCET)", niveau: "Partie opérative",
      resume: "S2 lance le tapis ; à chaque caisse vue par la cellule B1, l'étape 2 ajoute 1 au compteur %C0. À 5 caisses, le tapis s'arrête et H1 s'allume ; S3 acquitte, S1 arrête. Un GRAFCET avec un compteur et un choix (divergence en OU).",
      construire() { return exempleTapis(); } },
    { id: "tri", titre: "Tapis de tri : un bac sur deux (GRAFCET en ET)", niveau: "Partie opérative",
      resume: "S2 (vérin rentré) : deux branches en même temps. Le tapis avance (étape 10) pendant que l'aiguillage envoie une caisse sur deux dans le bac 2 (étapes 20 à 22 : YV1 sort le vérin, qui bascule le volet). Après 6 caisses, les deux branches se rejoignent : H1, lot complet ; S3 acquitte.",
      construire() { return exempleTri(); } },
    { id: "tri-surveille", titre: "Tapis de tri surveillé : défaut du vérin", niveau: "Partie opérative",
      resume: "Le même tri, avec un deuxième GRAFCET qui surveille le vérin (étapes 50 et 51) : s'il n'est pas sorti 1 s après l'ordre, le tapis s'arrête et H2 clignote (horloge %S6). Pour l'essayer : « Bloquer la tige » dans le panneau de simulation, puis « Débloquer » et S3 pour acquitter.",
      construire() { return exempleTriSurveille(); } },
    { id: "api-variateur", titre: "Automate et variateur : deux sens, deux vitesses", niveau: "Variateur",
      resume: "API1 commande U1 : %Q0.0 → LI1 (avant), %Q0.1 → LI2 (arrière), AQ0 → AI1 (5 V : 25 Hz, 10 V : 50 Hz avec S4). Rampes de 2 s.",
      construire() { return exempleVariateurApi(); } },
    { id: "variateur-pot", titre: "Variateur, inverseur et potentiomètre", niveau: "Variateur",
      resume: "S2 : marche avant (LI1), S3 : marche arrière (LI2), alimentés par le +24V du variateur. Le potentiomètre R1 règle la vitesse sur AI1.",
      construire() { return exempleVariateurPot(); } }
  ];
  function inversion(verrou) {
    const b = plan(verrou ? "Inversion du sens de marche" : "Inversion du sens de marche (sans verrouillage)");
    b.p("reseau", 2, 0);
    b.p("sectionneur", 4, 6, "Q1", { cal: 10 });
    b.p("poles", 4, 16, "KM1");
    b.p("poles", 14, 16, "KM2");
    b.p("thermique", 4, 26, "F1", { cal: 6 });
    b.p("moteur", 4, 36, "M1");
    for (const x of [2, 4, 6]) b.f([x, 2], [x, 3]).f([x, 9], [x, 13]).f([x, 19], [x, 23]).f([x, 29], [x, 32]);
    b.f([2, 10], [12, 10], [12, 13]).f([4, 11], [14, 11], [14, 13]).f([6, 12], [16, 12], [16, 13]);
    b.f([12, 19], [12, 20], [6, 20]).f([14, 19], [14, 21], [4, 21]).f([16, 19], [16, 22], [2, 22]);
    b.f([10, 2], [10, 8], [19, 8], [19, 31], [8, 31], [8, 32]);
    // commande
    b.p("alim", 28, 1, "", { pot: "L" });
    b.p("fusible", 28, 7, "F2", { cal: 2 });
    b.p("contact_th_nf", 28, 14, "F1", { num: "95-96" });
    b.p("bp_nf", 28, 21, "S1", { num: "11-12" });
    b.p("bp_no", 28, 28, "S2", { num: "13-14" });
    b.p("contact_no", 34, 28, "KM1", { num: "13-14" });
    b.p("bp_no", 42, 28, "S3", { num: "13-14" });
    b.p("contact_no", 48, 28, "KM2", { num: "13-14" });
    if (verrou) { b.p("contact_nf", 28, 35, "KM2", { num: "21-22" }); b.p("contact_nf", 42, 35, "KM1", { num: "21-22" }); }
    b.p("bobine", 28, 42, "KM1", { tension: "230~" });
    b.p("bobine", 42, 42, "KM2", { tension: "230~" });
    b.p("alim", 28, 48, "", { pot: "N" });
    b.f([28, 3], [28, 4]).f([28, 10], [28, 11]).f([28, 17], [28, 18]).f([28, 24], [28, 25]);
    b.f([28, 25], [34, 25]).f([34, 31], [28, 31]).f([28, 24], [42, 24], [42, 25]).f([42, 25], [48, 25]).f([48, 31], [42, 31]);
    if (verrou) b.f([28, 31], [28, 32]).f([28, 38], [28, 39]).f([42, 31], [42, 32]).f([42, 38], [42, 39]);
    else b.f([28, 31], [28, 39]).f([42, 31], [42, 39]);
    b.f([28, 45], [28, 46]).f([42, 45], [42, 46], [28, 46]);
    return b.s;
  }

  /* ---------- petits schémas d'aide (affichés avec l'indice) ---------- */
  function aideMaintien() {
    const b = plan("aide");
    b.p("bp_nf", 2, 4, "S1"); b.p("bp_no", 2, 11, "S2"); b.p("contact_no", 8, 11, "KM1", { num: "13-14" }); b.p("bobine", 2, 18, "KM1");
    b.f([2, 7], [2, 8]).f([2, 8], [8, 8]).f([8, 14], [2, 14]).f([2, 14], [2, 15]);
    return b.s;
  }
  function aideThermique() {
    const b = plan("aide");
    b.p("alim", 2, -2, "", { pot: "L" }); b.p("fusible", 2, 4, "F2"); b.p("contact_th_nf", 2, 11, "F1", { num: "95-96" }); b.p("bp_nf", 2, 18, "S1");
    b.f([2, 0], [2, 1]).f([2, 7], [2, 8]).f([2, 14], [2, 15]);
    return b.s;
  }
  function aideSignal() {
    const b = plan("aide");
    b.p("contact_th_no", 2, 4, "F1", { num: "97-98" }); b.p("voyant", 2, 11, "H2", { couleur: "orange" });
    b.p("contact_no", 10, 4, "KM1", { num: "43-44" }); b.p("voyant", 10, 11, "H1", { couleur: "vert" });
    b.f([2, 7], [2, 8]).f([10, 7], [10, 8]).f([2, 1], [2, 0], [10, 0], [10, 1]);
    return b.s;
  }
  function aideVerrou() {
    const b = plan("aide");
    b.p("bp_no", 2, 4, "S2"); b.p("contact_nf", 2, 11, "KM2", { num: "21-22" }); b.p("bobine", 2, 18, "KM1");
    b.p("bp_no", 12, 4, "S3"); b.p("contact_nf", 12, 11, "KM1", { num: "21-22" }); b.p("bobine", 12, 18, "KM2");
    b.f([2, 7], [2, 8]).f([2, 14], [2, 15]).f([12, 7], [12, 8]).f([12, 14], [12, 15]);
    return b.s;
  }
  function aideVaEtVient() {
    const b = plan("aide");
    b.p("fdc_nf", 2, 4, "S4", { num: "11-12" }); b.p("bobine", 2, 11, "KM1");
    b.p("fdc_no", 10, 4, "S4", { num: "13-14" }); b.p("contact_no", 16, 4, "KM2", { num: "13-14" }); b.p("bobine", 10, 11, "KM2");
    b.f([2, 7], [2, 8]).f([10, 1], [16, 1]).f([10, 7], [16, 7]).f([10, 7], [10, 8]);
    return b.s;
  }

  /* ---------- les défis ---------- */
  const MA = (b) => { puissanceDirecte(b); };
  const DEFIS = [
    { id: "d1-lampe", titre: "Allume la lampe", niveau: 1,
      resume: "Câbler un bouton poussoir et un voyant.",
      consigne: "<p>Relie les symboles par des fils pour que <b>H1 s'allume tant qu'on appuie sur S1</b>, et s'éteigne quand on lâche.</p><p class=\"discret\">Le courant part de <b>L</b>, passe par le fusible <b>F1</b>, le bouton <b>S1</b>, le voyant <b>H1</b>, et revient au neutre <b>N</b>. Pour tirer un fil : glisse d'une borne à une autre.</p>",
      indice: "Un seul chemin, sans raccourci : L → F1 → S1 → H1 → N. Les ronds orange montrent les bornes encore libres.",
      depart() {
        const b = plan("Défi 1 · Allume la lampe");
        b.p("alim", 6, 1, "", { pot: "L" }); b.p("fusible", 6, 7, "F1", { cal: 2 });
        b.p("bp_no", 16, 14, "S1", { num: "13-14" }); b.p("voyant", 16, 24, "H1", { couleur: "vert" });
        b.p("alim", 6, 31, "", { pot: "N" });
        b.f([6, 3], [6, 4]);
        return b.s;
      },
      exige: { S1: "bouton", H1: "voyant" },
      etapes: [
        { texte: "Au repos, H1 est éteint", verifier: { H1: false }, si: "H1 est allumé alors que personne n'appuie : S1 n'est pas sur le chemin du courant de H1, ou un fil le contourne." },
        { texte: "J'appuie sur S1 : H1 s'allume", faire: [["appuyer", "S1"]], verifier: { H1: true }, si: "H1 ne s'allume pas. Suis le courant : L → F1 → S1 → H1 → N. Chaque borne doit avoir son fil (plus de rond orange)." },
        { texte: "Je lâche S1 : H1 s'éteint", faire: [["relacher", "S1"]], verifier: { H1: false }, si: "H1 reste allumé quand tu lâches S1 : S1 doit être en série avec H1." }
      ] },
    { id: "d2-maintien", titre: "Câble l'auto-maintien", niveau: 2,
      resume: "Le moteur doit rester en marche quand on lâche S2.",
      consigne: "<p>Pour l'instant, KM1 ne reste collé que tant qu'on appuie sur S2. Ajoute ce qu'il faut pour que <b>le moteur reste en marche quand on lâche S2</b>, et que <b>S1 l'arrête</b>.</p><p class=\"discret\">Dans « Contacteurs et relais », prends un <b>contact à fermeture</b> et donne-lui le repère <b>KM1</b>.</p>",
      indice: "Le contact KM1 13-14 se branche en parallèle sur S2 : quand KM1 colle, il prend le relais de S2.",
      aide: aideMaintien,
      depart() { const b = plan("Défi 2 · L'auto-maintien"); MA(b); commandeMA(b, { sansMaintien: true }); return b.s; },
      exige: { S1: "bouton", S2: "bouton", KM1: "contacteur", M1: "moteur" },
      etapes: [
        { texte: "J'appuie sur S2 : KM1 colle et le moteur tourne", faire: [["appuyer", "S2"]], verifier: { KM1: true, M1: "marche" }, si: "KM1 doit coller quand on appuie sur S2. Ne coupe pas le chemin L → F2 → F1 → S1 → S2 → KM1 → N." },
        { texte: "Je lâche S2 : KM1 reste collé", faire: [["relacher", "S2"]], verifier: { KM1: true }, si: "KM1 retombe quand tu lâches S2. Ajoute un contact KM1 à fermeture (13-14) en parallèle sur S2 : c'est l'auto-maintien." },
        { texte: "J'appuie sur S1 : KM1 retombe, le moteur s'arrête", faire: [["appuyer", "S1"]], verifier: { KM1: false, M1: "arret" }, si: "S1 doit couper KM1 : le contact d'auto-maintien se branche en parallèle sur S2 seulement, sous S1." },
        { texte: "Je lâche S1 : le moteur reste arrêté", faire: [["relacher", "S1"]], verifier: { KM1: false }, si: "Le moteur repart tout seul quand tu lâches S1 : le contact d'auto-maintien ne doit pas contourner S1." }
      ] },
    { id: "d3-thermique", titre: "Le relais thermique coupe la commande", niveau: 2,
      resume: "En cas de surcharge, F1 doit arrêter le moteur.",
      consigne: "<p>Le relais thermique <b>F1</b> surveille le courant du moteur. Quand il déclenche, son contact <b>95-96</b> s'ouvre. Place ce contact pour qu'<b>une surcharge arrête le moteur</b>, et qu'après le réarmement il faille appuyer de nouveau sur S2.</p>",
      indice: "Le contact F1 95-96 (à ouverture) se met en série au début du circuit de commande, juste après le fusible F2, avant S1.",
      aide: aideThermique,
      depart() { const b = plan("Défi 3 · Le relais thermique"); MA(b); commandeMA(b, { sansThermique: true }); return b.s; },
      exige: { S1: "bouton", S2: "bouton", KM1: "contacteur", F1: "thermique" },
      etapes: [
        { texte: "S2 : le moteur se met en marche", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, M1: "marche" }, si: "La marche ne fonctionne plus : vérifie que le chemin L → F2 → … → KM1 → N est complet." },
        { texte: "Surcharge : F1 déclenche, le moteur doit s'arrêter", faire: [["surcharge", "F1"]], verifier: { KM1: false, M1: "arret" }, si: "Le moteur continue de tourner alors que F1 a déclenché. Place le contact F1 95-96 (à ouverture) en série au début du circuit de commande, avant S1." },
        { texte: "Je réarme F1 : le moteur ne repart pas tout seul", faire: [["rearmer", "F1"]], verifier: { KM1: false }, si: "Après le réarmement, le moteur ne doit pas redémarrer tout seul : il faut appuyer sur S2." },
        { texte: "S2 : le moteur repart", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true }, si: "Après le réarmement, S2 doit pouvoir remettre en marche." }
      ] },
    { id: "d4-signal", titre: "Signalisation marche et défaut", niveau: 2,
      resume: "H1 s'allume en marche, H2 quand le relais thermique déclenche.",
      consigne: "<p>Branche les deux voyants :</p><ul><li><b>H1</b> (vert) allumé quand le moteur tourne ;</li><li><b>H2</b> (orange) allumé quand le relais thermique <b>F1</b> a déclenché.</li></ul><p class=\"discret\">Il te faut un contact KM1 à fermeture (43-44) et le contact F1 97-98.</p>",
      indice: "H2 se branche derrière F1 97-98, pris juste après le fusible F2 (avant le contact 95-96, qui s'ouvre au défaut). H1 se branche derrière un contact KM1 à fermeture.",
      aide: aideSignal,
      depart() {
        const b = plan("Défi 4 · Signalisation"); MA(b); commandeMA(b);
        b.p("voyant", 36, 35, "H1", { couleur: "vert" }); b.p("voyant", 44, 35, "H2", { couleur: "orange" });
        return b.s;
      },
      exige: { KM1: "contacteur", F1: "thermique", H1: "voyant", H2: "voyant" },
      etapes: [
        { texte: "Au repos : H1 et H2 éteints", verifier: { H1: false, H2: false }, si: "Au repos, aucun voyant ne doit être allumé : chaque voyant doit passer par un contact à fermeture." },
        { texte: "En marche : H1 allumé, H2 éteint", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, H1: true, H2: false }, si: "Quand KM1 est collé, H1 doit s'allumer : branche H1 derrière un contact KM1 à fermeture (43-44)." },
        { texte: "Surcharge : H1 s'éteint, H2 s'allume", faire: [["surcharge", "F1"]], verifier: { KM1: false, H1: false, H2: true }, si: "Quand F1 a déclenché, H2 doit s'allumer : branche H2 derrière le contact F1 97-98 (à fermeture), alimenté avant le contact 95-96." },
        { texte: "Je réarme F1 : H2 s'éteint", faire: [["rearmer", "F1"]], verifier: { H2: false }, si: "Après le réarmement, H2 doit s'éteindre." }
      ] },
    { id: "d5-verrou", titre: "Ajoute le verrouillage électrique", niveau: 3,
      resume: "KM1 et KM2 ne doivent jamais être fermés ensemble.",
      consigne: "<p>Ce schéma d'inversion du sens de marche est <b>dangereux</b> : si on appuie sur S3 pendant que KM1 est collé, KM2 colle aussi et les phases L1 et L3 se touchent. Ajoute le <b>verrouillage électrique</b> : KM2 ne peut pas coller quand KM1 est collé, et inversement.</p><p class=\"discret\">Essaie d'abord en simulation : appuie sur S2, puis sur S3.</p>",
      indice: "Un contact KM2 à ouverture (21-22) en série avec la bobine KM1, et un contact KM1 à ouverture en série avec la bobine KM2.",
      aide: aideVerrou,
      depart() { return Object.assign(inversion(false), { titre: "Défi 5 · Le verrouillage électrique" }); },
      exige: { S1: "bouton", S2: "bouton", S3: "bouton", KM1: "contacteur", KM2: "contacteur", M1: "moteur" },
      etapes: [
        { texte: "S2 : KM1 colle, le moteur tourne dans le sens 1", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, KM2: false, M1: "sens1" }, si: "S2 doit faire coller KM1 (et lui seul), le moteur tourne alors dans le sens 1." },
        { texte: "S3 alors que KM1 est collé : KM2 ne colle pas", faire: [["appuyer", "S3"]], verifier: { KM2: false, court: false }, si: "KM2 s'est fermé alors que KM1 était fermé : court-circuit entre phases ! Mets un contact KM1 à ouverture (21-22) en série avec la bobine KM2." },
        { texte: "S1 : tout s'arrête", faire: [["relacher", "S3"], ["appuyer", "S1"], ["relacher", "S1"]], verifier: { KM1: false, KM2: false }, si: "S1 doit tout arrêter." },
        { texte: "S3 : KM2 colle, le moteur tourne dans le sens 2", faire: [["appuyer", "S3"], ["relacher", "S3"]], verifier: { KM2: true, M1: "sens2" }, si: "S3 doit faire coller KM2 : vérifie que son contact de verrouillage est bien un contact KM1 à ouverture." },
        { texte: "S2 alors que KM2 est collé : KM1 ne colle pas", faire: [["appuyer", "S2"]], verifier: { KM1: false, court: false }, si: "KM1 s'est fermé alors que KM2 était fermé : mets un contact KM2 à ouverture (21-22) en série avec la bobine KM1." },
        { texte: "S1 : tout s'arrête", faire: [["relacher", "S2"], ["appuyer", "S1"], ["relacher", "S1"]], verifier: { KM1: false, KM2: false }, si: "S1 doit tout arrêter." }
      ] },
    { id: "d6-puissance", titre: "Câble le circuit de puissance", niveau: 3,
      resume: "Du réseau au moteur, en passant par Q1, KM1 et F1.",
      consigne: "<p>La commande est déjà câblée. Câble la <b>puissance</b> : chaque phase du réseau passe par <b>Q1</b>, puis <b>KM1</b>, puis <b>F1</b>, et arrive au moteur. Le moteur doit tourner dans le <b>sens 1</b> (L1 → U, L2 → V, L3 → W), et sa carcasse doit être reliée à la <b>terre</b>.</p>",
      indice: "Trois fils parallèles, sans croiser les phases : 1-3-5 en haut de chaque appareil, 2-4-6 en bas. La borne PE du moteur va au PE du réseau.",
      depart() { const b = plan("Défi 6 · Le circuit de puissance"); puissanceDirecte(b, false); commandeMA(b); return b.s; },
      exige: { Q1: "sectionneur", KM1: "contacteur", F1: "thermique", M1: "moteur", S1: "bouton", S2: "bouton" },
      etapes: [
        { texte: "Au repos, le moteur est arrêté", verifier: { M1: "arret" }, si: "Le moteur tourne alors que KM1 est ouvert : ses bornes ne doivent recevoir le réseau qu'à travers les pôles de KM1." },
        { texte: "S2 : le moteur tourne dans le sens 1", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { M1: "sens1" }, si: "Quand KM1 colle, le moteur doit recevoir les trois phases dans l'ordre : L1 → U, L2 → V, L3 → W, en passant par Q1, KM1 et F1." },
        { texte: "Le courant du moteur traverse Q1 et F1", protege: [["Q1", "M1"], ["F1", "M1"]], si: "Chaque phase doit traverser le sectionneur Q1 (il protège avec ses fusibles) et le relais thermique F1 (il surveille le courant)." },
        { texte: "La carcasse du moteur est à la terre", terre: ["M1"], si: "Relie la borne PE du moteur à la borne PE du réseau : c'est le fil vert et jaune qui protège les personnes." },
        { texte: "S1 : le moteur s'arrête", faire: [["appuyer", "S1"], ["relacher", "S1"]], verifier: { M1: "arret" }, si: "Quand KM1 retombe, le moteur doit s'arrêter : les trois phases doivent passer par les pôles de KM1." }
      ] },
    { id: "d7-ladder", titre: "Programme l'automate en Ladder", niveau: 2,
      resume: "Marche, arrêt et auto-maintien, mais dans le programme.",
      consigne: "<p>Le câblage est fait : <b>S1</b> (arrêt) sur %I0.0, <b>S2</b> (marche) sur %I0.1, le contact <b>F1</b> 95-96 sur %I0.2 ; <b>KM1</b> sur %Q0.0 et <b>H1</b> sur %Q0.1. Clique sur l'automate <b>API1</b>, puis sur <b>Programmer</b>, et écris le programme en Ladder :</p><ul><li>S2 met le moteur en marche, et il <b>reste en marche</b> quand on lâche S2 ;</li><li><b>S1</b> l'arrête, une <b>surcharge</b> (F1) aussi ;</li><li>H1 s'allume quand KM1 est commandé.</li></ul><p class=\"discret\">Attention : S1 est un bouton à ouverture. Au repos il est fermé, donc %I0.0 vaut 1 : dans le programme, il se met avec un contact <b>à fermeture</b>.</p>",
      indice: "Réseau 1 : S2 sur la première ligne, KM1 (contact) juste en dessous, relié par une liaison verticale (c'est l'auto-maintien), puis S1 et F1 en série, et la bobine KM1. Réseau 2 : un contact KM1 et la bobine H1.",
      depart() { return exempleApiLadder(true); },
      exige: { API1: "automate", KM1: "contacteur", H1: "voyant", S1: "bouton", S2: "bouton", F1: "thermique" },
      etapes: [
        { texte: "Au repos : KM1 n'est pas commandé", verifier: { KM1: false }, si: "KM1 colle alors que personne n'appuie : as-tu mis S2 avec un contact à ouverture ? Ou la ligne de KM1 est-elle vide ?" },
        { texte: "J'appuie sur S2 : KM1 colle, le moteur tourne", faire: [["appuyer", "S2"]], verifier: { KM1: true, M1: "marche" }, si: "KM1 doit coller quand on appuie sur S2. Vérifie le premier réseau : S2 (%I0.1), S1 (%I0.0) et F1 (%I0.2) avec des contacts à fermeture, puis la bobine KM1 (%Q0.0)." },
        { texte: "Je lâche S2 : KM1 reste collé et H1 est allumé", faire: [["relacher", "S2"]], verifier: { KM1: true, H1: true }, si: "Il faut l'auto-maintien : un contact KM1 (%Q0.0) en parallèle avec S2 (une ligne en dessous, reliée par une liaison verticale). Et un réseau KM1 → H1." },
        { texte: "J'appuie sur S1 : KM1 retombe", faire: [["appuyer", "S1"]], verifier: { KM1: false }, si: "S1 doit arrêter : il se met en série, après le OU de S2 et de KM1." },
        { texte: "Je lâche S1 : le moteur reste arrêté, H1 éteint", faire: [["relacher", "S1"]], verifier: { KM1: false, H1: false }, si: "Le moteur repart quand tu lâches S1 : l'auto-maintien ne doit pas contourner S1." },
        { texte: "S2, puis surcharge : F1 arrête le moteur", faire: [["appuyer", "S2"], ["relacher", "S2"], ["surcharge", "F1"]], verifier: { KM1: false }, si: "Quand F1 déclenche, %I0.2 passe à 0 : mets F1 (%I0.2) en série avec S1." },
        { texte: "Je réarme F1 : le moteur ne repart pas tout seul", faire: [["rearmer", "F1"]], verifier: { KM1: false }, si: "Après le réarmement, il faut appuyer de nouveau sur S2." }
      ] },
    { id: "d8-grafcet", titre: "Complète le GRAFCET du chariot", niveau: 2,
      resume: "Aller à droite, retour à gauche, et on attend.",
      consigne: "<p>Quand on appuie sur <b>dcy</b> (S2), le chariot part à droite (<b>KM1</b>) : c'est déjà programmé (étapes 0 et 1). Complète le GRAFCET de <b>API1</b> :</p><ul><li>quand le chariot arrive à droite (<b>b</b>, fin de course S4), il repart à gauche (<b>KM2</b>) ;</li><li>quand il arrive à gauche (<b>a</b>, S3), il s'arrête et attend un nouveau dcy.</li></ul><p class=\"discret\">Pendant la simulation, clique sur S3 et S4 pour dire où est le chariot.</p>",
      indice: "Ajoute l'étape 2 avec l'action KM2. Puis deux transitions : de 1 vers 2 avec la réceptivité b, et de 2 vers 0 avec la réceptivité a.",
      depart() {
        const pr = progChariot();
        pr.grafcet.etapes = pr.grafcet.etapes.slice(0, 2); pr.grafcet.transitions = pr.grafcet.transitions.slice(0, 1);
        return exempleApiGrafcet(pr, "Défi · Le GRAFCET du chariot");
      },
      exige: { API1: "automate", KM1: "contacteur", KM2: "contacteur", S2: "bouton", S3: "fdc", S4: "fdc" },
      etapes: [
        { texte: "Au repos : rien ne bouge", verifier: { KM1: false, KM2: false }, si: "Au départ, seule l'étape initiale 0 est active, et elle n'a pas d'action." },
        { texte: "dcy : le chariot part à droite", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, KM2: false }, si: "La transition 0 → 1 (dcy) et l'action KM1 de l'étape 1 étaient déjà là : ne les efface pas." },
        { texte: "Il arrive à droite (b) : il repart à gauche", faire: [["basculer", "S4"]], verifier: { KM1: false, KM2: true }, si: "Quand b passe à 1, il faut passer de l'étape 1 à une étape qui commande KM2 : ajoute l'étape 2 (action KM2) et la transition 1 → 2 (réceptivité b)." },
        { texte: "Il arrive à gauche (a) : il s'arrête", faire: [["basculer", "S4"], ["basculer", "S3"]], verifier: { KM1: false, KM2: false }, si: "Quand a passe à 1, le GRAFCET doit revenir à l'étape 0 : ajoute la transition 2 → 0 avec la réceptivité a." },
        { texte: "Il attend un nouveau départ", faire: [["basculer", "S3"]], attendre: 600, verifier: { KM1: false, KM2: false }, si: "À l'étape 0, rien ne doit bouger tant qu'on n'appuie pas sur dcy." },
        { texte: "dcy : il repart à droite", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true, KM2: false }, si: "Après un aller-retour, dcy doit relancer un cycle : la dernière transition doit ramener à l'étape 0." }
      ] },
    { id: "d9-variateur", titre: "Relie l'automate au variateur", niveau: 3,
      resume: "Ordres de marche sur LI1 et LI2, consigne sur AI1.",
      consigne: "<p>Le programme de <b>API1</b> est prêt : <b>%Q0.0</b> = marche avant, <b>%Q0.1</b> = marche arrière, la sortie analogique <b>AQ0</b> = la consigne de vitesse (5 V ou 10 V avec S4). Câble l'automate au variateur <b>U1</b> :</p><ul><li><b>C0</b> (le commun des sorties) au <b>+24V</b> du variateur ;</li><li><b>%Q0.0</b> à <b>LI1</b>, <b>%Q0.1</b> à <b>LI2</b> ;</li><li><b>AQ0</b> à <b>AI1</b>, et le <b>COM</b> du variateur au 0 V.</li></ul>",
      indice: "Une sortie à relais est un contact entre C0 et %Q0.0 : C0 reçoit le +24V du variateur, et quand le relais se ferme, le +24 V arrive sur LI1. AI1 se mesure par rapport à COM : relie COM au repère 0 V posé à côté.",
      depart() { return exempleVariateurApi(true); },
      exige: { API1: "automate", U1: "variateur", M1: "moteur", S1: "bouton", S2: "bouton", S3: "bouton" },
      etapes: [
        { texte: "Au repos : le moteur est arrêté", verifier: { U1: "arret", M1: "arret" }, si: "Le variateur ne doit tourner que sur un ordre de l'automate." },
        { texte: "S2 : marche avant, petite vitesse (25 Hz)", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 2500, verifier: { U1: 25, M1: "sens1" }, si: "Il faut le +24V du variateur sur C0, %Q0.0 sur LI1 (marche avant), et AQ0 sur AI1 (5 V donnent 25 Hz)." },
        { texte: "S4 : grande vitesse (50 Hz)", faire: [["basculer", "S4"]], attendre: 3000, verifier: { U1: 50 }, si: "Avec S4, l'automate envoie 10 V sur AQ0 : AQ0 doit aller sur AI1, et COM au 0 V." },
        { texte: "S1 : le moteur s'arrête (rampe de décélération)", faire: [["appuyer", "S1"], ["relacher", "S1"]], attendre: 3000, verifier: { U1: "arret", M1: "arret" }, si: "S1 coupe %Q0.0 : LI1 ne reçoit plus le +24 V et le variateur ralentit jusqu'à l'arrêt." },
        { texte: "S3 : marche arrière", faire: [["basculer", "S4"], ["appuyer", "S3"], ["relacher", "S3"]], attendre: 2500, verifier: { U1: "arriere", M1: "sens2" }, si: "La marche arrière, c'est %Q0.1 sur LI2." }
      ] },
    { id: "d10-potentiometre", titre: "Le potentiomètre de vitesse", niveau: 2,
      resume: "Câbler la consigne 0-10 V d'un variateur.",
      consigne: "<p>Le variateur <b>U1</b> prend sa consigne de vitesse sur <b>AI1</b> : 0 V donne 0 Hz, 10 V donnent 50 Hz. Câble le potentiomètre <b>R1</b> :</p><ul><li>sa borne <b>1</b> au <b>+10V</b> du variateur ;</li><li>son curseur <b>2</b> à <b>AI1</b> ;</li><li>sa borne <b>3</b> au <b>COM</b>.</li></ul><p class=\"discret\">S2 donne l'ordre de marche avant (LI1), S3 l'ordre de marche arrière (LI2). Pendant la simulation, règle R1 dans le panneau.</p>",
      indice: "Les trois bornes de R1 sont en face de +10V, AI1 et COM : trois petits fils horizontaux.",
      depart() { return exempleVariateurPot(true); },
      exige: { U1: "variateur", R1: "potentiometre", M1: "moteur", S2: "interrupteur", S3: "interrupteur" },
      etapes: [
        { texte: "S2 : le moteur tourne en avant (R1 à 50 % : 25 Hz)", faire: [["basculer", "S2"]], attendre: 3000, verifier: { U1: 25, M1: "sens1" }, si: "À 50 %, le curseur de R1 donne 5 V à AI1, donc 25 Hz. Relie 1 au +10V, 2 à AI1, 3 au COM." },
        { texte: "R1 à fond : 50 Hz", faire: [["regler", "R1", 1]], attendre: 3000, verifier: { U1: 50 }, si: "R1 à fond : le curseur est sur la borne 1, qui doit être au +10V." },
        { texte: "R1 à 20 % : 10 Hz", faire: [["regler", "R1", 0.2]], attendre: 4000, verifier: { U1: 10 }, si: "À 20 %, le curseur donne 2 V : la borne 3 doit être au COM (0 V)." },
        { texte: "S2 coupé, S3 : marche arrière", faire: [["basculer", "S2"], ["basculer", "S3"]], attendre: 3000, verifier: { U1: "arriere", M1: "sens2" }, si: "S3 commande LI2 (marche arrière) : il est déjà câblé, ne le change pas." }
      ] },
    { id: "d11-cuve", titre: "Remplis la cuve", niveau: 3,
      resume: "Programmer un remplissage automatique avec S et R.",
      consigne: "<p>Le câblage est fait : <b>S1</b> (arrêt, à ouverture) sur %I0.0, <b>S2</b> (marche) sur %I0.1, le capteur du niveau bas <b>B1</b> sur %I0.2 et celui du niveau haut <b>B2</b> sur %I0.3 ; la pompe <b>KM1</b> sur %Q0.0 et le voyant <b>H1</b> sur %Q0.1. Programme <b>API1</b> en Ladder :</p><ul><li><b>S2</b> met l'installation en service, <b>S1</b> la met hors service ;</li><li>en service, la pompe <b>démarre</b> quand l'eau descend sous B1, et <b>s'arrête</b> quand elle atteint B2 — elle ne repart pas avant d'être redescendue sous B1 ;</li><li>H1 est allumé quand la pompe tourne.</li></ul><p class=\"discret\">B1 vaut 1 quand l'eau est au-dessus du niveau bas, B2 quand elle atteint le niveau haut. L'eau est consommée en continu.</p>",
      indice: "Un bit %M0 (AUTO) : S2 le met à 1 (bobine S), S1 le remet à 0 (bobine R, avec un contact à ouverture car S1 est à ouverture). Puis : AUTO et non B1 → S KM1 ; B2 → R KM1. Une bobine simple « KM1 = non B2 » ferait repartir la pompe dès que l'eau baisse un peu.",
      depart() { return exempleCuve(true); },
      exige: { API1: "automate", KM1: "contacteur", H1: "voyant", S1: "bouton", S2: "bouton", B1: "capteur", B2: "capteur", PO1: "cuve" },
      etapes: [
        { texte: "S2 : mise en service. La cuve est à moitié pleine : la pompe attend", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: false }, si: "Au-dessus du niveau bas, la pompe ne doit pas tourner." },
        { texte: "L'eau descend sous B1 : la pompe démarre", attendre: 8000, verifier: { KM1: true, H1: true }, si: "Quand B1 passe à 0 (l'eau sous le niveau bas), et que l'installation est en service, mets KM1 à 1 avec une bobine S. Et H1 suit KM1." },
        { texte: "L'eau atteint B2 : la pompe s'arrête, la cuve ne déborde pas", attendre: 10500, verifier: { KM1: false, PO1: "sans-debord" }, si: "Quand B2 passe à 1 (niveau haut), remets KM1 à 0 avec une bobine R." },
        { texte: "L'eau redescend un peu : la pompe ne repart pas tout de suite", attendre: 3000, verifier: { KM1: false }, si: "La pompe ne doit repartir que sous le niveau bas : utilise S et R plutôt qu'une bobine « KM1 = non B2 »." },
        { texte: "S1 : hors service. Même sous le niveau bas, la pompe ne repart pas", faire: [["appuyer", "S1"], ["relacher", "S1"]], attendre: 13000, verifier: { KM1: false }, si: "S1 doit mettre l'installation hors service (le bit AUTO à 0), et la pompe ne doit démarrer qu'en service." },
        { texte: "S2 : remise en service, la pompe repart", faire: [["appuyer", "S2"], ["relacher", "S2"]], verifier: { KM1: true }, si: "En service et sous le niveau bas : la pompe doit démarrer." }
      ] },
    { id: "d12-va-et-vient", titre: "Le chariot revient tout seul", niveau: 2,
      resume: "Les deux contacts du fin de course S4 en logique câblée.",
      consigne: "<p>S2 lance le chariot vers la droite (<b>KM1</b>) ; S3, le fin de course de gauche, arrête déjà le retour. Il manque le fin de course de droite <b>S4</b> : pose ses deux contacts aux places vides.</p><ul><li>un contact <b>à ouverture</b> (11-12) qui coupe KM1 quand le chariot arrive à droite ;</li><li>un contact <b>à fermeture</b> (13-14) qui lance KM2 (le retour), en parallèle avec l'auto-maintien de KM2.</li></ul><p class=\"discret\">Sans S4, le chariot va forcer contre la butée de droite : le moteur se bloque, chauffe, et le relais thermique déclenche.</p>",
      indice: "Prends « Fin de course NF » et « Fin de course NO » dans la palette, repère S4 pour les deux. Le NF va sous S2 et KM1 (branche de gauche), le NO à côté du contact 13-14 de KM2 (branche de droite).",
      aide: aideVaEtVient,
      depart() { return exempleVaEtVient(true); },
      exige: { KM1: "contacteur", KM2: "contacteur", S2: "bouton", S3: "fdc", M1: "moteur", PO1: "chariot" },
      etapes: [
        { texte: "Au repos : le chariot est à gauche, rien ne bouge", verifier: { KM1: false, KM2: false, PO1: "gauche" }, si: "Au repos, aucun contacteur ne doit coller." },
        { texte: "S2 : le chariot part à droite", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 300, verifier: { KM1: true, KM2: false, M1: "sens1" }, si: "La branche de KM1 doit conduire : pose le contact à ouverture S4 (11-12) à la place vide, sous S2 et KM1." },
        { texte: "Il arrive à droite : KM1 retombe et KM2 le ramène", attendre: 4500, verifier: { KM1: false, KM2: true, M1: "sens2" }, si: "Quand le chariot actionne S4, son contact à ouverture coupe KM1 et son contact à fermeture lance KM2." },
        { texte: "Il revient à gauche et s'arrête sur S3", attendre: 4500, verifier: { KM1: false, KM2: false, PO1: "gauche" }, si: "KM2 doit se maintenir après le départ de S4 (son contact 13-14), et S3 l'arrête à gauche." },
        { texte: "Le chariot n'a jamais forcé contre une butée, F1 n'a pas déclenché", verifier: { PO1: "sans-butee", F1: false }, si: "Le moteur doit s'arrêter sur les fins de course, avant les butées." }
      ] },
    { id: "d13-tapis", titre: "Compte les caisses", niveau: 3,
      resume: "Programmer un compteur (CTU) en Ladder : le tapis s'arrête après 5 caisses.",
      consigne: "<p>Le câblage est fait : <b>S1</b> (arrêt, à ouverture) sur %I0.0, <b>S2</b> (marche) sur %I0.1, <b>S3</b> (acquittement) sur %I0.2, et la cellule <b>B1</b>, qui voit passer les caisses, sur %I0.3 ; le moteur du tapis <b>KM1</b> sur %Q0.0 et le voyant <b>H1</b> (lot complet) sur %Q0.1. Programme <b>API1</b> en Ladder :</p><ul><li><b>S2</b> fait démarrer le tapis, <b>S1</b> l'arrête ;</li><li>chaque caisse qui passe devant B1 est comptée : à la <b>5e caisse</b>, le tapis s'arrête et <b>H1</b> s'allume ;</li><li>tant que le lot n'est pas acquitté, S2 ne relance pas le tapis ; <b>S3</b> acquitte : H1 s'éteint et le compte repart de 0.</li></ul><p class=\"discret\">Une caisse passe devant B1 toutes les 1,8 s environ.</p>",
      indice: "Un compteur CTU %C0 réglé à 5, commandé par un contact B1 : il compte chaque front montant. Le contact %C0 vaut 1 quand le compte est atteint. Puis : S2 et non %C0 → S KM1 ; S1 (contact à ouverture, car S1 est à ouverture) ou %C0 → R KM1 ; %C0 → H1 ; S3 → R %C0.",
      depart() { return exempleTapis(true); },
      exige: { API1: "automate", KM1: "contacteur", H1: "voyant", S1: "bouton", S2: "bouton", S3: "bouton", B1: "capteur", PO1: "tapis" },
      etapes: [
        { texte: "Au repos : le tapis est arrêté", verifier: { KM1: false, H1: false }, si: "Au repos, KM1 ne doit pas être alimenté." },
        { texte: "S2 : le tapis démarre et reste en marche", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 300, verifier: { KM1: true, M1: "sens1" }, si: "S2 doit mettre KM1 à 1 avec une bobine S, pour que le tapis continue quand on lâche S2." },
        { texte: "Après la 5e caisse, le tapis s'arrête et H1 s'allume", attendre: 11200, verifier: { KM1: false, H1: true, PO1: 5 }, si: "Compte les caisses avec un compteur CTU %C0 réglé à 5 et commandé par B1 ; quand %C0 est atteint, remets KM1 à 0 (bobine R) et allume H1." },
        { texte: "S2 : le tapis ne repart pas tant que le lot n'est pas acquitté", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 300, verifier: { KM1: false }, si: "Mets un contact à ouverture %C0 en série avec S2 : on ne relance pas un lot complet." },
        { texte: "S3 : acquittement, H1 s'éteint", faire: [["appuyer", "S3"], ["relacher", "S3"]], attendre: 200, verifier: { H1: false }, si: "S3 doit remettre le compteur à 0 (bobine R sur %C0)." },
        { texte: "S2 : un nouveau lot de 5 caisses, puis arrêt", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 9600, verifier: { KM1: false, H1: true, PO1: 10 }, si: "Après l'acquittement, le compte repart de 0 : 5 nouvelles caisses, et le tapis s'arrête." },
        { texte: "S3 puis S2 : le tapis repart", faire: [["appuyer", "S3"], ["relacher", "S3"], ["appuyer", "S2"], ["relacher", "S2"]], attendre: 600, verifier: { KM1: true, H1: false }, si: "Après S3, le compte est à 0 : S2 doit relancer le tapis." },
        { texte: "S1 : le tapis s'arrête tout de suite", faire: [["appuyer", "S1"], ["relacher", "S1"]], attendre: 300, verifier: { KM1: false }, si: "S1 (à ouverture) doit remettre KM1 à 0 : un contact à ouverture S1 sur la bobine R." }
      ] },
    { id: "d14-tri", titre: "Deux choses en même temps", niveau: 3,
      resume: "GRAFCET : divergence et convergence en ET (le tapis et l'aiguillage).",
      consigne: "<p>Sur ce tapis de tri, deux choses se passent <b>en même temps</b> : le tapis avance (étapes 10 et 11), et l'aiguillage envoie une caisse sur deux dans le bac 2 (étapes 20 à 23 : <b>YV1</b> fait sortir le vérin, qui bascule le volet). Les étapes sont écrites, avec les transitions de chaque branche. Il manque deux transitions dans le GRAFCET de <b>API1</b> :</p><ul><li>la <b>divergence en ET</b> : de l'étape 0 vers les étapes 10 <b>et</b> 20 à la fois, quand on appuie sur <b>S2</b> et que le vérin est rentré (<b>S4</b>) ;</li><li>la <b>convergence en ET</b> : des étapes 11 <b>et</b> 23 vers l'étape 30 (H1, lot complet), quand le vérin est rentré (<b>S4</b>).</li></ul><p class=\"discret\">Une transition peut partir de plusieurs étapes et aller vers plusieurs étapes : écris « 10, 20 » dans la case « vers ».</p>",
      indice: "Ajoute la transition de 0 vers « 10, 20 » avec la réceptivité S2 · S4 : les deux branches démarrent ensemble. Puis la transition de « 11, 23 » vers 30 avec la réceptivité S4 : on attend que les deux branches aient fini.",
      depart() { return exempleTri(true); },
      exige: { API1: "automate", KM1: "contacteur", YV1: "electrovanne", H1: "voyant", S2: "bouton", S3: "bouton", S4: "fdc", S5: "fdc", B1: "capteur", PO1: "tri" },
      etapes: [
        { texte: "Au repos : rien ne bouge", verifier: { KM1: false, YV1: false, H1: false }, si: "Au départ, seule l'étape initiale 0 est active." },
        { texte: "S2 : le tapis avance, et l'aiguillage attend la première caisse", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 300, verifier: { KM1: true, API1: "X20" }, si: "La transition qui part de l'étape 0 doit activer les étapes 10 et 20 en même temps : une seule transition, « vers » = 10, 20, réceptivité S2 · S4." },
        { texte: "Les caisses tombent une fois dans le bac 1, une fois dans le bac 2", attendre: 11000, verifier: { PO1: [2, 1], KM1: true }, si: "Les deux branches doivent tourner ensemble : pendant que le tapis avance (étape 10), l'aiguillage alterne (étapes 20, 21, 22)." },
        { texte: "Après 6 caisses : le tapis s'arrête, H1 s'allume (lot complet)", attendre: 5300, verifier: { PO1: [3, 3], KM1: false, H1: true }, si: "Ajoute la convergence en ET : une transition de « 11, 23 » vers 30, réceptivité S4. L'étape 30 ne s'active que quand les deux branches ont fini." },
        { texte: "S3 : acquittement, H1 s'éteint", faire: [["appuyer", "S3"], ["relacher", "S3"]], attendre: 200, verifier: { H1: false, KM1: false }, si: "La transition 30 → 0 (S3) était déjà là : ne l'efface pas." },
        { texte: "S2 : un nouveau lot, trié de la même façon", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 12000, verifier: { PO1: [6, 6], KM1: false, H1: true }, si: "Après l'acquittement, le GRAFCET revient à l'étape 0 et S2 relance les deux branches." }
      ] },
    { id: "d15-defaut", titre: "Le vérin se bloque", niveau: 3,
      resume: "GRAFCET de surveillance : temporisation, défaut, voyant clignotant, acquittement.",
      consigne: "<p>Le tapis de tri marche, mais si la tige du vérin se bloque, personne ne s'en aperçoit. Un deuxième GRAFCET doit <b>surveiller le vérin</b>. Ses étapes sont écrites : <b>50</b> (initiale : surveillance) et <b>51</b> (défaut : « H2 si %S6 », H2 clignote). À toi :</p><ul><li>la transition de <b>50 vers 51</b> : YV1 est commandée depuis 1 s (étape 21) et la tige n'est toujours pas sortie : <b>t/X21/1s · /S5</b> ;</li><li>la transition de <b>51 vers 50</b> : l'opérateur acquitte avec <b>↑S3</b> ;</li><li>dans l'étape <b>10</b>, la condition <b>/X51</b> sur l'action KM1 (« si… ») : pendant le défaut, le tapis s'arrête.</li></ul><p class=\"discret\">Pour essayer : en simulation, « Bloquer la tige » dans la carte du tapis, puis « Débloquer la tige » et S3.</p>",
      indice: "X21 vaut 1 pendant l'étape 21, et t/X21/1s devient vrai 1 s après son activation. La transition 50 → 51 : t/X21/1s · /S5. Pour KM1 : dans l'étape 10, écris /X51 dans la case « si… » de l'action.",
      depart() { return exempleTriSurveille(true); },
      exige: { API1: "automate", KM1: "contacteur", YV1: "electrovanne", H1: "voyant", H2: "voyant", S2: "bouton", S3: "bouton", S4: "fdc", S5: "fdc", B1: "capteur", PO1: "tri" },
      etapes: [
        { texte: "Au repos : rien ne bouge, H2 éteint", verifier: { KM1: false, YV1: false, H2: false } },
        { texte: "S2 : le tapis avance, la surveillance (étape 50) attend", faire: [["appuyer", "S2"], ["relacher", "S2"]], attendre: 300, verifier: { KM1: true, API1: "X50" }, si: "L'étape initiale 50 doit être active avec l'étape 0 : ne décoche pas « initiale »." },
        { texte: "Panne : la tige se bloque. Après la 1re caisse, YV1 commande le vérin, mais S5 ne vient pas : 1 s plus tard, défaut (étape 51)", faire: [["coincer", "PO1", true]], attendre: 7700, verifier: { YV1: true, API1: "X51" }, si: "Le défaut n'est pas vu : ajoute la transition de 50 vers 51, réceptivité t/X21/1s · /S5 (YV1 depuis 1 s, et toujours pas S5)." },
        { texte: "Pendant le défaut, le tapis s'arrête", verifier: { KM1: false }, si: "L'étape 51 est active, mais le tapis avance encore : dans l'étape 10, mets la condition /X51 sur l'action KM1 (case « si… »)." },
        { texte: "H2 clignote : allumé…", verifier: { H2: true }, si: "Dans l'étape 51, l'action doit rester « H2 si %S6 »." },
        { texte: "… puis éteint une demi-seconde", attendre: 500, verifier: { H2: false, KM1: false } },
        { texte: "La tige est débloquée : elle sort (S5), mais rien ne repart sans acquittement", faire: [["coincer", "PO1", false]], attendre: 700, verifier: { S5: true, KM1: false, API1: "X51" }, si: "Le défaut doit rester jusqu'à l'acquittement par S3 : la transition 51 → 50 se fait sur ↑S3, pas sur S5." },
        { texte: "S3 : acquittement, H2 s'éteint et le tapis repart", faire: [["appuyer", "S3"], ["relacher", "S3"]], attendre: 300, verifier: { API1: "X50", KM1: true, H2: false }, si: "Ajoute la transition de 51 vers 50, réceptivité ↑S3." },
        { texte: "Le lot se termine : 3 caisses dans chaque bac, H1", attendre: 9000, verifier: { PO1: [3, 3], KM1: false, H1: true, H2: false }, si: "Après l'acquittement, le tri doit reprendre normalement : la caisse suivante va dans le bac 2." }
      ] }
  ];

  /* ---------- dépannage : un schéma juste, une panne cachée (tirée au hasard parmi celles que l'essai montre) ---------- */
  const ex = (id) => () => EXEMPLES.find((e) => e.id === id).construire();
  const marche = [["appuyer", "S2"], ["relacher", "S2"]], arret = [["appuyer", "S1"], ["relacher", "S1"]];
  const DEPANNAGES = [
    { id: "p1-marche-arret", titre: "Démarrage direct", niveau: 1, base: ex("marche-arret"),
      resume: "Marche-arrêt d'un moteur : S2, S1, auto-maintien, relais thermique.",
      fonctionnement: "<p>On appuie sur <b>S2</b> (marche) : le contacteur <b>KM1</b> colle et le moteur <b>M1</b> démarre. Quand on lâche S2, KM1 reste collé : son contact 13-14 le maintient. <b>S1</b> (arrêt) arrête tout. Si le moteur force, le relais thermique <b>F1</b> déclenche et arrête le moteur.</p>",
      essai: [
        { faire: [["appuyer", "S2"]], verifier: { KM1: true, M1: "marche" } },
        { faire: [["relacher", "S2"]], verifier: { KM1: true, M1: "marche" } },
        { faire: arret, verifier: { KM1: false, M1: "arret" } },
        { faire: marche, attendre: 1500, verifier: { KM1: true, M1: "marche" } },
        { faire: [["surcharge", "F1"]], verifier: { KM1: false, M1: "arret" } },
        { faire: [["rearmer", "F1"]], verifier: { KM1: false } }] },
    { id: "p2-signalisation", titre: "Marche-arrêt avec voyants", niveau: 1, base: ex("signalisation"),
      resume: "Le même, avec H1 (en marche) et H2 (défaut thermique).",
      fonctionnement: "<p>Comme le démarrage direct : <b>S2</b> met en marche, <b>S1</b> arrête, <b>KM1</b> se maintient tout seul. En plus, le voyant <b>H1</b> (vert) s'allume quand le moteur tourne, et le voyant <b>H2</b> (orange) quand le relais thermique <b>F1</b> a déclenché.</p>",
      essai: [
        { verifier: { H1: false, H2: false } },
        { faire: marche, verifier: { KM1: true, M1: "marche", H1: true, H2: false } },
        { faire: arret, verifier: { KM1: false, M1: "arret", H1: false } },
        { faire: marche, attendre: 1500, verifier: { KM1: true, M1: "marche" } },
        { faire: [["surcharge", "F1"]], verifier: { KM1: false, H1: false, H2: true } },
        { faire: [["rearmer", "F1"]], verifier: { KM1: false, H2: false } }] },
    { id: "p3-inversion", titre: "Inversion du sens de marche", niveau: 2, base: ex("inversion"),
      resume: "Deux contacteurs, deux sens, un verrouillage électrique.",
      fonctionnement: "<p><b>S2</b> : <b>KM1</b> colle, le moteur tourne dans le sens 1. <b>S3</b> : <b>KM2</b> colle, il tourne dans le sens 2. <b>S1</b> arrête. Chaque contacteur se maintient tout seul (13-14), et ils ne peuvent pas coller ensemble : le verrouillage passe par KM1 21-22 et KM2 21-22.</p>",
      essai: [
        { faire: marche, verifier: { KM1: true, KM2: false, M1: "sens1" } },
        { faire: arret, verifier: { KM1: false, M1: "arret" } },
        { faire: [["appuyer", "S3"], ["relacher", "S3"]], attendre: 1500, verifier: { KM2: true, KM1: false, M1: "sens2" } },
        { faire: arret, verifier: { KM2: false, M1: "arret" } },
        { faire: marche, attendre: 1500, verifier: { KM1: true, M1: "sens1" } },
        { faire: [["surcharge", "F1"]], verifier: { KM1: false, KM2: false } }] },
    { id: "p4-automate", titre: "Marche-arrêt par automate", niveau: 2, base: ex("api-ladder"),
      resume: "Les boutons sur les entrées, KM1 et H1 sur les sorties.",
      fonctionnement: "<p>Les boutons <b>S1</b>, <b>S2</b> et le contact <b>F1</b> 95-96 arrivent sur les entrées de l'automate <b>API1</b> ; <b>KM1</b> et <b>H1</b> sont sur ses sorties. <b>S2</b> : KM1 colle, le moteur démarre, H1 s'allume, et ça reste en marche quand on lâche S2. <b>S1</b> arrête ; une surcharge de <b>F1</b> aussi. Les voyants de l'automate montrent ses entrées et ses sorties : c'est la première chose à regarder.</p>",
      essai: [
        { verifier: { KM1: false, H1: false } },
        { faire: [["appuyer", "S2"]], verifier: { KM1: true, M1: "marche" } },
        { faire: [["relacher", "S2"]], verifier: { KM1: true, H1: true } },
        { faire: arret, verifier: { KM1: false, H1: false, M1: "arret" } },
        { faire: marche, attendre: 1500, verifier: { KM1: true, M1: "marche" } },
        { faire: [["surcharge", "F1"]], verifier: { KM1: false } },
        { faire: [["rearmer", "F1"]], verifier: { KM1: false } }] },
    { id: "p5-etoile-triangle", titre: "Démarrage étoile-triangle", niveau: 3, base: ex("etoile-triangle"),
      resume: "Trois contacteurs, un relais temporisé, une commande en 24 V.",
      fonctionnement: "<p><b>S2</b> : <b>KM1</b> et <b>KM2</b> collent, le moteur démarre en <b>étoile</b>. 3 s plus tard, le relais temporisé <b>KA1</b> fait retomber KM2 et coller <b>KM3</b> : le moteur passe en <b>triangle</b>. <b>S1</b> arrête tout. La commande est en 24 V, par le transformateur <b>T1</b>.</p>",
      essai: [
        { faire: marche, verifier: { KM1: true, KM2: true, KM3: false, M1: "etoile" } },
        { attendre: 3300, verifier: { KM1: true, KM2: false, KM3: true, M1: "triangle" } },
        { faire: arret, verifier: { KM1: false, KM2: false, KM3: false, M1: "arret" } },
        { faire: marche, attendre: 3300, verifier: { M1: "triangle" } },
        { faire: [["surcharge", "F1"]], verifier: { KM1: false, KM3: false } }] }
  ];

  const API = { DEPANNAGES, EXEMPLES, DEFIS, inversion, plan, progMA, progChariot, progVariateur, progCuve, progTapisGrafcet, progTapisLadder, progTri, progTriSurveille, exempleApiLadder, exempleApiGrafcet, exempleVariateurApi, exempleVariateurPot, exempleCuve, exempleVaEtVient, exempleTapis, exempleTri, exempleTriSurveille };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasExemples = API;
})(typeof window !== "undefined" ? window : globalThis);
