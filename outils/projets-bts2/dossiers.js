// Génère les dossiers projet BTS 2 (format du lycée) à partir de projets.json
// usage : node dossiers.js projets.json dossier-sortie logo.png [P01]
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, WidthType, ShadingType, BorderStyle, VerticalAlign, LevelFormat, PageNumber,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  TableLayoutType, ExternalHyperlink, HeadingLevel, Tab, TabStopType, LineRuleType,
} = require("docx");

const DATA = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const OUTDIR = process.argv[3];
const LOGO = fs.readFileSync(process.argv[4]);
const SEUL = process.argv[5] || null;
const SITE = "https://si.ka-ilei.com/entrainements/bts-projets.html";

const W = 9864; // largeur utile (A4, marges 1,8 cm) en DXA
const C = { bleu: "1F3864", bleu2: "2E5597", gris: "595959", clair: "DCE6F1", tresclair: "F2F5FA", bord: "8EA9C8", ligne: "B4C6E7", fond: "EEF3FA" };
const NB = " ";

// ---------- typographie française ----------
function fr(s) {
  if (s == null) return "";
  return String(s)
    .replace(/'/g, "’")
    .replace(/ ([:;!?»])/g, NB + "$1")
    .replace(/« /g, "«" + NB)
    .replace(/(\d) (?=\d{3}(?!\d))/g, "$1" + NB)
    .replace(/(\d) (?=(%|[A-Za-zµΩ°][A-Za-z³²/·]{0,3})(?![A-Za-z]))/g, "$1" + NB)
    .replace(/ (—|–) /g, NB + "$1 ")
    .replace(/ ([=<>≤≥×±≈]) /g, NB + "$1" + NB)
    .replace(/(^|[\s(])([≤≥<>≈]) (?=\d)/g, "$1$2" + NB);
}
const lc1 = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
function date(iso, jour) {
  const [a, m, j] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  return (jour ? JOURS[d.getUTCDay()] + " " : "") + (j === 1 ? "1er" : j) + " " + MOIS[m - 1] + " " + a;
}

// ---------- briques ----------
const t = (text, o = {}) => new TextRun(Object.assign({ text: fr(text) }, o));
function para(content, o = {}) {
  const children = Array.isArray(content) ? content : [typeof content === "string" ? t(content, o.run || {}) : content];
  return new Paragraph({ children, alignment: o.align, spacing: o.spacing, style: o.style, keepNext: o.keepNext, keepLines: o.keepLines, indent: o.indent, border: o.border, shading: o.shading });
}
const h1 = (text, saut = true) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: saut, children: [t(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(text)] });
function puce(content, niveau = 0, o = {}) {
  const children = Array.isArray(content) ? content : [t(content, o.run || {})];
  return new Paragraph({ numbering: { reference: "puces", level: niveau }, children, spacing: { after: niveau ? 20 : 40 }, keepNext: o.keepNext });
}
// paragraphes de cellule
function cp(content, o = {}) {
  const children = Array.isArray(content) ? content : [t(content, { bold: o.bold, italics: o.italics, color: o.color, size: o.size })];
  return new Paragraph({ style: "Cellule", alignment: o.align, children, keepNext: o.keepNext, spacing: o.spacing });
}
const cpuce = (text, o = {}) => new Paragraph({ style: "Cellule", numbering: { reference: o.ref || "puces-t", level: 0 }, spacing: o.spacing, children: [t(text, { size: o.size, italics: o.italics })] });

const B = (sz = 4, col = C.bord) => ({ style: BorderStyle.SINGLE, size: sz, color: col });
const SANS = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const bordures = () => ({ top: B(6), bottom: B(6), left: B(6), right: B(6), insideHorizontal: B(4, C.ligne), insideVertical: B(4, C.ligne) });

function cell(content, o = {}) {
  const children = (Array.isArray(content) ? content : [content]).filter(Boolean).map((c) => (typeof c === "string" ? cp(c, o) : c));
  const opts = {
    width: { size: o.w, type: WidthType.DXA },
    verticalAlign: o.v || VerticalAlign.TOP,
    margins: { top: o.mt != null ? o.mt : 45, bottom: o.mb != null ? o.mb : 45, left: 90, right: 90 },
    children: children.length ? children : [cp("")],
  };
  if (o.span) opts.columnSpan = o.span;
  if (o.fill) opts.shading = { fill: o.fill, type: ShadingType.CLEAR, color: "auto" };
  if (o.borders) opts.borders = o.borders;
  return new TableCell(opts);
}
const row = (cells, o = {}) => new TableRow({ children: cells, tableHeader: !!o.entete, cantSplit: o.cantSplit !== false, height: o.h ? { value: o.h, rule: "atLeast" } : undefined });
function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: o.borders || bordures(),
    rows,
  });
}
// ligne d'en-tête de tableau
const entete = (titres, widths, aligns = []) =>
  row(titres.map((x, i) => cell(cp(x, { bold: true, size: 17, color: C.bleu, align: aligns[i] }), { w: widths[i], fill: C.clair, v: VerticalAlign.CENTER })), { entete: true });
