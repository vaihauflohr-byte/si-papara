// Parcours d'entraînement BTS 2 — documents Word de l'étape ouverte (étape 1) :
//   fiche de l'étudiant, un dossier de visite par cas, corrigé du professeur.
// usage : node entrainement.js out/entrainement.json dossier-sortie logo.png
// les figures sont lues dans le dossier du json : existant<num>.png
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, WidthType, ShadingType, BorderStyle, VerticalAlign, LevelFormat, PageNumber,
  PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  TableLayoutType, HeadingLevel, LineRuleType,
} = require("docx");

const DATA = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const DIR_IMG = path.dirname(path.resolve(process.argv[2]));
const OUTDIR = process.argv[3];
const LOGO = fs.readFileSync(process.argv[4]);

const W = 9864;
const C = { bleu: "1F3864", bleu2: "2E5597", gris: "595959", clair: "DCE6F1", tresclair: "F2F5FA", bord: "8EA9C8", ligne: "B4C6E7", fond: "EEF3FA",
  rouge: "C00000", rougeClair: "FDE4E1", orange: "8A5A00", orangeClair: "FFF2D2", vert: "146C43", vertClair: "DFF2E7" };
const NB = " ";
const E1 = DATA.etapes.find((e) => e.id === "s1");
const P1 = DATA.etape1;

// ---------- typographie française ----------
function fr(s) {
  if (s == null) return "";
  return String(s)
    .replace(/'/g, "’")
    .replace(/ ([:;!?»])/g, NB + "$1")
    .replace(/« /g, "«" + NB)
    .replace(/(\d) (?=\d{3}(?!\d))/g, "$1" + NB)
    .replace(/(\d) (?=(%|[A-Za-zµΩ°][A-Za-z³²/·]{0,5})(?![A-Za-z]))/g, "$1" + NB)
    .replace(/ (—|–) /g, NB + "$1 ")
    .replace(/ ([=<>≤≥×±≈]) /g, NB + "$1" + NB)
    .replace(/(^|[\s(])([≤≥<>≈]) (?=\d)/g, "$1$2" + NB);
}
const maj1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const min1 = (s) => (/^.[a-zàâçéèêëîïôûùüÿœ]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);   // « TGBT » reste en capitales

// ---------- briques ----------
const t = (text, o = {}) => new TextRun(Object.assign({ text: fr(text) }, o));
function para(content, o = {}) {
  const children = Array.isArray(content) ? content : [typeof content === "string" ? t(content, o.run || {}) : content];
  return new Paragraph({ children, alignment: o.align, spacing: o.spacing, keepNext: o.keepNext, indent: o.indent });
}
const h1 = (text, saut = true) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: saut, children: [t(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(text)] });
function puce(content, niveau = 0, o = {}) {
  const children = Array.isArray(content) ? content : [t(content, o.run || {})];
  return new Paragraph({ numbering: { reference: "puces", level: niveau }, children, spacing: { after: niveau ? 20 : 40 }, keepNext: o.keepNext });
}
const numero = (content, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, children: Array.isArray(content) ? content : [t(content)], spacing: { after: 50 } });
function cp(content, o = {}) {
  const children = Array.isArray(content) ? content : [t(content, { bold: o.bold, italics: o.italics, color: o.color, size: o.size })];
  return new Paragraph({ style: "Cellule", alignment: o.align, children, keepNext: o.keepNext, spacing: o.spacing });
}
const cpuce = (text, o = {}) => new Paragraph({ style: "Cellule", numbering: { reference: "puces-t", level: 0 }, children: [t(text, { size: o.size, italics: o.italics, color: o.color, bold: o.bold })] });
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
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, borders: o.borders || bordures(), rows });
}
const entete = (titres, widths, aligns = []) =>
  row(titres.map((x, i) => cell(cp(x, { bold: true, size: 17, color: C.bleu, align: aligns[i] }), { w: widths[i], fill: C.clair, v: VerticalAlign.CENTER })), { entete: true });
