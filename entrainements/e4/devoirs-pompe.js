/* =====================================================================
   BTS Électrotechnique · E4 (U4) — DEVOIRS NOTÉS
   ÉTUDE « STATION DE POMPAGE » (page #/devoirs/pompe)
   Cadre, notation et outils : e4/devoirs.js (E4.DEVOIRS_KIT) et e4/series.js.

   Une pompe centrifuge P1, entraînée par un moteur asynchrone M1, remplit
   un réservoir en hauteur à partir d'une bâche. Chaque élève a SES valeurs
   (graine : devoir, classe, nom, numéro du départ ; e4/series.js) : le site
   et le liquide (eau douce ou eau de mer), le volume journalier et la durée
   de pompage, la conduite (matériau, diamètre, longueurs, singularités), les
   cotes, la pompe, le moteur, le tarif. Plusieurs questions ont deux ou
   trois versions, tirées elles aussi pour chaque élève (v.vXxx).
   Niveaux (le suivant s'ouvre quand le précédent est rendu) :
   - n° 1 « pas à pas » : chaque étape est une question, le document utile
     est joint : débit, vitesse, hauteur géométrique, λ, pertes de charge,
     HMT, puissances, choix du moteur, grandeurs électriques, énergie, coût ;
   - n° 2 « par étapes » : la question indique les documents ; niveaux haut
     et bas de la bâche, λ et ξ dans le DRES, choix entre deux pompes
     (tableau H et η), réserve de puissance, mode de démarrage ;
   - n° 3 « comme à l'épreuve » : arrivée en partie haute ou noyée, point de
     fonctionnement et rendement lus sur les courbes, moteur, démarrage, coût ;
   - n° 4 « au-delà » : point de fonctionnement calculé (H = H0 − a·Q²),
     débit réduit la nuit par vanne ou par variateur (similitude), économie,
     temps de retour, couple à vitesse réduite.
   À partir du niveau 2, le dossier complet est dans les onglets (q.classeur).
   Données : relations usuelles de la mécanique des fluides (pertes de
   charge linéaires et singulières) ; moteurs de classe IE3 (rendements
   minimaux de la norme CEI 60034-30-1) ; le reste est inventé.
   Règles du professeur : les données se lisent sur une figure ou dans un
   document, jamais dans une liste de l'énoncé ; fractions écrites en
   entier ; une question liée rappelle le résultat attendu de la précédente.
   ===================================================================== */