// petit espace après un tableau
const apres = (sz = 120) => new Paragraph({ spacing: { before: 0, after: sz }, children: [] });
// encadré (filet bleu à gauche)
const encadre = (content, o = {}) => new Paragraph({
  children: Array.isArray(content) ? content : [t(content, { italics: o.italics !== false, color: C.bleu })],
  spacing: { before: 60, after: 160, line: 276 },
  indent: { left: 160, right: 160 },
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: C.bleu2, space: 10 } },
  shading: { type: ShadingType.CLEAR, fill: C.fond, color: "auto" },
});

// largeurs de colonnes d'après la longueur des contenus
function largeurs(cols, lignes, total = W) {
  const n = cols.length;
  const m = cols.map((c, j) => {
    const L = [String(c).length + 2].concat(lignes.map((l) => Math.min(String(l[j] == null ? "" : l[j]).length, 90)));
    const moy = L.reduce((a, b) => a + b, 0) / L.length;
    return Math.max(Math.max(...L) * 0.5 + moy * 0.5, 7);
  });
  const p = m.map((x) => Math.pow(x, 0.85));
  const s = p.reduce((a, b) => a + b, 0);
  let w = p.map((x) => Math.max(Math.round((x / s) * total), n > 3 ? 850 : 1200));
  const d = total - w.reduce((a, b) => a + b, 0);
  const iMax = w.indexOf(Math.max(...w));
  w[iMax] += d;
  return w;
}

// ---------- données utiles ----------
const DOCS = DATA.docs_communs;
function docsDu(p) {
  return DOCS.map((d) => {
    let contenu = d.spec ? (p.spec[d.spec] || []).slice() : (d.contenu || []).slice();
    if (d.plus && p.plus && p.plus[d.plus]) contenu = contenu.concat(p.plus[d.plus]);
    return Object.assign({}, d, { contenu });
  });
}
const PHASE = { conception: "Conception (U61)", anticipation: "Anticipation (U61, pour U62)", realisation: "Réalisation (U62)" };
const OUTIL = { planning: "page « Planning »", mes: "page « Mise en service »", risques: "page « Risques »" };
const unite = (u) => (u === "u61" ? "U61" : "U62");
const nomFichier = (p) => `Dossier projet ${p.id} - ${p.court.replace(/[\\/:*?"<>|]/g, "").replace(/'/g, "’")}.docx`;

// ---------- en-tête et pied de page ----------
function enTete(p) {
  const logo = new ImageRun({ type: "png", data: LOGO, transformation: { width: 64, height: 51 } });
  const sb = { top: SANS, left: SANS, right: SANS, bottom: B(8, C.bleu) };
  const w = [1250, 5814, 2800];
  return new Header({
    children: [
      table(w, [row([
        cell(new Paragraph({ children: [logo], spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } }), { w: w[0], v: VerticalAlign.CENTER, borders: sb, mt: 0, mb: 60 }),
        cell([
          cp("Ministère de l'Éducation nationale", { size: 15, color: C.gris }),
          cp("Ministère de l'Enseignement supérieur et de la Recherche", { size: 15, color: C.gris }),
          cp("Vice-rectorat de Polynésie française", { size: 15, bold: true, color: C.bleu }),
        ], { w: w[1], v: VerticalAlign.CENTER, borders: sb, mb: 60 }),
        cell([
          cp("BTS Électrotechnique", { size: 15, bold: true, color: C.bleu, align: AlignmentType.RIGHT }),
          cp(`Épreuve E6 — session ${DATA.session}`, { size: 15, color: C.gris, align: AlignmentType.RIGHT }),
          cp(`Dossier projet ${p.id}`, { size: 15, bold: true, color: C.bleu2, align: AlignmentType.RIGHT }),
        ], { w: w[2], v: VerticalAlign.CENTER, borders: sb, mb: 60 }),
      ], { cantSplit: true })], { borders: { top: SANS, bottom: SANS, left: SANS, right: SANS, insideHorizontal: SANS, insideVertical: SANS } }),
      new Paragraph({ spacing: { before: 0, after: 0, line: 120 }, children: [new TextRun({ text: "", size: 4 })] }),
    ],
  });
}
function piedDePage(p) {
  return new Footer({
    children: [new Paragraph({
      style: "Pied",
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.bord, space: 4 } },
      children: [
        t(`Lycée Tuianu Le Gayic — BTS Électrotechnique — Dossier projet ${p.id} : ${p.court}`),
        new TextRun({
          children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.NONE }), "Page ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES],
        }),
      ],
    })],
  });
}

