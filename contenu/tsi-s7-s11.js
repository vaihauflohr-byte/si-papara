/* ===================== TERMINALE SI — S7 · Statique et S11 · Dynamique =====================
   D'après les cours du professeur :
   - S7 « Modélisation des actions mécaniques » (résultante, poids, pression, ressort, moment, torseur),
     « Tableau des liaisons mécaniques usuelles », « Frottements – lois de Coulomb »,
     évaluation « Moment / BAM » (clé, panneau, brouette, benne, bridage, abri suspendu) ;
   - S11 « Dynamique » (PFD, moments d'inertie, énergie cinétique). */
(function () {
  const G = 9.81;
  const nb = SIP.nb;
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (x) => (x * 180) / Math.PI;
  const omega = (N) => (2 * Math.PI * N) / 60;
  const strip = (h) => String(h).replace(/<[^>]+>/g, "");
  const par = (x) => (x < 0 ? `(${nb(x)})` : nb(x));          // parenthèses autour des négatifs
  const sym = (r, max, pas) => r.pas(-max, max, pas) + 0;       // valeur symétrique, sans « -0 »
  // QCM généré : bonne réponse en tête (l'ordre est mélangé à l'affichage), distracteurs dédoublonnés
  const qcm = (enonce, bonne, fausses, explication) => {
    const vus = new Set([strip(bonne)]), choix = [bonne];
    fausses.forEach((f) => { const k = strip(f); if (!vus.has(k) && choix.length < 4) { vus.add(k); choix.push(f); } });
    return { type: "qcm", enonce, choix, bonne: 0, explication };
  };

  /* ---------- Tableau des liaisons (cours : repère local, axe principal x) ---------- */
  const LIAISONS = [
    { court: "Encastrement", nom: "encastrement", mob: "aucune", nmob: 0, R: ["X", "Y", "Z"], M: ["L", "M", "N"] },
    { court: "Glissière", nom: "glissière d'axe (A,x)", mob: "T<sub>x</sub>", nmob: 1, R: ["0", "Y", "Z"], M: ["L", "M", "N"] },
    { court: "Pivot", nom: "pivot d'axe (A,x)", mob: "R<sub>x</sub>", nmob: 1, R: ["X", "Y", "Z"], M: ["0", "M", "N"] },
    { court: "Pivot glissant", nom: "pivot glissant d'axe (A,x)", mob: "T<sub>x</sub> et R<sub>x</sub> (indépendantes)", nmob: 2, R: ["0", "Y", "Z"], M: ["0", "M", "N"] },
    { court: "Sphérique à doigt", nom: "sphérique à doigt de centre A", mob: "R<sub>y</sub> et R<sub>z</sub>", nmob: 2, R: ["X", "Y", "Z"], M: ["L", "0", "0"] },
    { court: "Appui plan", nom: "appui plan de normale (A,x)", mob: "T<sub>y</sub>, T<sub>z</sub> et R<sub>x</sub>", nmob: 3, R: ["X", "0", "0"], M: ["0", "M", "N"] },
    { court: "Sphérique (rotule)", nom: "sphérique (rotule) de centre A", mob: "R<sub>x</sub>, R<sub>y</sub> et R<sub>z</sub>", nmob: 3, R: ["X", "Y", "Z"], M: ["0", "0", "0"] },
    { court: "Cylindre-plan (linéaire rectiligne)", nom: "cylindre-plan de normale (A,x), contact selon (A,y)", mob: "T<sub>y</sub>, T<sub>z</sub>, R<sub>x</sub> et R<sub>y</sub>", nmob: 4, R: ["X", "0", "0"], M: ["0", "0", "N"] },
    { court: "Sphère-cylindre (linéaire annulaire)", nom: "sphère-cylindre d'axe (A,x)", mob: "T<sub>x</sub>, R<sub>x</sub>, R<sub>y</sub> et R<sub>z</sub>", nmob: 4, R: ["0", "Y", "Z"], M: ["0", "0", "0"] },
    { court: "Sphère-plan (ponctuelle)", nom: "sphère-plan de normale (A,x)", mob: "T<sub>y</sub>, T<sub>z</sub>, R<sub>x</sub>, R<sub>y</sub> et R<sub>z</sub>", nmob: 5, R: ["X", "0", "0"], M: ["0", "0", "0"] },
    { court: "Hélicoïdale", nom: "hélicoïdale d'axe (A,x)", mob: "T<sub>x</sub> et R<sub>x</sub> liées (on ne tourne pas sans avancer)", nmob: 1, R: ["X", "Y", "Z"], M: ["L", "M", "N"], helico: true }
  ];
  const inconnues = (l) => l.R.concat(l.M).filter((c) => c !== "0");
  const torseurHTML = (l) => `<table><tr><th>Résultante</th><th>Moment en A</th></tr>${[0, 1, 2].map((i) => `<tr><td>${l.R[i]}</td><td>${l.M[i]}</td></tr>`).join("")}</table>`;

  /* ======================================================================
     MODULE 1 — S7 · Statique : actions mécaniques et PFS
     ====================================================================== */
  SIP.definirModule({
    id: "tsi-s7-statique",
    niveaux: ["TSI"],
    sequence: "S7 · Statique",
    titre: "Actions mécaniques et principe fondamental de la statique",
    description: "Force, poids, pression, moment (F·d et produit vectoriel), torseurs et liaisons, bilan des actions mécaniques et PFS en 2D.",
    competences: ["M7", "M12", "A10", "M1"],
    nbQuestions: 10,
    questions: [
      /* ----- Modéliser une force : poids, pression, ressort ----- */
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const [nom, m] = r.pick([["le ballon", r.pas(0.4, 0.8, 0.05)], ["le moteur du portail", r.pas(4, 15, 0.5)], ["la porte de garage", r.pas(30, 80, 5)], ["le panneau de l'abri", r.pas(500, 1200, 50)], ["la cabine d'ascenseur", r.pas(400, 900, 50)]]);
        const P = m * G;
        return { enonce: `Masse de ${nom} : <b>m = ${nb(m)} kg</b>. Norme de son poids (g = 9,81 m/s²) ?`, reponse: P, unite: "N",
          explication: `P = m·g = ${nb(m)} × 9,81 = ${nb(P)} N — vertical, vers le bas, appliqué au centre de gravité G.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const P = r.pas(50, 3000, 50), m = P / G;
        return { enonce: `Le poids d'une charge vaut <b>P = ${nb(P)} N</b>. Quelle est sa masse (g = 9,81 m/s²) ?`, reponse: m, unite: "kg",
          explication: `m = P / g = ${nb(P)} / 9,81 = ${nb(m)} kg.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const D = r.pick([25, 32, 40, 50, 63]), pb = r.pick([4, 5, 6, 7, 8]);
        const S = (Math.PI * D * D) / 4, F = (pb / 10) * S;
        return { enonce: `Vérin pneumatique : piston de diamètre <b>D = ${D} mm</b>, pression <b>p = ${pb} bar</b>. Effort de poussée F<sub>fluide/piston</sub> (tige négligée) ?`, reponse: F, unite: "N",
          explication: `S = π·D²/4 = ${nb(S)} mm² ; p = ${pb} bar = ${nb(pb / 10)} MPa = ${nb(pb / 10)} N/mm² ; F = p·S = ${nb(pb / 10)} × ${nb(S)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const D = r.pick([50, 63, 80]), F = r.pas(300, 1500, 50);
        const S = (Math.PI * D * D) / 4, pM = F / S;
        return { enonce: `On veut un effort de poussée de <b>${nb(F)} N</b> avec un vérin de diamètre <b>${D} mm</b>. Pression d'alimentation nécessaire, en bar ?`, reponse: pM * 10, unite: "bar",
          explication: `S = π·D²/4 = ${nb(S)} mm² ; p = F / S = ${nb(F)} / ${nb(S)} = ${nb(pM)} N/mm² = ${nb(pM)} MPa = ${nb(pM * 10)} bar (1 bar = 10<sup>5</sup> Pa = 0,1 MPa).` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const D = r.pick([40, 50, 63, 80, 100]), pM = r.pick([8, 10, 12, 16, 20]);
        const S = (Math.PI * D * D) / 4, F = pM * S;
        return { enonce: `Vérin hydraulique de la remorque-benne : alésage <b>D = ${D} mm</b>, pression <b>p = ${pM} MPa</b>. Effort de poussée, en kN ?`, reponse: F / 1000, unite: "kN",
          explication: `S = π·D²/4 = ${nb(S)} mm² ; F = p·S = ${pM} N/mm² × ${nb(S)} mm² = ${nb(F)} N = ${nb(F / 1000)} kN.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const k = r.pick([800, 1200, 2000, 2500, 4000]), l0 = r.pas(50, 90, 5), x = r.pas(5, 25, 1), l = l0 - x, F = (k * x) / 1000;
        return { enonce: `Ressort de rappel du vérin : raideur <b>k = ${nb(k)} N/m</b>, longueur libre <b>l<sub>0</sub> = ${l0} mm</b>, longueur comprimée <b>l = ${l} mm</b>. Effort du ressort sur la tige ?`, reponse: F, unite: "N",
          explication: `Flèche x = l<sub>0</sub> − l = ${x} mm = ${nb(x / 1000)} m ; F = k·x = ${nb(k)} × ${nb(x / 1000)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const d = r.pick([1, 1.5, 2, 2.5]), D = r.pick([15, 20, 25, 30]), n = r.int(5, 12);
        const k = (80000 * Math.pow(d, 4)) / (8 * n * Math.pow(D, 3));
        return { enonce: `Ressort de compression : fil <b>d = ${nb(d)} mm</b>, diamètre d'enroulement <b>D = ${D} mm</b>, <b>n = ${n}</b> spires utiles, G = 80 000 N/mm². Raideur k ?`, reponse: k, unite: "N/mm",
          explication: `k = G·d⁴ / (8·n·D³) = 80 000 × ${nb(d)}⁴ / (8 × ${n} × ${D}³) = ${nb(80000 * Math.pow(d, 4))} / ${nb(8 * n * Math.pow(D, 3))} = ${nb(k)} N/mm.` }; } },
      { fiche: "tsi-s7-stat-force", gen: (r) => {
        const dist = ["Le poids de la cabine d'ascenseur", "L'attraction d'un électroaimant sur une plaque d'acier", "L'action d'un aimant sur une bille d'acier"];
        const cont = ["L'action du sol sur la roue", "La pression de l'air sur le piston du vérin", "L'action du ressort sur la tige", "L'action de la clé sur l'écrou", "L'action du vent sur le panneau", "L'action du câble sur la cabine"];
        const expl = "À distance : la pesanteur (poids) et les actions magnétiques. Toutes les autres s'exercent par contact (avec un solide ou un fluide).";
        return r.pick([true, false])
          ? qcm("Laquelle de ces actions mécaniques s'exerce <b>à distance</b> ?", r.pick(dist), r.melange(cont), expl)
          : qcm("Laquelle de ces actions mécaniques est une action <b>de contact</b> ?", r.pick(cont), r.melange(dist), expl); } },
      { type: "qcm", fiche: "tsi-s7-stat-force", enonce: "Contact <b>sans frottement</b> entre le sol 0 et le ballon 1. La direction de l'action A<sub>0/1</sub> est…", choix: ["Perpendiculaire au plan tangent au contact", "Tangente à la surface de contact", "Toujours inclinée à 45°", "Dirigée du ballon 1 vers le sol 0"], bonne: 0, explication: "Contact parfait : l'action est portée par la normale au contact, et va de 0 vers 1 (le sol repousse le ballon)." },
      { type: "qcm", fiche: "tsi-s7-stat-force", enonce: "1 MPa correspond à…", choix: ["1 N/mm²", "1 N/m²", "1 bar", "1 000 N/mm²"], bonne: 0, explication: "1 MPa = 10<sup>6</sup> Pa = 10<sup>6</sup> N/m² = 1 N/mm² (et = 10 bar, car 1 bar = 10<sup>5</sup> Pa)." },
      { type: "qcm", fiche: "tsi-s7-stat-force", enonce: "Abri suspendu : dans le BAM du panneau 5, la notation <b>B<sub>3/5</sub></b> désigne…", choix: ["L'action exercée par la bielle 3 sur le panneau 5, au point B", "L'action exercée par le panneau 5 sur la bielle 3, au point B", "Le poids de la bielle 3 appliqué en B", "Le moment en B de l'action de 5 sur 3"], bonne: 0, explication: "Convention du cours : A<sub>1/2</sub> = résultante des actions en A exercées par le solide 1 sur le solide 2." },

      /* ----- Moment scalaire : M = ± F·d ----- */
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const F = r.pas(40, 250, 10), d = r.pas(150, 450, 25), M = (F * d) / 1000;
        return { enonce: `Serrage d'un écrou : l'opérateur pousse avec <b>F = ${F} N</b> perpendiculairement à la clé, à <b>d = ${d} mm</b> de l'axe de l'écrou. Moment de serrage ?`, reponse: M, unite: "N·m",
          explication: `M<sub>O</sub>(F) = F·d = ${F} × ${nb(d / 1000)} = ${nb(M)} N·m (d converti en mètres).` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const C = r.pick([30, 45, 60, 80, 100, 120]), F = r.pick([150, 200, 250, 300]), d = (C / F) * 1000;
        return { enonce: `Il faut un moment de <b>${C} N·m</b> pour desserrer un écrou de roue. L'opérateur peut pousser avec <b>${F} N</b> au maximum, perpendiculairement à la clé. Bras de levier minimal, en mm ?`, reponse: d, unite: "mm",
          explication: `M = F·d → d = M / F = ${C} / ${F} = ${nb(d / 1000)} m = ${nb(d)} mm.` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const C = r.pick([20, 35, 50, 70, 90]), L = r.pas(200, 500, 50), F = C / (L / 1000);
        return { enonce: `Clé dynamométrique réglée à <b>${C} N·m</b>. L'effort est appliqué perpendiculairement à la clé, à <b>${L} mm</b> de l'axe. Effort à exercer ?`, reponse: F, unite: "N",
          explication: `F = M / d = ${C} / ${nb(L / 1000)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const F = r.pas(50, 200, 10), L = r.pas(200, 400, 25), b = r.pick([30, 45, 60, 75]);
        const d = L * Math.sin(rad(b)), M = (F * d) / 1000;
        return { enonce: `Une force <b>F = ${F} N</b> est appliquée au bout d'une clé de <b>${L} mm</b> (mesurée depuis l'axe O de l'écrou), en faisant un angle de <b>${b}°</b> avec la clé. Moment en O ?`, reponse: M, unite: "N·m",
          explication: `Bras de levier (perpendiculaire au support) : d = L·sin ${b}° = ${L} × ${nb(Math.sin(rad(b)))} = ${nb(d)} mm ; M = F·d = ${F} × ${nb(d / 1000)} = ${nb(M)} N·m.` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const F = r.pas(30, 120, 5), h = r.pas(1, 2, 0.1), gauche = r.pick([true, false]), M = gauche ? F * h : -F * h;
        return { enonce: `Panneau routier : le vent exerce une force horizontale <b>F = ${F} N</b> vers la <b>${gauche ? "gauche" : "droite"}</b>, dont le support passe à <b>${nb(h)} m</b> au-dessus du pied D. Repère : x vers la droite, y vers le haut, sens trigo positif. Moment M<sub>D</sub>(F) avec son signe ?`, reponse: M, unite: "N·m",
          explication: `Bras de levier d = ${nb(h)} m. Poussé vers la ${gauche ? "gauche" : "droite"} au-dessus de D, le panneau tend à tourner dans le sens ${gauche ? "trigo (+)" : "horaire (−)"} : M<sub>D</sub> = ${gauche ? "+" : "−"}F·d = ${nb(M)} N·m.` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const P = r.pick([1200, 1500, 1700, 2000]), d = r.pas(0.5, 2.5, 0.1), gauche = r.pick([true, false]), M = (gauche ? 1 : -1) * P * 10 * d;
        return { enonce: `Remorque-benne : le poids <b>P = ${nb(P)} daN</b> (vertical, vers le bas) a son support à <b>${nb(d)} m</b> à ${gauche ? "gauche" : "droite"} de l'articulation I. Sens trigo positif. Moment M<sub>I</sub>(P) en N·m, avec son signe ?`, reponse: M, unite: "N·m",
          explication: `P = ${nb(P)} daN = ${nb(P * 10)} N. Une force vers le bas à ${gauche ? "gauche" : "droite"} de I fait tourner dans le sens ${gauche ? "trigo (+)" : "horaire (−)"} : M<sub>I</sub>(P) = ${gauche ? "+" : "−"}${nb(P * 10)} × ${nb(d)} = ${nb(M)} N·m.` }; } },
      { fiche: "tsi-s7-stat-moment", gen: (r) => {
        const CAS = [
          ["verticale vers le bas, appliquée à droite de O", 1], ["verticale vers le bas, appliquée à gauche de O", 0],
          ["verticale vers le haut, appliquée à droite de O", 0], ["verticale vers le haut, appliquée à gauche de O", 1],
          ["horizontale vers la droite, appliquée au-dessus de O", 1], ["horizontale vers la droite, appliquée au-dessous de O", 0],
          ["horizontale vers la gauche, appliquée au-dessus de O", 0], ["horizontale vers la gauche, appliquée au-dessous de O", 1],
          ["dont le support passe par O", 2]];
        const c = r.pick(CAS);
        return { type: "qcm", enonce: `Repère : x vers la droite, y vers le haut, sens trigo positif. Signe du moment en O d'une force <b>${c[0]}</b> ?`,
          choix: ["Positif (sens trigo)", "Négatif (sens horaire)", "Nul", "Impossible à dire sans la norme de F"], bonne: c[1],
          explication: c[1] === 2 ? "Le bras de levier est nul : le moment d'une force en un point de son support est nul." : `Imagine la force poussant un levier fixé en O : il tourne dans le sens ${c[1] === 0 ? "trigo → M > 0" : "horaire → M < 0"}. Le signe ne dépend pas de la norme.` }; } },
      { type: "qcm", fiche: "tsi-s7-stat-moment", enonce: "F = 100 N au bout d'une clé de 0,3 m, en faisant 30° avec la clé. Un élève trouve M = 100 × 0,3 = 30 N·m. Son erreur ?", choix: ["Il a pris la longueur de la clé au lieu du bras de levier d = 0,3 × sin 30° = 0,15 m", "Il fallait multiplier par cos 30°", "Il fallait laisser 0,3 m en mm", "Aucune erreur : M = F × L"], bonne: 0, explication: "Le bras de levier est mesuré perpendiculairement au support de la force : M = 100 × 0,15 = 15 N·m." },
      { type: "qcm", fiche: "tsi-s7-stat-moment", enonce: "Le moment d'une force F en un point situé <b>sur son support</b> est…", choix: ["Nul, car le bras de levier est nul", "Maximal", "Égal à la norme de F", "Toujours négatif"], bonne: 0, explication: "d = 0 donc M = F × 0 = 0 : la force ne peut pas faire tourner autour de ce point." },
      { type: "qcm", fiche: "tsi-s7-stat-moment", enonce: "Un opérateur n'arrive pas à desserrer un écrou. Sans pousser plus fort, que doit-il faire ?", choix: ["Allonger le bras de levier (rallonge sur la clé)", "Pousser plus près de l'écrou", "Pousser dans l'axe de la clé", "Pousser en biais pour mieux appuyer"], bonne: 0, explication: "M = F·d : à effort égal, augmenter d augmente le moment. Pousser dans l'axe ou en biais réduit le bras de levier." },

      /* ----- Vecteur moment, coordonnées, torseur ----- */
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        const F = r.pas(20, 100, 5), a = r.pick([45, 50, 60, 70, 75]), x = r.pas(30, 60, 5), y = r.pas(5, 15, 5);
        const Fx = F * Math.cos(rad(a)), Fy = F * Math.sin(rad(a)), M = Fy * x - Fx * y;
        return { enonce: `Une force <b>F = ${F} N</b>, inclinée de <b>α = ${a}°</b> par rapport à l'axe x (vers le haut et la droite), a son support qui passe par <b>D (${x} ; ${y})</b> en mm. Moment M<sub>O</sub>(F) en N·mm ?`, reponse: M, unite: "N·mm",
          explication: `F<sub>x</sub> = F·cos α = ${nb(Fx)} N ; F<sub>y</sub> = F·sin α = ${nb(Fy)} N. M<sub>O</sub>(F) = M<sub>O</sub>(F<sub>x</sub>) + M<sub>O</sub>(F<sub>y</sub>) = +F<sub>y</sub> × ${x} − F<sub>x</sub> × ${y} = ${nb(M)} N·mm.` }; } },
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        const F = r.pas(20, 100, 5), a = r.pick([45, 50, 60, 70, 75]), x = r.pas(30, 60, 5), y = r.pas(5, 15, 5);
        const Fx = F * Math.cos(rad(a)), Fy = F * Math.sin(rad(a)), M = Fy * x - Fx * y;
        return { enonce: `F = ${F} N, inclinée de ${a}° sur l'axe x (vers le haut et la droite), support passant par D (${x} ; ${y}) mm. On trouve M<sub>O</sub>(F) = ${nb(M)} N·mm. Distance OM de O au support de F (bras de levier), en mm ?`, reponse: M / F, unite: "mm",
          explication: `M<sub>O</sub>(F) = F × OM → OM = ${nb(M)} / ${F} = ${nb(M / F)} mm.` }; } },
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        let xA, yA, Fx, Fy, M;
        do { xA = sym(r, 0.6, 0.1); yA = sym(r, 0.6, 0.1); Fx = sym(r, 200, 20); Fy = sym(r, 200, 20); M = xA * Fy - yA * Fx; } while (Math.abs(M) < 5);
        return { enonce: `Force appliquée en <b>A (${nb(xA)} ; ${nb(yA)})</b> m, de coordonnées <b>F (${nb(Fx)} ; ${nb(Fy)})</b> N. Composante selon z de M<sub>O</sub>(F) = OA ∧ F, avec son signe ?`, reponse: M, unite: "N·m",
          explication: `M<sub>O</sub> = x<sub>A</sub>·F<sub>y</sub> − y<sub>A</sub>·F<sub>x</sub> = ${par(xA)} × ${par(Fy)} − ${par(yA)} × ${par(Fx)} = ${nb(M)} N·m (${M > 0 ? "sens trigo" : "sens horaire"}).` }; } },
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        let X, Y, NA, xB, yB, c, NB;
        do { X = sym(r, 300, 50); Y = sym(r, 300, 50); NA = sym(r, 50, 10); xB = sym(r, 0.5, 0.1); yB = sym(r, 0.5, 0.1);
          c = -xB * Y + yB * X; NB = NA + c; } while (Math.abs(NB) < 5 || (xB === 0 && yB === 0) || Math.abs(c) < 5);
        const bx = -xB + 0, by = -yB + 0;
        return { enonce: `Torseur d'une action au point A : <b>R (X = ${nb(X)} ; Y = ${nb(Y)})</b> N et <b>M<sub>A</sub> = ${nb(NA)} N·m</b> (selon z). Le point B est tel que <b>AB = (${nb(xB)} ; ${nb(yB)})</b> m. Moment en B (selon z) ?`, reponse: NB, unite: "N·m",
          explication: `M<sub>B</sub> = M<sub>A</sub> + BA ∧ R avec BA = (${nb(bx)} ; ${nb(by)}) : (BA ∧ R)<sub>z</sub> = ${par(bx)} × ${par(Y)} − ${par(by)} × ${par(X)} = ${nb(c)} N·m ; M<sub>B</sub> = ${nb(NA)} + ${par(c)} = ${nb(NB)} N·m.` }; } },
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        const F = r.pas(20, 500, 10), a = r.pick([20, 30, 35, 40, 50, 60, 70]), enX = r.pick([true, false]);
        const v = enX ? F * Math.cos(rad(a)) : F * Math.sin(rad(a));
        return { enonce: `Une force <b>F = ${F} N</b> fait un angle <b>α = ${a}°</b> avec l'axe x (vers le haut et la droite). Composante <b>F<sub>${enX ? "x" : "y"}</sub></b> ?`, reponse: v, unite: "N",
          explication: `F<sub>x</sub> = F·cos α et F<sub>y</sub> = F·sin α : F<sub>${enX ? "x" : "y"}</sub> = ${F} × ${enX ? "cos" : "sin"} ${a}° = ${nb(v)} N.` }; } },
      { fiche: "tsi-s7-stat-vecteur", gen: (r) => {
        let X1, Y1, Z1, X2, Y2, Z2, c, val;
        do { [X1, Y1, Z1, X2, Y2, Z2] = [0, 0, 0, 0, 0, 0].map(() => r.int(-5, 5)); c = r.int(0, 2);
          val = [Y1 * Z2 - Z1 * Y2, Z1 * X2 - X1 * Z2, X1 * Y2 - Y1 * X2][c]; } while (val === 0);
        const form = ["Y<sub>1</sub>Z<sub>2</sub> − Z<sub>1</sub>Y<sub>2</sub>", "Z<sub>1</sub>X<sub>2</sub> − X<sub>1</sub>Z<sub>2</sub>", "X<sub>1</sub>Y<sub>2</sub> − Y<sub>1</sub>X<sub>2</sub>"][c];
        const det = [`${par(Y1)} × ${par(Z2)} − ${par(Z1)} × ${par(Y2)}`, `${par(Z1)} × ${par(X2)} − ${par(X1)} × ${par(Z2)}`, `${par(X1)} × ${par(Y2)} − ${par(Y1)} × ${par(X2)}`][c];
        return { enonce: `V<sub>1</sub> (${X1} ; ${Y1} ; ${Z1}) et V<sub>2</sub> (${X2} ; ${Y2} ; ${Z2}). Composante selon <b>${["x", "y", "z"][c]}</b> de V = V<sub>1</sub> ∧ V<sub>2</sub> ?`, reponse: val, unite: "",
          explication: `Composante ${["x", "y", "z"][c]} = ${form} = ${det} = ${val}.` }; } },
      { type: "qcm", fiche: "tsi-s7-stat-vecteur", enonce: "Dans le torseur {τ<sub>1→2</sub>} écrit au point A, que représentent L, M et N ?", choix: ["Les coordonnées du moment en A (en N·m)", "Les coordonnées de la résultante (en N)", "Les longueurs des bras de levier", "Les mobilités de la liaison"], bonne: 0, explication: "Colonne de gauche : X, Y, Z = résultante (N) ; colonne de droite : L, M, N = moment au point de réduction A (N·m)." },
      { type: "qcm", fiche: "tsi-s7-stat-vecteur", enonce: "Dans un torseur d'action mécanique, la résultante est un champ ___ et le moment un champ ___.", choix: ["constant ; variable (il dépend du point)", "variable ; constant", "constant ; constant", "nul ; variable"], bonne: 0, explication: "R est la même en tout point ; le moment change avec le point : M<sub>B</sub> = M<sub>A</sub> + BA ∧ R." },
      { type: "qcm", fiche: "tsi-s7-stat-vecteur", enonce: "Quand peut-on ramener l'étude à un <b>problème plan</b> ?", choix: ["Quand la géométrie ET les actions mécaniques admettent un même plan de symétrie", "Dès que le mécanisme est dessiné en 2D", "Quand toutes les forces sont verticales", "Quand le solide est immobile"], bonne: 0, explication: "Il faut une symétrie de la géométrie et du chargement ; une vue 2D du plan de symétrie suffit alors." },

      /* ----- Liaisons : actions transmissibles ----- */
      { fiche: "tsi-s7-stat-liaisons", gen: (r) => {
        const pool = LIAISONS.filter((l) => !l.helico), l = r.pick(pool);
        return qcm(`Quelle liaison parfaite transmet ce torseur (point A, base x, y, z) ?${torseurHTML(l)}`, l.court,
          r.melange(pool.filter((x) => x !== l)).map((x) => x.court),
          `Composantes nulles = mouvements possibles. Ici mobilités : ${l.mob} → ${l.nom}.`); } },
      { fiche: "tsi-s7-stat-liaisons", gen: (r) => {
        const l = r.pick(LIAISONS);
        return qcm(`Quelle liaison a pour <b>mobilités</b> : ${l.mob}${l.nmob === 0 ? " (0 mobilité)" : ""} ?`, l.court,
          r.melange(LIAISONS.filter((x) => x !== l)).map((x) => x.court),
          `C'est la liaison ${l.nom} (tableau des liaisons usuelles).`); } },
      { fiche: "tsi-s7-stat-liaisons", gen: (r) => {
        const l = r.pick(LIAISONS.filter((x) => !x.helico)), inc = inconnues(l);
        return { enonce: `Liaison <b>${l.nom}</b> supposée parfaite. Combien d'inconnues (composantes non nulles) dans son torseur d'actions transmissibles ?`, reponse: inc.length, unite: "",
          explication: `${l.nmob} mobilité(s) (${l.mob}) → 6 − ${l.nmob} = ${inc.length} inconnue(s) : ${inc.join(", ")}.` }; } },
      { fiche: "tsi-s7-stat-liaisons", gen: (r) => {
        const CAS = [
          ["une liaison pivot d'axe (A,z)", 2, "X<sub>A</sub> et Y<sub>A</sub> (pas de moment autour de z : la rotation est libre)"],
          ["un appui ponctuel en B, de normale (B,y)", 1, "Y<sub>B</sub> seulement : force normale au contact"],
          ["un encastrement en A", 3, "X<sub>A</sub>, Y<sub>A</sub> et le moment N<sub>A</sub>"],
          ["une glissière d'axe (A,x)", 2, "Y<sub>A</sub> et N<sub>A</sub> (X<sub>A</sub> = 0 : translation libre selon x)"],
          ["une bielle BD (poids négligé, articulée en B et D)", 1, "la norme seulement : la direction BD est connue (solide soumis à 2 forces)"]];
        const c = r.pick(CAS);
        return { type: "qcm", enonce: `Problème plan (x, y). Combien d'inconnues apporte <b>${c[0]}</b> ?`, choix: ["1 inconnue", "2 inconnues", "3 inconnues", "4 inconnues"], bonne: c[1] - 1, explication: `${c[1]} inconnue(s) : ${c[2]}.` }; } },
      { type: "qcm", fiche: "tsi-s7-stat-liaisons", enonce: "Liaison pivot parfaite d'axe (A,z). Quelle action ne peut-elle <b>pas</b> transmettre ?", choix: ["Un moment autour de z", "Une force selon z", "Un moment autour de x", "Une force selon x"], bonne: 0, explication: "La rotation autour de z est libre : la composante N du moment est nulle. Tout le reste est transmis." },
      { type: "qcm", fiche: "tsi-s7-stat-liaisons", enonce: "Une liaison parfaite possède 2 mobilités. Combien de composantes non nulles dans son torseur transmissible ?", choix: ["4", "2", "6", "8"], bonne: 0, explication: "Mobilités + inconnues = 6, donc 6 − 2 = 4 (ex. pivot glissant : Y, Z, M, N)." },

      /* ----- BAM et PFS ----- */
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const F = r.pick([60, 80, 100, 120]), a = r.pas(0.2, 0.4, 0.05), L = r.pas(1.1, 1.5, 0.05), T = (F * a) / L;
        return { enonce: `Brouette à l'arrêt : charge <b>F = ${F} daN</b> dont le support passe à <b>${nb(a)} m</b> (horizontalement) de l'axe A de la roue ; les mains soulèvent verticalement à <b>${nb(L)} m</b> de A. Effort T des mains ?`, reponse: T, unite: "daN",
          explication: `On isole la brouette (3 forces verticales). ΣM<sub>A</sub> = 0 : T × ${nb(L)} − ${F} × ${nb(a)} = 0 → T = ${nb(T)} daN.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const F = r.pick([60, 80, 100, 120]), a = r.pas(0.2, 0.4, 0.05), L = r.pas(1.1, 1.5, 0.05), T = (F * a) / L, A = F - T;
        return { enonce: `Brouette : charge <b>F = ${F} daN</b> à <b>${nb(a)} m</b> de l'axe A de la roue, mains à <b>${nb(L)} m</b> de A. On a trouvé T = ${nb(T)} daN. Action verticale du sol sur la roue en A ?`, reponse: A, unite: "daN",
          explication: `ΣF<sub>y</sub> = 0 : A + T − F = 0 → A = ${F} − ${nb(T)} = ${nb(A)} daN.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const L = r.pas(3, 8, 0.5), a = r.pas(0.5, L - 0.5, 0.5), F = r.pas(2, 20, 1), enB = r.pick([true, false]);
        const RB = (F * a) / L, RA = F - RB;
        return { enonce: `Poutre de pont roulant (poids propre négligé) : pivot en A, appui simple en B, <b>AB = ${nb(L)} m</b>. Le palan exerce <b>${F} kN</b> vers le bas à <b>${nb(a)} m</b> de A. Réaction verticale en <b>${enB ? "B" : "A"}</b> ?`, reponse: enB ? RB : RA, unite: "kN",
          explication: `ΣM<sub>A</sub> = 0 : R<sub>B</sub> × ${nb(L)} − ${F} × ${nb(a)} = 0 → R<sub>B</sub> = ${nb(RB)} kN ; ΣF<sub>y</sub> = 0 → R<sub>A</sub> = ${F} − ${nb(RB)} = ${nb(RA)} kN.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const L = r.int(4, 8), c = r.pas(1, L / 2, 0.5), d = r.pas(L / 2 + 0.5, L - 0.5, 0.5), F1 = r.pas(1000, 5000, 500), F2 = r.pas(1000, 5000, 500);
        const RB = (F1 * c + F2 * d) / L;
        return { enonce: `BAM d'une passerelle (pivot en A, appui simple en B) :<table><tr><th>Point</th><th>x (m)</th><th>Action verticale</th></tr><tr><td>A</td><td>0</td><td>R<sub>A</sub> ↑ ?</td></tr><tr><td>C</td><td>${nb(c)}</td><td>${nb(F1)} N ↓</td></tr><tr><td>D</td><td>${nb(d)}</td><td>${nb(F2)} N ↓</td></tr><tr><td>B</td><td>${L}</td><td>R<sub>B</sub> ↑ ?</td></tr></table>Calcule R<sub>B</sub>.`, reponse: RB, unite: "N",
          explication: `ΣM<sub>A</sub> = 0 : R<sub>B</sub> × ${L} − ${nb(F1)} × ${nb(c)} − ${nb(F2)} × ${nb(d)} = 0 → R<sub>B</sub> = ${nb(F1 * c + F2 * d)} / ${L} = ${nb(RB)} N.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const F1 = r.pas(50, 200, 10), d1 = r.pas(120, 200, 10), d2 = r.pas(10, 30, 5), F2 = (F1 * d1) / d2;
        return { enonce: `Pince coupante : la main serre avec <b>F<sub>1</sub> = ${F1} N</b> à <b>${d1} mm</b> de l'axe ; le fil est coupé à <b>${d2} mm</b> de l'axe. Effort exercé sur le fil ?`, reponse: F2, unite: "N",
          explication: `On isole une branche : ΣM<sub>axe</sub> = 0 → F<sub>1</sub>·d<sub>1</sub> = F<sub>2</sub>·d<sub>2</sub> → F<sub>2</sub> = ${F1} × ${d1} / ${d2} = ${nb(F2)} N.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const m = r.pas(200, 1500, 100), d = r.pas(5, 20, 1), dc = r.pas(2, 5, 0.5), mc = (m * d) / dc;
        return { enonce: `Grue à tour : charge de <b>${nb(m)} kg</b> à <b>${d} m</b> de l'axe du mât, contrepoids à <b>${nb(dc)} m</b> de l'autre côté. Masse du contrepoids pour que les moments s'équilibrent sur l'axe ?`, reponse: mc, unite: "kg",
          explication: `ΣM<sub>axe</sub> = 0 : m<sub>c</sub>·g·${nb(dc)} = ${nb(m)}·g·${d} → m<sub>c</sub> = ${nb(m)} × ${d} / ${nb(dc)} = ${nb(mc)} kg (g se simplifie).` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const m = r.pas(200, 2000, 100), t = r.pick([15, 20, 30, 40, 45, 60]), T = (m * G) / (2 * Math.cos(rad(t)));
        return { enonce: `Une charge de <b>${nb(m)} kg</b> est suspendue au crochet par <b>2 élingues symétriques</b>, chacune inclinée de <b>${t}°</b> par rapport à la verticale. Tension dans chaque élingue ?`, reponse: T, unite: "N",
          explication: `3 forces concourantes. ΣF<sub>y</sub> = 0 : 2·T·cos ${t}° = m·g → T = ${nb(m * G)} / (2 × ${nb(Math.cos(rad(t)))}) = ${nb(T)} N.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const P = r.pick([8000, 10000, 12000]), a = r.pas(0.8, 1.4, 0.1), b = r.pas(1.6, 2.4, 0.1), t = r.pick([30, 35, 40, 45]);
        const B = (P * a) / (b * Math.sin(rad(t)));
        return { enonce: `Abri suspendu : le panneau 5 (horizontal, poids <b>${nb(P)} N</b> en G<sub>5</sub>) est articulé au mur en E et tenu en B par la bielle 3 (poids négligé), inclinée de <b>${t}°</b> sur le panneau. <b>EG<sub>5</sub> = ${nb(a)} m</b>, <b>EB = ${nb(b)} m</b>. Norme de B<sub>3/5</sub> ?`, reponse: B, unite: "N",
          explication: `B<sub>3/5</sub> est portée par la bielle. ΣM<sub>E</sub> = 0 : B·sin ${t}° × ${nb(b)} − ${nb(P)} × ${nb(a)} = 0 → B = ${nb(P * a)} / (${nb(b)} × ${nb(Math.sin(rad(t)))}) = ${nb(B)} N.` }; } },
      { fiche: "tsi-s7-stat-pfs", gen: (r) => {
        const CAS = [
          ["Poutre de pont roulant : pivot en A + appui ponctuel en B, charge connue", 0, "2 + 1 = 3 inconnues"],
          ["Console encastrée dans le mur en A, charge connue au bout", 0, "encastrement plan : X<sub>A</sub>, Y<sub>A</sub>, N<sub>A</sub> = 3 inconnues"],
          ["Panneau de l'abri : pivot en E + bielle en B, poids connu", 0, "2 (pivot) + 1 (bielle, direction connue) = 3 inconnues"],
          ["Poutre tenue par deux pivots en A et en B, charge connue", 1, "2 + 2 = 4 inconnues"],
          ["Poutre encastrée en A et posée sur un appui ponctuel en B", 1, "3 + 1 = 4 inconnues"]];
        const c = r.pick(CAS);
        return { type: "qcm", enonce: `Problème plan. ${c[0]}. Le PFS suffit-il pour trouver toutes les actions inconnues ?`,
          choix: ["Oui : 3 inconnues pour 3 équations", "Non : 4 inconnues pour seulement 3 équations", "Oui : 2 inconnues pour 2 équations", "Non : 6 inconnues pour 3 équations"], bonne: c[1],
          explication: `En 2D, le PFS donne 3 équations (ΣF<sub>x</sub>, ΣF<sub>y</sub>, ΣM). Ici : ${c[2]}.` }; } },
      { type: "qcm", fiche: "tsi-s7-stat-pfs", enonce: "Bridage : la biellette 7 (poids négligé) est articulée en A et en B, sans autre action. Que dire des actions en A et B ?", choix: ["Même support (AB), même norme, sens opposés", "Elles sont perpendiculaires à (AB)", "Elles sont forcément verticales", "Elles ont le même sens"], bonne: 0, explication: "Solide soumis à 2 forces : elles sont directement opposées, portées par la droite qui joint leurs points d'application." },
      { type: "qcm", fiche: "tsi-s7-stat-pfs", enonce: "Un solide est en équilibre sous l'action de <b>3 forces non parallèles</b>. Leurs supports sont…", choix: ["Concourants en un même point", "Parallèles", "Confondus deux à deux", "Perpendiculaires entre eux"], bonne: 0, explication: "Sinon le moment d'une des forces au point d'intersection des deux autres ne serait pas nul ; de plus le dynamique des forces est fermé." },
      { type: "qcm", fiche: "tsi-s7-stat-pfs", enonce: "Abri suspendu : on isole le panneau 5 (poids des autres pièces négligé). Combien d'actions extérieures dans le BAM ?", choix: ["3 : en B (bielle 3), en E (articulation) et le poids en G<sub>5</sub>", "2 : en B et en E", "4 : en A, B, E et G<sub>5</sub>", "7 : en A, B, C, D, E, G<sub>3</sub> et G<sub>5</sub>"], bonne: 0, explication: "Seules comptent les actions exercées SUR le panneau : les deux liaisons (B, E) et son poids. A est un point libre, D et G<sub>3</sub> appartiennent à la bielle." },
      { type: "qcm", fiche: "tsi-s7-stat-pfs", enonce: "Dans quel ordre mène-t-on une étude de dimensionnement ?", choix: ["Modélisation des actions → isolement du solide → étude statique → résistance des matériaux", "Isolement → résistance des matériaux → modélisation → statique", "Étude statique → modélisation → isolement → résistance des matériaux", "Résistance des matériaux → statique → isolement → modélisation"], bonne: 0, explication: "Démarche du cours : on modélise, on isole, on applique le PFS, puis on dimensionne pour éviter rupture ou déformation." }
    ],
    fiches: [
      { id: "tsi-s7-stat-force", titre: "Modéliser une force (résultante)",
        recto: "Comment modélise-t-on une action mécanique ? Formules du poids, de l'effort de pression et du ressort ?",
        verso: `<p>Action mécanique = <b>résultante</b> (vecteur) : point d'application, direction, sens, norme (N). <b>A<sub>1/2</sub></b> = action en A exercée par 1 sur 2.</p><div class="formule">P = m·g &nbsp;·&nbsp; F = p·S &nbsp;·&nbsp; F = k·x</div><ul><li>Poids : vertical, vers le bas, en G (g = 9,81 m/s²)</li><li>Contact sans frottement : ⊥ au contact</li><li>1 MPa = 1 N/mm² ; 1 bar = 10<sup>5</sup> Pa</li></ul><p class="astuce">p en MPa × S en mm² → F directement en N.</p>`,
        quiz: [{ enonce: "Vérin de 1 000 mm² sous 1 MPa : F =", choix: ["1 000 N", "1 N", "100 000 N"], bonne: 0 }, { enonce: "A<sub>1/2</sub> désigne l'action…", choix: ["exercée par 1 sur 2, en A", "exercée par 2 sur 1, en A", "du point A sur 1 et 2"], bonne: 0 }, { enonce: "Poids d'une masse de 10 kg :", choix: ["98,1 N", "10 N", "0,98 N"], bonne: 0 }] },
      { id: "tsi-s7-stat-moment", titre: "Moment d'une force : M = ± F·d",
        recto: "Comment calcule-t-on le moment scalaire d'une force en un point, et comment choisit-on son signe ?",
        verso: `<div class="formule">M<sub>O</sub>(F) = ± F·d &nbsp; (N·m = N × m)</div><ul><li><b>d = bras de levier</b> : distance de O mesurée <b>perpendiculairement</b> au support de F</li><li>+ si F fait tourner dans le <b>sens trigo</b>, − dans le sens horaire</li><li>Point sur le support de F → M = 0</li><li>Couple (de serrage) = cas particulier du moment</li></ul><p class="astuce">Force inclinée de β sur la clé : d = L·sin β, pas L.</p>`,
        quiz: [{ enonce: "Le bras de levier se mesure…", choix: ["perpendiculairement au support de F", "jusqu'au point d'application", "le long du support de F"], bonne: 0 }, { enonce: "50 N avec d = 0,2 m : M =", choix: ["10 N·m", "250 N·m", "0,004 N·m"], bonne: 0 }, { enonce: "Moment en un point du support de F :", choix: ["nul", "maximal", "égal à F"], bonne: 0 }] },
      { id: "tsi-s7-stat-vecteur", titre: "Vecteur moment et torseur",
        recto: "Comment calcule-t-on un moment avec les coordonnées (produit vectoriel) ? Qu'est-ce qu'un torseur ?",
        verso: `<div class="formule">M<sub>O</sub>(F) = OA ∧ F → en 2D : M<sub>O</sub> = x<sub>A</sub>·F<sub>y</sub> − y<sub>A</sub>·F<sub>x</sub></div><div class="formule">M<sub>B</sub> = M<sub>A</sub> + BA ∧ R</div><p>Torseur {τ<sub>1→2</sub>} en A : résultante (X, Y, Z en N) + moment en A (L, M, N en N·m). R est la même partout, le moment dépend du point.</p><p class="astuce">Coordonnées en m et en N → moment en N·m. F<sub>x</sub> = F·cos α, F<sub>y</sub> = F·sin α.</p>`,
        quiz: [{ enonce: "A (2 ; 0) m, F (0 ; 10) N : M<sub>O</sub> =", choix: ["+20 N·m", "−20 N·m", "0 N·m"], bonne: 0 }, { enonce: "Dans un torseur, ce qui ne dépend pas du point :", choix: ["la résultante", "le moment", "les deux"], bonne: 0 }] },
      { id: "tsi-s7-stat-liaisons", titre: "Actions transmissibles par les liaisons",
        recto: "Quel lien entre les mobilités d'une liaison parfaite et les actions qu'elle transmet ?",
        verso: `<p>Mouvement <b>possible</b> → action correspondante <b>nulle</b>.</p><div class="formule">mobilités + inconnues = 6</div><ul><li>Encastrement : 0 mobilité → 6 inconnues</li><li>Pivot d'axe (A,x) : R<sub>x</sub> → L = 0 (5 inconnues)</li><li>Rotule : X, Y, Z (aucun moment)</li><li>Sphère-plan de normale x : X seul</li></ul><p class="astuce">En 2D (x, y) : pivot d'axe z → X, Y ; appui ponctuel → 1 force normale ; encastrement → X, Y, N.</p>`,
        quiz: [{ enonce: "Pivot d'axe (A,x) : composante nulle ?", choix: ["L (moment autour de x)", "X (force selon x)", "N (moment autour de z)"], bonne: 0 }, { enonce: "Une rotule transmet…", choix: ["3 forces, aucun moment", "3 moments, aucune force", "1 force normale"], bonne: 0 }, { enonce: "En 2D, un pivot d'axe z apporte…", choix: ["2 inconnues", "1 inconnue", "3 inconnues"], bonne: 0 }] },
      { id: "tsi-s7-stat-pfs", titre: "BAM et principe fondamental de la statique",
        recto: "Quelle démarche et quelles équations pour trouver les actions inconnues sur un solide en équilibre ?",
        verso: `<p>Isoler le solide → <b>BAM</b> (point, direction, sens, norme) → PFS :</p><div class="formule">ΣF<sub>ext</sub> = 0 &nbsp;et&nbsp; ΣM<sub>A</sub>(F<sub>ext</sub>) = 0</div><p>En 2D : 3 équations (ΣF<sub>x</sub>, ΣF<sub>y</sub>, ΣM) → 3 inconnues au plus. Écrire les moments au point où passent le plus d'inconnues.</p><p class="astuce">2 forces : même support, même norme, sens opposés. 3 forces non parallèles : concourantes.</p>`,
        quiz: [{ enonce: "Équations du PFS en problème plan :", choix: ["3", "6", "2"], bonne: 0 }, { enonce: "Solide soumis à 2 forces : elles ont…", choix: ["même support, même norme, sens opposés", "des supports parallèles", "des normes différentes"], bonne: 0 }, { enonce: "On écrit les moments de préférence au point…", choix: ["où passent le plus d'inconnues", "le plus éloigné", "où la charge est la plus grande"], bonne: 0 }] }
    ]
  });

  /* ======================================================================
     MODULE 2 — S7 · Statique : frottement et adhérence (lois de Coulomb)
     ====================================================================== */
  const MAT = [["acier/acier", 0.18], ["acier/fonte", 0.19], ["acier/bronze", 0.11], ["acier/téflon", 0.04], ["pneu/route", 0.8], ["acier/bois", 0.5]];

  SIP.definirModule({
    id: "tsi-s7-frottement",
    niveaux: ["TSI"],
    sequence: "S7 · Statique",
    titre: "Frottement et adhérence (lois de Coulomb)",
    description: "Effort normal et tangentiel, f = tan φ, cône de frottement, plan incliné, effort maximal transmissible (VTT, robot sumo, freinage).",
    competences: ["M12", "M7", "M1", "A10"],
    nbQuestions: 10,
    questions: [
      /* ----- Loi de Coulomb ----- */
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const [mat, f] = r.pick(MAT), N = r.pas(100, 2000, 50), T = f * N;
        return { enonce: `Contact <b>${mat}</b> (f<sub>s</sub> = ${nb(f)}). L'effort normal vaut <b>N = ${nb(N)} N</b>. Effort tangentiel maximal avant glissement ?`, reponse: T, unite: "N",
          explication: `Loi de Coulomb : T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f)} × ${nb(N)} = ${nb(T)} N.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const A = r.pas(100, 1000, 20), phi = r.pick([5, 8, 10, 12, 15, 20, 25]), enN = r.pick([true, false]);
        const v = enN ? A * Math.cos(rad(phi)) : A * Math.sin(rad(phi));
        return { enonce: `L'action de contact A<sub>2/1</sub> a pour norme <b>${A} N</b> et est inclinée de <b>${phi}°</b> par rapport à la normale au contact. Effort <b>${enN ? "normal N<sub>2/1</sub>" : "tangentiel T<sub>2/1</sub>"}</b> ?`, reponse: v, unite: "N",
          explication: `${enN ? `N = A·cos φ = ${A} × cos ${phi}°` : `T = A·sin φ = ${A} × sin ${phi}°`} = ${nb(v)} N.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const m = r.pas(20, 150, 5), f = r.pick([0.3, 0.4, 0.5, 0.6]), F = f * m * G;
        return { enonce: `Une caisse de <b>${m} kg</b> est posée sur un sol horizontal (f<sub>s</sub> = ${nb(f)}). Effort horizontal minimal pour la faire démarrer ?`, reponse: F, unite: "N",
          explication: `N = m·g = ${nb(m * G)} N ; le glissement commence quand F = T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f)} × ${nb(m * G)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const m = r.pas(2, 20, 0.5), f0 = r.pick([0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]), F = Math.round(f0 * m * G * 10) / 10, f = F / (m * G);
        return { enonce: `On tire horizontalement au dynamomètre un bloc de <b>${nb(m)} kg</b> posé sur un plan horizontal : il démarre pour <b>F = ${nb(F)} N</b>. Coefficient d'adhérence f<sub>s</sub> ?`, reponse: f, unite: "",
          explication: `À la limite : T = F et N = m·g = ${nb(m * G)} N → f<sub>s</sub> = T / N = ${nb(F)} / ${nb(m * G)} = ${nb(f, 3)}.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const f0 = r.pick([0.18, 0.2, 0.25, 0.3, 0.4]), ms = [r.pas(1, 3, 0.5), r.pas(3.5, 6, 0.5), r.pas(6.5, 10, 0.5)];
        const Ns = ms.map((m) => Math.round(m * G * 10) / 10), Ts = Ns.map((N) => Math.round(f0 * N * r.pick([0.97, 1, 1.03]) * 10) / 10);
        const fs = Ns.map((N, i) => Ts[i] / N), moy = (fs[0] + fs[1] + fs[2]) / 3;
        return { enonce: `Essais de décollement d'un patin :<table><tr><th>Essai</th><th>N (N)</th><th>T au démarrage (N)</th></tr>${Ns.map((N, i) => `<tr><td>${i + 1}</td><td>${nb(N)}</td><td>${nb(Ts[i])}</td></tr>`).join("")}</table>Valeur moyenne de f<sub>s</sub> ?`, reponse: moy, unite: "", tolerance: 3,
          explication: `f<sub>s</sub> = T / N pour chaque essai : ${fs.map((x) => nb(x, 3)).join(" ; ")} → moyenne ≈ ${nb(moy, 3)}. Le rapport est constant : T<sub>max</sub> est proportionnel à N.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const N = r.pas(100, 1000, 50), f = r.pick([0.1, 0.2, 0.3, 0.4, 0.5]), k = r.pick([0.5, 0.6, 0.8, 1.25, 1.5, 2]);
        const Tmax = f * N, T = Math.round(k * Tmax), glisse = T > Tmax;
        return { type: "qcm", enonce: `Une pièce est plaquée avec <b>N = ${nb(N)} N</b> sur son support (f<sub>s</sub> = ${nb(f)}). On lui applique un effort tangentiel <b>T = ${T} N</b>. Que se passe-t-il ?`,
          choix: ["Adhérence : la pièce ne glisse pas", "Glissement : la pièce glisse", "Impossible à dire sans connaître la masse", "Glissement, car dès que T > 0 la pièce glisse"], bonne: glisse ? 1 : 0,
          explication: `T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f)} × ${nb(N)} = ${nb(Tmax)} N. T = ${T} N est ${glisse ? "supérieur → glissement" : "inférieur → adhérence"}.` }; } },
      { fiche: "tsi-s7-frot-coulomb", gen: (r) => {
        const N = r.pas(400, 1200, 50), f = r.pick([0.35, 0.4, 0.45, 0.5]), R = r.pas(70, 90, 5), C = (2 * f * N * R) / 1000;
        return { enonce: `Frein à disque de VTT : chaque plaquette serre le disque avec <b>N = ${N} N</b> (2 plaquettes), <b>f = ${nb(f)}</b>, rayon moyen de frottement <b>${R} mm</b>. Couple de freinage ?`, reponse: C, unite: "N·m",
          explication: `Chaque plaquette : T = f·N = ${nb(f * N)} N. Deux faces : C = 2·T·R = 2 × ${nb(f * N)} × ${nb(R / 1000)} = ${nb(C)} N·m.` }; } },
      { type: "qcm", fiche: "tsi-s7-frot-coulomb", enonce: "Le coefficient d'adhérence f<sub>s</sub> <b>ne dépend pas</b>…", choix: ["De l'aire de la surface de contact", "De la nature des matériaux", "De l'état de surface (rugosité)", "De la lubrification"], bonne: 0, explication: "Le cours cite trois facteurs : état de surface, nature des matériaux, lubrification. L'aire de contact n'intervient pas dans la loi de Coulomb." },
      { type: "qcm", fiche: "tsi-s7-frot-coulomb", enonce: "Une caisse glisse vers la droite sur le sol. L'effort tangentiel T<sub>sol/caisse</sub> est dirigé…", choix: ["Vers la gauche (opposé au mouvement)", "Vers la droite (dans le sens du mouvement)", "Vers le haut, perpendiculaire au sol", "Vers le bas"], bonne: 0, explication: "La force de frottement est toujours de sens opposé au mouvement (ou à la tendance au mouvement)." },
      { type: "qcm", fiche: "tsi-s7-frot-coulomb", enonce: "Dans une <b>liaison parfaite</b> (frottement négligé), l'action de contact est…", choix: ["Perpendiculaire aux surfaces en contact", "Inclinée de φ par rapport à la normale", "Tangente aux surfaces en contact", "Toujours verticale"], bonne: 0, explication: "Sans frottement, T = 0 : il ne reste que l'effort normal. C'est l'hypothèse des chapitres précédents." },

      /* ----- Cône de frottement ----- */
      { fiche: "tsi-s7-frot-cone", gen: (r) => {
        const phi = r.pick([5, 8, 10, 12, 15, 20, 25, 30, 35]), f = Math.tan(rad(phi));
        return { enonce: `Angle de frottement mesuré : <b>φ = ${phi}°</b>. Coefficient de frottement f ?`, reponse: f, unite: "",
          explication: `f = tan φ = tan ${phi}° = ${nb(f, 3)}.` }; } },
      { fiche: "tsi-s7-frot-cone", gen: (r) => {
        const [mat, f] = r.pick(MAT), phi = deg(Math.atan(f));
        return { enonce: `Contact <b>${mat}</b> : f<sub>s</sub> = ${nb(f)}. Demi-angle au sommet du cône d'adhérence φ<sub>s</sub>, en degrés ?`, reponse: phi, unite: "°",
          explication: `f<sub>s</sub> = tan φ<sub>s</sub> → φ<sub>s</sub> = arctan ${nb(f)} = ${nb(phi, 3)}° (calculatrice en degrés).` }; } },
      { fiche: "tsi-s7-frot-cone", gen: (r) => {
        const phis = r.pick([10, 15, 20, 25, 30, 35]), cas = r.int(0, 2);
        const theta = cas === 0 ? Math.round(phis * r.pick([0.4, 0.6, 0.8])) : cas === 1 ? phis : Math.round(phis * r.pick([1.3, 1.5]));
        return { type: "qcm", enonce: `Angle d'adhérence <b>φ<sub>s</sub> = ${phis}°</b>. Pour tenir la pièce en équilibre, il faudrait que A<sub>2/1</sub> soit inclinée de <b>${theta}°</b> par rapport à la normale. Conclusion ?`,
          choix: ["Adhérence : A<sub>2/1</sub> est dans le cône", "Équilibre limite : A<sub>2/1</sub> est sur le cône", "Équilibre impossible : la pièce glisse (A<sub>2/1</sub> ne peut pas sortir du cône)", "Glissement certain dès que l'angle n'est pas nul"], bonne: cas,
          explication: `On compare ${theta}° à φ<sub>s</sub> = ${phis}° : ${cas === 0 ? "plus petit → à l'intérieur du cône → adhérence" : cas === 1 ? "égal → sur le cône → équilibre strict, glissement imminent" : "plus grand → hors du cône, impossible → la pièce glisse"}.` }; } },
      { fiche: "tsi-s7-frot-cone", gen: (r) => {
        const N = r.pas(200, 1000, 50), f0 = r.pick([0.1, 0.15, 0.2, 0.3, 0.4, 0.6]), T = Math.round(f0 * N), phi = deg(Math.atan(T / N));
        return { enonce: `Équilibre strict (glissement imminent) : <b>N = ${nb(N)} N</b> et <b>T = ${T} N</b>. Angle d'adhérence φ<sub>s</sub>, en degrés ?`, reponse: phi, unite: "°",
          explication: `tan φ<sub>s</sub> = T / N = ${T} / ${nb(N)} = ${nb(T / N, 3)} → φ<sub>s</sub> = ${nb(phi, 3)}°.` }; } },
      { fiche: "tsi-s7-frot-cone", gen: (r) => {
        const N = r.pas(200, 2000, 100), f = r.pick([0.18, 0.2, 0.3, 0.5, 0.8]), A = N * Math.sqrt(1 + f * f);
        return { enonce: `À la limite du glissement : <b>N = ${nb(N)} N</b>, f<sub>s</sub> = ${nb(f)}. Norme de l'action de contact A<sub>2/1</sub> ?`, reponse: A, unite: "N",
          explication: `T = f<sub>s</sub>·N = ${nb(f * N)} N ; A = √(N² + T²) = √(${nb(N)}² + ${nb(f * N)}²) = ${nb(A)} N (ou A = N / cos φ<sub>s</sub>).` }; } },
      { type: "qcm", fiche: "tsi-s7-frot-cone", enonce: "Pour mettre une armoire en mouvement, il faut pousser plus fort que pour la faire glisser ensuite. Pourquoi ?", choix: ["Le coefficient d'adhérence f<sub>s</sub> est supérieur au coefficient de frottement f", "Le poids de l'armoire diminue quand elle glisse", "L'effort normal augmente pendant le glissement", "La surface de contact augmente au démarrage"], bonne: 0, explication: "φ<sub>s</sub> > φ donc f<sub>s</sub> > f : l'adhérence (sans mouvement) résiste plus que le frottement (en glissement)." },
      { type: "qcm", fiche: "tsi-s7-frot-cone", enonce: "Le cône de frottement au point de contact A a pour axe ___ et pour demi-angle ___.", choix: ["la normale au contact ; φ", "le plan tangent ; φ", "la verticale ; 2φ", "la normale au contact ; 90° − φ"], bonne: 0, explication: "Le cône est centré sur la normale (A,n) ; son demi-angle est φ (tan φ = f)." },

      /* ----- Plan incliné ----- */
      { fiche: "tsi-s7-frot-plan", gen: (r) => {
        const [mat, f] = r.pick(MAT), a = deg(Math.atan(f));
        return { enonce: `Une pièce (contact <b>${mat}</b>, f<sub>s</sub> = ${nb(f)}) est posée sur un plan que l'on incline progressivement. Angle à partir duquel elle glisse ?`, reponse: a, unite: "°",
          explication: `Glissement quand tan α = f<sub>s</sub> : α<sub>limite</sub> = φ<sub>s</sub> = arctan ${nb(f)} = ${nb(a, 3)}°.` }; } },
      { fiche: "tsi-s7-frot-plan", gen: (r) => {
        const a = r.pas(8, 35, 1), f = Math.tan(rad(a));
        return { enonce: `On incline une planche : le bloc posé dessus commence à glisser pour <b>α = ${a}°</b>. Coefficient d'adhérence f<sub>s</sub> ?`, reponse: f, unite: "",
          explication: `À la limite, α = φ<sub>s</sub> → f<sub>s</sub> = tan ${a}° = ${nb(f, 3)}.` }; } },
      { fiche: "tsi-s7-frot-plan", gen: (r) => {
        const m = r.pas(2, 50, 1), a = r.pick([10, 15, 20, 25, 30]), enT = r.pick([true, false]);
        const v = enT ? m * G * Math.sin(rad(a)) : m * G * Math.cos(rad(a));
        return { enonce: `Une pièce de <b>${m} kg</b> reste immobile sur un plan incliné de <b>${a}°</b>. Effort ${enT ? "tangentiel T (frottement)" : "normal N"} exercé par le plan ?`, reponse: v, unite: "N",
          explication: `P = m·g = ${nb(m * G)} N. ${enT ? `T = P·sin α = ${nb(m * G)} × sin ${a}°` : `N = P·cos α = ${nb(m * G)} × cos ${a}°`} = ${nb(v)} N.` }; } },
      { fiche: "tsi-s7-frot-plan", gen: (r) => {
        const [mat, f] = r.pick(MAT), k = r.pick([0.5, 0.7, 1.4, 1.8]), a = Math.max(1, Math.round(deg(Math.atan(f * k)))), glisse = Math.tan(rad(a)) > f;
        return { type: "qcm", enonce: `Une pièce (contact <b>${mat}</b>, f<sub>s</sub> = ${nb(f)}) est posée sur un plan incliné de <b>${a}°</b>. Que se passe-t-il ?`,
          choix: ["Elle reste immobile", "Elle glisse", "Ça dépend de sa masse", "Elle glisse, car le plan n'est pas horizontal"], bonne: glisse ? 1 : 0,
          explication: `tan ${a}° = ${nb(Math.tan(rad(a)), 3)} ${glisse ? ">" : "<"} f<sub>s</sub> = ${nb(f)} (angle limite ${nb(deg(Math.atan(f)), 3)}°) → ${glisse ? "glissement" : "adhérence"}. La masse n'intervient pas.` }; } },
      { fiche: "tsi-s7-frot-plan", gen: (r) => {
        const m = r.pas(20, 200, 10), a = r.pick([10, 15, 20, 25, 30]), f = r.pick([0.1, 0.2, 0.3]);
        const N = m * G * Math.cos(rad(a)), T = f * N, Ps = m * G * Math.sin(rad(a)), F = Ps + T;
        return { enonce: `Une caisse de <b>${m} kg</b> est poussée <b>à vitesse constante</b> vers le haut d'une rampe inclinée de <b>${a}°</b>, effort parallèle à la rampe, <b>f = ${nb(f)}</b>. Effort de poussée ?`, reponse: F, unite: "N",
          explication: `Vitesse constante → PFS. N = m·g·cos α = ${nb(N)} N ; T = f·N = ${nb(T)} N (vers le bas, opposé au mouvement) ; F = m·g·sin α + T = ${nb(Ps)} + ${nb(T)} = ${nb(F)} N.` }; } },
      { type: "qcm", fiche: "tsi-s7-frot-plan", enonce: "On mesure l'angle limite de glissement d'un bloc sur un plan incliné. Si on double la masse du bloc, l'angle limite…", choix: ["Ne change pas : tan α<sub>lim</sub> = f<sub>s</sub>", "Double", "Est divisé par 2", "Diminue, car le bloc est plus lourd"], bonne: 0, explication: "N et T sont tous deux proportionnels à m·g : la masse se simplifie, α<sub>lim</sub> = φ<sub>s</sub>." },
      { type: "qcm", fiche: "tsi-s7-frot-plan", enonce: "Une pièce reste immobile sur un plan incliné, soumise seulement à son poids P et à l'action du plan A<sub>2/1</sub>. A<sub>2/1</sub> est…", choix: ["Verticale, vers le haut, de même norme que P", "Perpendiculaire au plan incliné", "Parallèle au plan incliné", "Nulle"], bonne: 0, explication: "Solide soumis à 2 forces : A<sub>2/1</sub> = −P (même support, même norme, sens opposés)." },

      /* ----- Effort maximal transmissible : applications ----- */
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const m = r.pas(0.5, 3, 0.1), f = r.pick([0.6, 0.7, 0.8, 0.9, 1]), F = f * m * G;
        return { enonce: `Robot sumo de <b>${nb(m)} kg</b>, toutes roues motrices, adhérence pneus/piste <b>f<sub>s</sub> = ${nb(f)}</b>. Poussée maximale avant patinage ?`, reponse: F, unite: "N",
          explication: `N = m·g = ${nb(m * G)} N ; F<sub>max</sub> = T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f)} × ${nb(m * G)} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const F = r.pas(5, 25, 1), f = r.pick([0.6, 0.8, 1]), m = F / (f * G);
        return { enonce: `Un robot sumo (toutes roues motrices, f<sub>s</sub> = ${nb(f)}) doit pousser avec <b>${F} N</b> sans patiner. Masse minimale du robot ?`, reponse: m, unite: "kg",
          explication: `F ≤ f<sub>s</sub>·m·g → m ≥ F / (f<sub>s</sub>·g) = ${F} / (${nb(f)} × 9,81) = ${nb(m)} kg.` }; } },
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const m = r.pas(75, 110, 5), pc = r.pick([55, 60, 65, 70]), [sol, f] = r.pick([["terre sèche", 0.6], ["bitume sec", 0.8], ["terre humide", 0.4], ["boue", 0.25]]);
        const N = (pc / 100) * m * G, T = f * N;
        return { enonce: `VTT + cycliste : <b>${m} kg</b>, dont <b>${pc} %</b> sur la roue arrière (motrice). Sol : ${sol} (f<sub>s</sub> ≈ ${nb(f)}). Effort de traction maximal de la roue arrière avant patinage ?`, reponse: T, unite: "N",
          explication: `N<sub>arrière</sub> = ${nb(pc / 100)} × ${m} × 9,81 = ${nb(N)} N ; T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f)} × ${nb(N)} = ${nb(T)} N.` }; } },
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const D = r.pick([650, 700, 740]), N = r.pas(400, 700, 20), f = r.pick([0.4, 0.6, 0.8]), C = (f * N * D) / 2000;
        return { enonce: `Roue arrière de VTT (diamètre <b>${D} mm</b>) chargée de <b>N = ${N} N</b>, f<sub>s</sub> = ${nb(f)}. Couple maximal transmissible à la roue avant patinage ?`, reponse: C, unite: "N·m",
          explication: `T<sub>max</sub> = f<sub>s</sub>·N = ${nb(f * N)} N ; C = T<sub>max</sub>·R = ${nb(f * N)} × ${nb(D / 2000)} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const m = r.pas(900, 1800, 50), [etat, f] = r.pick([["sèche", 0.8], ["mouillée", 0.5]]), F = (f * m * G) / 1000;
        return { enonce: `Voiture de <b>${nb(m)} kg</b>, freinage sur les 4 roues, route ${etat} (f<sub>s</sub> = ${nb(f)}). Effort de freinage maximal sans blocage des roues, en kN ?`, reponse: F, unite: "kN",
          explication: `F<sub>max</sub> = f<sub>s</sub>·m·g = ${nb(f)} × ${nb(m)} × 9,81 = ${nb(F * 1000)} N = ${nb(F)} kN.` }; } },
      { fiche: "tsi-s7-frot-adh", gen: (r) => {
        const [mat, f] = r.pick(MAT);
        return qcm(`D'après le cours, quel est le coefficient d'adhérence du contact <b>${mat}</b> ?`, nb(f), r.melange(MAT.filter((x) => x[0] !== mat)).map((x) => nb(x[1])),
          `Valeurs du cours : acier/acier 0,18 · acier/fonte 0,19 · acier/bronze 0,11 · acier/téflon 0,04 · pneu/route 0,8 · acier/bois 0,5.`); } },
      { type: "qcm", fiche: "tsi-s7-frot-adh", enonce: "Freinage d'urgence sans ABS : les roues se bloquent. Pourquoi est-ce moins efficace ?", choix: ["Les pneus glissent : on passe de f<sub>s</sub> (adhérence) à f (frottement), plus faible", "Le poids de la voiture diminue", "L'effort normal devient nul", "Le frottement devient dans le sens du mouvement"], bonne: 0, explication: "Roue qui roule = pas de glissement au contact → f<sub>s</sub>. Roue bloquée = glissement → f &lt; f<sub>s</sub>, et on perd la direction." },
      { type: "qcm", fiche: "tsi-s7-frot-adh", enonce: "En VTT, dans une montée très raide, la roue arrière patine. Que faire ?", choix: ["Reculer son poids au-dessus de la roue arrière pour augmenter N", "Pédaler plus fort", "Se pencher vers l'avant pour charger la roue avant", "Regonfler le pneu arrière au maximum"], bonne: 0, explication: "T<sub>max</sub> = f<sub>s</sub>·N : plus d'effort normal sur la roue motrice = plus de traction possible. Pédaler plus fort fait patiner davantage." },
      { type: "qcm", fiche: "tsi-s7-frot-adh", enonce: "Robot sumo : avant chaque combat, on nettoie les pneus et on place le lest au-dessus des roues motrices. Objectif ?", choix: ["Augmenter f<sub>s</sub> et N, donc la poussée maximale T = f<sub>s</sub>·N", "Augmenter la vitesse maximale", "Diminuer le couple demandé aux moteurs", "Diminuer N pour glisser plus facilement"], bonne: 0, explication: "La poussée est limitée par l'adhérence : pneus propres (f<sub>s</sub> ↑) et masse sur les roues motrices (N ↑)." }
    ],
    fiches: [
      { id: "tsi-s7-frot-coulomb", titre: "Loi de Coulomb : T = f·N",
        recto: "Comment se décompose une action de contact avec frottement, et que dit la loi de Coulomb ?",
        verso: `<p>A<sub>2/1</sub> = <b>effort normal N</b> (⊥ au contact) + <b>effort tangentiel T</b> (frottement, opposé au mouvement).</p><div class="formule">N = A·cos φ &nbsp;·&nbsp; T = A·sin φ</div><div class="formule">À la limite : T = f·N = N·tan φ</div><p>f sans unité : dépend des matériaux, de l'état de surface, de la lubrification — pas de l'aire de contact.</p><p class="astuce">Tant que T &lt; f<sub>s</sub>·N : adhérence, pas de glissement.</p>`,
        quiz: [{ enonce: "N = 200 N, f<sub>s</sub> = 0,5 : T<sub>max</sub> =", choix: ["100 N", "400 N", "200 N"], bonne: 0 }, { enonce: "T est toujours…", choix: ["opposé au mouvement (ou à sa tendance)", "dans le sens du mouvement", "perpendiculaire au contact"], bonne: 0 }, { enonce: "f ne dépend pas…", choix: ["de l'aire de contact", "des matériaux", "de la lubrification"], bonne: 0 }] },
      { id: "tsi-s7-frot-cone", titre: "Cône de frottement : adhérence ou glissement",
        recto: "Comment savoir, avec le cône de frottement, s'il y a adhérence ou glissement ?",
        verso: `<div class="formule">f<sub>s</sub> = tan φ<sub>s</sub> &nbsp;·&nbsp; f = tan φ &nbsp;·&nbsp; φ<sub>s</sub> &gt; φ</div><ul><li>Cône d'axe la normale au contact, de demi-angle φ</li><li>A<sub>2/1</sub> <b>dans</b> le cône → adhérence (pas de mouvement relatif)</li><li>A<sub>2/1</sub> <b>sur</b> le cône → glissement, ou équilibre limite</li></ul><p class="astuce">f<sub>s</sub> &gt; f : décoller une pièce demande plus d'effort que la faire glisser. On pose souvent φ<sub>s</sub> = φ.</p>`,
        quiz: [{ enonce: "A<sub>2/1</sub> à l'intérieur du cône :", choix: ["adhérence", "glissement", "rupture"], bonne: 0 }, { enonce: "f = 0,2 → φ ≈", choix: ["11,3°", "0,2°", "78,7°"], bonne: 0 }, { enonce: "On a toujours…", choix: ["φ<sub>s</sub> ≥ φ", "φ<sub>s</sub> &lt; φ", "φ<sub>s</sub> = 90°"], bonne: 0 }] },
      { id: "tsi-s7-frot-plan", titre: "Plan incliné : angle limite",
        recto: "À partir de quel angle une pièce posée sur un plan incliné se met-elle à glisser ?",
        verso: `<p>Pièce de poids P sur un plan incliné de α :</p><div class="formule">N = P·cos α &nbsp;·&nbsp; T = P·sin α</div><div class="formule">Glissement si tan α &gt; f<sub>s</sub> → α<sub>limite</sub> = φ<sub>s</sub></div><p>L'angle limite ne dépend <b>pas</b> de la masse : on mesure f<sub>s</sub> en inclinant jusqu'au démarrage.</p><p class="astuce">À l'équilibre, A<sub>2/1</sub> = −P : l'action du plan est verticale.</p>`,
        quiz: [{ enonce: "f<sub>s</sub> = 1 → angle limite =", choix: ["45°", "90°", "1°"], bonne: 0 }, { enonce: "Masse doublée → angle limite…", choix: ["inchangé", "doublé", "divisé par 2"], bonne: 0 }] },
      { id: "tsi-s7-frot-adh", titre: "Effort maximal transmissible par adhérence",
        recto: "Quel effort maximal une roue, un robot ou un frein peut-il transmettre sans glisser ?",
        verso: `<div class="formule">T<sub>max</sub> = f<sub>s</sub>·N</div><ul><li>Roue motrice (VTT, robot sumo) : N = charge sur les roues <b>motrices</b> ; couple max C = T<sub>max</sub>·R</li><li>Freinage : roue bloquée → on passe de f<sub>s</sub> à f, moins efficace</li><li>Pneu/route 0,8 · acier/bois 0,5 · acier/acier 0,18 · acier/téflon 0,04</li></ul><p class="astuce">Plus de N sur les roues motrices = plus de poussée possible.</p>`,
        quiz: [{ enonce: "Robot de 1 kg, f<sub>s</sub> = 0,8 : poussée max ≈", choix: ["7,8 N", "0,8 N", "12,3 N"], bonne: 0 }, { enonce: "Contre le patinage d'une roue motrice, on augmente…", choix: ["la charge sur cette roue", "la vitesse du moteur", "le couple moteur"], bonne: 0 }] }
    ]
  });

  /* ======================================================================
     MODULE 3 — S11 · Dynamique : principe fondamental de la dynamique
     ====================================================================== */
  SIP.definirModule({
    id: "tsi-s11-dynamique",
    niveaux: ["TSI"],
    sequence: "S11 · Dynamique",
    titre: "Principe fondamental de la dynamique",
    description: "PFD en translation et en rotation, moments d'inertie, inertie ramenée à l'arbre moteur, couple et temps de démarrage, énergie cinétique.",
    competences: ["M14", "M15", "M7", "A2"],
    nbQuestions: 10,
    questions: [
      /* ----- PFD en translation ----- */
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pas(500, 5000, 250), a = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]), Fr = r.pick([0, 150, 300, 500]), F = m * a + Fr;
        return { enonce: `Pont roulant : le chariot et sa charge (<b>${nb(m)} kg</b>) démarrent avec <b>a = ${nb(a)} m/s²</b>. ${Fr ? `Résistance à l'avancement : <b>${Fr} N</b>.` : "Résistances à l'avancement négligées."} Effort de traction nécessaire ?`, reponse: F, unite: "N",
          explication: `PFD selon l'axe du mouvement : F − F<sub>r</sub> = m·a → F = ${nb(m)} × ${nb(a)} + ${Fr} = ${nb(F)} N.` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pick([120, 140, 160, 180]), v = r.pick([36, 45, 54, 60, 72]), t = r.int(12, 25), a = v / 3.6 / t, F = (m * 1000 * a) / 1000;
        return { enonce: `Rame de métro de <b>${m} t</b> : elle passe de 0 à <b>${v} km/h</b> en <b>${t} s</b> (accélération constante, résistances négligées). Effort de traction, en kN ?`, reponse: F, unite: "kN",
          explication: `v = ${v} / 3,6 = ${nb(v / 3.6)} m/s ; a = Δv / Δt = ${nb(a)} m/s² ; F = m·a = ${nb(m * 1000)} × ${nb(a)} = ${nb(F * 1000)} N = ${nb(F)} kN.` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const F = r.pas(100, 300, 10), m = r.pick([120, 140, 160, 180]), a = F / m;
        return { enonce: `Les moteurs d'une rame de métro de <b>${m} t</b> fournissent un effort de traction de <b>${F} kN</b> (résistances négligées). Accélération ?`, reponse: a, unite: "m/s²",
          explication: `a = F / m = ${nb(F * 1000)} / ${nb(m * 1000)} = ${nb(a)} m/s².` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pas(600, 1500, 50), a = r.pick([0.5, 0.8, 1, 1.2]), T = m * (G + a);
        return { enonce: `Cabine d'ascenseur chargée (<b>${nb(m)} kg</b>) : elle démarre <b>vers le haut</b> avec <b>a = ${nb(a)} m/s²</b>. Tension du câble ?`, reponse: T, unite: "N",
          explication: `PFD (axe vers le haut) : T − m·g = m·a → T = m·(g + a) = ${nb(m)} × ${nb(G + a)} = ${nb(T)} N.` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pas(600, 1500, 50), a = r.pick([0.5, 0.8, 1, 1.2]), T = m * (G - a);
        return { enonce: `Cabine d'ascenseur (<b>${nb(m)} kg</b>) qui monte et <b>ralentit</b> avant l'étage : décélération de <b>${nb(a)} m/s²</b>. Tension du câble ?`, reponse: T, unite: "N",
          explication: `L'accélération est dirigée vers le bas (a = −${nb(a)} m/s²) : T − m·g = m·(−${nb(a)}) → T = m·(g − a) = ${nb(m)} × ${nb(G - a)} = ${nb(T)} N.` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pas(600, 1500, 50), a0 = r.pick([0.5, 0.8, 1, 1.2]), T = Math.round((m * (G + a0)) / 10) * 10, a = T / m - G;
        return { enonce: `Au démarrage en montée, un capteur mesure une tension de câble <b>T = ${nb(T)} N</b> pour une cabine de <b>${nb(m)} kg</b>. Accélération de la cabine ?`, reponse: a, unite: "m/s²", tolerance: 3,
          explication: `T − m·g = m·a → a = T/m − g = ${nb(T / m)} − 9,81 = ${nb(a)} m/s².` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const m = r.pas(1500, 4000, 250), al = r.pick([15, 20, 25, 30, 35]), a = r.pick([0.3, 0.4, 0.5]), F = m * (a + G * Math.sin(rad(al)));
        return { enonce: `Cabine de téléphérique de <b>${nb(m)} kg</b> tractée par le câble le long d'une pente de <b>${al}°</b>. Au départ, a = <b>${nb(a)} m/s²</b> (frottements négligés). Effort du câble tracteur, en kN ?`, reponse: F / 1000, unite: "kN",
          explication: `PFD selon la pente : F − m·g·sin α = m·a → F = ${nb(m)} × (${nb(a)} + 9,81 × sin ${al}°) = ${nb(F)} N = ${nb(F / 1000)} kN.` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const v = r.pick([45, 54, 60, 72, 80]), t = r.int(15, 30), a = -(v / 3.6) / t;
        return { enonce: `Une rame de métro roulant à <b>${v} km/h</b> s'arrête en <b>${t} s</b> (décélération constante). Accélération algébrique (négative si freinage) ?`, reponse: a, unite: "m/s²",
          explication: `a = Δv / Δt = (0 − ${nb(v / 3.6)}) / ${t} = ${nb(a)} m/s² (${v} km/h = ${nb(v / 3.6)} m/s).` }; } },
      { fiche: "tsi-s11-dyn-transl", gen: (r) => {
        const PH = [["le démarrage en montée", 0], ["la montée à vitesse constante", 1], ["le ralentissement en montée, avant l'étage", 2], ["le démarrage en descente", 2], ["le ralentissement en descente, avant l'étage", 0], ["l'arrêt à un étage", 1]];
        const c = r.pick(PH);
        return { type: "qcm", enonce: `Ascenseur de masse m : pendant <b>${c[0]}</b>, la tension T du câble est…`, choix: ["Supérieure à m·g", "Égale à m·g", "Inférieure à m·g", "Nulle"], bonne: c[1],
          explication: `T − m·g = m·a (axe vers le haut). ${c[1] === 0 ? "L'accélération est dirigée vers le haut → T > m·g." : c[1] === 1 ? "a = 0 → T = m·g." : "L'accélération est dirigée vers le bas → T &lt; m·g."}` }; } },
      { type: "qcm", fiche: "tsi-s11-dyn-transl", enonce: "1<sup>re</sup> loi de Newton : dans un repère galiléen, un objet soumis à aucune force extérieure (ou à des forces qui se compensent)…", choix: ["Reste immobile ou garde un mouvement rectiligne uniforme", "Finit toujours par s'arrêter", "Accélère de façon constante", "Tourne autour de son centre de gravité"], bonne: 0, explication: "C'est le principe d'inertie (Galilée, puis Newton) : sans force, la vitesse se conserve." },
      { type: "qcm", fiche: "tsi-s11-dyn-transl", enonce: "Le câble exerce sur la cabine une force de 8 000 N vers le haut. D'après la 3<sup>e</sup> loi de Newton, la cabine exerce sur le câble…", choix: ["8 000 N vers le bas", "8 000 N vers le haut", "0 N, le câble est tendu", "m·g vers le bas, quelle que soit la phase"], bonne: 0, explication: "Actions réciproques : même intensité, même support, sens opposés." },
      { type: "qcm", fiche: "tsi-s11-dyn-transl", enonce: "Une cabine d'ascenseur de masse m monte à <b>vitesse constante</b>. La tension du câble vaut…", choix: ["T = m·g, car a = 0", "T > m·g, car la cabine monte", "T &lt; m·g, car la cabine est lancée", "T = 0, le moteur ne fournit plus d'effort"], bonne: 0, explication: "Vitesse constante → a = 0 → ΣF = 0 : c'est un cas de statique, T = m·g." },

      /* ----- PFD en rotation ----- */
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const Nf = r.pick([1500, 3000]), td = r.pick([1, 1.5, 2]), ts = [0, 0.5, 1, 1.5, 2, 2.5];
        const row = ts.map((t) => Math.round(Math.min(Nf, (Nf * t) / td))), w = omega(Nf), al = w / td;
        return { enonce: `Démarrage d'un moteur :<table><tr><th>t (s)</th>${ts.map((t) => `<td>${nb(t)}</td>`).join("")}</tr><tr><th>N (tr/min)</th>${row.map((n) => `<td>${nb(n)}</td>`).join("")}</tr></table>Accélération angulaire pendant la phase de démarrage ?`, reponse: al, unite: "rad/s²",
          explication: `La vitesse croît linéairement de 0 à ${nb(Nf)} tr/min en ${nb(td)} s. ω = 2π × ${nb(Nf)} / 60 = ${nb(w)} rad/s ; α = Δω / Δt = ${nb(w)} / ${nb(td)} = ${nb(al)} rad/s².` }; } },
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const J = r.pas(0.05, 0.5, 0.05), N = r.pick([1000, 1500, 3000]), t = r.pas(0.5, 3, 0.5), Cr = r.pick([0, 1, 2, 5]);
        const w = omega(N), al = w / t, C = J * al + Cr;
        return { enonce: `Rotor + volant : <b>J = ${nb(J)} kg·m²</b>. On veut atteindre <b>${nb(N)} tr/min</b> en <b>${nb(t)} s</b> (accélération constante). ${Cr ? `Couple résistant : <b>${Cr} N·m</b>.` : "Couple résistant négligé."} Couple moteur nécessaire ?`, reponse: C, unite: "N·m",
          explication: `ω = ${nb(w)} rad/s ; α = ω / t = ${nb(al)} rad/s² ; PFD : C<sub>m</sub> − C<sub>r</sub> = J·α → C<sub>m</sub> = ${nb(J)} × ${nb(al)} + ${Cr} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const J = r.pas(0.1, 2, 0.1), N = r.pick([750, 1000, 1500]), Cm = r.pas(20, 80, 5), Cr = r.pas(0, Cm - 10, 5);
        const w = omega(N), t = (J * w) / (Cm - Cr);
        return { enonce: `Machine d'inertie <b>J = ${nb(J)} kg·m²</b>, couple moteur <b>${Cm} N·m</b>, couple résistant <b>${Cr} N·m</b> (constants). Temps pour atteindre <b>${nb(N)} tr/min</b> depuis l'arrêt ?`, reponse: t, unite: "s",
          explication: `α = (C<sub>m</sub> − C<sub>r</sub>) / J = ${Cm - Cr} / ${nb(J)} = ${nb((Cm - Cr) / J)} rad/s² ; ω = ${nb(w)} rad/s ; t = ω / α = ${nb(t)} s.` }; } },
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const J = r.pas(0.02, 0.5, 0.02), Cm = r.pas(5, 40, 1), Cr = r.pas(0, Cm - 2, 1), al = (Cm - Cr) / J;
        return { enonce: `Arbre d'inertie <b>J = ${nb(J)} kg·m²</b> soumis à un couple moteur de <b>${Cm} N·m</b> et à un couple résistant de <b>${Cr} N·m</b>. Accélération angulaire ?`, reponse: al, unite: "rad/s²",
          explication: `ΣM = J·α : C<sub>m</sub> − C<sub>r</sub> = J·α → α = (${Cm} − ${Cr}) / ${nb(J)} = ${nb(al)} rad/s².` }; } },
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const J = r.pas(0.5, 5, 0.5), N = r.pick([1500, 2000, 3000]), t = r.int(5, 30), w = omega(N), C = (J * w) / t;
        return { enonce: `Un volant d'inertie (<b>J = ${nb(J)} kg·m²</b>) tourne à <b>${nb(N)} tr/min</b>. Couple de freinage constant pour l'arrêter en <b>${t} s</b> (autres couples négligés) ?`, reponse: C, unite: "N·m",
          explication: `ω = ${nb(w)} rad/s ; décélération α = ω / t = ${nb(w / t)} rad/s² ; C<sub>f</sub> = J·α = ${nb(J)} × ${nb(w / t)} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s11-dyn-rot", gen: (r) => {
        const CAS = [["le chariot d'un pont roulant qui démarre (translation rectiligne)", 0], ["la cabine d'ascenseur qui démarre", 0], ["un volant d'inertie qui accélère autour de son axe fixe", 1], ["le rotor d'un moteur qui démarre", 1], ["la poutre d'une passerelle au repos", 2], ["la benne immobile en position levée", 2], ["une roue de métro qui roule en accélérant", 3]];
        const c = r.pick(CAS);
        return { type: "qcm", enonce: `Quelles équations du PFD écrire pour <b>${c[0]}</b> ?`,
          choix: ["ΣF<sub>ext</sub> = m·a et ΣM<sub>G</sub> = 0", "ΣF<sub>ext</sub> = 0 et ΣM<sub>G</sub> = J·α", "ΣF<sub>ext</sub> = 0 et ΣM<sub>G</sub> = 0", "ΣF<sub>ext</sub> = m·a et ΣM<sub>G</sub> = J·α"], bonne: c[1],
          explication: ["Translation : α = 0.", "Rotation autour d'un axe fixe passant par G : a = 0.", "Statique : a = 0 et α = 0.", "Mouvement quelconque (translation + rotation) : les deux équations complètes."][c[1]] }; } },
      { type: "qcm", fiche: "tsi-s11-dyn-rot", enonce: "Dans ΣM = J·α, les unités sont…", choix: ["N·m = kg·m² × rad/s²", "N = kg × m/s²", "N·m = kg·m × rad/s", "W = kg·m² × rad/s"], bonne: 0, explication: "Couples en N·m, moment d'inertie J en kg·m², accélération angulaire α en rad/s²." },
      { type: "qcm", fiche: "tsi-s11-dyn-rot", enonce: "Un moteur passe de 0 à 1 500 tr/min en 3 s. Un élève écrit α = 1 500 / 3 = 500 rad/s². Où est l'erreur ?", choix: ["Il faut d'abord convertir : ω = 2π × 1 500 / 60 = 157 rad/s, donc α ≈ 52,4 rad/s²", "Il faut multiplier par 3 au lieu de diviser", "Il suffit de diviser par 60 : α = 8,3 rad/s²", "Aucune erreur"], bonne: 0, explication: "α s'exprime en rad/s² : la vitesse doit être en rad/s (× 2π / 60)." },

      /* ----- Moments d'inertie ----- */
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const n = r.pick([4, 6, 8, 12]), m = r.pas(150, 400, 10), d = r.pas(3, 8, 0.5), J = n * m * d * d;
        return { enonce: `Manège : <b>${n} nacelles</b> de <b>${m} kg</b> (passagers compris), assimilées à des masses ponctuelles à <b>${nb(d)} m</b> de l'axe. Moment d'inertie des nacelles ?`, reponse: J, unite: "kg·m²",
          explication: `Masse ponctuelle : J = m·d². Pour ${n} nacelles : J = ${n} × ${m} × ${nb(d)}² = ${nb(J)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const m = r.pas(5, 60, 1), D = r.pas(200, 600, 20), R = D / 2000, J = 0.5 * m * R * R;
        return { enonce: `Tambour d'enroulement assimilé à un <b>cylindre plein</b> : m = <b>${m} kg</b>, diamètre <b>${D} mm</b>. Moment d'inertie autour de son axe ?`, reponse: J, unite: "kg·m²",
          explication: `J = ½·m·R² = 0,5 × ${m} × ${nb(R)}² = ${nb(J)} kg·m² (R = D/2 en mètres).` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const D = r.pas(200, 500, 50), e = r.pas(20, 60, 10), R = D / 2000, m = 7800 * Math.PI * R * R * (e / 1000), J = 0.5 * m * R * R;
        return { enonce: `Volant d'inertie : disque plein en acier (ρ = 7 800 kg/m³), diamètre <b>${D} mm</b>, épaisseur <b>${e} mm</b>. Moment d'inertie ?`, reponse: J, unite: "kg·m²", tolerance: 3,
          explication: `m = ρ·π·R²·e = 7 800 × π × ${nb(R)}² × ${nb(e / 1000)} = ${nb(m)} kg ; J = ½·m·R² = ${nb(J)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const m = r.pas(5, 50, 1), D = r.pas(100, 250, 10), R = D / 2000, J = 0.4 * m * R * R;
        return { enonce: `Boule de broyeur (sphère pleine) : m = <b>${m} kg</b>, diamètre <b>${D} mm</b>. Moment d'inertie par rapport à un axe passant par son centre ?`, reponse: J, unite: "kg·m²",
          explication: `Sphère pleine : J = ⅖·m·R² = 0,4 × ${m} × ${nb(R)}² = ${nb(J)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const m = r.pas(10, 60, 2), De = r.pas(300, 600, 20), Di = De - r.pas(40, 120, 20), R1 = De / 2000, R2 = Di / 2000, J = 0.5 * m * (R1 * R1 + R2 * R2);
        return { enonce: `Couronne de volant (cylindre creux) : m = <b>${m} kg</b>, diamètre extérieur <b>${De} mm</b>, intérieur <b>${Di} mm</b>. Moment d'inertie ?`, reponse: J, unite: "kg·m²",
          explication: `J = ½·m·(R<sub>1</sub>² + R<sub>2</sub>²) = 0,5 × ${m} × (${nb(R1)}² + ${nb(R2)}²) = ${nb(J)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const J1 = r.pas(0.1, 2, 0.1), k = r.pick([1.5, 2, 3]), J2 = k * k * J1;
        return { enonce: `Un tambour a un moment d'inertie de <b>${nb(J1)} kg·m²</b>. On le remplace par un tambour de <b>même masse</b> mais de rayon <b>${nb(k)} fois plus grand</b>. Nouveau moment d'inertie ?`, reponse: J2, unite: "kg·m²",
          explication: `J est proportionnel à R² : J<sub>2</sub> = ${nb(k)}² × ${nb(J1)} = ${nb(k * k)} × ${nb(J1)} = ${nb(J2)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-inertie", gen: (r) => {
        const FORMES = [["une masse ponctuelle à la distance d de l'axe", "J = m·d²"], ["un cylindre plein de rayon R (axe de révolution)", "J = ½·m·R²"], ["une sphère pleine de rayon R (axe passant par le centre)", "J = ⅖·m·R²"], ["un cylindre creux de rayons R<sub>1</sub> et R<sub>2</sub> (axe de révolution)", "J = ½·m·(R<sub>1</sub>² + R<sub>2</sub>²)"], ["un parallélépipède de côtés A et B (axe central parallèle à la 3<sup>e</sup> arête)", "J = m·(A² + B²)/12"]];
        const c = r.pick(FORMES);
        return qcm(`Quelle formule donne le moment d'inertie d'<b>${c[0]}</b> (masse m) ?`, c[1], r.melange(FORMES.filter((x) => x !== c).map((x) => x[1]).concat(["J = 2·m·R²"])), `Formule du cours : ${c[1]}.`); } },
      { type: "qcm", fiche: "tsi-s11-dyn-inertie", enonce: "Deux volants de même masse et même diamètre extérieur : un disque plein et une couronne (masse concentrée à la périphérie). Lequel a le plus grand moment d'inertie ?", choix: ["La couronne : sa masse est plus loin de l'axe", "Le disque plein : il a de la matière au centre", "Ils ont le même J, car même masse", "Impossible à comparer sans la vitesse"], bonne: 0, explication: "J = Σ m·d² : la matière éloignée de l'axe compte beaucoup plus (distance au carré)." },

      /* ----- Inertie équivalente ramenée à l'arbre moteur ----- */
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const Jm = r.pas(0.002, 0.02, 0.002), Jc = r.pas(1, 20, 1), k = r.pick([10, 20, 25, 40, 50]), Jeq = Jm + Jc / (k * k);
        return { enonce: `Moteur (<b>J<sub>m</sub> = ${nb(Jm)} kg·m²</b>) + réducteur de rapport <b>r = 1/${k}</b> + tambour (<b>J<sub>c</sub> = ${nb(Jc)} kg·m²</b>). Inertie équivalente ramenée à l'arbre moteur ?`, reponse: Jeq, unite: "kg·m²",
          explication: `J<sub>éq</sub> = J<sub>m</sub> + r²·J<sub>c</sub> = ${nb(Jm)} + ${nb(Jc)} / ${k * k} = ${nb(Jm)} + ${nb(Jc / (k * k))} = ${nb(Jeq)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const m = r.pas(1000, 8000, 500), v = r.pick([0.5, 0.8, 1, 1.25]), N = r.pick([1440, 1500, 2850, 3000]), w = omega(N), J = m * Math.pow(v / w, 2);
        return { enonce: `Pont roulant : chariot + charge de <b>${nb(m)} kg</b> se déplaçant à <b>${nb(v)} m/s</b> quand le moteur tourne à <b>${nb(N)} tr/min</b>. Inertie de la charge ramenée à l'arbre moteur ?`, reponse: J, unite: "kg·m²",
          explication: `Égalité des énergies : ½·J·ω<sub>m</sub>² = ½·m·v² → J = m·(v/ω<sub>m</sub>)² ; ω<sub>m</sub> = ${nb(w)} rad/s → J = ${nb(m)} × (${nb(v)} / ${nb(w)})² = ${nb(J)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const m = r.pas(300, 1200, 50), D = r.pick([200, 250, 300, 400]), k = r.pick([20, 25, 30, 40]), Jm = r.pick([0.01, 0.02, 0.05]);
        const R = D / 2000, Jc = m * Math.pow(R / k, 2), Jeq = Jm + Jc;
        return { enonce: `Treuil d'ascenseur : cabine de <b>${nb(m)} kg</b>, tambour de <b>${D} mm</b> de diamètre, réducteur <b>r = 1/${k}</b>, rotor <b>J<sub>m</sub> = ${nb(Jm)} kg·m²</b> (inertie du tambour négligée). Inertie totale ramenée à l'arbre moteur ?`, reponse: Jeq, unite: "kg·m²",
          explication: `v = R·r·ω<sub>m</sub> → J<sub>cabine</sub> = m·(R·r)² = ${nb(m)} × (${nb(R)} / ${k})² = ${nb(Jc)} kg·m² ; J<sub>éq</sub> = ${nb(Jm)} + ${nb(Jc)} = ${nb(Jeq)} kg·m².` }; } },
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const m = r.pas(300, 1200, 50), D = r.pick([200, 250, 300, 400]), k = r.pick([20, 25, 30, 40]), R = D / 2000, C = (m * G * R) / k;
        return { enonce: `Treuil : charge de <b>${nb(m)} kg</b> suspendue à un tambour de <b>${D} mm</b> de diamètre, réducteur <b>r = 1/${k}</b> (rendement 1). Couple résistant ramené sur l'arbre moteur ?`, reponse: C, unite: "N·m",
          explication: `Au tambour : C<sub>r</sub> = m·g·R = ${nb(m)} × 9,81 × ${nb(R)} = ${nb(m * G * R)} N·m ; ramené au moteur : C<sub>r</sub>·r = ${nb(m * G * R)} / ${k} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const Jeq = r.pas(0.02, 0.2, 0.01), N = r.pick([1440, 1500, 3000]), t = r.pas(0.5, 2, 0.5), Crm = r.pas(5, 40, 5);
        const w = omega(N), al = w / t, C = Jeq * al + Crm;
        return { enonce: `Ascenseur : inertie ramenée <b>J<sub>éq</sub> = ${nb(Jeq)} kg·m²</b>, couple résistant ramené <b>${Crm} N·m</b>. Le moteur doit atteindre <b>${nb(N)} tr/min</b> en <b>${nb(t)} s</b>. Couple moteur au démarrage ?`, reponse: C, unite: "N·m",
          explication: `α<sub>m</sub> = ω / t = ${nb(w)} / ${nb(t)} = ${nb(al)} rad/s² ; C<sub>m</sub> = J<sub>éq</sub>·α<sub>m</sub> + C<sub>r</sub> = ${nb(Jeq)} × ${nb(al)} + ${Crm} = ${nb(C)} N·m.` }; } },
      { fiche: "tsi-s11-dyn-equiv", gen: (r) => {
        const Jeq = r.pas(0.02, 0.2, 0.01), N = r.pick([1440, 1500, 3000]), Crm = r.pas(10, 40, 5), Cm = Crm + r.pas(5, 30, 5);
        const w = omega(N), t = (Jeq * w) / (Cm - Crm);
        return { enonce: `Pont roulant : J<sub>éq</sub> = <b>${nb(Jeq)} kg·m²</b> ramenée au moteur, couple moteur <b>${Cm} N·m</b>, couple résistant ramené <b>${Crm} N·m</b>. Temps de démarrage jusqu'à <b>${nb(N)} tr/min</b> ?`, reponse: t, unite: "s",
          explication: `α = (C<sub>m</sub> − C<sub>r</sub>) / J<sub>éq</sub> = ${Cm - Crm} / ${nb(Jeq)} = ${nb((Cm - Crm) / Jeq)} rad/s² ; t = ω / α = ${nb(w)} / ${nb((Cm - Crm) / Jeq)} = ${nb(t)} s.` }; } },
      { type: "qcm", fiche: "tsi-s11-dyn-equiv", enonce: "Pourquoi l'inertie d'une charge ramenée à l'arbre moteur est-elle multipliée par r² ?", choix: ["On écrit l'égalité des énergies cinétiques : ½·J<sub>c</sub>·ω<sub>s</sub>² = ½·J<sub>ramenée</sub>·ω<sub>m</sub>² avec ω<sub>s</sub> = r·ω<sub>m</sub>", "Parce que le couple est multiplié par r", "Parce que la puissance est divisée par r²", "C'est une convention sans justification physique"], bonne: 0, explication: "Même énergie stockée vue du moteur : J<sub>ramenée</sub> = J<sub>c</sub>·(ω<sub>s</sub>/ω<sub>m</sub>)² = r²·J<sub>c</sub>." },
      { type: "qcm", fiche: "tsi-s11-dyn-equiv", enonce: "Rotor J<sub>m</sub> = 0,01 kg·m², réducteur r = 1/50, tambour J<sub>c</sub> = 10 kg·m². Vue du moteur, quelle inertie est la plus grande ?", choix: ["Celle du rotor : 0,01 contre 10 / 2 500 = 0,004 kg·m²", "Celle du tambour : 10 kg·m², bien plus que 0,01", "Elles sont égales", "Celle du tambour : 10 × 50 = 500 kg·m²"], bonne: 0, explication: "Ramenée au moteur, l'inertie du tambour est divisée par 50² = 2 500 : le rotor pèse plus lourd au démarrage." },

      /* ----- Énergie cinétique ----- */
      { fiche: "tsi-s11-dyn-energie", gen: (r) => {
        const m = r.pick([120, 140, 160, 180]), V = r.pick([36, 54, 60, 72, 80]), v = V / 3.6, W = 0.5 * m * 1000 * v * v;
        return { enonce: `Rame de métro de <b>${m} t</b> roulant à <b>${V} km/h</b>. Énergie cinétique, en MJ ?`, reponse: W / 1e6, unite: "MJ",
          explication: `V = ${V} / 3,6 = ${nb(v)} m/s ; W = ½·m·V² = 0,5 × ${nb(m * 1000)} × ${nb(v)}² = ${nb(W)} J = ${nb(W / 1e6)} MJ.` }; } },
      { fiche: "tsi-s11-dyn-energie", gen: (r) => {
        const J = r.pas(0.5, 10, 0.5), N = r.pick([1500, 3000, 6000]), w = omega(N), W = 0.5 * J * w * w;
        return { enonce: `Volant d'inertie de <b>J = ${nb(J)} kg·m²</b> tournant à <b>${nb(N)} tr/min</b>. Énergie stockée, en kJ ?`, reponse: W / 1000, unite: "kJ",
          explication: `Ω = 2π × ${nb(N)} / 60 = ${nb(w)} rad/s ; W<sub>c</sub> = ½·J·Ω² = 0,5 × ${nb(J)} × ${nb(w)}² = ${nb(W)} J = ${nb(W / 1000)} kJ.` }; } },
      { fiche: "tsi-s11-dyn-energie", gen: (r) => {
        const W = r.pas(50, 500, 50), N = r.pick([3000, 6000]), w = omega(N), J = (2 * W * 1000) / (w * w);
        return { enonce: `On veut stocker <b>${W} kJ</b> dans un volant tournant à <b>${nb(N)} tr/min</b>. Moment d'inertie nécessaire ?`, reponse: J, unite: "kg·m²",
          explication: `W<sub>c</sub> = ½·J·Ω² → J = 2·W / Ω² = 2 × ${nb(W * 1000)} / ${nb(w)}² = ${nb(J)} kg·m² (Ω = ${nb(w)} rad/s).` }; } },
      { type: "qcm", fiche: "tsi-s11-dyn-energie", enonce: "Le métro passe de 40 km/h à 80 km/h. Son énergie cinétique est…", choix: ["Multipliée par 4", "Multipliée par 2", "Multipliée par 8", "Inchangée, car la masse est la même"], bonne: 0, explication: "W = ½·m·V² : vitesse × 2 → énergie × 2² = × 4." },
      { type: "qcm", fiche: "tsi-s11-dyn-energie", enonce: "Au freinage, un métro récupère une partie de son énergie cinétique. Comment ?", choix: ["Les moteurs fonctionnent en génératrices et renvoient de l'énergie électrique", "Les freins à disque stockent la chaleur pour la réutiliser", "Rien n'est récupérable : l'énergie cinétique disparaît", "Les roues patinent pour ralentir"], bonne: 0, explication: "Freinage électrique (récupératif) : l'énergie cinétique est reconvertie en énergie électrique, le reste est dissipé en chaleur." }
    ],
    fiches: [
      { id: "tsi-s11-dyn-transl", titre: "PFD en translation : ΣF = m·a",
        recto: "Qu'énonce le PFD pour un solide en translation ? Comment l'appliquer à un ascenseur ?",
        verso: `<div class="formule">ΣF<sub>ext</sub> = m·a</div><ul><li>m en kg, a en m/s² (a = Δv/Δt), F en N</li><li>Ascenseur qui démarre en montée : T − m·g = m·a → T = m·(g + a)</li><li>1<sup>re</sup> loi : sans force, vitesse conservée (repère galiléen) ; 3<sup>e</sup> loi : actions réciproques opposées</li></ul><p class="astuce">Axe dans le sens du mouvement ; a &lt; 0 = freinage. km/h ÷ 3,6 → m/s.</p>`,
        quiz: [{ enonce: "Ascenseur 1 000 kg, a = 1 m/s² vers le haut : T ≈", choix: ["10,8 kN", "9,8 kN", "1 kN"], bonne: 0 }, { enonce: "Si ΣF<sub>ext</sub> = 0, le solide…", choix: ["est immobile ou en mouvement rectiligne uniforme", "s'arrête forcément", "accélère"], bonne: 0 }, { enonce: "72 km/h =", choix: ["20 m/s", "259 m/s", "7,2 m/s"], bonne: 0 }] },
      { id: "tsi-s11-dyn-rot", titre: "PFD en rotation : ΣM = J·α",
        recto: "Qu'énonce le PFD pour un solide en rotation autour d'un axe fixe ? Comment calculer un temps de démarrage ?",
        verso: `<div class="formule">ΣM<sub>Δ</sub>(F<sub>ext</sub>) = J<sub>Δ</sub>·α</div><ul><li>J en kg·m², α = θ'' en rad/s², couples en N·m</li><li>Moteur : C<sub>m</sub> − C<sub>r</sub> = J·α</li><li>α = Δω/Δt → t<sub>démarrage</sub> = J·ω / (C<sub>m</sub> − C<sub>r</sub>)</li><li>ω (rad/s) = 2π·N/60</li></ul><p class="astuce">Translation : α = 0 ; rotation : a = 0 ; statique : a = 0 et α = 0.</p>`,
        quiz: [{ enonce: "J = 0,5 kg·m², C<sub>m</sub> − C<sub>r</sub> = 10 N·m : α =", choix: ["20 rad/s²", "5 rad/s²", "0,05 rad/s²"], bonne: 0 }, { enonce: "Unité de α :", choix: ["rad/s²", "rad/s", "tr/min"], bonne: 0 }] },
      { id: "tsi-s11-dyn-inertie", titre: "Moments d'inertie usuels",
        recto: "Donne J pour une masse ponctuelle, un cylindre plein, un cylindre creux et une sphère pleine.",
        verso: `<div class="formule">Masse ponctuelle : J = m·d² &nbsp;·&nbsp; Cylindre plein : J = ½·m·R²</div><ul><li>Cylindre creux : J = ½·m·(R<sub>1</sub>² + R<sub>2</sub>²)</li><li>Sphère pleine : J = ⅖·m·R²</li><li>Parallélépipède : J = m·(A² + B²)/12</li></ul><p>J traduit la résistance à la mise en rotation : plus la masse est loin de l'axe, plus J est grand.</p><p class="astuce">R en mètres ! Rayon × 2 (même masse) → J × 4.</p>`,
        quiz: [{ enonce: "Cylindre plein, 2 kg, R = 0,1 m : J =", choix: ["0,01 kg·m²", "0,02 kg·m²", "0,1 kg·m²"], bonne: 0 }, { enonce: "Rayon × 2, même masse : J est…", choix: ["multiplié par 4", "multiplié par 2", "inchangé"], bonne: 0 }] },
      { id: "tsi-s11-dyn-equiv", titre: "Inertie ramenée à l'arbre moteur",
        recto: "Comment ramener sur l'arbre moteur l'inertie d'une charge placée après un réducteur ?",
        verso: `<p>Même énergie cinétique vue du moteur (réducteur r = ω<sub>s</sub>/ω<sub>m</sub> &lt; 1) :</p><div class="formule">J<sub>éq</sub> = J<sub>m</sub> + r²·J<sub>c</sub> + m·(v/ω<sub>m</sub>)²</div><ul><li>Charge sur un tambour de rayon R : v = R·r·ω<sub>m</sub></li><li>Couple résistant ramené : r·C<sub>r</sub> (rendement 1)</li><li>Démarrage : C<sub>m</sub> = J<sub>éq</sub>·α<sub>m</sub> + r·C<sub>r</sub></li></ul><p class="astuce">r = 1/k : l'inertie de la charge est divisée par k².</p>`,
        quiz: [{ enonce: "r = 1/10 : une charge de 2 kg·m², vue du moteur, vaut…", choix: ["0,02 kg·m²", "0,2 kg·m²", "200 kg·m²"], bonne: 0 }, { enonce: "Au démarrage, le moteur doit fournir…", choix: ["J<sub>éq</sub>·α<sub>m</sub> + couple résistant ramené", "le couple résistant seulement", "J<sub>éq</sub>·ω<sub>m</sub>"], bonne: 0 }] },
      { id: "tsi-s11-dyn-energie", titre: "Énergie cinétique",
        recto: "Quelle énergie stocke un solide en translation ? en rotation ?",
        verso: `<div class="formule">Translation : W = ½·m·V² &nbsp;·&nbsp; Rotation : W<sub>c</sub> = ½·J·Ω²</div><ul><li>V en m/s, Ω en rad/s, W en J</li><li>Un volant d'inertie stocke de l'énergie en rotation</li><li>Au freinage, cette énergie est dissipée (chaleur) ou récupérée (métro, tram)</li></ul><p class="astuce">Vitesse × 2 → énergie × 4.</p>`,
        quiz: [{ enonce: "1 000 kg à 10 m/s :", choix: ["50 kJ", "10 kJ", "100 kJ"], bonne: 0 }, { enonce: "J = 2 kg·m², Ω = 10 rad/s : W<sub>c</sub> =", choix: ["100 J", "20 J", "200 J"], bonne: 0 }] }
    ]
  });
})();