window.E4 = window.E4 || {};
(function (E4) {
"use strict";
const K = E4.MORC_KIT, KD = E4.DEVOIRS_KIT;
if (!K || !KD) return;
const { rnd, ri, nf, nd, n3, F, FRAC, R, R3, tab, doc, T, Ln, Pl, Pg, Rc, Ci, SYM, bloc, plaques, courbe, encadre, empiler, seul, tableauML, r1, r2, e2 } = K;
const { DV, loin, fenetre, dres, dtec, h4, ul } = KD;
const G = 9.81;
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const zz = (z) => (z < 0 ? `(${nf(z, 1)})` : nf(z, 1));   // cote négative entre parenthèses dans un calcul

/* ---------- données ---------- */
const SITES_P = [
  { site: "la station de pompage d'eau potable d'une commune", bas: "Bâche de reprise", haut: "Réservoir du plateau", fl: "eau douce", rho: 1000,
    but: "remplir le réservoir du plateau, qui alimente les quartiers hauts", hg: [32, 70] },
  { site: "une exploitation agricole", bas: "Bassin de stockage", haut: "Bassin d'irrigation", fl: "eau douce", rho: 1000,
    but: "remonter l'eau du bassin de stockage vers le bassin d'irrigation des parcelles", hg: [14, 40] },
  { site: "une ferme aquacole", bas: "Puits d'eau de mer", haut: "Bassin de tête", fl: "eau de mer", rho: 1025,
    but: "remplir le bassin de tête, qui alimente en eau de mer les bassins d'élevage", hg: [12, 28] },
  { site: "une usine de conditionnement", bas: "Bâche d'eau brute", haut: "Château d'eau de l'usine", fl: "eau douce", rho: 1000,
    but: "remplir le château d'eau qui alimente les ateliers", hg: [24, 50] },
  { site: "un complexe hôtelier", bas: "Bâche de stockage", haut: "Réservoir de la colline", fl: "eau douce", rho: 1000,
    but: "remplir le réservoir de la colline, qui alimente les bungalows", hg: [28, 60] }
];
/* conduites : matériau → [désignation, Ø intérieur (mm)] ; λ selon le matériau et le Ø intérieur (DRES) */
const TUY = {
  "fonte ductile": [["DN 100", 104], ["DN 125", 129], ["DN 150", 155], ["DN 200", 206], ["DN 250", 256]],
  "acier": [["DN 100", 107], ["DN 125", 132], ["DN 150", 159], ["DN 200", 207], ["DN 250", 260]],
  "PEHD": [["DE 110", 97], ["DE 140", 123], ["DE 160", 141], ["DE 200", 176], ["DE 250", 220]]
};
const MAT_LIB = { "fonte ductile": "Fonte ductile (revêtement ciment)", "acier": "Acier", "PEHD": "PEHD (polyéthylène haute densité)" };
const COL_B = [[0, 115], [116, 140], [141, 175], [176, 225], [226, 275]];
const COL_LIB = ["jusqu'à 115 mm", "116 à 140 mm", "141 à 175 mm", "176 à 225 mm", "226 à 275 mm"];
const LAM = { "fonte ductile": [0.021, 0.020, 0.019, 0.018, 0.017], "acier": [0.022, 0.021, 0.020, 0.019, 0.018], "PEHD": [0.018, 0.017, 0.016, 0.015, 0.015] };
const colL = (d) => COL_B.findIndex(([a, b]) => d >= a && d <= b);
/* singularités du circuit (clé, nom, ξ) ; le DRES en liste d'autres, qui ne sont pas sur le circuit */
const XI = [["e", "Entrée de conduite (sortie de la bâche)", 0.5], ["c90", "Coude à 90°", 0.4], ["c45", "Coude à 45°", 0.2], ["van", "Vanne d'isolement ouverte", 0.2],
  ["cl", "Clapet anti-retour", 2], ["s", "Sortie de conduite dans un réservoir", 1]];
const XI_DOC = [["Entrée de conduite (sortie de la bâche)", 0.5], ["Coude à 90°", 0.4], ["Coude à 45°", 0.2], ["Té, passage en dérivation", 1.3], ["Vanne d'isolement ouverte", 0.2],
  ["Clapet anti-retour", 2], ["Crépine avec clapet de pied", 3], ["Filtre à tamis", 2.5], ["Sortie de conduite dans un réservoir", 1]];
/* catalogue : moteurs asynchrones triphasés, 2 pôles, IE3, 400 V 50 Hz : [P (kW), n (tr/min), η (%), cos φ, Id/In] ; In calculé, affiché au dixième */
const CATA = [[1.5, 2880, 84.2, 0.83, 7], [2.2, 2885, 85.9, 0.84, 7.3], [3, 2890, 87.1, 0.85, 7.6], [4, 2900, 88.1, 0.86, 7.6], [5.5, 2915, 89.2, 0.87, 7.8],
  [7.5, 2920, 90.1, 0.87, 7.8], [11, 2935, 91.2, 0.88, 7.9], [15, 2940, 91.9, 0.88, 8], [18.5, 2945, 92.4, 0.88, 8], [22, 2950, 92.7, 0.89, 8.1],
  [30, 2955, 93.3, 0.89, 7.5], [37, 2960, 93.7, 0.89, 7.5], [45, 2965, 94, 0.9, 7.6], [55, 2970, 94.3, 0.9, 7.6], [75, 2975, 94.7, 0.9, 7.4], [90, 2978, 95, 0.9, 7.4]]
  .map(([P, n, eta, cos, kd]) => ({ P, n, eta, cos, kd, In: r1(P * 1000 / (R3 * 400 * eta / 100 * cos)), tens: P <= 3 ? "230 V Δ / 400 V Y" : "400 V Δ / 690 V Y" }));
const PMOT = CATA.map((m) => m.P);
const TPOMP = [8, 10, 12, 14, 16, 18, 20];
const PRIX = [0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.21];

/* ---------- tirage commun : besoin, conduite, cotes, hauteur manométrique ---------- */
function base(niv) {
  const st = rnd(SITES_P), t = rnd(niv === 4 ? [8, 10, 12, 14, 16] : TPOMP), Q = ri(18, 125), V = Q * t;   // débit entier (m³/h), volume journalier en m³ ; niveau 4 : la nuit (8 h) reste à débit réduit
  if (V < 200 || V > 2400) return null;
  const mat = rnd(Object.keys(TUY)), Qs = Q / 3600;
  const cands = TUY[mat].filter(([, d]) => { const w = Qs / (Math.PI * (d / 1000) ** 2 / 4); return w >= 0.8 && w <= 2.1; });
  if (!cands.length) return null;
  const [dn, d] = rnd(cands), Dm = d / 1000, S = Math.PI * Dm * Dm / 4, vit = Qs / S, hv = vit * vit / (2 * G), iL = colL(d), lam = LAM[mat][iL];
  const La = ri(4, 12), Lr = 10 * ri(12, 90), L = La + Lr;
  const sing = { e: 1, c90: ri(2, 7), c45: rnd([0, 0, 1, 2, 3, 4]), van: niv === 1 ? 2 : rnd([2, 2, 3]), cl: 1, s: 1 };
  const sx = r2(XI.reduce((a, [k, , x]) => a + sing[k] * x, 0));
  const dHL = lam * L / Dm * hv, dHS = sx * hv, dH = dHL + dHS;
  const o = { niv, st, rho: st.rho, t, Q, V, Qs, mat, dn, d, Dm, S, vit, hv, iL, lam, La, Lr, L, sing, sx, dHL, dHS, dH };
  /* cotes (m) : bâche (niveau bas = surface au niveau 1), réservoir ; sortie à l'air libre en partie haute, ou arrivée noyée en pied (niveaux 3 et 4) */
  const zb = ri(-20, 60) / 10, Hg = ri(st.hg[0] * 10, st.hg[1] * 10) / 10;
  o.zbb = zb; o.zbh = r1(zb + ri(12, 35) / 10);
  o.deb = niv <= 2 || Math.random() < 0.5;
  if (o.deb) { o.zarr = r1(zb + Hg); o.zrh = r1(o.zarr - ri(4, 14) / 10); o.zrb = r1(o.zrh - ri(20, 50) / 10); o.Hg = r1(o.zarr - zb); }
  else { o.zrh = r1(zb + Hg); o.zrb = r1(o.zrh - ri(20, 50) / 10); o.zarr = r1(o.zrb - ri(4, 10) / 10); o.Hg = r1(o.zrh - zb); }
  o.HMT = o.Hg + dH; o.Ph = o.rho * G * Qs * o.HMT;   // W
  if (dH / o.HMT < 0.06 || dH / o.HMT > 0.4 || o.HMT < 14 || o.HMT > 95 || o.Ph < 1500 || o.Ph > 42000) return null;
  o.J = rnd([300, 330, 365]); o.c = rnd(PRIX);
  return o;
}
/* moteur, grandeurs électriques et énergie, pour une puissance P2 (kW) demandée par la pompe */
function electrique(o, P2, Pmin) {
  o.P2 = P2; o.iM = CATA.findIndex((m) => m.P >= Pmin - 1e-9);
  if (o.iM < 1 || o.iM > CATA.length - 2) return false;
  o.m = CATA[o.iM]; o.P1 = P2 / (o.m.eta / 100); o.I = o.P1 * 1000 / (R3 * 400 * o.m.cos);
  o.S1 = o.P1 / o.m.cos; o.tan = Math.tan(Math.acos(o.m.cos)); o.Q1 = o.P1 * o.tan;
  return true;
}

/* ---------- niveau 1 : la pompe est donnée par son rendement au point prévu ---------- */
function situation1() {
  for (let tour = 0; tour < 4000; tour++) {
    const o = base(1);
    if (!o) continue;
    o.etaP = ri(64, 80) / 100;
    const P2 = o.Ph / 1000 / o.etaP;
    if (!loin(P2, PMOT, 0.025) || !electrique(o, P2, P2)) continue;
    o.Ej = o.P1 * o.t; o.Ea = o.Ej * o.J; o.cout = o.Ea * o.c;
    o.H0 = Math.round(o.HMT * (1.22 + Math.random() * 0.2)); o.Qmax = 5 * Math.round(o.Q * (1.5 + Math.random() * 0.3) / 5);
    /* questions à plusieurs versions */
    o.vDebit = rnd(["m3s", "ls"]); o.vDyn = rnd(["sx", "hv"]); o.vElec = rnd(["I", "S", "Q"]); o.vAn = rnd(["cout", "mwh"]); o.vM3 = rnd(["kwh", "eur"]);
    o.avM = ri(0, 3);   // place de la bonne puissance dans la liste des moteurs proposés
    return o;
  }
  throw new Error("tirage impossible (station de pompage, niveau 1)");
}

/* ---------- pompes : H(Q) = H0 − a·Q² ; η(Q) = ηmax × x × (2 − x), x = Q / Qb (Q en m³/h) ---------- */
const Hp = (p, q) => p.H0 - p.a * q * q;
const etaP = (p, q) => { const x = q / p.Qb; return p.em * x * (2 - x); };
/* graduations d'un axe : maximum arrondi au pas, entre nmin et nmax divisions */
function axe(max, nmin, nmax) {
  for (const pas of [1, 2, 5, 10, 20, 25, 50, 100]) { const n = Math.ceil(max / pas - 1e-9); if (n >= nmin && n <= nmax) return { max: n * pas, pas }; }
  return { max: 10 * Math.ceil(max / 10), pas: 10 };
}
/* démarrage : le mode le plus simple qui respecte la limite de courant (DRES « modes de démarrage ») */
const MODES = ["Démarrage direct", "Démarrage étoile-triangle", "Démarreur progressif", "Variateur de vitesse"];
const demDe = (m, lim) => { const Id = m.kd * m.In; return Id <= lim ? 0 : m.P >= 4 && Id / 3 <= lim ? 1 : 3 * m.In <= lim ? 2 : 1.5 * m.In <= lim ? 3 : -1; };
function tirerDem(m) {
  const Id = m.kd * m.In, yd = m.P >= 4;
  for (let e = 0; e < 40; e++) {
    const k = rnd(yd ? [0, 0, 1, 1, 3] : [0, 0, 2, 2, 3]);
    const [a, b] = k === 0 ? [1.12 * Id, 1.6 * Id] : k === 1 ? [1.12 * Id / 3, 0.88 * Id] : k === 2 ? [3.3 * m.In, 0.88 * Id] : [1.75 * m.In, 0.88 * (yd ? Id / 3 : 3 * m.In)];
    if (b <= a) continue;
    const pas = b > 100 ? 5 : 1, lim = pas * Math.round((a + Math.random() * (b - a)) / pas);
    if (demDe(m, lim) === k && loin(lim, [Id, Id / 3, 3 * m.In, 1.5 * m.In], 0.05)) return { k, lim };
  }
  return null;
}

/* ---------- niveau 2 : deux pompes proposées (tableau H et η selon Q), réserve de puissance, démarrage ---------- */
function situation2() {
  for (let tour = 0; tour < 4000; tour++) {
    const o = base(2);
    if (!o) continue;
    o.res = rnd([10, 15]);
    const dq = o.Q <= 30 ? 5 : o.Q <= 60 ? 10 : 15;
    o.qcols = [-2, -1, 0, 1, 2].map((k) => o.Q + k * dq);
    if (o.qcols[0] < 5) continue;
    o.deux = Math.random() < 0.35;   // les deux pompes conviennent : on retient la meilleure (rendement)
    const mk = (w) => { const p = { H0: o.HMT * (1.18 + Math.random() * 0.3), em: ri(68, 82) / 100, Qb: o.Q * (0.95 + Math.random() * 0.35) }; p.a = (p.H0 - w * o.HMT) / (o.Q * o.Q); return p; };
    const P = [mk(1.03 + Math.random() * 0.09), mk(o.deux ? 1.03 + Math.random() * 0.12 : 0.86 + Math.random() * 0.09)];
    P.forEach((p) => { p.H = o.qcols.map((q) => r1(Hp(p, q))); p.E = o.qcols.map((q) => Math.round(100 * etaP(p, q))); });
    if (P.some((p) => p.a <= 0 || p.H.some((h) => h <= 0) || p.E.some((e) => e < 30))) continue;
    if (P[0].H[2] < 1.025 * o.HMT) continue;
    if (o.deux ? P[1].H[2] < 1.025 * o.HMT || Math.abs(P[0].E[2] - P[1].E[2]) < 3 : P[1].H[2] > 0.965 * o.HMT) continue;
    const bon = o.deux && P[1].E[2] > P[0].E[2] ? P[1] : P[0];
    o.pompes = Math.random() < 0.5 ? P : [P[1], P[0]];   // pompes A et B
    o.iP = o.pompes.indexOf(bon); o.etaP = bon.E[2] / 100;
    const P2 = o.Ph / 1000 / o.etaP, Pmin = P2 * (1 + o.res / 100);
    if (!loin(Pmin, PMOT, 0.025) || !electrique(o, P2, Pmin)) continue;
    o.Pmin = Pmin;
    const dm = tirerDem(o.m);
    if (!dm) continue;
    o.dem = dm.k; o.lim = dm.lim;
    o.Ea = o.P1 * o.t * o.J; o.cout = o.Ea * o.c;
    o.vDebit = rnd(["m3s", "ls"]); o.vElec = rnd(["I", "S"]); o.vAn = rnd(["kwh", "mwh"]); o.vM3 = rnd(["kwh", "eur"]); o.avM = ri(0, 3);
    return o;
  }
  throw new Error("tirage impossible (station de pompage, niveau 2)");
}

/* ---------- niveaux 3 et 4 : courbe de la pompe, courbe du réseau, point de fonctionnement ---------- */
function pompeCourbe(o, niv) {
  const p = { H0: o.HMT * (1.2 + Math.random() * 0.25), em: ri(70, 83) / 100 };
  if (niv === 4) p.H0 = r1(p.H0);
  p.a = (p.H0 - o.HMT * (1.04 + Math.random() * 0.1)) / (o.Q * o.Q);
  if (niv === 4) p.a = Number(p.a.toPrecision(3));
  if (p.a <= 0) return false;
  o.k = o.dH / (o.Q * o.Q);
  o.Qf = Math.sqrt((p.H0 - o.Hg) / (p.a + o.k)); o.Hf = o.Hg + o.k * o.Qf * o.Qf;
  if (o.Qf / o.Q < 1.04 || o.Qf / o.Q > 1.28) return false;
  p.Qb = o.Qf * (0.92 + Math.random() * 0.26); o.p = p;
  o.gx = axe(o.Qf * 1.45, 6, 11); o.gy = axe(p.H0 * 1.06, 5, 10);
  o.Qfr = Math.round(o.Qf); o.Hfr = Math.round(o.Hf * 2) / 2;   // valeurs rappelées (« on prendra »)
  o.etaF = etaP(p, o.Qfr);
  return o.etaF >= 0.55;
}
function situation3() {
  for (let tour = 0; tour < 4000; tour++) {
    const o = base(3);
    if (!o || !pompeCourbe(o, 3)) continue;
    o.res = rnd([0, 10, 15]);
    o.etaR = Math.round(o.etaF * 100); o.tf = o.V / o.Qfr;
    o.Phf = o.rho * G * o.Qfr / 3600 * o.Hfr;   // W
    const P2 = o.Phf / 1000 / (o.etaR / 100), Pmin = P2 * (1 + o.res / 100);
    if (!loin(Pmin, PMOT, 0.025) || !electrique(o, P2, Pmin)) continue;
    o.Pmin = Pmin;
    const dm = tirerDem(o.m);
    if (!dm) continue;
    o.dem = dm.k; o.lim = dm.lim;
    o.Ea = o.P1 * o.tf * o.J; o.cout = o.Ea * o.c;
    o.vT = rnd(["duree", "gain"]); o.vElec = rnd(["I", "S"]); o.vAn = rnd(["cout", "mwh"]); o.avM = ri(0, 3);
    return o;
  }
  throw new Error("tirage impossible (station de pompage, niveau 3)");
}
function situation4() {
  for (let tour = 0; tour < 4000; tour++) {
    const o = base(4);
    if (!o || !pompeCourbe(o, 4)) continue;
    const p = o.p, ph = (q, h) => o.rho * G * q / 3600 * h / 1000;   // puissance hydraulique (kW), q en m³/h
    o.P2f = ph(o.Qfr, o.Hfr) / o.etaF;
    const iM = CATA.findIndex((m) => m.P >= 1.1 * o.P2f);
    if (iM < 1 || iM > CATA.length - 2) continue;
    o.m = CATA[iM]; o.P1f = o.P2f / (o.m.eta / 100);
    /* la nuit : débit réduit, par la vanne (point sur la courbe de la pompe) ou par le variateur (point sur la courbe du réseau) */
    o.Qn = Math.round(o.Qfr * (0.5 + Math.random() * 0.22));
    o.Hv = Hp(p, o.Qn); o.Hn = o.Hg + o.k * o.Qn * o.Qn;
    o.r = Math.sqrt((o.Hn + p.a * o.Qn * o.Qn) / p.H0); o.fn = 50 * o.r;
    o.etaV = Math.round(100 * etaP(p, o.Qn)) / 100; o.etaVar = Math.round(100 * etaP(p, o.Qn / o.r)) / 100;
    if (o.etaV < 0.4 || o.etaVar < o.etaV + 0.02) continue;
    o.P1v = ph(o.Qn, o.Hv) / (o.etaV * o.m.eta / 100);
    o.P1var = ph(o.Qn, o.Hn) / (o.etaVar * o.m.eta / 100 * 0.97);
    o.hN = 8 * o.J; o.dE = (o.P1v - o.P1var) * o.hN; o.gain = o.dE * o.c;
    o.prix = 50 * Math.round((900 + 160 * o.m.P) / 50); o.tr = o.prix / o.gain;
    if (o.gain < 80 || o.tr < 0.5 || o.tr > 12) continue;
    const accepte = Math.random() < 0.5, crits = [1, 2, 3, 4, 5].filter((c) => (accepte ? c >= o.tr + 0.4 : c <= o.tr - 0.4));   // critère : investissement accepté ou refusé, une fois sur deux
    if (!crits.length) continue;
    o.crit = accepte ? crits[0] : crits[crits.length - 1];
    o.P2n = ph(o.Qn, o.Hn) / o.etaVar; o.Nn = o.r * o.m.n; o.Cn = o.P2n * 1000 / (2 * Math.PI * o.Nn / 60);
    o.vGain = rnd(["eur", "kwh"]); o.vMeca = rnd(["couple", "p2"]);
    return o;
  }
  throw new Error("tirage impossible (station de pompage, niveau 4)");
}

/* ---------- éléments de dessin ---------- */
const vanneH = (x, y, clapet) => Pg([[x - 8, y - 6], [x - 8, y + 6], [x, y]], "v-box") + Pg([[x + 8, y - 6], [x + 8, y + 6], [x, y]], clapet ? "v-pt" : "v-box");
const vanneV = (x, y) => Pg([[x - 6, y - 8], [x + 6, y - 8], [x, y]], "v-box") + Pg([[x - 6, y + 8], [x + 6, y + 8], [x, y]], "v-box");
const flD = (x, y) => Pg([[x - 5, y - 4], [x + 4, y], [x - 5, y + 4]], "v-pt");
const flH = (x, y) => Pg([[x - 4, y + 5], [x, y - 4], [x + 4, y + 5]], "v-pt");
const surf = (x, y) => Pg([[x - 6, y - 9], [x + 6, y - 9], [x, y - 1]], "v-box");

/* DTEC 1 : la station (schéma de principe, cotes z en m) et le tableau des singularités */
function figStation(v) {
  const n = v.niv, st = v.st, xp = 168, yc = 252, xR = 240, xG = 272, yEau = 84, alt = ["DTEC 1. Station de pompage, schéma de principe ; cotes z en mètres."];
  let s = T(6, 16, "DTEC 1 · Station de pompage : schéma de principe (cotes z en m)", "v-cap");
  /* sol, colline, réservoir */
  s += Rc(0, 270, 400, 8, "v-sol", 0) + Pg([[232, 278], [268, 128], [400, 128], [400, 278]], "v-sol");
  s += Rc(xG, yEau, 394 - xG, 124 - yEau, "v-eau", 0) + Pl([[xG, 46], [xG, 124], [394, 124], [394, 46]], "v-ink") + surf(xG + 100, yEau) + T(394, 30, st.haut, "v-smb", "end");
  if (n >= 3) {
    s += Ln(xG, 70, 394, 70, "v-dash") + T(xG + 5, 66, `haut : z = ${nf(v.zrh, 1)}`, "v-cap") + Ln(xG, 104, 394, 104, "v-dash") + T(xG + 5, 100, `bas : z = ${nf(v.zrb, 1)}`, "v-cap");
  }
  /* bâche */
  const yB = n === 1 ? 200 : 202;
  s += Rc(8, yB, 106, 270 - yB, "v-eau", 0) + Pl([[8, 176], [8, 270], [114, 270], [114, 176]], "v-ink") + T(8, 170, st.bas, "v-smb");
  if (n === 1) { s += surf(20, yB) + T(12, yB + 17, `surface : z = ${nf(v.zbb, 1)}`, "v-cap"); alt.push(`${st.bas} (en bas à gauche) : surface de l'eau à z = ${nf(v.zbb, 1)} m.`); }
  else {
    s += surf(100, yB) + Ln(8, 190, 114, 190, "v-dash") + T(12, 186, `haut : z = ${nf(v.zbh, 1)}`, "v-cap") + Ln(8, 216, 114, 216, "v-dash") + T(12, 212, `bas : z = ${nf(v.zbb, 1)}`, "v-cap");
    alt.push(`${st.bas} (en bas à gauche) : niveau haut à z = ${nf(v.zbh, 1)} m, niveau bas à z = ${nf(v.zbb, 1)} m.`);
  }
  /* groupe motopompe, aspiration, refoulement */
  s += SYM.mot(xp, 180) + Ln(xp, 212, xp, 236, "v-ink") + SYM.pompe(xp, 236) + T(150, 200, "M1", "v-smb", "end") + T(150, 240, "P1", "v-smb", "end");
  s += Ln(96, yc, 152, yc, "v-barre2") + vanneH(128, yc) + flD(144, yc) + T(128, 268, "V1", "v-smb", "middle");
  s += Ln(184, yc, xR, yc, "v-barre2") + vanneH(204, yc, true) + T(204, 240, "CL", "v-smb", "middle") + vanneH(224, yc) + T(224, 240, "V2", "v-smb", "middle") + flH(xR, 204);
  if (v.sing.van >= 3) s += vanneV(xR, 156) + T(xR + 10, 160, "V3", "v-smb");
  alt.push(`Pompe centrifuge P1, entraînée par le moteur M1 : elle aspire dans la bâche (vanne V1 sur l'aspiration) et refoule (clapet anti-retour CL, vanne V2${v.sing.van >= 3 ? ", vanne V3" : ""}) vers ${st.haut} (en haut à droite, sur la colline).`);
  if (v.deb) {
    s += Pl([[xR, yc], [xR, 38], [286, 38], [286, 50]], "v-barre2") + Ci(286, 50, 2.6, "v-pt") + Ln(286, 55, 286, yEau - 2, "v-dash") + T(292, 54, `sortie : z = ${nf(v.zarr, 1)}`, "v-cap");
    alt.push(`La conduite de refoulement débouche à l'air libre en partie haute du réservoir : sortie à z = ${nf(v.zarr, 1)} m.${n >= 3 ? ` Niveaux du réservoir : haut à z = ${nf(v.zrh, 1)} m, bas à z = ${nf(v.zrb, 1)} m.` : ""}`);
  } else {
    s += Pl([[xR, yc], [xR, 116], [290, 116]], "v-barre2") + Ci(290, 116, 2.6, "v-pt") + T(276, 146, "arrivée noyée,", "v-cap") + T(276, 160, "en pied du réservoir", "v-cap");
    alt.push(`La conduite de refoulement arrive en pied du réservoir, sous l'eau (arrivée noyée). Niveaux du réservoir : haut à z = ${nf(v.zrh, 1)} m, bas à z = ${nf(v.zrb, 1)} m.`);
  }
  s += bloc(104, 74, ["Refoulement", `${v.mat} ${v.dn}`, `Ø intérieur : ${v.d} mm`, `longueur : ${nf(v.Lr)} m`], true);
  alt.push(`Conduite de refoulement : ${v.mat} ${v.dn}, diamètre intérieur ${v.d} mm, longueur ${nf(v.Lr)} m.`);
  const N = [`Aspiration : même conduite (${v.mat} ${v.dn}), longueur ${v.La} m.`, `Liquide pompé : ${st.fl}, ρ = ${nf(v.rho)} kg/m³ ; g = 9,81 m/s².`, "Le schéma ne montre pas tous les coudes : le tableau ci-dessous les compte."];
  N.forEach((t, i) => { s += T(6, 294 + 14 * i, t, "v-cap"); alt.push(t); });
  const L = [["Singularité", "Nombre"]].concat(XI.filter(([k]) => v.sing[k]).map(([k, nom]) => [nom, String(v.sing[k])]));
  const tb = tableauML({ titre: "Singularités de la conduite (aspiration et refoulement)", larg: [300, 88], tete: true, mono: [1], L });
  return empiler({ h: 334, corps: s, alt: alt.join(" ") }, tb);
}
/* DTEC 2 : cahier des charges (niveau 4 : avec l'étude du débit de nuit) */
function figCahier(v) {
  const _ = "\u00a0", n = v.niv, L = [`But : ${v.st.but}.`, `Volume à pomper chaque jour : V = ${nf(v.V)}${_}m³.`,
    n <= 2 ? `Durée de pompage : ${v.t}${_}h par jour.` : n === 3 ? `Le pompage doit durer au plus ${v.t}${_}h par jour.` : `Le jour, le pompage à plein débit doit durer au plus ${v.t}${_}h.`,
    `Fonctionnement : ${v.J} jours par an.`, `Prix moyen de l'énergie électrique : ${e2(v.c)}${_}€ le kWh.`, "Réseau électrique : triphasé 400 V, 50 Hz."];
  if (n === 2 || n === 3) L.push(v.res ? `Moteur : réserve de puissance d'au moins ${v.res}${_}% au-dessus de la puissance demandée par la pompe.` : "Moteur : puissance normalisée immédiatement supérieure à la puissance demandée par la pompe, sans réserve.",
    `Secours par groupe électrogène : le courant de démarrage de la pompe est limité à ${nf(v.lim)}${_}A.`);
  if (n === 4) L.push(`La nuit (8${_}h par jour), la demande baisse : la station tourne à débit réduit, Q' = ${v.Qn}${_}m³/h.`, `Étude du constructeur, rendement de la pompe à Q' : ${Math.round(v.etaV * 100)}${_}% avec la vanne de réglage, ${Math.round(v.etaVar * 100)}${_}% avec un variateur de vitesse.`,
    `Variateur proposé : ${nf(v.prix)}${_}€ installé, rendement 97${_}%.`, `Critère de l'entreprise : un investissement est accepté si son temps de retour est inférieur à ${v.crit}${_}an${v.crit > 1 ? "s" : ""}.`);
  return seul(encadre("DTEC 2 · Cahier des charges de la station", L));
}
/* DTEC 3 (niveau 1) : fiche de la pompe */
const figPompe1 = (v) => plaques([{ titre: "Pompe centrifuge P1", sous: "fiche du constructeur", lignes: [["Vitesse de rotation", "2 900 tr/min"], ["Hauteur à débit nul", `${nf(v.H0)} m`],
  ["Débit maximal", `${nf(v.Qmax)} m³/h`], ["Rendement au point prévu", `${Math.round(v.etaP * 100)} %`]] }], { titre: "DTEC 3 · Pompe P1" });

/* DTEC 3 (niveau 2) : les deux pompes proposées */
function figPompes2(v) {
  const L = [["Débit Q (m³/h)", ...v.qcols.map((q) => nf(q))]];
  v.pompes.forEach((p, i) => { const n = "AB"[i]; L.push([`Pompe ${n} · H (m)`, ...p.H.map((h) => nd(h, 1))], [`Pompe ${n} · η (%)`, ...p.E.map(String)]); });
  return seul(tableauML({ titre: "DTEC 3 · Pompes proposées par le constructeur (2 900 tr/min) : hauteur H et rendement η selon le débit Q", larg: [118, 54, 54, 54, 54, 54], tete: true, mono: [1, 2, 3, 4, 5], L }));
}
/* courbes (niveaux 3 et 4) ; étiquette d'une courbe : au-dessus (sens 1) ou au-dessous (sens −1), loin de l'autre courbe */
function placeEtiq(f, g, X, Y, sens, de, a) {
  for (let i = 0; i <= 24; i++) {
    const q = X.max * (de + (a - de) * i / 24), y = f(q) + (sens > 0 ? 0.35 : -0.8) * Y.pas;
    if (y > 0.35 * Y.pas && y < Y.max - 0.15 * Y.pas && [0, 0.06, 0.12].every((d) => Math.abs(y - g(q + d * X.max)) > 0.6 * Y.pas)) return [q, y];
  }
  return [X.max * de, Math.min(Y.max - 0.2 * Y.pas, f(X.max * de) + 0.35 * Y.pas)];
}
function grapheH(v, reseau, titre) {
  const p = v.p, X = v.gx, Y = v.gy, N = 48, pts = [], ptsR = [], fp = (q) => Hp(p, q), fr = (q) => v.Hg + v.k * q * q;
  for (let i = 0; i <= N; i++) { const q = X.max * i / N; if (fp(q) >= 0) pts.push([q, fp(q)]); if (fr(q) <= Y.max) ptsR.push([q, fr(q)]); }
  const series = [{ pts, cls: "v-curve", nom: "pompe P1", ou: placeEtiq(fp, reseau ? fr : () => -1e9, X, Y, 1, 0.1, 0.5) }];
  if (reseau) series.push({ pts: ptsR, cls: "v-curve2", nom: "réseau", ou: placeEtiq(fr, fp, X, Y, -1, 0.06, 0.5) });
  return courbe({ w: 400, h: 260, titre, x: { min: 0, max: X.max, pas: X.pas, titre: "Débit Q (m³/h)", d: 0 }, y: { min: 0, max: Y.max, pas: Y.pas, titre: "Hauteur H (m)", d: 0 }, series });
}
function grapheEta(v, titre) {
  const p = v.p, X = v.gx, Y = { max: 100, pas: 10 }, N = 48, pts = [], fe = (q) => 100 * etaP(p, q);
  for (let i = 0; i <= N; i++) { const q = X.max * i / N; if (fe(q) >= 0) pts.push([q, fe(q)]); }
  return courbe({ w: 400, h: 230, titre, x: { min: 0, max: X.max, pas: X.pas, titre: "Débit Q (m³/h)", d: 0 }, y: { min: 0, max: 100, pas: 10, titre: "Rendement η (%)", d: 0 },
    series: [{ pts, cls: "v-curve", nom: "rendement de P1", ou: placeEtiq(fe, () => -1e9, X, Y, -1, 0.3, 0.6) }] });
}
const figCourbes3 = (v) => grapheH(v, false, "DTEC 3 · Pompe P1 (2 900 tr/min) : hauteur H selon le débit Q") + grapheEta(v, "Pompe P1 : rendement η selon le débit Q");
const figFiche4 = (v) => seul(encadre("DTEC 3 · Pompe P1 : fiche du constructeur (2 900 tr/min)", [`Courbe H(Q) approchée par : H = ${nf(v.p.H0, 1)} − ${nf(v.p.a, 7)} × Q² (Q en m³/h, H en m).`, "Courbes de la pompe ci-dessous."]))
  + grapheH(v, false, "Pompe P1 : hauteur H selon le débit Q") + grapheEta(v, "Pompe P1 : rendement η selon le débit Q");
const figMoteur4 = (v) => plaques([{ titre: "Moteur asynchrone M1", sous: "triphasé · 50 Hz · classe IE3", lignes: [["Puissance utile", `${nf(v.m.P, 1)} kW`], ["Tension", v.m.tens], ["Courant nominal", `${nf(v.m.In, 1)} A`],
  ["Vitesse", `${nf(v.m.n)} tr/min`], ["Facteur de puissance", nd(v.m.cos, 2)], ["Rendement", `${nf(v.m.eta, 1)} %`]] }], { titre: "DTEC 4 · Plaque signalétique du moteur M1" });

/* ---------- dossier ressources ---------- */
const htmlPdc = () => `<p>Vitesse moyenne du liquide : ${F(`v = ${FRAC("Q<sub>v</sub>", "S")}`)} avec ${F(`S = ${FRAC("π × D²", "4")}`)} (D : diamètre intérieur de la conduite, en m ; Q<sub>v</sub> en m³/s).</p>
  <p>Pertes de charge linéaires (frottements le long de la conduite) : ${F(`ΔH<sub>L</sub> = λ × ${FRAC("L", "D")} × ${FRAC("v²", "2g")}`)}</p>
  <p>Pertes de charge singulières (entrée, coudes, vannes, clapet, sortie…) : ${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)}</p>
  <p class="note">ΔH en mètres de colonne de liquide ; L : longueur de la conduite (m) ; g = 9,81 m/s². ${FRAC("v²", "2g")} est la hauteur dynamique (m).</p>`
  + h4("a) Coefficient de pertes de charge linéaires λ (conduites neuves, eau)") + tab(["Matériau · Ø intérieur", ...COL_LIB], Object.keys(LAM).map((m) => [MAT_LIB[m], ...LAM[m].map((x) => nd(x, 3))]))
  + h4("b) Coefficients de pertes de charge singulières ξ") + tab(["Singularité", "ξ"], XI_DOC.map(([t, x]) => [t, nf(x, 1)]));
const htmlPuiss = (niv) => `<p><b>Hauteur manométrique totale</b> que doit fournir la pompe : ${F("HMT = H<sub>g</sub> + ΔH<sub>L</sub> + ΔH<sub>S</sub>")} (H<sub>g</sub> : hauteur géométrique, de la surface de l'eau aspirée jusqu'au point le plus haut que l'eau doit atteindre : la sortie d'une conduite qui débouche à l'air libre, ou la surface du réservoir si l'arrivée est noyée).</p>
  <p><b>Puissance hydraulique</b> fournie au liquide : ${F("P<sub>h</sub> = ρ × g × Q<sub>v</sub> × HMT")} (P<sub>h</sub> en W, ρ en kg/m³, g = 9,81 m/s², Q<sub>v</sub> en m³/s, HMT en m).</p>
  <p><b>Rendements</b> : pompe ${F(`η<sub>p</sub> = ${FRAC("P<sub>h</sub>", "P<sub>2</sub>")}`)} ; moteur ${F(`η<sub>m</sub> = ${FRAC("P<sub>2</sub>", "P<sub>1</sub>")}`)} (P<sub>2</sub> : puissance mécanique sur l'arbre de la pompe ; P<sub>1</sub> : puissance électrique absorbée par le moteur).</p>
  <p><b>Moteur triphasé</b> (U : tension entre phases) : ${F("P<sub>1</sub> = √3 × U × I × cos φ")} ; ${F("S<sub>1</sub> = √3 × U × I")} ; ${F("Q<sub>1</sub> = P<sub>1</sub> × tan φ")}.</p>
  <p><b>Énergie</b> : ${F("E = P × t")} (E en kWh avec P en kW et t en h) ; coût = énergie × prix du kWh.</p>
  ${niv === 4 ? `<p><b>Couple</b> sur un arbre : ${F("P = C × Ω")}, soit ${F(`C = ${FRAC("P", "Ω")}`)} avec ${F(`Ω = ${FRAC("2π × n", "60")}`)} (C en N·m, P en W, Ω en rad/s, n en tr/min).</p>` : ""}
  <p class="note">Choix du moteur : la puissance normalisée immédiatement supérieure ou égale à la puissance P<sub>2</sub> demandée par la pompe${niv >= 2 ? ", augmentée de la réserve de puissance éventuelle du cahier des charges" : ""}. On admet que le moteur garde le rendement et le facteur de puissance du catalogue (ou de sa plaque).</p>`;
/* le catalogue en image, pour les questions du niveau 1 qui choisissent le moteur et en tirent η et cos φ */
const figCatalogue1 = () => seul(tableauML({ titre: "Catalogue de moteurs asynchrones IE3, 2 pôles, 400 V, 50 Hz (extrait)", larg: [70, 80, 66, 66, 106], tete: true, mono: [0, 1, 2, 3, 4],
  L: [["Pn (kW)", "n (tr/min)", "η (%)", "cos φ", "In à 400 V (A)"], ...CATA.map((m) => [nf(m.P, 1), nf(m.n), nf(m.eta, 1), nd(m.cos, 2), nf(m.In, 1)])] }));
const htmlCatalogue = () => `<p>Moteurs asynchrones triphasés à cage, 2 pôles, 50 Hz, classe de rendement IE3. Valeurs à la puissance nominale, sous 400 V.</p>`
  + tab(["P<sub>n</sub> (kW)", "n (tr/min)", "η (%)", "cos φ", "I<sub>n</sub> à 400 V (A)", "I<sub>d</sub> / I<sub>n</sub>", "Tension Δ / Y"], CATA.map((m) => [nf(m.P, 1), nf(m.n), nf(m.eta, 1), nd(m.cos, 2), nf(m.In, 1), nf(m.kd, 1), m.tens]))
  + `<p class="note">Puissances normalisées (kW) : ${PMOT.map((p) => nf(p, 1)).join(" · ")}.</p>`;

const htmlDemarrage = () => `<p>Modes de démarrage des moteurs asynchrones triphasés, du plus simple (et le moins coûteux) au plus complexe :</p>`
  + tab(["Mode", "Courant de démarrage", "Couple de démarrage", "Conditions"], [
    ["Direct", "I<sub>d</sub> (catalogue)", "C<sub>d</sub> (catalogue)", "Aucune."],
    ["Étoile-triangle", `${FRAC("I<sub>d</sub>", "3")}`, `${FRAC("C<sub>d</sub>", "3")}`, "Le moteur doit fonctionner couplé en triangle sur le réseau : sa tension en triangle (Δ) est celle du réseau (400 V Δ / 690 V Y sur un réseau 400 V). Charge à faible couple au démarrage : une pompe centrifuge convient."],
    ["Démarreur progressif", "réglable, 3 × I<sub>n</sub> au minimum", "réduit", "Arrêt progressif possible."],
    ["Variateur de vitesse", "1,5 × I<sub>n</sub> au plus", "jusqu'à 1,5 × C<sub>n</sub>", "Le plus coûteux ; règle aussi la vitesse (et le débit)."]])
  + `<p><b>Règle de choix :</b> on retient le mode <b>le plus simple</b> qui respecte la limite de courant de démarrage imposée.</p>
  <p class="note">En direct, I<sub>d</sub> = (I<sub>d</sub>/I<sub>n</sub>) × I<sub>n</sub>, avec les valeurs du catalogue (ou de la plaque).</p>`;
const htmlPoint = () => `<p>Le <b>point de fonctionnement</b> d'une pompe sur un réseau est l'intersection de la courbe H(Q) de la pompe et de la courbe du réseau : c'est le seul point où la hauteur fournie par la pompe est égale à la hauteur demandée par le réseau.</p>
  <p><b>Courbe du réseau</b> : ${F("H = H<sub>g</sub> + k × Q²")}. La hauteur géométrique, plus les pertes de charge, proportionnelles au carré du débit. Le coefficient k se calcule avec un point connu du réseau (un débit et la HMT correspondante).</p>
  <p><b>Courbe de la pompe</b> donnée par le constructeur, souvent approchée par ${F("H = H<sub>0</sub> − a × Q²")} (H<sub>0</sub> : hauteur à débit nul).</p>
  <p class="note">Si le débit au point de fonctionnement dépasse le débit minimal demandé, la pompe remplit le réservoir plus vite et fonctionne moins longtemps chaque jour.</p>`;
const htmlSimil = () => `<p><b>Lois de similitude</b> d'une pompe centrifuge dont la vitesse passe de N à N' (rapport ${F(`r = ${FRAC("N'", "N")}`)}) : ${F("Q' = r × Q")} ; ${F("H' = r² × H")} ; ${F("P' = r³ × P")}. Le rendement de la pompe est conservé d'un point à son point homologue.</p>
  <p>Si la courbe de la pompe à la vitesse N est ${F("H = H<sub>0</sub> − a × Q²")}, à la vitesse N' elle devient ${F("H = r² × H<sub>0</sub> − a × Q²")}.</p>
  <p><b>Variateur de vitesse</b> : la vitesse du moteur asynchrone est proportionnelle à la fréquence, ${F(`r = ${FRAC("f'", "50 Hz")}`)} (glissement négligé).</p>
  <p><b>Réglage par vanne</b> (laminage) : la pompe garde sa vitesse ; la vanne ajoute des pertes de charge et le point de fonctionnement glisse sur la courbe de la pompe jusqu'au débit voulu.</p>
  <p><b>Temps de retour sur investissement</b> : ${F(`t<sub>r</sub> = ${FRAC("prix de l'investissement", "économie annuelle")}`)}.</p>`;

/* ---------- morceaux de corrigés ---------- */
const explV = (v) => `D = ${v.d} mm = ${nf(v.Dm, 3)} m ; ${F(`S = ${FRAC("π × D²", "4")}`)} = ${FRAC(`π × ${nf(v.Dm, 3)}²`, "4")} = ${n3(v.S)} m². ${F(`v = ${FRAC("Q<sub>v</sub>", "S")}`)} = ${FRAC(n3(v.Qs), n3(v.S))} = ${R(`${n3(v.vit)} m/s`)}.`;
const explLam = (v) => `Conduite en ${v.mat}, Ø intérieur ${v.d} mm (DTEC 1) : ligne « ${MAT_LIB[v.mat]} », colonne « ${COL_LIB[v.iL]} » : ${R(`λ = ${nd(v.lam, 3)}`)}.`;
const explHL = (v) => `L = ${v.La} + ${nf(v.Lr)} = ${nf(v.L)} m (aspiration et refoulement, même conduite). ${F(`ΔH<sub>L</sub> = λ × ${FRAC("L", "D")} × ${FRAC("v²", "2g")}`)} = ${nd(v.lam, 3)} × ${FRAC(nf(v.L), nf(v.Dm, 3))} × ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.dHL)} m`)}.`;
const singL = (v) => XI.filter(([k]) => v.sing[k]);
const explSx = (v) => `Tableau des singularités (DTEC 1) et coefficients ξ (DRES) :` + ul(singL(v).map(([k, nom, x]) => `${nom} : ${v.sing[k]} × ${nf(x, 1)} = ${nf(v.sing[k] * x, 1)}`))
  + `Σξ = ${singL(v).map(([k, , x]) => nf(v.sing[k] * x, 1)).join(" + ")} = ${R(nf(v.sx, 2))}.`;
const explHv = (v) => `${F(FRAC("v²", "2g"))} = ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.hv)} m`)}.`;
const explHS = (v) => `${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)} = ${nf(v.sx, 2)} × ${FRAC(`${n3(v.vit)}²`, "2 × 9,81")} = ${R(`${n3(v.dHS)} m`)}.`;
const explHMT = (v) => `${F("HMT = H<sub>g</sub> + ΔH<sub>L</sub> + ΔH<sub>S</sub>")} = ${nf(v.Hg, 1)} + ${n3(v.dHL)} + ${n3(v.dHS)} = ${R(`${n3(v.HMT)} m`)}. La pompe doit remonter l'eau de H<sub>g</sub> et, en plus, vaincre les pertes de charge.`;
const explPh = (v) => `${F("P<sub>h</sub> = ρ × g × Q<sub>v</sub> × HMT")} = ${nf(v.rho)} × 9,81 × ${n3(v.Qs)} × ${n3(v.HMT)} = ${nf(Math.round(v.Ph))} W, soit ${R(`${n3(v.Ph / 1000)} kW`)} (Q<sub>v</sub> en m³/s).`;
const explMot = (v, Pmin, res) => `${res ? `Avec la réserve de ${res} % : ${F(`P<sub>n</sub> ≥ ${nf(1 + res / 100, 2)} × P<sub>2</sub>`)} = ${nf(1 + res / 100, 2)} × ${n3(v.P2)} = ${n3(Pmin)} kW. ` : `Il faut ${F("P<sub>n</sub> ≥ P<sub>2</sub>")} = ${n3(v.P2)} kW. `}`
  + `Catalogue : ${nf(CATA[v.iM - 1].P, 1)} kW ne suffit pas ; ${R(`${nf(v.m.P, 1)} kW`)} est la puissance normalisée immédiatement supérieure.`;