// ---------- 1. fiche de présentation et de validation ----------
const CASE = (coche) => new TextRun({ text: coche ? "☒" : "☐", font: "Segoe UI Symbol", size: 20 });
function ficheValidation(p) {
  const sup = DATA.supports[p.support];
  const out = [];
  const w2 = [5932, 3932];
  out.push(table(w2, [
    row([cell(cp([t("Académie : ", { bold: true }), t("Polynésie française")]), { w: w2[0] }), cell(cp("BTS ÉLECTROTECHNIQUE", { bold: true, color: C.bleu, align: AlignmentType.RIGHT }), { w: w2[1] })]),
    row([cell(cp([t("Établissement : ", { bold: true }), t("Lycée Tuianu Le Gayic — Papara")]), { w: w2[0] }), cell(cp([t("Session : ", { bold: true }), t(DATA.session)], { align: AlignmentType.RIGHT }), { w: w2[1] })]),
    row([cell([
      new Paragraph({ style: "Cellule", tabStops: [{ type: TabStopType.LEFT, position: 1500 }], children: [t("Épreuve E6", { bold: true }), new TextRun({ children: [new Tab()] }), t("U61 : Conception – étude détaillée du projet")] }),
      new Paragraph({ style: "Cellule", tabStops: [{ type: TabStopType.LEFT, position: 1500 }], children: [new TextRun({ children: [new Tab()] }), t("U62 : Réalisation – mise en service du projet")] }),
    ], { w: W, span: 2 })]),
  ]));
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 40 }, children: [t("DOSSIER PROJET", { bold: true, size: 44, color: C.bleu, characterSpacing: 40 })] }));
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [t(`Projet ${p.id} — ${p.court}`, { bold: true, size: 26, color: C.bleu2 })] }));

  const L = 2650, V = W - L;
  const lab = (x) => cell(cp(x, { bold: true }), { w: L, fill: C.tresclair, v: VerticalAlign.CENTER });
  const lignes = [
    ["Équipe pédagogique", DATA.equipe],
    ["Titre", p.titre],
    ["Client", `${p.client} — ${p.lieu}`],
    ["Partenaires du projet", "Aucun partenaire industriel à ce jour (besoin client reconstitué par l'équipe pédagogique)"],
    ["Étudiants / Apprentis", "1 étudiant (projet individuel) — nom, prénom : ……………………………………………"],
    ["Montant estimé du projet", p.montant],
    ["Source de financement", p.financement],
    ["Réalisation au lycée", `${sup.nom} (laboratoire d'électrotechnique)`],
  ];
  const rows = lignes.map(([a, b]) => row([lab(a), cell(cp(b), { w: V, v: VerticalAlign.CENTER })]));
  rows.push(row([lab("Secteurs professionnels"), cell(DATA.secteurs.map((s) => cp([CASE(p.secteurs.includes(s)), t("  " + s, { bold: p.secteurs.includes(s) })])), { w: V })]));
  out.push(table([L, V], rows));
  out.push(apres(200));

  const w = [4932, 4932];
  out.push(table(w, [
    row([cell([cp("Pour le(s) partenaire(s) du projet :", { bold: true }), cp(" "), cp(" "), cp(" ")], { w: W, span: 2 })]),
    row([cell(cp([t("Le projet est :", { bold: true }), t("        "), CASE(false), t(" Accepté        "), CASE(false), t(" Accepté sous réserve        "), CASE(false), t(" Refusé")]), { w: W, span: 2, mt: 90, mb: 90 })]),
    row([cell([cp("Recommandations (en cas de refus ou de réserves) :", { bold: true }), cp(" "), cp(" "), cp(" "), cp(" "), cp(" ")], { w: W, span: 2 })]),
    row([
      cell([cp("Équipe enseignante", { bold: true }), cp("Olivier FLOHR — André COLLOTTE"), cp(" "), cp(" "), cp(" "), cp([t("Date : ", { bold: true }), t("…… / …… / ………")])], { w: w[0] }),
      cell([cp("Les IA-IPR :", { bold: true }), cp(" "), cp(" "), cp(" "), cp(" "), cp([t("Date : ", { bold: true }), t("…… / …… / ………")])], { w: w[1] }),
    ]),
  ]));
  return out;
}