const apres = (sz = 120) => new Paragraph({ spacing: { before: 0, after: sz }, children: [] });
const encadre = (content, o = {}) => new Paragraph({
  children: Array.isArray(content) ? content : [t(content, { italics: o.italics !== false, color: o.color || C.bleu })],
  spacing: { before: 60, after: 160, line: 276 }, indent: { left: 160, right: 160 },
  border: { left: { style: BorderStyle.SINGLE, size: 24, color: o.trait || C.bleu2, space: 10 } },
  shading: { type: ShadingType.CLEAR, fill: o.fond || C.fond, color: "auto" },
  keepNext: o.keepNext,
});
function largeurs(cols, lignes, total = W) {
  const n = cols.length;
  const m = cols.map((c, j) => {
    const L = [String(c).length + 2].concat(lignes.map((l) => Math.min(String(l[j] == null ? "" : l[j]).length, 90)));
    const moy = L.reduce((a, b) => a + b, 0) / L.length;
    return Math.max(Math.max(...L) * 0.5 + moy * 0.5, 7);
  });
  const p = m.map((x) => Math.pow(x, 0.85));
  const s = p.reduce((a, b) => a + b, 0);
  const w = p.map((x, j) => Math.max(Math.round((x / s) * total), n > 3 ? 850 : 1200, String(cols[j]).length * 105 + 200));
  w[w.indexOf(Math.max(...w))] += total - w.reduce((a, b) => a + b, 0);
  return w;
}
function tableDonnees(tb) {
  const w = largeurs(tb.cols, tb.lignes);
  return table(w, [entete(tb.cols, w)].concat(tb.lignes.map((l) => row(l.map((x, i) => cell(cp(x, { bold: i === 0 }), { w: w[i] }))))));
}
const CASE = () => new TextRun({ text: "☐", font: "Segoe UI Symbol", size: 18 });
function dimPng(buf) { return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; }
function figure(fichier, legende) {
  const f = path.join(DIR_IMG, fichier);
  if (!fs.existsSync(f)) return [];
  const img = fs.readFileSync(f), d = dimPng(img), largeur = 640;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 40 }, children: [new ImageRun({ type: "png", data: img, transformation: { width: largeur, height: Math.round((largeur * d.h) / d.w) } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [t(legende, { italics: true, size: 17, color: C.gris })] }),
  ];
}
const nomFichier = (s) => s.replace(/[\\/:*?"<>|]/g, "") + ".docx";

// ---------- en-tête et pied de page ----------
function enTete(droite) {
  const logo = new ImageRun({ type: "png", data: LOGO, transformation: { width: 64, height: 51 } });
  const sb = { top: SANS, left: SANS, right: SANS, bottom: B(8, C.bleu) };
  const w = [1250, 5414, 3200];
  return new Header({ children: [
    table(w, [row([
      cell(new Paragraph({ children: [logo], spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } }), { w: w[0], v: VerticalAlign.CENTER, borders: sb, mt: 0, mb: 60 }),
      cell([
        cp("Ministère de l'Éducation nationale", { size: 15, color: C.gris }),
        cp("Ministère de l'Enseignement supérieur et de la Recherche", { size: 15, color: C.gris }),
        cp("Vice-rectorat de Polynésie française", { size: 15, bold: true, color: C.bleu }),
      ], { w: w[1], v: VerticalAlign.CENTER, borders: sb, mb: 60 }),
      cell([
        cp("BTS Électrotechnique", { size: 15, bold: true, color: C.bleu, align: AlignmentType.RIGHT }),
        cp("Entraînement aux projets U61-U62", { size: 15, color: C.gris, align: AlignmentType.RIGHT }),
        cp(droite, { size: 15, bold: true, color: C.bleu2, align: AlignmentType.RIGHT }),
      ], { w: w[2], v: VerticalAlign.CENTER, borders: sb, mb: 60 }),
    ])], { borders: { top: SANS, bottom: SANS, left: SANS, right: SANS, insideHorizontal: SANS, insideVertical: SANS } }),
    new Paragraph({ spacing: { before: 0, after: 0, line: 120 }, children: [new TextRun({ text: "", size: 4 })] }),
  ] });
}
function piedDePage(texte) {
  return new Footer({ children: [new Paragraph({
    style: "Pied",
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.bord, space: 4 } },
    children: [
      t(`Lycée Tuianu Le Gayic — BTS Électrotechnique — ${texte}`),
      new TextRun({ children: [new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, relativeTo: PositionalTabRelativeTo.MARGIN, leader: PositionalTabLeader.NONE }), "Page ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES] }),
    ],
  })] });
}
function titre(sur, grand, sous) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 }, children: [t(sur, { bold: true, size: 20, color: C.bleu2, characterSpacing: 40 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t(grand, { bold: true, size: 36, color: C.bleu })] }),
    sous ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 220 }, children: [t(sous, { size: 22, color: C.gris })] }) : apres(160),
  ];
}
function document(enTeteDroite, pied, titreDoc, children) {
  return new Document({
    title: titreDoc,
    subject: "BTS Électrotechnique — parcours d'entraînement aux projets U61-U62",
    creator: "Équipe pédagogique BTS Électrotechnique — Lycée Tuianu Le Gayic",
    styles: {
      default: { document: { run: { font: "Arial", size: 20, language: { value: "fr-FR" } }, paragraph: { spacing: { after: 80, line: 264, lineRule: LineRuleType.AUTO } } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 27, bold: true, color: C.bleu, font: "Arial" },
          paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.bleu, space: 4 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, color: C.bleu2, font: "Arial" },
          paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 20, bold: true, color: C.bleu, font: "Arial" },
          paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2, keepNext: true } },
        { id: "Cellule", name: "Cellule", basedOn: "Normal", quickFormat: true, run: { size: 18 }, paragraph: { spacing: { before: 0, after: 20, line: 240, lineRule: LineRuleType.AUTO } } },
        { id: "Pied", name: "Pied de page dossier", basedOn: "Normal", quickFormat: true, run: { size: 15, color: C.gris }, paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } } },
      ],
    },
    numbering: { config: [
      { reference: "puces", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 820, hanging: 260 } } } },
      ] },
      { reference: "puces-t", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 200, hanging: 170 } } } }] },
      { reference: "num-releve", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
      { reference: "num-cdc", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
    ] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1500, bottom: 1100, left: 1021, right: 1021, header: 500, footer: 500 } } },
      headers: { default: enTete(enTeteDroite) },
      footers: { default: piedDePage(pied) },
      children,
    }],
  });
}
const quand = (e) => e.quand.charAt(0).toUpperCase() + e.quand.slice(1);
const critTxt = (k) => `${k} (${DATA.crit[k].unite}) — ${DATA.crit[k].txt}`;