const explP1 = (v) => `Catalogue, ligne ${nf(v.m.P, 1)} kW : η<sub>m</sub> = ${nf(v.m.eta, 1)} %. ${F(`P<sub>1</sub> = ${FRAC("P<sub>2</sub>", "η<sub>m</sub>")}`)} = ${FRAC(n3(v.P2), nf(v.m.eta / 100, 3))} = ${R(`${n3(v.P1)} kW`)}.`;
const explElec = (v, k) => {
  const c = `Catalogue, ligne ${nf(v.m.P, 1)} kW : cos φ = ${nd(v.m.cos, 2)}.`;
  if (k === "S") return `${c} ${F("P<sub>1</sub> = S<sub>1</sub> × cos φ")}, donc ${F(`S<sub>1</sub> = ${FRAC("P<sub>1</sub>", "cos φ")}`)} = ${FRAC(n3(v.P1), nd(v.m.cos, 2))} = ${R(`${n3(v.S1)} kVA`)}.`;
  if (k === "Q") return `${c} φ = ${nf(Math.acos(v.m.cos) * 180 / Math.PI, 1)}°, tan φ = ${nf(v.tan, 3)}. ${F("Q<sub>1</sub> = P<sub>1</sub> × tan φ")} = ${n3(v.P1)} × ${nf(v.tan, 3)} = ${R(`${n3(v.Q1)} kvar`)}. C'est cette énergie réactive que compense une batterie de condensateurs.`;
  return `${c} ${F("P<sub>1</sub> = √3 × U × I × cos φ")}, donc ${F(`I = ${FRAC("P<sub>1</sub>", "√3 × U × cos φ")}`)} = ${FRAC(nf(Math.round(v.P1 * 1000)), `√3 × 400 × ${nd(v.m.cos, 2)}`)} = ${R(`${n3(v.I)} A`)}. Le moteur n'est pas à pleine charge : ce courant reste inférieur à son courant nominal (${nf(v.m.In, 1)} A).`;
};