// ---------- 2. définition de la demande ----------
function definition(p) {
  const sup = DATA.supports[p.support];
  const out = [h1("DÉFINITION DE LA DEMANDE")];
  out.push(encadre(p.pitch));
  out.push(para([t("Objectif du projet : ", { bold: true }), t(p.objectif)], { align: AlignmentType.JUSTIFIED }));
  out.push(h2("Contexte"));
  p.contexte.forEach((x) => out.push(para(x, { align: AlignmentType.JUSTIFIED })));
  out.push(h2("Le client demande"));
  out.push(puce([t("U61 – Conception, étude détaillée du projet", { bold: true })], 0, { keepNext: true }));
  p.demande_u61.forEach((x) => out.push(puce(x, 1)));
  out.push(puce([t("U62 – Réalisation, mise en service du projet", { bold: true })], 0, { keepNext: true }));
  p.demande_u62.forEach((x) => out.push(puce(x, 1)));
  out.push(h2("Réalisation au lycée"));
  out.push(para([t("Support du laboratoire : ", { bold: true }), t(`${sup.nom}. ${sup.desc}`)], { align: AlignmentType.JUSTIFIED }));
  out.push(para(p.support_detail, { align: AlignmentType.JUSTIFIED }));
  out.push(h3("Matériel à prévoir pour la réalisation"));
  p.materiel.forEach((x) => out.push(puce(x)));
  return out;
}

// ---------- 3. cahier des charges ----------
function cahierDesCharges(p) {
  const out = [h1("CAHIER DES CHARGES")];
  out.push(h2("1. Exigences du client"));
  const we = [700, 2250, 3650, 3264];
  out.push(table(we, [entete(["Réf.", "Exigence", "Critère", "Niveau attendu"], we)].concat(p.exigences.map((e) => row([
    cell(cp(e.id, { bold: true, color: C.bleu2 }), { w: we[0] }),
    cell(cp(e.titre, { bold: true }), { w: we[1] }),
    cell(cp(e.critere), { w: we[2] }),
    cell(cp(e.niveau), { w: we[3] }),
  ])))));
  out.push(h2("2. Données d'entrée"));
  p.donnees.forEach((tb) => {
    out.push(h3(tb.titre));
    const wd = largeurs(tb.cols, tb.lignes);
    out.push(table(wd, [entete(tb.cols, wd)].concat(tb.lignes.map((l) => row(l.map((x, j) => cell(cp(x, { bold: j === 0 }), { w: wd[j] })))))));
  });
  out.push(h2("3. Contraintes"));
  p.contraintes.forEach((x) => out.push(puce(x)));
  out.push(h2("4. Normes et textes de référence"));
  p.normes.forEach((x) => out.push(puce(x)));
  out.push(h2("5. Partie en langue anglaise"));
  out.push(para(p.anglais, { align: AlignmentType.JUSTIFIED }));
  out.push(h2("6. Réception : vérifications attendues par le client"));
  out.push(para("Chaque exigence sera vérifiée avec le client à la réception. Ces vérifications sont à reprendre et à compléter dans le protocole de mise en service (dossier 2).", { run: { italics: true, color: C.gris }, keepNext: true }));
  const ordre = (id) => parseInt(String(id || "EX99").replace(/\D/g, ""), 10);
  const essais = p.essais.filter((e) => e.ex).slice().sort((a, b) => ordre(a.ex) - ordre(b.ex));
  const wr = [700, 3964, 2300, 2900];
  out.push(table(wr, [entete(["Exig.", "Essai ou vérification", "Moyen", "Critère d'acceptation"], wr)].concat(essais.map((e) => row([
    cell(cp(e.ex, { bold: true, color: C.bleu2 }), { w: wr[0] }),
    cell(cp(e.op), { w: wr[1] }),
    cell(cp(e.moyen), { w: wr[2] }),
    cell(cp(e.critere), { w: wr[3] }),
  ])))));
  return out;
}