// =============================================================================================
// 1. Fiche de l'étudiant
// =============================================================================================
function ficheEtudiant() {
  const out = titre("PARCOURS D'ENTRAÎNEMENT AU PROJET", `Étape 1 — ${E1.titre}`, "Fiche de l'étudiant");
  // identification
  const wi = [3288, 3288, 3288];
  out.push(table(wi, [row([
    cell(cp([t("Nom : ", { bold: true }), t("……………………………", { color: C.gris })]), { w: wi[0] }),
    cell(cp([t("Cas : ", { bold: true }), t("E…  ", { color: C.gris }), t("Partie : ", { bold: true }), t("E…-…", { color: C.gris })]), { w: wi[1] }),
    cell(cp([t("Date : ", { bold: true }), t("……… / ……… / 2026", { color: C.gris })]), { w: wi[2] }),
  ], { h: 420 })]));
  out.push(apres(100));
  const L = 2500, V = W - L;
  const lab = (x) => cell(cp(x, { bold: true }), { w: L, fill: C.tresclair, v: VerticalAlign.CENTER });
  out.push(table([L, V], [
    row([lab("Dans le vrai projet"), cell(cp(E1.vrai), { w: V })]),
    row([lab("Tâches des contrats"), cell(cp(E1.taches), { w: V })]),
    row([lab("Quand, combien de temps"), cell(cp(`${maj1(E1.quand)} · ${E1.duree} (indicatif, au rythme de la classe)`), { w: V })]),
    row([lab("Critères des grilles"), cell(E1.crit.map((k) => cp(critTxt(k))).concat((E1.crit_option || []).length
      ? [cp([t("Facultatif, si tu animes le point d'avancement : ", { italics: true }), t(E1.crit_option.join(", "))], { spacing: { before: 60 } })] : []), { w: V })]),
  ]));

  out.push(h2("Le parcours d'ici décembre"));
  const wp = [700, 2600, 4364, 2200];
  out.push(table(wp, [entete(["Étape", "Ce qu'on travaille", "Dans le vrai projet", "Quand (indicatif)"], wp)].concat(DATA.etapes.map((e) => row([
    cell(cp(String(e.n), { bold: true, color: e.ouverte ? C.bleu2 : C.gris, align: AlignmentType.CENTER }), { w: wp[0], v: VerticalAlign.CENTER, fill: e.ouverte ? C.fond : undefined }),
    cell(cp(e.titre, { bold: e.ouverte }), { w: wp[1], fill: e.ouverte ? C.fond : undefined }),
    cell(cp(e.vrai, { size: 17 }), { w: wp[2], fill: e.ouverte ? C.fond : undefined }),
    cell(cp(quand(e) + (e.ouverte ? " · en cours" : ""), { size: 17, bold: e.ouverte }), { w: wp[3], fill: e.ouverte ? C.fond : undefined }),
  ])))));
  out.push(para("Les étapes suivantes sont préparées au fur et à mesure, au rythme de la classe.", { run: { italics: true, size: 17, color: C.gris } }));

  out.push(h2("Pourquoi cette étape"));
  P1.pourquoi.forEach((x) => out.push(para(x, { align: AlignmentType.JUSTIFIED })));
  out.push(h3("Ce que tu sauras faire"));
  P1.objectifs.forEach((x) => out.push(puce(x)));

  out.push(h2("Déroulé"));
  const wd = [2900, 1300, 5664];
  out.push(table(wd, [entete(["Temps", "Durée", "Ce que tu fais"], wd)].concat(P1.deroule.map((d) => row([
    cell(cp(d.titre, { bold: true }), { w: wd[0] }), cell(cp(d.duree), { w: wd[1] }), cell(cp(d.txt), { w: wd[2] }),
  ])))));

  out.push(h2("Méthode"));
  [["Avant la visite", P1.methode.avant], ["Pendant la visite", P1.methode.pendant], ["Après la visite", P1.methode.apres]].forEach(([tt, L2]) => {
    out.push(h3(tt));
    L2.forEach((x) => out.push(puce(x)));
  });
  out.push(h2("Gravité des constats"));
  const wg = [1300, 2100, 6464];
  const fondsG = { 1: C.rougeClair, 2: C.orangeClair, 3: C.vertClair }, coulG = { 1: C.rouge, 2: C.orange, 3: C.vert };
  out.push(table(wg, P1.gravites.map((g) => row([
    cell(cp(String(g.n), { bold: true, size: 24, color: coulG[g.n], align: AlignmentType.CENTER }), { w: wg[0], fill: fondsG[g.n], v: VerticalAlign.CENTER }),
    cell(cp(g.titre, { bold: true, color: coulG[g.n] }), { w: wg[1], fill: fondsG[g.n], v: VerticalAlign.CENTER }),
    cell(cp(g.txt), { w: wg[2], v: VerticalAlign.CENTER }),
  ]))));
  out.push(h2("Grille de lecture : ce que tu compares à la norme"));
  const wl = [2000, 5164, 2700];
  out.push(table(wl, [entete(P1.grille.cols, wl)].concat(P1.grille.lignes.map((l) => {
    if (!l[2]) return row([cell(cp(l[0], { bold: true }), { w: wl[0] }), cell(cp(l[1], { size: 17 }), { w: wl[1] + wl[2], span: 2 })]);
    return row([cell(cp(l[0], { bold: true }), { w: wl[0] }), cell(cp(l[1], { size: 17 }), { w: wl[1] }), cell(cp(l[2], { size: 17 }), { w: wl[2] })]);
  }))));
  out.push(para("R_A : résistance de la prise de terre ; IΔn : sensibilité du dispositif différentiel ; I_n : calibre de la protection ; I_z : courant admissible de la canalisation.", { run: { italics: true, size: 16, color: C.gris } }));
  if (P1.grille_note) out.push(para([t("À savoir : ", { bold: true, color: C.bleu2, size: 18 }), t(P1.grille_note, { size: 18 })], { align: AlignmentType.JUSTIFIED }));

  // check-list
  out.push(h1("CHECK-LIST DE VISITE"));
  out.push(para([t("Source : ", { bold: true }), t("V vu · M mesuré · D lu sur un document · C dit par le client. Une information sans source ne vaut rien dans l'étude.")]));
  const wc = [3700, 3100, 900, 900, 1264];
  const rowsC = [entete(["Point à relever", "Relevé (valeur, unité)", "Source", "Photo", "À vérifier"], wc, [null, null, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER])];
  P1.checklist.forEach((g) => {
    rowsC.push(row([cell(cp(g.theme, { bold: true, color: C.bleu }), { w: W, span: 5, fill: C.tresclair })]));
    g.points.forEach((p) => rowsC.push(row([cell(cp(p, { size: 17 }), { w: wc[0] }), cell(cp(""), { w: wc[1] }), cell(cp(""), { w: wc[2] }), cell(cp(""), { w: wc[3] }),
      cell(cp([CASE()], { align: AlignmentType.CENTER }), { w: wc[4], v: VerticalAlign.CENTER })], { h: 520 })));
  });
  rowsC.push(row([cell(cp("Points propres à mon domaine (onglet « Le cas » du site)", { bold: true, color: C.bleu }), { w: W, span: 5, fill: C.tresclair })]));
  for (let i = 0; i < 4; i++) rowsC.push(row([cell(cp(""), { w: wc[0] }), cell(cp(""), { w: wc[1] }), cell(cp(""), { w: wc[2] }), cell(cp(""), { w: wc[3] }), cell(cp([CASE()], { align: AlignmentType.CENTER }), { w: wc[4], v: VerticalAlign.CENTER })], { h: 520 }));
  out.push(table(wc, rowsC));

  // livrables et trames
  out.push(h2("Tes livrables"));
  E1.livrables.forEach((l, i) => {
    out.push(h3(`${i + 1}. ${l.titre}`));
    out.push(para([t("Dossier " + l.dossier.slice(1) + (l.option ? " · facultatif" : "") + " · critères : ", { bold: true, color: C.bleu2, size: 18 }), t(l.crit.join(", "), { size: 18 })]));
    l.contenu.forEach((x) => out.push(puce(x)));
  });
  out.push(para("Dépose chaque livrable sur le site, dans ta page Projets BTS 2 (onglet « Mon dépôt » ou fiche du livrable), et indique son état. Ton professeur le valide ou te demande de le reprendre.", { run: { italics: true, color: C.gris, size: 18 } }));

  out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: true, children: [t("Trame du rapport de relevé et de diagnostic")] }));
  P1.trame_releve.forEach((x) => out.push(numero(x, "num-releve")));
  out.push(h3("Modèle du tableau des constats"));
  const wk = [650, 3700, 2150, 950, 2414];
  out.push(table(wk, [entete(["N°", "Constat : où, quoi, photo", "Référence", "Gravité", "Action proposée"], wk)].concat(
    [1, 2, 3, 4, 5, 6].map((i) => row([cell(cp(`C${i}`, { color: C.gris }), { w: wk[0] }), cell(cp(""), { w: wk[1] }), cell(cp(""), { w: wk[2] }), cell(cp(""), { w: wk[3] }), cell(cp(""), { w: wk[4] })], { h: 640 })))));
  out.push(h2("Trame : questions au client et cahier des charges reformulé"));
  P1.trame_cdc.forEach((x) => out.push(numero(x, "num-cdc")));
  out.push(encadre("Un besoin n'est pas une solution. « Un truc qui coupe tout seul » devient : « l'éclairage du magasin est coupé en dehors des heures d'ouverture, sauf dérogation demandée par le responsable » — et la question : « quels circuits doivent rester alimentés ? »"));

  out.push(h2("Point d'avancement (si tu l'animes)"));
  out.push(para([t("Ordre du jour : ", { bold: true })]));
  P1.reunion.odj.forEach((x) => out.push(puce(x)));
  out.push(para(P1.reunion.cr));

  // positionnement
  out.push(h1("ME POSITIONNER"));
  out.push(para("Coche le niveau qui décrit le mieux ton travail sur cette étape, puis compare avec ton professeur. Mêmes niveaux que les grilles du CCF : N1 non acquis, N2 en cours d'acquisition, N3 partiellement acquis, N4 acquis et transférable.", { align: AlignmentType.JUSTIFIED }));
  const wn = [1612, 2063, 2063, 2063, 2063];
  const rowsN = [entete(["Critère", "N1", "N2", "N3", "N4"], wn, [null, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER])];
  E1.crit.forEach((k) => {
    const d = P1.descripteurs[k];
    rowsN.push(row([
      cell([cp(k, { bold: true, color: C.bleu }), cp(DATA.crit[k].txt, { size: 15, color: C.gris })], { w: wn[0] }),
      ...d.map((x, i) => cell([cp(x, { size: 15 }), cp([CASE(), t(" moi    ", { size: 15 }), CASE(), t(" prof", { size: 15 })], { spacing: { before: 60 } })], { w: wn[i + 1] })),
    ]));
  });
  out.push(table(wn, rowsN));
  out.push(apres(120));
  out.push(para([t("Ce que je dois améliorer : ", { bold: true }), t("…………………………………………………………………………………………………………………", { color: C.gris })]));
  out.push(para([t("…………………………………………………………………………………………………………………………………………", { color: C.gris })]));
  return document(`Étape 1 · fiche de l'étudiant`, `Parcours d'entraînement — étape 1 : fiche de l'étudiant`, `Étape 1 — ${E1.titre} — fiche de l'étudiant`, out);
}