const explHgMax = (v) => v.deb
  ? `Cas le plus défavorable : la bâche à son niveau bas (z = ${nf(v.zbb, 1)} m), l'eau doit alors monter le plus haut. La conduite débouche à l'air libre au-dessus du réservoir : l'eau doit atteindre la sortie (z = ${nf(v.zarr, 1)} m), quel que soit le niveau du réservoir. ${F("H<sub>g</sub> = z<sub>sortie</sub> − z<sub>bâche, bas</sub>")} = ${nf(v.zarr, 1)} − ${zz(v.zbb)} = ${R(`${nf(v.Hg, 1)} m`)}.`
  : `Cas le plus défavorable : la bâche à son niveau bas (z = ${nf(v.zbb, 1)} m) et le réservoir à son niveau haut (z = ${nf(v.zrh, 1)} m). L'arrivée est noyée : la pompe doit soulever l'eau jusqu'à la surface du réservoir (la sortie de la conduite, sous l'eau, ne fixe pas la hauteur). ${F("H<sub>g</sub> = z<sub>réservoir, haut</sub> − z<sub>bâche, bas</sub>")} = ${nf(v.zrh, 1)} − ${zz(v.zbb)} = ${R(`${nf(v.Hg, 1)} m`)}.`;
const explDH = (v) => `${explV(v)} ${explLam(v)} ${explHL(v)} ${explSx(v)} ${explHS(v)} ${F("ΔH = ΔH<sub>L</sub> + ΔH<sub>S</sub>")} = ${n3(v.dHL)} + ${n3(v.dHS)} = ${R(`${n3(v.dH)} m`)}.`;
const explDem = (v) => {
  const m = v.m, Id = m.kd * m.In, ok = (x) => (x <= v.lim ? `≤ ${nf(v.lim)} A : convient.` : `&gt; ${nf(v.lim)} A : ne convient pas.`);
  const L = [`Direct : I<sub>d</sub> = ${nf(m.kd, 1)} × ${nf(m.In, 1)} = ${nf(Id, 1)} A ${ok(Id)}`];
  if (v.dem >= 1) L.push(m.P >= 4 ? `Étoile-triangle (moteur ${m.tens}, couplé en triangle sur le réseau 400 V) : ${FRAC(nf(Id, 1), "3")} = ${nf(Id / 3, 1)} A ${ok(Id / 3)}` : `Étoile-triangle : impossible, ce moteur (${m.tens}) est couplé en étoile sur le réseau 400 V.`);
  if (v.dem >= 2) L.push(`Démarreur progressif : au moins 3 × ${nf(m.In, 1)} = ${nf(3 * m.In, 1)} A ${ok(3 * m.In)}`);
  if (v.dem === 3) L.push(`Variateur de vitesse : au plus 1,5 × ${nf(m.In, 1)} = ${nf(1.5 * m.In, 1)} A ${ok(1.5 * m.In)}`);
  return `Catalogue, moteur de ${nf(m.P, 1)} kW : I<sub>n</sub> = ${nf(m.In, 1)} A et I<sub>d</sub>/I<sub>n</sub> = ${nf(m.kd, 1)}. Limite du cahier des charges : ${nf(v.lim)} A.` + ul(L) + `On retient le mode le plus simple qui convient : ${R(MODES[v.dem])}.`;
};
const choixMoteur = (v) => { const ch = fenetre(PMOT, v.iM, v.avM).map((p) => `${nf(p, 1)} kW`); return { ch, ok: ch.indexOf(`${nf(v.m.P, 1)} kW`) }; };
const explAn = (v, t) => `${F("E = P<sub>1</sub> × t × nombre de jours")} = ${n3(v.P1)} × ${nf(t, 2)} × ${v.J} = ${nf(Math.round(v.Ea))} kWh`;

/* =====================================================================
   NIVEAU 1 · « pas à pas »
   ===================================================================== */