// ---------- 4. contrats de tâches individuelles ----------
// ressources : dossiers 1, 2, 3 et outils côte à côte (4 colonnes), dans une seule ligne insécable
function ressources(liste, titreOutils, outils) {
  // largeurs équilibrées d'après la quantité de texte de chaque colonne (hauteurs voisines)
  const cols = liste.concat([[titreOutils, outils]]);
  const poids = cols.map(([titre, items]) => Math.pow(items.reduce((a, x) => a + x.length + 25, titre.length), 0.75));
  const sp = poids.reduce((a, b) => a + b, 0);
  const w = poids.map((x) => Math.max(1800, Math.round((x / sp) * W)));
  w[w.indexOf(Math.max(...w))] += W - w.reduce((a, b) => a + b, 0);
  const titreCase = (x) => new Paragraph({ style: "Cellule", spacing: { before: 0, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.ligne, space: 2 } }, children: [t(x, { bold: true, color: C.bleu, size: 16 })] });
  const colonnes = cols.map(([titre, items]) =>
    [titreCase(titre)].concat(items.map((x) => cpuce(x, { size: 16, spacing: { after: 20 } }))));
  return [
    para([t("Ressources à disposition", { bold: true, color: C.bleu, size: 19 })], { keepNext: true, spacing: { before: 100, after: 40 } }),
    table(w, [row(colonnes.map((c, i) => cell(c, { w: w[i] })))]),
  ];
}
function contrat(p, u) {
  const G = DATA.grilles[u];
  const comps = G.competences.map((c) => c.id);
  const [titre, sous] = u === "u61"
    ? ["CONTRAT DE TÂCHES INDIVIDUELLES U61 – CONCEPTION", "ÉTUDE DÉTAILLÉE DU PROJET"]
    : ["CONTRAT DE TÂCHES INDIVIDUELLES U62 – RÉALISATION", "MISE EN SERVICE DU PROJET"];
  const out = [h1(titre)];
  out.push(para([t(sous, { bold: true, color: C.bleu2, size: 22 }), t(`   —   projet ${p.id} : ${p.court}`, { color: C.gris, size: 19 })], { spacing: { before: 0, after: 100 } }));
  const wi = [2700, 2700, 4464];
  out.push(table(wi, [row([
    cell(cp([t("Nom : ", { bold: true })]), { w: wi[0], mt: 90, mb: 90 }),
    cell(cp([t("Prénom : ", { bold: true })]), { w: wi[1], mt: 90, mb: 90 }),
    cell(cp([t("Établissement : ", { bold: true }), t("Lycée Tuianu Le Gayic de Papara")]), { w: wi[2], mt: 90, mb: 90 }),
  ])]));
  out.push(apres(100));

  const wc = u === "u61" ? 860 : 700, wd = 1000;
  const widths = [W - wd - wc * comps.length, wd].concat(comps.map(() => wc));
  const centre = AlignmentType.CENTER;
  const rows = [entete(["Tâches individuelles proposées (1)", "Durée (h)"].concat(comps), widths, [undefined, centre].concat(comps.map(() => centre)))];
  let total = 0;
  p[u].forEach((g) => {
    rows.push(row([cell(cp([t(`${g.t} : ${g.titre}`, { bold: true, color: C.bleu })], { keepNext: true }), { w: W, span: widths.length, fill: C.tresclair, mt: 30, mb: 30 })]));
    g.taches.forEach((x) => {
      total += x.h;
      const contenu = [cpuce(x.txt, { ref: "taches", size: 17, spacing: { after: 0 } })];
      if (x.plus) contenu.push(cp(x.plus, { italics: true, color: C.gris, size: 16 }));
      const m = { mt: 30, mb: 30 };
      rows.push(row([
        cell(contenu, Object.assign({ w: widths[0] }, m)),
        cell(cp(String(x.h), { align: centre, bold: true }), Object.assign({ w: wd, v: VerticalAlign.CENTER }, m)),
      ].concat(comps.map((c) => cell(cp(x.c.includes(c) ? "X" : "", { align: centre, bold: true, color: C.bleu }), Object.assign({ w: wc, v: VerticalAlign.CENTER }, m))))));
    });
  });
  rows.push(row([
    cell(cp("Total", { bold: true, align: AlignmentType.RIGHT }), { w: widths[0], fill: C.clair }),
    cell(cp(`${total} h`, { bold: true, align: centre }), { w: wd, fill: C.clair }),
  ].concat(comps.map(() => cell(cp(""), { w: wc, fill: C.clair })))));
  out.push(table(widths, rows));

  out.push(para([t("(1) Compétences mobilisées", { bold: true, color: C.bleu, size: 19 })], { keepNext: true, spacing: { before: 120, after: 20 } }));
  G.competences.forEach((c) => out.push(new Paragraph({ numbering: { reference: "puces", level: 0 }, spacing: { after: 0 }, children: [t(`${c.id} : `, { bold: true, size: 18 }), t(lc1(c.lib), { size: 18 })] })));

  const D = {};
  DATA.dossiers.forEach((d) => (D[d.id] = d));
  const plus = (id) => (p.fourni_plus || {})[id] || [];
  const nomD = (d) => `Dossier ${d.num} (${lc1(d.titre)})`;
  if (u === "u61") {
    out.push(...ressources(DATA.dossiers.map((d) => [nomD(d), d.fourni.concat(plus(d.id))]),
      "Outils numériques spécifiques du métier", DATA.outils_communs.concat(p.outils_plus || [])));
  } else {
    out.push(...ressources([
      [nomD(D.d1), ["Le dossier de conception établi en U61 : schémas, plans, nomenclature, programme, fiches de réglage et de paramétrage, planning, modes opératoires", "Le dossier technique du système support du labo"].concat(plus("d1").filter((x) => /programme|paramètre|dossier technique/i.test(x)))],
      [nomD(D.d2), ["Le protocole de mise en service, les fiches d'autocontrôle et la notice préparés en U61"].concat(D.d2.fourni, plus("d2"))],
      [nomD(D.d3), ["L'analyse des risques et les fiches de mise en sécurité préparées en U61"].concat(D.d3.fourni, plus("d3"))],
    ], "Outils numériques et moyens de contrôle", (p.outils_plus || []).concat([
      "Logiciel de schéma électrique du labo (mise à jour du DOE)",
      "Appareils de mesure et de contrôle du labo, choisis dans le protocole de mise en service",
    ])));
  }
  return out;
}

