/* =====================================================================
   Atelier schémas — le MODÈLE (aucun accès à la page : marche aussi dans Node)
   - le catalogue des symboles : bornes (position sur la grille, numéro), paramètres, préfixe du repère ;
   - la géométrie : rotation, boîte d'un symbole, bornes à leur place sur la feuille ;
   - la liste des liaisons (« netlist ») : ce qui est relié à quoi, d'après le dessin
     (une borne ou un bout de fil posé sur un fil y est relié ; deux fils qui se croisent ne le sont pas) ;
   - les repères automatiques (KM1, S2…) et les numéros de bornes des contacts (13-14, 21-22…) ;
   - le tracé automatique d'un fil à angles droits entre deux bornes ;
   - la lecture sûre d'un fichier .json importé.
   Coordonnées : en pas de grille (entiers). Un pas = G pixels à zoom 1.
   ===================================================================== */
(function (g) {
  "use strict";
  const G = 10;

  /* ---------- rotation (quart de tour dans le sens des aiguilles d'une montre, y vers le bas) ---------- */
  const rotP = (x, y, r) => (r === 1 ? [-y, x] : r === 2 ? [-x, -y] : r === 3 ? [y, -x] : [x, y]);
  const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], o: [-1, 0] };
  const NOM_DIR = (v) => (v[1] < 0 ? "n" : v[1] > 0 ? "s" : v[0] > 0 ? "e" : "o");
  const rotDir = (d, r) => (DIRS[d] ? NOM_DIR(rotP(DIRS[d][0], DIRS[d][1], r)) : d);

  /* ---------- numéros de bornes « 13-14 » ---------- */
  function paire(num, a, b) {
    const m = /^\s*([0-9A-Za-z]{1,4})\s*-\s*([0-9A-Za-z]{1,4})\s*$/.exec(num == null ? "" : String(num));
    return m ? [m[1], m[2]] : [a, b];
  }
  const deux = (na, nb) => [{ id: "a", x: 0, y: -3, d: "n", n: na }, { id: "b", x: 0, y: 3, d: "s", n: nb }];
  const deuxNum = (p, na, nb) => { const [a, b] = paire(p.num, na, nb); return deux(a, b); };
  const poles = (n) => {
    const L = [];
    for (let k = 0; k < n; k++) {
      const x = 2 * k - (n - 1);
      L.push({ id: String(2 * k + 1), x, y: -3, d: "n", n: String(2 * k + 1) }, { id: String(2 * k + 2), x, y: 3, d: "s", n: String(2 * k + 2) });
    }
    return L;
  };

  /* ---------- le catalogue ----------
     cat : rangement dans la palette · pref : début du repère automatique (KM → KM1, KM2…)
     lien : le symbole appartient à un appareil dessiné ailleurs (contact de KM1, pôles de KM1…)
     p : paramètres par défaut · bornes(p) : bornes dans le repère du symbole · boite : [x0, y0, x1, y1] */
  const TYPES = {};
  const def = (id, o) => { TYPES[id] = Object.assign({ id, p: {}, pref: "", boite: [-1, -3, 1, 3] }, o); };

  // Alimentations
  def("reseau", { nom: "Réseau triphasé", court: "Réseau 3~", cat: "alim", boite: [-1, -1.6, 9, 2],
    bornes: () => ["L1", "L2", "L3", "N", "PE"].map((id, i) => ({ id, x: 2 * i, y: 2, d: "s", n: id })) });
  def("alim", { nom: "Repère de potentiel", court: "Potentiel", cat: "alim", p: { pot: "L" }, boite: (p) => (p.pot === "PE" ? [-1, -1, 3, 2] : p.pot === "+24" ? [-2, -1, 2, 2] : [-1.5, -1, 1.5, 2]),
    bornes: () => [{ id: "a", x: 0, y: 2, d: "s", n: "" }], rotDefaut: (p) => (/^(N|0V|PE)$/.test(p.pot) ? 2 : 0) });
  def("transfo", { nom: "Transformateur de commande", court: "Transfo", cat: "alim", pref: "T", p: { prim: 400, sec: 24 }, boite: [-2.4, -4, 2.4, 4],
    bornes: (p) => [{ id: "p1", x: -1, y: -4, d: "n", n: "0" }, { id: "p2", x: 1, y: -4, d: "n", n: String(p.prim) },
      { id: "s1", x: -1, y: 4, d: "s", n: "0" }, { id: "s2", x: 1, y: 4, d: "s", n: String(p.sec) }] });

  // Protections
  def("fusible", { nom: "Fusible", court: "Fusible", cat: "prot", pref: "F", p: { cal: 2 }, boite: [-1, -3, 1, 3], bornes: () => deux("1", "2") });
  def("sectionneur", { nom: "Sectionneur porte-fusibles", court: "Sectionneur", cat: "prot", pref: "Q", p: { cal: 10 }, boite: [-4.2, -3, 2.8, 3], bornes: () => poles(3) });
  def("disjoncteur", { nom: "Disjoncteur", court: "Disjoncteur", cat: "prot", pref: "Q", p: { poles: 2, cal: 10 },
    boite: (p) => [-(p.poles - 1) - 4.6, -3, (p.poles - 1) + 0.8, 3], bornes: (p) => poles(Math.max(1, Math.min(3, p.poles | 0))) });
  def("disj_moteur", { nom: "Disjoncteur-moteur", court: "Disj. moteur", cat: "prot", pref: "Q", p: { cal: 6 }, boite: [-6.6, -3, 2.8, 3], bornes: () => poles(3) });
  def("thermique", { nom: "Relais thermique", court: "Relais thermique", cat: "prot", pref: "F", p: { cal: 6 }, boite: [-3, -3, 3, 3], bornes: () => poles(3) });

  // Commande (organes que l'on actionne à la main pendant la simulation)
  def("bp_no", { nom: "Bouton poussoir à fermeture", court: "BP marche", cat: "cmd", pref: "S", p: { num: "13-14" }, boite: [-3, -3, 1, 3], bornes: (p) => deuxNum(p, "13", "14") });
  def("bp_nf", { nom: "Bouton poussoir à ouverture", court: "BP arrêt", cat: "cmd", pref: "S", p: { num: "11-12" }, boite: [-3, -3, 1.6, 3], bornes: (p) => deuxNum(p, "11", "12") });
  def("arret_urgence", { nom: "Arrêt d'urgence (coup de poing)", court: "Arrêt d'urgence", cat: "cmd", pref: "S", p: { num: "11-12" }, boite: [-3.4, -3, 1.6, 3], bornes: (p) => deuxNum(p, "11", "12") });
  def("selecteur", { nom: "Sélecteur 2 positions", court: "Sélecteur", cat: "cmd", pref: "S", p: { num: "13-14", contact: "no" }, boite: [-3.2, -3, 1.6, 3], bornes: (p) => deuxNum(p, p.contact === "nf" ? "11" : "13", p.contact === "nf" ? "12" : "14") });
  def("interrupteur", { nom: "Interrupteur", court: "Interrupteur", cat: "cmd", pref: "S", p: { num: "13-14" }, boite: [-3, -3, 1, 3], bornes: (p) => deuxNum(p, "13", "14") });
  def("fdc_no", { nom: "Fin de course à fermeture", court: "Fin de course NO", cat: "cmd", pref: "S", p: { num: "13-14" }, boite: [-2.4, -3, 1, 3], bornes: (p) => deuxNum(p, "13", "14") });
  def("fdc_nf", { nom: "Fin de course à ouverture", court: "Fin de course NF", cat: "cmd", pref: "S", p: { num: "11-12" }, boite: [-2.4, -3, 1.6, 3], bornes: (p) => deuxNum(p, "11", "12") });
  def("capteur", { nom: "Capteur de proximité", court: "Capteur", cat: "cmd", pref: "B", p: { num: "13-14" }, boite: [-3.6, -3, 1, 3], bornes: (p) => deuxNum(p, "13", "14") });

  // Contacteurs et relais
  def("bobine", { nom: "Bobine de contacteur", court: "Bobine KM", cat: "rel", pref: "KM", p: { tension: "230~" }, boite: [-1.4, -3, 1.4, 3], bornes: () => deux("A1", "A2") });
  def("relais", { nom: "Bobine de relais auxiliaire", court: "Relais KA", cat: "rel", pref: "KA", p: { tension: "230~" }, boite: [-1.4, -3, 1.4, 3], bornes: () => deux("A1", "A2") });
  def("tempo_travail", { nom: "Relais temporisé travail (retard à l'enclenchement)", court: "Tempo. travail", cat: "rel", pref: "KA", p: { tension: "230~", delai: 3 }, boite: [-2.4, -3, 2.6, 3], bornes: () => deux("A1", "A2") });
  def("tempo_repos", { nom: "Relais temporisé repos (retard au déclenchement)", court: "Tempo. repos", cat: "rel", pref: "KA", p: { tension: "230~", delai: 3 }, boite: [-2.4, -3, 2.6, 3], bornes: () => deux("A1", "A2") });
  def("poles", { nom: "Pôles de puissance d'un contacteur", court: "Pôles KM", cat: "rel", pref: "KM", lien: true, boite: [-3.4, -3, 2.6, 3], bornes: () => poles(3) });
  def("contact_no", { nom: "Contact à fermeture (NO)", court: "Contact NO", cat: "rel", pref: "KM", lien: true, p: { num: "13-14" }, boite: [-1.4, -3, 1, 3], bornes: (p) => deuxNum(p, "13", "14") });
  def("contact_nf", { nom: "Contact à ouverture (NF)", court: "Contact NF", cat: "rel", pref: "KM", lien: true, p: { num: "21-22" }, boite: [-1.2, -3, 1.6, 3], bornes: (p) => deuxNum(p, "21", "22") });
  def("contact_tno", { nom: "Contact temporisé à fermeture", court: "Tempo. NO", cat: "rel", pref: "KA", lien: true, p: { num: "67-68" }, boite: [-2.4, -3, 1, 3], bornes: (p) => deuxNum(p, "67", "68") });
  def("contact_tnf", { nom: "Contact temporisé à ouverture", court: "Tempo. NF", cat: "rel", pref: "KA", lien: true, p: { num: "55-56" }, boite: [-2.4, -3, 1.6, 3], bornes: (p) => deuxNum(p, "55", "56") });
  def("contact_th_nf", { nom: "Contact du relais thermique 95-96", court: "Thermique 95-96", cat: "rel", pref: "F", lien: true, p: { num: "95-96" }, boite: [-3, -3, 1.6, 3], bornes: (p) => deuxNum(p, "95", "96") });
  def("contact_th_no", { nom: "Contact du relais thermique 97-98", court: "Thermique 97-98", cat: "rel", pref: "F", lien: true, p: { num: "97-98" }, boite: [-3, -3, 1, 3], bornes: (p) => deuxNum(p, "97", "98") });

  // Récepteurs
  def("voyant", { nom: "Voyant", court: "Voyant", cat: "rec", pref: "H", p: { couleur: "vert", tension: "230~" }, boite: [-1.2, -3, 1.6, 3], bornes: () => deux("X1", "X2") });
  def("moteur", { nom: "Moteur asynchrone triphasé", court: "Moteur M 3~", cat: "rec", pref: "M", boite: [-2.8, -4, 4.4, 3.4],
    bornes: () => [{ id: "U", x: -2, y: -4, d: "n", n: "U" }, { id: "V", x: 0, y: -4, d: "n", n: "V" }, { id: "W", x: 2, y: -4, d: "n", n: "W" }, { id: "PE", x: 4, y: -4, d: "n", n: "PE" }] });
  def("moteur6", { nom: "Moteur 6 bornes (étoile-triangle)", court: "Moteur 6 bornes", cat: "rec", pref: "M", p: { plaque: "400/690" }, boite: [-2.8, -4, 4.4, 5],
    bornes: () => [{ id: "U1", x: -2, y: -4, d: "n", n: "U1" }, { id: "V1", x: 0, y: -4, d: "n", n: "V1" }, { id: "W1", x: 2, y: -4, d: "n", n: "W1" },
      { id: "U2", x: -2, y: 5, d: "s", n: "U2" }, { id: "V2", x: 0, y: 5, d: "s", n: "V2" }, { id: "W2", x: 2, y: 5, d: "s", n: "W2" }, { id: "PE", x: 4, y: -4, d: "n", n: "PE" }] });

  // Automate et variateur
  // libre(id) : cette borne peut rester sans fil (pas de rond orange, pas de remarque)
  const BORNES_API = (() => {
    const L = [{ id: "p24", x: -11, y: -6, d: "n", n: "+24V" }, { id: "m0", x: -9, y: -6, d: "n", n: "0V" }, { id: "COM", x: -7, y: -6, d: "n", n: "COM" }];
    for (let k = 0; k < 8; k++) L.push({ id: "I" + k, x: -5 + 2 * k, y: -6, d: "n", n: "%I0." + k });
    L.push({ id: "C0", x: -11, y: 6, d: "s", n: "C0" });
    for (let k = 0; k < 4; k++) L.push({ id: "Q" + k, x: -9 + 2 * k, y: 6, d: "s", n: "%Q0." + k });
    L.push({ id: "C1", x: -1, y: 6, d: "s", n: "C1" });
    for (let k = 4; k < 8; k++) L.push({ id: "Q" + k, x: 1 + 2 * (k - 4), y: 6, d: "s", n: "%Q0." + k });
    L.push({ id: "AQ0", x: 9, y: 6, d: "s", n: "AQ0" });
    return L;
  })();
  def("automate", { nom: "Automate programmable (API)", court: "Automate", cat: "api", pref: "API", boite: [-12.4, -6, 10.4, 6],
    libre: (id) => id !== "p24" && id !== "m0", bornes: () => BORNES_API });
  const BORNES_VAR = [
    { id: "L1", x: -2, y: -5, d: "n", n: "L1" }, { id: "L2", x: 0, y: -5, d: "n", n: "L2" }, { id: "L3", x: 2, y: -5, d: "n", n: "L3" }, { id: "PE", x: 4, y: -5, d: "n", n: "PE" },
    { id: "U", x: -2, y: 17, d: "s", n: "U" }, { id: "V", x: 0, y: 17, d: "s", n: "V" }, { id: "W", x: 2, y: 17, d: "s", n: "W" }, { id: "PE2", x: 4, y: 17, d: "s", n: "PE" },
    { id: "R1A", x: 8, y: -3, d: "e", n: "R1A" }, { id: "R1C", x: 8, y: -1, d: "e", n: "R1C" }, { id: "P24", x: 8, y: 1, d: "e", n: "+24V" },
    { id: "LI1", x: 8, y: 3, d: "e", n: "LI1" }, { id: "LI2", x: 8, y: 5, d: "e", n: "LI2" }, { id: "LI3", x: 8, y: 7, d: "e", n: "LI3" }, { id: "LI4", x: 8, y: 9, d: "e", n: "LI4" },
    { id: "P10", x: 8, y: 11, d: "e", n: "+10V" }, { id: "AI1", x: 8, y: 13, d: "e", n: "AI1" }, { id: "COM", x: 8, y: 15, d: "e", n: "COM" }];
  def("variateur", { nom: "Variateur de vitesse (ATV)", court: "Variateur", cat: "api", pref: "U",
    p: { hsp: 50, lsp: 0, acc: 3, dec: 3, sp2: 10, sp3: 25, sp4: 50, ref: "AI1" }, boite: [-3.4, -5, 8, 17],
    libre: (id) => !/^(L1|L2|L3|U|V|W)$/.test(id), bornes: () => BORNES_VAR });
  // potentiomètre : les trois bornes à gauche (1 en haut, 2 = curseur, 3 en bas), à poser contre +10V, AI1, COM d'un variateur
  def("potentiometre", { nom: "Potentiomètre de consigne", court: "Potentiomètre", cat: "api", pref: "R", p: { pos: 50 }, boite: [-2, -2.8, 2.4, 2.8],
    bornes: () => [{ id: "1", x: -2, y: -2, d: "o", n: "1" }, { id: "2", x: -2, y: 0, d: "o", n: "2" }, { id: "3", x: -2, y: 2, d: "o", n: "3" }] });

  const CATS = [
    { id: "alim", nom: "Alimentation" }, { id: "prot", nom: "Protection" }, { id: "cmd", nom: "Commande" },
    { id: "rel", nom: "Contacteurs et relais" }, { id: "rec", nom: "Récepteurs" }, { id: "api", nom: "Automate et variateur" }];

  /* familles utiles au moteur et à l'éditeur */
  const BOBINES = ["bobine", "relais", "tempo_travail", "tempo_repos"];
  const TEMPOS = ["tempo_travail", "tempo_repos"];
  const ORGANES = ["bp_no", "bp_nf", "arret_urgence", "selecteur", "interrupteur", "fdc_no", "fdc_nf", "capteur"];   // organe = son propre contact
  const CONTACTS_LIES = ["contact_no", "contact_nf", "contact_tno", "contact_tnf", "contact_th_nf", "contact_th_no"];
  const AVEC_NUM = ORGANES.concat(CONTACTS_LIES);
  const POTENTIELS = [
    { id: "L", nom: "L", aide: "phase L (230 V)" }, { id: "N", nom: "N", aide: "neutre" },
    { id: "L1", nom: "L1", aide: "phase 1" }, { id: "L2", nom: "L2", aide: "phase 2" }, { id: "L3", nom: "L3", aide: "phase 3" },
    { id: "+24", nom: "+24 V", aide: "+24 V continu" }, { id: "0V", nom: "0 V", aide: "0 V continu" }, { id: "PE", nom: "PE", aide: "terre" }];
  const TENSIONS = [{ id: "230~", nom: "230 V ~" }, { id: "24~", nom: "24 V ~" }, { id: "48~", nom: "48 V ~" }, { id: "400~", nom: "400 V ~" }, { id: "24=", nom: "24 V continu" }];
  const COULEURS = [{ id: "vert", nom: "vert", code: "GN" }, { id: "rouge", nom: "rouge", code: "RD" }, { id: "orange", nom: "orange", code: "OG" },
    { id: "jaune", nom: "jaune", code: "YE" }, { id: "blanc", nom: "blanc", code: "WH" }, { id: "bleu", nom: "bleu", code: "BU" }];

  function nature(pc) {   // « no » : contact à fermeture, « nf » : à ouverture (pour les symboles à deux bornes qui coupent)
    const t = pc.type;
    if (t === "selecteur") return parametres(pc).contact === "nf" ? "nf" : "no";
    if (/^(bp_nf|arret_urgence|fdc_nf|contact_nf|contact_tnf|contact_th_nf)$/.test(t)) return "nf";
    if (/^(bp_no|interrupteur|fdc_no|capteur|contact_no|contact_tno|contact_th_no)$/.test(t)) return "no";
    return null;
  }

  /* ---------- géométrie ---------- */
  const parametres = (pc) => Object.assign({}, (TYPES[pc.type] || {}).p, pc.p || {});
  function bornesLocales(pc) { const T = TYPES[pc.type]; return T ? T.bornes(parametres(pc)) : []; }
  function bornesAbs(pc) {
    const r = pc.rot | 0;
    return bornesLocales(pc).map((b) => { const [x, y] = rotP(b.x, b.y, r); return { id: b.id, x: pc.x + x, y: pc.y + y, d: rotDir(b.d, r), n: b.n }; });
  }
  function boiteLocale(pc) { const T = TYPES[pc.type]; if (!T) return [-1, -1, 1, 1]; return typeof T.boite === "function" ? T.boite(parametres(pc)) : T.boite; }
  function boiteAbs(pc) {
    const [x0, y0, x1, y1] = boiteLocale(pc), r = pc.rot | 0;
    const a = rotP(x0, y0, r), b = rotP(x1, y1, r);
    return [pc.x + Math.min(a[0], b[0]), pc.y + Math.min(a[1], b[1]), pc.x + Math.max(a[0], b[0]), pc.y + Math.max(a[1], b[1])];
  }

  /* ---------- un point sur un fil ---------- */
  function surSegment(P, A, B) {
    const [x, y] = P, [x0, y0] = A, [x1, y1] = B;
    if (x < Math.min(x0, x1) - 1e-9 || x > Math.max(x0, x1) + 1e-9 || y < Math.min(y0, y1) - 1e-9 || y > Math.max(y0, y1) + 1e-9) return false;
    return Math.abs((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0)) < 1e-9;
  }
  function surFil(P, f) { for (let i = 0; i + 1 < f.pts.length; i++) if (surSegment(P, f.pts[i], f.pts[i + 1])) return i; return -1; }
  const estSommet = (P, f) => f.pts.some((q) => q[0] === P[0] && q[1] === P[1]);

  /* ---------- la liste des liaisons ----------
     Rend : nb (nombre de nœuds), borne["idPièce:idBorne"] → nœud, fil[idFil] → nœud,
     points (points de jonction à dessiner), bouts (bouts de fils reliés à rien), libres (bornes reliées à rien). */
  function netlist(s) {
    const cle = new Map(), parent = [];
    const id = (x, y) => { const k = x + "," + y; let i = cle.get(k); if (i === undefined) { i = parent.length; parent.push(i); cle.set(k, i); } return i; };
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[b] = a; };
    const fils = (s.fils || []).filter((f) => f.pts && f.pts.length >= 2);
    for (const f of fils) { const i0 = id(f.pts[0][0], f.pts[0][1]); for (const p of f.pts) union(i0, id(p[0], p[1])); }
    const bornes = [];
    for (const pc of s.pieces || []) for (const b of bornesAbs(pc)) { bornes.push([pc, b]); id(b.x, b.y); }
    // degré de chaque point : bouts de fils, passages de fils, bornes
    const deg = new Map(), nbB = new Map();
    const plus = (m, k, v) => m.set(k, (m.get(k) || 0) + v);
    const kk = (P) => P[0] + "," + P[1];
    for (const f of fils) {
      plus(deg, kk(f.pts[0]), 1); plus(deg, kk(f.pts[f.pts.length - 1]), 1);
      for (let i = 1; i + 1 < f.pts.length; i++) plus(deg, kk(f.pts[i]), 2);
    }
    for (const [, b] of bornes) { plus(deg, b.x + "," + b.y, 1); plus(nbB, b.x + "," + b.y, 1); }
    const acc = [];
    for (const f of fils) acc.push([f.pts[0], f], [f.pts[f.pts.length - 1], f]);
    for (const [, b] of bornes) acc.push([[b.x, b.y], null]);
    const vus = new Set();
    for (const [P, propre] of acc) {
      for (const f of fils) {
        const i = surFil(P, f);
        if (i < 0) continue;
        union(id(P[0], P[1]), id(f.pts[0][0], f.pts[0][1]));
        if (f !== propre && !estSommet(P, f)) { const k = kk(P) + "|" + f.id; if (!vus.has(k)) { vus.add(k); plus(deg, kk(P), 2); } }
      }
    }
    // numéros de nœuds compacts
    const num = new Map(); let nb = 0;
    const noeud = (i) => { const r = find(i); let n = num.get(r); if (n === undefined) { n = nb++; num.set(r, n); } return n; };
    const borne = {}, fil = {};
    for (const [pc, b] of bornes) borne[pc.id + ":" + b.id] = noeud(id(b.x, b.y));
    for (const f of fils) fil[f.id] = noeud(id(f.pts[0][0], f.pts[0][1]));
    const points = [], bouts = [], libres = [];
    for (const [k, d] of deg) {
      const [x, y] = k.split(",").map(Number), b = nbB.get(k) || 0;
      if (d >= 3) points.push([x, y, noeud(cle.get(k))]);
      else if (d === 1 && b === 0) bouts.push([x, y]);
    }
    for (const [pc, b] of bornes) { const k = b.x + "," + b.y; if ((deg.get(k) || 0) <= 1) libres.push({ piece: pc.id, borne: b.id, x: b.x, y: b.y }); }
    return { nb, borne, fil, points, bouts, libres };
  }

  /* ---------- tracé automatique à angles droits ---------- */
  function nettoyer(pts) {
    const P = [];
    for (const p of pts) { const q = [Math.round(p[0]), Math.round(p[1])]; if (!P.length || P[P.length - 1][0] !== q[0] || P[P.length - 1][1] !== q[1]) P.push(q); }
    for (let i = 1; i + 1 < P.length;) {
      const a = P[i - 1], b = P[i], c = P[i + 1];
      if ((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])) P.splice(i, 1); else i++;
    }
    return P;
  }
  const dirSeg = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  function chevauche(a, b, c, d) {   // deux segments alignés qui se recouvrent sur une longueur
    if (a[0] === b[0] && c[0] === d[0] && a[0] === c[0]) { const lo = Math.max(Math.min(a[1], b[1]), Math.min(c[1], d[1])), hi = Math.min(Math.max(a[1], b[1]), Math.max(c[1], d[1])); return hi - lo > 0; }
    if (a[1] === b[1] && c[1] === d[1] && a[1] === c[1]) { const lo = Math.max(Math.min(a[0], b[0]), Math.min(c[0], d[0])), hi = Math.min(Math.max(a[0], b[0]), Math.max(c[0], d[0])); return hi - lo > 0; }
    return false;
  }
  function traverseBoite(a, b, bx) {   // le segment entre-t-il dans la boîte (bords exclus) ?
    const [x0, y0, x1, y1] = bx, e = 0.25;
    if (a[0] === b[0]) { const x = a[0]; if (x <= x0 + e || x >= x1 - e) return false; const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]); return hi > y0 + e && lo < y1 - e; }
    if (a[1] === b[1]) { const y = a[1]; if (y <= y0 + e || y >= y1 - e) return false; const lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]); return hi > x0 + e && lo < x1 - e; }
    return false;
  }
  /* a, b : points [x, y] ; da, db : direction de sortie de chaque borne (n, s, e, o ou null) ;
     s : le schéma (pour éviter les symboles, les autres bornes et les fils) ; ignorer : ids de fils à ne pas regarder */
  function router(a, da, b, db, s, ignorer) {
    const ea = DIRS[da] || [0, 0], eb = DIRS[db] || [0, 0];
    const cands = [], ajout = (mid) => cands.push(nettoyer([a].concat(mid, [b])));
    const interieurs = (A, B) => {
      const my = Math.round((A[1] + B[1]) / 2), mx = Math.round((A[0] + B[0]) / 2);
      return [[], [[A[0], B[1]]], [[B[0], A[1]]], [[A[0], my], [B[0], my]], [[mx, A[1]], [mx, B[1]]]];
    };
    for (const m of interieurs(a, b)) ajout(m);
    for (let k = 1; k <= 3; k++) {
      const A = [a[0] + ea[0] * k, a[1] + ea[1] * k], B = [b[0] + eb[0] * k, b[1] + eb[1] * k];
      for (const m of interieurs(A, B)) ajout([A].concat(m, [B]));
      for (const m of interieurs(A, b)) ajout([A].concat(m));
      for (const m of interieurs(a, B)) ajout(m.concat([B]));
    }
    for (let off = 1; off <= 4; off++) {
      if (ea[1] || eb[1]) { const y = (ea[1] > 0 || eb[1] > 0) ? Math.max(a[1], b[1]) + off : Math.min(a[1], b[1]) - off; ajout([[a[0], y], [b[0], y]]); }
      if (ea[0] || eb[0]) { const x = (ea[0] > 0 || eb[0] > 0) ? Math.max(a[0], b[0]) + off : Math.min(a[0], b[0]) - off; ajout([[x, a[1]], [x, b[1]]]); }
    }
    // ce qu'il faut éviter
    const boites = [], dangers = [], segs = [];
    if (s) {
      for (const pc of s.pieces || []) {
        boites.push(boiteAbs(pc));
        for (const t of bornesAbs(pc)) if (!(t.x === a[0] && t.y === a[1]) && !(t.x === b[0] && t.y === b[1])) dangers.push([t.x, t.y]);
      }
      for (const f of s.fils || []) {
        if (ignorer && ignorer.has && ignorer.has(f.id)) continue;
        for (let i = 0; i + 1 < f.pts.length; i++) segs.push([f.pts[i], f.pts[i + 1]]);
        for (const q of [f.pts[0], f.pts[f.pts.length - 1]]) if (!(q[0] === a[0] && q[1] === a[1]) && !(q[0] === b[0] && q[1] === b[1])) dangers.push(q);
      }
    }
    let meilleur = null, score = Infinity;
    for (const P of cands) {
      if (P.length < 2 && !(a[0] === b[0] && a[1] === b[1])) continue;
      let ok = true, long = 0, pen = 0;
      for (let i = 0; i + 1 < P.length; i++) { if (P[i][0] !== P[i + 1][0] && P[i][1] !== P[i + 1][1]) { ok = false; break; } long += Math.abs(P[i + 1][0] - P[i][0]) + Math.abs(P[i + 1][1] - P[i][1]); }
      if (!ok) continue;
      if (P.length >= 2) {
        const d0 = dirSeg(P[0], P[1]); if (ea[0] || ea[1]) { if (d0[0] === -ea[0] && d0[1] === -ea[1]) pen += 120; else if (d0[0] !== ea[0] || d0[1] !== ea[1]) pen += 6; }
        const d1 = dirSeg(P[P.length - 2], P[P.length - 1]); if (eb[0] || eb[1]) { if (d1[0] === eb[0] && d1[1] === eb[1]) pen += 120; else if (d1[0] !== -eb[0] || d1[1] !== -eb[1]) pen += 6; }
      }
      for (let i = 0; i + 1 < P.length; i++) {
        const A = P[i], B = P[i + 1];
        for (const bx of boites) if (traverseBoite(A, B, bx)) pen += 60;
        for (const q of dangers) if (surSegment(q, A, B)) pen += 1000;
        for (const [c, d] of segs) if (chevauche(A, B, c, d)) pen += 400;
      }
      for (let i = 1; i + 1 < P.length; i++) for (const [c, d] of segs) if (surSegment(P[i], c, d)) pen += 600;
      const sc = long + 3 * (P.length - 2) + pen;
      if (sc < score - 1e-9) { score = sc; meilleur = P; }
    }
    return meilleur || nettoyer([a, [a[0], b[1]], b]);
  }

  /* ---------- repères et numéros automatiques ---------- */
  function refsUtilises(s, pref) {
    const re = new RegExp("^" + pref + "(\\d+)$"), L = new Set();
    for (const pc of s.pieces || []) { const T = TYPES[pc.type]; if (!T || T.lien) continue; const m = re.exec(pc.ref || ""); if (m) L.add(+m[1]); }
    return L;
  }
  function prochainRef(s, pref) { if (!pref) return ""; const L = refsUtilises(s, pref); let i = 1; while (L.has(i)) i++; return pref + i; }

  /* numéro d'un contact : chiffre des unités = fonction (1-2 ouverture, 3-4 fermeture, 5-6 et 7-8 temporisés),
     chiffre des dizaines = rang du contact sur l'appareil (1, 2, 3…) */
  function numeroContact(s, pc) {
    const t = pc.type;
    if (t === "contact_th_nf") return "95-96";
    if (t === "contact_th_no") return "97-98";
    const nat = nature(pc); if (!nat) return null;
    const tempo = t === "contact_tno" || t === "contact_tnf";
    const pris = new Set();
    for (const q of s.pieces || []) {
      if (q === pc || q.id === pc.id || q.ref !== pc.ref || AVEC_NUM.indexOf(q.type) < 0) continue;
      const n = paire(parametres(q).num, "", "")[0]; if (n.length >= 2) pris.add(n.slice(0, -1));
    }
    const f = tempo ? (nat === "no" ? ["7", "8"] : ["5", "6"]) : (nat === "no" ? ["3", "4"] : ["1", "2"]);
    let d = tempo ? (nat === "no" ? 6 : 5) : ORGANES.indexOf(t) >= 0 ? 1 : (nat === "no" ? 1 : 2);
    if (pris.has(String(d))) { d = 1; while (pris.has(String(d)) && d < 9) d++; }
    return d + f[0] + "-" + d + f[1];
  }

  /* les appareils auxquels un symbole « lié » peut appartenir */
  function appareilsPour(s, type) {
    const L = [], vu = new Set(), add = (r) => { if (r && !vu.has(r)) { vu.add(r); L.push(r); } };
    const T = (pc) => pc.type;
    for (const pc of s.pieces || []) {
      if (type === "poles" && T(pc) === "bobine") add(pc.ref);
      else if ((type === "contact_tno" || type === "contact_tnf") && TEMPOS.indexOf(T(pc)) >= 0) add(pc.ref);
      else if ((type === "contact_th_nf" || type === "contact_th_no") && (T(pc) === "thermique" || T(pc) === "disj_moteur")) add(pc.ref);
      else if ((type === "contact_no" || type === "contact_nf") && (BOBINES.indexOf(T(pc)) >= 0 || /^(sectionneur|disjoncteur|disj_moteur)$/.test(T(pc)))) add(pc.ref);
    }
    return L;
  }

  /* ---------- schéma : création, copie, lecture sûre d'un fichier ---------- */
  const FORMAT = "schemas-papara";
  function nouveau(titre) { return { format: FORMAT, version: 1, titre: titre || "Mon schéma", pieces: [], fils: [] }; }
  const cloner = (s) => JSON.parse(JSON.stringify(s));
  function nouvelId(s, prefixe) {
    let n = 0; const re = new RegExp("^" + prefixe + "(\\d+)$");
    for (const o of (prefixe === "f" ? s.fils : s.pieces) || []) { const m = re.exec(o.id || ""); if (m) n = Math.max(n, +m[1]); }
    return prefixe + (n + 1);
  }
  const entier = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : d; };
  // le programme d'un automate est vérifié par automate.js (chargé avant l'éditeur, ou par require dans Node)
  function automateJs() { if (typeof module === "object" && module.exports) { try { return require("./automate.js"); } catch (e) { return null; } } return g.SchemasAutomate || null; }
  const libreOk = (pc, id) => { const T = TYPES[pc.type]; return !!(T && T.libre && T.libre(id)); };
  const texte = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").slice(0, max);
  function valider(o) {
    if (!o || typeof o !== "object") throw new Error("Ce fichier ne contient pas de schéma.");
    if (o.format && o.format !== FORMAT) throw new Error("Ce fichier n'est pas un schéma de l'atelier.");
    if (!Array.isArray(o.pieces) || !Array.isArray(o.fils)) throw new Error("Ce fichier ne contient pas de schéma (pièces et fils manquants).");
    const s = nouveau(texte(o.titre || "Schéma importé", 80)), ids = new Set();
    for (const q of o.pieces.slice(0, 600)) {
      if (!q || !TYPES[q.type]) continue;
      const T = TYPES[q.type], p = {};
      for (const k of Object.keys(T.p)) if (q.p && q.p[k] != null) p[k] = typeof T.p[k] === "number" ? Math.max(0, Math.min(1e5, Number(q.p[k]) || T.p[k])) : texte(q.p[k], 16);
      let id = texte(q.id, 20) || "p"; if (!/^p\d+$/.test(id) || ids.has(id)) id = "p" + (ids.size + 1000 + Math.floor(Math.random() * 1e6));
      ids.add(id);
      const pc = { id, type: q.type, x: entier(q.x, -2000, 2000, 0), y: entier(q.y, -2000, 2000, 0), rot: entier(q.rot, 0, 3, 0), ref: texte(q.ref, 12), p };
      if (q.type === "automate") { const SA = automateJs(); pc.prog = SA ? SA.validerProg(q.prog) : (q.prog && typeof q.prog === "object" ? JSON.parse(JSON.stringify(q.prog)) : undefined); }
      s.pieces.push(pc);
    }
    const fids = new Set();
    for (const f of o.fils.slice(0, 2000)) {
      if (!f || !Array.isArray(f.pts)) continue;
      const pts = nettoyer(f.pts.slice(0, 200).filter((q) => Array.isArray(q) && q.length >= 2).map((q) => [entier(q[0], -2000, 2000, 0), entier(q[1], -2000, 2000, 0)]));
      if (pts.length < 2) continue;
      let id = texte(f.id, 20); if (!/^f\d+$/.test(id) || fids.has(id)) id = "f" + (fids.size + 1000 + Math.floor(Math.random() * 1e6));
      fids.add(id);
      s.fils.push({ id, pts });
    }
    return s;
  }
  function bornesDe(s) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const pc of s.pieces) { const b = boiteAbs(pc); x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); }
    for (const f of s.fils) for (const q of f.pts) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
    return Number.isFinite(x0) ? [x0, y0, x1, y1] : [0, 0, 40, 30];
  }

  const API = { G, TYPES, CATS, BOBINES, TEMPOS, ORGANES, CONTACTS_LIES, AVEC_NUM, POTENTIELS, TENSIONS, COULEURS, DIRS,
    rotP, rotDir, paire, parametres, nature, bornesLocales, bornesAbs, boiteLocale, boiteAbs, surSegment, surFil,
    netlist, nettoyer, router, prochainRef, numeroContact, appareilsPour, nouveau, cloner, nouvelId, valider, bornesDe, libreOk, FORMAT };
  if (typeof module === "object" && module.exports) module.exports = API; else g.SchemasModele = API;
})(typeof window !== "undefined" ? window : globalThis);