function gen1() {
  const v = situation1(), st = v.st;
  const fS = figStation(v), fC = figCahier(v), fP = figPompe1(v), fM = figCatalogue1();
  const dPdc = doc("DRES · Pertes de charge dans une conduite", htmlPdc()), dPu = doc("DRES · Hauteur manométrique, puissances, énergie", htmlPuiss(1)), dCat = doc("DRES · Catalogue de moteurs asynchrones", htmlCatalogue());
  const ctxA = `${cap(st.site)} : une pompe centrifuge P1, entraînée par un moteur asynchrone M1, doit ${st.but}. On calcule d'abord ce que la pompe doit fournir (débit et hauteur), puis on choisit son moteur et on évalue le coût de l'énergie.`;
  const PmTxt = `${nf(v.m.P, 1)} kW`, chM = fenetre(PMOT, v.iM, v.avM).map((p) => `${nf(p, 1)} kW`);
  const qA2 = v.vDebit === "ls"
    ? { q: "Exprimer ce débit en litres par seconde (L/s).", ans: v.Qs * 1000, unit: "L/s", expl: `1 m³ = 1 000 L et 1 h = 3 600 s : Q<sub>v</sub> = ${FRAC(`${nf(v.Q)} × 1 000`, "3 600")} = ${R(`${n3(v.Qs * 1000)} L/s`)}, soit ${n3(v.Qs)} m³/s, l'unité des formules de mécanique des fluides.` }
    : { q: "Exprimer ce débit en m³/s.", ans: v.Qs, unit: "m³/s", expl: `1 h = 3 600 s : Q<sub>v</sub> = ${FRAC(nf(v.Q), "3 600")} = ${R(`${n3(v.Qs)} m³/s`)}. C'est l'unité des formules de mécanique des fluides (unités SI).` };
  const qB3 = v.vDyn === "hv"
    ? { q: "Calculer la hauteur dynamique v²/(2g) de l'eau dans la conduite.", ans: v.hv, unit: "m", tolR: 0.03, rappel: `Question A.3 : v = ${n3(v.vit)} m/s.`,
        ou: "Vitesse calculée en A.3 ; g = 9,81 m/s².", expl: `${explHv(v)} Les pertes de charge sont proportionnelles à cette hauteur, donc au carré de la vitesse.` }
    : { q: "Calculer la somme Σξ des coefficients de pertes de charge singulières de toute la conduite.", ans: v.sx, unit: "", tolA: 0.02,
        ou: "DTEC 1 : tableau des singularités (nombre de chacune). DRES : coefficient ξ de chaque singularité.", expl: explSx(v) };
  const qC5 = { I: { q: "Calculer l'intensité I du courant absorbé en ligne par le moteur (réseau triphasé 400 V).", ans: v.I, unit: "A" },
    S: { q: "Calculer la puissance apparente S<sub>1</sub> absorbée par le moteur.", ans: v.S1, unit: "kVA" },
    Q: { q: "Calculer la puissance réactive Q<sub>1</sub> absorbée par le moteur.", ans: v.Q1, unit: "kvar" } }[v.vElec];
  const qD2 = v.vAn === "mwh"
    ? { q: "Calculer l'énergie électrique consommée par la pompe en une année, en MWh.", ans: v.Ea / 1000, unit: "MWh",
        expl: `${F("E<sub>an</sub> = E<sub>jour</sub> × nombre de jours")} = ${n3(v.Ej)} × ${v.J} = ${nf(Math.round(v.Ea))} kWh, soit ${R(`${n3(v.Ea / 1000)} MWh`)} (1 MWh = 1 000 kWh).` }
    : { q: "Calculer le coût annuel de l'énergie consommée par la pompe.", ans: v.cout, unit: "€",
        expl: `Énergie annuelle : ${n3(v.Ej)} × ${v.J} = ${nf(Math.round(v.Ea))} kWh. ${F("Coût = E × prix du kWh")} = ${nf(Math.round(v.Ea))} × ${e2(v.c)} = ${R(`${nf(Math.round(v.cout))} €`)}.` };
  const qD3 = v.vM3 === "eur"
    ? { q: `Calculer le coût de l'énergie électrique pour pomper 1 m³ d'${st.fl}, en centimes d'euro.`, ans: v.Ej * v.c / v.V * 100, unit: "c€",
        expl: `Chaque jour : ${n3(v.Ej)} kWh × ${e2(v.c)} € = ${nf(v.Ej * v.c, 2)} € pour ${nf(v.V)} m³. ${F(`coût par m³ = ${FRAC("coût journalier", "V")}`)} = ${FRAC(nf(v.Ej * v.c, 2), nf(v.V))} = ${nf(v.Ej * v.c / v.V, 4)} €, soit ${R(`${n3(v.Ej * v.c / v.V * 100)} c€`)} par m³.` }
    : { q: `Calculer l'énergie électrique consommée pour pomper 1 m³ d'${st.fl}.`, ans: v.Ej / v.V, unit: "kWh/m³",
        expl: `${F(`E<sub>m³</sub> = ${FRAC("E<sub>jour</sub>", "V")}`)} = ${FRAC(n3(v.Ej), nf(v.V))} = ${R(`${n3(v.Ej / v.V)} kWh/m³`)}. Cet indicateur permet de comparer des stations de pompage entre elles.` };
  return [
    /* ---------- Partie A · débit et hauteur géométrique ---------- */
    { ref: "A.1", nid: "fluides", lv: 1, fig: fC, ctx: ctxA,
      q: "Calculer le débit volumique Q<sub>v</sub> que doit assurer la pompe, en m³/h.", type: "num", ans: v.Q, unit: "m³/h", tolR: 0.005,
      ou: "DTEC 2 : volume à pomper chaque jour et durée de pompage.",
      expl: `La pompe doit débiter le volume V en t heures : ${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${R(`${nf(v.Q)} m³/h`)}.` },
    Object.assign({ ref: "A.2", nid: "fluides", lv: 1, fig: fC, rappel: `Question précédente : Q<sub>v</sub> = ${nf(v.Q)} m³/h.`, type: "num", tolR: 0.01,
      ou: "1 h = 3 600 s ; 1 m³ = 1 000 L." }, qA2),
    { ref: "A.3", nid: "fluides", lv: 2, fig: fS, docs: [dPdc], rappel: `Question précédente : Q<sub>v</sub> = ${n3(v.Qs)} m³/s.`,
      q: "Calculer la vitesse moyenne v de l'eau dans la conduite.", type: "num", ans: v.vit, unit: "m/s", tolR: 0.02,
      ou: "DTEC 1 : diamètre intérieur de la conduite. DRES : v = Qv / S, avec S = π × D² / 4 (D en m).", expl: explV(v) },
    { ref: "A.4", nid: "fluides", lv: 1, fig: fS,
      q: "Calculer la hauteur géométrique H<sub>g</sub> entre la surface de l'eau dans la bâche et la sortie de la conduite dans le réservoir.", type: "num", ans: v.Hg, unit: "m", tolA: 0.05,
      ou: "DTEC 1 : cotes z de la surface de l'eau (bâche) et de la sortie de la conduite (réservoir).",
      expl: `${F("H<sub>g</sub> = z<sub>sortie</sub> − z<sub>surface</sub>")} = ${nf(v.zarr, 1)} − ${zz(v.zbb)} = ${R(`${nf(v.Hg, 1)} m`)}. C'est la hauteur dont la pompe doit remonter l'eau.` },
    /* ---------- Partie B · pertes de charge et HMT ---------- */
    { ref: "B.1", nid: "fluides", lv: 1, fig: fS, docs: [dPdc], ctx: "L'eau frotte sur la paroi de la conduite et traverse des singularités : ces pertes de charge s'ajoutent à la hauteur à remonter.",
      q: "Relever le coefficient de pertes de charge linéaires λ de la conduite.", type: "num", ans: v.lam, unit: "", tolA: 0.0005,
      ou: "DTEC 1 : matériau et diamètre intérieur de la conduite. DRES, tableau a) : ligne du matériau, colonne du diamètre intérieur.", expl: explLam(v) },
    { ref: "B.2", nid: "fluides", lv: 2, fig: fS, docs: [dPdc], rappel: `Questions précédentes : v = ${n3(v.vit)} m/s ; λ = ${nd(v.lam, 3)}.`,
      q: "Calculer les pertes de charge linéaires ΔH<sub>L</sub> sur toute la conduite (aspiration et refoulement).", type: "num", ans: v.dHL, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : longueurs de l'aspiration et du refoulement, diamètre intérieur (en m). DRES : formule de ΔHL.", expl: explHL(v) },
    Object.assign({ ref: "B.3", nid: "fluides", lv: 1, fig: fS, docs: [dPdc], type: "num" }, qB3),
    { ref: "B.4", nid: "fluides", lv: 2, fig: fS, docs: [dPdc],
      rappel: v.vDyn === "hv" ? `Question précédente : ${FRAC("v²", "2g")} = ${n3(v.hv)} m.` : `Questions précédentes : v = ${n3(v.vit)} m/s ; Σξ = ${nf(v.sx, 2)}.`,
      q: "Calculer les pertes de charge singulières ΔH<sub>S</sub> de toute la conduite.", type: "num", ans: v.dHS, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : tableau des singularités. DRES : coefficients ξ et formule de ΔHS.",
      expl: v.vDyn === "hv" ? `${explSx(v)} ${F(`ΔH<sub>S</sub> = Σξ × ${FRAC("v²", "2g")}`)} = ${nf(v.sx, 2)} × ${n3(v.hv)} = ${R(`${n3(v.dHS)} m`)}.` : explHS(v) },
    { ref: "B.5", nid: "fluides", lv: 2, fig: fS, docs: [dPu], rappel: `Questions précédentes : H<sub>g</sub> = ${nf(v.Hg, 1)} m ; ΔH<sub>L</sub> = ${n3(v.dHL)} m ; ΔH<sub>S</sub> = ${n3(v.dHS)} m.`,
      q: "Calculer la hauteur manométrique totale HMT que doit fournir la pompe.", type: "num", ans: v.HMT, unit: "m", tolR: 0.01,
      ou: "DRES : HMT = hauteur géométrique + pertes de charge.", expl: explHMT(v) },
    /* ---------- Partie C · pompe et moteur ---------- */
    { ref: "C.1", nid: "fluides", lv: 2, fig: fS, docs: [dPu], ctx: "On passe à la pompe et à son moteur.", rappel: `On prendra Q<sub>v</sub> = ${n3(v.Qs)} m³/s et HMT = ${n3(v.HMT)} m.`,
      q: "Calculer la puissance hydraulique P<sub>h</sub> fournie à l'eau, en kW.", type: "num", ans: v.Ph / 1000, unit: "kW", tolR: 0.015,
      ou: "DTEC 1 : masse volumique du liquide. DRES : Ph = ρ × g × Qv × HMT (Qv en m³/s).", expl: explPh(v) },
    { ref: "C.2", nid: "rendement-energie", lv: 2, fig: fP, docs: [dPu], rappel: `Question précédente : P<sub>h</sub> = ${n3(v.Ph / 1000)} kW.`,
      q: "Calculer la puissance mécanique P<sub>2</sub> que le moteur doit fournir sur l'arbre de la pompe.", type: "num", ans: v.P2, unit: "kW", tolR: 0.015,
      ou: "DTEC 3 : rendement de la pompe au point prévu. DRES : ηp = Ph / P2.",
      expl: `DTEC 3 : η<sub>p</sub> = ${Math.round(v.etaP * 100)} %. ${F(`η<sub>p</sub> = ${FRAC("P<sub>h</sub>", "P<sub>2</sub>")}`)}, donc ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub>")}`)} = ${FRAC(n3(v.Ph / 1000), nd(v.etaP, 2))} = ${R(`${n3(v.P2)} kW`)}. La pompe reçoit plus de puissance qu'elle n'en donne à l'eau : le reste est perdu en frottements et en turbulences.` },
    { ref: "C.3", nid: "moteurs", lv: 1, fig: fM, docs: [dCat, dPu], rappel: `Question précédente : P<sub>2</sub> = ${n3(v.P2)} kW.`,
      q: "Choisir la puissance nominale du moteur M1 dans le catalogue.", type: "ch", ch: chM, ok: chM.indexOf(PmTxt),
      ou: "DRES : règle de choix du moteur (puissance normalisée) ; catalogue des moteurs.", expl: explMot(v, v.P2, 0) },
    { ref: "C.4", nid: "rendement-energie", lv: 1, fig: fM, docs: [dCat, dPu], rappel: `Questions précédentes : P<sub>2</sub> = ${n3(v.P2)} kW ; moteur de ${PmTxt}.`,
      q: "Calculer la puissance électrique P<sub>1</sub> absorbée par le moteur.", type: "num", ans: v.P1, unit: "kW", tolR: 0.015,
      ou: "Catalogue : rendement du moteur choisi. DRES : ηm = P2 / P1.", expl: explP1(v) },
    Object.assign({ ref: "C.5", nid: "moteurs", lv: 2, fig: fM, docs: [dCat, dPu], rappel: `Questions précédentes : P<sub>1</sub> = ${n3(v.P1)} kW ; moteur de ${PmTxt}.`, type: "num", tolR: 0.015,
      ou: "Catalogue : cos φ du moteur choisi. DRES : relations du moteur triphasé.", expl: explElec(v, v.vElec) }, qC5),
    /* ---------- Partie D · énergie et coût ---------- */
    { ref: "D.1", nid: "rendement-energie", lv: 1, fig: fC, docs: [dPu], ctx: "Pour finir, l'énergie consommée par la station et son coût.", rappel: `On prendra P<sub>1</sub> = ${n3(v.P1)} kW.`,
      q: "Calculer l'énergie électrique consommée par le moteur en une journée.", type: "num", ans: v.Ej, unit: "kWh", tolR: 0.015,
      ou: "DTEC 2 : durée de pompage par jour. DRES : E = P × t.",
      expl: `${F("E = P<sub>1</sub> × t")} = ${n3(v.P1)} × ${v.t} = ${R(`${n3(v.Ej)} kWh`)} par jour.` },
    Object.assign({ ref: "D.2", nid: "rendement-energie", lv: 1, fig: fC, rappel: `Question précédente : E = ${n3(v.Ej)} kWh par jour.`, type: "num", tolR: 0.015,
      ou: "DTEC 2 : nombre de jours de fonctionnement par an, prix du kWh." }, qD2),
    Object.assign({ ref: "D.3", nid: "rendement-energie", lv: 2, fig: fC, rappel: `Question D.1 : E = ${n3(v.Ej)} kWh par jour.`, type: "num", tolR: 0.02,
      ou: "DTEC 2 : volume pompé chaque jour (et prix du kWh)." }, qD3)
  ];
}

/* =====================================================================
   NIVEAU 2 · « par étapes » : la question indique les documents à utiliser
   ===================================================================== */