// ---------- 5. dossiers 1, 2, 3 ----------
function dossiers(p) {
  const out = [h1("DOSSIERS 1, 2 ET 3 À CONSTITUER")];
  out.push(para("Le projet se construit en trois dossiers, comme sur un chantier. Chaque document est daté, tenu à jour jusqu'à la revue finale et déposé sur le site SI Papara (lien vers le fichier) ; la dernière colonne indique les critères des grilles d'évaluation qu'il permet de prouver.", { align: AlignmentType.JUSTIFIED }));
  out.push(para([t("Phases : ", { bold: true }), t("conception = pendant U61 ; anticipation = préparé pendant U61 pour la réalisation (planning, protocole de mise en service, analyse des risques…) ; réalisation = complété pendant U62.")], { run: {}, align: AlignmentType.JUSTIFIED }));
  const docs = docsDu(p);
  const w = [2450, 1250, 4964, 1200];
  DATA.dossiers.forEach((d) => {
    out.push(h2(`Dossier ${d.num} — ${d.titre}`));
    out.push(para(d.role, { run: { italics: true, color: C.gris }, keepNext: true }));
    const rows = [entete(["Document à produire", "Phase", "Contenu attendu", "Critères"], w)];
    docs.filter((x) => x.dossier === d.id).forEach((x) => {
      const contenu = x.contenu.map((c) => cpuce(c, { size: 17 }));
      if (x.outil) contenu.push(cp(`Outil en ligne : ${OUTIL[x.outil]} du site SI Papara`, { italics: true, color: C.bleu2, size: 16 }));
      rows.push(row([
        cell(cp(x.titre, { bold: true }), { w: w[0] }),
        cell(cp(PHASE[x.phase], { size: 16 }), { w: w[1] }),
        cell(contenu, { w: w[2] }),
        cell(cp(x.crit.join(", "), { size: 16, color: C.bleu2 }), { w: w[3] }),
      ]));
    });
    out.push(table(w, rows));
  });
  return out;
}