// =============================================================================================
// 2. Dossier de visite d'un cas
// =============================================================================================
function dossierVisite(c) {
  const out = titre(`CAS D'ENTRAÎNEMENT ${c.id} · ${c.domaine.toUpperCase()}`, "DOSSIER DE VISITE", c.titre);
  const L = 2300, V = W - L;
  const lab = (x) => cell(cp(x, { bold: true }), { w: L, fill: C.tresclair, v: VerticalAlign.CENTER });
  out.push(table([L, V], [
    row([lab("Client"), cell(cp(c.client), { w: V })]),
    row([lab("Lieu"), cell(cp(c.lieu), { w: V })]),
    row([lab("Activité"), cell(cp(c.activite), { w: V })]),
    row([lab("Interlocuteur"), cell(cp(c.interlocuteur), { w: V })]),
    row([lab("Horaires"), cell(cp(c.horaires), { w: V })]),
    row([lab("Secteurs"), cell(c.secteurs.map((s) => cp(s)), { w: V })]),
  ]));
  out.push(encadre("Cas fictif mais réaliste, préparé pour l'entraînement. Tu « visites » le site avec ce dossier : ce que dit le client, ce qui a été vu et relevé, les documents remis, l'entretien. À toi de trier, de diagnostiquer et de préparer tes questions."));
  out.push(h2("Les parties du cas"));
  const wp = [2300, 4200, 3364];
  out.push(table(wp, [entete(["Partie", "Ce que tu relèves en priorité", "Vrai projet préparé"], wp)].concat(c.parties.map((p) => row([
    cell([cp(`${p.id}`, { bold: true, color: C.bleu2 }), cp(p.titre, { bold: true }), cp("Étudiant : ……………", { size: 16, color: C.gris })], { w: wp[0] }),
    cell(p.focus.map((f) => cpuce(f, { size: 17 })), { w: wp[1] }),
    cell(cp(maj1(p.prepare), { size: 17 }), { w: wp[2] }),
  ])))));
  out.push(para("Tu lis tout le dossier : ta partie dépend des autres (alimentation, place, coupures…).", { run: { italics: true, size: 17, color: C.gris } }));

  out.push(h1("CE QUE DIT LE CLIENT"));
  out.push(para(`${c.interlocuteur.split(",")[0]}, au premier rendez-vous :`, { run: { italics: true, color: C.gris } }));
  c.demande.forEach((x) => out.push(encadre(x, { italics: true, color: "262626", fond: "F7F7F7", trait: C.bord })));
  out.push(h2("L'existant"));
  c.existant.forEach((x) => out.push(para(x, { align: AlignmentType.JUSTIFIED })));
  out.push(...figure(c.figure.fichier.replace(".svg", ".png"), c.figure.titre));
  c.tables.forEach((tb) => { out.push(h3(tb.titre)); out.push(tableDonnees(tb)); });

  out.push(h1("CONSTATS DE LA VISITE", false));
  out.push(new Paragraph({ keepNext: true, spacing: { after: 100 }, children: [t("Chaque photo est décrite dans son constat : sur un vrai chantier, tu les numérotes dans ta check-list.", { italics: true, size: 17, color: C.gris })] }));
  const wv = [700, 1800, 6464, 900];
  out.push(table(wv, [entete(["N°", "Où", "Ce qui a été vu ou dit", "Photo"], wv, [null, null, null, AlignmentType.CENTER])].concat(c.constats.map((v) => row([
    cell(cp(v.id, { bold: true, color: C.bleu2 }), { w: wv[0] }), cell(cp(v.lieu), { w: wv[1] }), cell(cp(v.txt), { w: wv[2] }),
    cell(cp(v.photo ? `n° ${v.photo}` : "—", { align: AlignmentType.CENTER, color: C.gris }), { w: wv[3] }),
  ])))));
  out.push(h2("Documents remis par le client"));
  c.documents.forEach((tb) => { out.push(h3(tb.titre)); out.push(tableDonnees(tb)); });
  out.push(h2("Entretien avec le client"));
  const we = [4300, 5564];
  out.push(table(we, [entete(["Question posée pendant la visite", "Réponse du client"], we)].concat(c.entretien.map((e) => row([
    cell(cp(e.q, { bold: true }), { w: we[0] }), cell(cp(e.r, { italics: true }), { w: we[1] }),
  ])))));
  out.push(h2("À relever en plus dans ce domaine"));
  c.checklist_plus.forEach((x) => out.push(puce(x)));
  out.push(h3("Séance A : relevé au labo"));
  out.push(para(c.labo));
  return document(`Étape 1 · dossier de visite ${c.id}`, `Parcours d'entraînement — étape 1 : dossier de visite du cas ${c.id}`, `Étape 1 — dossier de visite — cas ${c.id} : ${c.court}`, out);
}