function gen2() {
  const v = situation2(), st = v.st, P = v.pompes, nomP = "AB"[v.iP], autre = "AB"[1 - v.iP];
  const figs = { st: figStation(v), ca: figCahier(v), po: figPompes2(v) };
  const docs = [dtec(1, "Station de pompage", figs.st, "Station"), dtec(2, "Cahier des charges", figs.ca, "Cahier des charges"), dtec(3, "Pompes proposées", figs.po, "Pompes")]
    .concat([["Pertes de charge dans une conduite", htmlPdc(), "Pertes de charge"], ["Hauteur manométrique, puissances, énergie", htmlPuiss(2), "Puissances"], ["Catalogue de moteurs asynchrones", htmlCatalogue(), "Moteurs"],
      ["Modes de démarrage", htmlDemarrage(), "Démarrage"]].map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true }, o), M = choixMoteur(v), PmTxt = `${nf(v.m.P, 1)} kW`;
  const ctxA = `${cap(st.site)} : une pompe centrifuge P1, entraînée par un moteur asynchrone M1, doit ${st.but}. Tout le dossier est dans les onglets : dossier technique (DTEC) et dossier ressources (DRES). Chaque question indique les documents à utiliser.`;
  const lp = (i) => `pompe ${"AB"[i]} : H = ${nd(P[i].H[2], 1)} m, η = ${P[i].E[2]} %`;
  return [
    /* ---------- A · besoin et conduite ---------- */
    q(Object.assign({ ref: "A.1", nid: "fluides", lv: 1, fig: figs.ca, ctx: ctxA, type: "num", tolR: 0.01, ou: "DTEC 2 : volume journalier et durée de pompage." }, v.vDebit === "ls"
      ? { q: "Calculer le débit volumique Q<sub>v</sub> que doit assurer la pompe, en L/s (DTEC 2).", ans: v.Qs * 1000, unit: "L/s",
          expl: `${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${nf(v.Q)} m³/h. 1 m³ = 1 000 L et 1 h = 3 600 s : Q<sub>v</sub> = ${FRAC(`${nf(v.Q)} × 1 000`, "3 600")} = ${R(`${n3(v.Qs * 1000)} L/s`)}, soit ${n3(v.Qs)} m³/s.` }
      : { q: "Calculer le débit volumique Q<sub>v</sub> que doit assurer la pompe, en m³/s (DTEC 2).", ans: v.Qs, unit: "m³/s",
          expl: `${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${nf(v.Q)} m³/h, soit ${FRAC(nf(v.Q), "3 600")} = ${R(`${n3(v.Qs)} m³/s`)}.` })),
    q({ ref: "A.2", nid: "fluides", lv: 2, fig: figs.st, rappel: `On prendra Q<sub>v</sub> = ${n3(v.Qs)} m³/s.`,
      q: "Calculer la vitesse moyenne v de l'eau dans la conduite (DTEC 1, DRES 1).", type: "num", ans: v.vit, unit: "m/s", tolR: 0.02,
      ou: "DTEC 1 : diamètre intérieur. DRES 1 : v = Qv / S.", expl: explV(v) }),
    q({ ref: "A.3", nid: "fluides", lv: 2, fig: figs.st,
      q: "Calculer la hauteur géométrique H<sub>g</sub> à retenir pour dimensionner la pompe, dans le cas le plus défavorable (DTEC 1).", type: "num", ans: v.Hg, unit: "m", tolA: 0.05,
      ou: "DTEC 1 : niveaux de la bâche et cote de la sortie de la conduite. Le cas le plus défavorable est celui où l'eau doit monter le plus haut.", expl: explHgMax(v) }),
    q({ ref: "A.4", nid: "fluides", lv: 3, fig: figs.st, rappel: `On prendra v = ${n3(v.vit)} m/s.`,
      q: "Calculer les pertes de charge totales ΔH de la conduite, linéaires et singulières (DTEC 1, DRES 1).", type: "num", ans: v.dH, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : matériau, diamètre, longueurs, singularités. DRES 1 : λ, ξ et les deux formules.",
      expl: `${explLam(v)} ${explHL(v)} ${explSx(v)} ${explHS(v)} ${F("ΔH = ΔH<sub>L</sub> + ΔH<sub>S</sub>")} = ${n3(v.dHL)} + ${n3(v.dHS)} = ${R(`${n3(v.dH)} m`)}.` }),
    /* ---------- B · choix de la pompe ---------- */
    q({ ref: "B.1", nid: "fluides", lv: 1, fig: figs.st, rappel: `On prendra H<sub>g</sub> = ${nf(v.Hg, 1)} m et ΔH = ${n3(v.dH)} m.`,
      q: "Calculer la hauteur manométrique totale HMT que doit fournir la pompe (DRES 2).", type: "num", ans: v.HMT, unit: "m", tolR: 0.01,
      ou: "DRES 2 : HMT = hauteur géométrique + pertes de charge.", expl: `${F("HMT = H<sub>g</sub> + ΔH")} = ${nf(v.Hg, 1)} + ${n3(v.dH)} = ${R(`${n3(v.HMT)} m`)}.` }),
    q({ ref: "B.2", nid: "fluides", lv: 2, fig: figs.st, rappel: `On prendra Q<sub>v</sub> = ${n3(v.Qs)} m³/s et HMT = ${n3(v.HMT)} m.`,
      q: "Calculer la puissance hydraulique utile P<sub>h</sub>, en kW (DTEC 1, DRES 2).", type: "num", ans: v.Ph / 1000, unit: "kW", tolR: 0.015,
      ou: "DTEC 1 : masse volumique du liquide. DRES 2 : Ph = ρ × g × Qv × HMT.", expl: explPh(v) }),
    q({ ref: "B.3", nid: "fluides", lv: 2, fig: figs.po, rappel: `On prendra HMT = ${n3(v.HMT)} m au débit Q<sub>v</sub> = ${nf(v.Q)} m³/h.`,
      q: "Choisir la pompe : elle doit fournir au moins la HMT au débit voulu ; si les deux conviennent, on retient celle qui a le meilleur rendement (DTEC 3).", type: "ch", fixe: true,
      ch: ["Pompe A", "Pompe B", "Aucune des deux ne convient"], ok: v.iP,
      ou: "DTEC 3 : colonne du débit voulu ; comparer H à la HMT, puis les rendements.",
      expl: `Colonne Q = ${nf(v.Q)} m³/h : ${lp(0)} ; ${lp(1)}. ${v.deux ? `Les deux pompes fournissent au moins ${n3(v.HMT)} m : on retient celle qui a le meilleur rendement, ${R(`la pompe ${nomP}`)}.` : `Seule la pompe ${nomP} fournit au moins ${n3(v.HMT)} m : ${R(`la pompe ${nomP}`)}. La pompe ${autre} n'atteint que ${nd(P[1 - v.iP].H[2], 1)} m : elle ne remonterait pas l'eau au débit voulu${P[1 - v.iP].E[2] > P[v.iP].E[2] ? ", malgré son meilleur rendement" : ""}.`}` }),
    q({ ref: "B.4", nid: "rendement-energie", lv: 2, fig: figs.po, rappel: `On prendra la pompe ${nomP} et P<sub>h</sub> = ${n3(v.Ph / 1000)} kW.`,
      q: "Calculer la puissance mécanique P<sub>2</sub> que le moteur doit fournir à la pompe (DTEC 3, DRES 2).", type: "num", ans: v.P2, unit: "kW", tolR: 0.015,
      ou: "DTEC 3 : rendement de la pompe retenue au débit voulu. DRES 2 : ηp = Ph / P2.",
      expl: `Pompe ${nomP}, colonne ${nf(v.Q)} m³/h : η<sub>p</sub> = ${P[v.iP].E[2]} %. ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub>")}`)} = ${FRAC(n3(v.Ph / 1000), nd(v.etaP, 2))} = ${R(`${n3(v.P2)} kW`)}.` }),
    /* ---------- C · moteur ---------- */
    q({ ref: "C.1", nid: "moteurs", lv: 2, fig: figs.ca, ctx: "On choisit maintenant le moteur M1 et son mode de démarrage.", rappel: `On prendra P<sub>2</sub> = ${n3(v.P2)} kW.`,
      q: "Choisir la puissance du moteur M1 (DTEC 2, DRES 2 et 3).", type: "ch", ch: M.ch, ok: M.ok,
      ou: "DTEC 2 : réserve de puissance imposée. DRES 2 : règle de choix ; DRES 3 : puissances du catalogue.", expl: explMot(v, v.Pmin, v.res) }),
    q(Object.assign({ ref: "C.2", nid: "moteurs", lv: 2, fig: figs.ca, rappel: `On prendra P<sub>2</sub> = ${n3(v.P2)} kW et un moteur de ${PmTxt}.`, type: "num", tolR: 0.02,
      ou: "DRES 3 : rendement et cos φ du moteur choisi. DRES 2 : relations du moteur triphasé.", expl: `${explP1(v)} ${explElec(v, v.vElec)}` }, v.vElec === "S"
      ? { q: "Calculer la puissance apparente S<sub>1</sub> absorbée par le moteur (DRES 2 et 3).", ans: v.S1, unit: "kVA" }
      : { q: "Calculer l'intensité I du courant absorbé en ligne par le moteur (DRES 2 et 3).", ans: v.I, unit: "A" })),
    q({ ref: "C.3", nid: "moteurs", lv: 2, fig: figs.ca, rappel: `On prendra un moteur de ${PmTxt}.`,
      q: "Choisir le mode de démarrage du moteur M1 (DTEC 2, DRES 3 et 4).", type: "ch", fixe: true, ch: MODES, ok: v.dem,
      ou: "DTEC 2 : limite du courant de démarrage. DRES 3 : In et Id / In ; tension du moteur. DRES 4 : courant de chaque mode et règle de choix.", expl: explDem(v) }),
    /* ---------- D · énergie ---------- */
    q(Object.assign({ ref: "D.1", nid: "rendement-energie", lv: 1, fig: figs.ca, ctx: "Pour finir, la consommation de la station.", rappel: `On prendra P<sub>1</sub> = ${n3(v.P1)} kW.`, type: "num", tolR: 0.015,
      ou: "DTEC 2 : durée de pompage par jour et jours de fonctionnement par an." }, v.vAn === "mwh"
      ? { q: "Calculer l'énergie électrique consommée par la pompe en une année, en MWh (DTEC 2).", ans: v.Ea / 1000, unit: "MWh", expl: `${explAn(v, v.t)}, soit ${R(`${n3(v.Ea / 1000)} MWh`)}.` }
      : { q: "Calculer l'énergie électrique consommée par la pompe en une année, en kWh (DTEC 2).", ans: v.Ea, unit: "kWh", expl: `${explAn(v, v.t)} : ${R(`${nf(Math.round(v.Ea))} kWh`)}.` })),
    q({ ref: "D.2", nid: "rendement-energie", lv: 1, fig: figs.ca, rappel: `On prendra E = ${nf(Math.round(v.Ea))} kWh par an.`,
      q: "Calculer le coût annuel de cette énergie (DTEC 2).", type: "num", ans: v.cout, unit: "€", tolR: 0.015, ou: "DTEC 2 : prix du kWh.",
      expl: `${F("Coût = E × prix du kWh")} = ${nf(Math.round(v.Ea))} × ${e2(v.c)} = ${R(`${nf(Math.round(v.cout))} €`)}.` }),
    q(Object.assign({ ref: "D.3", nid: "rendement-energie", lv: 2, fig: figs.ca, rappel: `On prendra P<sub>1</sub> = ${n3(v.P1)} kW.`, type: "num", tolR: 0.02,
      ou: "DTEC 2 : volume et durée de pompage par jour. En une heure, la pompe débite Qv." }, v.vM3 === "eur"
      ? { q: `Calculer le coût de l'énergie pour pomper 1 m³ d'${st.fl}, en centimes d'euro (DTEC 2).`, ans: v.P1 * v.c / v.Q * 100, unit: "c€",
          expl: `En une heure, la pompe consomme ${n3(v.P1)} kWh et débite ${nf(v.Q)} m³ : ${FRAC(n3(v.P1), nf(v.Q))} = ${nf(v.P1 / v.Q, 4)} kWh par m³, qui coûtent ${nf(v.P1 / v.Q, 4)} × ${e2(v.c)} = ${nf(v.P1 * v.c / v.Q, 5)} €, soit ${R(`${n3(v.P1 * v.c / v.Q * 100)} c€`)} par m³.` }
      : { q: `Calculer l'énergie électrique consommée pour pomper 1 m³ d'${st.fl} (DTEC 2).`, ans: v.P1 / v.Q, unit: "kWh/m³",
          expl: `En une heure, la pompe consomme ${n3(v.P1)} kWh et débite ${nf(v.Q)} m³ (même résultat avec une journée : ${FRAC("P<sub>1</sub> × t", "V")}) : ${FRAC(n3(v.P1), nf(v.Q))} = ${R(`${n3(v.P1 / v.Q)} kWh/m³`)}.` }))
  ];
}

/* =====================================================================
   NIVEAU 3 · « comme à l'épreuve » : point de fonctionnement lu sur les courbes
   ===================================================================== */