// ---------- 6. jalons ----------
function jalons(p) {
  const out = [h1("JALONS ET REVUES DE PROJET")];
  const wp = [5864, 2000, 2000];
  out.push(h2("Périodes"));
  out.push(table(wp, [entete(["Période", "Du", "Au"], wp)].concat(DATA.periodes.map((x) => row([
    cell(cp(x.titre, { bold: true }), { w: wp[0] }), cell(cp(date(x.debut)), { w: wp[1] }), cell(cp(date(x.fin)), { w: wp[2] }),
  ])))));
  out.push(h2("Revues de projet"));
  const wj = [700, 2050, 2800, 4314];
  out.push(table(wj, [entete(["Jalon", "Semaine du", "Revue", "Ce qui est attendu"], wj)].concat(DATA.jalons.map((j) => row([
    cell(cp(j.id, { bold: true, color: C.bleu2 }), { w: wj[0] }),
    cell(cp(date(j.date, true)), { w: wj[1] }),
    cell(cp(j.titre, { bold: true }), { w: wj[2] }),
    cell(cp(j.detail), { w: wj[3] }),
  ])))));
  out.push(apres(60));
  out.push(para([t("Vacances scolaires : ", { bold: true }), t(DATA.vacances.map((v) => `${lc1(v[2])} du ${date(v[0])} au ${date(v[1])}`).join(" ; ") + ".")], { run: {}, align: AlignmentType.JUSTIFIED }));
  out.push(para("Dates prévisionnelles, susceptibles d'être ajustées par l'équipe pédagogique.", { run: { italics: true, color: C.gris } }));
  out.push(h2("Suivi du projet en ligne"));
  out.push(para([
    t("Page « Projets BTS 2 » du site SI Papara : "),
    new ExternalHyperlink({ link: SITE, children: [new TextRun({ text: "si.ka-ilei.com/entrainements/bts-projets.html", style: "Hyperlink", color: C.bleu2, underline: {} })] }),
    t(". L'étudiant y retrouve ce dossier, indique l'état de chaque document des dossiers 1, 2 et 3 avec le lien vers son fichier, construit son planning, son protocole de mise en service et son analyse des risques ; les validations et les remarques du professeur y apparaissent."),
  ], { align: AlignmentType.JUSTIFIED }));
  return out;
}

// ---------- 7. grilles ----------
function grilles(p) {
  const out = [h1("ÉVALUATION — GRILLES CCF U61 ET U62")];
  out.push(para("Chaque compétence est positionnée sur l'un des quatre niveaux de maîtrise ci-dessous, au vu des critères de la grille officielle. Les tableaux qui suivent indiquent, pour chaque critère, le document des dossiers 1, 2, 3 qui le prouve ou le moment où il est observé.", { align: AlignmentType.JUSTIFIED }));
  const wn = [800, 7864, 1200];
  out.push(table(wn, [entete(["Niveau", "Signification", "Valeur"], wn, [undefined, undefined, AlignmentType.CENTER])].concat(DATA.grilles.niveaux.map((n) => row([
    cell(cp(n.code, { bold: true, color: C.bleu2 }), { w: wn[0] }),
    cell([cp(n.lib, { bold: true }), cp(n.desc, { size: 16, color: C.gris })], { w: wn[1] }),
    cell(cp(`${n.pct} %`, { bold: true, align: AlignmentType.CENTER }), { w: wn[2], v: VerticalAlign.CENTER }),
  ])))));
  out.push(apres(60));
  out.push(para([t("Note d'une unité, sur 20 : ", { bold: true }), t("20 × la somme, pour chaque compétence, de son poids × la valeur du niveau atteint. Exemple en U61 : C7 au niveau N3, C9 au niveau N4, C11 au niveau N2 → 20 × (0,30 × 0,75 + 0,35 × 1 + 0,35 × 0,40) = 14,3 / 20.")], { align: AlignmentType.JUSTIFIED }));
  const docs = docsDu(p);
  const DN = {}; DATA.dossiers.forEach((d) => (DN[d.id] = d.num));
  const w = [880, 4600, 4384];
  ["u61", "u62"].forEach((u, i) => {
    const G = DATA.grilles[u];
    const h = h2(`${unite(u)} — ${G.titre} (coefficient ${G.coef})`);
    out.push(h);
    G.organisation.forEach((x) => out.push(puce(x)));
    out.push(apres(60));
    const rows = [entete(["Critère", "Critère d'évaluation (grille officielle)", "Où le critère est prouvé"], w)];
    G.competences.forEach((c) => {
      rows.push(row([cell(cp([t(`${c.id} — ${c.lib}`, { bold: true, color: C.bleu }), t(`   poids ${c.poids} % · évaluée par : ${c.evalue}`, { color: C.gris, size: 16 })], { keepNext: true }), { w: W, span: 3, fill: C.tresclair })]));
      c.criteres.forEach((k) => {
        const preuves = docs.filter((d) => d.crit.includes(k.id)).map((d) => cpuce(`D${DN[d.dossier]} · ${d.titre}`, { size: 16 }));
        if (!preuves.length && DATA.observes[k.id]) preuves.push(cp(`Observé pendant la réalisation : ${DATA.observes[k.id]}`, { italics: true, size: 16 }));
        const crit = [cp(k.txt)];
        if (k.par) crit.push(cp(`évalué par : ${k.par}`, { italics: true, color: C.gris, size: 15 }));
        rows.push(row([cell(cp(k.id, { bold: true, color: C.bleu2 }), { w: w[0] }), cell(crit, { w: w[1] }), cell(preuves, { w: w[2] })]));
      });
    });
    out.push(table(w, rows));
  });
  return out;
}