// =============================================================================================
// 3. Corrigé du professeur
// =============================================================================================
function corrige() {
  const out = titre("PARCOURS D'ENTRAÎNEMENT AU PROJET", "CORRIGÉ — Étape 1", `${E1.titre} · document réservé au professeur`);
  out.push(encadre("Ce corrigé n'est jamais publié sur le site (les fichiers du site sont publics). Il donne, pour chaque cas, les constats attendus avec leur référence et leur gravité, ce qui est conforme (pièges de lecture), les informations manquantes et les questions que l'on attend des étudiants. Les références normatives sont données pour orienter : vérifie la rédaction exacte dans l'édition en vigueur avant de la citer aux étudiants.", { italics: false }));
  out.push(h2("Ce qu'on attend, critère par critère"));
  const wn = [1612, 2063, 2063, 2063, 2063];
  const rowsN = [entete(["Critère", "N1", "N2", "N3", "N4"], wn, [null, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER])];
  E1.crit.forEach((k) => rowsN.push(row([
    cell([cp(k, { bold: true, color: C.bleu }), cp(DATA.crit[k].txt, { size: 15, color: C.gris })], { w: wn[0] }),
    ...P1.descripteurs[k].map((x, i) => cell(cp(x, { size: 15 }), { w: wn[i + 1] })),
  ])));
  out.push(table(wn, rowsN));
  out.push(h3("Points d'observation pendant les séances"));
  ["La source de chaque information est notée (vu, mesuré, document, client).",
    "Le relevé l'emporte sur les documents quand ils se contredisent (schémas anciens).",
    "Les dangers immédiats sont distingués et signalés par écrit le jour même, pas renvoyés au projet.",
    "Les besoins du client sont reformulés sans solution imposée ; chaque manque devient une question précise.",
    "Le point d'avancement est préparé (ordre du jour) et suivi d'un compte rendu court (C4.11 à C4.14)."].forEach((x) => out.push(puce(x)));

  const gTxt = { 1: "1 · danger", 2: "2 · NC", 3: "3 · amélio." };
  const fondsG = { 1: C.rougeClair, 2: C.orangeClair, 3: C.vertClair };
  DATA.cas.forEach((c) => {
    const k = c.corrige;
    out.push(h1(`CAS ${c.id} — ${c.court.toUpperCase()}`));
    out.push(para([t(c.client, { bold: true }), t(` · ${c.lieu} · parties : ${c.parties.map((p) => `${p.id} ${min1(p.titre)}`).join(" ; ")}`)], { run: { size: 18 } }));
    out.push(h2("Constats attendus"));
    const wk = [950, 2650, 2400, 900, 2164, 800];
    out.push(table(wk, [entete(["Réf.", "Constat", "Référence", "Gravité", "Action attendue", "Parties"], wk)].concat(k.constats.map((x) => row([
      cell(cp(x.v, { bold: true, color: C.bleu2, size: 16 }), { w: wk[0] }),
      cell(cp(x.quoi, { size: 16 }), { w: wk[1] }),
      cell(cp(x.ref, { size: 15, color: "404040" }), { w: wk[2] }),
      cell(cp(gTxt[x.g], { size: 15, bold: true, align: AlignmentType.CENTER }), { w: wk[3], fill: fondsG[x.g], v: VerticalAlign.CENTER }),
      cell(cp(x.action, { size: 16 }), { w: wk[4] }),
      cell(x.parties.map((p) => cp(p, { size: 15, align: AlignmentType.CENTER })), { w: wk[5] }),
    ])))));
    if (k.conforme && k.conforme.length) { out.push(h3("Conforme ou normal : à ne pas classer en non-conformité")); k.conforme.forEach((x) => out.push(puce(x))); }
    if (k.constats_cles && k.constats_cles.length) { out.push(h3("Points clés du diagnostic")); k.constats_cles.forEach((x) => out.push(puce(x))); }
    out.push(h3("Informations manquantes attendues")); k.manques.forEach((x) => out.push(puce(x)));
    out.push(h3("Questions attendues au client")); k.questions.forEach((x) => out.push(puce(x)));
    out.push(h3("Pièges")); k.pieges.forEach((x) => out.push(puce(x)));
  });
  return document("Étape 1 · corrigé du professeur", "Parcours d'entraînement — étape 1 : corrigé (réservé au professeur)", `Étape 1 — corrigé du professeur`, out);
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const docs = [[`Étape 1 - ${E1.titre} - fiche étudiant`, ficheEtudiant()]]
    .concat(DATA.cas.map((c) => [`Étape 1 - dossier de visite - cas ${c.id} - ${c.court}`, dossierVisite(c)]))
    .concat(DATA.cas.every((c) => c.corrige) ? [[`Étape 1 - corrigé professeur`, corrige()]] : []);
  for (const [nom, doc] of docs) {
    const buf = await Packer.toBuffer(doc);
    const f = path.join(OUTDIR, nomFichier(nom));
    fs.writeFileSync(f, buf);
    console.log("✓", path.basename(f), Math.round(buf.length / 1024) + " ko");
  }
})().catch((e) => { console.error(e); process.exit(1); });