function gen3() {
  const v = situation3(), st = v.st;
  const figs = { st: figStation(v), ca: figCahier(v), po: figCourbes3(v) };
  const docs = [dtec(1, "Station de pompage", figs.st, "Station"), dtec(2, "Cahier des charges", figs.ca, "Cahier des charges"), dtec(3, "Courbes de la pompe P1", figs.po, "Pompe P1")]
    .concat([["Pertes de charge dans une conduite", htmlPdc(), "Pertes de charge"], ["Hauteur manométrique, puissances, énergie", htmlPuiss(3), "Puissances"], ["Point de fonctionnement d'une pompe", htmlPoint(), "Point de fonctionnement"],
      ["Catalogue de moteurs asynchrones", htmlCatalogue(), "Moteurs"], ["Modes de démarrage", htmlDemarrage(), "Démarrage"]].map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true }, o), M = choixMoteur(v), PmTxt = `${nf(v.m.P, 1)} kW`;
  const ctxA = `${cap(st.site)} : une pompe centrifuge P1, entraînée par un moteur asynchrone M1, doit ${st.but}. Comme à l'épreuve, à toi de trouver les données dans le dossier technique (DTEC) et le dossier ressources (DRES).`;
  const fR = grapheH(v, true, "Courbe de la pompe P1 et courbe du réseau, tracée par le bureau d'études"), fE = grapheEta(v, "Pompe P1 : rendement η selon le débit Q");
  return [
    /* ---------- A · le réseau ---------- */
    q({ ref: "A.1", nid: "fluides", lv: 1, fig: figs.ca, ctx: ctxA,
      q: "Calculer le débit minimal Q<sub>v</sub> que doit assurer la pompe, en m³/h.", type: "num", ans: v.Q, unit: "m³/h", tolR: 0.005, ou: "DTEC 2 : volume journalier et durée maximale de pompage.",
      expl: `Le volume V doit être pompé en ${v.t} h au plus : ${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${R(`${nf(v.Q)} m³/h`)} au minimum.` }),
    q({ ref: "A.2", nid: "fluides", lv: 2, fig: figs.st,
      q: "Calculer la hauteur géométrique H<sub>g</sub> à retenir pour dimensionner la pompe.", type: "num", ans: v.Hg, unit: "m", tolA: 0.05,
      ou: "DTEC 1 : niveaux de la bâche et du réservoir, type d'arrivée dans le réservoir.", expl: explHgMax(v) }),
    q({ ref: "A.3", nid: "fluides", lv: 3, fig: figs.st, rappel: `On prendra Q<sub>v</sub> = ${nf(v.Q)} m³/h.`,
      q: "Calculer les pertes de charge totales ΔH de la conduite au débit Q<sub>v</sub>.", type: "num", ans: v.dH, unit: "m", tolR: 0.03,
      ou: "DTEC 1 : conduite et singularités. DRES : vitesse, λ, ξ, formules des pertes de charge.", expl: explDH(v) }),
    q({ ref: "A.4", nid: "fluides", lv: 1, fig: figs.st, rappel: `On prendra H<sub>g</sub> = ${nf(v.Hg, 1)} m et ΔH = ${n3(v.dH)} m.`,
      q: "Calculer la hauteur manométrique totale HMT que doit fournir la pompe au débit Q<sub>v</sub>.", type: "num", ans: v.HMT, unit: "m", tolR: 0.01,
      ou: "HMT = hauteur géométrique + pertes de charge.", expl: `${F("HMT = H<sub>g</sub> + ΔH")} = ${nf(v.Hg, 1)} + ${n3(v.dH)} = ${R(`${n3(v.HMT)} m`)}.` }),
    /* ---------- B · point de fonctionnement ---------- */
    q({ ref: "B.1", nid: "fluides", lv: 2, fig: fR, ctx: "Le bureau d'études a tracé la courbe du réseau sur la courbe de la pompe.", rappel: `La courbe du réseau passe par le point Q<sub>v</sub> = ${nf(v.Q)} m³/h ; HMT = ${n3(v.HMT)} m.`,
      q: "Relever le débit Q<sub>f</sub> au point de fonctionnement de la pompe P1 sur ce réseau.", type: "num", ans: v.Qf, unit: "m³/h", tolR: 0.04, tolA: v.gx.pas / 4,
      ou: "Le point de fonctionnement est l'intersection des deux courbes ; lire le débit sur l'axe horizontal.",
      expl: `Le point de fonctionnement est l'intersection de la courbe de la pompe et de la courbe du réseau : ${R(`Q<sub>f</sub> ≈ ${nf(v.Qf, 0)} m³/h`)}, pour H<sub>f</sub> ≈ ${nf(v.Hf, 1)} m. Ce débit dépasse le débit minimal (${nf(v.Q)} m³/h) : la pompe convient, elle remplira le réservoir plus vite que prévu.` }),
    q(Object.assign({ ref: "B.2", nid: "fluides", lv: 1, fig: figs.ca, rappel: `On prendra Q<sub>f</sub> = ${v.Qfr} m³/h.`, type: "num", ou: "DTEC 2 : volume journalier et durée maximale." }, v.vT === "gain"
      ? { q: "Calculer, en minutes, le temps de pompage gagné chaque jour par rapport à la durée maximale du cahier des charges.", ans: (v.t - v.tf) * 60, unit: "min", tolR: 0.03, tolA: 1,
          expl: `${F(`t = ${FRAC("V", "Q<sub>f</sub>")}`)} = ${FRAC(nf(v.V), nf(v.Qfr))} = ${nf(v.tf, 2)} h. Gain : ${v.t} − ${nf(v.tf, 2)} = ${nf(v.t - v.tf, 2)} h, soit ${R(`${nf((v.t - v.tf) * 60, 0)} min`)} par jour.` }
      : { q: "Calculer la durée de pompage nécessaire chaque jour.", ans: v.tf, unit: "h", tolR: 0.015,
          expl: `${F(`t = ${FRAC("V", "Q<sub>f</sub>")}`)} = ${FRAC(nf(v.V), nf(v.Qfr))} = ${R(`${nf(v.tf, 2)} h`)}, moins que les ${v.t} h permises.` })),
    q({ ref: "B.3", nid: "fluides", lv: 1, fig: fE, rappel: `On prendra Q<sub>f</sub> = ${v.Qfr} m³/h.`,
      q: "Relever le rendement de la pompe au point de fonctionnement.", type: "num", ans: v.etaF * 100, unit: "%", tolA: 2.5,
      ou: "DTEC 3 : courbe du rendement, au débit du point de fonctionnement.", expl: `Courbe du rendement, à Q = ${v.Qfr} m³/h : ${R(`η<sub>p</sub> ≈ ${nf(v.etaF * 100, 0)} %`)}.` }),
    q({ ref: "B.4", nid: "rendement-energie", lv: 2, fig: figs.st, rappel: `On prendra Q<sub>f</sub> = ${v.Qfr} m³/h, H<sub>f</sub> = ${nf(v.Hfr, 1)} m et η<sub>p</sub> = ${v.etaR} %.`,
      q: "Calculer la puissance P<sub>2</sub> absorbée par la pompe au point de fonctionnement.", type: "num", ans: v.P2, unit: "kW", tolR: 0.015,
      ou: "DTEC 1 : masse volumique du liquide. DRES : Ph = ρ × g × Qv × HMT et ηp = Ph / P2.",
      expl: `Q<sub>f</sub> = ${FRAC(nf(v.Qfr), "3 600")} = ${n3(v.Qfr / 3600)} m³/s. ${F("P<sub>h</sub> = ρ × g × Q<sub>f</sub> × H<sub>f</sub>")} = ${nf(v.rho)} × 9,81 × ${n3(v.Qfr / 3600)} × ${nf(v.Hfr, 1)} = ${nf(Math.round(v.Phf))} W. ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub>")}`)} = ${FRAC(nf(Math.round(v.Phf)), nd(v.etaR / 100, 2))} = ${nf(Math.round(v.P2 * 1000))} W, soit ${R(`${n3(v.P2)} kW`)}.` }),
    /* ---------- C · moteur et énergie ---------- */
    q({ ref: "C.1", nid: "moteurs", lv: 2, fig: figs.ca, rappel: `On prendra P<sub>2</sub> = ${n3(v.P2)} kW.`,
      q: "Choisir la puissance du moteur M1.", type: "ch", ch: M.ch, ok: M.ok, ou: "DTEC 2 : réserve de puissance éventuelle. DRES : règle de choix et catalogue.", expl: explMot(v, v.Pmin, v.res) }),
    q(Object.assign({ ref: "C.2", nid: "moteurs", lv: 2, fig: figs.ca, rappel: `On prendra P<sub>2</sub> = ${n3(v.P2)} kW et un moteur de ${PmTxt}.`, type: "num", tolR: 0.02,
      ou: "Catalogue : rendement et cos φ du moteur ; relations du moteur triphasé.", expl: `${explP1(v)} ${explElec(v, v.vElec)}` }, v.vElec === "S"
      ? { q: "Calculer la puissance apparente S<sub>1</sub> absorbée par le moteur.", ans: v.S1, unit: "kVA" }
      : { q: "Calculer l'intensité I du courant absorbé en ligne par le moteur.", ans: v.I, unit: "A" })),
    q({ ref: "C.3", nid: "moteurs", lv: 2, fig: figs.ca, rappel: `On prendra un moteur de ${PmTxt}.`,
      q: "Choisir le mode de démarrage du moteur M1.", type: "ch", fixe: true, ch: MODES, ok: v.dem, ou: "DTEC 2 : limite du courant de démarrage. DRES : catalogue et modes de démarrage.", expl: explDem(v) }),
    q(Object.assign({ ref: "C.4", nid: "rendement-energie", lv: 2, fig: figs.ca, rappel: `On prendra P<sub>1</sub> = ${n3(v.P1)} kW et ${nf(v.tf, 2)} h de pompage par jour.`, type: "num", tolR: 0.015,
      ou: "DTEC 2 : jours de fonctionnement par an et prix du kWh." }, v.vAn === "mwh"
      ? { q: "Calculer l'énergie électrique consommée par la pompe en une année, en MWh.", ans: v.Ea / 1000, unit: "MWh", expl: `${explAn(v, v.tf)}, soit ${R(`${n3(v.Ea / 1000)} MWh`)}.` }
      : { q: "Calculer le coût annuel de l'énergie consommée par la pompe.", ans: v.cout, unit: "€", expl: `${explAn(v, v.tf)}. ${F("Coût = E × prix du kWh")} = ${nf(Math.round(v.Ea))} × ${e2(v.c)} = ${R(`${nf(Math.round(v.cout))} €`)}.` }))
  ];
}

/* =====================================================================
   NIVEAU 4 · « au-delà de l'épreuve » : point de fonctionnement calculé, débit réduit (vanne ou variateur)
   ===================================================================== */
function gen4() {
  const v = situation4(), st = v.st, p = v.p, m = v.m;
  const figs = { st: figStation(v), ca: figCahier(v), po: figFiche4(v), mo: figMoteur4(v) };
  const docs = [dtec(1, "Station de pompage", figs.st, "Station"), dtec(2, "Cahier des charges", figs.ca, "Cahier des charges"), dtec(3, "Pompe P1", figs.po, "Pompe P1"), dtec(4, "Moteur M1", figs.mo, "Moteur M1")]
    .concat([["Pertes de charge dans une conduite", htmlPdc(), "Pertes de charge"], ["Hauteur manométrique, puissances, couple, énergie", htmlPuiss(4), "Puissances"], ["Point de fonctionnement d'une pompe", htmlPoint(), "Point de fonctionnement"],
      ["Lois de similitude, variateur de vitesse", htmlSimil(), "Similitude, variateur"], ["Catalogue de moteurs asynchrones", htmlCatalogue(), "Moteurs"], ["Modes de démarrage", htmlDemarrage(), "Démarrage"]].map((r, i) => dres(i + 1, r[0], r[1], r[2])));
  const q = (o) => Object.assign({ docs, classeur: true }, o);
  const ctxA = `${cap(st.site)} : la pompe centrifuge P1, entraînée par le moteur asynchrone M1 (DTEC 3 et 4), doit ${st.but}. Niveau au-delà de l'épreuve : chaque question enchaîne plusieurs étapes, à toi de les organiser.`;
  const kq = n3(v.k), aq = nf(p.a, 7), H0 = nf(p.H0, 1), Qn = v.Qn;
  const phT = (qq, h) => `${nf(v.rho)} × 9,81 × ${FRAC(nf(qq), "3 600")} × ${n3(h)}`;
  const crit = v.crit, bon = v.tr < crit;
  const chB5 = [`Oui : il est remboursé en moins de ${crit} an${crit > 1 ? "s" : ""}`, `Non : il faut plus de ${crit} an${crit > 1 ? "s" : ""} pour le rembourser`, "Oui : la nuit, la pompe ne consomme plus rien", "Non : avec le variateur, la pompe consomme davantage"];
  const chC2 = ["Le couple demandé par une pompe centrifuge diminue comme le carré de la vitesse : le courant et les pertes du moteur baissent, son ventilateur ralenti suffit.",
    "Le variateur limite le courant à 1,5 × I<sub>n</sub>, quel que soit le couple demandé par la pompe.", "À vitesse réduite, le ventilateur du moteur tourne plus vite et le refroidit mieux.",
    "Le variateur élève la tension du moteur, ce qui compense la baisse de vitesse."];
  return [
    /* ---------- A · point de fonctionnement ---------- */
    q({ ref: "A.1", nid: "fluides", lv: 3, fig: figs.st, ctx: ctxA,
      q: "Calculer la hauteur manométrique totale HMT que doit fournir la pompe au débit minimal demandé, dans le cas le plus défavorable.", type: "num", ans: v.HMT, unit: "m", tolR: 0.02,
      ou: "DTEC 2 : débit minimal (V et durée). DTEC 1 : niveaux, arrivée, conduite, singularités. DRES : pertes de charge, HMT.",
      expl: `Débit minimal : ${F(`Q<sub>v</sub> = ${FRAC("V", "t")}`)} = ${FRAC(nf(v.V), nf(v.t))} = ${nf(v.Q)} m³/h, soit ${n3(v.Qs)} m³/s. ${explHgMax(v)} ${explDH(v)} ${F("HMT = H<sub>g</sub> + ΔH")} = ${nf(v.Hg, 1)} + ${n3(v.dH)} = ${R(`${n3(v.HMT)} m`)}.` }),
    q({ ref: "A.2", nid: "fluides", lv: 3, fig: figs.po, rappel: `On prendra Q<sub>v</sub> = ${nf(v.Q)} m³/h, H<sub>g</sub> = ${nf(v.Hg, 1)} m et HMT = ${n3(v.HMT)} m.`,
      q: "Calculer le débit Q<sub>f</sub> au point de fonctionnement de la pompe P1 sur ce réseau.", type: "num", ans: v.Qf, unit: "m³/h", tolR: 0.02,
      ou: "DRES : courbe du réseau H = Hg + k × Q² (k par le point connu) ; DTEC 3 : courbe de la pompe ; égaler les deux hauteurs.",
      expl: `Courbe du réseau ${F("H = H<sub>g</sub> + k × Q²")} ; elle passe par (${nf(v.Q)} m³/h ; ${n3(v.HMT)} m) : ${F(`k = ${FRAC("HMT − H<sub>g</sub>", "Q<sub>v</sub>²")}`)} = ${FRAC(`${n3(v.HMT)} − ${nf(v.Hg, 1)}`, `${nf(v.Q)}²`)} = ${kq}. Au point de fonctionnement, ${H0} − ${aq} × Q² = ${nf(v.Hg, 1)} + ${kq} × Q², donc ${F(`Q<sub>f</sub> = √(${FRAC("H<sub>0</sub> − H<sub>g</sub>", "a + k")})`)} = √(${FRAC(`${H0} − ${nf(v.Hg, 1)}`, `${aq} + ${kq}`)}) = ${R(`${n3(v.Qf)} m³/h`)} ; H<sub>f</sub> = ${nf(v.Hg, 1)} + ${kq} × ${n3(v.Qf)}² = ${n3(v.Hf)} m.` }),
    q({ ref: "A.3", nid: "rendement-energie", lv: 3, fig: figs.po, rappel: `On prendra Q<sub>f</sub> = ${v.Qfr} m³/h et H<sub>f</sub> = ${nf(v.Hfr, 1)} m.`,
      q: "Calculer la puissance électrique absorbée par le moteur M1 au point de fonctionnement.", type: "num", ans: v.P1f, unit: "kW", tolR: 0.04,
      ou: "DTEC 3 : rendement de la pompe au point de fonctionnement (courbe). DTEC 4 : rendement du moteur. DRES : puissances.",
      expl: `DTEC 3, à ${v.Qfr} m³/h : η<sub>p</sub> ≈ ${nf(v.etaF * 100, 0)} %. ${F("P<sub>h</sub> = ρ × g × Q × H")} = ${phT(v.Qfr, v.Hfr)} = ${n3(v.P2f * v.etaF)} kW ; ${F(`P<sub>2</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub>")}`)} = ${n3(v.P2f)} kW ; plaque du moteur : η<sub>m</sub> = ${nf(m.eta, 1)} %, ${F(`P<sub>1</sub> = ${FRAC("P<sub>2</sub>", "η<sub>m</sub>")}`)} = ${R(`${n3(v.P1f)} kW`)}.` }),
    /* ---------- B · débit réduit la nuit : vanne ou variateur ---------- */
    q({ ref: "B.1", nid: "rendement-energie", lv: 3, fig: figs.ca, ctx: `La nuit, le débit doit être réduit à Q' = ${Qn} m³/h (DTEC 2). Première solution : fermer en partie la vanne V2 (laminage).`,
      q: "Avec la vanne, calculer la puissance électrique absorbée par le moteur au débit Q'.", type: "num", ans: v.P1v, unit: "kW", tolR: 0.025,
      ou: "La vitesse ne change pas : le point reste sur la courbe de la pompe (DTEC 3). DTEC 2 : rendement de la pompe avec la vanne ; DTEC 4 : rendement du moteur.",
      expl: `La pompe garde sa vitesse : le point est sur sa courbe, ${F(`H = H<sub>0</sub> − a × Q'²`)} = ${H0} − ${aq} × ${Qn}² = ${n3(v.Hv)} m. ${F("P<sub>h</sub> = ρ × g × Q' × H")} = ${phT(Qn, v.Hv)} = ${n3(v.P1v * v.etaV * m.eta / 100)} kW ; ${F(`P<sub>1</sub> = ${FRAC("P<sub>h</sub>", "η<sub>p</sub> × η<sub>m</sub>")}`)} = ${FRAC(n3(v.P1v * v.etaV * m.eta / 100), `${nd(v.etaV, 2)} × ${nf(m.eta / 100, 3)}`)} = ${R(`${n3(v.P1v)} kW`)}. La vanne dissipe une grande partie de cette hauteur.` }),
    q({ ref: "B.2", nid: "variateurs", lv: 3, fig: figs.po, ctx: "Seconde solution : un variateur de vitesse alimente le moteur M1 ; la vanne V2 reste grande ouverte.", rappel: `On prendra k = ${kq} (courbe du réseau H = H<sub>g</sub> + k × Q², Q en m³/h).`,
      q: "Calculer la fréquence f' que doit fournir le variateur pour obtenir le débit Q'.", type: "num", ans: v.fn, unit: "Hz", tolR: 0.015,
      ou: "Sans vanne, le point est sur la courbe du réseau. DRES : courbe de la pompe à la vitesse r × N, et r = f' / 50 Hz.",
      expl: `Sans vanne, le point est sur la courbe du réseau : ${F("H' = H<sub>g</sub> + k × Q'²")} = ${nf(v.Hg, 1)} + ${kq} × ${Qn}² = ${n3(v.Hn)} m. À la vitesse r × N, la courbe de la pompe est ${F("H = r² × H<sub>0</sub> − a × Q²")} ; elle doit passer par ce point : ${F(`r = √(${FRAC("H' + a × Q'²", "H<sub>0</sub>")})`)} = √(${FRAC(`${n3(v.Hn)} + ${aq} × ${Qn}²`, H0)}) = ${nf(v.r, 3)}. ${F("f' = r × 50")} = ${R(`${nf(v.fn, 1)} Hz`)}.` }),
    q({ ref: "B.3", nid: "variateurs", lv: 3, fig: figs.ca, rappel: `On prendra H' = ${n3(v.Hn)} m (point du réseau à Q').`,
      q: "Avec le variateur, calculer la puissance électrique absorbée au débit Q', variateur compris.", type: "num", ans: v.P1var, unit: "kW", tolR: 0.025,
      ou: "DTEC 2 : rendement de la pompe avec le variateur, rendement du variateur. DTEC 4 : rendement du moteur.",
      expl: `${F("P<sub>h</sub> = ρ × g × Q' × H'")} = ${phT(Qn, v.Hn)} = ${n3(v.P2n * v.etaVar)} kW ; ${F(`P = ${FRAC("P<sub>h</sub>", "η<sub>p</sub> × η<sub>m</sub> × η<sub>variateur</sub>")}`)} = ${FRAC(n3(v.P2n * v.etaVar), `${nd(v.etaVar, 2)} × ${nf(m.eta / 100, 3)} × 0,97`)} = ${R(`${n3(v.P1var)} kW`)}. La pompe ne fournit plus que la hauteur demandée par le réseau.` }),
    q(Object.assign({ ref: "B.4", nid: "economie-normes", lv: 2, fig: figs.ca, rappel: `On prendra ${n3(v.P1v)} kW avec la vanne et ${n3(v.P1var)} kW avec le variateur.`, type: "num", tolR: 0.02,
      ou: "DTEC 2 : 8 h par nuit, jours de fonctionnement par an, prix du kWh." }, v.vGain === "kwh"
      ? { q: "Calculer l'énergie électrique économisée chaque année, la nuit, grâce au variateur.", ans: v.dE, unit: "kWh",
          expl: `Nuits : 8 × ${v.J} = ${nf(v.hN)} h par an. ${F("ΔE = (P<sub>vanne</sub> − P<sub>variateur</sub>) × t")} = (${n3(v.P1v)} − ${n3(v.P1var)}) × ${nf(v.hN)} = ${R(`${nf(Math.round(v.dE))} kWh`)} par an.` }
      : { q: "Calculer l'économie annuelle, en euros, apportée la nuit par le variateur.", ans: v.gain, unit: "€",
          expl: `Nuits : 8 × ${v.J} = ${nf(v.hN)} h par an. Énergie économisée : (${n3(v.P1v)} − ${n3(v.P1var)}) × ${nf(v.hN)} = ${nf(Math.round(v.dE))} kWh ; × ${e2(v.c)} € = ${R(`${nf(Math.round(v.gain))} €`)} par an.` })),
    q({ ref: "B.5", nid: "economie-normes", lv: 2, fig: figs.ca, rappel: `On prendra une économie de ${nf(Math.round(v.gain))} € par an.`,
      q: "Le variateur respecte-t-il le critère d'investissement de l'entreprise ?", type: "ch", ch: chB5, ok: bon ? 0 : 1,
      ou: "DTEC 2 : prix du variateur et critère de l'entreprise. DRES : temps de retour sur investissement.",
      expl: `${F(`t<sub>r</sub> = ${FRAC("prix", "économie annuelle")}`)} = ${FRAC(nf(v.prix), nf(Math.round(v.gain)))} = ${nf(v.tr, 1)} an${v.tr >= 2 ? "s" : ""} ${bon ? "&lt;" : "&gt;"} ${crit} an${crit > 1 ? "s" : ""} : ${R(bon ? "investissement accepté" : "investissement refusé")}.${bon ? "" : " Il resterait intéressant si le débit réduit durait plus longtemps, ou si l'énergie était plus chère."}` }),
    /* ---------- C · moteur à vitesse réduite ---------- */
    q(Object.assign({ ref: "C.1", nid: "mecanique", lv: 3, fig: figs.mo, rappel: `On prendra H' = ${n3(v.Hn)} m et f' = ${nf(v.fn, 1)} Hz.`, type: "num",
      ou: "DTEC 2 : rendement de la pompe avec le variateur. DTEC 4 : vitesse nominale. DRES : puissances, couple, r = f' / 50." }, v.vMeca === "p2"
      ? { q: "Calculer la puissance mécanique fournie la nuit par le moteur à la pompe, avec le variateur.", ans: v.P2n, unit: "kW", tolR: 0.025,
          expl: `${F(`P<sub>2</sub>' = ${FRAC("ρ × g × Q' × H'", "η<sub>p</sub>")}`)} = ${FRAC(n3(v.P2n * v.etaVar), nd(v.etaVar, 2))} = ${R(`${n3(v.P2n)} kW`)}, à comparer aux ${nf(m.P, 1)} kW du moteur.` }
      : { q: "Calculer le couple fourni la nuit par le moteur à la pompe, avec le variateur.", ans: v.Cn, unit: "N·m", tolR: 0.03,
          expl: `${F(`P<sub>2</sub>' = ${FRAC("ρ × g × Q' × H'", "η<sub>p</sub>")}`)} = ${FRAC(n3(v.P2n * v.etaVar), nd(v.etaVar, 2))} = ${n3(v.P2n)} kW. Vitesse : r = ${FRAC(nf(v.fn, 1), "50")} = ${nf(v.r, 3)} ; N' = ${nf(v.r, 3)} × ${nf(m.n)} = ${nf(v.Nn, 0)} tr/min ; Ω' = ${FRAC(`2π × ${nf(v.Nn, 0)}`, "60")} = ${n3(2 * Math.PI * v.Nn / 60)} rad/s. ${F(`C = ${FRAC("P<sub>2</sub>'", "Ω'")}`)} = ${FRAC(nf(Math.round(v.P2n * 1000)), n3(2 * Math.PI * v.Nn / 60))} = ${R(`${n3(v.Cn)} N·m`)}.` })),
    q({ ref: "C.2", nid: "variateurs", lv: 2, fig: figs.mo,
      q: "Pourquoi le moteur M1, auto-ventilé, peut-il tourner chaque nuit à vitesse réduite sans s'échauffer ?", type: "ch", ch: chC2, ok: 0,
      ou: "Lois de similitude : comment varient la puissance, puis le couple, d'une pompe centrifuge avec la vitesse ?",
      expl: `Pour une pompe centrifuge, ${F("P ∝ N³")} et ${F(`C = ${FRAC("P", "Ω")} ∝ N²`)} : à ${nf(v.r * 100, 0)} % de la vitesse, le couple n'est plus qu'environ ${nf(v.r * v.r * 100, 0)} % du couple à pleine vitesse. Le courant du moteur suit le couple : ses pertes baissent beaucoup, et son ventilateur, ralenti, suffit à les évacuer. ${R("Le couple d'une pompe centrifuge diminue comme le carré de la vitesse")}. Ce ne serait pas vrai pour une charge à couple constant (convoyeur, pompe volumétrique), qui demanderait une ventilation forcée.` })
  ];
}

/* ---------- l'étude et ses niveaux ---------- */
E4.SERIES_DEVOIRS.push({ id: "pompe", titre: "Station de pompage", notions: ["fluides", "rendement-energie", "moteurs", "variateurs", "economie-normes"],
  desc: "Une pompe centrifuge remplit un réservoir en hauteur : débit, pertes de charge, hauteur manométrique, point de fonctionnement, puissances et rendements, choix et démarrage du moteur, énergie et coût, variateur de vitesse." });
DV.push({ id: "pompe1", serie: "pompe", court: "Niveau 1", titre: "Station de pompage", niveau: 1, nomNiveau: "Pas à pas",
  resume: "Débit, vitesse de l'eau, hauteur géométrique, pertes de charge linéaires et singulières, hauteur manométrique totale, puissance hydraulique, puissance du moteur, grandeurs électriques, énergie et coût.",
  duree_min: 60, parties: [["A", "Débit et hauteur géométrique", 4], ["B", "Pertes de charge et HMT", 5], ["C", "Pompe et moteur", 5], ["D", "Énergie et coût", 3]],
  gen: gen1, valeurs: situation1 });
DV.push({ id: "pompe2", serie: "pompe", court: "Niveau 2", titre: "Station de pompage", niveau: 2, nomNiveau: "Par étapes", apres: "pompe1",
  resume: "Les étapes regroupées, avec les documents à utiliser. En plus : hauteur géométrique dans le cas le plus défavorable, λ et ξ lus dans le DRES, choix entre deux pompes, réserve de puissance du moteur, mode de démarrage, énergie annuelle.",
  duree_min: 75, parties: [["A", "Besoin et conduite", 4], ["B", "Choix de la pompe", 4], ["C", "Moteur", 3], ["D", "Énergie", 3]], gen: gen2, valeurs: situation2 });
DV.push({ id: "pompe3", serie: "pompe", court: "Niveau 3", titre: "Station de pompage", niveau: 3, nomNiveau: "Comme à l'épreuve", apres: "pompe2",
  resume: "Les questions de l'épreuve, sans indication de document : arrivée en partie haute ou noyée, pertes de charge, point de fonctionnement et rendement lus sur les courbes, moteur, démarrage, coût de l'énergie.",
  duree_min: 90, parties: [["A", "Le réseau", 4], ["B", "Point de fonctionnement", 4], ["C", "Moteur et énergie", 4]], gen: gen3, valeurs: situation3 });
DV.push({ id: "pompe4", serie: "pompe", court: "Niveau 4", titre: "Station de pompage", niveau: 4, nomNiveau: "Au-delà de l'épreuve", apres: "pompe3",
  resume: "Point de fonctionnement calculé avec l'équation de la pompe, puis la nuit, à débit réduit : vanne de réglage ou variateur de vitesse (lois de similitude), économie, temps de retour, couple et échauffement du moteur.",
  duree_min: 90, parties: [["A", "Point de fonctionnement", 3], ["B", "Débit réduit : vanne ou variateur", 5], ["C", "Moteur à vitesse réduite", 2]], gen: gen4, valeurs: situation4 });
})(window.E4);