// ---------- document ----------
function dossier(p) {
  const children = [].concat(
    ficheValidation(p),
    definition(p),
    cahierDesCharges(p),
    contrat(p, "u61"),
    contrat(p, "u62"),
    dossiers(p),
    jalons(p),
    grilles(p),
  );
  return new Document({
    title: `Dossier projet ${p.id} — ${p.court}`,
    subject: `BTS Électrotechnique — épreuve E6 (U61 et U62) — session ${DATA.session}`,
    creator: "Équipe pédagogique BTS Électrotechnique — Lycée Tuianu Le Gayic",
    description: p.titre,
    keywords: "BTS électrotechnique, projet, U61, U62, dossier projet",
    styles: {
      default: {
        document: { run: { font: "Arial", size: 20, language: { value: "fr-FR" } }, paragraph: { spacing: { after: 80, line: 264, lineRule: LineRuleType.AUTO } } },
      },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 27, bold: true, color: C.bleu, font: "Arial" },
          paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.bleu, space: 4 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 23, bold: true, color: C.bleu2, font: "Arial" },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 20, bold: true, color: C.bleu, font: "Arial" },
          paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2, keepNext: true } },
        { id: "Cellule", name: "Cellule", basedOn: "Normal", quickFormat: true,
          run: { size: 18 }, paragraph: { spacing: { before: 0, after: 20, line: 240, lineRule: LineRuleType.AUTO } } },
        { id: "Pied", name: "Pied de page dossier", basedOn: "Normal", quickFormat: true,
          run: { size: 15, color: C.gris }, paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } } },
      ],
    },
    numbering: {
      config: [
        { reference: "puces", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 820, hanging: 260 } } } },
        ] },
        { reference: "puces-t", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 200, hanging: 170 } } } },
        ] },
        { reference: "taches", levels: [
          { level: 0, format: LevelFormat.BULLET, text: "●", alignment: AlignmentType.LEFT, style: { run: { size: 14, color: C.bleu2 }, paragraph: { indent: { left: 260, hanging: 220 } } } },
        ] },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1500, bottom: 1100, left: 1021, right: 1021, header: 500, footer: 500 } } },
      headers: { default: enTete(p) },
      footers: { default: piedDePage(p) },
      children,
    }],
  });
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const liste = DATA.projets.filter((p) => !SEUL || p.id === SEUL);
  for (const p of liste) {
    const buf = await Packer.toBuffer(dossier(p));
    const f = path.join(OUTDIR, nomFichier(p));
    fs.writeFileSync(f, buf);
    console.log("✓", path.basename(f), Math.round(buf.length / 1024) + " ko");
  }
})().catch((e) => { console.error(e); process.exit(1); });
